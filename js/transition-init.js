(function () {
  const isDark = localStorage.getItem("theme") === "dark";
  if (isDark) document.documentElement.setAttribute("data-theme", "dark");
  const bgColor = isDark ? "#111113" : "#f5f5f7";
  const bgRgba = isDark ? "rgba(17, 17, 19, 0.85)" : "rgba(245, 245, 247, 0.85)";
  const OUT_DUR = "0.7s";
  const IN_DUR  = "0.85s";
  const EASE    = "cubic-bezier(0.85, 0, 0.15, 1)";
  
  const style = document.createElement("style");
  style.textContent = `
    #pt-overlay {
      position: fixed;
      inset: 0;
      background: ${bgRgba};
      backdrop-filter: blur(40px) saturate(180%);
      -webkit-backdrop-filter: blur(40px) saturate(180%);
      z-index: 99997;
      pointer-events: none;
      opacity: 1;
      visibility: visible;
      transition: opacity ${OUT_DUR} ${EASE}, visibility ${OUT_DUR} ${EASE};
      overflow: hidden;
      perspective: 1000px;
    }
    #pt-overlay::before {
      content: "";
      position: absolute;
      inset: 0;
      background: ${bgColor};
      z-index: -1;
      opacity: 0.5;
    }
    #pt-overlay.hidden {
      opacity: 0;
      visibility: hidden;
    }

    #pt-label {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 99998;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      filter: blur(15px);
      transition: opacity 0.8s ${EASE}, filter 1s ${EASE}, transform 1s ${EASE};
    }
    #pt-label span {
      font-family: "Apple-Bold", sans-serif;
      font-size: 2rem;
      color: ${isDark ? "#fff" : "#000"};
      letter-spacing: -0.02em;
      margin-top: 15px;
      display: block;
    }
    #pt-label.focus {
      opacity: 1;
      filter: blur(0px);
      transform: translate(-50%, -50%) scale(1);
    }
    #pt-label.exit-blur {
      opacity: 0;
      filter: blur(20px);
      transform: translate(-50%, -50%) scale(0.9);
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement("div"); 
  overlay.id = "pt-overlay";
  
  const label = document.createElement("div"); 
  label.id = "pt-label";
  label.innerHTML = `<span>trvzera.</span>`;

  function mount() {
    document.documentElement.appendChild(overlay);
    document.documentElement.appendChild(label);
  }
  mount();

  let loaded = false;
  function triggerLoad() {
    if (loaded) return;
    loaded = true;
    requestAnimationFrame(() => {
      void label.offsetWidth;
        const fadeOut = () => {
          label.classList.remove("focus");
          label.classList.add("exit-blur");
          overlay.classList.add("hidden");
        };

        if (sessionStorage.getItem("pt-nav") === "true") {
          sessionStorage.removeItem("pt-nav");
          label.style.transition = "none";
          label.classList.add("focus");
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              label.style.transition = "";
              setTimeout(fadeOut, 450);
            });
          });
        } else {
          label.classList.add("focus");
          setTimeout(fadeOut, 1200);
        }
    });
  }

  window.addEventListener("load", triggerLoad);
  setTimeout(triggerLoad, 1800);

  function leave(href) {
    sessionStorage.setItem("pt-nav", "true");
    overlay.style.transition = `opacity ${IN_DUR} ${EASE}, visibility ${IN_DUR} ${EASE}`;
    overlay.classList.remove("hidden");
    label.style.transition = "none";
    label.classList.remove("exit-blur");
    label.classList.remove("focus");
    void label.offsetWidth;
    label.style.transition = "";
    label.classList.add("focus");
    setTimeout(() => { window.location.href = href; }, 650);
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href) return;
    if (/^(#|mailto:|tel:|javascript:)/.test(href)) return;
    if (a.target === "_blank" || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (a.hostname && a.hostname !== window.location.hostname) return;
    const currentUrl = new URL(window.location.href);
    const targetUrl  = new URL(a.href);
    if (currentUrl.origin === targetUrl.origin && currentUrl.pathname === targetUrl.pathname) return;
    e.preventDefault();
    leave(href);
  });

  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    overlay.style.transition = "none";
    overlay.classList.add("hidden");
    label.classList.add("exit-blur");
  });
})();

