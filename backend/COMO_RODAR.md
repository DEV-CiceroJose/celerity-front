# Celerity atualizado — backend, interface e lembretes

Esta versão reúne o backend enviado em `celerity.zip` com as correções de datas e o sistema de renovação de licenças. O banco `db.sqlite3` recebido foi preservado sem alterações. As validações usaram bancos separados.

## Executar

Na pasta que contém `manage.py`:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver
```

Em outra janela:

```powershell
cd frontend
npm ci
npm run dev
```

Abra http://127.0.0.1:5173. O acesso de demonstração já existente no projeto foi mantido: `demo@celerityambiental.com.br`, senha `Celerity@2026`.

As migrações substituem os contadores gravados por cálculos feitos a partir das datas, criam os registros de notificações e de envio e adicionam o usuário responsável às licenças legadas. Faça uma cópia do banco antes de aplicar migrações em uma instalação em uso.

## Datas e dias contados

- Referência: `America/Sao_Paulo`, horário de Brasília. A interface sincroniza o relógio com o servidor.
- Dias contados: dias corridos desde início, entrada ou emissão; o primeiro dia é zero.
- Dias restantes: diferença entre o vencimento e o dia atual. É uma informação separada dos dias decorridos.
- A contagem muda sem precisar salvar o registro novamente. Formulários React e formulários Django abertos também atualizam o campo calculado.
- Os formulários antigos usam listas explícitas de campos. **Dias contados** aparece depois da data e é somente leitura.

## Quem recebe os alertas

As licenças criadas pela interface são vinculadas ao usuário que as cadastrou. O administrador pode atribuir `responsavelId` a outro usuário ativo pela API. O texto livre do nome do responsável não é usado para adivinhar destinatários.

Licenças antigas de **Gerais licenciados** e **Poços licenciados** têm o campo **Usuário responsável pelos alertas** no cadastro/admin. Preencha esse vínculo para habilitar os alertas desses registros. Sem vínculo, o sistema mantém os dados e não envia e-mail para destinatários presumidos.

A central, o aviso no topo e o sino consultam os mesmos alertas. Leitura, arquivamento e adiamento ficam no banco, por usuário, e permanecem entre computadores. Licenças renovadas, removidas, canceladas, substituídas ou arquivadas deixam de gerar o aviso da vigência anterior. Uma nova data de vencimento ou a passagem para vencida permite outro aviso.

## Antecedência

A configuração única do servidor é `LICENSE_REMINDER_DAYS`, com padrão 60 e mínimo 60. A interface consulta esse valor pela API. Para mudar para 90 dias no PowerShell, antes de iniciar servidor e rotina:

```powershell
$env:LICENSE_REMINDER_DAYS = '90'
```

## Habilitar envio real por e-mail

O padrão não envia mensagens externas. Sem um serviço configurado, a rotina recusa registrar mensagens como enviadas. Configure as variáveis no ambiente do servidor e da rotina, sem colocar senhas no frontend nem em arquivos versionados:

```powershell
$env:EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
$env:EMAIL_HOST = 'servidor SMTP fornecido pelo seu provedor'
$env:EMAIL_PORT = '587'
$env:EMAIL_USE_TLS = 'true'
$env:EMAIL_HOST_USER = 'usuário fornecido pelo provedor'
$env:EMAIL_HOST_PASSWORD = 'credencial fornecida pelo provedor'
$env:DEFAULT_FROM_EMAIL = 'remetente autorizado pelo provedor'
$env:CELERITY_FRONTEND_URL = 'https://endereco-do-seu-sistema'
```

Esses valores são exemplos de campos a preencher, não credenciais válidas. O Django carrega automaticamente o arquivo `.env` da pasta do backend. Variáveis definidas no processo têm prioridade. O arquivo `.env` é privado e não deve ser versionado. Em produção, configure também a origem HTTPS em `CSRF_TRUSTED_ORIGINS` (origens separadas por vírgula).

Confira as mensagens pendentes sem enviar:

```powershell
.\.venv\Scripts\python.exe manage.py send_license_reminders --dry-run
```

Para manter a verificação automática a cada hora, execute em outra janela com as mesmas variáveis:

```powershell
.\.venv\Scripts\python.exe manage.py watch_license_reminders --interval 3600
```

Essa rotina funciona sem o navegador aberto. Em produção, mantenha-a em um serviço supervisionado ou agende `manage.py send_license_reminders` a cada hora. Não é uma automação dependente do computador do usuário ou do carregamento de uma página.

Cada destinatário recebe sua própria mensagem. O banco registra um envio por licença, vigência, destinatário e tipo de aviso (renovação/vencida); falhas podem ser tentadas novamente. Os alertas visuais funcionam mesmo sem SMTP. O envio SMTP e a confirmação no banco não são uma transação única: uma interrupção entre ambos pode repetir uma mensagem; para garantia de envio exatamente uma vez, seria necessário um provedor com idempotência.

## Validação

```powershell
.\.venv\Scripts\python.exe manage.py test integracao celerity_reminders processos pocos outros
cd frontend
npm test
npm run build
```

Os testes de e-mail usam uma caixa em memória e não enviam mensagens externas. O fluxo também foi validado em Chromium: login e logout reais com CSRF, cadastro e edição no banco, limite de 60/61 dias, leitura entre dois navegadores, adiamento, calendário e botão de salvar no celular. O relógio do navegador foi configurado para outro fuso, e a contagem continuou usando Brasília.

Antes de publicar, configure `DJANGO_SECRET_KEY` com uma chave própria, `DEBUG=False`, `ALLOWED_HOSTS`, HTTPS e um banco de produção. O pacote mantém a configuração local de demonstração do projeto recebido.

Verificação realizada nesta entrega: 29 testes Django e 7 testes de datas do frontend passaram; o build foi gerado sem erros. As migrações também foram aplicadas a uma cópia independente do banco recebido, preservando a quantidade de registros de negócio.


## Configuração por arquivo .env e dados fictícios opcionais

Copie `.env.example` para `.env` na pasta que contém `manage.py`. Preencha `BREVO_API_KEY`, `DEFAULT_FROM_EMAIL` e use `EMAIL_BACKEND=celerity_reminders.brevo.BrevoEmailBackend` para ativar o Brevo. A chave permanece no backend e não é enviada ao navegador.

Para testar com os dados fictícios, defina `CELERITY_LOCAL_TEST_MODE=true`. Deixe `CELERITY_DB_PATH` em branco para usar automaticamente `.local-test/db.sqlite3`, separado do banco normal. Depois execute:

```powershell
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py seed_local_test
.\.venv\Scripts\python.exe manage.py runserver
```

Acesse a interface em `/teste-local`. O comando cria 5 registros fictícios, incluindo uma licença a vencer e outra vencida, com 2 alertas ativos. Ele pode ser repetido sem duplicar os registros e recusa gravar no banco original `db.sqlite3`.

Para voltar aos dados normais, use `CELERITY_LOCAL_TEST_MODE=false`, deixe `CELERITY_DB_PATH` em branco e reinicie o servidor. Os dados fictícios permanecem no banco separado e os endpoints do teste ficam desativados. Nenhuma credencial ou banco acompanha o código publicado no GitHub.
