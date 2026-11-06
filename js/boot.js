// Runs before first paint (external file, so it passes script-src 'self'). Sets the motion state on <html>.
(() => {
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem('motion'); } catch { /* blocked storage: follow the device setting */ }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.dataset.motion = reduce || saved === 'off' ? 'off' : 'on';
  // D47 (DESIGN 16e): iOS Safari applies :active only when a touch listener exists. An empty passive one is enough.
  document.addEventListener('touchstart', () => {}, { passive: true });
})();
