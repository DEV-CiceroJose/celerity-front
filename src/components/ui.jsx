import { useId } from 'react'
import { CaretRight, MagnifyingGlass, Plus, SlidersHorizontal } from './icons'
import { Link } from 'react-router-dom'

export function Button({ as: Tag = 'button', className = '', variant = 'primary', icon: Icon, children, ...props }) {
  return (
    <Tag className={`button button--${variant} ${className}`} {...props}>
      {Icon && <Icon size={19} weight="bold" aria-hidden="true" />}
      <span>{children}</span>
    </Tag>
  )
}

export function StatusBadge({ children }) {
  const key = String(children).toLowerCase()
  let tone = 'neutral'
  if (/ativa|ativo|válida|pago|deferido|atendida|licenciado/.test(key)) tone = 'success'
  if (/pendente|aguardando|7 dias|30 dias|andamento|análise|convite/.test(key)) tone = 'warning'
  if (/vencida|vencido|excedido|indeferido/.test(key)) tone = 'danger'
  if (/exigência|atendimento/.test(key)) tone = 'info'
  const guidance = tone === 'danger' ? 'Situação crítica: revise o registro e defina uma ação.' : tone === 'warning' ? 'Atenção: acompanhe o prazo ou a próxima movimentação.' : tone === 'success' ? 'Situação regular ou concluída.' : tone === 'info' ? 'Registro em tratamento pela equipe.' : 'Situação informativa.'
  return <span className={`badge badge--${tone}`} title={guidance}><i aria-hidden="true" />{children}</span>
}

export function PageHeader({ eyebrow, title, description, actionLabel = 'Novo cadastro', actionTo, secondary }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-header__description">{description}</p>}
      </div>
      <div className="page-header__actions">
        {secondary}
        {actionTo && <Button as={Link} to={actionTo} icon={Plus}>{actionLabel}</Button>}
      </div>
    </div>
  )
}

export function Breadcrumb({ items = [] }) {
  return (
    <nav className="breadcrumb" aria-label="Navegação estrutural">
      <Link to="/app/dashboard">Visão geral</Link>
      {items.map((item, index) => (
        <span key={`${item}-${index}`}>
          <CaretRight size={13} aria-hidden="true" />
          <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item}</span>
        </span>
      ))}
    </nav>
  )
}

export function FilterBar({ placeholder, value, onChange, onToggleFilters, activeCount = 0, children }) {
  return (
    <div className="filter-bar">
      <label className="search-field">
        <MagnifyingGlass size={20} aria-hidden="true" />
        <span className="sr-only">Pesquisar</span>
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      </label>
      <button className={`filter-button ${activeCount ? 'is-active' : ''}`} type="button" onClick={onToggleFilters}><SlidersHorizontal size={20} /> Filtros {activeCount > 0 && <span className="filter-count">{activeCount}</span>}</button>
      {children}
    </div>
  )
}

export function Field({ label, error, hint, className = '', children, required = false }) {
  const id = useId()
  const descriptionId = `${id}-${error ? 'error' : 'hint'}`
  return (
    <label className={`field ${className}`} htmlFor={id}>
      <span className="field__label">{label}{required && <em> *</em>}</span>
      {typeof children === 'function' ? children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': error || hint ? descriptionId : undefined }) : children}
      {hint && !error && <small id={descriptionId}>{hint}</small>}
      {error && <small id={descriptionId} className="field__error">{error}</small>}
    </label>
  )
}

export function EmptyState({ title = 'Nenhum resultado encontrado', description = 'Revise os filtros aplicados ou faça um novo cadastro.' }) {
  return <div className="empty-state"><span>⌁</span><h3>{title}</h3><p>{description}</p></div>
}

export function Pagination({ count }) {
  return (
    <div className="pagination">
      <p>Exibindo <strong>{count}</strong> de <strong>{count}</strong> registros</p>
      <div><button disabled>Anterior</button><button className="is-active">1</button><button disabled>Próxima</button></div>
    </div>
  )
}
