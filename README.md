# PROXITI

Site institucional e comercial da PROXITI, operação de suporte técnico, redes, backup, organização de acessos e segurança digital preventiva em Curitiba/PR.

**Site:** https://proxiti.com.br/

## Estrutura pública

- `/` — home comercial, cenários, serviços, processo e pré-diagnóstico.
- `/servicos/` — escopo detalhado de atuação.
- `/privacidade/` — política de privacidade.
- `/termos/` — termos gerais de atendimento.
- `/.well-known/security.txt` — canal de contato para assuntos de segurança.

## Posicionamento

A comunicação foi estruturada para responder de forma objetiva:

1. o que a PROXITI atende;
2. quais problemas entram no escopo;
3. como o atendimento começa;
4. como escopo e autorização são tratados;
5. quais serviços não fazem parte da operação atual;
6. qual é o próximo passo comercial.

O site evita métricas, SLAs, depoimentos, garantias e selos que não possam ser comprovados.

## Pré-diagnóstico

O formulário da home envia a solicitação para a Edge Function `proxiti-support`, que registra o chamado no Supabase e direciona o cliente à página de acompanhamento. O chat público continua disponível sem login. Não solicitar senhas, códigos de autenticação ou documentos sigilosos no pré-diagnóstico.

## Tecnologia

- HTML semântico;
- CSS responsivo sem framework;
- JavaScript sem dependências;
- carrossel acessível para cenários de atendimento;
- tema claro/escuro;
- ilustrações SVG originais;
- GitHub Pages;
- sitemap, canonical e metadados;
- foco visível e `prefers-reduced-motion`.

## Documentação

- `DESIGN-SYSTEM.md` — sistema visual e editorial.
- `MARKETING-RESEARCH.md` — pesquisa de referências e decisões comerciais.
- `PUBLICATION-CHECKLIST.md` — checklist de manutenção.

## Contato

- Telefone / WhatsApp: **+55 41 8823-5598**
- E-mail: **contato.proxiti@gmail.com**
- Área principal: **Curitiba/PR**

## Posicionamento comercial atual

A oferta pública está focada em gestão de TI B2B para micro e pequenas empresas. Páginas e links de produtos digitais voltados ao consumidor final foram retirados da navegação pública durante o pivot para MSP.
