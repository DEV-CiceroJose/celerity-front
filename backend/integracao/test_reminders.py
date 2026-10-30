import json
from datetime import date, datetime, timedelta, timezone
from io import StringIO
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.management import call_command
from django.test import TestCase, override_settings
from celerity.dates import brasilia_today
from integracao.models import LicenseNotice, Perfil, RegistroIntegrado
from processos.models import ProcessosGerais, Gerais_Licenciados
from processos.forms import ProcessosGeraisForm, GeraisLicenciadosForm
from pocos.models import PocosLicenciados, PocosEmExigencia
from pocos.forms import PocosEmExigenciaForm
from outros.models import Assessoria


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class LicenseIntegrationTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user('owner', email='owner@example.com', password='test-password')
        self.other = get_user_model().objects.create_user('other', email='other@example.com', password='test-password')
        self.client.force_login(self.user)

    def data(self, days=60):
        today = brasilia_today()
        return {'numero': 'LO-TEST', 'empresa': 'Empresa teste', 'dataEmissao': (today-timedelta(days=10)).isoformat(), 'dataVencimento': (today+timedelta(days=days)).isoformat()}

    def create_license(self, days=60, user=None):
        return RegistroIntegrado.objects.create(recurso='licencas', dados=self.data(days), criado_por=user or self.user)

    def notices(self):
        result = self.client.get('/api/notificacoes/')
        self.assertEqual(result.status_code, 200)
        return result.json()['results']

    def patch(self, path, data):
        return self.client.patch(path, json.dumps(data), content_type='application/json')

    def test_authentication_returns_json(self):
        self.client.logout()
        response = self.client.get('/api/notificacoes/')
        self.assertEqual(response.status_code, 401)
        self.assertIn('detail', response.json())

    def test_boundaries_today_and_overdue(self):
        for days in [61, 60, 0, -1]:
            self.create_license(days)
        self.assertEqual(len(self.notices()), 3)
        self.assertTrue(any('vencida' in notice['title'].lower() for notice in self.notices()))
        self.assertTrue(any('Vence hoje' in notice['text'] for notice in self.notices()))

    def test_alerts_are_scoped_to_owner(self):
        self.create_license()
        self.create_license(user=self.other)
        self.assertEqual(len(self.notices()), 1)
        self.assertEqual(self.client.get('/api/licencas/').json()['count'], 1)

    def test_other_user_cannot_edit_record_or_notice(self):
        record = self.create_license(user=self.other)
        self.assertEqual(self.patch(f'/api/licencas/{record.pk}/', self.data()).status_code, 404)
        self.client.force_login(self.other)
        notice = self.notices()[0]
        self.client.force_login(self.user)
        self.assertEqual(self.patch(f'/api/notificacoes/{notice["id"]}/', {'read': True}).status_code, 404)

    def test_read_archive_snooze_are_persistent(self):
        self.create_license()
        notice = self.notices()[0]
        url = f'/api/notificacoes/{notice["id"]}/'
        self.assertEqual(self.patch(url, {'read': True}).status_code, 200)
        self.assertTrue(self.notices()[0]['read'])
        self.patch(url, {'snoozeUntil': (brasilia_today()+timedelta(days=1)).isoformat()})
        self.assertEqual(self.notices(), [])
        LicenseNotice.objects.update(snooze_until=brasilia_today())
        self.assertEqual(len(self.notices()), 1)
        self.patch(url, {'archived': True})
        self.assertEqual(self.notices(), [])

    def test_renewal_and_deletion_remove_old_alert(self):
        record = self.create_license()
        old = self.notices()[0]['id']
        self.patch(f'/api/licencas/{record.pk}/', self.data(61))
        self.assertEqual(self.notices(), [])
        self.patch(f'/api/licencas/{record.pk}/', self.data(59))
        self.assertNotEqual(self.notices()[0]['id'], old)
        self.client.delete(f'/api/licencas/{record.pk}/')
        self.assertEqual(self.notices(), [])

    def test_invalid_dates_and_manual_days_are_rejected_or_ignored(self):
        data = {**self.data(), 'diasContados': 'all'}
        response = self.client.post('/api/licencas/', json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['diasContados'], 10)
        self.assertNotIn('diasContados', RegistroIntegrado.objects.get(pk=response.json()['id']).dados)
        data['dataVencimento'] = '2026-02-30'
        self.assertEqual(self.client.post('/api/licencas/', json.dumps(data), content_type='application/json').status_code, 400)

    def test_cannot_assign_to_unauthorized_user(self):
        data = {**self.data(), 'responsavelId': self.other.pk}
        self.assertEqual(self.client.post('/api/licencas/', json.dumps(data), content_type='application/json').status_code, 400)

    def test_readonly_role_cannot_write(self):
        Perfil.objects.create(usuario=self.user, funcao='Somente leitura')
        self.assertEqual(self.client.post('/api/licencas/', json.dumps(self.data()), content_type='application/json').status_code, 403)

    def test_scheduled_command_sends_once_and_creates_visual_notice(self):
        self.create_license()
        self.create_license(61)
        call_command('send_license_reminders', stdout=StringIO())
        call_command('send_license_reminders', stdout=StringIO())
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.user.email])
        self.assertEqual(LicenseNotice.objects.filter(active=True).count(), 1)

    def test_legacy_licenses_have_explicit_recipients_and_safe_ids(self):
        today = brasilia_today()
        geral = Gerais_Licenciados.objects.create(empresa='Empresa antiga', numero_processo='123', data_emissao=today-timedelta(days=100), data_vencimento=today+timedelta(days=60), usuario_responsavel=self.user)
        poco = PocosLicenciados.objects.create(empresa='Poço antigo', data_emissao=today-timedelta(days=100), data_vencimento=today+timedelta(days=30), usuario_responsavel=self.user)
        Gerais_Licenciados.objects.create(empresa='Sem destinatário', data_emissao=today, data_vencimento=today+timedelta(days=10))
        self.assertEqual(len(self.notices()), 2)
        listing = self.client.get('/api/licencas/').json()
        self.assertEqual(listing['count'], 2)
        response = self.client.get(f'/api/licencas/gerais-{geral.pk}/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['legacy'])
        call_command('send_license_reminders', stdout=StringIO())
        self.assertEqual(len(mail.outbox), 2)

    @override_settings(LICENSE_REMINDER_DAYS=90)
    def test_single_server_setting_controls_ui_and_email(self):
        self.create_license(90)
        self.assertEqual(self.client.get('/api/config/').json()['reminderDays'], 90)
        self.assertEqual(len(self.notices()), 1)
        call_command('send_license_reminders', stdout=StringIO())
        self.assertEqual(len(mail.outbox), 1)

    def test_api_recalculates_on_new_day_without_saving(self):
        record = RegistroIntegrado.objects.create(recurso='processos', dados={'dataInicio': '2026-10-01'}, criado_por=self.user)
        with patch('django.utils.timezone.now', return_value=datetime(2026,10,30,2,59,tzinfo=timezone.utc)):
            self.assertEqual(self.client.get(f'/api/processos/{record.pk}/').json()['diasContados'], 28)
        with patch('django.utils.timezone.now', return_value=datetime(2026,10,30,3,0,tzinfo=timezone.utc)):
            self.assertEqual(self.client.get(f'/api/processos/{record.pk}/').json()['diasContados'], 29)

    def test_legacy_counter_is_live_and_forms_are_readonly_after_date(self):
        process = ProcessosGerais(data_inicio=date(2026,10,1))
        license = PocosLicenciados(data_emissao=date(2026,10,1), data_vencimento=date(2026,12,28))
        requirement = PocosEmExigencia(data_entrada=date(2026,10,1), prazo_atendimento=date(2026,11,1))
        advisory = Assessoria(data_emissao=date(2026,10,1))
        with patch('django.utils.timezone.now', return_value=datetime(2026,10,30,2,59,tzinfo=timezone.utc)):
            self.assertEqual(process.dias_contados, 28)
            self.assertEqual(license.dias_contados, 28)
            self.assertEqual(license.dias_restantes, 60)
            self.assertEqual(requirement.contados, 28)
            self.assertEqual(advisory.dias_contados, 28)
        with patch('django.utils.timezone.now', return_value=datetime(2026,10,30,3,0,tzinfo=timezone.utc)):
            self.assertEqual(process.dias_contados, 29)
            self.assertEqual(license.dias_restantes, 59)
        for form, date_field, count_field in [(ProcessosGeraisForm(instance=process),'data_inicio','dias_contados'),(GeraisLicenciadosForm(),'data_emissao','dias_contados'),(PocosEmExigenciaForm(instance=requirement),'data_entrada','contados')]:
            fields = list(form.fields)
            self.assertEqual(fields[fields.index(date_field)+1], count_field)
            self.assertTrue(form.fields[count_field].disabled)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.console.EmailBackend')
    def test_console_does_not_consume_real_email_delivery(self):
        from django.core.management.base import CommandError
        from celerity_reminders.models import ReminderDelivery
        self.create_license()
        with self.assertRaises(CommandError):
            call_command('send_license_reminders', stdout=StringIO())
        self.assertEqual(ReminderDelivery.objects.count(), 0)
        self.assertEqual(LicenseNotice.objects.filter(active=True).count(), 1)

    def test_worker_can_validate_once_without_sending(self):
        self.create_license()
        output = StringIO()
        call_command('watch_license_reminders', once=True, dry_run=True, stdout=output)
        self.assertIn('pendentes: 1', output.getvalue())
        self.assertEqual(len(mail.outbox), 0)
