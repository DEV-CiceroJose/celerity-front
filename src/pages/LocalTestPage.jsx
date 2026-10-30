import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Field, PageHeader } from '../components/ui'
import { LoadingState } from '../components/Experience'
import { apiRequest } from '../services/api'
import { authService } from '../services/authService'
import { LOCAL_TEST_MODE, LICENSE_REMINDER_DAYS } from '../utils/config'
import { formatDate } from '../utils/dates'

let entryRequest
export function LocalTestEntry() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  useEffect(() => {
    if (!LOCAL_TEST_MODE) { navigate('/login', { replace: true }); return }
    let active = true
    if (!entryRequest) entryRequest = authService.login({ email: 'demo@celerityambiental.com.br', password: 'Celerity@2026' }).finally(() => { entryRequest = null })
    entryRequest.then(() => { if (active) { localStorage.setItem('celerity_onboarding_done', 'true'); navigate('/app/teste-alertas', { replace: true }) } }).catch((reason) => { if (active) setError(reason.message) })
    return () => { active = false }
  }, [navigate])
  return <main className="local-test-entry">{error ? <p role="alert">{error}</p> : <LoadingState />}<p>Abrindo a demonstração com dados fictícios…</p></main>
}

export function LocalTestPage() {
  const [state, setState] = useState(null)
  const [error, setError] = useState('')
  const [result, setResult] = useState('')
  const [busy, setBusy] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [licenseId, setLicenseId] = useState('')
  const [provider, setProvider] = useState('brevo')
  const [sender, setSender] = useState('')
  const [password, setPassword] = useState('')
  const [apiKey, setApiKey] = useState('')
  const requestId = useRef(null)
  useEffect(() => {
    let active = true
    apiRequest('/teste-local/email/').then((data) => {
      if (!active) return
      setState(data)
      setProvider(data.serverReady ? 'server' : 'brevo')
      setLicenseId(String(data.licenses.find((license) => license.days >= 0 && license.days <= LICENSE_REMINDER_DAYS)?.id || data.licenses[0]?.id || ''))
    }).catch((reason) => { if (active) setError(reason.message) })
    return () => { active = false }
  }, [])
  const selected = state?.licenses.find((license) => String(license.id) === licenseId)
  const resetRequest = () => { requestId.current = null; setResult('') }
  const send = async (event) => {
    event.preventDefault()
    if (busy) return
    setError(''); setResult(''); setBusy(true)
    requestId.current ||= crypto.randomUUID()
    try {
      const response = await apiRequest('/teste-local/email/', { method: 'POST', body: JSON.stringify({
        recipient, licenseId: Number(licenseId), requestId: requestId.current, provider,
        ...(provider === 'gmail' ? { sender, appPassword: password } : {}),
        ...(provider === 'brevo' ? { sender, apiKey } : {}),
      }) })
      setResult(response.detail)
      if (response.sent || response.alreadySent) { requestId.current = null; setPassword(''); setApiKey('') }
    } catch (reason) {
      setError(reason.message)
      window.requestAnimationFrame(() => document.getElementById('local-test-send-feedback')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    }
    finally { setBusy(false) }
  }
  return <>
    <PageHeader title="Teste de alertas e e-mail" description="Dados fictícios, alerta de renovação ativo e envio manual para o endereço escolhido por você." />
    <section className="panel local-test-panel">
      <div><span className="badge badge--warning">Demonstração local</span><h2>Confira o alerta antes de enviar</h2><p>Uma licença vence em 30 dias e outra está vencida. Abra a central para testar leitura, adiamento e acesso ao cadastro.</p><Button as={Link} to="/app/notificacoes" variant="secondary">Ver alertas ativos</Button></div>
      {!state && error && <p className="form-alert" role="alert">{error}</p>}
      {!state && !error && <LoadingState />}
      {state && <form onSubmit={send} className="local-test-form">
        <h2>Enviar uma mensagem real</h2>
        <Field label="Licença de teste">{({ id }) => <select id={id} value={licenseId} onChange={(event) => { setLicenseId(event.target.value); resetRequest() }} disabled={busy}>{state.licenses.filter((license) => license.days <= LICENSE_REMINDER_DAYS).map((license) => <option value={license.id} key={license.id}>{license.number}</option>)}</select>}</Field>
        {selected && <p>{selected.company} · vencimento: {formatDate(selected.expiry)} · {selected.days < 0 ? `vencida há ${Math.abs(selected.days)} dias` : `vence em ${selected.days} dias`}.</p>}
        <Field label="E-mail que receberá o teste" required>{({ id }) => <input id={id} type="email" required value={recipient} onChange={(event) => { setRecipient(event.target.value); resetRequest() }} placeholder="seuemail@exemplo.com" disabled={busy} />}</Field>
        <Field label="Serviço de envio">{({ id }) => <select id={id} value={provider} disabled={busy} onChange={(event) => { setProvider(event.target.value); resetRequest() }}><option value="brevo">Brevo — envio real por API</option><option value="gmail">Gmail — senha de app</option>{state.serverReady && <option value="server">Conta já configurada no servidor</option>}</select>}</Field>
        {provider === 'brevo' && <div className="local-test-account">
          <h3>Conecte o Brevo para enviar de verdade</h3>
          <ol><li><a href="https://www.brevo.com/pt/" target="_blank" rel="noreferrer">Crie sua conta Brevo</a>.</li><li>No Brevo, cadastre e valide o endereço que enviará os e-mails.</li><li>Em <strong>SMTP e API → Chaves de API</strong>, crie uma chave para o teste Celerity.</li><li>Preencha o remetente e a chave abaixo, depois clique em enviar.</li></ol>
          <p>Use uma chave de API, não uma chave SMTP. A chave é usada apenas nesta tentativa e não é salva. Não é necessário fornecer sua senha pessoal.</p>
          <Field label="Remetente validado no Brevo" required>{({ id }) => <input id={id} type="email" required value={sender} onChange={(event) => { setSender(event.target.value); resetRequest() }} disabled={busy} autoComplete="off" />}</Field>
          <Field label="Chave de API do Brevo" required>{({ id }) => <input id={id} type="password" required value={apiKey} onChange={(event) => { setApiKey(event.target.value); resetRequest() }} disabled={busy} autoComplete="new-password" />}</Field>
          <a href="https://developers.brevo.com/docs/send-a-transactional-email" target="_blank" rel="noreferrer">Guia oficial de envio e configuração do remetente</a>
        </div>}
        {provider === 'gmail'  && <div className="local-test-account">
          <h3>Conecte uma conta Gmail para este envio</h3>
          <p>O endereço de destino, sozinho, não permite enviar mensagens. Use sua conta Gmail e uma senha de app do Google. Esses dados são usados apenas nesta tentativa e não são salvos.</p>
          <ol><li>Ative a verificação em duas etapas da sua conta Google.</li><li>Abra <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer">Senhas de app do Google</a> e crie uma senha para o teste Celerity.</li><li>Preencha abaixo o endereço da conta e a senha de app de 16 caracteres.</li></ol>
          <p><a href="https://support.google.com/accounts/answer/185833?hl=pt-BR" target="_blank" rel="noreferrer">Instruções do Google e disponibilidade de senhas de app</a></p>
          <Field label="Gmail que enviará a mensagem" required>{({ id }) => <input id={id} type="email" required value={sender} onChange={(event) => { setSender(event.target.value); resetRequest() }} disabled={busy} autoComplete="off" />}</Field>
          <Field label="Senha de app do Google" required hint="Use a senha de app de 16 caracteres, não a senha normal da conta.">{({ id, ...props }) => <input id={id} {...props} type="password" required value={password} onChange={(event) => { setPassword(event.target.value); resetRequest() }} disabled={busy} autoComplete="new-password" />}</Field>
        </div>}
        {error && <p className="form-alert" id="local-test-send-feedback" role="alert">{error}</p>}
        {result && <p className="success-banner" role="status">{result}</p>}
        <Button type="submit" disabled={busy || !licenseId}>{busy ? 'Enviando…' : 'Enviar e-mail real de teste'}</Button>
        <p>A mensagem terá o assunto “[TESTE LOCAL] Celerity: solicite a renovação da licença”. O envio só ocorre ao clicar no botão. O aceite do provedor não garante chegada na caixa de entrada; confira também o spam.</p>
      </form>}
    </section>
  </>
}
