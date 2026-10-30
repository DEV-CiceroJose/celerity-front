# Celerity Ambiental

Frontend React/Vite integrado ao backend Django, com datas em Brasília e lembretes de renovação de licenças.

## Executar a partir deste repositório

Backend, em uma janela:

```powershell
cd backend
py -m venv .venv
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver
```

Frontend, na raiz, em outra janela:

```powershell
npm ci
npm run dev
```

Abra http://127.0.0.1:5173. O Vite encaminha `/api` para `127.0.0.1:8000`. A versão em `backend/frontend` também contém a interface atualizada para permitir distribuir o projeto completo em um ZIP.

## Dias e lembretes de licenças

Data, hora e contagem de dias seguem Brasília. Os formulários apresentam **Dias contados** automaticamente, e as notificações de renovação usam uma antecedência única no servidor, padrão de 60 dias.

Os alertas, seus estados de leitura e os registros são persistidos no Django por usuário. O módulo de e-mail usa as licenças reais, guarda os envios e possui uma rotina automática independente do navegador. É necessário configurar SMTP e manter a rotina em execução para enviar e-mails reais.

Veja [LEMBRETES_E_DATAS.md](./LEMBRETES_E_DATAS.md) e [o guia de execução completo](./backend/COMO_RODAR.md).

## Verificar

```powershell
npm test
npm run build
cd backend
.\.venv\Scripts\python.exe manage.py test integracao celerity_reminders processos pocos outros
```

Acesso de demonstração existente: `demo@celerityambiental.com.br`, senha `Celerity@2026`. O projeto recebido tem configuração local de desenvolvimento; a publicação em servidor exige as configurações de produção do Django.

## Demonstração local com alertas ativos

Veja [TESTE_LOCAL.md](./TESTE_LOCAL.md). O painel oferece dados fictícios e envio manual de um lembrete real após conectar uma conta de e-mail.


## Ambiente e opção de mocks

O backend lê `backend/.env`; o repositório fornece apenas o modelo sem credenciais em `backend/.env.example`. Configure nele a chave do Brevo e um remetente validado. Mantenha as credenciais fora do frontend.

`CELERITY_LOCAL_TEST_MODE=false` é o padrão. Para testar, altere para `true`, deixe `CELERITY_DB_PATH` em branco e execute `seed_local_test` após as migrações. O cenário usa seu próprio banco e exibe dois alertas ativos. Veja [o passo a passo](./TESTE_LOCAL.md#habilitar-o-cenário-pelo-env).
