(() => {
  "use strict";
  const root = document.documentElement;
  const header = document.querySelector(".site-header");
  const themeButton = document.querySelector(".theme-toggle");
  const menuButton = document.querySelector(".menu-button");
  const mobilePanel = document.querySelector(".mobile-panel");
  const mobileLinks = document.querySelectorAll(".mobile-nav a");
  const navLinks = document.querySelectorAll(".desktop-nav a");
  const sections = document.querySelectorAll("main section[id]");
  const year = document.querySelector("#year");
  const mainContent = document.querySelector("main");
  const footer = document.querySelector("footer");
  root.classList.remove("no-js");

  const readStoredTheme = () => {
    try {
      return window.localStorage.getItem("proxiti-theme");
    } catch {
      return null;
    }
  };

  const storeTheme = (theme) => {
    try {
      window.localStorage.setItem("proxiti-theme", theme);
    } catch {
      // O tema continua funcionando na sessão mesmo sem armazenamento local.
    }
  };

  const getPreferredTheme = () => {
    const savedTheme = readStoredTheme();
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    return "dark";
  };
  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    if (themeButton) {
      themeButton.setAttribute(
        "aria-label",
        theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
      );
    }
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute("content", theme === "dark" ? "#0d1117" : "#f6f8fa");
    }
  };
  applyTheme(getPreferredTheme());

  themeButton?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    storeTheme(nextTheme);
  });

  const setBackgroundInert = (isInert) => {
    [mainContent, footer].forEach((region) => {
      if (region) {
        region.inert = isInert;
      }
    });
  };

  const closeMenu = ({ returnFocus = false } = {}) => {
    if (!mobilePanel || !menuButton) {
      return;
    }
    const wasOpen = menuButton.getAttribute("aria-expanded") === "true";
    mobilePanel.classList.remove("open");
    mobilePanel.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("menu-open");
    setBackgroundInert(false);
    if (returnFocus && wasOpen) {
      menuButton.focus();
    }
  };

  const openMenu = () => {
    if (!mobilePanel || !menuButton) {
      return;
    }
    mobilePanel.hidden = false;
    mobilePanel.classList.add("open");
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Fechar menu");
    document.body.classList.add("menu-open");
    setBackgroundInert(true);
    mobilePanel.querySelector("a[href]")?.focus();
  };

  menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu({ returnFocus: true }) : openMenu();
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  document.addEventListener("keydown", (event) => {
    const menuIsOpen = menuButton?.getAttribute("aria-expanded") === "true";
    if (event.key === "Escape" && menuIsOpen) {
      event.preventDefault();
      closeMenu({ returnFocus: true });
      return;
    }
    if (event.key === "Tab" && menuIsOpen && mobilePanel) {
      const focusable = [...mobilePanel.querySelectorAll("a[href]")];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!mobilePanel.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1050) {
      closeMenu();
    }
  });
  const updateHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 16);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08
      }
    );
    document.querySelectorAll(".reveal").forEach((element) => {
      revealObserver.observe(element);
    });
    const navigationObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visibleEntry) {
          return;
        }
        navLinks.forEach((link) => {
          const target = link.getAttribute("href").slice(1);
          const isActive = target === visibleEntry.target.id;
          link.classList.toggle("active", isActive);
          if (isActive) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      },
      {
        rootMargin: "-22% 0px -62% 0px",
        threshold: [0.01, 0.2, 0.5]
      }
    );
    sections.forEach((section) => {
      navigationObserver.observe(section);
    });
  } else {
    document.querySelectorAll(".reveal").forEach((element) => {
      element.classList.add("visible");
    });
  }
  document.querySelectorAll(".faq-item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) {
        return;
      }
      document.querySelectorAll(".faq-item[open]").forEach((openItem) => {
        if (openItem !== item) {
          openItem.open = false;
        }
      });
    });
  });
  const openHashDetail = () => {
    let id = "";
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }
    const target = id ? document.getElementById(id) : null;

    if (target instanceof HTMLDetailsElement) {
      target.open = true;
    }
  };
  document.querySelectorAll(".footer-legal a").forEach((link) => {
    link.addEventListener("click", () => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target instanceof HTMLDetailsElement) {
        target.open = true;
      }
    });
  });
  openHashDetail();
  window.addEventListener("hashchange", openHashDetail);
  if (year) {
    year.textContent = new Date().getFullYear();
  }
})();
