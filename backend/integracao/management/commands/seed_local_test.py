from datetime import timedelta
from pathlib import Path
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from celerity.dates import brasilia_today
from integracao.models import Perfil, RegistroIntegrado
from integracao.reminders import sync_notices


class Command(BaseCommand):
    help = "Cria os dados fictícios da demonstração local, com alertas ativos."

    def handle(self, *args, **options):
        if not settings.DEBUG or not settings.CELERITY_LOCAL_TEST_MODE:
            raise CommandError("Ative CELERITY_LOCAL_TEST_MODE somente em um banco de demonstração.")
        db_name = str(settings.DATABASES["default"]["NAME"])
        if Path(db_name).resolve() == (settings.BASE_DIR / "db.sqlite3").resolve():
            raise CommandError("Use CELERITY_DB_PATH para um banco separado; o banco original não recebe dados fictícios.")
        user, _ = get_user_model().objects.get_or_create(username="demo@celerityambiental.com.br", defaults={
            "email": "demo@celerityambiental.com.br", "first_name": "Mariana", "last_name": "Costa"})
        user.set_password("Celerity@2026")
        user.save()
        Perfil.objects.get_or_create(usuario=user, defaults={"empresa": "Celerity Ambiental", "funcao": "Gestora"})
        today = brasilia_today()
        examples = [
            ("licencas", "TESTE-LO-30-DIAS", {"empresa": "Empresa Demonstração Ambiental", "processo": "TESTE-2026-001", "tipo": "LO", "dataEmissao": (today-timedelta(days=335)).isoformat(), "dataVencimento": (today+timedelta(days=30)).isoformat()}),
            ("licencas", "TESTE-LO-VENCIDA", {"empresa": "Poço Demonstração do Sertão", "processo": "TESTE-2026-002", "tipo": "LO", "dataEmissao": (today-timedelta(days=370)).isoformat(), "dataVencimento": (today-timedelta(days=5)).isoformat()}),
            ("licencas", "TESTE-LO-FORA-ALERTA", {"empresa": "Empresa Licença Regular", "processo": "TESTE-2026-003", "tipo": "LO", "dataEmissao": (today-timedelta(days=20)).isoformat(), "dataVencimento": (today+timedelta(days=180)).isoformat()}),
            ("processos", "TESTE-2026-001", {"empresa": "Empresa Demonstração Ambiental", "tipoLicenca": "LO", "status": "Em análise", "dataInicio": (today-timedelta(days=42)).isoformat(), "prazo": (today+timedelta(days=10)).isoformat()}),
            ("exigencias", "TESTE-EXIGENCIA-001", {"empresa": "Empresa Demonstração Ambiental", "descricao": "Entregar relatório de teste", "processo": "TESTE-2026-001", "status": "Pendente", "dataEntrada": (today-timedelta(days=12)).isoformat(), "prazo": (today+timedelta(days=7)).isoformat()}),
        ]
        for resource, number, data in examples:
            existing = RegistroIntegrado.objects.filter(recurso=resource, criado_por=user, dados__numero=number, dados__testFixture=True).first()
            values = {**data, "numero": number, "responsavel": "Mariana Costa", "testFixture": True}
            if existing:
                existing.dados = values
                existing.save(update_fields=["dados", "atualizado_em"])
            else:
                RegistroIntegrado.objects.create(recurso=resource, criado_por=user, dados=values)
        notices = sync_notices(user)
        notices.update(read=False, archived=False, snooze_until=None)
        self.stdout.write(f"Demonstração criada: {len(examples)} registros fictícios e {notices.count()} alertas ativos.")
