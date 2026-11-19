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
  const motionOn = () => root.dataset.motion === 'on' && !reduceQuery.matches;
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
    layoutHs();
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
  const pinned = (el) => el.closest('.band-crate')?.classList.contains('is-pinned'); // Motion on: the records row is driven by the page scroll
  const centre = (b) => { // a record off-centre is brought forward first
    const row = b.closest('.records'); if (!row || pinned(row)) return false;
    const r = row.getBoundingClientRect(), c = b.getBoundingClientRect();
    const off = c.left + c.width / 2 - (r.left + r.width / 2);
    if (Math.abs(off) <= c.width / 3) return false;
    row.scrollBy({ left: off, behavior: motionOn() ? 'smooth' : 'instant' });
    return true;
  };
  const videoOk = (id) => /^[\w-]{11}$/.test(id ?? '');
  const buttons = new Map(); // open stage iframe -> the button it replaced (one player at a time)
  const dlg = $('#rec-open'), screen = dlg?.querySelector('.ro-screen');
  let opener = null; // the record that opened the dialog
  function makeButton(link) {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `${link.closest('.rec') ? 'Open' : 'Play'} ${link.dataset.title || 'video'}`);
    if (link.dataset.yt != null) b.dataset.yt = link.dataset.yt;
    b.dataset.title = link.dataset.title || '';
    if (link.dataset.meta != null) { b.dataset.meta = link.dataset.meta; b.className = link.className; } // a record
    for (const n of link.childNodes) {
      if (n.nodeType === 1 && n.classList.contains('vh')) continue; // the new-tab hint does not apply to a button
      b.append(n.cloneNode(true));
    }
    b.addEventListener('click', () => { if (b.dataset.meta != null) openRec(b); else load(b); });
    return b;
  }
  function stopVideos() { // stops the video that is playing on the stage
    for (const [f, old] of buttons) {
      const name = f.nextElementSibling;
      if (name && name.classList.contains('v2-vtitle')) name.remove();
      f.replaceWith(old);
      buttons.delete(f);
    }
  }
  const frame = (b) => { // the privacy-enhanced player; autoplay is set only here, after a press
    const f = document.createElement('iframe');
    f.className = 'yt';
    f.src = `https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1&rel=0`;
    f.title = `${b.dataset.title || 'Video'}: video`;
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    f.style.aspectRatio = '16 / 9';
    return f;
  };
  function load(b) { // the Now showing stage plays in place
    stopVideos();
    const f = frame(b), name = b.querySelector('.v2-vtitle');
    b.replaceWith(f);
    if (name) f.after(name.cloneNode(true));
    buttons.set(f, b);
    f.focus();
  }
  // A release on Music (data-rel): the dialog shows its cover; Spotify's player is built only from a validated 22-character id.
  const SPOTIFY = /^\/(?:intl-[a-z]+\/)?(album|track|playlist)\/([A-Za-z0-9]{22})\/?$/;
  const spotifyFrame = (b) => {
    let u; try { u = new URL(b.dataset.href); } catch { return null; }
    const m = u.hostname === 'open.spotify.com' && SPOTIFY.exec(u.pathname);
    if (!m) return null;
    const f = document.createElement('iframe');
    f.src = `https://open.spotify.com/embed/${m[1]}/${m[2]}`;
    f.title = `${b.dataset.title}: Spotify player`;
    f.allow = 'encrypted-media; fullscreen; picture-in-picture';
    f.height = m[1] === 'track' ? '152' : '352';
    return f;
  };
  const extras = (b) => { // the Listen everywhere / Pre-save button (the player comes after the open)
    const a = document.createElement('a'), vh = document.createElement('span');
    a.className = 'btn btn-solid'; a.href = b.dataset.href; a.target = '_blank'; a.rel = 'noopener';
    vh.className = 'vh'; vh.textContent = ' (opens in a new tab)';
    a.append(b.dataset.go, vh);
    dlg.querySelector('.ro-extra').replaceChildren(a);
  };
  const stillOf = (b) => { // the dialog screen: the video's still and the play icon
    if (b.dataset.href != null) { // a release: its cover, or its plain no-cover sleeve
      const nc = b.querySelector('.nocover');
      dlg.querySelectorAll('.ro-extra iframe').forEach((f) => f.remove()); // the player goes, the button stays
      const img = new Image();
      img.alt = '';
      if (nc) { screen.replaceChildren(nc.cloneNode(true)); return null; }
      img.src = b.dataset.cover; screen.replaceChildren(img);
      return img;
    }
    const img = new Image(), icon = document.createElement('span');
    img.className = 'yt-img'; img.alt = '';
    img.srcset = `/GLucak-Website-/media/videos/${b.dataset.yt}-640.webp 640w, /media/videos/${b.dataset.yt}-1280.webp 1280w`;
    img.sizes = '(min-width: 1200px) 1100px, 92vw';
    img.src = `/GLucak-Website-/media/videos/${b.dataset.yt}-640.webp`;
    icon.className = 'yt-play'; icon.setAttribute('aria-hidden', 'true');
    screen.replaceChildren(img, icon);
    return img;
  };
  const named = (el, on) => { el.style.viewTransitionName = on ? 'rec-open' : ''; };
  function openRec(b) { // a record opens over the page: its sleeve turns into the screen
    stopVideos();
    opener = b;
    dlg.querySelector('#ro-title').textContent = b.dataset.title;
    dlg.querySelector('.ro-meta').textContent = b.dataset.meta;
    const rel = b.dataset.href != null, img = stillOf(b), sleeve = b.querySelector('.rec-sleeve');
    if (rel) extras(b);
    const embed = () => {
      if (!dlg.open) return;
      if (!rel) { const f = frame(b); screen.replaceChildren(f); f.focus(); return; }
      const f = spotifyFrame(b);
      if (f) dlg.querySelector('.ro-extra').prepend(f);
    };
    if (document.startViewTransition && motionOn() && sleeve) {
      named(sleeve, true);
      const vt = document.startViewTransition(async () => {
        named(sleeve, false); dlg.showModal(); named(screen, true);
        await Promise.race([img ? img.decode().catch(() => {}) : 0, new Promise((r) => setTimeout(r, 500))]);
      });
      vt.finished.finally(() => { named(screen, false); embed(); });
      return;
    }
    dlg.showModal(); embed();
  }
  function closeRec() {
    if (!dlg.open) return;
    const sleeve = opener?.querySelector('.rec-sleeve');
    stillOf(opener); // takes the iframe away (the sound stops) and shows the still again
    if (document.startViewTransition && motionOn() && sleeve) {
      named(screen, true);
      document.startViewTransition(() => { named(screen, false); dlg.close(); named(sleeve, true); }).finished.finally(() => named(sleeve, false));
      return;
    }
    dlg.close();
  }
  if (dlg) {
    dlg.querySelector('.ro-close').addEventListener('click', closeRec);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) closeRec(); });
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeRec(); }); // Esc takes the same way out
    dlg.addEventListener('close', () => { screen.replaceChildren(); dlg.querySelector('.ro-extra')?.replaceChildren(); opener?.focus(); });
  }
  document.querySelectorAll('a[data-rel]').forEach((a) => { // each release becomes a button that opens the dialog
    const b = makeButton(a);
    b.dataset.href = a.href; b.dataset.go = a.dataset.go; b.dataset.cover = a.dataset.cover ?? ''; b.dataset.meta = a.dataset.meta;
    b.setAttribute('aria-label', `Open ${a.dataset.title}`);
    a.replaceWith(b);
  });
  document.querySelectorAll('a[data-yt]').forEach((a) => {
    if (videoOk(a.dataset.yt)) a.replaceWith(makeButton(a));
  });
  document.querySelectorAll('.band-crate:not(.is-pinned) .records').forEach((row) => { row.scrollLeft = (row.scrollWidth - row.clientWidth) / 2; }); // open on the middle record, neighbours on both sides
  document.querySelectorAll('.records').forEach((row) => row.addEventListener('focusin', (e) => {
    const li = e.target.closest('.rec');
    if (!li) return;
    const s = row.closest('[data-hs]');
    if (!pinned(row)) { centre(e.target); return; }
    const dist = Number(s.dataset.dist) || 0, r = row.getBoundingClientRect(), c = li.getBoundingClientRect();
    const p = dist ? Math.min(1, Math.max(0, (c.left - r.left + row.scrollLeft + c.width / 2 - row.clientWidth / 2) / dist)) : 0;
    scrollTo({ top: s.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(s.firstElementChild).top) || 0) + p * dist, behavior: 'instant' });
  }));

  /* Pinned galleries (owner 2026-11-18, HScroll.astro). Motion on: the strip sticks and scrolling down slides it sideways, coupled to
     the scroll (nothing moves on its own). Motion off / reduced / unsupported: a plain swipe row. Run by showMotion() and on resize. */
  function layoutHs() {
    const on = motionOn();
    document.querySelectorAll('[data-hs]').forEach((s) => {
      const row = s.dataset.hs === 'row'; // the Videos records: the pin is the band's wrap, and the row scrolls itself
      const pin = row ? s.firstElementChild : s.querySelector('.hs-pin'), track = row ? s.querySelector('.records') : s.querySelector('.hs-track');
      track.style.translate = '';
      s.classList.toggle('is-pinned', on);
      if (!on) { s.style.height = ''; return; }
      const dist = Math.max(0, track.scrollWidth - (row ? track.clientWidth : pin.clientWidth));
      s.dataset.dist = String(dist);
      s.style.height = `${pin.offsetHeight + dist}px`;
    });
    moveHs();
  }
  function moveHs() {
    document.querySelectorAll('[data-hs].is-pinned').forEach((s) => {
      const dist = Number(s.dataset.dist) || 0;
      const top = parseFloat(getComputedStyle(s.querySelector('.hs-pin') || s.firstElementChild).top) || 0;
      const p = dist ? Math.min(1, Math.max(0, (top - s.getBoundingClientRect().top) / dist)) : 0;
      if (s.dataset.hs === 'row') s.querySelector('.records').scrollLeft = p * dist;
      else s.querySelector('.hs-track').style.translate = `${(-p * dist).toFixed(1)}px 0`;
    });
  }
  if (document.querySelector('[data-hs]')) {
    let raf = 0;
    addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(moveHs); }, { passive: true });
    addEventListener('resize', layoutHs);
    addEventListener('load', layoutHs);
    // Keyboard: a focused item off to the side scrolls the page to where the strip shows it.
    document.querySelectorAll('[data-hs]').forEach((s) => s.addEventListener('focusin', (e) => {
      const li = e.target.closest('.hs-track > li');
      if (!li || !s.classList.contains('is-pinned')) return;
      const pin = s.querySelector('.hs-pin'), dist = Number(s.dataset.dist) || 0;
      const p = dist ? Math.min(1, Math.max(0, (li.offsetLeft + li.offsetWidth / 2 - pin.clientWidth / 2) / dist)) : 0;
      const top = parseFloat(getComputedStyle(pin).top) || 0;
      scrollTo({ top: s.getBoundingClientRect().top + scrollY - top + p * dist, behavior: 'instant' });
    }));
  }

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
