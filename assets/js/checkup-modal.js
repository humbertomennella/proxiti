(() => {
  "use strict";
  const dialog = document.querySelector("#checkup-modal");
  const content = document.querySelector("#checkup-modal-content");
  const triage = document.querySelector("#pre-diagnostico .triage-wrap");
  const section = document.querySelector("#pre-diagnostico .container");
  if (!dialog || !content || !triage || !section || typeof dialog.showModal !== "function") return;

  const originalNextSibling = triage.nextSibling;
  const openers = document.querySelectorAll("[data-open-checkup]");
  const closeButtons = dialog.querySelectorAll("[data-close-checkup]");
  let returnFocus = null;

  function open(event) {
    event?.preventDefault();
    returnFocus = event?.currentTarget || document.activeElement;
    content.appendChild(triage);
    if (!dialog.open) dialog.showModal();
    dialog.querySelector(".checkup-modal-close")?.focus();
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  openers.forEach((opener) => opener.addEventListener("click", open));
  closeButtons.forEach((button) => button.addEventListener("click", close));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });
  dialog.addEventListener("close", () => {
    if (originalNextSibling?.parentNode === section) section.insertBefore(triage, originalNextSibling);
    else section.appendChild(triage);
    returnFocus?.focus?.();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog.open) close();
  });
})();
