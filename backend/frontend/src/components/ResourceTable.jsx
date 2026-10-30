import { useEffect, useMemo, useState } from 'react'
import { Archive, ArrowsDownUp, CaretDown, CheckCircle, Columns, Copy, DotsThree, Eye, PencilSimple, UserSwitch } from './icons'
import { Link, useLocation } from 'react-router-dom'
import { EmptyState, StatusBadge } from './ui'

const columnDefinitions = [
  { key: 'primary', label: 'Identificação' },
  { key: 'detail', label: 'Tipo / vínculo' },
  { key: 'owner', label: 'Responsável' },
  { key: 'status', label: 'Status' },
  { key: 'date', label: 'Prazo / atualização' },
]

export function ResourceTable({ rows, singular, onQuickAction, readOnly = false }) {
  const location = useLocation()
  const basePath = location.pathname.startsWith('/app/pocos/') ? '/app/pocos' : location.pathname.replace(/\/$/, '')
  const storageKey = `celerity_table_columns_${basePath}`
  const [activeMenu, setActiveMenu] = useState(null)
  const [confirmRow, setConfirmRow] = useState(null)
  const [selected, setSelected] = useState([])
  const [sort, setSort] = useState({ key: 'primary', direction: 'asc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState(() => JSON.parse(localStorage.getItem(storageKey) || 'null') || columnDefinitions.map((item) => item.key))

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(visibleColumns)) }, [storageKey, visibleColumns])
  useEffect(() => { setPage(1); setSelected([]) }, [rows])

  const sortedRows = useMemo(() => [...rows].sort((a, b) => {
    const first = String(a[sort.key] || '').localeCompare(String(b[sort.key] || ''), 'pt-BR', { numeric: true })
    return sort.direction === 'asc' ? first : -first
  }), [rows, sort])
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize))
  const displayedRows = sortedRows.slice((page - 1) * pageSize, page * pageSize)
  const selectedRows = rows.filter((row) => selected.includes(row.id))
  const allDisplayedSelected = displayedRows.length > 0 && displayedRows.every((row) => selected.includes(row.id))
  const isVisible = (key) => visibleColumns.includes(key)

  const changeSort = (key) => setSort((current) => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }))
  const toggleRow = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const toggleDisplayed = () => setSelected((current) => allDisplayedSelected ? current.filter((id) => !displayedRows.some((row) => row.id === id)) : [...new Set([...current, ...displayedRows.map((row) => row.id)])])
  const toggleColumn = (key) => setVisibleColumns((current) => current.includes(key) ? (current.length === 1 ? current : current.filter((item) => item !== key)) : [...current, key])
  const runBulk = (action) => {
    selectedRows.forEach((row) => onQuickAction?.(action, row))
    setSelected([])
  }
  const confirmArchive = () => {
    if (confirmRow?._bulk) runBulk('archive')
    else onQuickAction?.('archive', confirmRow)
    setConfirmRow(null)
  }

  if (!rows.length) return <EmptyState />

  return <>
    <div className="table-productivity">
      {selected.length > 0 ? <div className="bulk-actions" role="toolbar" aria-label="Ações em lote"><strong>{selected.length} selecionado(s)</strong><button onClick={() => runBulk('assign')}><UserSwitch size={17} />Atribuir a mim</button><button onClick={() => runBulk('complete')}><CheckCircle size={17} />Concluir</button><button className="danger" onClick={() => setConfirmRow({ _bulk: true, primary: `${selected.length} registros` })}><Archive size={17} />Arquivar</button><button onClick={() => setSelected([])}>Cancelar</button></div> : <span>Selecione registros para realizar ações em lote.</span>}
      <div className="table-view-tools"><label>Por página<select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}><option value="5">5</option><option value="10">10</option><option value="20">20</option></select></label><div><button type="button" aria-expanded={columnsOpen} onClick={() => setColumnsOpen(!columnsOpen)}><Columns size={17} />Colunas <CaretDown size={14} /></button>{columnsOpen && <div className="column-menu">{columnDefinitions.map((column) => <label key={column.key}><input type="checkbox" checked={isVisible(column.key)} onChange={() => toggleColumn(column.key)} />{column.label}</label>)}</div>}</div></div>
    </div>
    <div className="table-shell">
      <div className="table-scroll">
        <table>
          <thead><tr>{!readOnly && <th className="selection-cell"><input type="checkbox" checked={allDisplayedSelected} onChange={toggleDisplayed} aria-label="Selecionar registros desta página" /></th>}{columnDefinitions.filter((column) => isVisible(column.key)).map((column) => <th key={column.key} aria-sort={sort.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}><button className={sort.key === column.key ? 'active' : ''} onClick={() => changeSort(column.key)}>{column.label}<ArrowsDownUp size={14} /></button></th>)}<th><span className="sr-only">Ações</span></th></tr></thead>
          <tbody>{displayedRows.map((row) => <tr key={row.id} className={selected.includes(row.id) ? 'is-selected' : ''}>
            {!readOnly && <td className="selection-cell" data-label="Selecionar"><input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleRow(row.id)} aria-label={`Selecionar ${row.primary}`} /></td>}
            {isVisible('primary') && <td data-label="Identificação"><Link className="table-primary" to={`${basePath}/${row.id}`}>{row.primary}</Link><span>{row.secondary}</span></td>}
            {isVisible('detail') && <td data-label="Tipo / vínculo">{row.detail}</td>}
            {isVisible('owner') && <td data-label="Responsável">{row.owner}</td>}
            {isVisible('status') && <td data-label="Status"><StatusBadge>{row.status}</StatusBadge></td>}
            {isVisible('date') && <td data-label="Prazo">{row.date}</td>}
            <td data-label="Ações"><div className="row-actions"><Link to={`${basePath}/${row.id}`} aria-label={`Ver ${singular}`}><Eye size={19} /></Link>{!readOnly && <Link to={`${basePath}/${row.id}/editar`} aria-label={`Editar ${singular}`}><PencilSimple size={19} /></Link>}{!readOnly && <button type="button" aria-label={`Mais ações para ${singular}`} aria-expanded={activeMenu === row.id} onClick={() => setActiveMenu(activeMenu === row.id ? null : row.id)}><DotsThree size={21} weight="bold" /></button>}{activeMenu === row.id && <div className="quick-menu"><button onClick={() => { onQuickAction?.('assign', row); setActiveMenu(null) }}><UserSwitch size={17} />Atribuir a mim</button><button onClick={() => { onQuickAction?.('complete', row); setActiveMenu(null) }}><CheckCircle size={17} />Marcar como concluído</button><button onClick={() => { onQuickAction?.('duplicate', row); setActiveMenu(null) }}><Copy size={17} />Duplicar registro</button><button className="danger" onClick={() => { setConfirmRow(row); setActiveMenu(null) }}><Archive size={17} />Arquivar</button></div>}</div></td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="table-pagination"><p>Exibindo <strong>{(page - 1) * pageSize + 1}</strong>–<strong>{Math.min(page * pageSize, sortedRows.length)}</strong> de <strong>{sortedRows.length}</strong></p><div><button disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Anterior</button><span>{page} de {pageCount}</span><button disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>Próxima</button></div></div>
      {confirmRow && <div className="confirm-overlay"><section className="confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="archive-title"><span><Archive size={24} /></span><h3 id="archive-title">Arquivar {confirmRow._bulk ? 'registros selecionados' : singular}?</h3><p><strong>{confirmRow.primary}</strong> deixará de aparecer nas listagens ativas, mas poderá ser restaurado posteriormente.</p><div><button onClick={() => setConfirmRow(null)}>Cancelar</button><button className="confirm-danger" onClick={confirmArchive}>Arquivar</button></div></section></div>}
    </div>
  </>
}
