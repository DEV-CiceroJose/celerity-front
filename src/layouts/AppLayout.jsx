import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell, Buildings, CalendarDots, CaretDown, ChartPieSlice, ClipboardText, CreditCard,
  FileText, Gear, ListChecks, MagnifyingGlass, NotePencil, SidebarSimple, SignOut,
  UserCircle, UsersThree, WarningCircle, X,
} from '@phosphor-icons/react'
import { Brand } from '../components/Brand'
import { authService } from '../services/authService'

const menu = [
  { label: 'Visão geral', to: '/app/dashboard', icon: ChartPieSlice },
  { label: 'Empresas', to: '/app/empresas', icon: Buildings },
  { label: 'Processos', to: '/app/processos', icon: ClipboardText },
  { label: 'Poços', to: '/app/pocos', icon: NotePencil },
  { label: 'Licenças', to: '/app/licencas', icon: FileText },
  { label: 'Exigências', to: '/app/exigencias', icon: WarningCircle },
  { label: 'Pagamentos', to: '/app/pagamentos', icon: CreditCard },
  { label: 'Controle mensal', to: '/app/controle-mensal', icon: CalendarDots },
  { label: 'Assessoria', to: '/app/assessoria', icon: ListChecks },
  { label: 'Documentos', to: '/app/documentos', icon: FileText },
]

const adminMenu = [
  { label: 'Relatórios', to: '/app/relatorios', icon: ChartPieSlice },
  { label: 'Usuários', to: '/app/usuarios', icon: UsersThree },
  { label: 'Configurações', to: '/app/configuracoes', icon: Gear },
]

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => JSON.parse(localStorage.getItem('celerity_preferences') || '{}').compactSidebar || false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const session = authService.getSession()

  useEffect(() => setMobileOpen(false), [location.pathname])
  useEffect(() => {
    const onExpired = () => navigate('/sessao-expirada')
    window.addEventListener('celerity:session-expired', onExpired)
    return () => window.removeEventListener('celerity:session-expired', onExpired)
  }, [navigate])

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
      {mobileOpen && <button className="sidebar-scrim" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <Brand compact={collapsed} to="/app/dashboard" />
          <button className="sidebar__mobile-close" onClick={() => setMobileOpen(false)} aria-label="Fechar menu"><X size={22} /></button>
        </div>
        <nav aria-label="Menu principal">
          <NavGroup label="Operação" items={menu} />
          <NavGroup label="Gestão" items={adminMenu} />
        </nav>
        <div className="sidebar__footer">
          <Link className="sidebar__support" to="/app/ajuda"><span>?</span>{!collapsed && <div><strong>Central de ajuda</strong><small>Guias e suporte</small></div>}</Link>
          <button onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}><SidebarSimple size={20} />{!collapsed && <span>Recolher menu</span>}</button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><SidebarSimple size={23} /></button>
          <label className="global-search"><MagnifyingGlass size={19} /><span className="sr-only">Pesquisa global</span><input placeholder="Pesquisar processos, empresas ou documentos" /><kbd>⌘ K</kbd></label>
          <div className="app-header__actions">
            <NavLink to="/app/notificacoes" className="notification-button" aria-label="Notificações"><Bell size={21} /><span /></NavLink>
            <button className="user-menu" type="button">
              <span className="avatar">MC</span>
              <span className="user-menu__copy"><strong>{session?.name || 'Mariana Costa'}</strong><small>{session?.role || 'Gestora'}</small></span>
              <CaretDown size={16} />
            </button>
            <button className="logout-button" onClick={logout} title="Sair" aria-label="Sair"><SignOut size={20} /></button>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  )
}
