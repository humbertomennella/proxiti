# Contato temporário pelo WhatsApp: RASCUNHO BLOQUEADO

Esta proposta NÃO está pronta para merge nem publicação.

## O que já está aplicado na branch
- Script do formulário sem Supabase, rede ou armazenamento local.
- Mensagem preparada no número público existente, com revisão e envio manual pelo visitante.
- Testes do modo temporário.

## Bloqueio concreto
O envio de `index.html` completo falha na integração com `Malformed RPC request (could not parse JSON)`. O navegador não tem sessão GitHub autenticada e o Git local não possui credencial para push. Portanto a página da branch ainda não contém os avisos, minimização e textos compatíveis com o novo script. Os testes completos da branch não devem ser tratados como aprovados.

## Alteração preservada e revisável
`patches/temporary-whatsapp-index.patch` contém exatamente o diff pendente da página, contra a base bf1bf50ce6a83ef19cc6be2bfdfc9e659d11bf25. O pacote local `proxiti-correcao-temporaria.zip` está intacto. Nenhuma alteração foi enviada à main.

Em checkout isolado desta branch:

```sh
git apply --check patches/temporary-whatsapp-index.patch
git apply patches/temporary-whatsapp-index.patch
node tests/site-requests-direct.mjs
node tests/site-ui.mjs
git diff --check
```

Antes de considerar pronta: incorporar a página, remover o patch auxiliar se desejado, testar o modal e a abertura da mensagem em celular e conferir o destino público. Não enviar mensagem real sem autorização. Chat, Minha PROXITI e painel permanecem fora do escopo. Não há registro de chamado nem confirmação de horário por este formulário.

## Reversão
Reverter apenas os commits desta proposta. O fluxo anterior depende do Supabase; verificar sua recuperação separadamente antes de reverter. Nunca fazer merge ou deploy sem nova autorização.
