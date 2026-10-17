# Contato temporário pelo WhatsApp

Proposta em revisão, sem publicação. O formulário prepara uma mensagem para revisão e envio manual pelo visitante. Não cria chamado nem confirma agendamento. Chat, Minha PROXITI e painel continuam dependentes do Supabase.

Validação local: `node tests/site-requests-direct.mjs`, `node tests/site-ui.mjs` e `git diff --check`. Não houve envio de mensagem real.

Reversão: reverter somente os commits desta proposta. O fluxo anterior depende do Supabase; verificar sua recuperação separadamente antes de reverter.
