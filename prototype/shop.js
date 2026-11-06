// Shop prototype (L2, DESIGN.md section 14). Builds the same markup src/lib/products.js prints, plus the L2 additions
// (data-status, the tape, the status modifier class). No innerHTML: every value goes in through textContent or a
// checked attribute. Switches: ?shop=samples (default) | mixed | empty, ?open=no, ?era=<slug>.
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

  /* ---------- Era: same as app.js, colors only ---------- */
  const HEX = /^#[0-9a-f]{6}$/i;
  const eraSlug = Object.hasOwn(GL.eras, q.get('era') ?? '') ? q.get('era') : 'placeholder';
  const era = GL.eras[eraSlug];
  for (const [k, v] of Object.entries(era.colors)) if (HEX.test(v)) root.style.setProperty(`--${k}`, v);
  $('#era-name').textContent = era.name;
  if (GL.eraLabels[eraSlug]) $('#era-line').textContent = GL.eraLabels[eraSlug].note;

  /* ---------- The products renderer: mirrors src/lib/products.js ---------- */
  const price = (cents) => (cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`);
  const buyable = (p) => p.status === 'available' && Boolean(p.link);
  const statusText = (p) => (p.status === 'sold-out' ? 'Sold out' : buyable(p) ? 'Available' : 'Coming soon');
  // L2: the glyph class. Sample and Available-without-a-link read "Coming soon", so they get its glyph too.
  const statusClass = (p) => (p.status === 'sold-out' ? 'is-sold-out' : buyable(p) ? 'is-available' : 'is-coming-soon');
  // L2: the tape on the picture. Words the page already uses ("Sample:" in every sample name, "Sold out").
  const tapeText = (p) => (p.status === 'sample' ? 'Sample' : p.status === 'sold-out' ? 'Sold out' : null);
  const safeUrl = (u) => { try { return ['http:', 'https:'].includes(new URL(u).protocol) ? u : null; } catch { return null; } };

  // D41 F4: on the card alt="" (the name is already the link's text); the detail picture keeps alt = name.
  function media(p, alt = p.name) {
    const img = el('img', 'product-media');
    img.setAttribute('src', p.image);
    img.setAttribute('alt', alt);
    img.setAttribute('width', '600');
    img.setAttribute('height', '600');
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    return img;
  }
  function tape(p) {
    const t = tapeText(p);
    if (!t) return [];
    const s = el('span', 'product-tape', t);
    s.setAttribute('aria-hidden', 'true'); // the name and the status line already say it
    return [s];
  }
  const priceLine = (p) => (p.status === 'sample' ? [] : [el('p', 'product-price', price(p.price))]); // D37
  const status = (p) => el('p', `product-status ${statusClass(p)}`, statusText(p));

  function card(p) {
    const li = el('li', 'product-card');
    li.dataset.status = p.status;
    const a = el('a', 'product-link');
    a.href = `#product-${p.id}`;
    a.append(media(p, ''), ...tape(p), el('p', 'product-name', p.name), ...priceLine(p), status(p));
    li.append(a);
    return li;
  }
  function detail(p) {
    const art = el('article', 'product-detail');
    art.id = `product-${p.id}`;
    art.dataset.status = p.status;
    const body = el('div', 'product-body');
    body.append(el('h2', 'product-name', p.name), ...priceLine(p));
    if (p.description) body.append(el('p', 'product-desc', p.description));
    if (p.sizes?.length) body.append(el('p', 'product-sizes', `Sizes: ${p.sizes.join(', ')}`));
    const link = buyable(p) && safeUrl(p.link);
    if (link) {
      const buy = el('a', 'btn btn-solid product-buy', 'Buy');
      buy.href = link;
      buy.rel = 'noopener';
      body.append(buy, el('p', 'product-note', "You pay on the store's own page. We never see your card details."));
    } else body.append(status(p));
    // a11y audit row 10 (2.4.3, DESIGN 17c): the way back to the grid, last in the detail. #h-shop is the page's h1, so
    // the :target moves off the detail (it hides) and the page lands on MERCH with the grid under it.
    const back = el('a', 'text-link product-back', 'Back to all merch');
    back.href = '#h-shop';
    body.append(back);
    art.append(media(p), ...tape(p), body);
    return art;
  }

  function render() {
    const mount = $('#shop-mount');
    const mode = q.get('shop');
    const list = (mode === 'empty' ? [] : mode === 'mixed' ? GL.demoProducts : GL.products).slice().sort((a, b) => a.order - b.order);
    if (q.get('open') === 'no') {
      const p = el('p', 'shop-preview');
      p.append(el('span', 'ph-chip inline', 'Preview: the shop is not open yet'));
      mount.append(p);
    }
    if (!list.length) { mount.append(el('p', 'shop-empty', 'Nothing in the shop yet.')); return; }
    if (list.every((p) => p.status === 'sample')) {
      const b = el('p', 'shop-banner', "This shop is a preview. Everything here is a sample and can't be bought.");
      b.setAttribute('role', 'note');
      mount.append(b);
    }
    if (mode === 'mixed') { const d = el('p', 'shop-demo'); d.append(el('span', 'ph-chip inline', 'Prototype examples of each state, not products')); mount.append(d); }
    const ul = el('ul', 'shop-grid');
    list.forEach((p) => ul.append(card(p)));
    const details = el('div', 'shop-details');
    list.forEach((p) => details.append(detail(p)));
    mount.append(ul, details);
  }
  render();

  // Shop switched off (?open=no): nav and footer lose Shop, the phone bar gets Watch back (D8).
  if (q.get('open') === 'no') {
    document.querySelectorAll('.nav-shop, .footer-shop').forEach((n) => n.remove());
    $('.ln-close').classList.remove('ln-close-shop');
    $('#bar-shop').hidden = true;
    $('#bar-watch').hidden = false;
  }

  // The fragment target exists only after render, so jump again once it's there (a real server prints it in the HTML).
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();

  /* ---------- Menu and Motion: same behaviour as app.js ---------- */
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
