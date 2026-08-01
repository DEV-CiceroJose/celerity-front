import { ArrowRight, CalendarBlank, CaretDown, ChartLineUp, Clock, DotsThree, Warning } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { Breadcrumb, Button, PageHeader, StatusBadge } from '../components/ui'
import { dashboardMetrics, mockRows } from '../data/mockData'

const activity = [
  ['Licença anexada', 'Ana Beatriz adicionou LO nº 2026-1189', 'há 18 min'],
  ['Exigência atualizada', 'Rafael Lima marcou documento como enviado', 'há 42 min'],
  ['Processo movimentado', 'SEMACE 2026/004764 foi para Em análise', 'há 2 h'],
  ['Pagamento confirmado', 'Solicitação 2026-0861 foi conciliada', 'há 4 h'],
]

export function DashboardPage() {
  return (
    <>
      <Breadcrumb items={['Visão geral']} />
      <PageHeader eyebrow="Sexta-feira, 31 de julho" title="Visão geral" description="Acompanhe prioridades e movimentações da operação." secondary={<Button variant="secondary" icon={CalendarBlank}>Últimos 30 dias <CaretDown size={15} /></Button>} />

      <section className="metrics-strip" aria-label="Indicadores principais">
        {dashboardMetrics.map((metric) => <article key={metric.label} className={`metric metric--${metric.tone}`}><p>{metric.label}</p><strong>{metric.value}</strong><span>{metric.change}</span></article>)}
      </section>

      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel__header"><div><p className="eyebrow">Fluxo operacional</p><h2>Evolução dos processos</h2></div><button aria-label="Mais opções"><DotsThree size={24} /></button></div>
          <div className="chart-legend"><span><i className="legend-green" />Novos processos</span><span><i className="legend-dark" />Concluídos</span></div>
          <div className="line-chart" role="img" aria-label="Gráfico de evolução mensal de processos">
            <div className="chart-y"><span>60</span><span>45</span><span>30</span><span>15</span><span>0</span></div>
            <svg viewBox="0 0 700 220" preserveAspectRatio="none" aria-hidden="true"><g className="grid-lines"><line x1="0" y1="10" x2="700" y2="10"/><line x1="0" y1="60" x2="700" y2="60"/><line x1="0" y1="110" x2="700" y2="110"/><line x1="0" y1="160" x2="700" y2="160"/><line x1="0" y1="210" x2="700" y2="210"/></g><polyline className="chart-line chart-line--green" points="0,170 115,140 230,151 350,86 465,108 580,48 700,24"/><polyline className="chart-line chart-line--dark" points="0,192 115,174 230,158 350,143 465,125 580,112 700,87"/><g className="chart-points"><circle cx="700" cy="24" r="5"/><circle cx="700" cy="87" r="5"/></g></svg>
            <div className="chart-x"><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span></div>
          </div>
        </section>

        <section className="panel deadlines-panel">
          <div className="panel__header"><div><p className="eyebrow">Prioridades</p><h2>Próximos prazos</h2></div><Link to="/app/exigencias">Ver todos <ArrowRight size={16} /></Link></div>
          <div className="deadline-list">
            <article><div className="deadline-date deadline-date--danger"><strong>03</strong><span>AGO</span></div><div><strong>Estudo hidrogeológico</strong><span>Águas do Sertão SPE</span><small>SRH 2026/001395</small></div><StatusBadge>3 dias</StatusBadge></article>
            <article><div className="deadline-date"><strong>06</strong><span>AGO</span></div><div><strong>Pagamento de boleto</strong><span>Construtora Horizonte S.A.</span><small>Solicitação 2026-0912</small></div><StatusBadge>6 dias</StatusBadge></article>
            <article><div className="deadline-date"><strong>08</strong><span>AGO</span></div><div><strong>Complementação documental</strong><span>Eco Norte Indústria Ltda.</span><small>SEMACE 2026/004812</small></div><StatusBadge>8 dias</StatusBadge></article>
          </div>
        </section>

        <section className="panel status-panel">
          <div className="panel__header"><div><p className="eyebrow">Distribuição atual</p><h2>Processos por status</h2></div><ChartLineUp size={23} /></div>
          <div className="status-chart"><div className="donut"><div><strong>148</strong><span>ativos</span></div></div><ul><li><span><i className="dot-green" />Em andamento</span><strong>61</strong></li><li><span><i className="dot-dark" />Em análise</span><strong>43</strong></li><li><span><i className="dot-yellow" />Em exigência</span><strong>18</strong></li><li><span><i className="dot-gray" />Outros</span><strong>26</strong></li></ul></div>
        </section>

        <section className="panel activity-panel">
          <div className="panel__header"><div><p className="eyebrow">Registro da equipe</p><h2>Atividades recentes</h2></div><Link to="/app/processos">Ver histórico <ArrowRight size={16} /></Link></div>
          <div className="activity-list">{activity.map(([title, text, time], index) => <article key={title}><span className={`activity-icon activity-icon--${index}`} >{index === 1 ? <Warning size={18} /> : index === 2 ? <Clock size={18} /> : <ChartLineUp size={18} />}</span><div><strong>{title}</strong><p>{text}</p></div><time>{time}</time></article>)}</div>
        </section>
      </div>

      <section className="panel compact-table-panel">
        <div className="panel__header"><div><p className="eyebrow">Atenção necessária</p><h2>Processos com maior tempo parado</h2></div><Link to="/app/processos">Abrir processos <ArrowRight size={16} /></Link></div>
        <div className="compact-table">{mockRows.processos.slice(0, 3).map((row, index) => <Link to={`/app/processos/${row.id}`} key={row.id}><span className="rank">0{index + 1}</span><div><strong>{row.primary}</strong><span>{row.secondary}</span></div><span>{row.owner}</span><StatusBadge>{row.status}</StatusBadge><strong className="days">{47 - index * 8} dias</strong><ArrowRight size={17} /></Link>)}</div>
      </section>
    </>
  )
}
