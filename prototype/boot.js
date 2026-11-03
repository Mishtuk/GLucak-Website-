// Runs before first paint (external file, so it passes script-src 'self').
// Sets the three prototype switches on <html>: ?hero=a|b, ?shows=none, and the motion state.
(() => {
  const root = document.documentElement;
  const q = new URLSearchParams(location.search);
  root.dataset.hero = q.get('hero') === 'b' ? 'b' : 'a';
  root.dataset.shows = q.get('shows') === 'none' ? 'none' : 'some';
  let saved = null;
  try { saved = localStorage.getItem('motion'); } catch { /* blocked storage: follow the device setting */ }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.dataset.motion = reduce || saved === 'off' ? 'off' : 'on';
})();
