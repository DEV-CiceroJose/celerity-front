import json
from datetime import timedelta
from uuid import uuid4
from unittest.mock import patch
from smtplib import SMTPAuthenticationError

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.mail import get_connection
from django.test import Client, TestCase, override_settings
from celerity.dates import brasilia_today
from celerity_reminders.models import ReminderDelivery
from .models import RegistroIntegrado


@override_settings(DEBUG=True, CELERITY_LOCAL_TEST_MODE=True, EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class LocalEmailTestCase(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user('test-local', email='local@example.com')
        self.client.force_login(self.user)
        today = brasilia_today()
        self.license = RegistroIntegrado.objects.create(recurso='licencas', criado_por=self.user, dados={
            'numero': 'TESTE-LO', 'empresa': 'Empresa fictícia', 'dataEmissao': (today-timedelta(days=10)).isoformat(),
            'dataVencimento': (today+timedelta(days=30)).isoformat(), 'testFixture': True})
        self.payload = {'licenseId': self.license.pk, 'requestId': str(uuid4()), 'recipient': 'destino@example.com',
                        'provider': 'gmail', 'sender': 'sender@gmail.com', 'appPassword': 'abcdefghijklmnop'}

    def send(self, data=None, **extra):
        return self.client.post('/api/teste-local/email/', json.dumps(data or self.payload), content_type='application/json', **extra)

    def test_test_mode_disabled_blocks_endpoint(self):
        with override_settings(CELERITY_LOCAL_TEST_MODE=False):
            self.assertEqual(self.send().status_code, 404)

    def test_non_loopback_and_production_are_blocked(self):
        self.assertEqual(self.send(REMOTE_ADDR='10.0.0.10').status_code, 404)
        with override_settings(DEBUG=False):
            self.assertEqual(self.send().status_code, 404)

    def test_missing_sender_does_not_pretend_to_send(self):
        response = self.send({**self.payload, 'provider': 'server'})
        self.assertEqual(response.status_code, 409)
        self.assertEqual(len(mail.outbox), 0)
        self.assertEqual(ReminderDelivery.objects.count(), 0)

    def test_real_send_path_uses_smtp_and_shared_license_template(self):
        connection = get_connection('django.core.mail.backends.locmem.EmailBackend')
        with patch('integracao.test_email.get_connection', return_value=connection) as factory:
            response = self.send()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['sent'])
        self.assertEqual(mail.outbox[0].to, ['destino@example.com'])
        self.assertTrue(mail.outbox[0].subject.startswith('[TESTE LOCAL]'))
        self.assertIn('30 dia(s)', mail.outbox[0].body)
        self.assertIn('DADOS FICTÍCIOS', mail.outbox[0].body)
        self.assertEqual(factory.call_args.kwargs['host'], 'smtp.gmail.com')
        self.assertNotIn('abcdefghijklmnop', response.content.decode())
        self.assertNotIn('abcdefghijklmnop', mail.outbox[0].body)

    def test_retry_with_same_request_id_does_not_send_duplicate(self):
        connection = get_connection('django.core.mail.backends.locmem.EmailBackend')
        with patch('integracao.test_email.get_connection', return_value=connection):
            self.assertTrue(self.send().json()['sent'])
            self.assertTrue(self.send().json()['alreadySent'])
        self.assertEqual(len(mail.outbox), 1)

    def test_smtp_auth_failure_does_not_record_success_or_expose_password(self):
        with patch('integracao.test_email.get_connection', side_effect=SMTPAuthenticationError(535, b'not-authorized')):
            response = self.send()
        self.assertEqual(response.status_code, 400)
        self.assertNotIn('abcdefghijklmnop', response.content.decode())
        self.assertEqual(ReminderDelivery.objects.count(), 0)

    def test_recipient_and_owner_are_validated(self):
        self.assertEqual(self.send({**self.payload, 'recipient': 'invalid'}).status_code, 400)
        other = get_user_model().objects.create_user('other')
        self.client.force_login(other)
        self.assertEqual(self.send().status_code, 404)

    def test_csrf_is_required(self):
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.user)
        response = client.post('/api/teste-local/email/', json.dumps(self.payload), content_type='application/json')
        self.assertEqual(response.status_code, 403)

    def test_brevo_calls_https_api_with_shared_template_and_does_not_save_key(self):
        from unittest.mock import MagicMock
        response = MagicMock()
        response.status = 201
        response.read.return_value = b'{"messageId":"test-message"}'
        response.__enter__.return_value = response
        data = {**self.payload, 'provider': 'brevo', 'apiKey': 'test-brevo-api-key', 'sender': 'sender@example.com'}
        with patch('celerity_reminders.brevo.urlopen', return_value=response) as transport:
            result = self.send(data)
            self.assertTrue(result.json()['sent'])
            request = transport.call_args.args[0]
            payload = json.loads(request.data)
            self.assertEqual(request.full_url, 'https://api.brevo.com/v3/smtp/email')
            self.assertEqual(payload['to'], [{'email': 'destino@example.com'}])
            self.assertEqual(payload['sender']['email'], 'sender@example.com')
            self.assertIn('[TESTE LOCAL]', payload['subject'])
            self.assertIn('DADOS FICTÍCIOS', payload['textContent'])
            self.assertNotIn('test-brevo-api-key', result.content.decode())
            self.assertTrue(self.send(data).json()['alreadySent'])
            self.assertEqual(transport.call_count, 1)
        self.assertEqual(ReminderDelivery.objects.count(), 1)

    def test_brevo_auth_error_is_clear_and_does_not_record_success(self):
        from urllib.error import HTTPError
        data = {**self.payload, 'provider': 'brevo', 'apiKey': 'test-brevo-api-key', 'sender': 'sender@example.com'}
        with patch('celerity_reminders.brevo.urlopen', side_effect=HTTPError('https://api.brevo.com', 401, 'unauthorized', {}, None)):
            response = self.send(data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('chave de API', response.json()['detail'])
        self.assertNotIn('test-brevo-api-key', response.content.decode())
        self.assertEqual(ReminderDelivery.objects.count(), 0)

    def test_brevo_requires_key_and_confirmation_from_provider(self):
        from unittest.mock import MagicMock
        data = {**self.payload, 'provider': 'brevo', 'apiKey': '', 'sender': 'sender@example.com'}
        self.assertEqual(self.send(data).status_code, 400)
        fake = MagicMock()
        fake.status = 201
        fake.read.return_value = b'{}'
        fake.__enter__.return_value = fake
        data['apiKey'] = 'test-brevo-api-key'
        with patch('celerity_reminders.brevo.urlopen', return_value=fake):
            response = self.send(data)
        self.assertEqual(response.status_code, 502)
        self.assertEqual(ReminderDelivery.objects.count(), 0)

    def test_brevo_distinguishes_ip_block_from_invalid_key(self):
        from io import BytesIO
        from urllib.error import HTTPError
        data = {**self.payload, 'provider': 'brevo', 'apiKey': 'test-brevo-api-key', 'sender': 'sender@example.com'}
        error = HTTPError('https://api.brevo.com', 401, 'unauthorized', {}, BytesIO(b'{"message":"We have detected an unrecognised IP address","code":"unauthorized"}'))
        with patch('celerity_reminders.brevo.urlopen', side_effect=error):
            response = self.send(data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('IPs autorizados', response.json()['detail'])
        self.assertNotIn('test-brevo-api-key', response.content.decode())
        self.assertEqual(ReminderDelivery.objects.count(), 0)

    def test_brevo_does_not_echo_provider_error_or_secret(self):
        from io import BytesIO
        from urllib.error import HTTPError
        data = {**self.payload, 'provider': 'brevo', 'apiKey': 'test-brevo-api-key', 'sender': 'sender@example.com'}
        error = HTTPError('https://api.brevo.com', 401, 'unauthorized', {}, BytesIO(b'{"message":"Key not found: test-brevo-api-key","code":"unauthorized"}'))
        with patch('celerity_reminders.brevo.urlopen', side_effect=error):
            response = self.send(data)
        self.assertIn('valor completo', response.json()['detail'])
        self.assertNotIn('test-brevo-api-key', response.content.decode())
        self.assertEqual(ReminderDelivery.objects.count(), 0)
