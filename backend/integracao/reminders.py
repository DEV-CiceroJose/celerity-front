from django.contrib.auth import get_user_model
from django.db.models import Q
from celerity.dates import brasilia_today, parse_date, remaining_days
from celerity_reminders.services import LicenseReminder, reminder_days
from processos.models import Gerais_Licenciados
from pocos.models import PocosLicenciados
from .models import RegistroIntegrado, LicenseNotice


def visible_records(user):
    records = RegistroIntegrado.objects.all()
    return records if user.is_staff else records.filter(Q(criado_por=user) | Q(recurso="licencas", dados__responsavelId=user.pk))


def legacy_rows(user):
    for model, prefix, type_field in [(Gerais_Licenciados, "gerais", "tipo_licenca"), (PocosLicenciados, "pocos", "licenca")]:
        rows = model.objects.select_related("usuario_responsavel")
        if not user.is_staff:
            rows = rows.filter(usuario_responsavel=user)
        for item in rows.iterator():
            yield {"id": f"{prefix}-{item.pk}", "primary": f"{getattr(item, type_field)} — {item.numero_processo or item.pk}",
                "secondary": item.empresa, "owner": item.usuario_responsavel.get_full_name() or item.usuario_responsavel.username if item.usuario_responsavel else "Não definido",
                "detail": getattr(item, type_field), "legacy": True, "data": {
                    "empresa": item.empresa, "numero": item.numero_processo, "cnpj": item.cnpj,
                    "dataEmissao": item.data_emissao.isoformat(), "dataVencimento": item.data_vencimento.isoformat()}}


def iter_license_reminders(user=None):
    records = RegistroIntegrado.objects.filter(recurso="licencas").select_related("criado_por")
    if user is not None:
        records = visible_records(user).filter(recurso="licencas").select_related("criado_por")
    for record in records.iterator():
        data = record.dados
        if data.get("status") in ["Cancelada", "Substituída", "Arquivada"]:
            continue
        expiry = parse_date(data.get("dataVencimento"))
        if not expiry:
            continue
        owner = record.criado_por
        if data.get("responsavelId"):
            owner = get_user_model().objects.filter(pk=data["responsavelId"], is_active=True).first()
        if owner is None or not owner.is_active or (user is not None and owner.pk != user.pk):
            continue
        yield LicenseReminder(key=str(record.pk), number=str(data.get("numero", f"Licença {record.pk}")),
            company=str(data.get("empresa", "")), expiry_date=expiry,
            recipients=(owner.email,) if owner.email else (), href=f"/app/licencas/{record.pk}", user_id=owner.pk)
    for model, prefix, type_field in [(Gerais_Licenciados, "gerais", "tipo_licenca"), (PocosLicenciados, "pocos", "licenca")]:
        rows = model.objects.filter(usuario_responsavel__is_active=True).select_related("usuario_responsavel")
        if user is not None:
            rows = rows.filter(usuario_responsavel=user)
        for item in rows.iterator():
            owner = item.usuario_responsavel
            key = f"{prefix}-{item.pk}"
            yield LicenseReminder(key=key, number=f"{getattr(item, type_field)} — {item.numero_processo or item.pk}",
                company=item.empresa, expiry_date=item.data_vencimento,
                recipients=(owner.email,) if owner.email else (), href=f"/app/licencas/{key}", user_id=owner.pk)


def sync_notices(user=None):
    today = brasilia_today()
    active_ids = []
    for license in iter_license_reminders(user):
        days = remaining_days(license.expiry_date, today)
        if days > reminder_days():
            continue
        notice, _ = LicenseNotice.objects.get_or_create(
            usuario_id=license.user_id, license_key=license.key, expiry_date=license.expiry_date,
            kind="expired" if days < 0 else "renewal",
            defaults={"number": license.number, "company": license.company, "href": license.href, "active": True})
        values = {"number": license.number, "company": license.company, "href": license.href, "active": True}
        if any(getattr(notice, key) != value for key, value in values.items()):
            LicenseNotice.objects.filter(pk=notice.pk).update(**values)
        active_ids.append(notice.pk)
    queryset = LicenseNotice.objects.all()
    if user is not None:
        queryset = queryset.filter(usuario=user)
    queryset.filter(active=True).exclude(pk__in=active_ids).update(active=False)
    return queryset.filter(active=True)


def serialize_notice(notice):
    days = remaining_days(notice.expiry_date)
    label = (f"Venceu há {abs(days)} dia(s)" if days < 0 else "Vence hoje" if days == 0 else f"{days} dia(s) restantes")
    return {"id": notice.pk, "category": "Licenças", "title": "Licença vencida: solicite a renovação" if days < 0 else "Solicite a renovação da licença",
        "text": f"{notice.number} — {notice.company}. {label} ({notice.expiry_date:%d/%m/%Y}). Solicite uma nova licença ao órgão responsável.",
        "time": f"Verificado em {brasilia_today():%d/%m/%Y} · Brasília", "href": notice.href, "read": notice.read,
        "archived": notice.archived, "snoozeUntil": notice.snooze_until.isoformat() if notice.snooze_until else None}
