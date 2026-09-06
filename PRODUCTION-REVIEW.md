# Relatório de revisão institucional — PROXITI

Revisão: 2026-09-05. Repositório: humbertomennella/proxiti.
Base: main em `347c225990e1665db6528aabfd89acf1572272d5`.
Branch: `fix/site-production-review`. Destino: main. Sem merge nem publicação.

Os 26 arquivos da base foram obtidos do GitHub e conferidos pelos respectivos hashes Git. As alterações foram feitas sobre esses arquivos; o site não foi recriado.

## 1. Arquivos alterados e adicionados

- index.html: contatos, conteúdo, diagnóstico, atendimento, termos, privacidade, SEO e foco das âncoras.
- assets/css/style.css: legibilidade, foco, quebra de conteúdo, processo em cinco etapas, menu e fallback sem JavaScript.
- assets/js/main.js: foco no menu e nas âncoras, retorno ao fechar/redimensionar e exposição segura do conteúdo animado.
- PLACEHOLDERS.md: decisões humanas reais e contatos confirmados.
- PUBLICATION-CHECKLIST.md: verificações realizadas e pendências explícitas.
- SECURITY-HEADERS.md: configuração proposta separada de implantação; cuidados com HSTS e cache.
- ASSETS-REQUIRED.md: inventário real de imagens preservadas.
- sitemap.xml: apenas lastmod atualizado para a data da revisão material.
- site.webmanifest: theme_color alinhado ao fundo escuro e meta theme-color.
- package.json e scripts/preview.mjs: servidor local sem dependências, sem mudar a publicação estática.
- scripts/check.py e scripts/check-runtime.mjs: verificações repetíveis de estrutura, contatos e falhas de armazenamento.
- PRODUCTION-REVIEW.md: este relatório.

Preservados sem alteração: robots.txt, CNAME, verificação Google, about.txt, todos os arquivos de imagem/ícone. Todos os SVGs do HTML também foram preservados integralmente.

## 2. Contatos

Número oficial: **(41) 99823-5598**; internacional **+55 41 99823-5598**.
Links: `tel:+5541998235598` e https://wa.me/5541998235598.
E-mail: **contato.proxiti@gmail.com**.

Corrigidos LocalBusiness.telephone, contactPoint.telephone, contato de privacidade, FAQ, seção de contato, rótulos aria-label, botão WhatsApp e rodapé. Há dois links de WhatsApp, dois de telefone e cinco mailto, todos conferidos. Mensagens iniciais e assuntos de e-mail foram preservados.

A correção dos destinos numéricos não comprova a identidade da conta no WhatsApp nem o recebimento de mensagens. Não foram enviadas mensagens ou efetuadas ligações.

## 3. Conteúdo institucional e diagnóstico

Mantidos o H1 e o princípio de verificar a causa antes de recomendar formatação ou troca. A apresentação inicial foi encurtada. O Diagnóstico Essencial de TI aparece na chamada principal e no processo: conversa inicial, diagnóstico, prioridades, plano de correção e execução aprovada.

O texto permite concluir que não há serviço adicional necessário, basta ajuste, troca não compensa, a demanda está fora do escopo ou outra prioridade deve vir antes. Nenhum preço, pacote, desconto ou gratuidade foi presumido.

Atendimento residencial cobre computadores, notebooks, programas, impressão, periféricos, Wi-Fi, manutenção, backup e prevenção. Para empresas, reforçados estações, rede local, switches/roteadores, Wi-Fi, acessos, documentação, compras e continuidade básica. Sem promessa de gestão integral, SLA ou monitoramento contínuo.

## 4. Placeholders removidos

Removidas **28 marcações** de apresentação provisória, inclusive informações já preenchidas que ainda usavam a classe placeholder. O HTML público não contém essa classe nem colchetes de preenchimento.

Retirados nome formal indefinido, tabela de retenção com sete campos, políticas ainda não formalizadas, horários fixos, retirada/devolução e planos futuros de segurança avançada. Também removida a referência a recuperação de dados como possível serviço, por não estar confirmada no escopo pedido.

## 5. Pendências humanas

Sem placeholders públicos. Continuam pendentes: identidade formal aplicável, responsável pelos dados, horários fixos se houver, agendamento, deslocamento, retirada/devolução se aplicável, backup, fornecimento de peças, validade de orçamento, pagamentos/cancelamento/garantias, prazos por caso, fornecedores e critérios de retenção. A lista completa e a situação pública de cada item estão em PLACEHOLDERS.md.

## 6. SEO e arquivos auxiliares

Title, description, canonical, Open Graph, Twitter Card, Schema.org, área Curitiba/PR, imagens, favicon e manifesto revisados. Adicionados identificador estável do negócio, dimensões/tipo da imagem OG e texto alternativo da imagem do Twitter.

Robots estava coerente e foi mantido byte a byte. Sitemap preserva URL, changefreq e priority; mudou apenas lastmod. CNAME e arquivo de verificação Google preservados. Não foram incluídos endereço de rua, preço, avaliação, horário ou CNPJ para preencher exigências de mecanismos de busca.

Schema.org sintaticamente legível não garante resultados enriquecidos. A avaliação externa continua pendente; não inventar endereço para obter elegibilidade. [Documentação do Google](https://developers.google.com/search/docs/appearance/structured-data/local-business).

## 7. Acessibilidade, mobile e JavaScript

Skip link leva o foco ao main. Âncoras de seções recebem foco, links legais abrem o documento correspondente e o menu fecha ao escolher um destino. O ciclo de Tab inclui os controles visíveis do cabeçalho; Escape devolve o foco ao botão, e o redimensionamento evita foco em botão oculto.

Removido overflow-x:hidden usado para mascarar transbordamento. E-mail e conteúdo longo podem quebrar linha; rodapé e painel preventivo se adaptam a telas estreitas. O menu considera altura dinâmica da viewport.

Foco ganhou contorno sólido. Texto secundário reutiliza cores de maior contraste já presentes na paleta. Fundos grafite, azul funcional, tipografia, monograma e navegações preservados.

Conteúdo fica visível por padrão. Animação é aplicada somente a blocos adequados abaixo da tela; blocos longos não dependem dela para serem lidos. Sem JavaScript, conteúdo e navegação móvel permanecem disponíveis; controles dependentes de script ficam ocultos. Preferência de movimento reduzido é respeitada pelo código/CSS.

## 8. Privacidade e termos

Foco em autorização, necessidade e finalidade. Removida a enumeração genérica de bases legais sem vínculo confirmado com a operação. Retenção sem prazo inventado. Mantidos e-mail/WhatsApp e direitos descritos com ressalvas de aplicabilidade.

Backup, peças, orçamento, prazos, deslocamento e garantias receberam redação neutra conforme o pedido. Sem consultoria jurídica nem promessa de conformidade total. O uso de IPs pelo GitHub Pages foi descrito conforme a [documentação oficial](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages). Direitos consultados na [ANPD](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares).

## 9. Testes realizados

| Verificação | Resultado |
| --- | --- |
| Estrutura HTML | Tags balanceadas, sem atributos repetidos; 1 H1, 38 IDs únicos, hierarquia conferida |
| Referências e canais | 55 referências conferidas; âncoras/arquivos existentes, contatos oficiais |
| JavaScript | node --check; tema alterna e persiste após recarga |
| Armazenamento indisponível | Testes de valor ausente, válido, inválido e acesso bloqueado passaram |
| Sem IntersectionObserver | Fallback executado no teste de runtime |
| CSS | 329 blocos avaliados pelo parser nativo; nenhum bloco inválido detectado |
| Compatibilidade CSS | Prefixo -webkit-backdrop-filter ignorado no Chromium, preservado como fallback; propriedade padrão presente |
| Contraste | Amostragem de texto nos dois temas sem falhas detectadas; sem certificação WCAG |
| Viewports 320/360/390/768/1024/1440 | Dois temas, sem overflow horizontal detectado, inclusive documentos legais abertos |
| Texto a 200% | Seis viewports, sem overflow horizontal detectado |
| Sem JavaScript | 320 e 1440 px; conteúdo/navegação acessíveis, nenhum bloco aguardando animação |
| Teclado | Enter, Tab/Shift+Tab, Escape, skip link e destino de navegação verificados |
| Documentos legais | Abertura pelo link e leitura em 320 px verificadas |
| Assets | Integridade/dimensões locais conferidas; 13 recursos com HTTP 200 no servidor local |
| Console | Nenhum erro do site observado; erros da extensão do ambiente excluídos |
| Revisão visual | Inspeção de desktop escuro, mobile claro e termos; sem regressão detectada nesses cenários |
| Diff | git diff --check sem erros; SVGs e imagens comparados com a base |

## 10. Limitações e riscos restantes

- Não foram executados validadores completos W3C/Nu nem Rich Results externo. Os resultados HTML/CSS acima têm o escopo indicado.
- Texto ampliado não é igual a zoom nativo. O zoom nativo a 200% não pôde ser comprovado neste ambiente.
- Não houve testes físicos em Android/iOS, nem matriz Firefox/Safari/Edge ou leitor de tela.
- A inspeção visual e os testes não garantem ausência universal de regressões.
- Recebimento de contatos, configuração Pages/DNS/TLS e cabeçalhos públicos dependem da verificação final do responsável e do ambiente publicado.
- As condições comerciais e a identificação formal continuam humanas. Nenhum merge automático ou deploy foi realizado.

O código está preparado para revisão por Pull Request. A publicação definitiva depende da conclusão das verificações e decisões aplicáveis no checklist.
