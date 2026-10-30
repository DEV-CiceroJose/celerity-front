from datetime import date
from zoneinfo import ZoneInfo
from django.utils import timezone

BRASILIA = ZoneInfo("America/Sao_Paulo")


def brasilia_today():
    return timezone.localdate(timezone=BRASILIA)


def parse_date(value):
    if isinstance(value, date):
        return value
    try:
        return date.fromisoformat(value) if value else None
    except (TypeError, ValueError):
        return None


def counted_days(start, end=None, today=None):
    start, end = parse_date(start), parse_date(end)
    today = today or brasilia_today()
    if start is None:
        return None
    cutoff = min(end, today) if end else today
    return max(0, (cutoff - start).days)


def remaining_days(deadline, today=None):
    deadline = parse_date(deadline)
    return (deadline - (today or brasilia_today())).days if deadline else None
