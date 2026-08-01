import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, BookmarkSimple, CalendarBlank, ChatCircleText, Check, Clock,
  DownloadSimple, FileText, FloppyDisk, Funnel, Paperclip, Plus, UploadSimple, UserCircle,
} from '@phosphor-icons/react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ErrorState, LoadingState, PermissionNotice, SuccessToast } from '../components/Experience'
import { ResourceTable } from '../components/ResourceTable'
import { Breadcrumb, Button, EmptyState, Field, FilterBar, PageHeader, StatusBadge } from '../components/ui'
import { mockRows, resourceConfig } from '../data/mockData'
import { authService } from '../services/authService'

const people = ['Mariana Costa', 'Ana Beatriz', 'Carlos Mendes', 'Rafael Lima']
const companyOptions = ['Eco Norte Indústria Ltda.', 'Construtora Horizonte S.A.', 'Agrovale Empreendimentos', 'Águas do Sertão SPE']
const licenseTypes = ['LP', 'LI', 'LO', 'LS', 'ASV', 'AUT', 'RLO', 'LI + LO', 'LP + LI', 'LP + LI + LO']
const processStatuses = ['Em andamento', 'Em análise', 'Em exigência', 'Deferido', 'Indeferido', 'Prazo expirado', 'Licença liberada']

const field = (name, label, type = 'text', extra = {}) => ({ name, label, type, ...extra })

const formSchemas = {
  empresas: [
    { title: 'Identificação da empresa', description: 'Dados jurídicos e situação cadastral.', fields: [field('razaoSocial', 'Razão social', 'text', { required: true }), field('nomeFantasia', 'Nome fantasia'), field('cnpj', 'CNPJ', 'cnpj', { required: true }), field('status', 'Status', 'select', { required: true, options: ['Ativa', 'Pendente', 'Inativa'] })] },
    { title: 'Contato e localização', description: 'Canais usados no acompanhamento.', fields: [field('email', 'E-mail', 'email', { required: true }), field('telefone', 'Telefone', 'phone', { required: true }), field('responsavel', 'Contato responsável', 'text', { required: true }), field('endereco', 'Endereço completo')] },
    { title: 'Contexto do cliente', description: 'Informações importantes para a equipe.', fields: [field('observacoes', 'Observações', 'textarea', { full: true })] },
  ],
  processos: [
    { title: 'Identificação do processo', description: 'Empresa, protocolo e tipo de licença.', fields: [field('empresa', 'Empresa', 'select', { required: true, options: companyOptions }), field('cnpj', 'CNPJ', 'cnpj', { required: true }), field('numero', 'Número do processo', 'text', { required: true, placeholder: 'SEMACE 2026/000000' }), field('tipoLicenca', 'Tipo de licença', 'select', { required: true, options: licenseTypes })] },
    { title: 'Acompanhamento', description: 'Situação, setor e responsabilidade.', fields: [field('status', 'Status', 'select', { required: true, options: processStatuses }), field('setor', 'Setor atual', 'select', { options: ['Protocolo', 'Análise técnica', 'Jurídico', 'Emissão'] }), field('responsavel', 'Responsável', 'select', { required: true, options: people }), field('dataInicio', 'Data de início', 'date', { required: true }), field('solicitante', 'Solicitante'), field('telefone', 'Telefone', 'phone')] },
    { title: 'Escopo e observações', description: 'Descrição técnica e contexto operacional.', fields: [field('descricao', 'Descrição do processo', 'textarea', { required: true, full: true }), field('observacoes', 'Observações internas', 'textarea', { full: true })] },
  ],
  pocos: [
    { title: 'Dados do poço', description: 'Identificação da demanda e do empreendimento.', fields: [field('empresa', 'Empresa', 'select', { required: true, options: companyOptions }), field('cnpj', 'CNPJ', 'cnpj', { required: true }), field('numero', 'Número do processo', 'text', { required: true }), field('identificacao', 'Identificação do poço', 'text', { required: true })] },
    { title: 'Situação operacional', description: 'Andamento, exigências e prazos.', fields: [field('situacao', 'Situação', 'select', { required: true, options: ['Em análise', 'Em exigência', 'Licenciado', 'Indeferido', 'Paralisado'] }), field('exigencia', 'Condição da exigência', 'select', { options: ['Sem exigência', 'Pendente', 'Atendida'] }), field('responsavel', 'Responsável', 'select', { required: true, options: people }), field('dataEntrada', 'Data de entrada', 'date', { required: true }), field('prazo', 'Prazo para atendimento', 'date'), field('telefone', 'Telefone do solicitante', 'phone')] },
    { title: 'Informações técnicas', description: 'Dados complementares para acompanhamento.', fields: [field('descricao', 'Descrição técnica', 'textarea', { full: true })] },
  ],
  licencas: [
    { title: 'Identificação da licença', description: 'Vínculo com empresa e processo.', fields: [field('empresa', 'Empresa', 'select', { required: true, options: companyOptions }), field('processo', 'Processo vinculado', 'text', { required: true }), field('tipo', 'Tipo de licença', 'select', { required: true, options: licenseTypes }), field('numero', 'Número da licença', 'text', { required: true })] },
    { title: 'Vigência', description: 'Emissão, vencimento e situação atual.', fields: [field('dataEmissao', 'Data de emissão', 'date', { required: true }), field('dataVencimento', 'Data de vencimento', 'date', { required: true }), field('status', 'Situação', 'select', { required: true, options: ['Válida', 'Vence em 30 dias', 'Vence em 7 dias', 'Vencida'] }), field('responsavel', 'Responsável', 'select', { required: true, options: people })] },
    { title: 'Condicionantes', description: 'Obrigações vinculadas à licença.', fields: [field('condicionantes', 'Condicionantes e observações', 'textarea', { full: true })] },
  ],
  exigencias: [
    { title: 'Dados da exigência', description: 'Processo, empresa e descrição da pendência.', fields: [field('empresa', 'Empresa', 'select', { required: true, options: companyOptions }), field('processo', 'Processo', 'text', { required: true }), field('descricao', 'Descrição da exigência', 'textarea', { required: true, full: true })] },
    { title: 'Prazo e atendimento', description: 'Responsabilidade e situação da resposta.', fields: [field('dataEntrada', 'Data de entrada', 'date', { required: true }), field('prazo', 'Prazo', 'date', { required: true }), field('responsavel', 'Responsável', 'select', { required: true, options: people }), field('status', 'Status', 'select', { required: true, options: ['Pendente', 'Em atendimento', 'Atendida', 'Vencida', 'Cancelada'] }), field('dataAtendimento', 'Data de atendimento', 'date'), field('resposta', 'Resposta apresentada', 'textarea', { full: true })] },
  ],
  pagamentos: [
    { title: 'Cobrança', description: 'Dados da empresa e da solicitação.', fields: [field('empresa', 'Empresa', 'select', { required: true, options: companyOptions }), field('cnpj', 'CNPJ', 'cnpj', { required: true }), field('solicitacao', 'Número da solicitação', 'text', { required: true }), field('tipoProcesso', 'Tipo de processo', 'text', { required: true })] },
    { title: 'Pagamento', description: 'Valor, vencimento e conciliação.', fields: [field('valor', 'Valor', 'currency', { required: true }), field('vencimento', 'Vencimento do boleto', 'date', { required: true }), field('situacao', 'Situação', 'select', { required: true, options: ['Aguardando pagamento', 'Pago', 'Prazo excedido'] }), field('dataPagamento', 'Data do pagamento', 'date')] },
  ],
  assessoria: [
    { title: 'Licença acompanhada', description: 'Empresa, licença e obrigação.', fields: [field('empresa', 'Empresa', 'select', { required: true, options: companyOptions }), field('cnpj', 'CNPJ', 'cnpj', { required: true }), field('numeroLicenca', 'Número da licença', 'text', { required: true }), field('exigencia', 'Exigência ou condicionante', 'textarea', { required: true, full: true })] },
    { title: 'Acompanhamento', description: 'Responsável e situação da obrigação.', fields: [field('dataEmissao', 'Data de emissão', 'date', { required: true }), field('responsavel', 'Responsável', 'select', { required: true, options: people }), field('situacao', 'Situação', 'select', { required: true, options: ['Pendente', 'Em andamento', 'Concluída'] }), field('prazo', 'Prazo', 'date')] },
  ],
  documentos: [
    { title: 'Classificação', description: 'Nome, categoria e vínculo do arquivo.', fields: [field('titulo', 'Título do documento', 'text', { required: true }), field('categoria', 'Categoria', 'select', { required: true, options: ['Licença', 'Relatório', 'Boleto', 'Comprovante', 'Protocolo', 'Parecer', 'Documento técnico', 'Outros'] }), field('empresa', 'Empresa', 'select', { required: true, options: companyOptions }), field('processo', 'Processo ou licença vinculada')] },
    { title: 'Controle documental', description: 'Responsabilidade e observações.', fields: [field('responsavel', 'Responsável', 'select', { required: true, options: people }), field('dataDocumento', 'Data do documento', 'date'), field('observacoes', 'Observações', 'textarea', { full: true })] },
  ],
  usuarios: [
    { title: 'Dados do usuário', description: 'Identificação e contato profissional.', fields: [field('nome', 'Nome completo', 'text', { required: true }), field('email', 'E-mail profissional', 'email', { required: true }), field('telefone', 'Telefone', 'phone'), field('cargo', 'Cargo')] },
    { title: 'Acesso e permissões', description: 'Perfil e módulos disponíveis.', fields: [field('perfil', 'Perfil', 'select', { required: true, options: ['Administrador', 'Gestor', 'Técnico', 'Administrativo', 'Financeiro', 'Somente leitura'] }), field('status', 'Status', 'select', { required: true, options: ['Ativo', 'Convite enviado', 'Inativo'] }), field('modulos', 'Módulos permitidos', 'select', { required: true, options: ['Todos os módulos', 'Processos e licenças', 'Poços e exigências', 'Financeiro', 'Somente consulta'] })] },
  ],
}

const genericSchema = [
  { title: 'Informações principais', description: 'Dados de identificação e vínculo.', fields: [field('empresa', 'Empresa', 'select', { required: true, options: companyOptions }), field('numero', 'Número / identificação', 'text', { required: true }), field('status', 'Status', 'select', { required: true, options: processStatuses }), field('responsavel', 'Responsável', 'select', { required: true, options: people })] },
  { title: 'Observações', description: 'Contexto adicional do registro.', fields: [field('observacoes', 'Observações', 'textarea', { full: true })] },
]

function maskCnpj(value) {
  return value.replace(/\D/g, '').slice(0, 14).replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2')
}

function maskPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{4})$/, '$1-$2')
}

function maskCurrency(value) {
  const amount = Number(value.replace(/\D/g, '')) / 100
  return amount ? amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''
}

function InputForField({ definition, value, error, onChange }) {
  const update = (nextValue) => {
    if (definition.type === 'cnpj') return onChange(maskCnpj(nextValue))
    if (definition.type === 'phone') return onChange(maskPhone(nextValue))
    if (definition.type === 'currency') return onChange(maskCurrency(nextValue))
    onChange(nextValue)
  }
  return <Field label={definition.label} required={definition.required} error={error} hint={definition.hint} className={definition.full ? 'field--full' : ''}>{({ id }) => {
    if (definition.type === 'select') return <select id={id} value={value || ''} onChange={(event) => update(event.target.value)}><option value="">Selecione</option>{definition.options.map((option) => <option key={option}>{option}</option>)}</select>
    if (definition.type === 'textarea') return <textarea id={id} rows="5" value={value || ''} onChange={(event) => update(event.target.value)} placeholder={definition.placeholder} />
    return <input id={id} type={['date', 'email'].includes(definition.type) ? definition.type : 'text'} value={value || ''} onChange={(event) => update(event.target.value)} placeholder={definition.placeholder || (definition.type === 'cnpj' ? '00.000.000/0000-00' : definition.type === 'phone' ? '(85) 99999-0000' : '')} />
  }}</Field>
}

export function ResourceListPage({ resource, tab }) {
  const config = resourceConfig[resource]
  const session = authService.getSession()
  const readOnly = session?.role === 'Somente leitura'
  const storageKey = `celerity_filters_${resource}`
  const initialFilters = JSON.parse(localStorage.getItem(storageKey) || '{}')
  const [query, setQuery] = useState(initialFilters.query || '')
  const [status, setStatus] = useState(initialFilters.status || '')
  const [owner, setOwner] = useState(initialFilters.owner || '')
  const [filterOpen, setFilterOpen] = useState(false)
  const [viewName, setViewName] = useState('')
  const [savedViews, setSavedViews] = useState(() => JSON.parse(localStorage.getItem(`celerity_views_${resource}`) || '[]'))
  const [rows, setRows] = useState(mockRows[resource] || [])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    setLoading(true)
    const timer = window.setTimeout(() => setLoading(false), 320)
    return () => window.clearTimeout(timer)
  }, [resource, tab])
  useEffect(() => localStorage.setItem(storageKey, JSON.stringify({ query, status, owner })), [query, status, owner, storageKey])

  const statuses = [...new Set(rows.map((row) => row.status))]
  const owners = [...new Set(rows.map((row) => row.owner))]
  const filtered = useMemo(() => rows.filter((row) => {
    const matchesQuery = Object.values(row).some((value) => String(value).toLowerCase().includes(query.toLowerCase()))
    return matchesQuery && (!status || row.status === status) && (!owner || row.owner === owner)
  }), [query, status, owner, rows])
  const title = tab ? `${config.title} · ${tab}` : config.title
  const activeCount = Number(Boolean(status)) + Number(Boolean(owner))

  const saveView = () => {
    if (!viewName.trim()) return
    const next = [...savedViews.filter((item) => item.name !== viewName.trim()), { name: viewName.trim(), query, status, owner }]
    setSavedViews(next)
    localStorage.setItem(`celerity_views_${resource}`, JSON.stringify(next))
    setViewName('')
    setToast('Visão salva e disponível neste dispositivo.')
  }
  const quickAction = (action, row) => {
    if (action === 'assign') setRows((current) => current.map((item) => item.id === row.id ? { ...item, owner: session?.name || 'Você' } : item))
    if (action === 'complete') setRows((current) => current.map((item) => item.id === row.id ? { ...item, status: 'Concluído' } : item))
    if (action === 'duplicate') setRows((current) => [{ ...row, id: `${row.id}-copia`, primary: `${row.primary} · cópia` }, ...current])
    if (action === 'archive') setRows((current) => current.filter((item) => item.id !== row.id))
    const messages = { assign: 'Registro atribuído a você.', complete: 'Status atualizado para concluído.', duplicate: 'Uma cópia do registro foi criada.', archive: 'Registro arquivado com possibilidade de restauração.' }
    setToast(messages[action])
  }

  return <>
    <Breadcrumb items={[config.title, ...(tab ? [tab] : [])]} />
    <PageHeader title={title} description={config.description} actionLabel={`Novo ${config.singular}`} actionTo={readOnly ? undefined : `/app/${resource}/novo`} secondary={resource === 'licencas' ? <Button as={Link} to="/app/licencas/calendario" variant="secondary" icon={CalendarBlank}>Calendário unificado</Button> : undefined} />
    <PermissionNotice readOnly={readOnly} />
    {resource === 'pocos' && <div className="tabs" role="tablist">{[['Todos', '/app/pocos'], ['Em acompanhamento', '/app/pocos/acompanhamento'], ['Licenciados', '/app/pocos/licenciados'], ['Indeferidos', '/app/pocos/indeferidos'], ['Em exigência', '/app/pocos/em-exigencia']].map(([item, path]) => <Link key={item} className={(!tab && item === 'Todos') || tab === item ? 'active' : ''} to={path}>{item}</Link>)}</div>}
    {savedViews.length > 0 && <div className="saved-views"><span><BookmarkSimple size={17} />Visões salvas</span>{savedViews.map((view) => <button key={view.name} onClick={() => { setQuery(view.query); setStatus(view.status); setOwner(view.owner) }}>{view.name}</button>)}</div>}
    <FilterBar placeholder={config.search} value={query} onChange={setQuery} onToggleFilters={() => setFilterOpen(!filterOpen)} activeCount={activeCount}><Button variant="secondary" icon={DownloadSimple} onClick={() => setToast('Exportação preparada com os filtros atuais.')}>Exportar</Button></FilterBar>
    {filterOpen && <section className="advanced-filters"><div><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos os status</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><label>Responsável<select value={owner} onChange={(event) => setOwner(event.target.value)}><option value="">Todos os responsáveis</option>{owners.map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="save-view"><input value={viewName} onChange={(event) => setViewName(event.target.value)} placeholder="Nome da nova visão" /><button onClick={saveView}><BookmarkSimple size={17} />Salvar visão</button><button onClick={() => { setStatus(''); setOwner(''); setQuery('') }}>Limpar filtros</button></div></section>}
    {loading ? <LoadingState /> : loadError ? <ErrorState onRetry={() => { setLoadError(false); setLoading(true); window.setTimeout(() => setLoading(false), 300) }} /> : <ResourceTable rows={filtered} singular={config.singular} onQuickAction={quickAction} readOnly={readOnly} />}
    <SuccessToast message={toast} onClose={() => setToast('')} />
  </>
}

export function ResourceFormPage({ resource }) {
  const config = resourceConfig[resource]
  const schema = formSchemas[resource] || genericSchema
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const draftKey = `celerity_draft_${resource}_${id || 'new'}`
  const [values, setValues] = useState(() => JSON.parse(localStorage.getItem(draftKey) || '{}'))
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)
  const readOnly = authService.getSession()?.role === 'Somente leitura'

  useEffect(() => {
    if (!dirty) return undefined
    const timer = window.setTimeout(() => localStorage.setItem(draftKey, JSON.stringify(values)), 450)
    return () => window.clearTimeout(timer)
  }, [values, dirty, draftKey])

  const update = (name, value) => { setValues((current) => ({ ...current, [name]: value })); setErrors((current) => ({ ...current, [name]: '' })); setDirty(true) }
  const validate = () => {
    const next = {}
    schema.flatMap((section) => section.fields).forEach((item) => {
      if (item.required && !String(values[item.name] || '').trim()) next[item.name] = 'Este campo é obrigatório.'
      if (item.type === 'cnpj' && values[item.name] && values[item.name].length !== 18) next[item.name] = 'Informe um CNPJ completo.'
      if (item.type === 'phone' && values[item.name] && values[item.name].replace(/\D/g, '').length < 10) next[item.name] = 'Informe um telefone válido.'
    })
    if (!editing && ['processos', 'pocos'].includes(resource) && values.numero && (mockRows[resource] || []).some((row) => row.primary.toLowerCase().includes(values.numero.toLowerCase()))) next.numero = 'Já existe um registro com este número.'
    if (values.dataEmissao && values.dataVencimento && values.dataVencimento <= values.dataEmissao) next.dataVencimento = 'O vencimento deve ser posterior à emissão.'
    setErrors(next)
    return Object.keys(next).length === 0
  }
  const submit = (event) => {
    event.preventDefault()
    if (!validate()) { document.querySelector('[aria-invalid="true"]')?.focus(); return }
    localStorage.removeItem(draftKey)
    setSaved(true)
    window.setTimeout(() => navigate(`/app/${resource}`), 850)
  }

  if (readOnly) return <><Breadcrumb items={[config.title, 'Acesso restrito']} /><PageHeader title="Edição indisponível para este perfil" description="Seu acesso permite consultar as informações, sem alterar os registros." /><PermissionNotice readOnly /><Button as={Link} to={`/app/${resource}`} variant="secondary" icon={ArrowLeft}>Voltar para {config.title.toLowerCase()}</Button></>

  return <>
    <Breadcrumb items={[config.title, editing ? `Editar ${config.singular}` : `Novo ${config.singular}`]} />
    <PageHeader title={`${editing ? 'Editar' : 'Novo'} ${config.singular}`} description={`Formulário específico de ${config.singular}, com validação e salvamento de rascunho.`} />
    {saved && <div className="success-banner"><Check size={19} weight="bold" /> Informações validadas e salvas com sucesso.</div>}
    <form className="resource-form" onSubmit={submit} noValidate>
      {schema.map((section, index) => <section className="form-section" key={section.title}><div className="form-section__heading"><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{section.title}</h2><p>{section.description}</p></div></div><div className="form-section__fields"><div className="dynamic-form-grid">{section.fields.map((definition) => <InputForField key={definition.name} definition={definition} value={values[definition.name]} error={errors[definition.name]} onChange={(value) => update(definition.name, value)} />)}</div></div></section>)}
      {resource !== 'usuarios' && <section className="form-section"><div className="form-section__heading"><span>{String(schema.length + 1).padStart(2, '0')}</span><div><h2>Documentos</h2><p>Anexe evidências e arquivos relacionados.</p></div></div><div className="form-section__fields"><label className="file-drop"><UploadSimple size={26} /><strong>Arraste os arquivos ou clique para selecionar</strong><span>PDF, DOCX, XLSX ou imagens · máximo de 20 MB</span><input type="file" multiple /></label></div></section>}
      <div className="form-actions"><span className="draft-status">{dirty ? 'Rascunho salvo automaticamente' : 'Nenhuma alteração pendente'}</span><Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button><Button icon={FloppyDisk}>Salvar {config.singular}</Button></div>
    </form>
  </>
}

export function ResourceDetailPage({ resource }) {
  const config = resourceConfig[resource]
  const { id } = useParams()
  const [active, setActive] = useState('overview')
  const [comments, setComments] = useState([{ author: 'Ana Beatriz', text: 'Documentação técnica revisada. Aguardando retorno do órgão.', time: 'Hoje, 08:25' }])
  const [comment, setComment] = useState('')
  const readOnly = authService.getSession()?.role === 'Somente leitura'
  const row = (mockRows[resource] || []).find((item) => String(item.id) === String(id)) || (mockRows[resource] || [])[0]
  if (!row) return <EmptyState title="Registro não encontrado" />
  const addComment = (event) => { event.preventDefault(); if (!comment.trim()) return; setComments((current) => [{ author: authService.getSession()?.name || 'Você', text: comment.trim(), time: 'Agora' }, ...current]); setComment('') }
  const movements = [
    ['Status atualizado', `Registro movido para ${row.status}.`, `Hoje, 09:42 · ${row.owner}`, 'status'],
    ['Comentário adicionado', 'Equipe registrou uma orientação para a próxima etapa.', 'Hoje, 08:25 · Ana Beatriz', 'comment'],
    ['Documento anexado', 'Comprovante vinculado ao registro.', '29 jul, 16:20 · Carlos Mendes', 'document'],
    ['Responsável alterado', `${row.owner} assumiu o acompanhamento.`, '28 jul, 11:05 · Mariana Costa', 'user'],
    ['Prazo definido', 'Nova data de acompanhamento registrada.', '24 jul, 14:12 · Sistema', 'deadline'],
    ['Registro criado', 'Cadastro incluído no sistema.', '18 jul, 10:08 · Mariana Costa', 'create'],
  ]

  return <>
    <Breadcrumb items={[config.title, row.primary]} />
    <Link className="back-link back-link--page" to={`/app/${resource}`}><ArrowLeft size={17} /> Voltar para {config.title.toLowerCase()}</Link>
    <PageHeader title={row.primary} description={row.secondary} actionLabel={readOnly ? undefined : `Editar ${config.singular}`} actionTo={readOnly ? undefined : `/app/${resource}/${id}/editar`} secondary={<>{!readOnly && <Button variant="secondary" icon={ChatCircleText} onClick={() => setActive('comments')}>Comentar</Button>}<Button variant="secondary" icon={DownloadSimple}>Exportar</Button></>} />
    <PermissionNotice readOnly={readOnly} />
    <div className="detail-summary"><div><span>Status</span><StatusBadge>{row.status}</StatusBadge></div><div><span>Responsável</span><strong>{row.owner}</strong></div><div><span>Tipo / vínculo</span><strong>{row.detail}</strong></div><div><span>Prazo / atualização</span><strong>{row.date}</strong></div></div>
    <div className="detail-tabs">{[['overview', 'Visão geral'], ['history', 'Histórico'], ['documents', 'Documentos'], ['deadlines', 'Prazos'], ['comments', `Comentários (${comments.length})`]].map(([key, label]) => <button key={key} className={active === key ? 'active' : ''} onClick={() => setActive(key)}>{label}</button>)}</div>
    {active === 'overview' && <div className="detail-grid"><section className="panel detail-card"><p className="eyebrow">Dados do registro</p><h2>Informações principais</h2><dl><div><dt>Empresa</dt><dd>{row.secondary}</dd></div><div><dt>Identificação</dt><dd>{row.primary}</dd></div><div><dt>Categoria</dt><dd>{row.detail}</dd></div><div><dt>Responsável</dt><dd>{row.owner}</dd></div><div><dt>Última atualização</dt><dd>{row.date}</dd></div><div><dt>Observações</dt><dd>Acompanhamento técnico dentro do fluxo regular.</dd></div></dl></section><aside className="panel next-action-card"><p className="eyebrow">Próxima ação</p><Clock size={27} /><h2>Revisar documentação pendente</h2><p>Validar os anexos antes do próximo envio ao órgão ambiental.</p><Button onClick={() => setActive('documents')}>Ver documentos</Button></aside></div>}
    {active === 'history' && <section className="panel full-history"><div><p className="eyebrow">Trilha de auditoria</p><h2>Histórico completo</h2><span>Todas as alterações possuem autor, data e contexto.</span></div><div className="timeline timeline--full">{movements.map(([title, text, time, type]) => <article key={`${title}-${time}`} data-type={type}><i /><div><strong>{title}</strong><p>{text}</p><time>{time}</time></div></article>)}</div></section>}
    {active === 'documents' && <section className="panel detail-list"><div className="panel__header"><div><p className="eyebrow">Arquivos vinculados</p><h2>Documentos</h2></div>{!readOnly && <Button icon={Plus}>Adicionar arquivo</Button>}</div>{[['Licenca_operacao_1189.pdf', 'Licença · 2,4 MB', '30 jul 2026'], ['Comprovante_protocolo.pdf', 'Protocolo · 820 KB', '29 jul 2026'], ['Parecer_tecnico_v3.pdf', 'Parecer · 4,1 MB', '24 jul 2026']].map(([name, type, date]) => <article key={name}><FileText size={22} /><div><strong>{name}</strong><span>{type}</span></div><time>{date}</time><button>Baixar</button></article>)}</section>}
    {active === 'deadlines' && <section className="panel detail-list"><div className="panel__header"><div><p className="eyebrow">Agenda do registro</p><h2>Prazos e lembretes</h2></div>{!readOnly && <Button icon={Plus}>Novo prazo</Button>}</div>{[['03 ago', 'Complementação documental', '3 dias', 'danger'], ['08 ago', 'Retorno de análise', '8 dias', 'warning'], ['22 ago', 'Reunião de acompanhamento', '22 dias', 'normal']].map(([date, title, remaining, tone]) => <article key={title}><span className={`detail-date detail-date--${tone}`}>{date}</span><div><strong>{title}</strong><span>Responsável: {row.owner}</span></div><StatusBadge>{remaining}</StatusBadge>{!readOnly && <button>Editar</button>}</article>)}</section>}
    {active === 'comments' && <div className={`comments-layout ${readOnly ? 'comments-layout--readonly' : ''}`}>{!readOnly && <form className="panel comment-form" onSubmit={addComment}><p className="eyebrow">Comunicação interna</p><h2>Adicionar comentário</h2><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Registre uma orientação, decisão ou atualização…" rows="5" /><div><button type="button"><Paperclip size={18} />Anexar</button><Button>Publicar comentário</Button></div></form>}<section className="panel comments-list">{comments.map((item, index) => <article key={`${item.time}-${index}`}><span className="avatar">{item.author.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><div><strong>{item.author}</strong><time>{item.time}</time><p>{item.text}</p></div></article>)}</section></div>}
  </>
}

export function MonthlyControlPage() {
  return <><Breadcrumb items={['Controle mensal']} /><PageHeader title="Controle mensal" description="Visão consolidada da evolução dos processos em julho de 2026." actionLabel="Novo registro" actionTo="/app/processos/novo" secondary={<Button variant="secondary" icon={DownloadSimple}>Exportar relatório</Button>} /><div className="month-summary"><article><span>Entradas no mês</span><strong>32</strong><small>+8 em relação a junho</small></article><article><span>Protocolos concluídos</span><strong>26</strong><small>81% das entradas</small></article><article><span>Licenças emitidas</span><strong>18</strong><small>7 gerais · 11 poços</small></article></div><ResourceTable rows={mockRows.processos} singular="registro" /></>
}

const calendarEvents = [
  { day: 3, type: 'exigencia', short: 'Exigência SRH 001395', title: 'Complementação de estudo hidrogeológico', company: 'Águas do Sertão SPE' },
  { day: 6, type: 'pagamento', short: 'Boleto 2026-0912', title: 'Vencimento de boleto', company: 'Construtora Horizonte S.A.' },
  { day: 7, type: 'licenca', short: 'LS 2025-0841', title: 'Vencimento de licença simplificada', company: 'Agrovale Empreendimentos' },
  { day: 12, type: 'tarefa', short: 'Reunião técnica', title: 'Reunião de acompanhamento', company: 'Eco Norte Indústria Ltda.' },
  { day: 22, type: 'licenca', short: 'AUT 2025-991', title: 'Vencimento de autorização', company: 'Águas do Sertão SPE' },
  { day: 28, type: 'exigencia', short: 'Relatório semestral', title: 'Entrega de relatório de monitoramento', company: 'Eco Norte Indústria Ltda.' },
]

export function CalendarPage() {
  const days = Array.from({ length: 35 }, (_, index) => index - 2)
  const [types, setTypes] = useState(['licenca', 'exigencia', 'pagamento', 'tarefa'])
  const toggle = (type) => setTypes((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type])
  const visibleEvents = calendarEvents.filter((event) => types.includes(event.type))
  const exportCalendar = () => {
    const items = visibleEvents.map((event) => `BEGIN:VEVENT\nDTSTART;VALUE=DATE:202608${String(event.day).padStart(2, '0')}\nDTEND;VALUE=DATE:202608${String(event.day + 1).padStart(2, '0')}\nSUMMARY:${event.title}\nDESCRIPTION:${event.company} - ${event.short}\nEND:VEVENT`).join('\n')
    const url = URL.createObjectURL(new Blob([`BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Celerity Ambiental//Agenda//PT-BR\n${items}\nEND:VCALENDAR`], { type: 'text/calendar' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'agenda-celerity-agosto-2026.ics'; anchor.click(); URL.revokeObjectURL(url)
  }
  return <><Breadcrumb items={['Calendário operacional']} /><PageHeader title="Calendário operacional" description="Licenças, exigências, pagamentos e tarefas em uma única agenda." actionLabel="Novo compromisso" actionTo="/app/licencas/novo" secondary={<Button variant="secondary" icon={DownloadSimple} onClick={exportCalendar}>Exportar agenda</Button>} /><div className="calendar-filters">{[['licenca', 'Licenças'], ['exigencia', 'Exigências'], ['pagamento', 'Pagamentos'], ['tarefa', 'Tarefas']].map(([type, label]) => <button key={type} className={types.includes(type) ? `active type-${type}` : ''} onClick={() => toggle(type)}><i />{label}</button>)}</div><div className="unified-calendar"><section className="panel calendar-panel"><div className="calendar-toolbar"><button aria-label="Mês anterior">‹</button><h2>Agosto de 2026</h2><button aria-label="Próximo mês">›</button></div><div className="calendar-week">{['DOM','SEG','TER','QUA','QUI','SEX','SÁB'].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{days.map((day, index) => { const realDay = day < 1 ? 31 + day : day > 31 ? day - 31 : day; const events = day > 0 && day <= 31 ? visibleEvents.filter((event) => event.day === day) : []; return <div key={index} className={day < 1 || day > 31 ? 'muted' : ''}><span>{realDay}</span>{events.map((event) => <small key={event.short} className={`event event--${event.type}`}>{event.short}</small>)}</div> })}</div></section><aside className="panel calendar-agenda"><p className="eyebrow">Próximos compromissos</p><h2>Agosto</h2>{visibleEvents.sort((a, b) => a.day - b.day).map((event) => <article key={`${event.day}-${event.short}`}><span className={`agenda-date type-${event.type}`}><strong>{String(event.day).padStart(2, '0')}</strong><small>AGO</small></span><div><strong>{event.title}</strong><span>{event.company}</span><small>{event.type}</small></div></article>)}</aside></div></>
}
