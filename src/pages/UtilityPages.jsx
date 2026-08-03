import { useEffect, useState } from 'react'
import { Archive, ArrowRight, Bell, BookOpen, ChartBar, Check, ChatCircleText, Clock, DownloadSimple, FileCsv, FilePdf, Gear, Lifebuoy, Lock, MagnifyingGlass, MapPin, Palette, PlayCircle, ShieldCheck, SlidersHorizontal, UserCircle } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { SuccessToast } from '../components/Experience'
import { Breadcrumb, Button, PageHeader, StatusBadge } from '../components/ui'

export function ReportsPage() {
  const reports = [
    ['Processos por status', 'Distribuição e evolução dos processos no período.', ChartBar, ['Em andamento', 'Em análise', 'Em exigência', 'Concluídos'], [61, 43, 18, 26]],
    ['Licenças a vencer', 'Vencimentos em 7, 30, 60 e 90 dias.', FilePdf, ['Até 7 dias', 'Até 30 dias', 'Até 60 dias', 'Até 90 dias'], [6, 14, 23, 31]],
    ['Produtividade da equipe', 'Movimentações e conclusões por responsável.', UserCircle, ['Mariana', 'Ana Beatriz', 'Carlos', 'Rafael'], [37, 29, 24, 18]],
    ['Pagamentos e pendências', 'Valores pagos, pendentes e vencidos.', FileCsv, ['Pagos', 'Pendentes', 'Vencidos', 'Conciliando'], [72, 38, 8, 12]],
    ['Mapa de empreendimentos', 'Distribuição territorial por situação e órgão responsável.', MapPin, [], []],
  ]
  const [active, setActive] = useState(0)
  const [filters, setFilters] = useState({ period: '30', company: 'Todas', owner: 'Todos', status: 'Todos' })
  const [toast, setToast] = useState('')
  const [title, description, ActiveIcon, labels, values] = reports[active]
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }))
  const exportCsv = () => {
    const rows = [['Relatório', title], ['Período', `${filters.period} dias`], ['Empresa', filters.company], ['Responsável', filters.owner], ['Status', filters.status], [], ['Categoria', 'Resultado'], ...labels.map((label, index) => [label, values[index]])]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `relatorio-${title.toLowerCase().replaceAll(' ', '-')}.csv`; anchor.click(); URL.revokeObjectURL(url)
    setToast('Relatório exportado com os filtros selecionados.')
  }
  return <><Breadcrumb items={['Relatórios']} /><PageHeader title="Relatórios gerenciais" description="Configure filtros, confira a prévia e exporte análises da operação." /><div className="report-grid">{reports.map(([reportTitle, reportDescription, Icon], index) => <article className={active === index ? 'active' : ''} key={reportTitle}><Icon size={28} /><div><h2>{reportTitle}</h2><p>{reportDescription}</p></div><Button variant="secondary" onClick={() => setActive(index)}>{active === index ? 'Selecionado' : 'Configurar'} <ArrowRight size={16} /></Button></article>)}</div><section className="panel report-builder"><div className="report-builder__heading"><span><ActiveIcon size={25} /></span><div><p className="eyebrow">Prévia configurável</p><h2>{title}</h2><p>{description}</p></div></div><div className="report-filters"><label>Período<select value={filters.period} onChange={(event) => update('period', event.target.value)}><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option><option value="365">Último ano</option></select></label><label>Empresa<select value={filters.company} onChange={(event) => update('company', event.target.value)}><option>Todas</option><option>Eco Norte Indústria Ltda.</option><option>Construtora Horizonte S.A.</option><option>Águas do Sertão SPE</option></select></label><label>Responsável<select value={filters.owner} onChange={(event) => update('owner', event.target.value)}><option>Todos</option><option>Mariana Costa</option><option>Ana Beatriz</option><option>Carlos Mendes</option></select></label><label>Status<select value={filters.status} onChange={(event) => update('status', event.target.value)}><option>Todos</option><option>Em andamento</option><option>Em análise</option><option>Em exigência</option><option>Concluído</option></select></label></div>{active === 4 ? <div className="enterprise-map" role="img" aria-label="Mapa demonstrativo com empreendimentos no Ceará"><div className="map-road map-road--one" /><div className="map-road map-road--two" />{[['pin--one','Eco Norte','Em análise'], ['pin--two','Águas do Sertão','Regular'], ['pin--three','Agrovale','Em exigência'], ['pin--four','Horizonte','Regular']].map(([className, name, status]) => <button className={`map-pin ${className}`} key={name} title={`${name} · ${status}`}><MapPin size={25} weight="fill" /><span><strong>{name}</strong><small>{status}</small></span></button>)}<div className="map-legend"><span><i className="map-green" />Regular</span><span><i className="map-yellow" />Em análise</span><span><i className="map-red" />Em exigência</span></div></div> : <div className="report-preview"><div className="report-preview__summary"><span>Resultado no período</span><strong>{values.reduce((total, value) => total + value, 0)}</strong><small>+12% em relação ao período anterior</small></div><div className="report-bars">{labels.map((label, index) => <article key={label}><div><strong>{label}</strong><span>{values[index]}</span></div><i><span style={{ width: `${Math.max(12, values[index])}%` }} /></i></article>)}</div></div>}<footer><span><SlidersHorizontal size={17} />A prévia usa dados demonstrativos até a conexão com a API.</span><Button icon={DownloadSimple} onClick={exportCsv}>Exportar CSV</Button></footer></section><SuccessToast message={toast} onClose={() => setToast('')} /></>
}

export function SettingsPage() {
  const stored = JSON.parse(localStorage.getItem('celerity_preferences') || '{}')
  const [active, setActive] = useState('geral')
  const [saved, setSaved] = useState(false)
  const [preferences, setPreferences] = useState({
    organization: 'Celerity Ambiental', timezone: 'America/Fortaleza', language: 'pt-BR',
    density: 'comfortable', reducedMotion: false, compactSidebar: false,
    inApp: true, email: true, weekly: true, deadline: '30',
    ...stored,
  })

  useEffect(() => {
    document.documentElement.dataset.density = preferences.density
    document.documentElement.dataset.reducedMotion = preferences.reducedMotion ? 'true' : 'false'
  }, [preferences.density, preferences.reducedMotion])

  const update = (key, value) => setPreferences((current) => ({ ...current, [key]: value }))
  const save = (event) => {
    event.preventDefault()
    localStorage.setItem('celerity_preferences', JSON.stringify(preferences))
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }
  const toggle = (key) => <button className={`switch ${preferences[key] ? 'is-on' : ''}`} type="button" role="switch" aria-checked={preferences[key]} onClick={() => update(key, !preferences[key])}><span /></button>
  const tabs = [['geral', 'Geral', Gear], ['aparencia', 'Aparência', Palette], ['notificacoes', 'Notificações', Bell], ['seguranca', 'Segurança', Lock]]

  return <><Breadcrumb items={['Configurações']} /><PageHeader title="Configurações" description="Preferências do sistema, notificações e segurança." />{saved && <div className="success-banner"><Check size={19} weight="bold" /> Alterações salvas neste dispositivo.</div>}<div className="settings-layout"><nav>{tabs.map(([key, label, Icon]) => <button key={key} className={active === key ? 'active' : ''} type="button" onClick={() => setActive(key)}><Icon size={19} />{label}</button>)}</nav><form className="panel settings-form" onSubmit={save}>
    {active === 'geral' && <><div><p className="eyebrow">Organização</p><h2>Informações gerais</h2><p>Dados utilizados na interface e nos documentos gerados.</p></div><label>Nome da organização<input value={preferences.organization} onChange={(event) => update('organization', event.target.value)} /></label><label>Fuso horário<select value={preferences.timezone} onChange={(event) => update('timezone', event.target.value)}><option>America/Fortaleza</option><option>America/Recife</option><option>America/Sao_Paulo</option></select></label><label>Idioma<select value={preferences.language} onChange={(event) => update('language', event.target.value)}><option value="pt-BR">Português (Brasil)</option></select></label></>}
    {active === 'aparencia' && <><div><p className="eyebrow">Interface</p><h2>Aparência e conforto visual</h2><p>Ajuste como as informações são apresentadas neste dispositivo.</p></div><fieldset className="settings-choice"><legend>Densidade do conteúdo</legend><label className={preferences.density === 'comfortable' ? 'selected' : ''}><input type="radio" name="density" checked={preferences.density === 'comfortable'} onChange={() => update('density', 'comfortable')} /><span><strong>Confortável</strong><small>Mais espaço entre os elementos.</small></span></label><label className={preferences.density === 'compact' ? 'selected' : ''}><input type="radio" name="density" checked={preferences.density === 'compact'} onChange={() => update('density', 'compact')} /><span><strong>Compacta</strong><small>Mais informações visíveis por tela.</small></span></label></fieldset><div className="switch-row"><div><strong>Menu lateral compacto</strong><span>Iniciar o sistema com o menu recolhido.</span></div>{toggle('compactSidebar')}</div><div className="switch-row"><div><strong>Reduzir movimentos</strong><span>Minimiza transições e animações da interface.</span></div>{toggle('reducedMotion')}</div></>}
    {active === 'notificacoes' && <><div><p className="eyebrow">Comunicação</p><h2>Preferências de notificações</h2><p>Escolha quais alertas deseja receber e com qual antecedência.</p></div><div className="switch-row"><div><strong>Alertas dentro do sistema</strong><span>Exibir prazos e movimentações na central de notificações.</span></div>{toggle('inApp')}</div><div className="switch-row"><div><strong>Notificações por e-mail</strong><span>Enviar alertas críticos para o seu e-mail cadastrado.</span></div>{toggle('email')}</div><div className="switch-row"><div><strong>Resumo semanal</strong><span>Receber as prioridades toda segunda-feira.</span></div>{toggle('weekly')}</div><label>Antecedência para vencimentos<select value={preferences.deadline} onChange={(event) => update('deadline', event.target.value)}><option value="7">7 dias</option><option value="15">15 dias</option><option value="30">30 dias</option><option value="60">60 dias</option></select></label></>}
    {active === 'seguranca' && <><div><p className="eyebrow">Proteção da conta</p><h2>Senha e sessões</h2><p>Atualize suas credenciais e acompanhe os acessos ativos.</p></div><label>Senha atual<input type="password" autoComplete="current-password" /></label><div className="form-grid"><label>Nova senha<input type="password" autoComplete="new-password" /></label><label>Confirmar nova senha<input type="password" autoComplete="new-password" /></label></div><hr /><div className="active-session"><ShieldCheck size={23} /><div><strong>Esta sessão está ativa</strong><span>Windows · navegador local · agora</span></div><StatusBadge>Atual</StatusBadge></div><Button type="button" variant="secondary" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 2200) }}>Encerrar outras sessões</Button></>}
    <Button icon={Check}>Salvar alterações</Button></form></div></>
}

export function HelpPage() {
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('tema')?.replace('-', ' ') || '')
  const guides = [
    ['primeiros-passos', 'Primeiros passos', 'Conheça o painel e configure sua operação.', PlayCircle, 'painel configuração operação'],
    ['processos-licencas', 'Processos e licenças', 'Cadastre, acompanhe e atualize cada processo.', BookOpen, 'processo licença cadastro acompanhamento'],
    ['prazos-exigencias', 'Prazos e exigências', 'Organize prioridades e evite vencimentos.', Lifebuoy, 'prazo exigência vencimento calendário'],
    ['usuarios-acessos', 'Usuários e acessos', 'Entenda perfis, convites e permissões.', UserCircle, 'usuário acesso perfil convite permissão'],
  ]
  const faqs = [
    ['processos-licencas', 'Como cadastrar um novo processo?', 'Acesse Processos, selecione “Novo processo”, preencha os campos obrigatórios e salve o registro.', 'cadastro novo processo formulário'],
    ['prazos-exigencias', 'Onde acompanho os próximos vencimentos?', 'Use a Visão geral para prioridades ou abra o Calendário operacional para consultar licenças, exigências, pagamentos e tarefas.', 'vencimento prazo calendário licença exigência'],
    ['processos-licencas', 'Como anexar um documento?', 'No detalhe de um processo ou no módulo Documentos, selecione o arquivo e defina o vínculo correspondente.', 'anexo arquivo documento processo'],
    ['usuarios-acessos', 'Quem pode alterar permissões?', 'Administradores e gestores autorizados podem editar perfis no módulo Usuários.', 'permissão usuário perfil acesso'],
    ['primeiros-passos', 'Como encontro uma informação rapidamente?', 'Use a busca global no topo do sistema ou pressione Ctrl + K para localizar empresas, processos, licenças e documentos.', 'busca global encontrar informação ctrl k'],
  ]
  const normalized = query.trim().toLocaleLowerCase('pt-BR')
  const visibleGuides = guides.filter(([, title, description, , keywords]) => `${title} ${description} ${keywords}`.toLocaleLowerCase('pt-BR').includes(normalized))
  const visibleFaqs = faqs.filter(([, title, answer, keywords]) => `${title} ${answer} ${keywords}`.toLocaleLowerCase('pt-BR').includes(normalized))
  const clearSearch = () => setQuery('')
  return <><Breadcrumb items={['Central de ajuda']} /><PageHeader title="Como podemos ajudar?" description="Encontre orientações práticas para concluir cada tarefa no sistema." /><label className="help-search"><MagnifyingGlass size={22} /><span className="sr-only">Pesquisar na ajuda</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquise por processo, licença, prazo ou funcionalidade" />{query && <button type="button" onClick={clearSearch} aria-label="Limpar pesquisa">×</button>}</label>{(visibleGuides.length > 0 || visibleFaqs.length > 0) ? <><div className="help-grid">{visibleGuides.map(([id, title, description, Icon]) => <a href={`#${id}`} key={title}><Icon size={27} /><div><h2>{title}</h2><p>{description}</p></div><ArrowRight size={18} /></a>)}</div><div className="help-layout"><section className="panel help-faq"><p className="eyebrow">{normalized ? `${visibleFaqs.length} resultado(s)` : 'Dúvidas frequentes'}</p><h2>Respostas rápidas</h2>{visibleFaqs.map(([id, title, answer]) => <details id={id} key={title} open={Boolean(normalized)}><summary>{title}</summary><p>{answer}</p></details>)}</section><aside className="help-contact"><ChatCircleText size={30} /><p className="eyebrow eyebrow--green">Suporte especializado</p><h2>Não encontrou o que precisava?</h2><p>Descreva sua dúvida para a equipe de suporte. Inclua o número do processo quando houver.</p><a className="button button--primary" href="mailto:suporte@celerityambiental.com.br?subject=Suporte%20ao%20sistema%20Celerity">Falar com o suporte</a><small>Resposta em horário comercial</small></aside></div></> : <section className="help-empty"><MagnifyingGlass size={30} /><h2>Nenhuma orientação encontrada</h2><p>Tente pesquisar com menos palavras ou fale diretamente com o suporte.</p><Button variant="secondary" onClick={clearSearch}>Limpar pesquisa</Button></section>}</>
}

export function NotificationsPage() {
  const initialAlerts = [
    { id: 1, category: 'Prazos', title: 'Prazo vence em 3 dias', text: 'A exigência do processo SRH 2026/001395 precisa de atenção.', time: 'há 12 minutos', read: false, href: '/app/exigencias/701' },
    { id: 2, category: 'Licenças', title: 'Licença próxima do vencimento', text: 'LS nº 2025-0841 vence em 7 dias.', time: 'há 2 horas', read: false, href: '/app/licencas/302' },
    { id: 3, category: 'Pagamentos', title: 'Pagamento confirmado', text: 'Solicitação nº 2026-0861 foi marcada como paga.', time: 'ontem, 16:40', read: true, href: '/app/pagamentos/413' },
  ]
  const [alerts, setAlerts] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('celerity_notifications') || 'null') || initialAlerts
    const knownLinks = { 1: '/app/exigencias/701', 2: '/app/licencas/302', 3: '/app/pagamentos/413' }
    return stored.map((item) => ({ ...item, href: knownLinks[item.id] || item.href, category: item.category || (item.title.includes('Licença') ? 'Licenças' : item.title.includes('Pagamento') ? 'Pagamentos' : 'Prazos') }))
  })
  const [filter, setFilter] = useState('Todas')
  const [message, setMessage] = useState('')
  const persist = (next) => { setAlerts(next); localStorage.setItem('celerity_notifications', JSON.stringify(next)) }
  const markAll = () => persist(alerts.map((item) => ({ ...item, read: true })))
  const visibleAlerts = alerts.filter((item) => filter === 'Todas' || item.category === filter)
  const unread = alerts.filter((item) => !item.read).length
  const postpone = (item) => { persist(alerts.map((alert) => alert.id === item.id ? { ...alert, time: 'adiada até amanhã, 09:00', read: true } : alert)); setMessage('Lembrete adiado até amanhã às 09:00.') }
  const archive = (item) => { persist(alerts.filter((alert) => alert.id !== item.id)); setMessage('Notificação arquivada.') }
  return <><Breadcrumb items={['Notificações']} /><PageHeader title="Notificações" description={`${unread ? `${unread} atualização(ões) ainda não lida(s).` : 'Você está em dia com todas as atualizações.'}`} secondary={unread ? <Button variant="secondary" icon={Check} onClick={markAll}>Marcar todas como lidas</Button> : undefined} /><div className="notification-tabs">{['Todas', 'Prazos', 'Licenças', 'Pagamentos'].map((category) => <button key={category} className={filter === category ? 'active' : ''} onClick={() => setFilter(category)}>{category}<span>{category === 'Todas' ? alerts.length : alerts.filter((item) => item.category === category).length}</span></button>)}<Link to="/app/configuracoes">Preferências</Link></div><section className="panel notifications-list">{visibleAlerts.length ? visibleAlerts.map((item) => <article key={item.id} className={!item.read ? 'unread' : ''}><span className="notification-icon"><Bell size={20} /></span><Link to={item.href} onClick={() => persist(alerts.map((alert) => alert.id === item.id ? { ...alert, read: true } : alert))}><small>{item.category}</small><h2>{item.title}</h2><p>{item.text}</p><time>{item.time}</time></Link><div className="notification-actions"><button type="button" onClick={() => postpone(item)} title="Adiar lembrete"><Clock size={17} /></button><button type="button" onClick={() => archive(item)} title="Arquivar"><Archive size={17} /></button><button className="notification-status" type="button" onClick={() => persist(alerts.map((alert) => alert.id === item.id ? { ...alert, read: !alert.read } : alert))} aria-label={item.read ? 'Marcar como não lida' : 'Marcar como lida'}><StatusBadge>{item.read ? 'Lida' : 'Nova'}</StatusBadge></button></div></article>) : <div className="notification-empty"><Bell size={28} /><strong>Nenhuma notificação nesta categoria</strong><span>Quando houver uma atualização, ela aparecerá aqui.</span></div>}</section><SuccessToast message={message} onClose={() => setMessage('')} /></>
}

export function NotFoundPage() {
  return <div className="not-found"><span>404</span><h1>Página não encontrada.</h1><p>O endereço pode ter mudado ou não está disponível para o seu perfil.</p><Button as={Link} to="/">Voltar ao início</Button></div>
}
