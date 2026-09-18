import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, Buildings, Check, CheckCircle, ClipboardText, ClockCountdown, Copy, Drop, Files, Headset, List, MapPin, ShieldCheck, UsersThree, Warning, WhatsappLogo, X } from '../components/icons'
import { Link } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { Button, StatusBadge } from '../components/ui'
import { mockRows } from '../data/mockData'
import { useScrollReveal } from '../hooks/useScrollReveal'
import '../styles/landing.css'

const pains = [
  [ClockCountdown, 'O prazo chega. A informação, não.', 'A renovação ficou na planilha de alguém. A equipe só percebe quando já precisa correr para reunir os documentos.', 'Datas e prioridades visíveis para a equipe.'],
  [Files, 'Qual é a versão certa do documento?', 'Entre pastas, e-mails e conversas, encontrar uma licença ou comprovar uma entrega toma mais tempo do que deveria.', 'Documentos ligados ao processo correspondente.'],
  [UsersThree, 'Todos acompanham. Ninguém assume.', 'Uma exigência fica sem resposta porque não está claro quem precisa agir, o que falta e qual é o próximo passo.', 'Responsáveis e pendências no mesmo lugar.'],
  [Warning, 'A surpresa vira urgência.', 'Sem uma visão do conjunto, a gestão descobre os gargalos tarde e perde espaço para planejar a operação.', 'Uma leitura clara do que precisa de atenção.'],
]
const comparisons = [
  ['Prazos', 'Espalhados entre agendas e planilhas.', 'Vencimentos reunidos e prioridades visíveis.'],
  ['Documentos', 'Arquivos soltos, sem contexto.', 'Licenças e evidências ligadas à demanda.'],
  ['Responsáveis', 'Depende de perguntar para a equipe.', 'Cada processo com uma referência definida.'],
  ['Decisões', 'Reuniões para descobrir o que aconteceu.', 'Informações organizadas para decidir o próximo passo.'],
]
const services = [
  [ShieldCheck, 'Licenciamento e regularização', 'Vai começar, ampliar ou regularizar uma atividade?', 'Organização documental, condução de processos e apoio no atendimento às exigências ambientais.', 'Licenciamento e regularização'],
  [Headset, 'Assessoria ambiental contínua', 'A licença saiu. E agora, quem acompanha?', 'Acompanhamento de condicionantes, entregas e renovações para dar continuidade à gestão ambiental.', 'Condicionantes e pós-licença'],
  [Drop, 'Poços e recursos hídricos', 'Precisa organizar a documentação do seu poço?', 'Apoio técnico em processos de outorga, autorizações, exigências e acompanhamento documental.', 'Poços e outorgas'],
  [ClipboardText, 'Projetos e documentação técnica', 'Faltam estudos ou informações para avançar?', 'Levantamento das necessidades do empreendimento e organização dos documentos técnicos de cada etapa.', 'Projetos e documentos'],
]
const modules = [
  { id: 'processos', label: 'Processos', icon: ClipboardText, title: 'Cada processo, com contexto.', text: 'Empresa, situação e responsável reunidos para entender o andamento sem procurar em várias fontes.' },
  { id: 'licencas', label: 'Licenças', icon: ShieldCheck, title: 'Saiba o que precisa de acompanhamento.', text: 'Consulte a situação, a validade e o processo de origem de cada licença.' },
  { id: 'documentos', label: 'Documentos', icon: Files, title: 'Encontre o arquivo junto à sua demanda.', text: 'Identifique a empresa, o tipo de arquivo e o responsável pelo documento.' },
]
const faqs = [
  ['A Celerity é uma consultoria ou uma plataforma?', 'A proposta reúne os dois: orientação técnica para conduzir demandas ambientais e uma plataforma para organizar processos, prazos, responsáveis e documentos. O diagnóstico define o escopo adequado para a sua empresa.'],
  ['Ainda uso planilhas. Por onde começo?', 'Comece levantando seus processos em andamento, licenças e vencimentos conhecidos. No diagnóstico, esses materiais ajudam a definir as prioridades e a planejar a organização dos dados.'],
  ['Posso contratar ajuda para uma demanda específica?', 'Conte qual é a necessidade: licenciamento, documentação, poço, outorga ou acompanhamento após a licença. A equipe avalia o contexto para propor o escopo de atendimento.'],
  ['Já tenho uma equipe ambiental. Como vocês ajudam?', 'A Celerity pode apoiar sua equipe na organização e no acompanhamento das demandas. As responsabilidades e o escopo técnico são definidos conforme a necessidade da operação.'],
  ['A licença e a outorga do poço são a mesma coisa?', 'São instrumentos distintos. A análise da atividade e do uso da água orienta quais processos precisam ser acompanhados. Consulte os canais oficiais da SEMACE e da SRH indicados nesta página e leve os documentos disponíveis ao diagnóstico.'],
  ['Solicitar um diagnóstico já cria minha conta?', 'Não. A conversa sobre a sua necessidade é separada do acesso à plataforma. Para criar uma conta, use “Criar acesso”; se já possui cadastro, use “Área do cliente”.'],
]

function PlatformPreview() {
  const [active, setActive] = useState('processos')
  const [selected, setSelected] = useState(null)
  const current = modules.find((module) => module.id === active)
  const selectModule = (id) => { setActive(id); setSelected(null) }
  const onTabKey = (event, index) => {
    let next
    if (event.key === 'ArrowRight') next = (index + 1) % modules.length
    if (event.key === 'ArrowLeft') next = (index + modules.length - 1) % modules.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = modules.length - 1
    if (next === undefined) return
    event.preventDefault()
    selectModule(modules[next].id)
    document.getElementById(`preview-tab-${modules[next].id}`)?.focus()
  }
  return <div className="lp-preview" data-reveal>
    <div className="lp-preview-bar"><Brand /><span>Prévia · dados demonstrativos</span></div>
    <div className="lp-preview-tabs" role="tablist" aria-label="Explorar módulos da plataforma">{modules.map(({ id, label, icon: Icon }, index) => <button key={id} id={`preview-tab-${id}`} type="button" role="tab" aria-selected={active === id} aria-controls={`preview-panel-${id}`} tabIndex={active === id ? 0 : -1} onKeyDown={(event) => onTabKey(event, index)} onClick={() => selectModule(id)}><Icon size={20} />{label}</button>)}</div>
    <div className="lp-preview-content" id={`preview-panel-${active}`} role="tabpanel" aria-labelledby={`preview-tab-${active}`} tabIndex={0}>
      <div className="lp-preview-heading"><div><h3>{current.title}</h3><p>{current.text}</p></div><span>Explore um registro <ArrowDown size={16} /></span></div>
      <div className="lp-preview-rows">{mockRows[active].slice(0, 3).map((row) => <button type="button" key={row.id} className={selected?.id === row.id ? 'is-selected' : ''} aria-expanded={selected?.id === row.id} aria-controls="preview-detail" onClick={() => setSelected(selected?.id === row.id ? null : row)}><span><strong>{row.primary}</strong><small>{row.secondary}</small></span><StatusBadge>{row.status}</StatusBadge><ArrowUpRight size={20} /></button>)}</div>
      <div id="preview-detail" className="lp-preview-detail" aria-live="polite">{selected ? <><strong>{selected.detail}</strong><span>{active === 'licencas' ? 'Processo' : 'Responsável'}: {selected.owner}</span><span>{selected.date}</span></> : <><CheckCircle size={21} /><span>Selecione um registro para ver os detalhes deste exemplo.</span></>}</div>
    </div>
    <div className="lp-preview-footer"><span>Conheça a organização dos módulos antes de criar seu acesso.</span><Link to="/login">Acessar a plataforma <ArrowRight size={17} /></Link></div>
  </div>
}

function Diagnostic({ need, setNeed }) {
  const [summary, setSummary] = useState('')
  const [feedback, setFeedback] = useState('')
  const resultRef = useRef(null)
  const phone = (import.meta.env.VITE_CONTACT_WHATSAPP || '').replace(/\D/g, '')
  const hasContact = /^55\d{10,11}$/.test(phone)
  useEffect(() => { setSummary(''); setFeedback('') }, [need])
  const buildSummary = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setSummary(`Olá, Celerity! Gostaria de conversar sobre um diagnóstico ambiental.\n\nEmpresa: ${String(data.get('company')).trim()}\nMunicípio/UF: ${String(data.get('city')).trim()}\nNecessidade: ${need}\nMomento: ${data.get('urgency')}\nContexto: ${String(data.get('context')).trim() || 'A detalhar na conversa.'}`)
    setFeedback('Resumo preparado. Nenhuma solicitação foi enviada ainda.')
    requestAnimationFrame(() => resultRef.current?.focus())
  }
  const copy = async () => {
    try { await navigator.clipboard.writeText(summary); setFeedback('Resumo copiado. Compartilhe com a equipe pelo canal de atendimento que você já utiliza.') }
    catch { setFeedback('Não foi possível copiar automaticamente. Selecione e copie o texto abaixo.'); resultRef.current?.select() }
  }
  return <section className="lp-contact lp-section" id="contato"><div className="container lp-contact-grid">
    <div><p className="eyebrow eyebrow--green">O próximo passo começa com clareza</p><h2>O que está tirando a tranquilidade da sua operação?</h2><p>Conte o que sua empresa precisa organizar. Um diagnóstico começa entendendo o cenário, os documentos disponíveis e as prioridades.</p><ul><li><Check size={19} />Necessidade e escopo bem definidos</li><li><Check size={19} />Conversa orientada à sua realidade</li><li><Check size={19} />Próximos passos para sua equipe</li></ul><div className="lp-contact-note"><Headset size={26} /><span>Já é cliente?<br /><Link to="/login">Acesse seu ambiente de trabalho <ArrowRight size={16} /></Link></span></div></div>
    <form className="lp-diagnostic" onSubmit={buildSummary} onChange={() => { setSummary(''); setFeedback('') }}>
      <p className="eyebrow">Diagnóstico inicial</p><h3>Vamos entender seu cenário.</h3><p>Prepare um resumo para conversar com a equipe. Não é necessário criar uma conta.</p>
      <div className="lp-form-grid"><label className="field"><span className="field__label">Empresa *</span><input name="company" required maxLength={120} pattern=".*\S.*" autoComplete="organization" placeholder="Nome da sua empresa" /></label><label className="field"><span className="field__label">Município / UF *</span><input name="city" required maxLength={100} pattern=".*\S.*" placeholder="Ex.: Fortaleza / CE" autoComplete="address-level2" /></label></div>
      <label className="field"><span className="field__label">Como podemos ajudar? *</span><select name="need" required value={need} onChange={(event) => setNeed(event.target.value)}><option value="">Selecione sua necessidade</option>{services.map((service) => <option key={service[4]}>{service[4]}</option>)}<option>Organizar a gestão ambiental</option></select></label>
      <label className="field"><span className="field__label">Qual é o momento da sua empresa? *</span><select name="urgency" required defaultValue=""><option value="" disabled>Selecione uma opção</option><option>Estou planejando os próximos passos</option><option>Tenho um processo em andamento</option><option>Tenho uma pendência ou um prazo próximo</option></select></label>
      <label className="field"><span className="field__label">O que você precisa resolver? <small>(opcional)</small></span><textarea name="context" rows={3} maxLength={800} placeholder="Conte brevemente sua necessidade, sem incluir documentos ou dados sensíveis." /></label>
      <Button type="submit" icon={ArrowRight}>Preparar meu diagnóstico</Button><p className="lp-form-note">Seus dados não são enviados ao preparar o resumo. Você revisa antes de compartilhar.</p><p className="lp-form-feedback" role="status">{feedback}</p>
      {summary && <div className="lp-summary"><label className="field"><span className="field__label">Revise seu resumo</span><textarea ref={resultRef} value={summary} readOnly rows={9} /></label><div>{hasContact && <Button as="a" href={`https://wa.me/${phone}?text=${encodeURIComponent(summary)}`} target="_blank" rel="noopener noreferrer" icon={WhatsappLogo}>Continuar no WhatsApp</Button>}<Button type="button" variant="secondary" icon={Copy} onClick={copy}>Copiar resumo</Button></div><small>{hasContact ? 'O WhatsApp será aberto. O envio da mensagem é confirmado por você.' : 'Leve este resumo para a conversa com a equipe pelo seu canal de atendimento habitual.'}</small></div>}
    </form>
  </div></section>
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [need, setNeed] = useState('')
  useScrollReveal('landing')
  return <div className="landing lp">
    <a className="lp-skip" href="#conteudo">Pular para o conteúdo</a>
    <header className="lp-nav"><div className="container lp-nav-inner"><Brand /><nav id="institutional-nav" className={menuOpen ? 'is-open' : ''} aria-label="Navegação institucional" onClick={() => setMenuOpen(false)}><a href="#atuacao">Soluções</a><a href="#plataforma">Plataforma</a><a href="#como-funciona">Como funciona</a><a href="#duvidas">Dúvidas</a><Link to="/login" className="lp-mobile-login">Área do cliente</Link></nav><div className="lp-nav-actions"><Link to="/login" className="lp-desktop-login">Área do cliente <ArrowUpRight size={15} /></Link><Button as="a" href="#contato">Solicitar diagnóstico</Button><button className="lp-menu" type="button" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-controls="institutional-nav" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} onKeyDown={(event) => { if (event.key === 'Escape') setMenuOpen(false) }}>{menuOpen ? <X size={24} /> : <List size={24} />}</button></div></div></header>
    <main id="conteudo">
      <section className="lp-hero"><div className="container lp-hero-grid"><div className="lp-hero-copy"><p className="eyebrow eyebrow--green"><span className="lp-live-dot" />Consultoria, assessoria e projetos ambientais</p><h1>Sua empresa cresce.<br />O risco ambiental<br /><em>não precisa acompanhar.</em></h1><p className="lp-lead">Licenças, exigências e prazos não podem depender da memória. Unimos orientação técnica e gestão organizada para você saber o que precisa ser feito, por quem e quando.</p><div className="lp-hero-actions"><Button as="a" href="#contato" icon={ArrowRight}>Quero um diagnóstico</Button><a href="#plataforma" className="lp-text-light">Conhecer a plataforma <ArrowDown size={18} /></a></div><p className="lp-hero-proof"><ShieldCheck size={20} />Especialistas ao seu lado. Informação ao seu alcance.</p></div>
        <div className="lp-hero-panel"><div className="lp-panel-top"><span><span className="lp-live-dot" />Acompanhamento ambiental</span><small>Celerity</small></div><div className="lp-panel-title"><p>Do primeiro documento<br />ao próximo passo.</p><span><ShieldCheck size={34} /></span></div><div className="lp-panel-route"><div><span>01</span><p><strong>Entender o cenário</strong><small>Processos, documentos e prioridades</small></p><CheckCircle size={23} /></div><div><span>02</span><p><strong>Definir o caminho</strong><small>Orientação técnica e responsáveis</small></p><CheckCircle size={23} /></div><div><span>03</span><p><strong>Acompanhar cada etapa</strong><small>Visibilidade para agir com antecedência</small></p><ArrowRight size={23} /></div></div><div className="lp-panel-bottom"><UsersThree size={26} /><p><strong>Sua equipe + Celerity</strong><span>Uma visão compartilhada da operação.</span></p></div><span className="lp-panel-caption">Consultoria técnica conectada à gestão.</span></div>
      </div><div className="container lp-hero-bottom"><span>CLAREZA PARA DECIDIR. ESTRUTURA PARA AGIR.</span><a href="#desafios">Reconhece essa rotina? <ArrowDown size={18} /></a></div></section>
      <section className="lp-section container" id="desafios"><div className="lp-heading"><p className="eyebrow">Quando a rotina perde o controle</p><h2>O problema aparece no prazo.<br />Mas começa muito antes.</h2><p>Pequenas falhas de organização se acumulam. Sua equipe trabalha mais, a informação chega tarde e a operação fica exposta.</p></div><div className="lp-pains">{pains.map(([Icon, title, text, solution], index) => <article key={title} data-reveal><div className="lp-card-top"><Icon size={26} /><span>0{index + 1}</span></div><h3>{title}</h3><p>{text}</p><div className="lp-pain-answer"><CheckCircle size={19} /><span>{solution}</span></div></article>)}</div></section>
      <section className="lp-comparison lp-section"><div className="container"><div className="lp-heading"><p className="eyebrow">Uma mudança que se sente na rotina</p><h2>Menos tempo procurando.<br />Mais clareza para resolver.</h2></div><div className="lp-compare-table"><div className="lp-compare-head"><span>Na sua operação</span><span>Com informações dispersas</span><strong><CheckCircle size={21} />Com a Celerity</strong></div>{comparisons.map(([title, before, after]) => <div className="lp-compare-row" key={title}><h3>{title}</h3><p><span className="lp-mobile-label">Antes</span>{before}</p><p><span className="lp-mobile-label">Com a Celerity</span><Check size={19} />{after}</p></div>)}</div></div></section>
      <section className="lp-section container" id="atuacao"><div className="lp-heading lp-heading-split"><div><p className="eyebrow">Orientação técnica para avançar</p><h2>Seu desafio tem contexto.<br />A solução também.</h2></div><p>Da demanda pontual ao acompanhamento contínuo, organizamos o trabalho a partir do que seu empreendimento precisa.</p></div><div className="lp-services">{services.map(([Icon, title, question, text, value], index) => <article key={title} data-reveal><div className="lp-card-top"><Icon size={30} /><span>0{index + 1}</span></div><h3>{title}</h3><strong>{question}</strong><p>{text}</p><a href="#contato" onClick={() => setNeed(value)}>Conversar sobre essa demanda <ArrowUpRight size={18} /></a></article>)}</div><div className="lp-audiences"><span>Para diferentes realidades</span><span><Buildings size={18} />Empresas e indústrias</span><span><MapPin size={18} />Obras e empreendimentos</span><span><Drop size={18} />Operações com uso de água</span></div></section>
      <section className="lp-platform lp-section" id="plataforma"><div className="container"><div className="lp-heading"><p className="eyebrow eyebrow--green">O trabalho técnico ganha visibilidade</p><h2>Você não precisa perguntar<br />para saber como está.</h2><p>Conheça a estrutura da plataforma. Explore os módulos abaixo e veja como processos, licenças e documentos ficam organizados.</p></div><PlatformPreview /><div className="lp-platform-benefits"><span><ClipboardText size={20} />Contexto em cada processo</span><span><UsersThree size={20} />Responsabilidades visíveis</span><span><Files size={20} />Documentação organizada</span></div></div></section>
      <section className="lp-water lp-section container" id="pocos"><div className="lp-water-art" aria-hidden="true"><div className="lp-water-ring"><Drop size={76} weight="duotone" /></div><span>RECURSOS HÍDRICOS</span><div className="lp-water-labels"><span>Documentação</span><span>Outorga</span><span>Acompanhamento</span></div></div><div className="lp-heading"><p className="eyebrow">Poços, outorgas e pós-licença</p><h2>A água faz parte da operação.<br />A gestão também precisa fazer.</h2><p>Reúna informações do poço, autorizações, exigências e documentos. A orientação técnica ajuda a definir o caminho; o acompanhamento mantém as pendências visíveis.</p><ul className="lp-check-list"><li><CheckCircle size={20} />Organização do histórico e dos documentos</li><li><CheckCircle size={20} />Acompanhamento de processos e exigências</li><li><CheckCircle size={20} />Atenção às obrigações após a autorização</li></ul><Button as="a" href="#contato" onClick={() => setNeed('Poços e outorgas')} icon={ArrowRight}>Conversar sobre meu poço</Button></div></section>
      <section className="lp-workflow lp-section" id="como-funciona"><div className="container"><div className="lp-heading"><p className="eyebrow">Como começamos</p><h2>Um caminho claro.<br />Do cenário atual à rotina organizada.</h2></div><ol>{[['Diagnóstico', 'Entendemos sua atividade, reunimos as informações disponíveis e identificamos as prioridades.', 'Você entende por onde começar.'], ['Organização e implantação', 'Definimos o escopo técnico, estruturamos documentos e combinamos responsáveis e próximos passos.', 'Sua equipe sabe o que fazer.'], ['Acompanhamento', 'Acompanhamos o andamento das demandas e revisamos pendências e prazos com sua equipe.', 'Você tem visibilidade para agir.']].map(([title, text, outcome], index) => <li key={title} data-reveal><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p><strong><Check size={18} />{outcome}</strong></li>)}</ol></div></section>
      <section className="lp-region lp-section container"><div className="lp-heading"><p className="eyebrow"><MapPin size={17} />Contexto regional</p><h2>Sua operação no Ceará,<br />com as informações no lugar certo.</h2><p>A atividade, a localização e o uso de recursos naturais fazem parte do diagnóstico. Organize os protocolos e documentos dos órgãos envolvidos para conduzir cada demanda com contexto.</p></div><div className="lp-region-links"><a href="https://www.ce.gov.br/semace/licenciamento-ambiental/" target="_blank" rel="noopener noreferrer"><span><strong>Licenciamento ambiental</strong><small>Informações oficiais da SEMACE</small></span><ArrowUpRight size={22} /></a><a href="https://www.srh.ce.gov.br/outorgas/" target="_blank" rel="noopener noreferrer"><span><strong>Recursos hídricos e outorgas</strong><small>Serviços oficiais da SRH Ceará</small></span><ArrowUpRight size={22} /></a><p>Para demandas municipais, o diagnóstico considera o município e a atividade do empreendimento. Os links são canais públicos de consulta; a Celerity é uma consultoria independente.</p></div></section>
      <section className="lp-faq lp-section container" id="duvidas"><div className="lp-heading"><p className="eyebrow">Antes de começar</p><h2>Respostas para<br />seguir com clareza.</h2><p>Entenda o atendimento e escolha o próximo passo para sua empresa.</p><a href="#contato" className="lp-inline-link">Preparar meu diagnóstico <ArrowRight size={18} /></a></div><div>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
      <Diagnostic need={need} setNeed={setNeed} />
    </main>
    <footer className="lp-footer"><div className="container"><div><Brand light /><p>Consultoria, assessoria e projetos ambientais.<br />Clareza para decidir. Estrutura para agir.</p></div><nav aria-label="Navegação do rodapé"><a href="#atuacao">Soluções ambientais</a><a href="#plataforma">Conhecer a plataforma</a><a href="#contato">Diagnóstico inicial</a></nav><nav aria-label="Acesso à plataforma"><Link to="/login">Área do cliente</Link><Link to="/cadastro">Criar acesso</Link><Link to="/recuperar-senha">Recuperar senha</Link></nav></div><div className="container lp-footer-bottom"><span>© {new Date().getFullYear()} Celerity Ambiental</span><span>Desenvolvimento · DEV-CiceroJose</span></div></footer>
  </div>
}
