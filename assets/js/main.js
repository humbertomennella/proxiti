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

    let pointerDragging = false;
    let pointerId = null;
    let pointerStartX = 0;
    let pointerCurrentX = 0;

    let touchTracking = false;
    let touchAxis = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchCurrentX = 0;
    let touchCurrentY = 0;

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

    const liveTranslate = (deltaX) => {
      const width = viewport.clientWidth || 1;
      const base = -index * width;
      track.style.transform = `translateX(${base + deltaX}px)`;
    };

    const swipeThreshold = () => {
      const width = viewport.clientWidth || 1;
      return Math.min(84, Math.max(42, width * 0.10));
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

    // Touch dedicado: mais confiável em navegadores móveis do que depender só de PointerEvent.
    viewport.addEventListener("touchstart", (event) => {
      if (event.touches.length !== 1) return;
      if (event.target.closest("button, a")) return;

      const touch = event.touches[0];
      touchTracking = true;
      touchAxis = null;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchCurrentX = touch.clientX;
      touchCurrentY = touch.clientY;

      stop();
      viewport.classList.add("is-dragging");
      track.style.transition = "none";
    }, { passive: true });

    viewport.addEventListener("touchmove", (event) => {
      if (!touchTracking || event.touches.length !== 1) return;

      const touch = event.touches[0];
      touchCurrentX = touch.clientX;
      touchCurrentY = touch.clientY;

      const deltaX = touchCurrentX - touchStartX;
      const deltaY = touchCurrentY - touchStartY;

      if (!touchAxis && (Math.abs(deltaX) > 7 || Math.abs(deltaY) > 7)) {
        touchAxis = Math.abs(deltaX) > Math.abs(deltaY) * 1.08 ? "x" : "y";
      }

      if (touchAxis === "x") {
        event.preventDefault();
        liveTranslate(deltaX);
      }
    }, { passive: false });

    const finishTouch = () => {
      if (!touchTracking) return;

      const deltaX = touchCurrentX - touchStartX;
      const horizontal = touchAxis === "x";

      touchTracking = false;
      touchAxis = null;
      viewport.classList.remove("is-dragging");

      if (horizontal && Math.abs(deltaX) >= swipeThreshold()) {
        go(index + (deltaX < 0 ? 1 : -1));
      } else {
        render(false);
      }

      start();
    };

    viewport.addEventListener("touchend", finishTouch, { passive: true });
    viewport.addEventListener("touchcancel", finishTouch, { passive: true });

    // Mouse e caneta continuam com Pointer Events; toque fica exclusivamente nos Touch Events.
    const finishPointerDrag = () => {
      if (!pointerDragging) return;

      const deltaX = pointerCurrentX - pointerStartX;
      pointerDragging = false;
      viewport.classList.remove("is-dragging");

      if (pointerId !== null && viewport.hasPointerCapture?.(pointerId)) {
        viewport.releasePointerCapture(pointerId);
      }
      pointerId = null;

      if (Math.abs(deltaX) >= swipeThreshold()) {
        go(index + (deltaX < 0 ? 1 : -1));
      } else {
        render(false);
      }

      start();
    };

    viewport.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch") return;
      if (event.target.closest("button, a")) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;

      pointerDragging = true;
      pointerId = event.pointerId;
      pointerStartX = event.clientX;
      pointerCurrentX = event.clientX;

      stop();
      viewport.classList.add("is-dragging");
      viewport.setPointerCapture?.(pointerId);
      track.style.transition = "none";
    });

    viewport.addEventListener("pointermove", (event) => {
      if (!pointerDragging || event.pointerId !== pointerId) return;
      pointerCurrentX = event.clientX;
      liveTranslate(pointerCurrentX - pointerStartX);
    });

    viewport.addEventListener("pointerup", (event) => {
      if (event.pointerId !== pointerId) return;
      finishPointerDrag();
    });

    viewport.addEventListener("pointercancel", (event) => {
      if (event.pointerId !== pointerId) return;
      finishPointerDrag();
    });

    viewport.addEventListener("dragstart", (event) => event.preventDefault());

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", start);

    window.addEventListener("resize", () => {
      if (!pointerDragging && !touchTracking) render(false);
    });

    render();
    start();
  });

  document.querySelectorAll("[data-checkout]").forEach((link) => {
    const key = link.dataset.checkout;
    const product = window.PROXITI_PRODUCT_CONFIG?.[key] || {};
    const checkoutUrl = product.checkoutUrl?.trim() || "";
    const fallbackUrl = product.fallbackUrl?.trim() || "";
    // URL só é ativa depois de validar o fluxo completo (pagamento + entrega).
    // Não basta colar um link HTTPS: um domínio errado pode receber pagamentos.
    let approvedCheckout = false;
    if (product.readyForSales === true && product.provider === "kiwify") {
      try {
        const url = new URL(checkoutUrl);
        approvedCheckout = url.protocol === "https:" &&
          url.hostname === "pay.kiwify.com.br" &&
          /^\/[A-Za-z0-9_-]+\/?$/.test(url.pathname) &&
          !url.username && !url.password && !url.port;
      } catch (_) {
        approvedCheckout = false;
      }
    }
    const target = approvedCheckout ? checkoutUrl
      : (/^https:\/\//i.test(fallbackUrl) ? fallbackUrl : "");

    if (target) {
      link.href = target;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.removeAttribute("aria-disabled");
      link.textContent = approvedCheckout
        ? (link.dataset.readyLabel || "Comprar agora")
        : (link.dataset.fallbackLabel || "Comprar pelo WhatsApp");
    } else {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled","true");
      link.textContent = link.dataset.unavailableLabel || "Venda temporariamente indisponível";
    }
  });

  // A solicitação de atendimento é registrada por site-requests.js.

  if (year) year.textContent = new Date().getFullYear();
})();