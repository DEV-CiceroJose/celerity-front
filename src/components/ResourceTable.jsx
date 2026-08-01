import { DotsThree, Eye, PencilSimple, Trash } from '@phosphor-icons/react'
import { Link, useLocation } from 'react-router-dom'
import { EmptyState, Pagination, StatusBadge } from './ui'

export function ResourceTable({ rows, singular }) {
  const location = useLocation()
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
                <td><Link className="table-primary" to={`${basePath}/${row.id}`}>{row.primary}</Link><span>{row.secondary}</span></td>
                <td>{row.detail}</td>
                <td>{row.owner}</td>
                <td><StatusBadge>{row.status}</StatusBadge></td>
                <td>{row.date}</td>
                <td>
                  <div className="row-actions">
                    <Link to={`${basePath}/${row.id}`} aria-label={`Ver ${singular}`}><Eye size={19} /></Link>
                    <Link to={`${basePath}/${row.id}/editar`} aria-label={`Editar ${singular}`}><PencilSimple size={19} /></Link>
                    <button type="button" aria-label={`Mais ações para ${singular}`}><DotsThree size={21} weight="bold" /></button>
                    <button className="danger-action" type="button" aria-label={`Excluir ${singular}`}><Trash size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination count={rows.length} />
    </div>
  )
}
