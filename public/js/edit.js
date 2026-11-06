// Gabe's edit screen: Shows | Products tabs. Builds every row with createElement and sets data only through
// textContent / value. Talks to /edit/login, /edit/logout, /edit/api/shows, /edit/api/products and /edit/api/upload
// (same origin, session cookie on Path=/edit).
(() => {
  const $ = (id) => document.getElementById(id);
  const login = $('login'), editor = $('editor'), loginMsg = $('login-msg');
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
  const say = (el, text) => { el.textContent = text; };
  let loaded = false, uid = 0;
  // Per tab: its list, message line, unsaved flag and the version it loaded (sent back on save -> 409 if stale).
  const T = {
    shows: { list: $('list'), msg: $('msg'), dirty: false, version: null, noun: ['show', 'shows'] },
    products: { list: $('p-list'), msg: $('p-msg'), dirty: false, version: null, noun: ['product', 'products'] },
  };
  const anyDirty = () => T.shows.dirty || T.products.dirty;

  const api = (path, body) => fetch(path, {
    method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin',
    headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const reply = async (r) => { try { return await r.json(); } catch { return {}; } };

  function el(tag, props = {}, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) if (k === 'class') e.className = v; else e[k] = v;
    e.append(...kids);
    return e;
  }

  function field(label, input, hint) {
    input.id = `f${++uid}`;
    const l = el('label', { htmlFor: input.id, textContent: label });
    const wrap = el('div', {}, l, input);
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

  function changed(kind) { T[kind].dirty = true; say(T[kind].msg, 'Not saved yet.'); }
  const rows = (kind) => [...T[kind].list.children];
  const number = (kind) => { rows(kind).forEach((r, i) => say(r.heading, `${kind === 'shows' ? 'Show' : 'Product'} ${i + 1}`)); empty(kind); };
  // The empty-list line sits just before the list and shows only while the list has no rows.
  const EMPTY = { shows: 'No shows yet. Press Add show.', products: 'No products yet. Press Add product.' };
  function empty(kind) {
    const t = T[kind];
    t.empty ??= t.list.insertAdjacentElement('beforebegin', el('p', { class: 'ed-help', textContent: EMPTY[kind] }));
    t.empty.hidden = t.list.children.length > 0;
  }

  // ---------- Shows ----------
  function showRow(s = {}) {
    const date = el('input', { type: 'date', required: true, value: s.date ?? '' });
    const time = el('input', { type: 'time', value: s.time ?? '' });
    const type = select([['show', 'Show'], ['open-mic', 'Open mic']], s.type);
    const venue = el('input', { required: true, maxLength: 300, value: s.venue ?? '' });
    const city = el('input', { required: true, maxLength: 300, value: s.city ?? '', placeholder: 'Doylestown, PA' });
    const withIn = el('input', { maxLength: 300, value: s.with ?? '' });
    const link = el('input', { type: 'url', inputMode: 'url', maxLength: 300, value: s.link ?? '', placeholder: 'https://' });
    const title = el('span'), tag = el('span', { class: 'ed-tag' });
    const err = el('p', { class: 'ed-err', role: 'alert' });
    const del = el('button', { type: 'button', class: 'ed-btn', textContent: 'Delete' });
    const box = el('fieldset', { class: 'ed-show' }, el('legend', {}, title, tag),
      el('div', { class: 'ed-two' }, field('Date', date), field('Time (optional)', time)),
      field('Type', type), field('Venue', venue), field('City', city),
      field('With (optional)', withIn, 'Another act on the bill'), field('Link (optional)', link, 'Tickets or details page'),
      err, del);
    box.read = () => ({ date: date.value, time: time.value, type: type.value, venue: venue.value, city: city.value, with: withIn.value, link: link.value });
    box.err = err;
    box.heading = title;
    box.mark = () => {
      const past = Boolean(date.value) && date.value < today();
      box.classList.toggle('past', past);
      say(tag, past ? 'Played' : '');
    };
    date.addEventListener('change', box.mark);
    del.addEventListener('click', () => {
      const name = venue.value.trim() || 'this show';
      if (!confirm(`Delete ${name}? It goes away when you press Save.`)) return;
      box.remove();
      changed('shows');
      number('shows');
    });
    box.mark();
    return box;
  }

  T.shows.render = (shows) => {
    const t = today();
    const up = shows.filter((s) => s.date >= t).sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`));
    const past = shows.filter((s) => s.date < t).sort((a, b) => b.date.localeCompare(a.date));
    T.shows.list.replaceChildren(...[...up, ...past].map(showRow));
    number('shows');
    T.shows.dirty = false;
  };

  // ---------- Products ----------
  const TYPES = [['shirt', 'Shirt'], ['hoodie', 'Hoodie'], ['cd', 'CD'], ['vinyl', 'Vinyl'], ['sticker', 'Sticker'], ['other', 'Other']];
  const STATUSES = [['coming-soon', 'Coming soon'], ['available', 'Available (shows Buy once it has a Link)'], ['sold-out', 'Sold out'], ['sample', 'Sample (shows Coming soon, no price)']];
  const IMAGE = /^\/media\/(?:shop\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:webp|png|jpg)|uploads\/[a-f0-9]{32}\.webp)$/; // same rule as the server
  const UPLOADABLE = ['image/jpeg', 'image/png', 'image/webp'];
  const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '');
  const cents = (v) => { const t = v.trim(); if (!t) return null; const n = Math.round(Number(t) * 100); return Number.isFinite(n) ? n : null; };

  async function upload(file) {
    if (!UPLOADABLE.includes(file.type)) return { message: 'Pick a JPG, PNG or WebP photo.' };
    if (file.size > 5 * 1024 * 1024) return { message: 'That photo is over 5 MB. Pick a smaller one.' };
    let r;
    try { r = await fetch('/edit/api/upload', { method: 'POST', credentials: 'same-origin', headers: { Accept: 'application/json', 'Content-Type': file.type }, body: file }); } catch { return { message: "That didn't upload. Check your connection and try again." }; }
    const b = await reply(r);
    if (r.status === 401) { login.hidden = false; return { message: 'You were signed out. Sign in above, then upload again.' }; }
    return r.ok ? { path: b.path } : { message: b.message || "That didn't upload. Try again." };
  }

  function productRow(p = {}) {
    const name = el('input', { required: true, maxLength: 120, value: p.name ?? '' });
    const id = el('input', { required: true, maxLength: 60, value: p.id ?? '', autocapitalize: 'none', spellcheck: false });
    let autoId = !p.id; // a new product's ID follows its name until edited by hand
    name.addEventListener('input', () => { if (autoId) id.value = slug(name.value); });
    id.addEventListener('input', () => { autoId = false; });
    const type = select(TYPES, p.type);
    const status = select(STATUSES, p.status);
    const price = el('input', { type: 'number', min: 0, max: 1000, step: '0.01', inputMode: 'decimal', required: true, value: Number.isInteger(p.price) ? (p.price / 100).toFixed(2) : '' });
    const image = el('input', { maxLength: 200, value: p.image ?? '', spellcheck: false, placeholder: '/media/uploads/...' });
    const pic = el('img', { class: 'ed-pic', alt: '', width: 96, height: 96 });
    const showPic = () => { if (IMAGE.test(image.value.trim())) pic.src = image.value.trim(); else pic.removeAttribute('src'); };
    image.addEventListener('input', showPic);
    const file = el('input', { type: 'file', accept: UPLOADABLE.join(',') });
    const upMsg = el('span', { class: 'ed-hint', role: 'status' });
    file.addEventListener('change', async () => {
      const f = file.files[0];
      if (!f) return;
      say(upMsg, 'Uploading…');
      const r = await upload(f);
      file.value = '';
      if (!r.path) return say(upMsg, r.message);
      image.value = r.path;
      showPic();
      changed('products');
      say(upMsg, 'Uploaded. Press Save to keep it.');
    });
    const desc = el('textarea', { maxLength: 600, value: p.description ?? '', rows: 4 });
    const link = el('input', { type: 'url', inputMode: 'url', maxLength: 500, value: p.link ?? '', placeholder: 'https://' });
    const sizes = el('input', { maxLength: 200, value: (p.sizes ?? []).join(', '), placeholder: 'S, M, L, XL' });
    const title = el('span');
    const err = el('p', { class: 'ed-err', role: 'alert' });
    const up = el('button', { type: 'button', class: 'ed-btn', textContent: 'Move up' });
    const down = el('button', { type: 'button', class: 'ed-btn', textContent: 'Move down' });
    const del = el('button', { type: 'button', class: 'ed-btn', textContent: 'Delete' });
    const box = el('fieldset', { class: 'ed-show' }, el('legend', {}, title),
      field('Name', name), field('Short name', id, 'Lowercase letters, numbers and dashes. It fills in from the name; leave it unless you need to change it.'),
      el('div', { class: 'ed-two' }, field('Type', type), field('Price (US dollars)', price, 'Like 25 or 25.00')),
      field('Status', status), field('Photo', image, 'Filled in when you upload a photo below. Leave it as it is.'), pic,
      field('Upload a photo', file, 'JPG, PNG or WebP, up to 5 MB.'), upMsg,
      field('Description (optional)', desc, 'Up to 600 characters'),
      field('Link (optional)', link, 'Where fans buy it: the product page on your store. Needed for the Buy button.'),
      field('Sizes (optional)', sizes, 'Separate with commas, like S, M, L, XL.'),
      err, el('div', { class: 'ed-moves' }, up, down, del));
    box.read = (i) => ({
      id: id.value, name: name.value, type: type.value, price: cents(price.value), image: image.value, description: desc.value,
      link: link.value, status: status.value, sizes: sizes.value.split(',').map((s) => s.trim()).filter(Boolean), order: i,
    });
    box.err = err;
    box.heading = title;
    const move = (dir) => {
      const other = dir < 0 ? box.previousElementSibling : box.nextElementSibling;
      if (!other) return;
      if (dir < 0) other.before(box); else other.after(box);
      (dir < 0 ? up : down).focus();
      number('products');
      changed('products');
    };
    up.addEventListener('click', () => move(-1));
    down.addEventListener('click', () => move(1));
    del.addEventListener('click', () => {
      if (!confirm(`Delete ${name.value.trim() || 'this product'}? It goes away when you press Save.`)) return;
      box.remove();
      changed('products');
      number('products');
    });
    showPic();
    return box;
  }

  T.products.render = (products) => {
    T.products.list.replaceChildren(...[...products].sort((a, b) => a.order - b.order).map(productRow));
    number('products');
    T.products.dirty = false;
  };

  // ---------- Tabs ----------
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
    $(`tab-${k}`).addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      pick(tabs[(tabs.indexOf(k) + 1) % tabs.length], true); // two tabs: either arrow goes to the other
    });
  }

  // ---------- Sign-in, load, save ----------
  function signedIn(name, data) {
    login.hidden = true;
    editor.hidden = false;
    say($('who'), `Signed in as ${name}`);
    if (data) {
      for (const k of tabs) if (data[k]) T[k].render(data[k]);
      loaded = true;
    }
  }

  async function load() {
    let r, p;
    try { [r, p] = await Promise.all([api('/edit/api/shows'), api('/edit/api/products')]); } catch { login.hidden = false; return say(loginMsg, "Can't reach the site. Check your connection and reload."); }
    const b = await reply(r);
    if (r.ok) {
      const pb = await reply(p);
      T.shows.version = b.version;
      if (p.ok) T.products.version = pb.version; else say(T.products.msg, "Couldn't load the products. Reload the page.");
      return signedIn(b.editor, { shows: b.shows, products: p.ok ? pb.products : null });
    }
    login.hidden = false;
    if (r.status === 503) say(loginMsg, b.message || "The edit screen isn't switched on yet. Tell the person who runs the site.");
  }

  login.addEventListener('submit', async (e) => {
    e.preventDefault();
    say(loginMsg, 'Signing in…');
    let r;
    try { r = await api('/edit/login', { username: $('username').value, password: $('password').value }); } catch { return say(loginMsg, "That didn't go through. Try again."); }
    const b = await reply(r);
    if (!r.ok) return say(loginMsg, b.message || "That didn't go through. Try again.");
    $('password').value = '';
    say(loginMsg, '');
    if (loaded) { signedIn(b.editor); for (const k of tabs) if (T[k].dirty) say(T[k].msg, 'Signed in again. Press Save.'); return; } // keep unsaved edits
    load();
  });

  $('logout').addEventListener('click', async () => {
    if (anyDirty()) { $('out-ask').hidden = false; $('out-no').focus(); return; } // small inline confirm, no window.confirm
    signOut();
  });
  $('out-no').addEventListener('click', () => { $('out-ask').hidden = true; $('logout').focus(); });
  $('out-yes').addEventListener('click', () => signOut());
  async function signOut() {
    try { await api('/edit/logout', {}); } catch { /* the cookie ends anyway after 7 days */ }
    T.shows.dirty = T.products.dirty = false;
    location.reload();
  }

  $('add').addEventListener('click', () => {
    const row = showRow({ type: 'show' });
    T.shows.list.prepend(row);
    number('shows');
    changed('shows');
    row.querySelector('input').focus();
  });
  $('p-add').addEventListener('click', () => {
    const row = productRow({ type: 'shirt', status: 'coming-soon' });
    T.products.list.append(row);
    number('products');
    changed('products');
    row.querySelector('input').focus();
  });

  for (const k of tabs) T[k].list.addEventListener('input', (e) => { if (e.target.type !== 'file') changed(k); }); // uploads mark it on success

  async function save(kind) {
    const t = T[kind], list = rows(kind);
    for (const r of list) { say(r.err, ''); r.classList.remove('bad'); }
    say(t.msg, 'Saving…');
    let r;
    try { r = await api(`/edit/api/${kind}`, { version: t.version, [kind]: list.map((x, i) => x.read(i)) }); } catch { return say(t.msg, "That didn't save. Check your connection and try again."); }
    const b = await reply(r);
    if (r.ok) { t.version = b.version; t.render(b[kind]); return say(t.msg, b.message || "Saved. It's on the site now."); }
    if (r.status === 401) { login.hidden = false; $('username').focus(); return say(t.msg, 'You were signed out. Sign in above, then press Save again. Your changes are still here.'); }
    if (r.status === 409) return say(t.msg, b.message || `Someone else saved the ${kind} just now, so yours didn't save. Reloading shows their changes but clears yours, so write down what you changed first.`); // rows untouched
    const errs = b.errors ?? [];
    for (const x of errs) {
      const row = list[x.row];
      if (row) { say(row.err, x.message); row.classList.add('bad'); }
    }
    const general = errs.filter((x) => !list[x.row]).map((x) => x.message).join(' ');
    say(t.msg, general || (errs.length ? `Not saved. Fix the ${errs.length === 1 ? t.noun[0] : `${errs.length} ${t.noun[1]}`} marked with !, then press Save.` : "That didn't save. Try again."));
    list[errs[0]?.row]?.querySelector('input')?.focus();
  }
  $('save').addEventListener('click', () => save('shows'));
  $('p-save').addEventListener('click', () => save('products'));

  addEventListener('beforeunload', (e) => { if (anyDirty()) e.preventDefault(); });

  login.hidden = true; // until we know whether this browser is signed in
  const err = new URLSearchParams(location.search).get('login'); // set by the no-JS form fallback
  if (err) say(loginMsg, err === 'locked' ? 'Too many tries. Wait 15 minutes, then try again.' : "That name and password don't match. Check them and try again.");
  load();
})();
