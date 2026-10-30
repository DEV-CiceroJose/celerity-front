"""Envio manual explícito, disponível apenas na demonstração em loopback."""
from uuid import UUID
from smtplib import SMTPAuthenticationError, SMTPRecipientsRefused, SMTPException

from django.conf import settings
from django.core.mail import get_connection
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import JsonResponse
from django.views.decorators.debug import sensitive_variables
from django.views.decorators.http import require_http_methods

from celerity.dates import parse_date, remaining_days
from celerity_reminders.brevo import BrevoEmailBackend, BrevoDeliveryError
from celerity_reminders.services import LicenseReminder, send_license_reminder
from .models import RegistroIntegrado
from .views import login_required, erro, corpo_json


def server_email_ready():
    backend = settings.EMAIL_BACKEND
    return (backend == "django.core.mail.backends.smtp.EmailBackend" and bool(settings.EMAIL_HOST)) or (backend == "celerity_reminders.brevo.BrevoEmailBackend" and bool(getattr(settings, "BREVO_API_KEY", "")))


@login_required
@require_http_methods(["GET", "POST"])
@sensitive_variables()
def local_email_test(request):
    if not settings.DEBUG or not settings.CELERITY_LOCAL_TEST_MODE or request.META.get("REMOTE_ADDR") not in ["127.0.0.1", "::1"]:
        return erro("Teste disponível somente na demonstração local.", 404)
    records = RegistroIntegrado.objects.filter(recurso="licencas", criado_por=request.user, dados__testFixture=True)
    if request.method == "GET":
        return JsonResponse({"enabled": True, "serverReady": server_email_ready(), "licenses": [
            {"id": record.pk, "number": record.dados.get("numero"), "company": record.dados.get("empresa"),
             "expiry": record.dados.get("dataVencimento"), "days": remaining_days(record.dados.get("dataVencimento"))}
            for record in records if remaining_days(record.dados.get("dataVencimento")) is not None
        ]})
    data = corpo_json(request)
    if data is None:
        return erro("Informe o destinatário do teste.")
    try:
        recipient = data.get("recipient", "")
        if not isinstance(recipient, str):
            return erro("E-mail de destino inválido.")
        recipient = recipient.strip()
        validate_email(recipient)
        token = str(UUID(str(data.get("requestId", ""))))
        license_id = int(data.get("licenseId", 0))
    except (ValidationError, ValueError, TypeError):
        return erro("Revise o e-mail e selecione uma licença de teste.")
    record = records.filter(pk=license_id).first()
    if record is None:
        return erro("Licença de teste não encontrada.", 404)
    connection = None
    sender = None
    try:
        if data.get("provider") == "brevo":
            sender = str(data.get("sender", "")).strip()
            validate_email(sender)
            api_key = str(data.get("apiKey", "")).strip()
            if not api_key or len(api_key) > 4096 or any(character.isspace() for character in api_key):
                return erro("Informe a chave de API do Brevo, disponível em SMTP e API → Chaves de API.")
            connection = BrevoEmailBackend(api_key=api_key)
        elif data.get("provider") == "gmail":
            sender = str(data.get("sender", "")).strip()
            validate_email(sender)
            password = str(data.get("appPassword", "")).replace(" ", "")
            if len(password) != 16 or not password.isalnum():
                return erro("Informe a senha de app do Google, com 16 caracteres. Não use a senha normal da conta.")
            connection = get_connection("django.core.mail.backends.smtp.EmailBackend", host="smtp.gmail.com", port=587,
                username=sender, password=password, use_tls=True, use_ssl=False, timeout=15)
        elif not server_email_ready():
            return erro("Conecte sua conta Brevo ou Gmail neste painel para enviar uma mensagem real. Nenhum e-mail foi enviado.", 409)
        license = LicenseReminder(key=f"manual-test-{request.user.pk}-{token}", number=record.dados.get("numero", "TESTE"),
            company=record.dados.get("empresa", "Empresa fictícia"), expiry_date=parse_date(record.dados.get("dataVencimento")),
            recipients=(recipient,), href=f"/app/licencas/{record.pk}", user_id=request.user.pk)
        if license.expiry_date is None or remaining_days(license.expiry_date) > settings.LICENSE_REMINDER_DAYS:
            return erro("Selecione uma licença que já esteja na janela de alerta.")
        sent = send_license_reminder(license, connection=connection, from_email=sender, test_message=True)
        return JsonResponse({"sent": sent == 1, "alreadySent": sent == 0, "detail":
            "O servidor de e-mail aceitou a mensagem. Confira a caixa de entrada e o spam." if sent else
            "Esta solicitação já foi enviada; nenhuma cópia adicional foi disparada."})
    except BrevoDeliveryError as exc:
        return erro(str(exc), exc.status)
    except ValidationError:
        return erro("Informe um e-mail de remetente válido.")
    except SMTPAuthenticationError:
        return erro("O Gmail não autorizou o acesso. Confira o endereço e a senha de app do Google.", 400)
    except SMTPRecipientsRefused:
        return erro("O provedor recusou o destinatário informado.", 400)
    except (OSError, TimeoutError):
        return erro("Não foi possível conectar ao serviço de e-mail. Confira a conexão e tente novamente.", 503)
    except SMTPException:
        return erro("O serviço de e-mail não confirmou o envio. Confira a configuração.", 502)
    except Exception:
        return erro("Não foi possível concluir o teste de e-mail. Nenhum sucesso foi confirmado.", 500)
