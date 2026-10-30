"""Envio transacional HTTPS pelo Brevo, com chave mantida apenas em memória."""
import json
from email.utils import parseaddr
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend


class BrevoDeliveryError(Exception):
    def __init__(self, message, status=502):
        super().__init__(message)
        self.status = status


class BrevoEmailBackend(BaseEmailBackend):
    def __init__(self, api_key=None, **kwargs):
        super().__init__(**kwargs)
        self.api_key = api_key or getattr(settings, "BREVO_API_KEY", "")

    def send_messages(self, email_messages):
        if not self.api_key or len(self.api_key) > 4096 or any(character.isspace() for character in self.api_key):
            raise BrevoDeliveryError("Informe uma chave de API válida do Brevo.", 400)
        sent = 0
        for message in email_messages:
            name, sender = parseaddr(message.from_email)
            payload = {"sender": {"email": sender, "name": name or "Celerity Ambiental"},
                "to": [{"email": recipient} for recipient in message.recipients()],
                "subject": message.subject, "textContent": message.body}
            request = Request("https://api.brevo.com/v3/smtp/email", method="POST",
                headers={"api-key": self.api_key, "Content-Type": "application/json", "Accept": "application/json"},
                data=json.dumps(payload, ensure_ascii=False).encode("utf-8"))
            try:
                with urlopen(request, timeout=15) as response:
                    result = json.loads(response.read())
                    if response.status != 201 or not isinstance(result, dict) or not result.get("messageId"):
                        raise BrevoDeliveryError("O Brevo não confirmou o envio. Confira a atividade da conta antes de tentar novamente.")
                sent += 1
            except HTTPError as exc:
                # Classificar a resposta sem expor texto que possa conter credenciais.
                try:
                    details = json.loads(exc.read(8192))
                    provider_message = str(details.get("message", "")).lower() if isinstance(details, dict) else ""
                except (ValueError, TypeError, AttributeError, OSError):
                    provider_message = ""
                finally:
                    exc.close()
                if exc.code in [401, 403]:
                    if any(term in provider_message for term in ["ip address", "unauthorized ip", "unrecognised ip", "unrecognized ip"]):
                        raise BrevoDeliveryError("O Brevo bloqueou o IP desta conexão. Abra Configurações → Segurança → IPs autorizados no Brevo e confira a solicitação correspondente a este teste antes de autorizá-la.", 400) from None
                    if exc.code == 401 or any(term in provider_message for term in ["key not found", "invalid api key", "api key is not enabled"]):
                        raise BrevoDeliveryError("O Brevo não aceitou a chave de API. Gere uma nova em Configurações → SMTP e API → Chaves API e MCP e copie o valor completo no momento da criação. Use uma chave de API ativa, não uma chave SMTP nem uma chave MCP.", 400) from None
                    raise BrevoDeliveryError("O Brevo negou a permissão de envio. Confira a ativação da conta e se a chave de API tem acesso ao envio de e-mails transacionais.", 400) from None
                if exc.code == 429:
                    raise BrevoDeliveryError("O limite de envios do Brevo foi atingido. Tente mais tarde.", 429) from None
                if exc.code == 400:
                    raise BrevoDeliveryError("O Brevo recusou a mensagem. Confira se o remetente está validado e se o destinatário está correto.", 400) from None
                raise BrevoDeliveryError("O Brevo está indisponível para este envio. Tente novamente mais tarde.") from None
            except (URLError, OSError, TimeoutError):
                raise BrevoDeliveryError("Não foi possível conectar ao Brevo. Confira a conexão e tente novamente.", 503) from None
            except (ValueError, TypeError):
                raise BrevoDeliveryError("A resposta do Brevo não confirmou o envio. Confira a atividade da conta.") from None
        return sent
