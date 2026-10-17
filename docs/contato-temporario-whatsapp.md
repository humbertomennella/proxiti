# Rascunho bloqueado: contato temporário

NÃO fazer merge nem publicar.

O envio da página completa falha com `Malformed RPC request (could not parse JSON)`. A verificação confirmou que a branch anterior já continha `index.html` reduzido ao literal `@work/proxiti/index.html`, não ao HTML real. O pacote local e a main estão intactos. Git local sem credencial de push e navegador sem sessão autenticada.

O script do formulário e os testes foram alinhados ao pacote validado. A página correta está preservada como patch e pode ser reconstruída em checkout isolado:

```sh
python3 scripts/prepare-temporary-homepage.py
node tests/site-requests-direct.mjs
node tests/site-ui.mjs
git diff --check
```

O script restaura a base exata bf1bf50ce6a83ef19cc6be2bfdfc9e659d11bf25 e aplica o patch. Preserva o conteúdo anterior, recusa conteúdo inesperado e verifica SHA-256. Não faz commit, push ou publicação. A página resultante ainda precisa ser incorporada à proposta com acesso de escrita. Os testes da branch SEM essa reconstrução não estão aprovados.

A mensagem abre no WhatsApp público existente para revisão e envio manual. Não registra chamado nem confirma horário. Chat, Minha PROXITI e painel continuam fora do escopo. Antes de publicar, testar em celular e confirmar o destino público. Não houve mensagem real.

Reversão: reverter somente os commits desta proposta. O fluxo antigo volta a depender do Supabase. Nenhum merge ou deploy sem nova autorização.
