import { useMemo, useState } from 'react'
import { ArrowLeft, CalendarBlank, Check, DownloadSimple, FileText, FloppyDisk, Plus, UploadSimple } from '@phosphor-icons/react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ResourceTable } from '../components/ResourceTable'
import { Breadcrumb, Button, Field, FilterBar, PageHeader, StatusBadge } from '../components/ui'
import { mockRows, resourceConfig } from '../data/mockData'

const singularTitle = (value) => value.charAt(0).toUpperCase() + value.slice(1)

export function ResourceListPage({ resource, tab }) {
  const [query, setQuery] = useState('')
  const config = resourceConfig[resource]
  const rows = mockRows[resource] || []
  const filtered = useMemo(() => rows.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(query.toLowerCase()))), [query, rows])
  const title = tab ? `${config.title} · ${tab}` : config.title

  return (
    <>
      <Breadcrumb items={[config.title, ...(tab ? [tab] : [])]} />
      <PageHeader title={title} description={config.description} actionLabel={`Novo ${config.singular}`} actionTo={`/app/${resource}/novo`} secondary={resource === 'licencas' ? <Button as={Link} to="/app/licencas/calendario" variant="secondary" icon={CalendarBlank}>Calendário</Button> : undefined} />
      {resource === 'pocos' && <div className="tabs" role="tablist">{[
        ['Todos', '/app/pocos'],
        ['Em acompanhamento', '/app/pocos/acompanhamento'],
        ['Licenciados', '/app/pocos/licenciados'],
        ['Indeferidos', '/app/pocos/indeferidos'],
        ['Em exigência', '/app/pocos/em-exigencia'],
      ].map(([item, path]) => <Link key={item} className={(!tab && item === 'Todos') || tab === item ? 'active' : ''} to={path}>{item}</Link>)}</div>}
      <FilterBar placeholder={config.search} value={query} onChange={setQuery}><Button variant="secondary" icon={DownloadSimple}>Exportar</Button></FilterBar>
      <ResourceTable rows={filtered} singular={config.singular} />
    </>
  )
}

export function ResourceFormPage({ resource }) {
  const config = resourceConfig[resource]
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [saved, setSaved] = useState(false)
  const submit = (event) => { event.preventDefault(); setSaved(true); setTimeout(() => navigate(`/app/${resource}`), 700) }

  return (
    <>
      <Breadcrumb items={[config.title, editing ? `Editar ${config.singular}` : `Novo ${config.singular}`]} />
      <PageHeader title={`${editing ? 'Editar' : 'Novo'} ${config.singular}`} description={`Preencha as informações do ${config.singular}. Campos marcados com * são obrigatórios.`} />
      {saved && <div className="success-banner"><Check size={19} weight="bold" /> Informações salvas com sucesso.</div>}
      <form className="resource-form" onSubmit={submit}>
        <section className="form-section"><div className="form-section__heading"><span>01</span><div><h2>Informações principais</h2><p>Dados de identificação e vínculo.</p></div></div><div className="form-section__fields"><div className="form-grid"><Field label={resource === 'usuarios' ? 'Nome completo' : resource === 'empresas' ? 'Razão social' : 'Empresa'} required>{({ id: fieldId }) => <input id={fieldId} required defaultValue={editing ? 'Eco Norte Indústria Ltda.' : ''} />}</Field><Field label={resource === 'empresas' ? 'CNPJ' : 'Número / identificação'} required>{({ id: fieldId }) => <input id={fieldId} required defaultValue={editing ? 'SEMACE 2026/004812' : ''} placeholder={resource === 'empresas' ? '00.000.000/0000-00' : 'Informe o número'} />}</Field></div><div className="form-grid"><Field label="Tipo / categoria" required>{({ id: fieldId }) => <select id={fieldId} defaultValue=""><option value="" disabled>Selecione</option><option>Licença de Operação</option><option>Licença Simplificada</option><option>Autorização</option><option>Documento técnico</option></select>}</Field><Field label="Status" required>{({ id: fieldId }) => <select id={fieldId} defaultValue="Em andamento"><option>Em andamento</option><option>Em análise</option><option>Pendente</option><option>Concluído</option></select>}</Field></div></div></section>
        <section className="form-section"><div className="form-section__heading"><span>02</span><div><h2>Responsabilidade e prazos</h2><p>Defina quem acompanha e as datas importantes.</p></div></div><div className="form-section__fields"><div className="form-grid"><Field label="Responsável" required>{({ id: fieldId }) => <select id={fieldId} defaultValue="Mariana Costa"><option>Mariana Costa</option><option>Ana Beatriz</option><option>Carlos Mendes</option><option>Rafael Lima</option></select>}</Field><Field label="Data de entrada">{({ id: fieldId }) => <input id={fieldId} type="date" />}</Field></div><Field label="Observações" hint="Inclua somente informações úteis ao acompanhamento.">{({ id: fieldId }) => <textarea id={fieldId} rows="5" placeholder="Descreva informações complementares…" />}</Field></div></section>
        <section className="form-section"><div className="form-section__heading"><span>03</span><div><h2>Documentos</h2><p>Anexe evidências e arquivos relacionados.</p></div></div><div className="form-section__fields"><label className="file-drop"><UploadSimple size={26} /><strong>Arraste os arquivos ou clique para selecionar</strong><span>PDF, DOCX, XLSX ou imagens · máximo de 20 MB</span><input type="file" multiple /></label></div></section>
        <div className="form-actions"><Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button><Button icon={FloppyDisk}>Salvar {config.singular}</Button></div>
      </form>
    </>
  )
}

export function ResourceDetailPage({ resource }) {
  const config = resourceConfig[resource]
  const { id } = useParams()
  const row = (mockRows[resource] || []).find((item) => String(item.id) === String(id)) || (mockRows[resource] || [])[0]
  if (!row) return null
  return (
    <>
      <Breadcrumb items={[config.title, row.primary]} />
      <Link className="back-link back-link--page" to={`/app/${resource}`}><ArrowLeft size={17} /> Voltar para {config.title.toLowerCase()}</Link>
      <PageHeader title={row.primary} description={row.secondary} actionLabel={`Editar ${config.singular}`} actionTo={`/app/${resource}/${id}/editar`} secondary={<Button variant="secondary" icon={DownloadSimple}>Exportar</Button>} />
      <div className="detail-summary"><div><span>Status</span><StatusBadge>{row.status}</StatusBadge></div><div><span>Responsável</span><strong>{row.owner}</strong></div><div><span>Tipo / vínculo</span><strong>{row.detail}</strong></div><div><span>Prazo / atualização</span><strong>{row.date}</strong></div></div>
      <div className="detail-grid"><section className="panel detail-card"><p className="eyebrow">Dados do registro</p><h2>Informações principais</h2><dl><div><dt>Empresa</dt><dd>{row.secondary}</dd></div><div><dt>Identificação</dt><dd>{row.primary}</dd></div><div><dt>Categoria</dt><dd>{row.detail}</dd></div><div><dt>Responsável</dt><dd>{row.owner}</dd></div><div><dt>Última atualização</dt><dd>{row.date}</dd></div><div><dt>Observações</dt><dd>Acompanhamento técnico dentro do fluxo regular.</dd></div></dl></section><aside className="panel timeline-card"><p className="eyebrow">Histórico</p><h2>Movimentações</h2><div className="timeline"><article><i /><div><strong>Status atualizado</strong><p>Registro movido para {row.status}.</p><time>Hoje, 09:42 · {row.owner}</time></div></article><article><i /><div><strong>Documento anexado</strong><p>Comprovante vinculado ao registro.</p><time>29 jul, 16:20</time></div></article><article><i /><div><strong>Registro criado</strong><p>Cadastro incluído no sistema.</p><time>18 jul, 10:08</time></div></article></div></aside></div>
    </>
  )
}

export function MonthlyControlPage() {
  return <><Breadcrumb items={['Controle mensal']} /><PageHeader title="Controle mensal" description="Visão consolidada da evolução dos processos em julho de 2026." actionLabel="Novo registro" actionTo="/app/processos/novo" secondary={<Button variant="secondary" icon={DownloadSimple}>Exportar relatório</Button>} /><div className="month-summary"><article><span>Entradas no mês</span><strong>32</strong><small>+8 em relação a junho</small></article><article><span>Protocolos concluídos</span><strong>26</strong><small>81% das entradas</small></article><article><span>Licenças emitidas</span><strong>18</strong><small>7 gerais · 11 poços</small></article></div><ResourceTable rows={mockRows.processos} singular="registro" /></>
}

export function CalendarPage() {
  const days = Array.from({ length: 35 }, (_, index) => index - 2)
  return <><Breadcrumb items={['Licenças', 'Calendário']} /><PageHeader title="Calendário de vencimentos" description="Licenças e prazos programados para agosto de 2026." actionLabel="Nova licença" actionTo="/app/licencas/novo" /><section className="panel calendar-panel"><div className="calendar-toolbar"><button>‹</button><h2>Agosto de 2026</h2><button>›</button></div><div className="calendar-week">{['DOM','SEG','TER','QUA','QUI','SEX','SÁB'].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{days.map((day, index) => <div key={index} className={day < 1 || day > 31 ? 'muted' : ''}><span>{day < 1 ? 31 + day : day > 31 ? day - 31 : day}</span>{day === 7 && <small className="event event--danger">LS 2025-0841</small>}{day === 22 && <small className="event event--warning">AUT 2025-991</small>}{day === 28 && <small className="event">LO 2024-448</small>}</div>)}</div></section></>
}
