from datetime import date, datetime, timezone
from io import StringIO
from unittest.mock import patch

from django.core import mail
from django.core.exceptions import ImproperlyConfigured, ValidationError
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, override_settings

from .models import ReminderDelivery
from .services import LicenseReminder, reminder_days, send_license_reminder


def provider():
    return [LicenseReminder('42', 'LO 42', 'Empresa', date(2026, 12, 28), ('owner@example.com',))]


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class ReminderTests(TestCase):
    today = date(2026, 10, 29)

    def license(self, expiry=date(2026, 12, 28), recipients=('owner@example.com',)):
        return LicenseReminder('42', 'LO 42', 'Empresa', expiry, recipients)

    def test_boundary_and_no_duplicate(self):
        self.assertEqual(send_license_reminder(self.license(date(2026, 12, 29)), today=self.today), 0)
        self.assertEqual(send_license_reminder(self.license(), today=self.today), 1)
        self.assertEqual(send_license_reminder(self.license(), today=self.today), 0)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('60 dia(s)', mail.outbox[0].body)
        self.assertEqual(ReminderDelivery.objects.count(), 1)

    def test_expired_and_renewed_get_new_reminder(self):
        send_license_reminder(self.license(), today=self.today)
        self.assertEqual(send_license_reminder(self.license(), today=date(2026, 12, 29)), 1)
        self.assertEqual(send_license_reminder(self.license(date(2026, 12, 27)), today=self.today), 1)

    def test_due_today(self):
        send_license_reminder(self.license(self.today), today=self.today)
        self.assertIn('vence hoje', mail.outbox[0].body)

    def test_recipient_privacy_and_deduplication(self):
        self.assertEqual(send_license_reminder(self.license(recipients=('a@example.com', 'b@example.com', 'a@example.com')), today=self.today), 2)
        self.assertTrue(all(len(message.to) == 1 for message in mail.outbox))

    def test_failure_can_be_retried(self):
        with patch('celerity_reminders.services.send_mail', side_effect=OSError('offline')):
            with self.assertRaises(OSError):
                send_license_reminder(self.license(), today=self.today)
        self.assertEqual(ReminderDelivery.objects.count(), 0)
        self.assertEqual(send_license_reminder(self.license(), today=self.today), 1)

    def test_unconfirmed_send_can_be_retried(self):
        with patch('celerity_reminders.services.send_mail', return_value=0):
            with self.assertRaises(RuntimeError):
                send_license_reminder(self.license(), today=self.today)
        self.assertEqual(ReminderDelivery.objects.count(), 0)

    def test_missing_or_invalid_recipient(self):
        with self.assertRaises(ValueError):
            send_license_reminder(self.license(recipients=()), today=self.today)
        with self.assertRaises(ValidationError):
            send_license_reminder(self.license(recipients=('invalid',)), today=self.today)

    def test_brasilia_midnight(self):
        # Às 02:59 UTC ainda é dia 29 em Brasília: a licença está fora dos 60 dias.
        with patch('django.utils.timezone.now', return_value=datetime(2026, 10, 30, 2, 59, tzinfo=timezone.utc)):
            self.assertEqual(send_license_reminder(self.license(date(2026, 12, 29))), 0)
        with patch('django.utils.timezone.now', return_value=datetime(2026, 10, 30, 3, 0, tzinfo=timezone.utc)):
            self.assertEqual(send_license_reminder(self.license(date(2026, 12, 29))), 1)

    def test_dry_run_does_not_send_or_record(self):
        self.assertEqual(send_license_reminder(self.license(), today=self.today, dry_run=True), 1)
        self.assertEqual(ReminderDelivery.objects.count(), 0)
        self.assertEqual(len(mail.outbox), 0)

    def test_minimum_lead_time(self):
        for value in [59, 'all', 60.5]:
            with override_settings(LICENSE_REMINDER_DAYS=value):
                with self.assertRaises(ImproperlyConfigured):
                    reminder_days()
        with override_settings(LICENSE_REMINDER_DAYS=90):
            self.assertEqual(send_license_reminder(self.license(date(2027, 1, 27)), today=self.today), 1)

    @override_settings(CELERITY_LICENSE_REMINDER_PROVIDER=None)
    def test_command_requires_real_data_provider(self):
        with self.assertRaises(CommandError):
            call_command('send_license_reminders', stdout=StringIO())

    @override_settings(CELERITY_LICENSE_REMINDER_PROVIDER='celerity_reminders.tests.provider')
    def test_command_uses_provider_and_dry_run(self):
        output = StringIO()
        with patch('django.utils.timezone.now', return_value=datetime(2026, 10, 29, 15, tzinfo=timezone.utc)):
            call_command('send_license_reminders', dry_run=True, stdout=output)
        self.assertIn('pendentes: 1', output.getvalue())
        self.assertEqual(ReminderDelivery.objects.count(), 0)
