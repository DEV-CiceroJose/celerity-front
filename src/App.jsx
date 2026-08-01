import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { authService } from './services/authService'
import { LandingPage } from './pages/LandingPage'
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage, SessionExpiredPage } from './pages/AuthPages'
import { DashboardPage } from './pages/DashboardPage'
import { CalendarPage, MonthlyControlPage, ResourceDetailPage, ResourceFormPage, ResourceListPage } from './pages/ResourcePages'
import { HelpPage, NotFoundPage, NotificationsPage, ReportsPage, SettingsPage } from './pages/UtilityPages'

function ProtectedRoute() {
  return authService.getSession() ? <AppLayout /> : <Navigate to="/login" replace />
}

const resources = ['empresas', 'processos', 'licencas', 'exigencias', 'pagamentos', 'assessoria', 'documentos', 'usuarios']

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
      <Route path="/sessao-expirada" element={<SessionExpiredPage />} />

      <Route path="/app" element={<ProtectedRoute />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        {resources.map((resource) => (
          <Route key={resource} path={resource}>
            <Route index element={<ResourceListPage resource={resource} />} />
            <Route path="novo" element={<ResourceFormPage resource={resource} />} />
            <Route path=":id" element={<ResourceDetailPage resource={resource} />} />
            <Route path=":id/editar" element={<ResourceFormPage resource={resource} />} />
          </Route>
        ))}
        <Route path="pocos">
          <Route index element={<ResourceListPage resource="pocos" />} />
          <Route path="acompanhamento" element={<ResourceListPage resource="pocos" tab="Em acompanhamento" />} />
          <Route path="licenciados" element={<ResourceListPage resource="pocos" tab="Licenciados" />} />
          <Route path="indeferidos" element={<ResourceListPage resource="pocos" tab="Indeferidos" />} />
          <Route path="em-exigencia" element={<ResourceListPage resource="pocos" tab="Em exigência" />} />
          <Route path="novo" element={<ResourceFormPage resource="pocos" />} />
          <Route path=":id" element={<ResourceDetailPage resource="pocos" />} />
          <Route path=":id/editar" element={<ResourceFormPage resource="pocos" />} />
        </Route>
        <Route path="licencas/calendario" element={<CalendarPage />} />
        <Route path="controle-mensal" element={<MonthlyControlPage />} />
        <Route path="relatorios" element={<ReportsPage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
        <Route path="notificacoes" element={<NotificationsPage />} />
        <Route path="ajuda" element={<HelpPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
