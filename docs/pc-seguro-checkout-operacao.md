# PC Seguro 2.2 Premium — operação publicada e validação da entrega

**Revisão:** 29/09/2026. Este documento descreve o estado do código publicado, não certifica uma compra ou a operação interna da Kiwify.

## Estado verificado no site

**Checkout do site: habilitado.** Em `assets/js/product-config.js`, o produto `pc-seguro` usa `provider: "kiwify"`, `readyForSales: true` e a URL HTTPS `https://pay.kiwify.com.br/vHyqcmj`. A home, o catálogo e a página de produto encaminham a essa URL. O JavaScript valida o domínio `pay.kiwify.com.br` antes de habilitar o link.

**Entrega Kiwify: não homologada nesta auditoria.** A presença de um link e os workflows de publicação do GitHub não permitem verificar o estado do produto na conta do vendedor, valores finais do checkout, pedido aprovado, acesso do comprador, anexos efetivamente disponibilizados, proteção ativa, estorno ou recebimento. Não existe conector Kiwify associado a esta auditoria; a página pública de pagamento tampouco permite consultar a área restrita do produtor. Não foi realizada compra.

**Produto divulgado:** preço de R$ 29,90 por um kit de cinco PDFs: guia principal de 29 páginas e quatro ferramentas complementares. A composição e a integridade da **entrega efetiva** devem ser verificadas na área de membros com autorização. PDFs mestres, senhas de proprietário, relatórios internos e dados de compradores não devem ser hospedados no GitHub Pages.

O registro anterior desta documentação descrevia um checkout ainda inativo e recomendava manter `readyForSales: false`. Essa orientação ficou **histórica**, pois o código de produção já está habilitado. Corrigir este documento não altera o checkout e não equivale a liberar ou suspender a operação comercial.

## Validação exigida antes de declarar a entrega concluída

1. **Conta do vendedor:** o titular verifica no painel privado que produto, preço, checkout, e-mail de suporte, meios de pagamento, eventuais taxas e política de reembolso correspondem à oferta publicada.
2. **Pedido autorizado:** em ambiente ou procedimento de teste indicado pela própria Kiwify, confirmar o estado real do pagamento antes de conceder acesso. Não criar cobrança real sem autorização do titular.
3. **Entrega do comprador:** entrar como comprador de teste autorizado, conferir que existem exatamente cinco arquivos corretos, sem PDF mestre, relatório de auditoria, senha privada ou dados de outro comprador.
4. **Material:** conferir o guia de 29 páginas, as quatro ferramentas, conteúdo pesquisável, links, ordem, qualidade de impressão e funcionamento de todos os campos preenchíveis. Preencher uma cópia, salvar, fechar e reabrir em leitores compatíveis. Se houver personalização, comparar o conteúdo e a funcionalidade em vez de exigir hashes idênticos ao mestre.
5. **Privacidade e proteção:** verificar se eventual DRM acrescenta dados pessoais, altera a dimensão A4, impede preenchimento/salvamento ou torna os anexos inacessíveis. Validar acesso após cancelamento, estorno e recuperação de conta, de acordo com os recursos reais da plataforma.
6. **Resultado:** arquivar apenas evidências sanitizadas do teste, data, versão do kit, falhas encontradas e decisão de liberação do titular.

**Base histórica, ainda não confirmada na entrega da Kiwify:** o relatório técnico da cópia protegida de teste registrava cinco PDFs, 38 páginas A4 e 300 campos AcroForm. Esses números devem ser comparados com a versão comercial vigente e **não** substituem a conferência do material disponibilizado ao comprador.

## DRM e distribuição

A [documentação oficial da Kiwify](https://ajuda.kiwify.com.br/pt-br/article/protecao-antipirataria-para-e-books-drm-social-13pqdu0/) informa que o DRM Social pode exibir nome, e-mail e CPF do comprador e descreve marca d'água em PDFs de tamanho padrão 280 × 396 mm. Não habilitar essa opção indiscriminadamente em materiais A4 preenchíveis nem incluir CPF em documentos sem análise de necessidade, transparência e compatibilidade. Bloqueios de cópia/impressão não são uma garantia contra redistribuição.

O gerador privado `PROXITI_Gerador_Kit_Individual.py` cria uma cópia identificada, mas **não** verifica compra, registra baixa financeira, realiza entrega automática ou trata estorno. A integração privada por webhook autenticado, proteção contra duplicidade, armazenamento privado e links temporários **não foi comprovada como implantada**.

## Limites operacionais e procedimento de retorno

A configuração pública do checkout não deve receber credenciais, CPF de comprador, dados de venda ou chaves da Kiwify. Uma eventual suspensão do botão de compra é uma **decisão comercial com impacto em clientes e vendas**: exigir autorização do titular, análise de pedidos pendentes e plano de comunicação antes de mudar `readyForSales`.

Em incidente de entrega, preservar o registro do pedido sem publicar dados pessoais; conferir a liberação na plataforma e orientar o comprador pelo canal de suporte. Caso seja necessária uma mudança no site, prepará-la em branch, testar os links e publicar pelo workflow existente. Não alegar automação ou proteção que não tenha sido verificada.
