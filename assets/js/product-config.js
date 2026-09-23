(() => {
  "use strict";

  // Insira aqui a URL HTTPS do checkout quando a plataforma de vendas estiver pronta.
  // Nenhum PDF pago deve ser hospedado no GitHub Pages.
  window.PROXITI_PRODUCT_CONFIG = Object.freeze({
    "pc-seguro": Object.freeze({
      checkoutUrl: ""
    })
  });
})();
