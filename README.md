# PROXITI

Site institucional e comercial da PROXITI, operação de suporte técnico, redes, infraestrutura essencial e segurança digital preventiva em Curitiba/PR.

**Site:** https://proxiti.com.br/

## Estrutura pública

- `/` — home comercial, serviços, método e pré-diagnóstico.
- `/produtos/` — catálogo de produtos digitais.
- `/produtos/pc-seguro/` — página comercial do PC Seguro.
- `/privacidade/` — política de privacidade.
- `/termos/` — termos gerais de atendimento.
- `/.well-known/security.txt` — canal padronizado para assuntos de segurança.

## Diferencial operacional

A comunicação da PROXITI parte de quatro princípios:

1. diagnóstico antes da decisão;
2. solução proporcional ao problema;
3. limites de atuação declarados;
4. acesso técnico somente quando necessário e autorizado.

A home inclui um **pré-diagnóstico local**: o formulário organiza as informações no navegador e abre uma mensagem estruturada no WhatsApp. Não existe envio do formulário para backend.

## Produto digital

O primeiro produto é o **PC Seguro**, guia prático de segurança digital para usuários comuns.

A URL de checkout automático permanece centralizada em:

`assets/js/product-config.js`

Enquanto o checkout estiver vazio, o site usa compra assistida pelo WhatsApp. Arquivos pagos não devem ser publicados no repositório nem no GitHub Pages.

## Tecnologia

- HTML semântico;
- CSS responsivo, sem framework;
- JavaScript sem dependências;
- tema claro/escuro;
- GitHub Pages;
- sitemap, canonical e Open Graph;
- layout mínimo de 320 px;
- foco visível e respeito a `prefers-reduced-motion`.

## Identidade visual

A direção visual está documentada em `DESIGN-SYSTEM.md`.

## Contato

- Telefone / WhatsApp: **(41) 99823-5598**
- E-mail: **contato.proxiti@gmail.com**
- Área principal: **Curitiba/PR**

## Manutenção

- nunca publicar tokens, chaves, senhas ou dados de clientes;
- nunca hospedar produtos pagos diretamente no repositório público;
- não publicar métricas, depoimentos ou garantias sem evidência;
- manter o escopo atual coerente com os serviços realmente executados;
- usar `PUBLICATION-CHECKLIST.md` antes de mudanças relevantes.
