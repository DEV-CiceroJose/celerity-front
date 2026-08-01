import { useState } from 'react'
import { Archive, CheckCircle, Copy, DotsThree, Eye, PencilSimple, UserSwitch } from '@phosphor-icons/react'
import { Link, useLocation } from 'react-router-dom'
import { EmptyState, Pagination, StatusBadge } from './ui'

export function ResourceTable({ rows, singular, onQuickAction, readOnly = false }) {
  const location = useLocation()
  const [activeMenu, setActiveMenu] = useState(null)
  const [confirmRow, setConfirmRow] = useState(null)
  const basePath = location.pathname.startsWith('/app/pocos/') ? '/app/pocos' : location.pathname.replace(/\/$/, '')
  if (!rows.length) return <EmptyState />

  return (
    <div className="table-shell">
      <div className="table-scroll">
        <table>
          <thead><tr><th>Identificação</th><th>Tipo / vínculo</th><th>Responsável</th><th>Status</th><th>Prazo / atualização</th><th><span className="sr-only">Ações</span></th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td data-label="Identificação"><Link className="table-primary" to={`${basePath}/${row.id}`}>{row.primary}</Link><span>{row.secondary}</span></td>
                <td data-label="Tipo / vínculo">{row.detail}</td>
                <td data-label="Responsável">{row.owner}</td>
                <td data-label="Status"><StatusBadge>{row.status}</StatusBadge></td>
                <td data-label="Prazo">{row.date}</td>
                <td data-label="Ações">
                  <div className="row-actions">
                    <Link to={`${basePath}/${row.id}`} aria-label={`Ver ${singular}`}><Eye size={19} /></Link>
                    {!readOnly && <Link to={`${basePath}/${row.id}/editar`} aria-label={`Editar ${singular}`}><PencilSimple size={19} /></Link>}
                    {!readOnly && <button type="button" aria-label={`Mais ações para ${singular}`} aria-expanded={activeMenu === row.id} onClick={() => setActiveMenu(activeMenu === row.id ? null : row.id)}><DotsThree size={21} weight="bold" /></button>}
                    {activeMenu === row.id && <div className="quick-menu"><button onClick={() => { onQuickAction?.('assign', row); setActiveMenu(null) }}><UserSwitch size={17} />Atribuir a mim</button><button onClick={() => { onQuickAction?.('complete', row); setActiveMenu(null) }}><CheckCircle size={17} />Marcar como concluído</button><button onClick={() => { onQuickAction?.('duplicate', row); setActiveMenu(null) }}><Copy size={17} />Duplicar registro</button><button className="danger" onClick={() => { setConfirmRow(row); setActiveMenu(null) }}><Archive size={17} />Arquivar</button></div>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination count={rows.length} />
      {confirmRow && <div className="confirm-overlay"><section className="confirm-card" role="alertdialog" aria-modal="true"><span><Archive size={24} /></span><h3>Arquivar {singular}?</h3><p><strong>{confirmRow.primary}</strong> deixará de aparecer nas listagens ativas, mas poderá ser restaurado posteriormente.</p><div><button onClick={() => setConfirmRow(null)}>Cancelar</button><button className="confirm-danger" onClick={() => { onQuickAction?.('archive', confirmRow); setConfirmRow(null) }}>Arquivar registro</button></div></section></div>}
    </div>
  )
}
