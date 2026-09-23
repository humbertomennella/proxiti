(() => {
  "use strict";

  // Quando houver checkout automático, informe apenas a URL HTTPS abaixo.
  // Enquanto estiver vazio, o site usa a compra assistida pelo WhatsApp.
  // O PDF pago permanece fora do GitHub Pages.
  window.PROXITI_PRODUCT_CONFIG = Object.freeze({
    "pc-seguro": Object.freeze({
      checkoutUrl: "",
      fallbackUrl: "https://wa.me/554188235598?text=Ol%C3%A1%2C%20PROXITI.%20Quero%20comprar%20o%20PC%20Seguro%20por%20R%24%2029%2C90."
    })
  });
})();
