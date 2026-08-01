export const dashboardMetrics = [
  { label: 'Processos ativos', value: '148', change: '+12 este mês', tone: 'green' },
  { label: 'Em análise', value: '43', change: '29% do total', tone: 'neutral' },
  { label: 'Em exigência', value: '18', change: '5 vencem em breve', tone: 'warning' },
  { label: 'Prazos vencidos', value: '07', change: 'Atenção necessária', tone: 'danger' },
]

export const mockRows = {
  empresas: [
    { id: 1, primary: 'Eco Norte Indústria Ltda.', secondary: '12.345.678/0001-90', status: 'Ativa', detail: '4 processos', owner: 'Ana Beatriz', date: '28 jul 2026' },
    { id: 2, primary: 'Construtora Horizonte S.A.', secondary: '41.052.930/0001-11', status: 'Ativa', detail: '7 processos', owner: 'Carlos Mendes', date: '27 jul 2026' },
    { id: 3, primary: 'Agrovale Empreendimentos', secondary: '09.713.884/0001-62', status: 'Pendente', detail: '2 processos', owner: 'Mariana Costa', date: '25 jul 2026' },
    { id: 4, primary: 'Águas do Sertão SPE', secondary: '32.845.109/0001-04', status: 'Ativa', detail: '5 processos', owner: 'Rafael Lima', date: '22 jul 2026' },
    { id: 5, primary: 'Complexo Solar Mandacaru', secondary: '50.399.221/0001-18', status: 'Inativa', detail: '1 processo', owner: 'Mariana Costa', date: '18 jul 2026' },
  ],
  processos: [
    { id: 1048, primary: 'SEMACE 2026/004812', secondary: 'Eco Norte Indústria Ltda.', status: 'Em análise', detail: 'Licença de Operação', owner: 'Ana Beatriz', date: 'Prazo: 08 ago' },
    { id: 1047, primary: 'SEMACE 2026/004764', secondary: 'Construtora Horizonte S.A.', status: 'Em andamento', detail: 'LP + LI', owner: 'Carlos Mendes', date: 'Prazo: 12 ago' },
    { id: 1046, primary: 'SRH 2026/001395', secondary: 'Águas do Sertão SPE', status: 'Em exigência', detail: 'Autorização', owner: 'Rafael Lima', date: 'Prazo: 03 ago' },
    { id: 1045, primary: 'SEMACE 2026/004521', secondary: 'Agrovale Empreendimentos', status: 'Deferido', detail: 'Licença Simplificada', owner: 'Mariana Costa', date: 'Concluído: 25 jul' },
    { id: 1044, primary: 'SEMACE 2026/004311', secondary: 'Complexo Solar Mandacaru', status: 'Indeferido', detail: 'Autorização', owner: 'Ana Beatriz', date: 'Atualizado: 18 jul' },
  ],
  pocos: [
    { id: 83, primary: 'SRH 2026/001395', secondary: 'Águas do Sertão SPE', status: 'Em exigência', detail: 'Poço tubular P-04', owner: 'Rafael Lima', date: '42 dias no setor' },
    { id: 82, primary: 'SRH 2026/001341', secondary: 'Agrovale Empreendimentos', status: 'Em análise', detail: 'Poço tubular P-02', owner: 'Mariana Costa', date: '31 dias no setor' },
    { id: 81, primary: 'SRH 2026/001288', secondary: 'Fazenda Bom Futuro', status: 'Licenciado', detail: 'Poço profundo', owner: 'Carlos Mendes', date: 'Licença até mai/27' },
    { id: 80, primary: 'SRH 2026/001203', secondary: 'Hotel Dunas Verdes', status: 'Indeferido', detail: 'Poço tubular', owner: 'Ana Beatriz', date: 'Atualizado: 14 jul' },
  ],
  licencas: [
    { id: 301, primary: 'LO nº 2026-1189', secondary: 'Eco Norte Indústria Ltda.', status: 'Válida', detail: 'Licença de Operação', owner: 'SEMACE 2026/004812', date: 'Vence: 14 mai 2027' },
    { id: 302, primary: 'LS nº 2025-0841', secondary: 'Agrovale Empreendimentos', status: 'Vence em 7 dias', detail: 'Licença Simplificada', owner: 'SEMACE 2025/003411', date: 'Vence: 07 ago 2026' },
    { id: 303, primary: 'AUT nº 2025-991', secondary: 'Águas do Sertão SPE', status: 'Vence em 30 dias', detail: 'Autorização Ambiental', owner: 'SEMACE 2025/006190', date: 'Vence: 22 ago 2026' },
    { id: 304, primary: 'LI nº 2024-557', secondary: 'Complexo Solar Mandacaru', status: 'Vencida', detail: 'Licença de Instalação', owner: 'SEMACE 2024/002721', date: 'Venceu: 16 jul 2026' },
  ],
  exigencias: [
    { id: 701, primary: 'Complementação de estudo hidrogeológico', secondary: 'Águas do Sertão SPE', status: 'Pendente', detail: 'SRH 2026/001395', owner: 'Rafael Lima', date: '3 dias restantes' },
    { id: 702, primary: 'Apresentar ART do responsável técnico', secondary: 'Construtora Horizonte S.A.', status: 'Em atendimento', detail: 'SEMACE 2026/004764', owner: 'Carlos Mendes', date: '9 dias restantes' },
    { id: 703, primary: 'Relatório de monitoramento semestral', secondary: 'Eco Norte Indústria Ltda.', status: 'Atendida', detail: 'SEMACE 2026/004812', owner: 'Ana Beatriz', date: 'Atendida em 29 jul' },
    { id: 704, primary: 'Regularização documental', secondary: 'Hotel Dunas Verdes', status: 'Vencida', detail: 'SRH 2026/001203', owner: 'Mariana Costa', date: 'Venceu há 5 dias' },
  ],
  pagamentos: [
    { id: 411, primary: 'Solicitação nº 2026-0912', secondary: 'Construtora Horizonte S.A.', status: 'Aguardando pagamento', detail: 'R$ 2.480,00', owner: 'Licença de Instalação', date: 'Vence: 06 ago' },
    { id: 412, primary: 'Solicitação nº 2026-0884', secondary: 'Águas do Sertão SPE', status: 'Prazo excedido', detail: 'R$ 980,00', owner: 'Outorga de poço', date: 'Venceu: 28 jul' },
    { id: 413, primary: 'Solicitação nº 2026-0861', secondary: 'Eco Norte Indústria Ltda.', status: 'Pago', detail: 'R$ 3.120,00', owner: 'Licença de Operação', date: 'Pago: 25 jul' },
  ],
  assessoria: [
    { id: 901, primary: 'Programa de monitoramento de efluentes', secondary: 'Eco Norte Indústria Ltda.', status: 'Em andamento', detail: 'LO nº 2026-1189', owner: 'Ana Beatriz', date: '61 dias decorridos' },
    { id: 902, primary: 'Relatório anual de condicionantes', secondary: 'Agrovale Empreendimentos', status: 'Pendente', detail: 'LS nº 2025-0841', owner: 'Mariana Costa', date: 'Prazo: 18 ago' },
  ],
  documentos: [
    { id: 601, primary: 'Licença_de_Operação_1189.pdf', secondary: 'Eco Norte Indústria Ltda.', status: 'Licença', detail: 'PDF · 2,4 MB', owner: 'Ana Beatriz', date: '30 jul 2026' },
    { id: 602, primary: 'Comprovante_pagamento_0861.pdf', secondary: 'Eco Norte Indústria Ltda.', status: 'Comprovante', detail: 'PDF · 820 KB', owner: 'Mariana Costa', date: '25 jul 2026' },
    { id: 603, primary: 'Estudo_hidrogeologico_v2.pdf', secondary: 'Águas do Sertão SPE', status: 'Documento técnico', detail: 'PDF · 8,1 MB', owner: 'Rafael Lima', date: '24 jul 2026' },
  ],
  usuarios: [
    { id: 11, primary: 'Mariana Costa', secondary: 'mariana@celerityambiental.com.br', status: 'Ativo', detail: 'Gestora', owner: 'Todos os módulos', date: 'Hoje, 09:42' },
    { id: 12, primary: 'Ana Beatriz', secondary: 'ana@celerityambiental.com.br', status: 'Ativo', detail: 'Técnica', owner: 'Processos e licenças', date: 'Hoje, 08:16' },
    { id: 13, primary: 'Carlos Mendes', secondary: 'carlos@celerityambiental.com.br', status: 'Ativo', detail: 'Administrativo', owner: 'Processos e documentos', date: 'Ontem, 17:38' },
    { id: 14, primary: 'Rafael Lima', secondary: 'rafael@celerityambiental.com.br', status: 'Convite enviado', detail: 'Técnico', owner: 'Poços e exigências', date: 'Convite há 2 dias' },
  ],
}

export const resourceConfig = {
  empresas: { title: 'Empresas', singular: 'empresa', description: 'Cadastro centralizado de clientes, contatos e vínculos.', search: 'Busque por razão social, CNPJ ou contato' },
  processos: { title: 'Processos', singular: 'processo', description: 'Acompanhe processos ambientais, responsáveis e movimentações.', search: 'Busque por empresa, número ou licença' },
  pocos: { title: 'Poços', singular: 'poço', description: 'Gestão de processos de outorga e licenciamento de poços.', search: 'Busque por empresa ou número do processo' },
  licencas: { title: 'Licenças', singular: 'licença', description: 'Controle emissões, vigências e renovações.', search: 'Busque por empresa, processo ou licença' },
  exigencias: { title: 'Exigências', singular: 'exigência', description: 'Prazos, respostas e evidências de atendimento.', search: 'Busque por empresa, processo ou descrição' },
  pagamentos: { title: 'Pagamentos', singular: 'pagamento', description: 'Boletos, vencimentos e comprovantes por processo.', search: 'Busque por empresa ou solicitação' },
  assessoria: { title: 'Assessoria', singular: 'acompanhamento', description: 'Obrigações e condicionantes após a emissão da licença.', search: 'Busque por empresa, licença ou exigência' },
  documentos: { title: 'Documentos', singular: 'documento', description: 'Arquivos técnicos vinculados à operação ambiental.', search: 'Busque por nome, empresa ou categoria' },
  usuarios: { title: 'Usuários', singular: 'usuário', description: 'Perfis, permissões e acessos da equipe.', search: 'Busque por nome, e-mail ou perfil' },
}
