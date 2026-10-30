export const BRASILIA_TIME_ZONE = 'America/Sao_Paulo'
const DAY_MS = 86_400_000

export function brasiliaDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: BRASILIA_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const get = (type) => parts.find((part) => part.type === type).value
  return `${get('year')}-${get('month')}-${get('day')}`
}

function dayNumber(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null
  const timestamp = Date.parse(`${value}T00:00:00Z`)
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) return null
  return timestamp / DAY_MS
}

export function daysBetween(start, end) {
  const first = dayNumber(start)
  const last = dayNumber(end)
  return first === null || last === null ? null : last - first
}

// Dias corridos: o dia de entrada é zero; a contagem muda à meia-noite de Brasília.
export function countedDays(start, today = brasiliaDate(), end) {
  const days = daysBetween(start, end && end < today ? end : today)
  return days === null ? null : Math.max(0, days)
}

export function remainingLabel(date, today = brasiliaDate()) {
  const days = daysBetween(today, date)
  if (days === null) return 'Data não informada'
  if (days === 0) return 'Vence hoje'
  const amount = Math.abs(days)
  const unit = amount === 1 ? 'dia' : 'dias'
  return days < 0 ? `Venceu há ${amount} ${unit}` : `${amount} ${unit} ${amount === 1 ? 'restante' : 'restantes'}`
}

export function formatDate(value) {
  return dayNumber(value) === null ? '—' : new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
}

export function brasiliaCalendarDate(now = new Date()) {
  const [year, month, day] = brasiliaDate(now).split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}
