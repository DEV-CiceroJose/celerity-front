import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle, Eye, EyeSlash, LockKey, ShieldCheck } from '../components/icons'
import { Link, useNavigate } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { Button, Field } from '../components/ui'
import { authService } from '../services/authService'

function AuthShell({ children, quote = 'Precisão para acompanhar. Agilidade para decidir.' }) {
  return (
    <div className="auth-shell">
      <aside className="auth-visual">
        <div className="auth-visual__top"><Brand light /><Link to="/"><ArrowLeft size={17} /> Voltar ao site</Link></div>
        <div className="auth-visual__content"><p className="eyebrow eyebrow--green">Gestão ambiental integrada</p><h2>{quote}</h2><p>Processos, licenças e prazos reunidos em uma plataforma técnica e segura.</p></div>
        <div className="auth-visual__foot"><ShieldCheck size={21} /><span>Acesso protegido e rastreável</span></div>
      </aside>
      <main className="auth-main">{children}</main>
    </div>
  )
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const data = new FormData(event.currentTarget)
    if (!data.get('email') || !data.get('password')) return setError('Informe seu e-mail e senha para continuar.')
    setLoading(true)
    try {
      await authService.login({ email: data.get('email'), password: data.get('password') })
      navigate('/app/dashboard')
    } catch (loginError) {
      setError(loginError.message)
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <div className="auth-card">
        <p className="eyebrow">Acesso ao sistema</p><h1>Bem-vindo de volta.</h1><p className="auth-card__lead">Entre com suas credenciais da Celerity Ambiental.</p>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <form onSubmit={submit} noValidate>
          <Field label="E-mail ou usuário" required>{({ id, ...props }) => <input id={id} name="email" type="email" autoComplete="email" placeholder="nome@empresa.com.br" {...props} />}</Field>
          <Field label="Senha" required>{({ id, ...props }) => <div className="password-input"><input id={id} name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Sua senha" {...props} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}</button></div>}</Field>
          <div className="form-options"><label className="checkbox"><input type="checkbox" name="remember" /> <span>Lembrar meu acesso</span></label><Link to="/recuperar-senha">Esqueci minha senha</Link></div>
          <Button className="button--full" disabled={loading}>{loading ? 'Entrando…' : 'Entrar no sistema'}</Button>
        </form>
        <div className="demo-access"><strong>Acesso de demonstração</strong><span>demo@celerityambiental.com.br</span><span>Senha: Celerity@2026</span></div>
        <p className="auth-card__footer">Ainda não possui acesso? <Link to="/cadastro">Solicite seu cadastro</Link></p>
      </div>
    </AuthShell>
  )
}

export function RegisterPage() {
  const [sent, setSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const data = new FormData(event.currentTarget)
    if (data.get('password') !== data.get('passwordConfirmation')) return setError('As senhas informadas não coincidem.')
    if (String(data.get('password')).length < 8) return setError('A senha deve ter pelo menos 8 caracteres.')
    setLoading(true)
    try {
      await authService.register({
        name: data.get('name'),
        company: data.get('company'),
        email: data.get('email'),
        phone: data.get('phone'),
        role: data.get('role'),
        password: data.get('password'),
      })
      setSent(true)
    } catch (registerError) {
      setError(registerError.message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) return <AuthShell quote="Seu novo acesso à operação ambiental."><div className="auth-card auth-card--center"><span className="success-icon"><CheckCircle size={36} weight="fill" /></span><p className="eyebrow">Cadastro concluído</p><h1>Seu acesso foi criado.</h1><p className="auth-card__lead">Você já pode entrar no sistema usando o e-mail e a senha informados.</p><Button as={Link} to="/login" variant="dark">Ir para o login</Button></div></AuthShell>
  return (
    <AuthShell quote="Sua equipe conectada a uma operação ambiental mais clara.">
      <div className="auth-card auth-card--wide"><p className="eyebrow">Novo acesso</p><h1>Crie seu acesso.</h1><p className="auth-card__lead">Preencha seus dados e defina uma senha para entrar no sistema.</p>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-grid"><Field label="Nome completo" required>{({ id }) => <input id={id} name="name" required placeholder="Seu nome" />}</Field><Field label="Empresa" required>{({ id }) => <input id={id} name="company" required placeholder="Nome da empresa" />}</Field></div>
          <div className="form-grid"><Field label="E-mail profissional" required>{({ id }) => <input id={id} name="email" type="email" required placeholder="nome@empresa.com.br" />}</Field><Field label="Telefone" required>{({ id }) => <input id={id} name="phone" required placeholder="(85) 99999-0000" />}</Field></div>
          <Field label="Perfil de acesso" required>{({ id }) => <select id={id} name="role" defaultValue="" required><option value="" disabled>Selecione uma opção</option><option>Gestor</option><option>Técnico</option><option>Administrativo</option><option>Financeiro</option></select>}</Field>
          <div className="form-grid">
            <Field label="Crie uma senha" hint="Mínimo de 8 caracteres." required>{({ id }) => <div className="password-input"><input id={id} name="password" type={showPassword ? 'text' : 'password'} required autoComplete="new-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}</button></div>}</Field>
            <Field label="Confirme a senha" required>{({ id }) => <input id={id} name="passwordConfirmation" type={showPassword ? 'text' : 'password'} required autoComplete="new-password" />}</Field>
          </div>
          <label className="checkbox checkbox--terms"><input type="checkbox" required /><span>Confirmo que as informações são verdadeiras e aceito os termos de uso.</span></label>
          <Button className="button--full" icon={ArrowRight} disabled={loading}>{loading ? 'Criando acesso…' : 'Criar meu acesso'}</Button>
        </form><p className="auth-card__footer">Já possui acesso? <Link to="/login">Entrar no sistema</Link></p>
      </div>
    </AuthShell>
  )
}

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  return <AuthShell quote="Recupere seu acesso com segurança."><div className="auth-card auth-card--center"><span className="auth-lock"><LockKey size={28} /></span><p className="eyebrow">Recuperação de acesso</p><h1>{sent ? 'Verifique seu e-mail.' : 'Esqueceu sua senha?'}</h1><p className="auth-card__lead">{sent ? 'Enviamos as instruções de redefinição. O link é válido por 30 minutos.' : 'Informe seu e-mail e enviaremos as instruções para criar uma nova senha.'}</p>{!sent && <form onSubmit={(event) => { event.preventDefault(); setSent(true) }}><Field label="E-mail" required>{({ id }) => <input id={id} type="email" required placeholder="nome@empresa.com.br" />}</Field><Button className="button--full">Enviar instruções</Button></form>}<Link className="back-link" to="/login"><ArrowLeft size={17} /> Voltar para o login</Link></div></AuthShell>
}

export function ResetPasswordPage() {
  return <AuthShell><div className="auth-card"><p className="eyebrow">Nova senha</p><h1>Redefina seu acesso.</h1><p className="auth-card__lead">Use ao menos 8 caracteres, incluindo letras e números.</p><form onSubmit={(event) => { event.preventDefault(); window.location.href = '/login' }}><Field label="Nova senha" required>{({ id }) => <input id={id} type="password" required />}</Field><Field label="Confirme a nova senha" required>{({ id }) => <input id={id} type="password" required />}</Field><Button className="button--full">Salvar nova senha</Button></form></div></AuthShell>
}

export function SessionExpiredPage() {
  return <AuthShell quote="Seus dados permanecem protegidos."><div className="auth-card auth-card--center"><span className="auth-lock"><LockKey size={28} /></span><p className="eyebrow">Sessão encerrada</p><h1>Seu acesso expirou.</h1><p className="auth-card__lead">Por segurança, encerramos a sessão após um período de inatividade.</p><Button as={Link} to="/login" className="button--full">Entrar novamente</Button></div></AuthShell>
}
