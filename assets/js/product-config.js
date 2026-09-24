(() => {
  "use strict";

  // Os PDFs mestres e as senhas NUNCA devem ser publicados no GitHub Pages.
  // Antes de ativar: vincular o checkout verdadeiro ao produto PC Seguro,
  // confirmar preço/itens, testar pagamento e acesso aos CINCO PDFs,
  // e confirmar que as 300 anotações AcroForm continuam utilizáveis.
  // Não incluir chaves de API, CPF ou dados do comprador neste arquivo público.
  window.PROXITI_PRODUCT_CONFIG = Object.freeze({
    "pc-seguro": Object.freeze({
      provider: "kiwify",
      checkoutUrl: "",
      readyForSales: false,
      fallbackUrl: "https://wa.me/554188235598?text=Ol%C3%A1%2C%20PROXITI.%20Quero%20comprar%20o%20PC%20Seguro%20por%20R%24%2029%2C90."
    })
  });
})();
