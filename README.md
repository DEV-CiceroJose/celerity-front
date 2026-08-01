# Frontend Celerity Ambiental

Interface React para o sistema de gestão ambiental da Celerity. O projeto usa dados simulados isolados em `src/data` e uma camada de serviços preparada para a futura API Django.

Responsável pelo projeto: **DEV-CiceroJose**.

## Executar

```bash
npm install
npm run dev
```

Copie `.env.example` para `.env` se precisar alterar a URL da API.

## Rotas públicas

- `/` — landing page
- `/login` — acesso ao sistema
- `/cadastro` — solicitação de cadastro
- `/recuperar-senha`
- `/redefinir-senha`
- `/sessao-expirada`

## Rotas do sistema

Todas ficam sob `/app`: `dashboard`, `empresas`, `processos`, `pocos`, `licencas`, `exigencias`, `pagamentos`, `calendario`, `controle-mensal`, `assessoria`, `documentos`, `relatorios`, `usuarios`, `configuracoes`, `notificacoes` e `ajuda`.

Os módulos principais incluem rotas de listagem, cadastro, detalhes e edição. Poços inclui as subáreas de acompanhamento, licenciados, indeferidos e exigências; licenças inclui o calendário de vencimentos.

## Experiência disponível

- landing page comercial orientada às dores do cliente;
- busca global com `Ctrl + K` ou `⌘ K`;
- filtros persistentes, visões salvas e ações rápidas;
- formulários validados com rascunho automático;
- calendário unificado e relatórios configuráveis;
- central de ajuda pesquisável e notificações interativas;
- onboarding por perfil, estados de conexão e controle de permissões;
- layout responsivo, tabelas em cartões no celular e animações com scroll reveal.

Acesso demonstrativo: `demo@celerityambiental.com.br` com a senha `Celerity@2026`.

## Integração futura

Variável necessária:

```env
VITE_API_URL=http://localhost:8000/api
```

Os serviços devem concentrar toda comunicação HTTP. A autenticação atual é simulada via armazenamento local e deve ser substituída por sessão segura ou token HTTP-only fornecido pelo backend.

O procedimento completo, os endpoints sugeridos e a configuração do Django estão em [INTEGRACAO_BACKEND.md](./INTEGRACAO_BACKEND.md).

## Pendências de backend

- disponibilizar endpoints REST;
- implementar autenticação e permissões por perfil;
- vincular formulários aos endpoints;
- substituir mocks por respostas da API;
- implementar upload e download protegido;
- ativar exportações PDF/Excel e notificações reais.

## Evolução da experiência

As melhorias recomendadas de interface e experiência estão organizadas em [ROADMAP_UI_UX.md](./ROADMAP_UI_UX.md).
