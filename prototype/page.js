// Round 2 subpages (music.html, 404.html): era colors, the phone menu, the Motion switch, the year. Same behaviour as
// app.js / shop.js; no innerHTML. Switch: ?era=<slug>.
(() => {
  const root = document.documentElement;
  const q = new URLSearchParams(location.search);
  const $ = (s) => document.querySelector(s);

  const HEX = /^#[0-9a-f]{6}$/i;
  const eraSlug = Object.hasOwn(GL.eras, q.get('era') ?? '') ? q.get('era') : 'placeholder';
  for (const [k, v] of Object.entries(GL.eras[eraSlug].colors)) if (HEX.test(v)) root.style.setProperty(`--${k}`, v);
  $('#era-name').textContent = GL.eras[eraSlug].name;
  if (GL.eraLabels[eraSlug]) $('#era-line').textContent = GL.eraLabels[eraSlug].note;

  const menu = $('.nav-mobile');
  const summary = menu.querySelector('summary');
  menu.addEventListener('toggle', () => { if (menu.open) menu.querySelector('.sheet a').focus(); });
  menu.addEventListener('click', (e) => { if (e.target.closest('.sheet a')) menu.open = false; });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.open) { menu.open = false; summary.focus(); } });

  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const btn = $('#motion');
  const stored = () => { try { return localStorage.getItem('motion'); } catch { return null; } };
  const store = (v) => { try { localStorage.setItem('motion', v); } catch { /* this visit only */ } };
  function showMotion() {
    const device = reduceQuery.matches;
    const on = !device && root.dataset.motion === 'on';
    btn.textContent = device ? 'Motion: off (device setting)' : `Motion: ${on ? 'on' : 'off'}`;
    btn.setAttribute('aria-pressed', String(on));
    btn.disabled = device;
  }
  btn.addEventListener('click', () => { root.dataset.motion = root.dataset.motion === 'on' ? 'off' : 'on'; store(root.dataset.motion); showMotion(); });
  reduceQuery.addEventListener('change', () => { root.dataset.motion = reduceQuery.matches || stored() === 'off' ? 'off' : 'on'; showMotion(); });
  showMotion();

  $('#year').textContent = String(new Date().getFullYear());
})();
