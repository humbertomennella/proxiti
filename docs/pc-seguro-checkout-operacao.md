# PC Seguro 2.2 Premium — ativação comercial segura

**Estado:** pré-configurado. Checkout NÃO ativo enquanto não houver conta de vendedor autorizada, URL real de pagamento e teste comprovado da entrega protegida.

**Produto único:** R$ 29,90, guia de 29 páginas e quatro ferramentas PDF (2/2/3/2 páginas). Entregar exatamente cinco PDFs, sem relatório técnico. Há 300 campos AcroForm no total; os arquivos e senhas-mestre devem permanecer em armazenamento privado, nunca no GitHub Pages.

## Provedor considerado

Kiwify para checkout hospedado (Pix/cartão), confirmação de pagamento e área de membros. A conta de produtor e os dados financeiros devem ser autorizados pelo titular dentro da plataforma. Não solicitar ou armazenar CPF, senha bancária, token de API ou chaves de pagamento no repositório, site estático, issues ou chat.

A plataforma documenta área de membros com anexos, pagamento por Pix e DRM Social PDF:
- https://ajuda.kiwify.com.br/pt-br/article/como-entregar-um-e-book-12swd66/
- https://ajuda.kiwify.com.br/pt-br/article/protecao-antipirataria-para-e-books-drm-social-13pqdu0/

**ATENÇÃO:** o DRM Social nativo coloca nome, e-mail e CPF do comprador nas páginas; a documentação menciona formato PDF de 280 × 396 mm, diferente do A4 usado no kit. A compatibilidade com os 300 campos interativos não foi demonstrada. NÃO ativar indiscriminadamente, nem divulgar CPF em marca d'água sem revisar a necessidade, as informações prestadas ao cliente e as condições da plataforma. Os bloqueios de cópia/impressão são contornáveis em alguns leitores.

## Critério de liberação

1. Criar um único produto com preço R$ 29,90, sem cobrança separada pelas quatro ferramentas.
2. Manter o produto não divulgado até concluir teste com uma conta compradora de teste autorizada. Usar arquivos de teste e evitar enviar segredos.
3. Confirmar no checkout o preço, Pix/cartão, nome do produto, dados de suporte e condições aplicáveis.
4. Testar pagamento e acesso apenas após confirmação da plataforma, nunca por print de comprovante.
5. Baixar o material como comprador; conferir cinco PDFs, 38 páginas A4 no total, campos 38+199+32+14+17, texto pesquisável, links/bookmarks do guia e preenchimento seguido de salvar/reabrir.
6. Testar as condições reais do DRM e o impacto sobre a privacidade e usabilidade. Se alterar/desabilitar formulários, **não publicar** a venda: usar entrega privada externa com geração individual do kit por pedido, por webhook autenticado e serviço seguro.
7. Verificar se não há PDF mestre, senha privada, relatório de validação ou dados pessoais dentro do pacote do cliente ou hospedagem pública.
8. Após teste aprovado, colocar somente a URL HTTPS real do checkout em `assets/js/product-config.js` e mudar `readyForSales` para `true`. O código do site restringe o domínio permitido a `pay.kiwify.com.br`; qualquer outra URL continua usando o WhatsApp.
9. Confirmar novamente os botões da home, do catálogo e da landing no desktop e celular. Confirmar venda e entrega de ponta a ponta antes de anunciar automação.

## Distribuição e licenças

A marca individual por código de pedido (sem CPF no documento) foi testada no gerador privado `PROXITI_Gerador_Kit_Individual.py`. Esse programa **não** confirma pagamentos nem entrega arquivos: para utilizá-lo automaticamente é necessário um serviço privado com webhook autenticado, prevenção de pedidos duplicados, armazenamento privado, expiração de links e controle de reembolso. Esse serviço **não está implantado**.

Até o checkout seguro estar ativo, o site conserva o WhatsApp como canal de compra assistida. Nunca deixar pagamento ativo sem conseguir fazer a entrega prometida.

## Referência de configuração

`assets/js/product-config.js`: manter `checkoutUrl: ""` e `readyForSales: false` até liberar a operação. Chaves/tokens devem ficar exclusivamente no gerenciador de segredos da infraestrutura de processamento.
