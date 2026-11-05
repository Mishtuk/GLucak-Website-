// Runs before first paint (external file, so it passes script-src 'self'). Sets the motion state on <html>.
(() => {
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem('motion'); } catch { /* blocked storage: follow the device setting */ }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.dataset.motion = reduce || saved === 'off' ? 'off' : 'on';
})();
