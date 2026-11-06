// Prototype behaviour. Nothing here uses innerHTML: every value goes in through textContent or a checked attribute.
(() => {
  const root = document.documentElement;
  const q = new URLSearchParams(location.search);
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  /* ---------- Era: colors go in as custom properties, one place only ---------- */
  const HEX = /^#[0-9a-f]{6}$/i;
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
  // Duotone ceiling: the brightest a tinted photo can get is bg mixed toward accent, stopping where text still has
  // 4:1. So text over any photo passes the 3:1 large-text rule by construction, in any era, whatever the photo.
  function peak(bg, accent, text) {
    for (let t = 1; t > 0; t -= 0.01) {
      const c = bg.map((b, i) => b + (accent[i] - b) * t);
      if (ratio(text, c) >= 4) return c;
    }
    return bg;
  }
  function applyEra(era) {
    for (const [k, v] of Object.entries(era.colors)) if (HEX.test(v)) root.style.setProperty(`--${k}`, v);
    // True duotone from existing roles: bg in the shadows, capped accent at the peak.
    const lo = rgb(era.colors.bg);
    const hi = peak(lo, rgb(era.colors.accent), rgb(era.colors.text));
    ['duoR', 'duoG', 'duoB'].forEach((id, i) => $(`#${id}`).setAttribute('tableValues', `${lo[i].toFixed(3)} ${hi[i].toFixed(3)}`));
    $('#era-name').textContent = era.name;
  }
  const eraSlug = Object.hasOwn(GL.eras, q.get('era') ?? '') ? q.get('era') : 'placeholder';
  applyEra(GL.eras[eraSlug]);
  // Prototype-only: a guessed era says so on the hero chip and in the footer note.
  const label = GL.eraLabels[eraSlug];
  if (label) {
    $('.hero-chip').textContent = label.chip;
    $('.hero-chip').classList.add('is-long');
    $('#era-line').textContent = label.note;
  }

  /* ---------- Hero test switches. The markup is the D34 default (ab); ?hero=a / ?hero=b put their own images back. ---------- */
  if (root.dataset.hero === 'a') { // A at every width: from 900px the landscape (a) file instead of the GIF
    const src = $('.hero-photo source[data-ab]');
    src.setAttribute('sizes', '100vw');
    src.setAttribute('width', '1600');
    src.setAttribute('height', '1067');
    src.setAttribute('srcset', 'assets/a-era-grade-800.webp 800w, assets/a-era-grade-1600.webp 1600w');
  }
  if (root.dataset.hero === 'b') { // B at every width: under 900px the slot gets (f), the MCCC still printed in two inks
    const img = $('.slot img');
    img.setAttribute('sizes', '34vw'); // the slot is about 132px square at 390: pick the file nearest it (halftone, no moire)
    img.setAttribute('srcset', 'assets/f-mccc-240.webp 240w, assets/f-mccc-478.webp 478w');
    img.setAttribute('src', 'assets/f-mccc-478.webp');
  }

  /* ---------- Shows ---------- */
  const action = (s) => {
    if (!s.link) return null; // no link, no button
    const a = el('a', 'btn btn-show', s.type === 'show' ? 'Tickets' : 'Details');
    a.href = s.link;
    a.rel = 'noopener';
    return a;
  };
  const place = (s) => `${s.venue}, ${s.city}`;
  // Round 2 (D53, DESIGN 16c): Add to calendar. The build links /shows/{date}-{venue-slug}.ics (server-made, escaped);
  // the prototype links one sample file. A glyph beside the date (poster: a stamped square), the full name for screen readers.
  const SVGNS = 'http://www.w3.org/2000/svg';
  const calIcon = () => { const s = document.createElementNS(SVGNS, 'svg'); s.setAttribute('class', 'cal-icon'); s.setAttribute('aria-hidden', 'true'); const u = document.createElementNS(SVGNS, 'use'); u.setAttribute('href', '#i-cal'); s.append(u); return s; };
  function cal(s, words) {
    const a = el('a', words ? 'cal-link' : 'cal-btn');
    a.href = 'assets/sample-show.ics';
    a.setAttribute('aria-label', `Add ${s.venue} on ${s.date} to your calendar`);
    a.append(calIcon());
    return a;
  }

  // The poster's art: treatment (c), the gig-poster cut (one ink, coarse screen, torn bottom edge). Halftone, so it is
  // screened at 600 and 1000px and `sizes` matches the slot: about half the width on phones, 23rem when the card is wide.
  function posterArt() {
    const pic = el('picture');
    const img = el('img', 'poster-art graded');
    img.setAttribute('src', 'assets/c-poster-600.webp');
    img.setAttribute('srcset', 'assets/c-poster-600.webp 600w, assets/c-poster-1000.webp 1000w');
    img.setAttribute('sizes', '(min-width: 640px) 23rem, 50vw');
    img.setAttribute('width', '600');
    img.setAttribute('height', '750');
    img.setAttribute('alt', '');
    img.setAttribute('loading', 'lazy');
    pic.append(img);
    return pic;
  }
  function poster(s) {
    const li = el('li', 'poster');
    li.append(posterArt());
    const date = el('p', 'poster-date fit');
    date.append(el('span', 'ln ln-date', s.date));
    li.append(date, el('p', 'poster-place', place(s)));
    const meta = el('p', 'poster-meta');
    meta.textContent = [s.time, s.with && `With ${s.with}`].filter(Boolean).join(', ');
    li.append(meta);
    const b = action(s);
    if (b) li.append(b);
    li.append(cal(s, true));
    li.append(el('span', 'ph-chip ph-chip-dark', 'Placeholder show'));
    return li;
  }
  function row(s, past = false) {
    const li = el('li', 'row');
    li.append(el('span', 'row-date', s.date));
    if (!past) li.append(cal(s, false)); // Played rows: no calendar (past shows have no .ics)
    const t = el('span', 'row-text');
    t.append(el('span', 'row-place', place(s)));
    t.append(el('span', 'row-kind', s.type === 'open-mic' ? 'Open mic' : 'Show'));
    li.append(t);
    const b = action(s);
    if (b) li.append(b);
    return li;
  }
  function playedList() {
    const box = el('div', 'played');
    box.append(el('h3', '', 'Played'));
    const ul = el('ul', 'rows');
    GL.played.forEach((s) => ul.append(row(s, true)));
    box.append(ul);
    return box;
  }
  function renderShows() {
    const mount = $('#shows-mount');
    if (root.dataset.shows === 'none') {
      const box = el('div', 'empty');
      box.append(el('p', 'empty-line', 'No shows booked right now'));
      const act = el('div', 'empty-actions');
      const follow = el('a', 'btn btn-solid', 'Follow');
      follow.href = 'https://www.instagram.com/glucakofficial/';
      follow.rel = 'noopener';
      const req = el('a', 'btn btn-line pending', 'Request a show');
      req.href = '#shows';
      req.title = 'Needs the booking email';
      act.append(follow, req);
      box.append(act, playedList());
      mount.append(box);
      return;
    }
    const [first, ...rest] = GL.shows;
    const ul = el('ul', 'shows');
    ul.append(poster(first));
    rest.slice(0, 2).forEach((s) => ul.append(row(s)));
    mount.append(ul);
    const all = el('a', 'text-link pending', 'All shows');
    all.href = '#shows';
    all.title = 'Shows page comes with the build';
    mount.append(all);
  }
  renderShows();

  /* ---------- IDENTITY: state by date, New York time, worked out once per load (never ticks) ---------- */
  function identityState() {
    const RELEASE = '2027-08-13'; // Gabe's own post (HANDOFF). The build reads it from releases.json.
    const when = $('#identity-when'), presave = $('#identity-presave');
    const mode = q.get('identity');
    if (mode === 'none') { when.remove(); presave.remove(); return; } // no date: the name only
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
    const utc = (d) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));
    const days = mode === 'out' ? 0 : Math.round((utc(RELEASE) - utc(today)) / 864e5);
    if (days <= 0) {
      const listen = el('a', 'text-link', 'Listen');
      listen.href = 'https://wingsmusic.lnk.to/IDENTITY';
      listen.rel = 'noopener';
      when.replaceChildren('Out now. ', listen);
      presave.remove();
      return;
    }
    $('#identity-days').textContent = `${days} ${days === 1 ? 'day' : 'days'}`;
  }
  identityState();

  /* ---------- Header goes solid once the page moves. Phone menu closes on Escape or a link. ---------- */
  const header = $('.site-header');
  new IntersectionObserver(([e]) => header.classList.toggle('is-solid', !e.isIntersecting)).observe($('.sentinel'));
  const menu = $('.nav-mobile');
  const summary = menu.querySelector('summary');
  menu.addEventListener('toggle', () => { if (menu.open) menu.querySelector('.sheet a').focus(); });
  menu.addEventListener('click', (e) => { if (e.target.closest('.sheet a')) menu.open = false; });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.open) { menu.open = false; summary.focus(); } });

  /* ---------- Motion ---------- */
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

  // The glow only runs while hero + Rise still fill the bottom of the screen. It stops before the next heading can
  // fade in, so it is never a second moving thing.
  new IntersectionObserver(([e]) => root.classList.toggle('glow-away', !e.isIntersecting), { rootMargin: '-99% 0px 0px 0px' }).observe($('.top'));

  // Headings fade in once, the first time they reach the screen.
  const fades = new IntersectionObserver((list) => {
    for (const e of list) if (e.isIntersecting) { e.target.classList.add('seen'); fades.unobserve(e.target); }
  }, { threshold: 0.2 });
  document.querySelectorAll('.fade').forEach((n) => fades.observe(n));

  /* ---------- Sign-up: the real form posts to our server; here nothing leaves the page ---------- */
  $('#signup').addEventListener('submit', (e) => {
    e.preventDefault();
    $('#signup-status').textContent = 'Prototype: nothing was sent.';
  });

  $('#year').textContent = String(new Date().getFullYear());
})();
