import time
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Mantém a verificação e os lembretes ativos sem depender do navegador."

    def add_arguments(self, parser):
        parser.add_argument("--interval", type=int, default=3600, help="Intervalo em segundos (mínimo 60).")
        parser.add_argument("--once", action="store_true", help="Executa uma vez e encerra.")
        parser.add_argument("--dry-run", action="store_true", help="Simula sem enviar mensagens.")

    def handle(self, *args, **options):
        if options["interval"] < 60:
            raise CommandError("O intervalo deve ser de pelo menos 60 segundos.")
        try:
            while True:
                try:
                    call_command("send_license_reminders", dry_run=options["dry_run"], stdout=self.stdout, stderr=self.stderr)
                except CommandError as exc:
                    if options["once"]:
                        raise
                    self.stderr.write(str(exc))
                if options["once"]:
                    return
                time.sleep(options["interval"])
        except KeyboardInterrupt:
            self.stdout.write("Verificação de lembretes encerrada.")
