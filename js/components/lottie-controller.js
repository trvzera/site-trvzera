// One local player and one JSON request per asset; every icon owns its SVG instance.
let lottiePromise;
const animationData = new Map();

export function loadLottie() {
  if (window.lottie) return Promise.resolve(window.lottie);
  if (!lottiePromise) {
    lottiePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL('../vendor/lottie-light-5.12.2.min.js', import.meta.url).href;
      script.async = true;
      script.addEventListener('load', () => {
        if (window.lottie) resolve(window.lottie);
        else reject(new Error('Lottie player unavailable'));
      }, { once: true });
      script.addEventListener('error', () => {
        script.remove();
        reject(new Error('Could not load Lottie player'));
      }, { once: true });
      document.head.append(script);
    }).catch(error => {
      lottiePromise = null;
      throw error;
    });
  }
  return lottiePromise;
}

function loadAnimationData(name) {
  if (!animationData.has(name)) {
    const url = new URL(`../../lotties/${name}.json`, import.meta.url);
    animationData.set(name, fetch(url).then(response => {
      if (!response.ok) throw new Error(`Could not load ${name}`);
      return response.json();
    }).catch(error => {
      animationData.delete(name);
      throw error;
    }));
  }
  return animationData.get(name);
}

export function createLottieController({ menuButton, motionButton, isMotionDisabled, animateInitialToggle = false }) {
  const canHover = window.matchMedia('(hover: hover)');
  let generation = 0;
  let suspended = false;
  let motionWasDisabled = isMotionDisabled();
  let animateToggleOn = animateInitialToggle;
  const records = [...document.querySelectorAll('[data-lottie]')].map(host => ({
    host,
    stage: host.querySelector('.lottie-stage'),
    type: host.dataset.lottie,
    trigger: host.closest('a, button'),
    animation: null,
    pending: null,
    ready: false,
    hovered: false,
    focused: false,
  })).filter(record => record.stage && record.trigger);

  function targetState(record) {
    if (record.type === 'hamburger') return menuButton.getAttribute('aria-expanded') === 'true';
    if (record.type === 'toggle') return !isMotionDisabled();
    return record.hovered || record.focused;
  }

  function syncRecord(record, animate = true) {
    const animation = record.animation;
    if (!record.ready || !animation) return;
    const active = targetState(record);
    const lastFrame = Math.max(0, animation.totalFrames - 1);
    if (!animate || isMotionDisabled() || document.hidden) {
      animation.goToAndStop(active ? lastFrame : 0, true);
      return;
    }
    const atEnd = active ? animation.currentFrame >= lastFrame : animation.currentFrame <= 0;
    if (atEnd) {
      animation.pause();
      return;
    }
    animation.setDirection(active ? 1 : -1);
    if (animation.isPaused) animation.play();
  }

  function releaseRecord(record) {
    record.ready = false;
    record.host.removeAttribute('data-animation-ready');
    record.animation?.destroy();
    record.animation = null;
    record.pending = null;
    record.stage.replaceChildren();
  }

  function shouldMount(record) {
    return !suspended && !isMotionDisabled() && (record.type !== 'hamburger' || !menuButton.hidden);
  }

  function mountRecord(record) {
    if (record.animation || record.pending || !shouldMount(record)) return record.pending;
    const currentGeneration = generation;
    const pending = Promise.all([loadLottie(), loadAnimationData(record.type)])
      .then(([lottie, data]) => {
        // A preference change or pagehide may happen while the files are loading.
        if (currentGeneration !== generation || !shouldMount(record)) return;
        const animation = lottie.loadAnimation({
          container: record.stage,
          renderer: 'svg',
          loop: false,
          autoplay: false,
          animationData: structuredClone(data),
          rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
        });
        record.animation = animation;
        animation.setSpeed(1.5);
        const ready = () => {
          if (record.animation !== animation || record.ready) return;
          record.ready = true;
          record.host.setAttribute('data-animation-ready', '');
          if (record.type === 'arrow') {
            record.hovered = canHover.matches && record.trigger.matches(':hover');
            record.focused = record.trigger.matches(':focus-visible');
            syncRecord(record);
          } else {
            // Render the current state immediately, including an already open menu.
            const animate = record.type === 'toggle' && animateToggleOn;
            if (record.type === 'toggle') animateToggleOn = false;
            syncRecord(record, animate);
          }
        };
        animation.addEventListener('DOMLoaded', ready);
        animation.addEventListener('data_failed', () => {
          if (record.animation === animation) releaseRecord(record);
        });
        if (animation.isLoaded) ready();
      }).catch(() => {
        if (currentGeneration === generation) releaseRecord(record);
      }).finally(() => {
        if (record.pending === pending) record.pending = null;
      });
    record.pending = pending;
    return pending;
  }

  records.filter(record => record.type === 'arrow').forEach(record => {
    record.trigger.addEventListener('pointerenter', event => {
      if (!canHover.matches || event.pointerType === 'touch') return;
      record.hovered = true;
      mountRecord(record);
      syncRecord(record);
    });
    record.trigger.addEventListener('pointerleave', () => {
      record.hovered = false;
      syncRecord(record);
    });
    record.trigger.addEventListener('focusin', () => {
      record.focused = record.trigger.matches(':focus-visible');
      mountRecord(record);
      syncRecord(record);
    });
    record.trigger.addEventListener('focusout', event => {
      record.focused = record.trigger.contains(event.relatedTarget);
      syncRecord(record);
    });
  });

  function releaseAnimations() {
    generation += 1;
    records.forEach(releaseRecord);
  }

  function syncMotion() {
    if (isMotionDisabled()) {
      motionWasDisabled = true;
      animateToggleOn = false;
      releaseAnimations();
      return;
    }
    if (motionWasDisabled) animateToggleOn = true;
    motionWasDisabled = false;
    records.forEach(record => {
      if (record.type === 'arrow') {
        record.hovered = canHover.matches && record.trigger.matches(':hover');
        record.focused = record.trigger.matches(':focus-visible');
      }
      mountRecord(record);
      syncRecord(record);
    });
  }

  function syncMenu() {
    records.filter(record => record.type === 'hamburger').forEach(record => {
      if (menuButton.hidden) releaseRecord(record);
      else {
        mountRecord(record);
        syncRecord(record);
      }
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) records.forEach(record => record.animation?.pause());
    else syncMotion();
  });
  window.addEventListener('pagehide', () => {
    suspended = true;
    releaseAnimations();
  });
  window.addEventListener('pageshow', () => {
    suspended = false;
    syncMotion();
  });

  syncMotion();
  return { syncMenu, syncMotion };
}
