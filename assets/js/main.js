(() => {
  "use strict";

  const root = document.documentElement;
  const header = document.querySelector(".site-header");
  const themeButton = document.querySelector(".theme-toggle");
  const menuButton = document.querySelector(".menu-button");
  const mobilePanel = document.querySelector(".mobile-panel");
  const mainContent = document.querySelector("main");
  const footer = document.querySelector("footer");
  const year = document.querySelector("#year");

  root.classList.remove("no-js");

  const readTheme = () => {
    try {
      const saved = localStorage.getItem("proxiti-theme");
      return saved === "light" || saved === "dark" ? saved : "dark";
    } catch {
      return "dark";
    }
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#07111f" : "#f4f7fb");
    }
    if (themeButton) {
      themeButton.setAttribute(
        "aria-label",
        theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
      );
    }
  };

  applyTheme(readTheme());

  themeButton?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem("proxiti-theme", next);
    } catch {
      // O tema continua funcionando sem armazenamento local.
    }
  });

  const setPageInert = (value) => {
    if (mainContent) mainContent.inert = value;
    if (footer) footer.inert = value;
  };

  const closeMenu = ({ returnFocus = false } = {}) => {
    if (!mobilePanel || !menuButton) return;
    const wasOpen = menuButton.getAttribute("aria-expanded") === "true";
    mobilePanel.hidden = true;
    mobilePanel.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("menu-open");
    setPageInert(false);
    if (returnFocus && wasOpen) menuButton.focus();
  };

  const openMenu = () => {
    if (!mobilePanel || !menuButton) return;
    mobilePanel.hidden = false;
    mobilePanel.classList.add("open");
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Fechar menu");
    document.body.classList.add("menu-open");
    setPageInert(true);
    mobilePanel.querySelector("a[href]")?.focus();
  };

  menuButton?.addEventListener("click", () => {
    menuButton.getAttribute("aria-expanded") === "true"
      ? closeMenu({ returnFocus: true })
      : openMenu();
  });

  document.querySelectorAll(".mobile-nav a").forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  document.addEventListener("keydown", (event) => {
    const open = menuButton?.getAttribute("aria-expanded") === "true";
    if (event.key === "Escape" && open) {
      event.preventDefault();
      closeMenu({ returnFocus: true });
      return;
    }
    if (event.key !== "Tab" || !open || !mobilePanel) return;
    const focusable = [...mobilePanel.querySelectorAll("a[href],button:not([disabled])")];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1080) closeMenu();
  });

  const updateHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 12);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -7% 0px", threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

    const localNavLinks = [...document.querySelectorAll(".desktop-nav a")].filter((link) =>
      (link.getAttribute("href") || "").startsWith("#")
    );
    const localSections = document.querySelectorAll("main section[id]");
    if (localNavLinks.length) {
      const navObserver = new IntersectionObserver(
        (entries) => {
          const current = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (!current) return;
          localNavLinks.forEach((link) => {
            const active = link.getAttribute("href") === `#${current.target.id}`;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        },
        { rootMargin: "-22% 0px -62% 0px", threshold: [0.01, 0.2, 0.5] }
      );
      localSections.forEach((section) => navObserver.observe(section));
    }
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
  }

  document.querySelectorAll(".faq-item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      document.querySelectorAll(".faq-item[open]").forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  document.querySelectorAll("[data-checkout]").forEach((link) => {
    const key = link.dataset.checkout;
    const product = window.PROXITI_PRODUCT_CONFIG?.[key] || {};
    const checkoutUrl = product.checkoutUrl?.trim() || "";
    const fallbackUrl = product.fallbackUrl?.trim() || "";
    const target = /^https:\/\//i.test(checkoutUrl)
      ? checkoutUrl
      : (/^https:\/\//i.test(fallbackUrl) ? fallbackUrl : "");

    if (target) {
      link.href = target;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.removeAttribute("aria-disabled");
      link.textContent = /^https:\/\//i.test(checkoutUrl)
        ? (link.dataset.readyLabel || "Comprar agora")
        : (link.dataset.fallbackLabel || "Comprar pelo WhatsApp");
    } else {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
      link.textContent = link.dataset.unavailableLabel || "Venda temporariamente indisponível";
    }
  });

  const triageForm = document.querySelector("#pre-diagnostico-form");
  const triageStatus = document.querySelector("#triage-status");

  triageForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!triageForm.reportValidity()) return;

    const data = new FormData(triageForm);
    const lines = [
      "Olá, PROXITI. Quero solicitar uma orientação inicial.",
      "",
      `Perfil: ${data.get("perfil")}`,
      `Área: ${data.get("area")}`,
      `Equipamento/ambiente: ${data.get("equipamento") || "Não informado"}`,
      `Impacto: ${data.get("impacto")}`,
      "",
      "Sintoma:",
      String(data.get("sintoma") || "").trim()
    ];

    const url = `https://wa.me/554188235598?text=${encodeURIComponent(lines.join("\n"))}`;
    if (triageStatus) {
      triageStatus.textContent = "Mensagem preparada. Abrindo o WhatsApp...";
    }
    window.open(url, "_blank", "noopener,noreferrer");
  });

  if (year) year.textContent = new Date().getFullYear();
})();