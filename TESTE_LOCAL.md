# Demonstração local dos alertas

Abra `http://127.0.0.1:5173/teste-local` enquanto os servidores estiverem em execução. O atalho entra na conta de demonstração e abre o painel de teste.

Os dados ficam separados em `backend/.local-test/db.sqlite3`. O banco original não é usado neste teste. O cenário contém uma licença que vence em 30 dias, outra vencida há 5 dias e uma regular; as duas primeiras já possuem alertas ativos. Há também um processo com 42 dias contados e uma exigência com 12 dias.

## Envio real para o endereço escolhido

1. No painel, informe o e-mail que receberá o teste.
2. Informe a conta Gmail que enviará a mensagem e uma senha de app do Google. A conta precisa oferecer essa opção; veja [as instruções oficiais](https://support.google.com/accounts/answer/185833?hl=pt-BR).
3. Clique em **Enviar e-mail real de teste**.

A aplicação conecta diretamente ao SMTP do Gmail com TLS. As credenciais são usadas apenas nessa tentativa, sem gravação em banco, arquivo ou armazenamento local do navegador. A senha de app é removida do formulário após o sucesso. Não use a senha normal da conta nem envie credenciais pelo chat.

Sem uma conta de envio configurada, não há como entregar mensagens a um e-mail real. O painel exibe a falta de configuração ou o erro de autenticação, sem simular confirmação de envio. Após o aceite do provedor, confira a caixa de entrada e o spam. Cada clique após uma confirmação permite uma nova mensagem; uma repetição da mesma solicitação durante falha de rede usa a mesma chave para evitar duplicação.

## Reiniciar a demonstração

Na raiz do projeto, em uma janela PowerShell:

```powershell
$env:CELERITY_LOCAL_TEST_MODE = 'true'
New-Item -ItemType Directory -Force backend/.local-test | Out-Null
$env:CELERITY_DB_PATH = Join-Path (Get-Location).Path 'backend/.local-test/db.sqlite3'
.\backend\.venv\Scripts\python.exe backend/manage.py migrate
.\backend\.venv\Scripts\python.exe backend/manage.py seed_local_test
.\backend\.venv\Scripts\python.exe backend/manage.py runserver 127.0.0.1:8000 --noreload
```

Em outra janela, na mesma raiz:

```powershell
npm run dev -- --host 127.0.0.1
```

Se o ambiente Python ainda não existir, crie-o com `python -m venv backend/.venv` e instale `backend/requirements.txt` antes de iniciar. O modo de testes não é habilitado por padrão e o envio manual só aceita requisições autenticadas vindas do próprio computador. O servidor normal e o envio periódico de produção continuam usando sua configuração própria.

Os testes automatizados de envio usam um provedor em memória; nenhuma mensagem externa foi enviada durante a implementação. Foram verificados envio pela mesma composição de lembrete, chave de repetição, destinatário, vínculo do usuário, autenticação SMTP, bloqueio fora da demonstração e CSRF.


## Envio real pelo Brevo

No painel, escolha **Brevo — envio real por API**. Crie sua conta em https://www.brevo.com/pt/, cadastre e valide o remetente e gere uma chave em **SMTP e API → Chaves de API**. Preencha o destinatário, o remetente validado e a chave no painel local e clique em enviar. A chave é usada somente durante a tentativa, não é gravada e é removida do campo após o sucesso. Use uma chave de API, não uma chave SMTP; não envie a chave pelo chat.

O sistema chama `https://api.brevo.com/v3/smtp/email` e só registra sucesso quando o Brevo confirma a aceitação com um identificador de mensagem. Em caso de credencial inválida, remetente não autorizado, limite ou falha de conexão, a interface exibe o erro. Confira a atividade da conta e a caixa de spam após o aceite do provedor.

Para habilitar também a rotina automática pelo Brevo no servidor, configure `EMAIL_BACKEND=celerity_reminders.brevo.BrevoEmailBackend`, `BREVO_API_KEY` e `DEFAULT_FROM_EMAIL` com os valores da sua conta, no ambiente do processo que executa o envio.

Referência: https://developers.brevo.com/docs/send-a-transactional-email


## Habilitar o cenário pelo .env

O backend agora carrega `backend/.env` automaticamente. A versão publicada contém somente `backend/.env.example`, sem credenciais.

Para habilitar a demonstração:

1. Copie `backend/.env.example` para `backend/.env`.
2. Defina `CELERITY_LOCAL_TEST_MODE=true` e deixe `CELERITY_DB_PATH` em branco.
3. Para usar o Brevo já configurado, preencha a chave e o remetente no `.env` e altere `EMAIL_BACKEND` para `celerity_reminders.brevo.BrevoEmailBackend`.
4. Execute as migrações e `seed_local_test`, depois inicie o servidor.

Quando a chave estiver no `.env`, o painel selecionará **Conta já configurada no servidor**; basta informar o destinatário e clicar em enviar. Nenhum envio é feito ao carregar a página.

Para desabilitar os mocks, altere `CELERITY_LOCAL_TEST_MODE=false`, deixe `CELERITY_DB_PATH` em branco e reinicie. A configuração publicada mantém essa opção desativada por padrão. Os caminhos relativos de banco são resolvidos a partir da pasta `backend`, independentemente da pasta onde o comando foi executado.
