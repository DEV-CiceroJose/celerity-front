from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.utils.module_loading import import_string

from celerity_reminders.services import reminder_days, send_license_reminder


class Command(BaseCommand):
    help = "Envia lembretes de renovação das licenças pelo provedor configurado."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Conta mensagens pendentes sem enviá-las.")

    def handle(self, *args, **options):
        reminder_days()
        if not options["dry_run"]:
            from integracao.reminders import sync_notices
            sync_notices()
            backend = settings.EMAIL_BACKEND
            if backend in ["django.core.mail.backends.console.EmailBackend", "django.core.mail.backends.dummy.EmailBackend", "django.core.mail.backends.filebased.EmailBackend"]:
                raise CommandError("Configure um serviço real de e-mail ou utilize --dry-run. Nenhum envio foi registrado como concluído.")
            if backend == "django.core.mail.backends.smtp.EmailBackend" and not settings.EMAIL_HOST:
                raise CommandError("Configure EMAIL_HOST para ativar o envio por SMTP.")
        provider_path = getattr(settings, "CELERITY_LICENSE_REMINDER_PROVIDER", None)
        if not provider_path:
            raise CommandError("Configure CELERITY_LICENSE_REMINDER_PROVIDER com o adaptador das licenças reais.")
        provider = import_string(provider_path)
        sent = failed = 0
        for license in provider():
            try:
                sent += send_license_reminder(license, dry_run=options["dry_run"])
            except Exception as exc:
                failed += 1
                self.stderr.write(f"Falha na licença {license.key}: {type(exc).__name__}.")
        self.stdout.write(f"Mensagens {'pendentes' if options['dry_run'] else 'enviadas'}: {sent}; licenças com falha: {failed}.")
        if failed:
            raise CommandError("Existem lembretes com falha. Verifique os registros e repita a execução.")
