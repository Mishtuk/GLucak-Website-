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
  if (header && sentinel) new IntersectionObserver(([e]) => header.classList.toggle('is-condensed', !e.isIntersecting)).observe(sentinel); // DESIGN 30b: 900px+ CSS shrinks the bar
  const menu = $('.nav-mobile');
  if (menu) {
    const summary = menu.querySelector('summary');
    menu.addEventListener('toggle', () => { if (menu.open) requestAnimationFrame(() => menu.querySelector('.sheet a')?.focus()); });
    menu.addEventListener('click', (e) => { if (e.target.closest('.sheet a')) menu.open = false; });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.open) { menu.open = false; summary.focus(); } });
  }

  /* ---------- Motion switch ---------- */
  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const btn = $('#motion');
  const stored = () => { try { return localStorage.getItem('motion'); } catch { return null; } };
  const store = (v) => { try { localStorage.setItem('motion', v); } catch { /* the switch still works for this visit */ } };
  /* Home film (owner 2026-11-18): Gabe's music videos, slowed, gray, two inks from CSS. Plays only while Motion is on (never under
     reduced motion); preload none, so nothing downloads otherwise. The still hero stays until the first frame plays. */
  const film = $('.hero-film video');
  const filmBtn = $('.film-btn');
  const filmSync = () => { if (filmBtn) filmBtn.textContent = film.paused ? 'Play video' : 'Pause video'; };
  if (film) {
    const hero = film.closest('.hero');
    film.addEventListener('playing', () => { hero.classList.add('film-on'); if (filmBtn) filmBtn.hidden = false; filmSync(); });
    film.addEventListener('pause', filmSync);
    // A visitor's pause holds through Motion changes (data-stopped).
    filmBtn?.addEventListener('click', () => { if (film.paused) { delete film.dataset.stopped; film.play().catch(() => {}); } else { film.dataset.stopped = '1'; film.pause(); } });
  }
  function runFilm(on) {
    if (!film) return;
    if (on) { if (!film.dataset.stopped) film.play().catch(() => {}); return; }
    film.pause(); film.closest('.hero').classList.remove('film-on'); if (filmBtn) filmBtn.hidden = true;
  }
  function showMotion() {
    const device = reduceQuery.matches;
    const on = !device && root.dataset.motion === 'on';
    runFilm(on);
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

  /* ---------- Palettes (DESIGN 30d): the owner's preview. Shown with ?palettes, or on any page once a palette is stored. Instant swap. ---------- */
  const pal = $('#pal');
  if (pal) {
    const read = () => { try { return localStorage.getItem('palette'); } catch { return null; } };
    const write = (v) => { try { v ? localStorage.setItem('palette', v) : localStorage.removeItem('palette'); } catch { /* this page only */ } };
    const sync = () => {
      const cur = root.dataset.palette || 'identity';
      pal.querySelectorAll('[data-pal]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pal === cur)));
      $('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(root).getPropertyValue('--bg').trim());
    };
    if (true || read()) { pal.hidden = false; sync(); }
    pal.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pal], .pal-reset');
      if (!b) return;
      const v = b.dataset.pal || null; // the reset button has no data-pal
      if (v && v !== 'identity') root.dataset.palette = v; else delete root.dataset.palette;
      write(v); sync();
    });
  }

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
        if (res.ok) { status.textContent = form.dataset.ok || "You’re on the list."; form.reset(); }
        else if (res.status === 400 || res.status === 422) bad('Enter an email like name@example.com.');
        else status.textContent = "That didn’t go through. Try again.";
      } catch { status.textContent = "That didn’t go through. Try again."; }
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
  function stopVideos() { // stops the video that is playing
    for (const [f, old] of buttons) {
      const name = f.nextElementSibling;
      if (name && name.classList.contains('v2-vtitle')) name.remove();
      f.replaceWith(old);
      buttons.delete(f);
    }
  }
  function play(b) {
    stopVideos();
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

  /* Reels (owner 2026-11-18, src/components/Reel.astro): flip one page at a time. Instant unless Motion is on. A flip stops a playing video. */
  document.querySelectorAll('[data-reel]').forEach((reel) => {
    const track = reel.querySelector('.reel-track');
    const slides = [...track.children];
    const picks = [...reel.querySelectorAll('.reel-pick')];
    const now = reel.querySelector('.reel-now');
    const nav = reel.querySelector('.reel-nav');
    const prev = reel.querySelector('.reel-prev');
    const next = reel.querySelector('.reel-next');
    let cur = 0;
    const mark = (i) => {
      cur = i;
      now.textContent = String(i + 1).padStart(2, '0');
      picks.forEach((p, k) => (k === i ? p.setAttribute('aria-current', 'true') : p.removeAttribute('aria-current')));
      prev.disabled = i === 0; next.disabled = i === slides.length - 1;
    };
    const go = (i) => {
      i = Math.max(0, Math.min(slides.length - 1, i));
      if (i !== cur) stopVideos();
      track.scrollTo({ left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: root.dataset.motion === 'on' ? 'smooth' : 'auto' });
      mark(i);
    };
    nav.hidden = slides.length < 2;
    prev.addEventListener('click', () => go(cur - 1));
    next.addEventListener('click', () => go(cur + 1));
    picks.forEach((p, k) => p.addEventListener('click', (e) => { e.preventDefault(); go(k); }));
    track.addEventListener('keydown', (e) => { if (e.target === track && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); go(cur + (e.key === 'ArrowRight' ? 1 : -1)); } });
    let raf = 0; // a swipe: the count follows the page that snapped into place
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const step = slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : 0;
        if (!step) return; // a hidden tab: no layout
        const i = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / step)));
        if (i !== cur) { stopVideos(); mark(i); }
      });
    }, { passive: true });
    track.tabIndex = 0;
    mark(0);
  });

  /* Tabs (Videos page): Music videos / Live. Arrow keys move between tabs. Switching stops a playing video. */
  document.querySelectorAll('.tabs[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const pick = (t, focus) => {
      tabs.forEach((x) => {
        const on = x === t;
        x.setAttribute('aria-selected', String(on));
        if (on) x.removeAttribute('tabindex'); else x.tabIndex = -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
      document.getElementById(t.getAttribute('aria-controls')).querySelectorAll('.reel-track').forEach((tr) => tr.dispatchEvent(new Event('scroll'))); // the count follows where the shown reel is
      stopVideos();
      if (focus) t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => pick(t));
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
    list.hidden = false;
    list.parentElement.classList.add('tabs-on');
    pick(tabs.find((t) => t.getAttribute('aria-selected') === 'true') ?? tabs[0]);
  });

  /* Share a show (DESIGN 28c, D104): the phone's own share sheet; else copy the link; else show it. Same-origin, no motion. */
  const nav = globalThis.navigator;
  if (nav?.share || nav?.clipboard?.writeText) document.querySelectorAll('[data-share]').forEach((b) => {
    b.hidden = false;
    b.addEventListener('click', async () => {
      const url = new URL(b.dataset.share, location.origin).href, msg = b.closest('li')?.querySelector('.share-msg');
      document.querySelectorAll('.share-msg').forEach((m) => { m.textContent = ''; }); // one message on the page at a time
      if (nav.share) { try { await nav.share({ title: b.dataset.title, text: b.dataset.text, url }); return; } catch (e) { if (e.name === 'AbortError') return; } }
      try { await nav.clipboard.writeText(url); if (msg) msg.textContent = 'Link copied'; }
      catch { if (msg) msg.textContent = `Copy this link: ${url}`; }
    });
  });

  /* Swipe row: a focused card scrolls fully into view (instant, no smooth motion) */
  document.querySelectorAll('.v2-vrow').forEach((r) => r.addEventListener('focusin', (e) => e.target.closest('.v2-vid')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })));

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
