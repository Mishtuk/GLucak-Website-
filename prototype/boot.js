// Runs before first paint (external file, so it passes script-src 'self').
// Sets the prototype switches on <html>: ?hero=ab|a|b, ?shows=none, ?header=scrim, and the motion state.
// Hero default is 'ab' (D34: A under 900px, B from 900px); ?hero=a and ?hero=b force one layout at every width, for testing.
(() => {
  const root = document.documentElement;
  const q = new URLSearchParams(location.search);
  root.dataset.hero = ['a', 'b'].includes(q.get('hero')) ? q.get('hero') : 'ab';
  root.dataset.shows = q.get('shows') === 'none' ? 'none' : 'some';
  // DESIGN 18e: the header is a solid band from the first paint (the default). ?header=scrim brings back the see-through
  // header over the Home hero, the one switch if the owner overrules. The build sets the same attribute from one constant.
  root.dataset.header = q.get('header') === 'scrim' ? 'scrim' : 'solid';
  let saved = null;
  try { saved = localStorage.getItem('motion'); } catch { /* blocked storage: follow the device setting */ }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.dataset.motion = reduce || saved === 'off' ? 'off' : 'on';
  // Round 2 (D47, DESIGN 16e): iOS Safari applies :active only when a touch listener exists. An empty passive one is enough.
  document.addEventListener('touchstart', () => {}, { passive: true });
})();
