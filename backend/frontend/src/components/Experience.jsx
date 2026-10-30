import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, Buildings, CalendarCheck, Check, ClipboardText, Clock, Drop, FileText,
  MagnifyingGlass, ShieldCheck, Sparkle, Warning, WifiSlash, X,
} from './icons'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { mockRows } from '../data/mockData'
import { Button, StatusBadge } from './ui'

const pathByResource = {
  empresas: '/app/empresas', processos: '/app/processos', pocos: '/app/pocos',
  licencas: '/app/licencas', exigencias: '/app/exigencias', pagamentos: '/app/pagamentos',
  assessoria: '/app/assessoria', documentos: '/app/documentos', usuarios: '/app/usuarios',
}

const labelByResource = {
  empresas: 'Empresas', processos: 'Processos', pocos: 'Poços', licencas: 'Licenças',
  exigencias: 'Exigências', pagamentos: 'Pagamentos', assessoria: 'Assessoria',
  documentos: 'Documentos', usuarios: 'Usuários',
}

export function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [recent, setRecent] = useState(() => JSON.parse(localStorage.getItem('celerity_recent_searches') || '[]'))
  const navigate = useNavigate()
  const results = useMemo(() => {
    if (query.trim().length < 2) return []
    const normalized = query.toLowerCase()
    return Object.entries(mockRows).flatMap(([resource, rows]) => rows
      .filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(normalized)))
      .map((row) => ({ ...row, resource, href: `${pathByResource[resource]}/${row.id}` })))
      .slice(0, 9)
  }, [query])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])
  useEffect(() => setActiveIndex(0), [query])

  const remember = (row) => {
    const entry = { resource: row.resource, id: row.id, href: row.href, primary: row.primary, secondary: row.secondary, status: row.status }
    const next = [entry, ...recent.filter((item) => item.href !== row.href)].slice(0, 4)
    setRecent(next)
    localStorage.setItem('celerity_recent_searches', JSON.stringify(next))
  }
  const openResult = (row) => { remember(row); onClose() }
  const onSearchKeyDown = (event) => {
    if (!results.length) return
    if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((current) => (current + 1) % results.length) }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((current) => (current - 1 + results.length) % results.length) }
    if (event.key === 'Enter') { event.preventDefault(); const row = results[activeIndex]; remember(row); onClose(); navigate(row.href) }
  }

  if (!open) return null
  return <div className="command-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="command-palette" role="dialog" aria-modal="true" aria-label="Pesquisa global"><div className="command-input"><MagnifyingGlass size={22} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={onSearchKeyDown} placeholder="Digite uma empresa, processo, licença ou documento" aria-activedescendant={results[activeIndex] ? `search-result-${results[activeIndex].resource}-${results[activeIndex].id}` : undefined} /><button onClick={onClose} aria-label="Fechar pesquisa"><X size={20} /></button></div>{query.length < 2 ? recent.length ? <div className="command-recent"><p><Clock size={17} />Acessados recentemente</p>{recent.map((row) => <Link to={row.href} key={row.href} onClick={() => openResult(row)}><div><strong>{row.primary}</strong><small>{row.secondary}</small></div><ArrowRight size={17} /></Link>)}</div> : <div className="command-empty"><Sparkle size={26} /><strong>Encontre qualquer informação rapidamente</strong><span>Digite pelo menos dois caracteres para pesquisar em todos os módulos.</span></div> : results.length ? <div className="command-results">{results.map((row, index) => <Link id={`search-result-${row.resource}-${row.id}`} className={activeIndex === index ? 'active' : ''} to={row.href} key={`${row.resource}-${row.id}`} onMouseEnter={() => setActiveIndex(index)} onClick={() => openResult(row)}><span className="command-result__type">{labelByResource[row.resource]}</span><div><strong>{row.primary}</strong><small>{row.secondary}</small></div><StatusBadge>{row.status}</StatusBadge><ArrowRight size={17} /></Link>)}</div> : <div className="command-empty"><MagnifyingGlass size={26} /><strong>Nenhum resultado encontrado</strong><span>Revise o termo pesquisado ou abra um módulo para usar filtros avançados.</span></div>}<footer><span><kbd>↑↓</kbd> navegar</span><span><kbd>ESC</kbd> fechar</span><span><kbd>↵</kbd> abrir resultado</span></footer></section></div>
}

const onboardingByRole = {
  Gestor: [
    ['Visão completa da operação', 'Acompanhe riscos, prazos e produtividade em uma única visão.', ShieldCheck],
    ['Prioridades da equipe', 'Use filtros e responsáveis para transformar pendências em planos de ação.', CalendarCheck],
    ['Decisões com contexto', 'Abra qualquer indicador para chegar aos registros que formam o resultado.', ClipboardText],
  ],
  Técnico: [
    ['Seu trabalho em primeiro lugar', 'Acesse processos e exigências atribuídos a você.', ClipboardText],
    ['Prazos visíveis', 'Receba alertas antes de exigências e licenças vencerem.', CalendarCheck],
    ['Documentação conectada', 'Anexe evidências diretamente ao processo correspondente.', FileText],
  ],
  Financeiro: [
    ['Pagamentos priorizados', 'Visualize boletos pendentes, pagos e vencidos.', Buildings],
    ['Comprovantes organizados', 'Vincule cada comprovante à solicitação correta.', FileText],
    ['Alertas configuráveis', 'Escolha quando receber avisos de vencimento.', Warning],
  ],
}

export function Onboarding({ session }) {
  const [open, setOpen] = useState(() => !localStorage.getItem('celerity_onboarding_done'))
  const [step, setStep] = useState(0)
  const steps = onboardingByRole[session?.role] || onboardingByRole.Gestor
  const [title, text, Icon] = steps[step]
  const finish = () => { localStorage.setItem('celerity_onboarding_done', 'true'); setOpen(false) }
  useEffect(() => {
    if (!open) return undefined
    const closeOnEscape = (event) => { if (event.key === 'Escape') { localStorage.setItem('celerity_onboarding_done', 'true'); setOpen(false) } }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])
  if (!open) return null
  return <div className="onboarding-overlay"><section className="onboarding-modal" role="dialog" aria-modal="true" aria-labelledby="onboarding-title"><button className="onboarding-close" onClick={finish} aria-label="Pular apresentação"><X size={20} /></button><div className="onboarding-visual"><span><Icon size={38} /></span><small>CELERITY AMBIENTAL</small></div><div className="onboarding-copy"><p className="eyebrow">Passo {step + 1} de {steps.length}</p><h2 id="onboarding-title">{title}</h2><p>{text}</p><div className="onboarding-dots">{steps.map((item, index) => <i key={item[0]} className={index === step ? 'active' : ''} />)}</div><div className="onboarding-actions"><button onClick={finish}>Pular</button><Button autoFocus onClick={() => step === steps.length - 1 ? finish() : setStep(step + 1)}>{step === steps.length - 1 ? 'Começar agora' : 'Continuar'} <ArrowRight size={17} /></Button></div></div></section></div>
}

export function NetworkBanner() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update) }
  }, [])
  if (online) return null
  return <div className="network-banner" role="status"><WifiSlash size={18} /><strong>Você está offline.</strong><span>As alterações serão habilitadas quando a conexão voltar.</span></div>
}

const contextualTopics = {
  processos: 'Como acompanhar e movimentar processos', pocos: 'Gestão de poços e outorgas',
  licencas: 'Vencimentos e renovações de licenças', exigencias: 'Atendimento de exigências',
  pagamentos: 'Controle de boletos e comprovantes', documentos: 'Organização de documentos',
}

export function ContextHelp() {
  const location = useLocation()
  const key = Object.keys(contextualTopics).find((item) => location.pathname.includes(`/${item}`))
  if (!key) return null
  return <Link className="context-help" to={`/app/ajuda?tema=${key}`}><span>?</span><div><strong>Precisa de ajuda?</strong><small>{contextualTopics[key]}</small></div><ArrowRight size={16} /></Link>
}

export function PermissionNotice({ readOnly }) {
  if (!readOnly) return null
  return <div className="permission-notice"><ShieldCheck size={19} /><div><strong>Acesso somente para consulta</strong><span>Seu perfil pode visualizar dados, mas não pode criar, editar ou excluir registros.</span></div></div>
}

export function LoadingState({ rows = 5 }) {
  return <div className="skeleton-table" aria-label="Carregando dados">{Array.from({ length: rows }, (_, index) => <div key={index}><i /><span /><span /><span /></div>)}</div>
}

export function ErrorState({ onRetry }) {
  return <div className="error-state"><Warning size={29} /><h3>Não foi possível carregar os dados</h3><p>Verifique sua conexão e tente novamente.</p><Button variant="secondary" onClick={onRetry}>Tentar novamente</Button></div>
}

export function SuccessToast({ message, onClose }) {
  if (!message) return null
  return <div className="app-toast" role="status"><span><Check size={18} weight="bold" /></span><div><strong>Ação concluída</strong><small>{message}</small></div><button onClick={onClose} aria-label="Fechar mensagem"><X size={17} /></button></div>
}
