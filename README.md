# PROXITI

Site institucional e comercial da PROXITI, operação de suporte técnico, redes, infraestrutura essencial e segurança digital preventiva em Curitiba/PR.

**Site:** https://proxiti.com.br/

## Estrutura pública

- `/` — apresentação da PROXITI, serviços, processo e contato.
- `/produtos/` — catálogo de produtos digitais.
- `/produtos/pc-seguro/` — página comercial do PC Seguro.
- `/privacidade/` — política operacional de privacidade.
- `/termos/` — termos gerais de atendimento.

## Produtos digitais

O primeiro produto é o **PC Seguro**, um guia prático de segurança digital para usuários comuns.

A URL de checkout automático fica centralizada em:

`assets/js/product-config.js`

Enquanto não houver checkout externo configurado, o site usa compra assistida pelo WhatsApp. Arquivos pagos não devem ser publicados no repositório nem no GitHub Pages.

## Tecnologia

O projeto é intencionalmente simples:

- HTML semântico;
- CSS responsivo;
- JavaScript sem framework;
- tema claro/escuro;
- GitHub Pages;
- sitemap, canonical e metadados Open Graph.

A escolha evita dependências desnecessárias para um site institucional estático.

## Contato oficial

- Telefone / WhatsApp: **(41) 99823-5598**
- E-mail: **contato.proxiti@gmail.com**
- Área principal: **Curitiba/PR**

## Segurança e manutenção

- Nunca publicar tokens, chaves, senhas ou dados de clientes.
- Nunca hospedar produtos pagos diretamente no repositório público.
- Revisar `SECURITY-HEADERS.md` antes de adicionar serviços externos.
- Usar `PUBLICATION-CHECKLIST.md` como checklist de manutenção.
