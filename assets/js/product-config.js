(() => {
  "use strict";

  // Os PDFs mestres e as senhas NUNCA devem ser publicados no GitHub Pages.
  // Checkout indicado pelo titular da PROXITI e aprovado para vinculação ao site.
  // A confirmação de entrega dos cinco PDFs e de preservação dos formulários
  // deve ser feita dentro da Kiwify; esta configuração não a verifica.
  // Não incluir chaves de API, CPF ou dados do comprador neste arquivo público.
  window.PROXITI_PRODUCT_CONFIG = Object.freeze({
    "pc-seguro": Object.freeze({
      provider: "kiwify",
      checkoutUrl: "https://pay.kiwify.com.br/vHyqcmj",
      readyForSales: true,
      fallbackUrl: "https://proxiti.com.br/#contato"
    })
  });
})();
