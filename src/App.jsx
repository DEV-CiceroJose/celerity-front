import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { authService } from './services/authService'

const LandingPage = lazy(() => import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })))
const LoginPage = lazy(() => import('./pages/AuthPages').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('./pages/AuthPages').then((module) => ({ default: module.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('./pages/AuthPages').then((module) => ({ default: module.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./pages/AuthPages').then((module) => ({ default: module.ResetPasswordPage })))
const SessionExpiredPage = lazy(() => import('./pages/AuthPages').then((module) => ({ default: module.SessionExpiredPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const CalendarPage = lazy(() => import('./pages/ResourcePages').then((module) => ({ default: module.CalendarPage })))
const MonthlyControlPage = lazy(() => import('./pages/ResourcePages').then((module) => ({ default: module.MonthlyControlPage })))
const ResourceDetailPage = lazy(() => import('./pages/ResourcePages').then((module) => ({ default: module.ResourceDetailPage })))
const ResourceFormPage = lazy(() => import('./pages/ResourcePages').then((module) => ({ default: module.ResourceFormPage })))
const ResourceListPage = lazy(() => import('./pages/ResourcePages').then((module) => ({ default: module.ResourceListPage })))
const HelpPage = lazy(() => import('./pages/UtilityPages').then((module) => ({ default: module.HelpPage })))
const NotFoundPage = lazy(() => import('./pages/UtilityPages').then((module) => ({ default: module.NotFoundPage })))
const NotificationsPage = lazy(() => import('./pages/UtilityPages').then((module) => ({ default: module.NotificationsPage })))
const ReportsPage = lazy(() => import('./pages/UtilityPages').then((module) => ({ default: module.ReportsPage })))
const SettingsPage = lazy(() => import('./pages/UtilityPages').then((module) => ({ default: module.SettingsPage })))

function ProtectedRoute() {
  return authService.getSession() ? <AppLayout /> : <Navigate to="/login" replace />
}

const resources = ['empresas', 'processos', 'licencas', 'exigencias', 'pagamentos', 'assessoria', 'documentos', 'usuarios']

export default function App() {
  return (
    <Suspense fallback={<div className="route-loader" role="status"><i /><strong>Carregando sua experiência</strong><span>Organizando as informações do sistema…</span></div>}><Routes>
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
        <Route path="calendario" element={<CalendarPage />} />
        <Route path="controle-mensal" element={<MonthlyControlPage />} />
        <Route path="relatorios" element={<ReportsPage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
        <Route path="notificacoes" element={<NotificationsPage />} />
        <Route path="ajuda" element={<HelpPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes></Suspense>
  )
}
