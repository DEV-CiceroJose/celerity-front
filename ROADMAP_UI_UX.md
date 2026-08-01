# Roadmap de UI e UX

Este roadmap organiza melhorias para tornar o sistema mais rápido, previsível e confortável para as equipes técnica, administrativa e gerencial.

## Status da implementação do frontend

As etapas deste documento já possuem uma implementação funcional no frontend, usando dados demonstrativos enquanto a API não está conectada:

- busca global com atalho de teclado;
- formulários específicos, máscaras, validações e rascunho automático;
- estados de carregamento, vazio, erro, offline, sucesso e falta de permissão;
- filtros persistentes, visões salvas e ações rápidas com confirmação segura;
- painel por perfil, indicadores clicáveis e explicação dos riscos;
- detalhes com histórico, documentos, prazos e comentários;
- calendário unificado com filtros e exportação em formato ICS;
- ajuda contextual pesquisável, notificações interativas e onboarding por perfil;
- tabelas convertidas em cartões no celular e ações principais adaptadas ao toque;
- relatórios configuráveis, prévia, exportação CSV e mapa demonstrativo;
- animações de entrada, scroll reveal, microinterações e respeito à redução de movimento.

Recursos que dependem de dados reais, envio de e-mails, permissões do servidor, geocodificação ou geração oficial de documentos serão ativados na integração descrita em `INTEGRACAO_BACKEND.md`.

## Objetivos de experiência

- reduzir o tempo necessário para localizar um processo;
- tornar prazos críticos visíveis antes de virarem urgências;
- diminuir dúvidas sobre responsáveis e próximos passos;
- evitar erros de cadastro e ações destrutivas acidentais;
- adaptar a densidade de informação ao trabalho diário;
- manter a experiência consistente no computador e no celular.

## Prioridade 1 — Fluxos essenciais

### Busca global funcional

A busca do cabeçalho deve localizar empresas, processos, licenças, documentos e responsáveis. Os resultados podem ser agrupados por categoria e acessados pelo teclado.

### Formulários específicos por módulo

Os formulários atuais usam uma estrutura compartilhada. Cada módulo deve receber campos, validações e instruções próprios, incluindo:

- máscara e validação de CNPJ;
- máscara de telefone;
- validação de datas e prazos;
- prevenção de processos duplicados;
- preenchimento automático de empresa e solicitante;
- salvamento de rascunho.

### Feedback de operações

Criar um padrão único para:

- confirmação de salvamento;
- erro de validação;
- sessão expirada;
- falha de conexão;
- exclusão;
- upload em andamento;
- atualização concluída.

### Exclusão segura

Substituir exclusões imediatas por confirmação com o nome do registro. Para dados importantes, adotar arquivamento ou lixeira com possibilidade de restauração.

### Estados reais

Todas as páginas devem apresentar estados de carregamento, vazio, erro, offline, sem permissão e resultado sem correspondência.

## Prioridade 2 — Produtividade operacional

### Filtros persistentes e visões salvas

Permitir que cada usuário salve consultas como:

- “Minhas exigências vencendo nesta semana”;
- “Licenças da empresa X”;
- “Pagamentos atrasados”;
- “Processos parados há mais de 30 dias”.

### Painel de prioridades personalizado

O dashboard deve considerar o perfil e a responsabilidade do usuário. Um técnico deve visualizar suas exigências; o financeiro, pagamentos; e o gestor, riscos consolidados.

### Ações rápidas

Adicionar ações contextuais sem obrigar o usuário a abrir o detalhe completo:

- alterar responsável;
- atualizar status;
- registrar pagamento;
- marcar exigência como atendida;
- anexar documento;
- criar lembrete.

### Linha do tempo completa

Cada processo deve mostrar alterações, comentários, documentos, prazos e responsáveis em ordem cronológica, com autor e data.

### Calendário operacional

Unificar vencimentos de licenças, exigências, pagamentos e tarefas. Permitir filtros, visualização mensal e exportação para calendários externos.

## Prioridade 3 — Clareza e prevenção de erros

### Indicadores de risco explicáveis

Além da cor, cada alerta deve explicar por que um registro está crítico e qual ação é recomendada.

### Hierarquia de status

Padronizar nomes e cores de status entre módulos. Situações equivalentes não devem receber termos diferentes.

### Conteúdo de ajuda contextual

A Central de Ajuda deve abrir guias relacionados à tela atual. Campos complexos podem exibir exemplos e explicações curtas sem interromper o trabalho.

### Onboarding por perfil

No primeiro acesso, apresentar apenas os passos relevantes ao papel do usuário, como cadastrar o primeiro processo, configurar alertas ou convidar a equipe.

## Prioridade 4 — Mobile e acessibilidade

### Tabelas adaptadas

No celular, transformar linhas em resumos priorizados, mantendo número do processo, empresa, status, prazo e ação principal visíveis.

### Ações ao alcance do polegar

Em formulários móveis, manter a ação principal fixa e garantir áreas clicáveis de pelo menos 44 pixels.

### Acessibilidade contínua

- validar contraste WCAG AA;
- garantir navegação completa por teclado;
- anunciar mensagens e erros para leitores de tela;
- manter foco correto em modais e drawers;
- não comunicar status somente por cor;
- respeitar preferência de redução de movimento.

## Prioridade 5 — Visão gerencial

### Relatórios configuráveis

Permitir seleção de período, empresa, responsável, tipo e status antes da exportação. Mostrar uma prévia do resultado.

### Indicadores comparáveis

Adicionar comparações com o período anterior e permitir abrir a lista que originou cada indicador.

### Mapa de empreendimentos

Quando houver coordenadas confiáveis, apresentar processos e empreendimentos em mapa com filtros por situação e órgão responsável.

## Métricas recomendadas

Após a integração com o backend, acompanhar:

- tempo médio para localizar um processo;
- quantidade de prazos vencidos por mês;
- tempo médio de atendimento de exigências;
- percentual de cadastros devolvidos por erro;
- uso da busca global;
- uso de filtros salvos;
- tarefas concluídas por perfil;
- abandono de formulários;
- erros de API por fluxo.

## Sequência sugerida

1. integrar dados reais e estados de interface;
2. especializar formulários e validações;
3. implementar busca global e filtros salvos;
4. criar ações rápidas e linha do tempo;
5. melhorar tabelas no celular;
6. implementar onboarding e ajuda contextual;
7. evoluir relatórios, calendário e indicadores gerenciais.
