# Cabeçalhos e hospedagem

O projeto continua estático, destinado ao GitHub Pages. Este documento não ativa cabeçalhos HTTP. Não tratar instruções de servidor/CDN como configuração aplicada.

## Configuração proposta, quando a infraestrutura permitir

```http
Content-Security-Policy: default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; upgrade-insecure-requests
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
X-Frame-Options: DENY
```

- Verificar suporte na hospedagem/CDN antes de aplicar. Um arquivo `_headers`, `.htaccess` ou este Markdown não configura o GitHub Pages por si só.
- Validar em ambiente de teste ou modo Report-Only. A política considera CSS, JavaScript e imagens locais. O JSON-LD não é código executável; se houver bloqueio reportado, investigar e usar hash específico se necessário, sem liberar `unsafe-inline` indiscriminadamente.
- Não substituir `frame-ancestors`, `X-Frame-Options` ou HSTS por meta tags.
- HSTS depende de HTTPS estável. Não aplicar `includeSubDomains` ou `preload` sem confirmar cobertura de todos os subdomínios. [Referência de HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security).
- Os nomes atuais de CSS/JS não contêm hash de conteúdo. Evitar cache imutável de longa duração nesses caminhos; permitir revalidação.
- Conferir HTTPS, redirecionamentos, compressão e cabeçalhos na resposta pública após a publicação. Nenhuma alteração de DNS/CDN foi feita nesta revisão.
- Antes de adicionar mapas, Analytics, fontes remotas, vídeos ou formulários externos, revisar os dados transmitidos, privacidade e CSP.

## Revisão local

`npm run dev` inicia o servidor local de revisão com Node.js 22 ou superior, sem dependências. Ele não substitui o GitHub Pages, não implementa TLS e não deve ser usado como servidor de produção. Envia `no-store` para facilitar a revisão.

O Pages é hospedagem estática e registra IPs para segurança: [documentação oficial](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
