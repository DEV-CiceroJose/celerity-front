import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell, Buildings, CalendarDots, CaretDown, ChartPieSlice, ClipboardText, CreditCard,
  FileText, Gear, ListChecks, MagnifyingGlass, NotePencil, SidebarSimple, SignOut,
  ShieldCheck, UserCircle, UsersThree, WarningCircle, X,
} from '@phosphor-icons/react'
import { Brand } from '../components/Brand'
import { ContextHelp, GlobalSearch, NetworkBanner, Onboarding } from '../components/Experience'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { authService } from '../services/authService'

const menu = [
  { label: 'Visão geral', to: '/app/dashboard', icon: ChartPieSlice },
  { label: 'Empresas', to: '/app/empresas', icon: Buildings },
  { label: 'Processos', to: '/app/processos', icon: ClipboardText },
  { label: 'Poços', to: '/app/pocos', icon: NotePencil },
  { label: 'Licenças', to: '/app/licencas', icon: FileText },
  { label: 'Exigências', to: '/app/exigencias', icon: WarningCircle },
  { label: 'Pagamentos', to: '/app/pagamentos', icon: CreditCard },
  { label: 'Calendário', to: '/app/calendario', icon: CalendarDots },
  { label: 'Controle mensal', to: '/app/controle-mensal', icon: CalendarDots },
  { label: 'Assessoria', to: '/app/assessoria', icon: ListChecks },
  { label: 'Documentos', to: '/app/documentos', icon: FileText },
]

const adminMenu = [
  { label: 'Relatórios', to: '/app/relatorios', icon: ChartPieSlice },
  { label: 'Usuários', to: '/app/usuarios', icon: UsersThree },
  { label: 'Configurações', to: '/app/configuracoes', icon: Gear },
]

const roleNavigation = {
  Técnico: {
    operation: ['Visão geral', 'Empresas', 'Processos', 'Poços', 'Licenças', 'Exigências', 'Calendário', 'Assessoria', 'Documentos'],
    management: ['Configurações'],
  },
  Financeiro: {
    operation: ['Visão geral', 'Empresas', 'Pagamentos', 'Calendário', 'Documentos'],
    management: ['Relatórios', 'Configurações'],
  },
  'Somente leitura': {
    operation: menu.map((item) => item.label),
    management: ['Relatórios', 'Configurações'],
  },
}

function navigationForRole(role) {
  const rules = roleNavigation[role]
  if (!rules) return { operation: menu, management: adminMenu }
  return {
    operation: menu.filter((item) => rules.operation.includes(item.label)),
    management: adminMenu.filter((item) => rules.management.includes(item.label)),
  }
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => JSON.parse(localStorage.getItem('celerity_preferences') || '{}').compactSidebar || false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const session = authService.getSession()
  const navigation = navigationForRole(session?.role)
  const activeModule = [...menu, ...adminMenu].find((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`))
  const restrictedRoute = Boolean(roleNavigation[session?.role] && activeModule && ![...navigation.operation, ...navigation.management].some((item) => item.to === activeModule.to))
  const mobileItems = session?.role === 'Financeiro'
    ? menu.filter((item) => ['Visão geral', 'Pagamentos', 'Calendário'].includes(item.label))
    : menu.filter((item) => ['Visão geral', 'Processos', 'Calendário'].includes(item.label))
  const initials = (session?.name || 'Mariana Costa').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  useScrollReveal(location.pathname)

  useEffect(() => setMobileOpen(false), [location.pathname])
  useEffect(() => {
    const onExpired = () => navigate('/sessao-expirada')
    window.addEventListener('celerity:session-expired', onExpired)
    return () => window.removeEventListener('celerity:session-expired', onExpired)
  }, [navigate])
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') { setSearchOpen(false); setUserOpen(false) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const logout = () => {
    authService.logout()
    navigate('/login')
  }

  const NavGroup = ({ label, items }) => (
    <div className="sidebar__group">
      {!collapsed && <p>{label}</p>}
      {items.map(({ label: itemLabel, to, icon: Icon }) => (
        <NavLink key={to} to={to} end={to === '/app/dashboard'} title={collapsed ? itemLabel : undefined}>
          <Icon size={21} weight="regular" aria-hidden="true" />
          {!collapsed && <span>{itemLabel}</span>}
        </NavLink>
      ))}
    </div>
  )

  return (
    <div className={`app-shell ${collapsed ? 'app-shell--collapsed' : ''}`}>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Onboarding session={session} />
      {mobileOpen && <button className="sidebar-scrim" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <Brand compact={collapsed} to="/app/dashboard" />
          <button className="sidebar__mobile-close" onClick={() => setMobileOpen(false)} aria-label="Fechar menu"><X size={22} /></button>
        </div>
        <nav aria-label="Menu principal">
          <NavGroup label="Operação" items={navigation.operation} />
          {navigation.management.length > 0 && <NavGroup label="Gestão" items={navigation.management} />}
        </nav>
        <div className="sidebar__footer">
          <Link className="sidebar__support" to="/app/ajuda"><span>?</span>{!collapsed && <div><strong>Central de ajuda</strong><small>Guias e suporte</small></div>}</Link>
          <button onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}><SidebarSimple size={20} />{!collapsed && <span>Recolher menu</span>}</button>
        </div>
      </aside>

      <div className="app-main">
        <NetworkBanner />
        <header className="app-header">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><SidebarSimple size={23} /></button>
          <button className="global-search" onClick={() => setSearchOpen(true)}><MagnifyingGlass size={19} /><span>Pesquisar processos, empresas ou documentos</span><kbd>⌘ K</kbd></button>
          <div className="app-header__actions">
            <button className="mobile-search-button" type="button" onClick={() => setSearchOpen(true)} aria-label="Abrir pesquisa global"><MagnifyingGlass size={21} /></button>
            <NavLink to="/app/notificacoes" className="notification-button" aria-label="Notificações"><Bell size={21} /><span /></NavLink>
            <button className="user-menu" type="button" aria-expanded={userOpen} onClick={() => setUserOpen(!userOpen)}>
              <span className="avatar">{initials}</span>
              <span className="user-menu__copy"><strong>{session?.name || 'Mariana Costa'}</strong><small>{session?.role || 'Gestora'}</small></span>
              <CaretDown size={16} />
            </button>
            {userOpen && <div className="profile-dropdown"><div><span className="avatar">{initials}</span><p><strong>{session?.name}</strong><small>{session?.email}</small></p></div><Link to="/app/configuracoes" onClick={() => setUserOpen(false)}>Preferências</Link><Link to="/app/ajuda" onClick={() => setUserOpen(false)}>Central de ajuda</Link><button onClick={logout}><SignOut size={17} /> Sair da conta</button></div>}
            <button className="logout-button" onClick={logout} title="Sair" aria-label="Sair"><SignOut size={20} /></button>
          </div>
        </header>
        <main className="page-content">{restrictedRoute ? <section className="access-denied"><span><ShieldCheck size={30} /></span><p className="eyebrow">Acesso por perfil</p><h1>Este módulo não faz parte da sua área de trabalho.</h1><p>O menu foi personalizado para as responsabilidades do perfil <strong>{session?.role}</strong>. Se precisar consultar este conteúdo, solicite a liberação ao gestor da conta.</p><Link className="button button--primary" to="/app/dashboard">Voltar para a visão geral</Link></section> : <Outlet />}</main>
        <nav className="mobile-bottom-nav" aria-label="Atalhos principais">{mobileItems.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} end={to === '/app/dashboard'}><Icon size={21} /><span>{label === 'Visão geral' ? 'Início' : label}</span></NavLink>)}<button type="button" onClick={() => setMobileOpen(true)}><SidebarSimple size={21} /><span>Mais</span></button></nav>
        <ContextHelp />
      </div>
    </div>
  )
}
