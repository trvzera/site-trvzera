export function createPhotoViewer({ isMotionDisabled, onLayoutChange = () => {} }) {
  const trigger = document.querySelector('[data-setup-photo]');
  const dialog = document.getElementById('setup-photo-viewer');
  if (!trigger || !dialog || typeof dialog.showModal !== 'function') return null;

  const closeButton = dialog.querySelector('.photo-viewer-close');
  const image = dialog.querySelector('.photo-viewer-image');
  const html = document.documentElement;
  let closing = false;
  let closeTimer;
  let backdropPressed = false;

  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', dialog.id);
  trigger.setAttribute('aria-expanded', 'false');

  function cleanup() {
    clearTimeout(closeTimer);
    closing = false;
    backdropPressed = false;
    delete dialog.dataset.visible;
    html.classList.remove('photo-viewer-open');
    trigger.setAttribute('aria-expanded', 'false');
    onLayoutChange();
  }

  function finishClose() {
    if (!closing) return;
    dialog.close();
    cleanup();
    trigger.focus({ preventScroll: true });
  }

  function close(immediate = false) {
    if (!dialog.open) return;
    closing = true;
    dialog.dataset.visible = 'false';
    if (immediate || isMotionDisabled()) finishClose();
    else {
      clearTimeout(closeTimer);
      // transitionend is primary; the timer also covers interrupted transitions.
      closeTimer = setTimeout(finishClose, 260);
    }
  }

  trigger.addEventListener('click', event => {
    try {
      if (image?.dataset.src && !image.getAttribute('src')) image.src = image.dataset.src;
      if (!dialog.open) dialog.showModal();
    } catch { return; } // Preserve the direct image link if the modal is unavailable.
    event.preventDefault();
    clearTimeout(closeTimer);
    closing = false;
    html.classList.add('photo-viewer-open');
    trigger.setAttribute('aria-expanded', 'true');
    // Flush the initial opacity so CSS can animate into the open state.
    dialog.getBoundingClientRect();
    dialog.dataset.visible = 'true';
    onLayoutChange();
  });
  closeButton.addEventListener('click', () => close());
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener('pointerdown', event => {
    backdropPressed = event.target === dialog;
  });
  dialog.addEventListener('pointercancel', () => { backdropPressed = false; });
  dialog.addEventListener('click', event => {
    if (backdropPressed && event.target === dialog) close();
    backdropPressed = false;
  });
  dialog.addEventListener('transitionend', event => {
    if (closing && event.target === dialog && event.propertyName === 'opacity') finishClose();
  });
  dialog.addEventListener('close', () => {
    if (!dialog.open) cleanup();
  });
  window.addEventListener('pagehide', () => close(true));

  return { close };
}
