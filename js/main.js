(() => {
  const html = document.documentElement;
  const header = document.querySelector('.site-header');
  const headerInner = document.querySelector('.header-inner');
  const navigation = document.getElementById('site-navigation');
  const navLinks = [...navigation.querySelectorAll('a')];
  const sections = navLinks.map(link => document.querySelector(link.hash));
  const menuButton = document.getElementById('menu-toggle');
  const siteMenu = document.querySelector('.site-menu');
  const menuPanel = document.getElementById('menu-panel');
  const menuNavigationSlot = document.querySelector('.menu-navigation-slot');
  const mobileHeader = window.matchMedia('(max-width: 680px)');
  const avatar = document.querySelector('.photo-avatar');
  const backToTop = document.querySelector('.back-to-top');
  const themeButton = document.getElementById('theme-toggle');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.getElementById('motion-toggle');
  const menuLabel = menuButton.querySelector('[data-menu-label]');
  const themeLabel = themeButton.querySelector('[data-theme-label]');
  const motionLabel = motionButton.querySelector('[data-motion-label]');
  let framePending = false;
  let menuOpen = false;
  let lottieController = null;
  let lottieInitializationStarted = false;
  let animateInitialToggle = false;
  const motionDisabled = () => reducedMotion.matches || html.dataset.motion === 'off';
  const save = (key, value) => {
    try { localStorage.setItem(key, value); } catch {}
  };
  const getSaved = key => {
    try { return localStorage.getItem(key); } catch { return null; }
  };

  function updateThemeButton() {
    const dark = html.dataset.theme === 'dark';
    const label = dark ? 'Ativar tema claro' : 'Ativar tema escuro';
    themeLabel.textContent = dark ? 'Tema escuro' : 'Tema claro';
    themeButton.setAttribute('aria-label', `${themeLabel.textContent}. ${label}`);
    themeButton.title = label;
  }
  updateThemeButton();
  themeButton.addEventListener('click', () => {
    html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
    save('theme', html.dataset.theme);
    updateThemeButton();
  });
  systemTheme.addEventListener('change', event => {
    if (getSaved('theme')) return;
    html.dataset.theme = event.matches ? 'dark' : 'light';
    updateThemeButton();
  });

  function updateNavigation() {
    framePending = false;
    const scrollTop = Math.max(0, window.scrollY);
    const scrollRange = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = getReadingProgress(scrollTop, scrollRange);
    header.style.setProperty('--reading-progress', progress);
    header.classList.toggle('is-scrolled', scrollTop > 16);
    if (backToTop) {
      const visible = scrollTop > window.innerHeight * .65;
      backToTop.hidden = false;
      backToTop.inert = !visible;
      backToTop.tabIndex = visible ? 0 : -1;
      backToTop.setAttribute('aria-hidden', String(!visible));
      if (visible) backToTop.setAttribute('data-visible', '');
      else backToTop.removeAttribute('data-visible');
    }
    // A little depth in the photo; reading text keeps its position and clarity.
    avatar.style.setProperty('--avatar-offset', motionDisabled() ? '0px' : `${Math.min(18, scrollTop * .045)}px`);
    let active = 0;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= window.innerHeight * .35) active = index;
    });
    navLinks.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    updateScrollEffects();
    // Height changes during a tab transition also need fresh scroll measurements.
    if (tierAnimations.length) scheduleUpdate();
  }
  function scheduleUpdate() {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(updateNavigation);
  }

  // Preferences live in the same disclosure on desktop and mobile.
  function setMenu(open, animate = true) {
    menuOpen = open;
    if (mobileHeader.matches && navigation.parentElement !== menuNavigationSlot) menuNavigationSlot.append(navigation);
    else if (!mobileHeader.matches && navigation.parentElement === menuNavigationSlot) headerInner.append(navigation);
    navigation.hidden = false;
    menuButton.hidden = false;
    menuButton.setAttribute('aria-expanded', String(menuOpen));
    menuButton.setAttribute('aria-label', menuOpen ? 'Fechar menu' : 'Abrir menu');
    menuLabel.textContent = menuOpen ? 'Fechar' : 'Menu';
    if (!menuOpen && menuPanel.contains(document.activeElement)) menuButton.focus();
    menuPanel.inert = !menuOpen;
    menuPanel.setAttribute('aria-hidden', String(!menuOpen));
    // CSS reverses from the current visual state, even during rapid toggles.
    // Visibility is delayed only on closing; inert blocks interaction immediately.
    if (!animate) siteMenu.classList.add('menu-immediate');
    menuPanel.hidden = false;
    siteMenu.setAttribute('data-open', String(menuOpen));
    if (!animate) {
      menuPanel.getBoundingClientRect();
      siteMenu.classList.remove('menu-immediate');
    }
    lottieController?.syncMenu();
    scheduleUpdate();
  }
  setMenu(false, false);
  menuButton.addEventListener('click', () => setMenu(!menuOpen));
  mobileHeader.addEventListener('change', () => {
    const focusWasInNav = navigation.contains(document.activeElement);
    const focusWasInPanel = menuPanel.contains(document.activeElement);
    setMenu(false, false);
    if (focusWasInPanel || (mobileHeader.matches && focusWasInNav)) menuButton.focus();
  });
  navLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', event => {
    if (menuOpen && !siteMenu.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !menuOpen) return;
    setMenu(false);
    menuButton.focus();
  });

  // Without JavaScript both lists remain visible as static cards.
  const tabList = document.querySelector('.tier-tabs');
  const tierTabs = [...tabList.querySelectorAll('[role="tab"]')];
  const tierPanels = tierTabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const tierContainer = document.querySelector('.tier-panels');
  let selectedTier = 0;
  let maximumTierHeight = 0;
  let tierAnimations = [];
  let readingAnchor = null;

  function measureTierPanels() {
    maximumTierHeight = Math.max(...tierPanels.map(panel => {
      if (panel.hidden) panel.classList.add('is-measuring');
      const height = panel.getBoundingClientRect().height;
      panel.classList.remove('is-measuring');
      return height;
    }));
  }

  function getReadingProgress(scrollTop, scrollRange) {
    if (scrollRange <= 0) return 0;
    const rect = tierContainer.getBoundingClientRect();
    const extraHeight = Math.max(0, maximumTierHeight - rect.height);
    const start = Math.max(0, Math.min(rect.top + scrollTop, scrollRange - rect.height));
    const end = Math.min(scrollRange, start + rect.height);
    const progressAt = position => {
      const throughTier = Math.max(0, Math.min(1, (position - start) / Math.max(1, end - start)));
      return Math.max(0, Math.min(1, (position + extraHeight * throughTier) / (scrollRange + extraHeight)));
    };
    // Both tabs share a reading range. Preserve the percentage at the switch point
    // even on tall viewports, then interpolate toward the same 0% and 100% ends.
    const progress = progressAt(scrollTop);
    if (!readingAnchor || progress === 0 || progress === 1) return progress;
    const anchorProgress = progressAt(readingAnchor.scrollTop);
    if (anchorProgress <= 0 || anchorProgress >= 1) return progress;
    if (progress <= anchorProgress) return progress * readingAnchor.progress / anchorProgress;
    return readingAnchor.progress + (1 - readingAnchor.progress) * (progress - anchorProgress) / (1 - anchorProgress);
  }

  function finishTierTransition() {
    tierAnimations.forEach(animation => animation.cancel());
    tierAnimations = [];
    tierContainer.classList.remove('is-transitioning');
  }

  function selectTier(index, focus = false, animate = true) {
    const changed = selectedTier !== index;
    const anchor = changed ? {
      scrollTop: Math.max(0, window.scrollY),
      progress: getReadingProgress(Math.max(0, window.scrollY), html.scrollHeight - html.clientHeight),
    } : null;
    const previousHeight = tierContainer.getBoundingClientRect().height;
    finishTierTransition();
    selectedTier = index;
    tierTabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      tierPanels[tabIndex].hidden = !selected;
    });
    measureTierPanels();
    if (anchor) readingAnchor = anchor;
    if (changed && animate && !motionDisabled() && tierContainer.animate) {
      const nextHeight = tierPanels[index].getBoundingClientRect().height;
      tierContainer.classList.add('is-transitioning');
      const heightAnimation = tierContainer.animate([
        { height: `${previousHeight}px` }, { height: `${nextHeight}px` },
      ], { duration: 360, easing: 'cubic-bezier(.16, 1, .3, 1)' });
      const contentAnimation = tierPanels[index].animate([
        { opacity: 0, transform: 'translateY(10px)', filter: 'blur(6px)' },
        { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
      ], { duration: 320, easing: 'cubic-bezier(.16, 1, .3, 1)' });
      const currentAnimations = [heightAnimation, contentAnimation];
      tierAnimations = currentAnimations;
      Promise.all(currentAnimations.map(animation => animation.finished)).then(() => {
        if (tierAnimations !== currentAnimations) return;
        tierAnimations = [];
        tierContainer.classList.remove('is-transitioning');
        scheduleUpdate();
      }).catch(() => {});
    }
    if (focus) tierTabs[index].focus();
    scheduleUpdate();
  }
  tierPanels.forEach((panel, index) => {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tierTabs[index].id);
  });
  tabList.hidden = false;
  document.querySelector('.tier-board').classList.add('tabs-ready');
  selectTier(0, false, false);
  tierTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTier(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tierTabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tierTabs.length) % tierTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tierTabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      selectTier(next, true);
    });
  });

  // Scroll position drives the effect in both directions; it never finishes offscreen.
  // The middle of the viewport stays sharp, and only its edges carry blur and depth.
  const scrollStates = new Map([...document.querySelectorAll('[data-reveal]')].map(element => [
    element, { y: 0, scale: 1, signature: '', pinned: false }
  ]));
  let scrollEffectsEnabled = false;
  const clamp = value => Math.max(0, Math.min(1, value));
  const smoothstep = value => value * value * (3 - 2 * value);
  function resetReveal(element, state) {
    if (state.signature) {
      element.classList.remove('scroll-reveal');
      ['--scroll-y', '--scroll-scale', '--scroll-blur'].forEach(property => element.style.removeProperty(property));
    }
    state.y = 0;
    state.scale = 1;
    state.signature = '';
  }
  function keepRevealClear(target) {
    scrollStates.forEach((state, element) => {
      if (!element.contains(target)) return;
      // A focused link stays clear until its block leaves the screen.
      state.pinned = true;
      resetReveal(element, state);
    });
  }
  function updateScrollEffects() {
    if (!scrollEffectsEnabled || document.hidden) return;
    const viewportHeight = window.innerHeight;
    const headerBottom = header.getBoundingClientRect().bottom;
    const compact = mobileHeader.matches;
    const entranceRange = viewportHeight * .3;
    const exitRange = Math.min(140, viewportHeight * .16);
    const atPageEnd = window.scrollY + viewportHeight >= html.scrollHeight - 2;
    // Batch geometry reads before writing styles. Undo our own transform in the
    // measurements so the effect cannot feed back into its progress or card heights.
    const measurements = [...scrollStates].map(([element, state]) => {
      const rect = element.getBoundingClientRect();
      const top = rect.top - state.y;
      const height = rect.height / state.scale;
      return { element, state, top, bottom: top + height, height };
    });
    measurements.forEach(({ element, state, top, bottom, height }) => {
      if (!height || bottom <= 0 || top >= viewportHeight + 64) {
        state.pinned = false;
        resetReveal(element, state);
        return;
      }
      if (state.pinned || element.contains(document.activeElement)) {
        resetReveal(element, state);
        return;
      }
      const entering = atPageEnd ? 0 : smoothstep(clamp((top - viewportHeight + entranceRange) / entranceRange));
      const leaving = smoothstep(clamp((headerBottom + exitRange - bottom) / exitRange));
      if (entering < .001 && leaving < .001) {
        resetReveal(element, state);
        return;
      }
      const y = Number((entering * (compact ? 32 : 44) - leaving * 14).toFixed(2));
      const scale = Number((1 - entering * .025 - leaving * .008).toFixed(4));
      const blur = Number((entering * (compact ? 8 : 12) + leaving * (compact ? 4 : 6)).toFixed(2));
      const signature = `${y}/${scale}/${blur}`;
      if (state.signature === signature) return;
      element.style.setProperty('--scroll-y', `${y}px`);
      element.style.setProperty('--scroll-scale', scale);
      element.style.setProperty('--scroll-blur', `${blur}px`);
      element.classList.add('scroll-reveal');
      state.y = y;
      state.scale = scale;
      state.signature = signature;
    });
  }
  function configureMotion() {
    scrollEffectsEnabled = !motionDisabled();
    scrollStates.forEach((state, element) => resetReveal(element, state));
    const disabled = motionDisabled();
    if (disabled) {
      finishTierTransition();
    }
    motionButton.disabled = reducedMotion.matches;
    motionButton.setAttribute('aria-checked', String(!disabled));
    motionLabel.textContent = reducedMotion.matches ? 'Movimento reduzido pelo sistema' : 'Animações';
    motionButton.title = reducedMotion.matches ? 'Animações desativadas pela preferência do sistema' : disabled ? 'Ativar animações' : 'Desativar animações';
    lottieController?.syncMotion();
    scheduleUpdate();
  }
  motionButton.addEventListener('click', () => {
    if (reducedMotion.matches) return;
    html.dataset.motion = html.dataset.motion === 'off' ? 'on' : 'off';
    animateInitialToggle = html.dataset.motion === 'on';
    save('motion', html.dataset.motion);
    configureMotion();
    initializeInteractiveAnimations();
  });
  reducedMotion.addEventListener('change', configureMotion);
  document.addEventListener('focusin', event => {
    keepRevealClear(event.target);
    scheduleUpdate();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) scrollStates.forEach((state, element) => resetReveal(element, state));
    else scheduleUpdate();
  });
  configureMotion();

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('resize', () => {
    finishTierTransition();
    measureTierPanels();
  });
  window.addEventListener('pageshow', scheduleUpdate);
  window.addEventListener('pagehide', () => {
    finishTierTransition();
    setMenu(false, false);
  });
  // Layout can change when covers or local fonts finish loading.
  document.querySelectorAll('img').forEach(img => img.addEventListener('load', scheduleUpdate, { once: true }));
  document.fonts?.ready.then(() => {
    measureTierPanels();
    scheduleUpdate();
  });
  updateNavigation();

  // Optional animated icons load on interaction; the fallbacks keep controls ready.
  const animationIntentEvents = ['pointerover', 'pointerdown', 'keydown', 'focusin'];
  function initializeInteractiveAnimations() {
    if (lottieInitializationStarted) return;
    lottieInitializationStarted = true;
    animationIntentEvents.forEach(event => window.removeEventListener(event, initializeInteractiveAnimations));
    import('./components/lottie-controller.js').then(({ createLottieController }) => {
      lottieController = createLottieController({ menuButton, motionButton, isMotionDisabled: motionDisabled, animateInitialToggle });
      animateInitialToggle = false;
    }).catch(() => {});
  }
  animationIntentEvents.forEach(event => window.addEventListener(event, initializeInteractiveAnimations, { once: true, passive: true }));
  import('./components/photo-viewer.js').then(({ createPhotoViewer }) => {
    createPhotoViewer({ isMotionDisabled: motionDisabled, onLayoutChange: scheduleUpdate });
  }).catch(() => {});
})();
