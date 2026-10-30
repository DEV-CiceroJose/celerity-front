import { countedDays, daysBetween, formatDate, remainingLabel } from './dates.js'
import { LICENSE_REMINDER_DAYS } from './config.js'

export function licenseStatus(expiry, today) {
  const remaining = daysBetween(today, expiry)
  if (remaining === null) return 'Data não informada'
  if (remaining < 0) return 'Vencida'
  if (remaining === 0) return 'Vence hoje'
  if (remaining <= LICENSE_REMINDER_DAYS) return `Vence em ${remaining} ${remaining === 1 ? 'dia' : 'dias'}`
  return 'Válida'
}

export function presentRow(resource, row, today) {
  const start = row.dataInicio || row.dataEntrada || row.dataEmissao
  const end = row.dataConclusao || row.dataAtendimento || row.dataPagamento
  const diasContados = countedDays(start, today, end)
  const due = row.dataVencimento || row.prazo || row.vencimento
  let status = row.status
  if (resource === 'licencas' && !['Cancelada', 'Substituída', 'Arquivada'].includes(row.status)) status = licenseStatus(row.dataVencimento, today)
  let date = row.date
  if (due) date = `${formatDate(due)} · ${remainingLabel(due, today)}`
  if (end) date = `Concluído: ${formatDate(end)}`
  if (diasContados !== null) date = `${date || formatDate(start)} · ${diasContados} dias contados`
  return { ...row, status, date, diasContados }
}

export function licenseAlerts(rows, today) {
  return rows.flatMap((row) => {
    if (['Cancelada', 'Substituída', 'Arquivada'].includes(row.status)) return []
    const days = daysBetween(today, row.dataVencimento)
    if (days === null || days > LICENSE_REMINDER_DAYS) return []
    return [{
      id: `licenca-${row.id}-${row.dataVencimento}-${days < 0 ? 'vencida' : 'renovar'}`,
      category: 'Licenças', title: days < 0 ? 'Licença vencida: solicite a renovação' : 'Solicite a renovação da licença',
      text: `${row.primary} — ${row.secondary}. ${remainingLabel(row.dataVencimento, today)} (${formatDate(row.dataVencimento)}). Solicite uma nova licença ao órgão responsável.`,
      time: `Verificado em ${formatDate(today)} · Brasília`, href: `/app/licencas/${row.id}`, read: false,
    }]
  })
}
