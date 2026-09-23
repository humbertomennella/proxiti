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
      const saved = localStorage.getItem("proxiti-theme-v3");
      return saved === "light" || saved === "dark" ? saved : "light";
    } catch {
      return "light";
    }
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0b1220" : "#f6f7f9");
    if (themeButton) {
      themeButton.setAttribute("aria-label", theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro");
    }
  };

  applyTheme(readTheme());

  themeButton?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("proxiti-theme-v3", next); } catch {}
  });

  const setInert = (value) => {
    if (mainContent) mainContent.inert = value;
    if (footer) footer.inert = value;
  };

  const closeMenu = ({ returnFocus = false } = {}) => {
    if (!mobilePanel || !menuButton) return;
    const wasOpen = menuButton.getAttribute("aria-expanded") === "true";
    mobilePanel.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("menu-open");
    setInert(false);
    if (returnFocus && wasOpen) menuButton.focus();
  };

  const openMenu = () => {
    if (!mobilePanel || !menuButton) return;
    mobilePanel.hidden = false;
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Fechar menu");
    document.body.classList.add("menu-open");
    setInert(true);
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
    const isOpen = menuButton?.getAttribute("aria-expanded") === "true";
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closeMenu({ returnFocus: true });
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1080) closeMenu();
  });

  const updateHeader = () => header?.classList.toggle("scrolled", window.scrollY > 12);
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

    const localNavLinks = [...document.querySelectorAll(".desktop-nav a")].filter((a) =>
      (a.getAttribute("href") || "").startsWith("#")
    );
    if (localNavLinks.length) {
      const navObserver = new IntersectionObserver(
        (entries) => {
          const current = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
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
      document.querySelectorAll("main section[id]").forEach((section) => navObserver.observe(section));
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

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const viewport = carousel.querySelector(".carousel-viewport");
    const track = carousel.querySelector(".carousel-track");
    const slides = [...carousel.querySelectorAll(".carousel-slide")];
    const prev = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    const dots = [...carousel.querySelectorAll("[data-carousel-dot]")];
    if (!viewport || !track || slides.length < 2) return;

    let index = 0;
    let timer = null;
    let dragging = false;
    let pointerId = null;
    let startX = 0;
    let currentX = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const restoreTransition = () => {
      track.style.removeProperty("transition");
    };

    const render = (announce = false) => {
      restoreTransition();
      track.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((slide, i) => {
        slide.setAttribute("aria-hidden", i === index ? "false" : "true");
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
        dot.setAttribute("aria-current", i === index ? "true" : "false");
      });
      if (announce) {
        const label = carousel.querySelector(".carousel-status");
        if (label) label.textContent = `Cenário ${index + 1} de ${slides.length}`;
      }
    };

    const go = (newIndex, announce = true) => {
      index = (newIndex + slides.length) % slides.length;
      render(announce);
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    const start = () => {
      stop();
      if (reduced) return;
      timer = window.setInterval(() => go(index + 1, false), 7000);
    };

    prev?.addEventListener("click", () => {
      go(index - 1);
      start();
    });

    next?.addEventListener("click", () => {
      go(index + 1);
      start();
    });

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        go(i);
        start();
      });
    });

    const finishDrag = () => {
      if (!dragging) return;

      const deltaX = currentX - startX;
      const width = viewport.clientWidth || 1;
      const threshold = Math.min(90, Math.max(48, width * 0.12));

      dragging = false;
      viewport.classList.remove("is-dragging");

      if (pointerId !== null && viewport.hasPointerCapture?.(pointerId)) {
        viewport.releasePointerCapture(pointerId);
      }
      pointerId = null;

      if (Math.abs(deltaX) >= threshold) {
        go(index + (deltaX < 0 ? 1 : -1));
      } else {
        render(false);
      }

      start();
    };

    viewport.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button, a")) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;

      dragging = true;
      pointerId = event.pointerId;
      startX = event.clientX;
      currentX = event.clientX;
      stop();

      viewport.classList.add("is-dragging");
      viewport.setPointerCapture?.(pointerId);
      track.style.transition = "none";
    });

    viewport.addEventListener("pointermove", (event) => {
      if (!dragging || event.pointerId !== pointerId) return;

      currentX = event.clientX;
      const deltaX = currentX - startX;
      const width = viewport.clientWidth || 1;
      const base = -index * width;

      track.style.transform = `translateX(${base + deltaX}px)`;
    });

    viewport.addEventListener("pointerup", (event) => {
      if (event.pointerId !== pointerId) return;
      finishDrag();
    });

    viewport.addEventListener("pointercancel", (event) => {
      if (event.pointerId !== pointerId) return;
      finishDrag();
    });

    viewport.addEventListener("dragstart", (event) => event.preventDefault());

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", start);

    window.addEventListener("resize", () => {
      if (!dragging) render(false);
    });

    render();
    start();
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
      link.setAttribute("aria-disabled","true");
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
      "Olá, PROXITI. Quero solicitar uma avaliação inicial.",
      "",
      `Perfil: ${data.get("perfil")}`,
      `Área: ${data.get("area")}`,
      `Equipamento/ambiente: ${data.get("equipamento") || "Não informado"}`,
      `Impacto: ${data.get("impacto")}`,
      "",
      "Contexto:",
      String(data.get("sintoma") || "").trim()
    ];
    const url = `https://wa.me/554188235598?text=${encodeURIComponent(lines.join("\n"))}`;
    if (triageStatus) triageStatus.textContent = "Mensagem preparada. Abrindo o WhatsApp...";
    window.open(url, "_blank", "noopener,noreferrer");
  });

  if (year) year.textContent = new Date().getFullYear();
})();