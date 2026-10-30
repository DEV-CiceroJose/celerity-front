# Datas e lembretes — versão integrada

O backend recebido em `celerity.zip` está em `backend/`. A interface da raiz e a cópia em `backend/frontend/` usam a API Django com sessão e CSRF. Os registros e estados dos alertas ficam no banco, sem depender do armazenamento local de demonstração.

O guia completo de execução, configuração de SMTP, rotina automática e vínculo das licenças antigas está em [backend/COMO_RODAR.md](./backend/COMO_RODAR.md).

## Regras

- Fuso fixo de referência: `America/Sao_Paulo` (Brasília), com relógio sincronizado pelo servidor.
- Dias contados: dias corridos desde início/entrada/emissão, primeiro dia zero. Conclusão ou atendimento encerra a contagem nos registros integrados.
- Dias restantes: diferença entre o vencimento e o dia atual, separada dos dias contados.
- Antecedência única no servidor: `LICENSE_REMINDER_DAYS`, padrão 60, mínimo 60. A API fornece o valor à interface, sem exigir outro build para alterá-lo.
- Alertas na janela de renovação, no dia do vencimento e após vencer. Leitura, arquivo e adiamento persistem por usuário.
- Registros antigos exigem indicação explícita do usuário responsável para envio; registros criados pela API usam o proprietário ou a atribuição autorizada.
- A rotina de servidor `watch_license_reminders` faz a verificação automática sem navegador. `send_license_reminders --dry-run` apenas confere as mensagens pendentes.

## Arquivos principais

- `backend/celerity/dates.py`: datas e contagens do servidor.
- `backend/celerity/forms.py`: campos calculados somente para consulta, depois das datas.
- `backend/integracao/reminders.py`: vínculo dos registros reais e sincronização dos avisos.
- `backend/celerity_reminders/`: envio, deduplicação e rotina automática.
- `src/hooks/useLicenseAlerts.js`: estado compartilhado do sino, aviso e central de notificações.
- `src/hooks/useResources.js`: consulta dos registros na API e atualização das contagens.

O ZIP original e seu banco foram preservados. As migrações foram testadas em banco separado. E-mails reais precisam de SMTP válido e da rotina em execução no ambiente de implantação; nenhuma mensagem externa foi enviada durante a validação.
