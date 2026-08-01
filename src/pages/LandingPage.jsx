import {
  ArrowRight, ArrowsClockwise, Buildings, ChartLineUp, CheckCircle, ClipboardText,
  ClockCountdown, Drop, Files, Headset, MapPin, ShieldCheck, TrendUp, UsersThree, Warning,
} from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { Button } from '../components/ui'
import { useScrollReveal } from '../hooks/useScrollReveal'

const pains = [
  { icon: ClockCountdown, title: 'Prazos espalhados', text: 'Vencimentos ficam em planilhas, agendas e conversas. Quando o alerta chega tarde, a operação já está exposta.' },
  { icon: Files, title: 'Documentos sem contexto', text: 'Licenças, protocolos e comprovantes existem, mas ninguém sabe com segurança qual é a versão correta.' },
  { icon: UsersThree, title: 'Responsabilidades pouco claras', text: 'A equipe perde tempo perguntando quem acompanha cada processo e qual deve ser a próxima ação.' },
  { icon: Warning, title: 'Decisões sem visão completa', text: 'Sem indicadores confiáveis, riscos importantes concorrem com urgências que poderiam ter sido evitadas.' },
]

const outcomes = [
  ['Antes do prazo', 'Alertas e prioridades mostram o que exige ação agora e o que pode ser planejado.'],
  ['Durante o processo', 'Histórico, responsáveis e documentos mantêm todos trabalhando com a mesma informação.'],
  ['Na tomada de decisão', 'Indicadores transformam a rotina operacional em uma visão clara para a gestão.'],
]

export function LandingPage() {
  useScrollReveal('landing')
  return (
    <div className="landing">
      <header className="landing-nav container">
        <Brand />
        <nav aria-label="Navegação institucional"><a href="#desafios">Desafios</a><a href="#solucao">Solução</a><a href="#atuacao">Atuação</a><a href="#duvidas">Dúvidas</a></nav>
        <div className="landing-nav__actions"><Link to="/login" className="text-link">Entrar</Link><Button as={Link} to="/cadastro">Solicitar acesso</Button></div>
      </header>

      <main>
        <section className="hero">
          <div className="hero__topography" aria-hidden="true"><i /><i /><i /></div>
          <div className="container hero__grid">
            <div className="hero__copy">
              <p className="eyebrow eyebrow--green">Consultoria e gestão ambiental integrada</p>
              <h1>Sua operação não pode depender de prazos na memória.</h1>
              <p className="hero__lead">Licenças vencidas, exigências sem resposta e documentos dispersos geram retrabalho, insegurança e risco. A Celerity organiza a rotina ambiental para sua equipe agir antes que o problema apareça.</p>
              <div className="hero__actions"><Button as={Link} to="/cadastro" icon={ArrowRight}>Quero organizar minha operação</Button><Button as="a" href="#solucao" variant="dark-outline">Entender a solução</Button></div>
              <div className="hero__proof"><ShieldCheck size={21} /><span>Consultoria técnica, acompanhamento próximo e informação confiável.</span></div>
            </div>
            <div className="hero__visual">
              <img src="/brand-reference.png" alt="Celerity Ambiental — Consultoria, Assessoria e Projetos Ambientais" />
              <div className="hero-stat hero-stat--top"><span>Prazo monitorado</span><strong>03 dias</strong><small>Exigência · SRH 001395</small></div>
              <div className="hero-stat hero-stat--bottom"><TrendUp size={20} /><div><span>Operação atualizada</span><strong>Visão única</strong></div></div>
            </div>
          </div>
        </section>

        <section className="trust-strip"><div className="container"><span>Uma visão única da operação</span><p><strong>Processos</strong><strong>Licenças</strong><strong>Exigências</strong><strong>Pagamentos</strong><strong>Documentos</strong></p></div></section>

        <section className="pain-section section container" id="desafios">
          <div className="pain-intro"><p className="eyebrow">O problema não é só o volume</p><h2>É não saber o que pode virar risco amanhã.</h2><p>Quanto mais processos sua empresa acompanha, mais difícil fica manter contexto, responsabilidade e prazo sem uma estrutura única.</p></div>
          <div className="pain-list">{pains.map(({ icon: Icon, title, text }, index) => <article key={title}><span>0{index + 1}</span><Icon size={27} /><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
        </section>

        <section className="solution-section" id="solucao">
          <div className="section container">
            <div className="section-heading"><p className="eyebrow eyebrow--green">Como a Celerity ajuda</p><h2>Da informação dispersa<br />ao controle da operação.</h2><p>Unimos experiência técnica e gestão estruturada para que sua empresa saiba o que está acontecendo, o que vence primeiro e quem precisa agir.</p></div>
            <div className="feature-grid" id="recursos">
              <article><span className="feature-number">01</span><ClipboardText size={31} /><h3>Processos organizados</h3><p>Status, responsáveis, setores e movimentações reunidos em uma leitura objetiva.</p><Link to="/cadastro">Organizar processos <ArrowRight size={17} /></Link></article>
              <article><span className="feature-number">02</span><Drop size={31} /><h3>Licenças e poços</h3><p>Emissões, renovações, outorgas, condicionantes e documentos acompanhados de ponta a ponta.</p><Link to="/cadastro">Controlar licenças <ArrowRight size={17} /></Link></article>
              <article className="feature-card--dark"><span className="feature-number">03</span><CheckCircle size={31} /><h3>Prazos sob controle</h3><p>Exigências, boletos e vencimentos priorizados antes que se tornem problemas operacionais.</p><Link to="/cadastro">Antecipar riscos <ArrowRight size={17} /></Link></article>
            </div>
          </div>
        </section>

        <section className="relief-section">
          <div className="container relief-grid">
            <div className="relief-copy"><p className="eyebrow eyebrow--green">Alívio para a rotina</p><h2>Menos tempo procurando. Mais tempo resolvendo.</h2><p>A Celerity cria uma linha clara entre o problema identificado e a ação necessária. Sua equipe deixa de reagir ao atraso e passa a conduzir o processo.</p><Button as={Link} to="/cadastro" icon={ArrowRight}>Conhecer a plataforma</Button></div>
            <div className="outcome-list">{outcomes.map(([title, text], index) => <article key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div><CheckCircle size={22} weight="fill" /></article>)}</div>
          </div>
        </section>

        <section className="section container" id="atuacao">
          <div className="section-heading"><p className="eyebrow">Atuação completa</p><h2>Tecnologia com orientação técnica de verdade.</h2><p>O sistema organiza a informação. Nossa experiência ambiental ajuda sua empresa a interpretar cenários, atender exigências e conduzir cada etapa com segurança.</p></div>
          <div className="services-grid">
            <article><Headset size={28} /><h3>Consultoria e assessoria</h3><p>Apoio técnico para licenciamento, regularização, condicionantes e relacionamento com órgãos ambientais.</p></article>
            <article><ArrowsClockwise size={28} /><h3>Acompanhamento contínuo</h3><p>Visibilidade sobre andamento, pendências, responsáveis e próximos passos de cada demanda.</p></article>
            <article><ChartLineUp size={28} /><h3>Gestão e indicadores</h3><p>Painéis para identificar gargalos, antecipar vencimentos e orientar decisões gerenciais.</p></article>
            <article><Files size={28} /><h3>Documentação centralizada</h3><p>Arquivos vinculados ao processo certo, com contexto e acesso rápido para a equipe autorizada.</p></article>
          </div>
          <div className="audience-block"><div><p className="eyebrow eyebrow--green">Para quem precisa de previsibilidade</p><h2>Uma estrutura que acompanha a complexidade do seu negócio.</h2></div><div className="audience-tags"><span><Buildings size={18} />Empreendimentos e indústrias</span><span><MapPin size={18} />Obras e infraestrutura</span><span><Drop size={18} />Poços e recursos hídricos</span><span><ShieldCheck size={18} />Equipes ambientais internas</span></div></div>
        </section>

        <section className="process-section"><div className="container"><div className="section-heading"><p className="eyebrow">Como começamos</p><h2>Entendemos sua operação antes de organizar a solução.</h2><p>O trabalho parte da realidade da sua empresa, dos processos em andamento e dos pontos que hoje consomem mais tempo da equipe.</p></div><ol><li><span>01</span><h3>Diagnóstico</h3><p>Mapeamos processos, documentos, responsáveis e riscos atuais.</p></li><li><span>02</span><h3>Estruturação</h3><p>Organizamos os dados e definimos uma rotina clara de acompanhamento.</p></li><li><span>03</span><h3>Acompanhamento</h3><p>Monitoramos prazos, movimentações e prioridades com sua equipe.</p></li><li><span>04</span><h3>Melhoria contínua</h3><p>Os indicadores mostram onde ajustar o fluxo e reduzir novos riscos.</p></li></ol></div></section>

        <section className="faq-section section container" id="duvidas"><div className="faq-heading"><p className="eyebrow">Perguntas frequentes</p><h2>O que sua empresa precisa saber.</h2><p>Se a sua operação possui processos, licenças ou condicionantes ambientais, a organização começa por tornar essas informações visíveis e acionáveis.</p></div><div className="landing-faq"><details open><summary>A Celerity substitui a equipe ambiental da empresa?</summary><p>Não. Atuamos ao lado da sua equipe, oferecendo organização, acompanhamento e suporte técnico para que as decisões sejam tomadas com mais segurança.</p></details><details><summary>É possível acompanhar processos e poços no mesmo lugar?</summary><p>Sim. A plataforma separa os fluxos por módulo, mantendo uma visão integrada de prazos, licenças, exigências, pagamentos e documentos.</p></details><details><summary>Como vocês ajudam a evitar perda de prazo?</summary><p>Centralizamos as datas críticas, destacamos prioridades e mantemos responsáveis e histórico vinculados a cada demanda.</p></details><details><summary>Minha empresa ainda usa planilhas. É possível começar assim?</summary><p>Sim. O diagnóstico inicial ajuda a organizar os dados existentes e definir uma transição gradual, sem perder o histórico da operação.</p></details></div></section>

        <section className="cta-section" id="contato"><div className="container cta-section__inner"><div><p className="eyebrow eyebrow--green">O próximo prazo não precisa virar urgência</p><h2>Transforme sua rotina ambiental em uma operação previsível.</h2><p>Converse com a Celerity e descubra como organizar processos, responsabilidades e vencimentos da sua empresa.</p></div><Button as={Link} to="/cadastro" icon={ArrowRight}>Quero falar com a Celerity</Button></div></section>
      </main>

      <footer className="landing-footer"><div className="container"><Brand light /><p>Consultoria, assessoria e projetos ambientais.</p><span>© 2026 Celerity Ambiental</span></div></footer>
    </div>
  )
}
