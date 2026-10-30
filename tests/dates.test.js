import test from 'node:test'
import assert from 'node:assert/strict'
import { brasiliaDate, countedDays, daysBetween, remainingLabel } from '../src/utils/dates.js'
import { licenseAlerts, licenseStatus, presentRow } from '../src/utils/resources.js'
import { reminderDays } from '../src/utils/config.js'

test('a data muda à meia-noite de Brasília, independente do fuso da máquina', () => {
  assert.equal(brasiliaDate(new Date('2026-10-30T02:59:59Z')), '2026-10-29')
  assert.equal(brasiliaDate(new Date('2026-10-30T03:00:00Z')), '2026-10-30')
})
test('contagem cobre mesmo dia, virada do mês, ano bissexto e conclusão', () => {
  assert.equal(countedDays('2026-10-29', '2026-10-29'), 0)
  assert.equal(countedDays('2026-09-30', '2026-10-01'), 1)
  assert.equal(daysBetween('2024-02-28', '2024-03-01'), 2)
  assert.equal(countedDays('2026-10-01', '2026-10-29', '2026-10-10'), 9)
  assert.equal(countedDays('2026-11-01', '2026-10-29'), 0)
  assert.equal(countedDays('', '2026-10-29'), null)
  assert.equal(daysBetween('2026-02-30', '2026-03-01'), null)
})
test('rótulos não mostram dias negativos e diferenciam hoje e vencidos', () => {
  assert.equal(remainingLabel('2026-10-29', '2026-10-29'), 'Vence hoje')
  assert.equal(remainingLabel('2026-10-28', '2026-10-29'), 'Venceu há 1 dia')
  assert.equal(remainingLabel('2026-10-30', '2026-10-29'), '1 dia restante')
})
test('antecedência configurável respeita mínimo de 60 dias', () => {
  for (const value of [undefined, '', 'all', 'NaN', '59', '60.5', '-1']) assert.equal(reminderDays(value), 60)
  assert.equal(reminderDays('90'), 90)
})
test('alertas incluem limite de 60 dias, hoje e vencidas, excluem 61 dias e datas inválidas', () => {
  const rows = ['2026-12-28', '2026-12-29', '2026-10-29', '2026-10-28', 'invalid'].map((dataVencimento, id) => ({ id, dataVencimento, primary: 'LO', secondary: 'Empresa' }))
  const alerts = licenseAlerts(rows, '2026-10-29')
  assert.equal(alerts.length, 3)
  assert.equal(licenseStatus('2026-12-28', '2026-10-29'), 'Vence em 60 dias')
  assert.equal(licenseStatus('2026-12-29', '2026-10-29'), 'Válida')
  assert.equal(licenseStatus('2026-10-29', '2026-10-29'), 'Vence hoje')
  assert.equal(licenseStatus('2026-10-28', '2026-10-29'), 'Vencida')
  assert.notEqual(alerts[0].id, licenseAlerts([{ ...rows[0], dataVencimento: '2026-12-27' }], '2026-10-29')[0].id)
  assert.notEqual(licenseAlerts([rows[2]], '2026-10-29')[0].id, licenseAlerts([rows[2]], '2026-10-30')[0].id)
})
test('listagem recalcula dias e situação a partir dos campos de data, preservando conclusão', () => {
  const row = { dataEmissao: '2026-10-01', dataVencimento: '2026-10-29', status: 'Válida' }
  assert.equal(presentRow('licencas', row, '2026-10-29').status, 'Vence hoje')
  assert.equal(presentRow('licencas', row, '2026-10-30').diasContados, 29)
  const completed = presentRow('exigencias', { dataEntrada: '2026-10-01', dataAtendimento: '2026-10-05', prazo: '2026-10-10', status: 'Atendida' }, '2026-10-29')
  assert.equal(completed.diasContados, 4)
  assert.ok(!completed.date.includes('Venceu'))
})

test('licenças canceladas ou substituídas não geram lembretes', () => {
  const rows = ['Cancelada', 'Substituída', 'Arquivada'].map((status, id) => ({ id, status, dataVencimento: '2026-11-01' }))
  assert.equal(licenseAlerts(rows, '2026-10-29').length, 0)
  assert.equal(presentRow('licencas', rows[0], '2026-10-29').status, 'Cancelada')
})
