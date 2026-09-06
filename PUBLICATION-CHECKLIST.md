# Checklist de publicação — revisão de 2026-09-05

Base oficial: `main`, commit `347c225990e1665db6528aabfd89acf1572272d5`.
A branch de revisão não substitui a publicação. Não fazer merge enquanto as pendências aplicáveis não forem resolvidas.

## Concluído no código e ambiente local

- [x] Telefone, WhatsApp e e-mail padronizados em conteúdo, links, rótulos e JSON-LD.
- [x] Removidas as 28 marcações de conteúdo provisório; nenhum placeholder no HTML público.
- [x] Diagnóstico Essencial de TI com conversa, diagnóstico, prioridades, plano e execução aprovada.
- [x] Separação residencial/empresarial e limites de atuação preservados.
- [x] Horários, retirada/devolução, deslocamento e condições indefinidas sem promessas fixas.
- [x] Privacidade e termos com redação operacional; decisões pendentes em PLACEHOLDERS.md.
- [x] Estrutura HTML: tags balanceadas, atributos/IDs únicos, um H1 e hierarquia de títulos.
- [x] 55 referências/links conferidos; âncoras e arquivos locais existentes.
- [x] JSON-LD, manifesto e sitemap analisados; contatos e domínio coerentes.
- [x] CSS analisado no Chromium; foco e texto secundário com contraste reforçado dentro da paleta existente.
- [x] JavaScript com sintaxe validada; tema persistido e armazenamento indisponível testados.
- [x] Menu móvel, Enter, Tab, Shift+Tab, Escape e skip link testados no Chromium.
- [x] Temas claro/escuro em viewports de 320, 360, 390, 768, 1024 e 1440 px, sem overflow horizontal detectado.
- [x] Texto ampliado a 200% nas seis larguras, sem overflow horizontal detectado.
- [x] Fallback sem JavaScript em 320 e 1440 px, com conteúdo e navegação disponíveis.
- [x] Imagem OG e ícones preservados, dimensões e integridade conferidas.
- [x] HTTP 200 local para página, CSS, JS, imagem OG, ícones, robots, sitemap e manifesto.
- [x] CNAME, robots, verificação Google, imagens e SVGs preservados.
- [x] Sem erros do JavaScript do site observados no console.

## Pendências de revisão/publicação

- [ ] Confirmar identidade formal aplicável e responsável pelo tratamento dos dados.
- [ ] Validar práticas reais de atendimento, fornecedores e retenção; resolver decisões de PLACEHOLDERS.md.
- [ ] Confirmar recebimento real de ligação, WhatsApp e e-mail pelo responsável.
- [ ] Revisar termos e privacidade contra a operação real, com orientação profissional quando necessária.
- [ ] Executar validadores completos W3C/Nu e validação externa de Schema.org/Rich Results.
- [ ] Conferir zoom nativo do navegador a 200%; o teste realizado ampliou o texto, sem comprovar o zoom nativo.
- [ ] Executar testes em Firefox, Safari, Edge e aparelhos Android/iOS reais.
- [ ] Fazer revisão com leitor de tela; os testes feitos não constituem certificação WCAG.
- [ ] Revisar/aprovar o Pull Request antes de integrar à main.
- [ ] Confirmar configuração do Pages, HTTPS, domínio, cabeçalhos, cache e compressão na hospedagem.
- [ ] Após publicar, conferir recursos públicos e contato; os HTTP 200 registrados são locais.
- [ ] Validar dados estruturados e sitemap no Search Console após publicar.

## Como repetir os testes

Sem dependências de aplicação ou build:

```bash
python3 scripts/check.py
node scripts/check-runtime.mjs
npm run dev
```

Requer Python 3 para as verificações estáticas e Node.js 22+ para a revisão local. O Pages continua servindo o HTML e a pasta assets. A matriz de testes e seus limites estão em PRODUCTION-REVIEW.md.
