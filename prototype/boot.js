// Runs before first paint (external file, so it passes script-src 'self').
// Sets the three prototype switches on <html>: ?hero=ab|a|b, ?shows=none, and the motion state.
// Hero default is 'ab' (D34: A under 900px, B from 900px); ?hero=a and ?hero=b force one layout at every width, for testing.
(() => {
  const root = document.documentElement;
  const q = new URLSearchParams(location.search);
  root.dataset.hero = ['a', 'b'].includes(q.get('hero')) ? q.get('hero') : 'ab';
  root.dataset.shows = q.get('shows') === 'none' ? 'none' : 'some';
  let saved = null;
  try { saved = localStorage.getItem('motion'); } catch { /* blocked storage: follow the device setting */ }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.dataset.motion = reduce || saved === 'off' ? 'off' : 'on';
})();
