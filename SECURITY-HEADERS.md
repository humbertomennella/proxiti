# Cabeçalhos de segurança recomendados

Estes cabeçalhos devem ser configurados no servidor, CDN ou plataforma de hospedagem. Não devem ser simulados com meta tags no HTML.

## Configuração-base

```http
Content-Security-Policy: default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; upgrade-insecure-requests
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
```

## Observações de implantação

- Ative `Strict-Transport-Security` somente depois de confirmar que o domínio e os subdomínios funcionam integralmente em HTTPS.
- Redirecione HTTP para HTTPS no servidor ou na plataforma de hospedagem.
- `frame-ancestors 'none'` é a proteção principal contra incorporação por iframe; `X-Frame-Options: DENY` funciona como compatibilidade adicional.
- A política considera o CSS e o JavaScript locais, imagens locais, manifesto local e SVGs inseridos diretamente no HTML.
- A marcação JSON-LD presente no HTML é metadado e não executa código. Se a hospedagem ou o navegador registrar bloqueio desse bloco, use um hash CSP específico para o conteúdo publicado em vez de liberar `unsafe-inline`.
- Se forem adicionados Analytics, mapas, vídeos externos, fontes remotas, formulários de terceiros ou monitoramento, revise a CSP antes de publicar. Não amplie as origens por tentativa e erro.
- Configure cache longo para arquivos versionados em `assets/` e cache curto para `index.html`, `robots.txt`, `sitemap.xml` e `site.webmanifest`.
