/**
 * SITE GLOBAL LOGIC
 */

// --- UTILS ---
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// --- SIDEBAR / MOBILE MENU ---
(function initSidebar() {
  const mobileMenuBtn = $("mobile-menu-btn");
  const closeMenuBtn = $("close-menu-btn");
  const sidebar = $("sidebar");
  const mobileOverlay = $("mobile-overlay");

  if (!mobileMenuBtn || !sidebar) return;

  const openSidebar = () => {
    sidebar.classList.add("open");
    mobileOverlay?.classList.add("show");
    document.body.style.overflow = "hidden";
  };

  const closeSidebar = () => {
    sidebar.classList.remove("open");
    mobileOverlay?.classList.remove("show");
    document.body.style.overflow = "";
  };

  mobileMenuBtn.addEventListener("click", openSidebar);
  closeMenuBtn?.addEventListener("click", closeSidebar);
  mobileOverlay?.addEventListener("click", closeSidebar);

  // Sidebar navigation helpers
  $("sidebar-home-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    $("welcome-screen") && ($("welcome-screen").style.display = "");
    $("products-grid") && ($("products-grid").style.display = "none");
    $("contact-screen") && ($("contact-screen").style.display = "none");
    $$("#sidebar li").forEach((li) => li.classList.remove("active"));
    $("sidebar-home-item")?.classList.add("active");
    if (window.innerWidth <= 860) closeSidebar();
  });

  $("sidebar-contact-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    $("welcome-screen") && ($("welcome-screen").style.display = "none");
    $("products-grid") && ($("products-grid").style.display = "none");
    $("contact-screen") && ($("contact-screen").style.display = "flex");
    $$("#sidebar li").forEach((li) => li.classList.remove("active"));
    $("sidebar-contact-item")?.classList.add("active");
    if (window.innerWidth <= 860) closeSidebar();
  });
})();

// --- THEME SYSTEM ---
(function initTheme() {
  const themeToggle = $("theme-toggle");
  const thMoon = $("th-moon");
  const thSun = $("th-sun");
  const htmlEl = document.documentElement;
  let transitionTimer = null;

  const applyTheme = (dark) => {
    dark ? htmlEl.setAttribute("data-theme", "dark") : htmlEl.removeAttribute("data-theme");
    if (thMoon) thMoon.style.display = dark ? "none" : "block";
    if (thSun) thSun.style.display = dark ? "block" : "none";
  };

  const applyThemeTransition = () => {
    if ($("__theme-transition__")) return;
    const el = document.createElement("style");
    el.id = "__theme-transition__";
    el.textContent = `*, *::before, *::after { transition: background-color 0.28s cubic-bezier(.46,.01,.35,1), color 0.28s ease !important; }`;
    document.head.appendChild(el);
    clearTimeout(transitionTimer);
    transitionTimer = setTimeout(() => el.remove(), 400);
  };

  applyTheme(localStorage.getItem("theme") === "dark");

  themeToggle?.addEventListener("click", () => {
    const isDark = htmlEl.getAttribute("data-theme") === "dark";
    applyThemeTransition();
    applyTheme(!isDark);
    localStorage.setItem("theme", !isDark ? "dark" : "light");
  });
})();

// --- LOGO CAROUSEL (Infinite) ---
(function initLogoCarousel() {
  const track = $("carouselTrack");
  const container = $("carouselContainer");
  if (!track || !container) return;

  const fillTrack = () => {
    const items = Array.from(track.children);
    const needed = Math.ceil((container.offsetWidth * 3) / track.scrollWidth) + 1;
    for (let i = 0; i < needed; i++) {
      items.forEach((item) => track.appendChild(item.cloneNode(true)));
    }
  };
  fillTrack();

  let cachedWidth = 0;
  const updateWidth = () => {
    const items = track.querySelectorAll(".logo-item");
    const gap = parseFloat(getComputedStyle(track).gap) || 16;
    let w = 0;
    Array.from(items).slice(0, 4).forEach(el => w += el.offsetWidth + gap);
    cachedWidth = w;
  };
  updateWidth();
  window.addEventListener("resize", updateWidth);

  let x = 0, lastTime = null, paused = false;
  container.addEventListener("mouseenter", () => paused = true);
  container.addEventListener("mouseleave", () => { paused = false; lastTime = null; });

  const step = (ts) => {
    if (!paused && lastTime !== null) {
      x += (60 * (ts - lastTime)) / 1000;
      if (x >= cachedWidth) x -= cachedWidth;
      track.style.transform = `translateX(${-x}px)`;
    }
    lastTime = ts;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
})();

// --- FAQ ---
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = answer.classList.contains("open");
  $$(".faq-item.open").forEach(b => {
    b.classList.remove("open");
    b.nextElementSibling.classList.remove("open");
  });
  if (!isOpen) {
    btn.classList.add("open");
    answer.classList.add("open");
  }
}

// --- SUBMENU ---
function toggleSubMenu(btn) {
  btn.nextElementSibling.classList.toggle("show");
  btn.classList.toggle("rotate");
}

// --- PRODUCT FILTERING ---
function filtrarProdutos(categoria) {
  const screenWelcome = $("welcome-screen");
  if (screenWelcome) screenWelcome.style.display = "none";
  const grid = $("products-grid");
  if (grid) grid.style.display = "block";
  const contact = $("contact-screen");
  if (contact) contact.style.display = "none";

  const nomes = {
    cabos: "Cabos", fones: "Fones", microfone: "Microfone", mouse: "Mouse",
    "mouse-pads": "Mouse Pads", teclado: "Teclado", switches: "Switches",
    keycaps: "Keycaps", pc: "PC", luzes: "Luzes", dados: "Dados",
    "livros-rpg": "Livros de RPG", "livros-mangas": "Livros & Mangas", extras: "Extras"
  };

  const titulo = $("categoria-titulo");
  const count = $("categoria-count");
  if (titulo) titulo.textContent = nomes[categoria] ?? categoria;

  let visiveis = 0;
  $$(".produto").forEach((p) => {
    const show = p.dataset.categoria === categoria;
    p.style.display = show ? "flex" : "none";
    if (show) visiveis++;
  });
  if (count) count.textContent = `${visiveis} produto${visiveis !== 1 ? "s" : ""}`;
}

// Bind product links
$$("#sidebar a[data-categoria], .cat-card[data-categoria]").forEach(el => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    const cat = el.dataset.categoria;
    filtrarProdutos(cat);
    $$("#sidebar li").forEach(li => li.classList.remove("active"));
    $(`sidebar-home-item`)?.classList.remove("active");
    el.closest("li")?.classList.add("active");
    if (window.innerWidth <= 860) {
      $("sidebar")?.classList.remove("open");
      $("mobile-overlay")?.classList.remove("show");
      document.body.style.overflow = "";
    }
  });
});

// --- GAME MODAL ---
(function initGameModal() {
  const modal = $("gameModal");
  const closeBtn = $("closeGame");
  if (!modal) return;

  const openModal = (card) => {
    const title = card.getAttribute("title") || card.querySelector("h3")?.textContent || "";
    const year = card.dataset.year || card.querySelector(".game-year")?.textContent || "";
    const synopsis = card.dataset.synopsis || card.getAttribute("data-synopsis") || "";
    const banner = card.dataset.banner || card.querySelector("img")?.src || "";

    $("modalGameTitle").textContent = title;
    $("modalGameYear").textContent = year;
    $("modalGameSynopsis").textContent = synopsis;
    $("modalGameImg").src = banner;

    modal.classList.add("open", "active");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.classList.remove("open", "active");
    document.body.style.overflow = "";
  };

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".tier-cover, .game-card");
    if (card) openModal(card);
  });

  closeBtn?.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
})();

// --- CAROUSELS ---
(function initCarousels() {
  $$(".card-carousel").forEach(carousel => {
    const slides = carousel.querySelectorAll(".carousel-slide");
    const label = carousel.querySelector(".card-label");
    const prevBtn = carousel.querySelector(".carousel-btn.prev");
    const nextBtn = carousel.querySelector(".carousel-btn.next");
    let currentIndex = 0;

    const update = (newIndex) => {
      slides[currentIndex].classList.remove("active");
      currentIndex = (newIndex + slides.length) % slides.length;
      slides[currentIndex].classList.add("active");
      const title = slides[currentIndex].dataset.title;
      if (label && title) label.textContent = title;
    };

    prevBtn?.addEventListener("click", () => update(currentIndex - 1));
    nextBtn?.addEventListener("click", () => update(currentIndex + 1));
  });
})();

// --- CONTACT CARD ---
(function initContactCard() {
  const card = $("emailCard");
  const sublabel = $("emailSublabel");
  if (!card || !sublabel) return;

  let timer = null;
  card.querySelectorAll(".email-icon-btn").forEach(btn => {
    btn.addEventListener("mouseenter", () => {
      clearTimeout(timer);
      card.dataset.reveal = btn.dataset.reveal;
      sublabel.textContent = btn.dataset.label;
      sublabel.classList.add("visible");
      card.querySelectorAll(".email-icon-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
    btn.addEventListener("mouseleave", () => {
      btn.classList.remove("active");
      sublabel.classList.remove("visible");
      timer = setTimeout(() => delete card.dataset.reveal, 280);
    });
  });
})();

// --- FLIPPABLE CARD ---
$("bioCard")?.addEventListener("click", function() {
  this.classList.toggle("flipped");
  this.setAttribute("aria-expanded", this.classList.contains("flipped"));
});
