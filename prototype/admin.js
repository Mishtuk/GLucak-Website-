// Admin console prototype (L2, DESIGN.md section 15). Same structure and copy as public/js/edit.js, with the L2 look:
// collapsed rows (head + actions) that open into the editor form, message states (data-state), the photo upload button
// and its "Uploading…" line, disabled Move up / Move down at the ends. No server: sign-in, save and upload are faked here.
// Every value goes in through textContent / value / a checked attribute. No innerHTML.
(() => {
  const root = document.documentElement;
  const q = new URLSearchParams(location.search);
  const $ = (id) => document.getElementById(id);

  /* ---------- Era colors (same as app.js) ---------- */
  const HEX = /^#[0-9a-f]{6}$/i;
  const eraSlug = Object.hasOwn(GL.eras, q.get('era') ?? '') ? q.get('era') : 'placeholder';
  for (const [k, v] of Object.entries(GL.eras[eraSlug].colors)) if (HEX.test(v)) root.style.setProperty(`--${k}`, v);

  const login = $('login'), editor = $('editor'), loginMsg = $('login-msg');
  // L2: every message line carries its state: dirty | busy | ok | error (CSS draws the glyph and the paper box).
  const say = (node, text, state = '') => { node.textContent = text; if (state) node.dataset.state = state; else delete node.dataset.state; };
  let uid = 0;
  const T = {
    shows: { list: $('list'), msg: $('msg'), dirty: false, noun: ['show', 'shows'], label: 'Show' },
    products: { list: $('p-list'), msg: $('p-msg'), dirty: false, noun: ['product', 'products'], label: 'Product' },
  };
  const anyDirty = () => T.shows.dirty || T.products.dirty;

  function el(tag, props = {}, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) if (k === 'class') e.className = v; else e[k] = v;
    e.append(...kids);
    return e;
  }
  function field(label, input, hint) {
    input.id = `f${++uid}`;
    const wrap = el('div', { class: 'ed-field' }, el('label', { htmlFor: input.id, textContent: label }), input);
    if (hint) {
      const h = el('span', { class: 'ed-hint', id: `${input.id}-hint`, textContent: hint });
      input.setAttribute('aria-describedby', h.id);
      wrap.append(h);
    }
    return wrap;
  }
  const select = (options, value) => {
    const s = el('select', {}, ...options.map(([v, text]) => el('option', { value: v, textContent: text })));
    s.value = options.some(([v]) => v === value) ? value : options[0][0];
    return s;
  };

  function changed(kind) { T[kind].dirty = true; say(T[kind].msg, 'Not saved yet.', 'dirty'); }
  const rows = (kind) => [...T[kind].list.children];
  const EMPTY = { shows: 'No shows yet. Press Add show.', products: 'No products yet. Press Add product.' };
  function number(kind) {
    const list = rows(kind);
    list.forEach((r, i) => {
      say(r.num, `${T[kind].label} ${i + 1}`);
      say(r.legend, `${T[kind].label} ${i + 1}`);
      // L2: Move up on the first row and Move down on the last are disabled, never a button that does nothing.
      if (r.up) { r.up.disabled = i === 0; r.down.disabled = i === list.length - 1; }
    });
    const t = T[kind];
    t.empty ??= t.list.insertAdjacentElement('beforebegin', el('p', { class: 'ed-help ed-empty', textContent: EMPTY[kind] }));
    t.empty.hidden = list.length > 0;
  }

  // The collapsed row: head (number, title, meta, error) + actions; Edit opens the form under it.
  function shell(kind, { thumb, date, title, meta }) {
    const li = el('li', { class: 'ed-row' });
    const num = el('p', { class: 'ed-row-num' }), ttl = el('p', { class: 'ed-row-title' }), mt = el('p', { class: 'ed-row-meta' });
    const err = el('p', { class: 'ed-err', role: 'alert' });
    const lead = thumb ?? el('p', { class: 'ed-row-date' });
    const head = el('div', { class: 'ed-row-head' }, lead, el('div', { class: 'ed-row-text' }, num, ttl, mt), err);
    const legend = el('legend', { class: 'vh' });
    const form = el('fieldset', { class: 'ed-form', hidden: true, id: `form-${++uid}` }, legend);
    const edit = el('button', { type: 'button', class: 'ed-btn ed-edit', textContent: 'Edit' });
    edit.setAttribute('aria-expanded', 'false');
    edit.setAttribute('aria-controls', form.id);
    const del = el('button', { type: 'button', class: 'ed-btn ed-del', textContent: 'Delete' });
    const actions = el('div', { class: 'ed-actions' });
    li.append(head, actions, form);
    Object.assign(li, { num, legend, err, form, edit, actions, lead });
    li.setTitle = (t) => say(ttl, t);
    li.setMeta = (...parts) => mt.replaceChildren(...parts);
    li.open = (on) => { form.hidden = !on; edit.setAttribute('aria-expanded', String(on)); li.classList.toggle('is-open', on); };
    edit.addEventListener('click', () => { const on = form.hidden; li.open(on); if (on) form.querySelector('input,select,textarea')?.focus(); });
    del.addEventListener('click', () => {
      if (!confirm(`Delete ${li.whatName()}? It goes away when you press Save.`)) return;
      li.remove(); changed(kind); number(kind);
    });
    li.del = del;
    if (date) say(lead, date);
    if (title) li.setTitle(title);
    if (meta) li.setMeta(meta);
    return li;
  }

  /* ---------- Shows ---------- */
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
  const shortDate = (d) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return ''; const [y, m, day] = d.split('-').map(Number); return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }); };
  function showRow(s = {}) {
    const li = shell('shows', {});
    const date = el('input', { type: 'date', required: true, value: s.date ?? '' });
    const time = el('input', { type: 'time', value: s.time ?? '' });
    const type = select([['show', 'Show'], ['open-mic', 'Open mic']], s.type);
    const venue = el('input', { required: true, maxLength: 300, value: s.venue ?? '' });
    const city = el('input', { required: true, maxLength: 300, value: s.city ?? '', placeholder: 'Doylestown, PA' });
    const withIn = el('input', { maxLength: 300, value: s.with ?? '' });
    const link = el('input', { type: 'url', inputMode: 'url', maxLength: 300, value: s.link ?? '', placeholder: 'https://' });
    li.form.append(el('div', { class: 'ed-two' }, field('Date', date), field('Time (optional)', time)),
      field('Type', type), field('Venue', venue), field('City', city),
      field('With (optional)', withIn, 'Another act on the bill'), field('Link (optional)', link, 'Tickets or details page'));
    li.actions.append(li.edit, li.del);
    li.whatName = () => venue.value.trim() || 'this show';
    const sync = () => {
      say(li.lead, shortDate(date.value));
      li.setTitle(venue.value.trim()); // empty until typed: the row number ("Show 1") names it, no invented copy
      const past = Boolean(date.value) && date.value < today();
      li.classList.toggle('past', past);
      const kind = type.value === 'open-mic' ? 'Open mic' : 'Show';
      li.setMeta(...[city.value.trim() ? `${city.value.trim()}, ${kind}` : kind].map((t) => el('span', { textContent: t })), ...(past ? [el('span', { class: 'ed-tag', textContent: 'Played' })] : []));
    };
    li.form.addEventListener('input', sync);
    li.form.addEventListener('change', sync);
    sync();
    return li;
  }

  /* ---------- Products ---------- */
  const TYPES = [['shirt', 'Shirt'], ['hoodie', 'Hoodie'], ['cd', 'CD'], ['vinyl', 'Vinyl'], ['sticker', 'Sticker'], ['other', 'Other']];
  const STATUSES = [['coming-soon', 'Coming soon'], ['available', 'Available (shows Buy once it has a Link)'], ['sold-out', 'Sold out'], ['sample', 'Sample (shows Coming soon, no price)']];
  const SHORT = { 'coming-soon': 'Coming soon', available: 'Available', 'sold-out': 'Sold out', sample: 'Sample' };
  const GLYPH = { 'coming-soon': 'is-coming-soon', available: 'is-available', 'sold-out': 'is-sold-out', sample: 'is-sample' };
  const UPLOADABLE = ['image/jpeg', 'image/png', 'image/webp'];
  const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '');

  function productRow(p = {}) {
    const pic = el('img', { class: 'ed-thumb', alt: '', width: 64, height: 64 });
    const li = shell('products', { thumb: pic });
    const name = el('input', { required: true, maxLength: 120, value: p.name ?? '' });
    const id = el('input', { required: true, maxLength: 60, value: p.id ?? '', autocapitalize: 'none', spellcheck: false });
    let autoId = !p.id;
    name.addEventListener('input', () => { if (autoId) id.value = slug(name.value); });
    id.addEventListener('input', () => { autoId = false; });
    const type = select(TYPES, p.type);
    // L2: Status is four radio rows, not a <select>: the copy's option labels are long ("Sample (shows Coming soon, no
    // price)") and a phone's closed select cuts them off. Each row is a 52px label, the whole row is the target.
    const statusName = `st${++uid}`;
    const radios = STATUSES.map(([v, text]) => {
      const r = el('input', { type: 'radio', name: statusName, value: v, checked: v === (STATUSES.some(([s]) => s === p.status) ? p.status : STATUSES[0][0]) });
      return el('label', { class: 'ed-choice' }, r, el('span', { textContent: text }));
    });
    const statusBox = el('fieldset', { class: 'ed-choices' }, el('legend', { textContent: 'Status' }), ...radios);
    const status = { get value() { return statusBox.querySelector('input:checked')?.value ?? STATUSES[0][0]; } };
    const price = el('input', { type: 'number', min: 0, max: 1000, step: '0.01', inputMode: 'decimal', required: true, value: Number.isInteger(p.price) ? (p.price / 100).toFixed(2) : '' });
    const image = el('input', { maxLength: 200, value: p.image ?? '', spellcheck: false, placeholder: '/media/uploads/...' });
    const big = el('img', { class: 'ed-pic', alt: '', width: 120, height: 120 });
    const showPic = (src) => { for (const i of [pic, big]) if (src) i.src = src; else i.removeAttribute('src'); };
    showPic(p.image);
    // L2: the upload is a big button (the label), the real file input lies over it at opacity 0, so the whole button is
    // the tap target and the native "No file chosen" text never shows. While it uploads: the "Uploading…" busy line only
    // (D41 F2: no progress bar; the build keeps its fetch upload).
    const file = el('input', { type: 'file', class: 'ed-file-input', accept: UPLOADABLE.join(',') });
    file.id = `f${++uid}`;
    const fileLabel = el('label', { class: 'ed-btn ed-file', htmlFor: file.id, textContent: 'Upload a photo' });
    const fileHint = el('span', { class: 'ed-hint', id: `${file.id}-hint`, textContent: 'JPG, PNG or WebP, up to 5 MB.' });
    file.setAttribute('aria-describedby', fileHint.id);
    const upMsg = el('span', { class: 'ed-hint ed-upmsg', role: 'status' });
    const upload = el('div', { class: 'ed-upload' }, big,
      el('div', { class: 'ed-upload-side' }, el('span', { class: 'ed-file-wrap' }, fileLabel, file), fileHint, upMsg));
    li.uploadState = (state) => {
      if (state === 'busy') say(upMsg, 'Uploading…', 'busy');
      if (state === 'error') say(upMsg, 'That photo is over 5 MB. Pick a smaller one.', 'error');
      if (state === 'done') say(upMsg, 'Uploaded. Press Save to keep it.', 'ok');
    };
    file.addEventListener('change', () => {
      const f = file.files[0];
      if (!f) return;
      if (!UPLOADABLE.includes(f.type)) return say(upMsg, 'Pick a JPG, PNG or WebP photo.', 'error');
      if (f.size > 5 * 1024 * 1024) return say(upMsg, 'That photo is over 5 MB. Pick a smaller one.', 'error');
      li.uploadState('busy');
      // Fake server round trip; the picture shows once "uploaded" (data: URL, allowed by the CSP's img-src).
      const r = new FileReader();
      r.onload = () => setTimeout(() => { showPic(String(r.result)); image.value = '/media/uploads/0123456789abcdef0123456789abcdef.webp'; li.uploadState('done'); changed('products'); }, 800);
      r.readAsDataURL(f);
      file.value = '';
    });
    const desc = el('textarea', { maxLength: 600, value: p.description ?? '', rows: 4 });
    const link = el('input', { type: 'url', inputMode: 'url', maxLength: 500, value: p.link ?? '', placeholder: 'https://' });
    const sizes = el('input', { maxLength: 200, value: (p.sizes ?? []).join(', '), placeholder: 'S, M, L, XL' });
    li.form.append(field('Name', name), field('Short name', id, 'Lowercase letters, numbers and dashes. It fills in from the name; leave it unless you need to change it.'),
      el('div', { class: 'ed-two' }, field('Type', type), field('Price (US dollars)', price, 'Like 25 or 25.00')),
      statusBox, field('Photo', image, 'Filled in when you upload a photo below. Leave it as it is.'), upload,
      field('Description (optional)', desc, 'Up to 600 characters'),
      field('Link (optional)', link, 'Where fans buy it: the product page on your store. Needed for the Buy button.'),
      field('Sizes (optional)', sizes, 'Separate with commas, like S, M, L, XL.'));
    const up = el('button', { type: 'button', class: 'ed-btn', textContent: 'Move up' });
    const down = el('button', { type: 'button', class: 'ed-btn', textContent: 'Move down' });
    li.actions.append(up, down, li.edit, li.del);
    li.actions.classList.add('ed-actions-4');
    Object.assign(li, { up, down });
    li.whatName = () => name.value.trim() || 'this product';
    const move = (dir) => {
      const other = dir < 0 ? li.previousElementSibling : li.nextElementSibling;
      if (!other) return;
      if (dir < 0) other.before(li); else other.after(li);
      number('products');
      changed('products');
      const keep = dir < 0 ? up : down;
      (keep.disabled ? (dir < 0 ? down : up) : keep).focus();
    };
    up.addEventListener('click', () => move(-1));
    down.addEventListener('click', () => move(1));
    const sync = () => {
      li.setTitle(name.value.trim());
      li.dataset.status = status.value;
      const parts = [el('span', { class: `product-status ${GLYPH[status.value]}`, textContent: SHORT[status.value] })];
      // Samples show no price, here as on the Shop page (D37).
      if (status.value !== 'sample' && price.value !== '') parts.push(el('span', { class: 'ed-price', textContent: Number(price.value) === 0 ? 'Free' : `$${Number(price.value).toFixed(2)}` }));
      li.setMeta(...parts);
    };
    li.form.addEventListener('input', sync);
    li.form.addEventListener('change', sync);
    sync();
    return li;
  }

  const render = (kind, data) => { T[kind].list.replaceChildren(...data.map(kind === 'shows' ? showRow : productRow)); number(kind); T[kind].dirty = false; };

  /* ---------- Tabs ---------- */
  const tabs = ['shows', 'products'];
  function pick(kind, focus = false) {
    for (const k of tabs) {
      const tab = $(`tab-${k}`), on = k === kind;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      $(`panel-${k}`).hidden = !on;
      if (on && focus) tab.focus();
    }
  }
  for (const k of tabs) {
    $(`tab-${k}`).addEventListener('click', () => pick(k));
    $(`tab-${k}`).addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') pick(tabs[(tabs.indexOf(k) + 1) % 2], true); });
  }

  /* ---------- Sign-in, save (faked) ---------- */
  function signedIn() {
    login.hidden = true;
    editor.hidden = false;
    say($('who'), 'Signed in as gabe');
    const empty = q.get('list') === 'empty';
    render('shows', empty ? [] : GL.adminShows.slice().sort((a, b) => (a.date < today()) - (b.date < today()) || a.date.localeCompare(b.date)));
    render('products', empty ? [] : GL.products.slice().sort((a, b) => a.order - b.order).map((p) => ({ ...p, image: p.image })));
  }
  login.addEventListener('submit', (e) => {
    e.preventDefault();
    say(loginMsg, 'Signing in…', 'busy');
    setTimeout(() => { say(loginMsg, ''); signedIn(); }, 400);
  });
  $('logout').addEventListener('click', () => { if (anyDirty()) { $('out-ask').hidden = false; $('out-no').focus(); return; } location.reload(); });
  $('out-no').addEventListener('click', () => { $('out-ask').hidden = true; $('logout').focus(); });
  $('out-yes').addEventListener('click', () => { T.shows.dirty = T.products.dirty = false; location.reload(); });

  $('add').addEventListener('click', () => { const r = showRow({ type: 'show' }); T.shows.list.prepend(r); number('shows'); changed('shows'); r.open(true); r.form.querySelector('input').focus(); });
  $('p-add').addEventListener('click', () => { const r = productRow({ type: 'shirt', status: 'coming-soon' }); T.products.list.append(r); number('products'); changed('products'); r.open(true); r.form.querySelector('input').focus(); });
  for (const k of tabs) T[k].list.addEventListener('input', (e) => { if (e.target.type !== 'file') changed(k); });

  const saving = { shows: false, products: false };
  function save(kind) {
    if (saving[kind]) return; // L2: no second save while one is on its way (the button is aria-disabled)
    const btn = $(kind === 'shows' ? 'save' : 'p-save');
    saving[kind] = true;
    btn.setAttribute('aria-disabled', 'true');
    say(T[kind].msg, 'Saving…', 'busy');
    setTimeout(() => {
      saving[kind] = false;
      btn.removeAttribute('aria-disabled');
      T[kind].dirty = false;
      // The shop is off in this prototype (SHOP_ENABLED unset), so a products save says so (D37).
      say(T[kind].msg, kind === 'products' ? "Saved. The shop isn't open to fans yet, so they won't see it until it's switched on." : "Saved. It's on the site now.", 'ok');
    }, 700);
  }
  $('save').addEventListener('click', () => save('shows'));
  $('p-save').addEventListener('click', () => save('products'));
  addEventListener('beforeunload', (e) => { if (anyDirty()) e.preventDefault(); });

  /* ---------- Prototype switches: put the page in one state for review and screenshots ---------- */
  const lm = q.get('login');
  if (lm === 'signing') say(loginMsg, 'Signing in…', 'busy');
  if (lm === 'wrong') say(loginMsg, "That name and password don't match. Check them and try again.", 'error');
  if (lm === 'locked') say(loginMsg, 'Too many tries. Wait 15 minutes, then try again.', 'error');
  if (lm === 'off') say(loginMsg, "The edit screen isn't switched on yet. Tell the person who runs the site.", 'error');
  if (q.get('view') === 'editor') {
    signedIn();
    const kind = q.get('tab') === 'products' ? 'products' : 'shows';
    pick(kind);
    const open = rows(kind)[Number(q.get('open'))];
    if (q.has('open') && open) open.open(true);
    const u = q.get('upload');
    if (u && kind === 'products' && open) open.uploadState(u);
    const t = T[kind], bar = q.get('bar');
    const MSG = {
      dirty: ['Not saved yet.', 'dirty'],
      saving: ['Saving…', 'busy'],
      saved: ["Saved. It's on the site now.", 'ok'],
      shopoff: ["Saved. The shop isn't open to fans yet, so they won't see it until it's switched on.", 'ok'],
      conflict: [`Someone else saved the ${kind} just now, so yours didn't save. Reloading shows their changes but clears yours, so write down what you changed first.`, 'error'],
      offline: ["That didn't save. Check your connection and try again.", 'error'],
      errors: [`Not saved. Fix the ${t.noun[0]} marked with !, then press Save.`, 'error'],
    };
    if (MSG[bar]) { if (bar !== 'saved' && bar !== 'shopoff') t.dirty = true; say(t.msg, ...MSG[bar]); }
    if (bar === 'saving') $(kind === 'shows' ? 'save' : 'p-save').setAttribute('aria-disabled', 'true');
    if (bar === 'errors') {
      const r = rows(kind)[1];
      if (r) { r.classList.add('bad'); r.open(true); say(r.err, kind === 'products' ? 'Product 2: The price is a number of dollars from 0 to 1000, like 25 or 25.00.' : 'Show 2: Add the venue.'); }
    }
    if (q.get('ask') === '1') { t.dirty = true; $('out-ask').hidden = false; }
  } else {
    login.hidden = false;
  }
})();
