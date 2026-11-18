// Runs before first paint (external file, so it passes script-src 'self'). Sets the motion state on <html>.
(() => {
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem('motion'); } catch { /* blocked storage: follow the device setting */ }
  // DESIGN 30d: the owner's palette preview. Reads only localStorage (never ?palettes), so a fan's page is never recoloured.
  try { const p = localStorage.getItem('palette'); if (p && p !== 'identity' && /^[a-z]{1,16}$/.test(p)) root.dataset.palette = p; } catch { /* blocked storage: default colours */ }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.dataset.motion = reduce || saved === 'off' ? 'off' : 'on';
  // D47 (DESIGN 16e): iOS Safari applies :active only when a touch listener exists. An empty passive one is enough.
  document.addEventListener('touchstart', () => {}, { passive: true });
})();
