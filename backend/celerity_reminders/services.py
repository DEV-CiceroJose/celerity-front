"""Servidor: executado por agendador, mesmo quando nenhum navegador estiver aberto."""
from dataclasses import dataclass
from datetime import date
from urllib.parse import quote
from zoneinfo import ZoneInfo

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.db import transaction
from django.utils import timezone

from .models import ReminderDelivery


@dataclass(frozen=True)
class LicenseReminder:
    # O adaptador deve selecionar apenas licenças ativas e usuários autorizados.
    key: str
    number: str
    company: str
    expiry_date: date
    recipients: tuple[str, ...]
    href: str = ""
    user_id: int | None = None


def reminder_days():
    raw = getattr(settings, "LICENSE_REMINDER_DAYS", 60)
    try:
        days = int(str(raw))
    except (TypeError, ValueError) as exc:
        raise ImproperlyConfigured("LICENSE_REMINDER_DAYS deve ser um inteiro >= 60.") from exc
    if days < 60:
        raise ImproperlyConfigured("LICENSE_REMINDER_DAYS deve ser >= 60.")
    return days


def send_license_reminder(license, *, today=None, dry_run=False, connection=None, from_email=None, test_message=False):
    today = today or timezone.localdate(timezone=ZoneInfo("America/Sao_Paulo"))
    days = (license.expiry_date - today).days
    if days > reminder_days():
        return 0
    kind = "expired" if days < 0 else "renewal"
    deadline = license.expiry_date.strftime("%d/%m/%Y")
    status = (f"venceu há {abs(days)} dia(s)" if days < 0 else
              "vence hoje" if days == 0 else f"vence em {days} dia(s)")
    subject = "Celerity: solicite a renovação da licença"
    body = (f"A licença {license.number}, da empresa {license.company}, {status} ({deadline}).\n\n"
            "Solicite uma nova licença ao órgão responsável.\n"
            f"Aviso configurado com {reminder_days()} dias de antecedência. Horário de Brasília.")
    base_url = getattr(settings, "CELERITY_FRONTEND_URL", "").rstrip("/")
    if base_url:
        body += f"\n\nConsultar: {base_url}{license.href or '/app/licencas/' + quote(str(license.key), safe='')}"
    if test_message:
        subject = "[TESTE LOCAL] " + subject
        body = "DADOS FICTÍCIOS: este é um teste solicitado no sistema Celerity.\n\n" + body
    if not license.recipients:
        raise ValueError("Licença sem destinatário autorizado para receber o lembrete.")
    recipients = set(license.recipients)
    for email in recipients:
        validate_email(email)
    sent = 0
    for email in recipients:
        lookup = dict(license_key=str(license.key), expiry_date=license.expiry_date,
                      recipient=email, kind=kind)
        if dry_run:
            sent += int(not ReminderDelivery.objects.filter(**lookup, sent_at__isnull=False).exists())
            continue
        # A restrição única e o bloqueio impedem envios simultâneos para a mesma chave.
        # Em produção, usar PostgreSQL; o timeout SMTP deve ser limitado.
        with transaction.atomic():
            delivery, _ = ReminderDelivery.objects.get_or_create(**lookup)
            delivery = ReminderDelivery.objects.select_for_update().get(pk=delivery.pk)
            if delivery.sent_at:
                continue
            if send_mail(subject, body, from_email or settings.DEFAULT_FROM_EMAIL, [email], fail_silently=False, connection=connection) != 1:
                raise RuntimeError("O serviço de e-mail não confirmou o envio.")
            delivery.sent_at = timezone.now()
            delivery.save(update_fields=["sent_at"])
            sent += 1
    return sent
