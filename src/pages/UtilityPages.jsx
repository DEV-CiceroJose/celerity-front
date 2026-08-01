import { useEffect, useState } from 'react'
import { ArrowRight, Bell, BookOpen, ChartBar, Check, ChatCircleText, FileCsv, FilePdf, Gear, Lifebuoy, Lock, MagnifyingGlass, Palette, PlayCircle, ShieldCheck, UserCircle } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { Breadcrumb, Button, PageHeader, StatusBadge } from '../components/ui'

export function ReportsPage() {
  const reports = [
    ['Processos por status', 'Distribuição e evolução dos processos no período.', ChartBar],
    ['Licenças a vencer', 'Vencimentos em 7, 30, 60 e 90 dias.', FilePdf],
    ['Produtividade da equipe', 'Movimentações e conclusões por responsável.', UserCircle],
    ['Pagamentos e pendências', 'Valores pagos, pendentes e vencidos.', FileCsv],
  ]
  return <><Breadcrumb items={['Relatórios']} /><PageHeader title="Relatórios" description="Gere análises operacionais e gerenciais com filtros por período." /><div className="report-grid">{reports.map(([title, description, Icon]) => <article key={title}><Icon size={28} /><div><h2>{title}</h2><p>{description}</p></div><Button variant="secondary">Configurar <ArrowRight size={16} /></Button></article>)}</div></>
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
  const guides = [
    ['Primeiros passos', 'Conheça o painel e configure sua operação.', PlayCircle],
    ['Processos e licenças', 'Cadastre, acompanhe e atualize cada processo.', BookOpen],
    ['Prazos e exigências', 'Organize prioridades e evite vencimentos.', Lifebuoy],
    ['Usuários e acessos', 'Entenda perfis, convites e permissões.', UserCircle],
  ]
  return <><Breadcrumb items={['Central de ajuda']} /><PageHeader title="Como podemos ajudar?" description="Encontre orientações para usar o sistema Celerity Ambiental." /><label className="help-search"><MagnifyingGlass size={22} /><span className="sr-only">Pesquisar na ajuda</span><input placeholder="Pesquise por processo, licença, prazo ou funcionalidade" /></label><div className="help-grid">{guides.map(([title, description, Icon]) => <Link to="/app/ajuda" key={title}><Icon size={27} /><div><h2>{title}</h2><p>{description}</p></div><ArrowRight size={18} /></Link>)}</div><div className="help-layout"><section className="panel help-faq"><p className="eyebrow">Dúvidas frequentes</p><h2>Respostas rápidas</h2><details><summary>Como cadastrar um novo processo?</summary><p>Acesse Processos, selecione “Novo processo”, preencha os campos obrigatórios e salve o registro.</p></details><details><summary>Onde acompanho os próximos vencimentos?</summary><p>Use a Visão geral para prioridades ou abra Licenças → Calendário para consultar todos os vencimentos.</p></details><details><summary>Como anexar um documento?</summary><p>No detalhe de um processo ou no módulo Documentos, selecione o arquivo e defina o vínculo correspondente.</p></details><details><summary>Quem pode alterar permissões?</summary><p>Administradores e gestores autorizados podem editar perfis no módulo Usuários.</p></details></section><aside className="help-contact"><ChatCircleText size={30} /><p className="eyebrow eyebrow--green">Suporte especializado</p><h2>Não encontrou o que precisava?</h2><p>Descreva sua dúvida para a equipe de suporte. Inclua o número do processo quando houver.</p><a className="button button--primary" href="mailto:suporte@celerityambiental.com.br">Falar com o suporte</a><small>Resposta em horário comercial</small></aside></div></>
}

export function NotificationsPage() {
  const alerts = [['Prazo vence em 3 dias', 'A exigência do processo SRH 2026/001395 precisa de atenção.', 'Novo'], ['Licença próxima do vencimento', 'LS nº 2025-0841 vence em 7 dias.', 'Pendente'], ['Pagamento confirmado', 'Solicitação nº 2026-0861 foi marcada como paga.', 'Lida']]
  return <><Breadcrumb items={['Notificações']} /><PageHeader title="Notificações" description="Atualizações importantes da sua operação." /><section className="panel notifications-list">{alerts.map(([title, text, status], index) => <article key={title} className={index === 0 ? 'unread' : ''}><span className="notification-icon"><Bell size={20} /></span><div><h2>{title}</h2><p>{text}</p><time>{index === 0 ? 'há 12 minutos' : index === 1 ? 'há 2 horas' : 'ontem, 16:40'}</time></div><StatusBadge>{status}</StatusBadge></article>)}</section></>
}

export function NotFoundPage() {
  return <div className="not-found"><span>404</span><h1>Página não encontrada.</h1><p>O endereço pode ter mudado ou não está disponível para o seu perfil.</p><Button as={Link} to="/">Voltar ao início</Button></div>
}
