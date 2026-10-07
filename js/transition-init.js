// Restore appearance before the first paint. No loading screen or navigation delay.
(() => {
  let theme;
  let motion;
  try {
    theme = localStorage.getItem('theme');
    motion = localStorage.getItem('motion');
  } catch { /* Storage can be unavailable in private or restricted browsing. */ }
  const dark = theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  if (motion === 'off') document.documentElement.dataset.motion = 'off';
})();
