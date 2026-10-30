import json
from functools import wraps
from datetime import timedelta
from django.conf import settings
from django.db.models import Q
from django.utils import timezone
from celerity.dates import brasilia_today, parse_date, counted_days, remaining_days
from celerity_reminders.services import reminder_days
from .reminders import visible_records, legacy_rows, sync_notices, serialize_notice
from .models import LicenseNotice

from django.contrib.auth import authenticate, get_user_model, login, logout

from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_GET, require_http_methods

from .models import Perfil, RegistroIntegrado


def login_required(view):
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({"detail": "Sua sessão expirou."}, status=401)
        return view(request, *args, **kwargs)
    return wrapped


def can_write(user):
    return not Perfil.objects.filter(usuario=user, funcao="Somente leitura").exists()


def validate_data(data, resource, user):
    # Contadores são derivados das datas, nunca aceitos do navegador.
    for key in ["diasContados", "dias_contados", "dias_restantes", "tempo_setor", "contados"]:
        data.pop(key, None)
    for key in ["dataInicio", "dataEntrada", "dataEmissao", "dataVencimento", "prazo", "vencimento", "dataAtendimento", "dataConclusao", "dataPagamento"]:
        if data.get(key) and not parse_date(data[key]):
            return f"Data inválida: {key}. Use AAAA-MM-DD."
    if resource == "licencas":
        if not parse_date(data.get("dataEmissao")) or not parse_date(data.get("dataVencimento")):
            return "Informe as datas de emissão e vencimento da licença."
        if data["dataVencimento"] <= data["dataEmissao"]:
            return "O vencimento deve ser posterior à emissão."
        if data.get("responsavelId") is not None:
            value = data["responsavelId"]
            if not isinstance(value, int) or isinstance(value, bool):
                return "Usuário responsável inválido."
            if value != user.pk and not user.is_staff:
                return "Você não pode atribuir a licença a outro usuário."
            if not get_user_model().objects.filter(pk=value, is_active=True).exists():
                return "Usuário responsável não encontrado."
    start = valor(data, "dataInicio", "dataEntrada", "dataEmissao")
    if start and parse_date(start) > brasilia_today():
        return "A data de início, entrada ou emissão não pode ser futura."
    if data.get("dataAtendimento") and data.get("dataEntrada") and data["dataAtendimento"] < data["dataEntrada"]:
        return "O atendimento não pode ser anterior à entrada."
    return None


def calculated_fields(data, resource):
    today = brasilia_today()
    start = valor(data, "dataInicio", "dataEntrada", "dataEmissao")
    end = valor(data, "dataConclusao", "dataAtendimento", "dataPagamento")
    due = valor(data, "dataVencimento", "prazo", "vencimento")
    days = counted_days(start, end, today)
    remaining = remaining_days(due, today)
    status = valor(data, "status", "situacao", "perfil") or "Em andamento"
    if resource == "licencas" and status not in ["Cancelada", "Substituída", "Arquivada"]:
        status = ("Data não informada" if remaining is None else "Vencida" if remaining < 0 else "Vence hoje" if remaining == 0 else f"Vence em {remaining} dias" if remaining <= reminder_days() else "Válida")
    label = valor(data, "dataDocumento") or ""
    if due and remaining is not None:
        countdown = f"Venceu há {abs(remaining)} dia(s)" if remaining < 0 else "Vence hoje" if remaining == 0 else f"{remaining} dia(s) restantes"
        label = f"{parse_date(due):%d/%m/%Y} · {countdown}"
    if end:
        label = f"Concluído: {parse_date(end):%d/%m/%Y}"
    if days is not None:
        label = f"{label + ' · ' if label else ''}{days} dias contados"
    return {"status": status, "date": label, "diasContados": days, "diasRestantes": remaining, "referenceDate": today.isoformat()}


RECURSOS = {
    "empresas", "processos", "pocos", "licencas", "exigencias", "pagamentos",
    "assessoria", "documentos", "usuarios",
}


def corpo_json(request):
    try:
        data = json.loads(request.body or "{}")
        return data if isinstance(data, dict) else None
    except json.JSONDecodeError:
        return None


def erro(mensagem, status=400):
    return JsonResponse({"detail": mensagem}, status=status)


def dados_usuario(usuario):
    perfil, _ = Perfil.objects.get_or_create(usuario=usuario)
    return {
        "id": usuario.pk,
        "name": usuario.get_full_name() or usuario.username,
        "email": usuario.email,
        "role": perfil.funcao,
        "company": perfil.empresa,
    }


def valor(dados, *nomes):
    return next((dados.get(nome) for nome in nomes if dados.get(nome)), "")


def serializar(registro):
    dados = registro.dados
    return {
        "id": registro.pk,
        "primary": valor(dados, "razaoSocial", "numero", "titulo", "nome", "solicitacao", "numeroLicenca", "descricao") or f"Registro {registro.pk}",
        "secondary": valor(dados, "empresa", "email", "cnpj", "processo"),
        "status": valor(dados, "status", "situacao", "perfil") or "Em andamento",
        "detail": valor(dados, "tipoLicenca", "tipo", "tipoProcesso", "categoria", "cargo", "identificacao", "exigencia") or "Sem detalhe",
        "owner": valor(dados, "responsavel", "nome") or "Não definido",
        "date": valor(dados, "prazo", "vencimento", "dataVencimento", "dataInicio", "dataEntrada", "dataDocumento") or registro.atualizado_em.strftime("%d/%m/%Y"),
        "data": dados,
        "createdAt": registro.criado_em.isoformat(),
        "updatedAt": registro.atualizado_em.isoformat(),
        **calculated_fields(dados, registro.recurso),
    }


@require_GET
def csrf(request):
    return JsonResponse({"csrfToken": get_token(request)})


@require_http_methods(["POST"])
def entrar(request):
    dados = corpo_json(request)
    if dados is None:
        return erro("JSON inválido.")
    email = str(dados.get("email", "")).strip().lower()
    senha = str(dados.get("password", ""))
    if email == "demo@celerityambiental.com.br" and senha == "Celerity@2026":
        usuario, criado = get_user_model().objects.get_or_create(
            username=email,
            defaults={"email": email, "first_name": "Mariana", "last_name": "Costa"},
        )
        if criado:
            usuario.set_password(senha)
            usuario.save()
        Perfil.objects.get_or_create(usuario=usuario, defaults={"empresa": "Celerity Ambiental", "funcao": "Gestora"})
    usuario = authenticate(request, username=email, password=senha)
    if usuario is None:
        return erro("E-mail ou senha incorretos.", 401)
    login(request, usuario)
    return JsonResponse({"user": dados_usuario(usuario)})


@require_http_methods(["POST"])
def cadastrar(request):
    dados = corpo_json(request)
    if dados is None:
        return erro("JSON inválido.")
    obrigatorios = ("name", "email", "password", "company", "role")
    if any(not str(dados.get(campo, "")).strip() for campo in obrigatorios):
        return erro("Preencha todos os campos obrigatórios.")
    email = str(dados["email"]).strip().lower()
    if get_user_model().objects.filter(username=email).exists():
        return erro("Já existe um acesso cadastrado com este e-mail.", 409)
    if len(str(dados["password"])) < 8:
        return erro("A senha deve ter pelo menos 8 caracteres.")
    partes = str(dados["name"]).strip().split(maxsplit=1)
    usuario = get_user_model().objects.create_user(
        username=email, email=email, password=dados["password"], first_name=partes[0], last_name=partes[1] if len(partes) > 1 else "",
    )
    Perfil.objects.create(usuario=usuario, empresa=str(dados["company"]).strip(), telefone=str(dados.get("phone", "")).strip(), funcao=str(dados["role"]).strip())
    return JsonResponse({"user": dados_usuario(usuario)}, status=201)


@require_http_methods(["POST"])
def sair(request):
    logout(request)
    return JsonResponse({"ok": True})


@login_required
@require_GET
def sessao(request):
    return JsonResponse({"user": dados_usuario(request.user)})


@login_required
@require_http_methods(["GET", "POST"])
def registros(request, recurso):
    if recurso not in RECURSOS:
        return erro("Recurso não encontrado.", 404)
    if request.method == "POST":
        dados = corpo_json(request)
        if not isinstance(dados, dict):
            return erro("JSON inválido.")
        if not can_write(request.user):
            return erro("Seu perfil permite somente consulta.", 403)
        invalid = validate_data(dados, recurso, request.user)
        if invalid:
            return erro(invalid)
        registro = RegistroIntegrado.objects.create(recurso=recurso, dados=dados, criado_por=request.user)
        return JsonResponse(serializar(registro), status=201)
    itens = visible_records(request.user).filter(recurso=recurso)
    busca = request.GET.get("search", "").strip().lower()
    status = request.GET.get("status", "").strip().lower()
    responsavel = request.GET.get("owner", "").strip().lower()
    resultado = [serializar(item) for item in itens]
    if recurso == "licencas":
        resultado.extend({**row, **calculated_fields(row["data"], "licencas")} for row in legacy_rows(request.user))
    if busca:
        resultado = [item for item in resultado if busca in json.dumps(item, ensure_ascii=False).lower()]
    if status:
        resultado = [item for item in resultado if item["status"].lower() == status]
    if responsavel:
        resultado = [item for item in resultado if item["owner"].lower() == responsavel]
    return JsonResponse({"count": len(resultado), "results": resultado})


@login_required
@require_http_methods(["GET", "PATCH", "DELETE"])
def registro(request, recurso, pk):
    if recurso not in RECURSOS:
        return erro("Recurso não encontrado.", 404)
    if not str(pk).isdigit():
        if recurso != "licencas" or request.method != "GET":
            return erro("Registro legado disponível somente para consulta.", 404)
        row = next((row for row in legacy_rows(request.user) if row["id"] == pk), None)
        return JsonResponse({**row, **calculated_fields(row["data"], recurso)}) if row else erro("Registro não encontrado.", 404)
    try:
        item = visible_records(request.user).get(pk=pk, recurso=recurso)
    except RegistroIntegrado.DoesNotExist:
        return erro("Registro não encontrado.", 404)
    if request.method == "GET":
        return JsonResponse(serializar(item))
    if not can_write(request.user):
        return erro("Seu perfil permite somente consulta.", 403)
    if request.method == "DELETE":
        item.delete()
        return JsonResponse({}, status=204)
    dados = corpo_json(request)
    if not isinstance(dados, dict):
        return erro("JSON inválido.")
    dados = {**item.dados, **dados}
    invalid = validate_data(dados, recurso, request.user)
    if invalid:
        return erro(invalid)
    item.dados = dados
    item.save(update_fields=["dados", "atualizado_em"])
    return JsonResponse(serializar(item))


@login_required
@require_GET
def resumo(request):
    processos = visible_records(request.user).filter(recurso="processos")
    exigencias = visible_records(request.user).filter(recurso="exigencias")
    return JsonResponse({
        "metrics": [
            {"label": "Processos ativos", "value": processos.count(), "change": "Registros cadastrados", "tone": "green", "path": "/app/processos"},
            {"label": "Em análise", "value": sum(1 for item in processos if item.dados.get("status") == "Em análise"), "change": "Acompanhe a fila", "tone": "neutral", "path": "/app/processos?status=Em%20análise"},
            {"label": "Exigências pendentes", "value": sum(1 for item in exigencias if item.dados.get("status") != "Atendida"), "change": "Exigem acompanhamento", "tone": "warning", "path": "/app/exigencias"},
            {"label": "Total de registros", "value": visible_records(request.user).count(), "change": "Base integrada", "tone": "danger", "path": "/app/processos"},
        ]
    })


@require_GET
def configuration(request):
    return JsonResponse({"timeZone": "America/Sao_Paulo", "reminderDays": reminder_days(), "serverNow": timezone.now().isoformat(), "localTestMode": settings.DEBUG and settings.CELERITY_LOCAL_TEST_MODE})


@login_required
@require_GET
def notifications(request):
    today = brasilia_today()
    notices = sync_notices(request.user).filter(archived=False).filter(Q(snooze_until__isnull=True) | Q(snooze_until__lte=today)).order_by("expiry_date", "pk")
    return JsonResponse({"results": [serialize_notice(notice) for notice in notices], "reminderDays": reminder_days(), "serverNow": timezone.now().isoformat()})


@login_required
@require_http_methods(["PATCH"])
def notification(request, pk):
    try:
        notice = LicenseNotice.objects.get(pk=pk, usuario=request.user)
    except LicenseNotice.DoesNotExist:
        return erro("Notificação não encontrada.", 404)
    data = corpo_json(request)
    if data is None:
        return erro("JSON inválido.")
    for key in ["read", "archived"]:
        if key in data:
            if not isinstance(data[key], bool):
                return erro("Informe um valor booleano.")
            setattr(notice, key, data[key])
    if "snoozeUntil" in data:
        value = parse_date(data["snoozeUntil"])
        if not value or value <= brasilia_today():
            return erro("O adiamento deve ser uma data futura.")
        notice.snooze_until = value
    notice.save()
    return JsonResponse(serialize_notice(notice))
