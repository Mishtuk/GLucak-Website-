// Site behaviour. Every value goes into the page through textContent or a checked attribute, never as markup.
(() => {
  const root = document.documentElement;
  const $ = (s) => document.querySelector(s);

  /* ---------- Header goes solid once the page moves (Home only: elsewhere it is solid from the start) ---------- */
  const header = $('.site-header');
  const sentinel = $('.sentinel');
  if (header && sentinel && header.dataset.overlay != null) {
    new IntersectionObserver(([e]) => header.classList.toggle('is-solid', !e.isIntersecting)).observe(sentinel);
  }
  const menu = $('.nav-mobile');
  if (menu) {
    const summary = menu.querySelector('summary');
    menu.addEventListener('toggle', () => { if (menu.open) menu.querySelector('.sheet a').focus(); });
    menu.addEventListener('click', (e) => { if (e.target.closest('.sheet a')) menu.open = false; });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.open) { menu.open = false; summary.focus(); } });
  }

  /* ---------- Motion switch ---------- */
  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const btn = $('#motion');
  const stored = () => { try { return localStorage.getItem('motion'); } catch { return null; } };
  const store = (v) => { try { localStorage.setItem('motion', v); } catch { /* the switch still works for this visit */ } };
  function showMotion() {
    const device = reduceQuery.matches;
    const on = !device && root.dataset.motion === 'on';
    btn.textContent = device ? 'Motion: off (device setting)' : `Motion: ${on ? 'on' : 'off'}`;
    btn.setAttribute('aria-pressed', String(on));
    btn.disabled = device;
  }
  btn.addEventListener('click', () => {
    root.dataset.motion = root.dataset.motion === 'on' ? 'off' : 'on';
    store(root.dataset.motion);
    showMotion();
  });
  reduceQuery.addEventListener('change', () => {
    root.dataset.motion = reduceQuery.matches || stored() === 'off' ? 'off' : 'on';
    showMotion();
  });
  showMotion();

  /* ---------- Glow stops once hero + Rise no longer fill the bottom of the screen ---------- */
  const top = $('.top');
  if (top) new IntersectionObserver(([e]) => root.classList.toggle('glow-away', !e.isIntersecting), { rootMargin: '-99% 0px 0px 0px' }).observe(top);

  /* ---------- Headings fade in once ---------- */
  const fades = new IntersectionObserver((list) => {
    for (const e of list) if (e.isIntersecting) { e.target.classList.add('seen'); fades.unobserve(e.target); }
  }, { threshold: 0.2 });
  // Only headings below the first screen at load wait (D47): with no JS, a failed script or print, every phrase shows.
  document.querySelectorAll('.fade').forEach((n) => {
    if (n.getBoundingClientRect().top >= innerHeight) n.classList.add('fade-wait');
    fades.observe(n);
  });

  /* ---------- Sign-up: posts to our own server. Without JS the form posts normally. ---------- */
  const form = $('#signup');
  if (form) {
    const status = $('#signup-status');
    const email = form.elements.email;
    const bad = (msg) => { status.textContent = msg; email.setAttribute('aria-invalid', 'true'); };
    email.addEventListener('input', () => email.removeAttribute('aria-invalid'));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const value = email.value.trim();
      if (!form.checkValidity()) { bad('Enter an email like name@example.com.'); return; }
      try {
        const res = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: new URLSearchParams({ email: value, website: form.elements.website?.value ?? '' }) });
        if (res.ok) { status.textContent = "You're on the list."; form.reset(); }
        else if (res.status === 400 || res.status === 422) bad('Enter an email like name@example.com.');
        else status.textContent = "That didn't go through. Try again.";
      } catch { status.textContent = "That didn't go through. Try again."; }
    });
  }

  /* ---------- Latest video: a plain link until tapped, then the privacy-enhanced player ---------- */
  document.querySelectorAll('a[data-yt]').forEach((yt) => {
    if (!/^[\w-]{11}$/.test(yt.dataset.yt)) return;
    yt.addEventListener('click', (e) => {
      e.preventDefault();
      const f = document.createElement('iframe');
      f.className = 'yt';
      f.src = `https://www.youtube-nocookie.com/embed/${yt.dataset.yt}?autoplay=1&rel=0`;
      f.title = yt.dataset.title || 'Latest video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      f.style.aspectRatio = '16 / 9';
      yt.replaceWith(f);
      f.focus();
    });
  });

  /* Swipe row: a focused card scrolls fully into view (instant, no smooth motion) */
  document.querySelectorAll('.v2-vrow').forEach((r) => r.addEventListener('focusin', (e) => e.target.closest('.v2-vid')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })));

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
