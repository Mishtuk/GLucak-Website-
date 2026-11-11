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
    const join = form.querySelector('button[type="submit"]');
    let sending = false; // aria-disabled keeps Join focusable, so a flag (not the attribute) is what stops a second submit
    email.addEventListener('input', () => email.removeAttribute('aria-invalid'));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (sending) return;
      const value = email.value.trim();
      if (!form.checkValidity()) { bad('Enter an email like name@example.com.'); return; }
      sending = true;
      join.setAttribute('aria-disabled', 'true');
      status.textContent = 'Sending…';
      try {
        const res = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: new URLSearchParams({ email: value, website: form.elements.website?.value ?? '' }) });
        if (res.ok) { status.textContent = form.dataset.ok || "You're on the list."; form.reset(); }
        else if (res.status === 400 || res.status === 422) bad('Enter an email like name@example.com.');
        else status.textContent = "That didn't go through. Try again.";
      } catch { status.textContent = "That didn't go through. Try again."; }
      sending = false;
      join.removeAttribute('aria-disabled');
    });
  }

  /* ---------- Videos (DESIGN 26f): a link to YouTube until JS runs; then a Play button; the privacy-enhanced player loads only after a press ---------- */
  const videoOk = (id) => /^[\w-]{11}$/.test(id ?? '');
  const buttons = new Map(); // open iframe -> the button it replaced (one player at a time)
  function makeButton(link) {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Play ${link.dataset.title || 'video'}`);
    b.dataset.yt = link.dataset.yt;
    b.dataset.title = link.dataset.title || '';
    for (const n of link.childNodes) {
      if (n.nodeType === 1 && n.classList.contains('vh')) continue; // the new-tab hint does not apply to a button
      b.append(n.cloneNode(true));
    }
    b.addEventListener('click', () => play(b));
    return b;
  }
  function play(b) {
    for (const [f, old] of buttons) { // stops the video that is playing
      const name = f.nextElementSibling;
      if (name && name.classList.contains('v2-vtitle')) name.remove();
      f.replaceWith(old);
      buttons.delete(f);
    }
    const f = document.createElement('iframe');
    f.className = 'yt';
    f.src = `https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1&rel=0`; // autoplay is set only here, after the press
    f.title = `${b.dataset.title || 'Video'}: video`;
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    f.style.aspectRatio = '16 / 9';
    const name = b.querySelector('.v2-vtitle');
    b.replaceWith(f);
    if (name) f.after(name.cloneNode(true));
    buttons.set(f, b);
    f.focus();
  }
  document.querySelectorAll('a[data-yt]').forEach((a) => {
    if (videoOk(a.dataset.yt)) a.replaceWith(makeButton(a));
  });

  /* Swipe row: a focused card scrolls fully into view (instant, no smooth motion) */
  document.querySelectorAll('.v2-vrow').forEach((r) => r.addEventListener('focusin', (e) => e.target.closest('.v2-vid')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })));

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
