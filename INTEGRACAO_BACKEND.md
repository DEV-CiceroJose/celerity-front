# Integração do frontend com o backend Django

Este documento descreve como conectar o frontend React da Celerity Ambiental ao projeto Django existente. Os projetos podem permanecer em repositórios separados.

## Arquitetura recomendada

```text
Navegador
   |
   | HTTPS / JSON
   v
Frontend React + Vite
   |
   | /api/*
   v
Django + Django REST Framework
   |
   v
Banco de dados
```

Durante o desenvolvimento:

- frontend: `http://127.0.0.1:5173` ou `http://127.0.0.1:5179`;
- backend: `http://127.0.0.1:8000`;
- API: `http://127.0.0.1:8000/api`.

Em produção, recomenda-se publicar ambos no mesmo domínio e encaminhar `/api` para o Django. Isso simplifica cookies, CSRF e CORS.

## 1. Preparar o backend

Instale os pacotes necessários no ambiente do Django:

```bash
pip install djangorestframework django-cors-headers
```

Adicione os aplicativos em `settings.py`:

```python
INSTALLED_APPS = [
    # aplicativos do Django
    "corsheaders",
    "rest_framework",
    # aplicativos da Celerity
]
```

Adicione o middleware de CORS antes de `CommonMiddleware`:

```python
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    # demais middlewares
]
```

Configuração para desenvolvimento:

```python
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5179",
]

CSRF_TRUSTED_ORIGINS = [
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5179",
]

CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}
```

Não utilize `CORS_ALLOW_ALL_ORIGINS = True` em produção.

## 2. Criar a raiz da API

No arquivo principal de rotas do Django:

```python
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.api_urls")),
    path("api/processos/", include("processos.api_urls")),
    path("api/pocos/", include("pocos.api_urls")),
    path("api/operacao/", include("outros.api_urls")),
]
```

Cada aplicativo deve expor serializers, viewsets e um arquivo `api_urls.py`. As views HTML existentes podem continuar funcionando enquanto a API é criada.

## 3. Contrato inicial de endpoints

| Área do frontend | Método | Endpoint sugerido |
| --- | --- | --- |
| Sessão atual | GET | `/api/auth/session/` |
| Login | POST | `/api/auth/login/` |
| Logout | POST | `/api/auth/logout/` |
| Cadastro | POST | `/api/auth/register/` |
| Recuperação de senha | POST | `/api/auth/password/forgot/` |
| Redefinição de senha | POST | `/api/auth/password/reset/` |
| Dashboard | GET | `/api/dashboard/summary/` |
| Empresas | GET, POST | `/api/empresas/` |
| Empresa | GET, PATCH, DELETE | `/api/empresas/{id}/` |
| Processos | GET, POST | `/api/processos/` |
| Processo | GET, PATCH, DELETE | `/api/processos/{id}/` |
| Poços | GET, POST | `/api/pocos/` |
| Poço | GET, PATCH, DELETE | `/api/pocos/{id}/` |
| Licenças | GET, POST | `/api/licencas/` |
| Licença | GET, PATCH, DELETE | `/api/licencas/{id}/` |
| Exigências | GET, POST | `/api/exigencias/` |
| Exigência | GET, PATCH, DELETE | `/api/exigencias/{id}/` |
| Pagamentos | GET, POST | `/api/pagamentos/` |
| Pagamento | GET, PATCH, DELETE | `/api/pagamentos/{id}/` |
| Controle mensal | GET, POST | `/api/controle-mensal/` |
| Assessoria | GET, POST | `/api/assessoria/` |
| Documentos | GET, POST | `/api/documentos/` |
| Usuários | GET, POST | `/api/usuarios/` |
| Usuário | GET, PATCH | `/api/usuarios/{id}/` |
| Relatórios | GET | `/api/relatorios/{tipo}/` |
| Notificações | GET | `/api/notificacoes/` |
| Marcar notificação como lida | PATCH | `/api/notificacoes/{id}/` |

Listagens devem aceitar parâmetros de consulta:

```text
?search=empresa&status=pendente&page=1&page_size=20&ordering=-data_inicio
```

Resposta recomendada para paginação:

```json
{
  "count": 148,
  "next": "/api/processos/?page=2",
  "previous": null,
  "results": []
}
```

## 4. Configurar o frontend

Crie um arquivo `.env` a partir de `.env.example`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

O arquivo `src/services/api.js` já centraliza a URL e envia cookies com cada solicitação.

Para autenticação por sessão, inclua o token CSRF nas requisições de alteração:

```javascript
function getCookie(name) {
  const item = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`))

  return item ? decodeURIComponent(item.split('=')[1]) : ''
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error('Não foi possível concluir a solicitação.')
  }

  return response.status === 204 ? null : response.json()
}
```

## 5. Substituir os dados simulados

A migração deve ser feita módulo por módulo:

1. criar o endpoint no Django;
2. criar ou atualizar o serviço correspondente em `src/services`;
3. substituir a leitura de `src/data/mockData.js` pelo serviço;
4. conectar estados de carregamento, erro e lista vazia;
5. conectar criação, edição e exclusão;
6. validar permissões e mensagens do backend;
7. remover apenas os mocks do módulo concluído.

Exemplo de serviço:

```javascript
import { apiRequest } from './api'

export const processService = {
  list(params = '') {
    return apiRequest(`/processos/${params ? `?${params}` : ''}`)
  },
  detail(id) {
    return apiRequest(`/processos/${id}/`)
  },
  create(payload) {
    return apiRequest('/processos/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  update(id, payload) {
    return apiRequest(`/processos/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  remove(id) {
    return apiRequest(`/processos/${id}/`, { method: 'DELETE' })
  },
}
```

## 6. Upload de documentos

Arquivos devem usar `FormData`. Não defina manualmente o cabeçalho `Content-Type`, pois o navegador adiciona o limite multipart correto.

```javascript
const data = new FormData()
data.append('arquivo', file)
data.append('processo', processId)

await fetch(`${API_URL}/documentos/`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'X-CSRFToken': getCookie('csrftoken') },
  body: data,
})
```

O backend deve validar tipo, tamanho, permissão e vínculo do arquivo.

## 7. Segurança antes da produção

- armazenar senhas somente no Django, usando o sistema de hash nativo;
- utilizar cookies `HttpOnly`, `Secure` e `SameSite` adequados;
- exigir HTTPS;
- validar permissões no backend em todos os endpoints;
- validar CNPJ, telefone, arquivos e regras de negócio no backend;
- retirar `DEBUG = True`;
- mover `SECRET_KEY` e credenciais para variáveis de ambiente;
- configurar `ALLOWED_HOSTS`;
- substituir SQLite por PostgreSQL quando necessário;
- registrar alterações críticas em uma trilha de auditoria;
- limitar tentativas de login e recuperação de senha.

O armazenamento local usado atualmente no frontend serve somente para demonstração. Ele deve ser removido quando os endpoints de autenticação estiverem disponíveis.

## 8. Ordem recomendada de integração

1. sessão, login e logout;
2. processos e poços;
3. licenças e exigências;
4. pagamentos e assessoria;
5. empresas e usuários;
6. documentos;
7. dashboard, relatórios e notificações;
8. configurações e auditoria.

## 9. Checklist de validação

- [ ] Login mantém a sessão após atualizar a página.
- [ ] Logout invalida a sessão no backend.
- [ ] Rotas protegidas bloqueiam usuários não autenticados.
- [ ] Permissões são verificadas pelo Django.
- [ ] CSRF está ativo em operações de escrita.
- [ ] Erros da API aparecem próximos ao campo correto.
- [ ] Listagens suportam pesquisa, filtros e paginação.
- [ ] Uploads são validados e protegidos.
- [ ] Datas usam o mesmo fuso horário nos dois projetos.
- [ ] Exclusões exigem confirmação.
- [ ] Estados de carregamento, vazio e erro foram testados.
