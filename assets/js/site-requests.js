(() => {
  const form = document.getElementById("pre-diagnostico-form");
  if (!form) return;
  const status = document.getElementById("triage-status");
  const whatsapp = "554188235598";
  const setStatus = (message) => { if (status) status.textContent = message; };
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (String(data.get("company_website") || "").trim()) return;
    const lines = [
      "Olá, quero solicitar uma avaliação inicial de TI para minha empresa.",
      "",
      `Nome: ${data.get("nome")}`,
      `Cargo: ${data.get("cargo")}`,
      `Empresa: ${data.get("empresa")}`,
      `Estações: ${data.get("equipamento")}`,
      `Principal dor: ${data.get("area")}`,
      `Impacto: ${data.get("impacto")}`,
      "",
      "Não incluí senhas ou dados sigilosos."
    ];
    setStatus("Abrindo o WhatsApp com o resumo para sua revisão…");
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener");
  });
})();
