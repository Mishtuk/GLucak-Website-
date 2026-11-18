// Gabe's edit screen: Shows | Releases | IDENTITY | Bio | Products tabs. Builds every row with createElement and sets data only through
// textContent / value. Talks to /edit/login, /edit/logout, /edit/api/shows, /edit/api/releases, /edit/api/site, /edit/api/products and /edit/api/upload
// (same origin, session cookie on Path=/edit).
(() => {
  const $ = (id) => document.getElementById(id);
  const login = $('login'), editor = $('editor'), loginMsg = $('login-msg');
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
  // state: dirty | busy | ok | error. CSS draws a glyph for each, never colour alone.
  // A save bar's "See it on the site" link shows only while its message says Saved.
  const say = (el, text, state = '') => {
    el.textContent = text; if (state) el.dataset.state = state; else delete el.dataset.state;
    const see = el.closest('.ed-say')?.querySelector('.ed-see'); if (see) see.hidden = state !== 'ok';
  };
  let loaded = false, uid = 0;
  // Per tab: its list, message line, unsaved flag and the version it loaded (sent back on save -> 409 if stale).
  const T = {
    shows: { list: $('list'), msg: $('msg'), dirty: false, version: null, noun: ['show', 'shows'], label: 'Show' },
    releases: { list: $('r-list'), msg: $('r-msg'), dirty: false, version: null, noun: ['release', 'releases'], label: 'Release' },
    products: { list: $('p-list'), msg: $('p-msg'), dirty: false, version: null, noun: ['product', 'products'], label: 'Product' },
    // IDENTITY and Bio are fields, not rows. Both save into site.json: one shared version (siteVersion), kept from every reply.
    identity: { msg: $('i-msg'), dirty: false },
    bio: { msg: $('b-msg'), dirty: false },
  };
  T.shows.played = $('played-list');
  let siteVersion = null;
  const anyDirty = () => Object.values(T).some((t) => t.dirty);
  // The tab wears a ring and a hidden " (not saved)" while its tab has unsaved changes.
  function setDirty(kind, on) {
    T[kind].dirty = on;
    const tab = $(`tab-${kind}`);
    tab.toggleAttribute('data-dirty', on);
    tab.querySelector('.vh')?.remove();
    if (on) tab.append(el('span', { class: 'vh', textContent: ' (not saved)' }));
  }

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
    const wrap = el('div', { class: 'ed-field' }, l, input);
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

  function changed(kind) { setDirty(kind, true); say(T[kind].msg, 'Not saved yet.', 'dirty'); }
  const lists = (kind) => (kind === 'shows' ? [T.shows.list, T.shows.played] : [T[kind].list]);
  const rows = (kind) => lists(kind).flatMap((l) => [...l.children]); // shows: upcoming, then Played (one array, so error row numbers match)
  const EMPTY = { shows: 'No shows yet. Press Add show.', releases: 'No releases yet. Press Add release.', products: 'No products yet. Press Add product.' };
  function number(kind) {
    const list = rows(kind), t = T[kind];
    list.forEach((r, i) => {
      say(r.num, `${t.label} ${i + 1}`);
      say(r.legend, `${t.label} ${i + 1}`);
      if (r.up) { r.up.disabled = i === 0; r.down.disabled = i === list.length - 1; } // no button that does nothing
    });
    if (kind === 'shows') { // the Played fold: shown only when there are past rows
      const n = T.shows.played.children.length;
      $('played').hidden = !n;
      $('played').querySelector('summary').textContent = `Played (${n})`;
    }
    // The empty-list line sits just before the list and shows only while the list has no rows.
    t.empty ??= t.list.insertAdjacentElement('beforebegin', el('p', { class: 'ed-help ed-empty', textContent: EMPTY[kind] }));
    t.empty.hidden = list.length > 0;
  }

  // A collapsed row: head (number, title, meta, error) + actions; Edit opens the form under it.
  function shell(thumb, noun) {
    const li = el('li', { class: 'ed-row' });
    const num = el('p', { class: 'ed-row-num vh' }), ttl = el('p', { class: 'ed-row-title' }), mt = el('p', { class: 'ed-row-meta' });
    const err = el('p', { class: 'ed-err', role: 'alert' });
    const lead = thumb ?? el('p', { class: 'ed-row-date' });
    const legend = el('legend', { class: 'vh' });
    const form = el('fieldset', { class: 'ed-form', hidden: true, id: `form-${++uid}` }, legend);
    const edit = el('button', { type: 'button', class: 'ed-btn ed-edit', textContent: 'Edit' });
    const delBar = el('div', { class: 'ed-delete' }); // the form ends with it: Delete is never next to Edit
    edit.setAttribute('aria-expanded', 'false');
    edit.setAttribute('aria-controls', form.id);
    const del = el('button', { type: 'button', class: 'ed-btn ed-plain ed-del', textContent: `Delete this ${noun}` });
    delBar.append(del);
    li.append(el('div', { class: 'ed-row-head' }, lead, el('div', { class: 'ed-row-text' }, num, ttl, mt), edit, err), form);
    Object.assign(li, { num, legend, err, form, edit, del, delBar, lead });
    li.setTitle = (t) => say(ttl, t);
    li.setMeta = (...parts) => mt.replaceChildren(...parts);
    li.open = (on) => {
      form.hidden = !on; edit.setAttribute('aria-expanded', String(on)); edit.textContent = on ? 'Close' : 'Edit'; li.classList.toggle('is-open', on);
      if (on) form.scrollIntoView({ block: 'nearest' }); // instant; the page's scroll-padding keeps it clear of the save bar
    };
    edit.addEventListener('click', () => { const on = form.hidden; li.open(on); if (on) form.querySelector('input,select,textarea')?.focus(); });
    return li;
  }

  // ---------- Shows ----------
  const shortDate = (d) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return ''; const [y, m, day] = d.split('-').map(Number); return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }); };
  function showRow(s = {}) {
    const box = shell(null, 'show');
    const date = el('input', { type: 'date', required: true, value: s.date ?? '' });
    const time = el('input', { type: 'time', value: s.time ?? '' });
    const type = select([['show', 'Show'], ['open-mic', 'Open mic']], s.type);
    const venue = el('input', { required: true, maxLength: 300, value: s.venue ?? '' });
    const city = el('input', { required: true, maxLength: 300, value: s.city ?? '', placeholder: 'Doylestown, PA' });
    const address = el('input', { maxLength: 300, value: s.address ?? '', placeholder: '12 Main St' });
    const cost = el('input', { maxLength: 40, value: s.cost ?? '', placeholder: 'Free' });
    const withIn = el('input', { maxLength: 300, value: s.with ?? '' });
    const link = el('input', { type: 'url', inputMode: 'url', maxLength: 300, value: s.link ?? '', placeholder: 'https://' });
    box.form.append(el('div', { class: 'ed-two' }, field('Date', date), field('Time (optional)', time)),
      field('Type', type), field('Venue', venue), field('City', city), field('Street address (optional)', address, 'Helps maps and Google find the place. Not shown on the site; it goes in the calendar file.'),
      field('With (optional)', withIn, 'Another act on the bill'), field('Link (optional)', link, 'Tickets or details page'), field('Cost (optional)', cost, 'Shown after the time, like "Free" or "$10"'));
    box.form.append(box.delBar);
    box.read = () => ({ date: date.value, time: time.value, type: type.value, venue: venue.value, city: city.value, address: address.value, with: withIn.value, link: link.value, cost: cost.value });
    const mark = () => {
      say(box.lead, shortDate(date.value));
      box.setTitle(venue.value.trim()); // empty until typed: the row number names it
      const past = Boolean(date.value) && date.value < today();
      box.classList.toggle('past', past); // a dashed border in CSS, not opacity
      const kind = type.value === 'open-mic' ? 'Open mic' : 'Show';
      box.setMeta(el('span', { textContent: city.value.trim() ? `${city.value.trim()}, ${kind}` : kind }), ...(past ? [el('span', { class: 'ed-tag', textContent: 'Played' })] : []));
    };
    box.form.addEventListener('input', mark);
    box.form.addEventListener('change', mark);
    box.del.addEventListener('click', () => {
      const name = venue.value.trim() || 'this show';
      if (!confirm(`Delete ${name}? It goes away when you press Save.`)) return;
      box.remove();
      changed('shows');
      number('shows');
    });
    mark();
    return box;
  }

  T.shows.render = (shows) => {
    const t = today();
    const up = shows.filter((s) => s.date >= t).sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`));
    const past = shows.filter((s) => s.date < t).sort((a, b) => b.date.localeCompare(a.date));
    T.shows.list.replaceChildren(...up.map(showRow));
    T.shows.played.replaceChildren(...past.map(showRow));
    number('shows');
    setDirty('shows', false);
  };

  // ---------- Releases ----------
  const REL_TYPES = [['single', 'Single'], ['ep', 'EP'], ['album', 'Album'], ['remix-album', 'Remix album']]; // Remix album saves type album + remix
  const dayText = (d) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return ''; const [y, m, day] = d.split('-').map(Number); return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }); };
  function releaseRow(r = {}) {
    const thumb = el('img', { class: 'ed-thumb', alt: '', width: 48, height: 48 });
    const box = shell(thumb, 'release');
    const title = el('input', { required: true, maxLength: 120, value: r.title ?? '' });
    const type = select(REL_TYPES, r.remix && r.type === 'album' ? 'remix-album' : r.type);
    const date = el('input', { type: 'date', required: true, value: r.date ?? '' });
    const link = el('input', { type: 'url', inputMode: 'url', required: true, maxLength: 300, value: r.link ?? '', placeholder: 'https://', spellcheck: false });
    const artists = el('input', { maxLength: 120, value: r.artists ?? '' });
    const { image, block } = uploader('releases', { value: r.cover, thumb, button: 'Upload a cover', hint: 'Square JPG, PNG or WebP, up to 5 MB. No art yet? Leave it empty: the site shows the title on a plain sleeve.' });
    box.form.append(field('Title', title), field('Type', type),
      field('Date', date, 'The day it comes out. Until then a smart link shows Pre-save.'),
      field('Link', link, 'Your smart link (like wingsmusic.lnk.to/…) or the Spotify link.'),
      field('Artists (optional)', artists, 'Only if someone joins you, like: GLucak, J-BOY'),
      field('Cover', image, 'Filled in when you upload a cover below. Empty it to remove the cover.'), block, box.delBar);
    box.read = () => ({ title: title.value, type: type.value === 'remix-album' ? 'album' : type.value, remix: type.value === 'remix-album', date: date.value, link: link.value, artists: artists.value, cover: image.value });
    const mark = () => {
      box.setTitle(title.value.trim());
      const label = REL_TYPES.find(([v]) => v === type.value)[1], when = dayText(date.value);
      box.setMeta(...(date.value > today() ? [el('span', { class: 'ed-tag', textContent: 'Coming' })] : []), el('span', { textContent: [label, when].filter(Boolean).join(', ') })); // the tag first: a narrow row clips the text, never the tag
    };
    box.form.addEventListener('input', mark);
    box.form.addEventListener('change', mark);
    box.del.addEventListener('click', () => {
      if (!confirm(`Delete ${title.value.trim() || 'this release'}? It goes away when you press Save.`)) return;
      box.remove();
      changed('releases');
      number('releases');
    });
    mark();
    return box;
  }

  // IDENTITY is not here: it has its own tab (the server keeps its row).
  T.releases.render = (releases) => {
    T.releases.list.replaceChildren(...releases.filter((r) => r.title !== 'IDENTITY').sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).map(releaseRow));
    number('releases');
    setDirty('releases', false);
  };

  // ---------- Products ----------
  const TYPES = [['shirt', 'Shirt'], ['hoodie', 'Hoodie'], ['cd', 'CD'], ['vinyl', 'Vinyl'], ['sticker', 'Sticker'], ['other', 'Other']];
  const STATUSES = [['coming-soon', 'Coming soon'], ['available', 'Available (shows Buy once it has a Link)'], ['sold-out', 'Sold out'], ['sample', 'Sample (shows Coming soon, no price)']];
  const SHORT = { 'coming-soon': 'Coming soon', available: 'Available', 'sold-out': 'Sold out', sample: 'Sample' };
  const uploads = { releases: 0, products: 0 }; // photo uploads on their way, per tab
  let waitFor = null; // the tab whose Save was pressed during an upload: its message says to wait; cleared when the upload ends
  const IMAGE = /^\/media\/(?:covers\/[a-z0-9]+(?:-[a-z0-9]+)*\.webp|shop\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:webp|png|jpg)|uploads\/[a-f0-9]{32}\.webp)$/; // the files the server accepts (a preview only)
  const UPLOADABLE = ['image/jpeg', 'image/png', 'image/webp'];
  const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '');
  const cents = (v) => { const t = v.trim(); if (!t) return null; const n = Math.round(Number(t) * 100); return Number.isFinite(n) ? n : null; };

  async function upload(file) {
    if (!UPLOADABLE.includes(file.type)) return { message: 'Pick a JPG, PNG or WebP photo.' };
    if (file.size > 5 * 1024 * 1024) return { message: 'That photo is over 5 MB. Pick a smaller one.' };
    let r;
    try { r = await fetch('/edit/api/upload', { method: 'POST', credentials: 'same-origin', headers: { Accept: 'application/json', 'Content-Type': file.type }, body: file }); } catch { return { message: "That didn’t upload. Check your connection and try again." }; }
    const b = await reply(r);
    if (r.status === 401) { login.hidden = false; return { message: 'You were signed out. Sign in above, then upload again.' }; }
    return r.ok ? { path: b.path } : { message: b.message || "That didn’t upload. Try again." };
  }

  // The photo block Products and Releases share: the path field, a preview (and the row's thumb), the upload button and its messages.
  function uploader(kind, { value, thumb, button, hint }) {
    const image = el('input', { maxLength: 200, value: value ?? '', spellcheck: false, placeholder: '/media/uploads/...' });
    const pic = el('img', { class: 'ed-pic', alt: '', width: 120, height: 120 });
    const showPic = () => { const v = image.value.trim(); for (const i of [pic, thumb]) if (IMAGE.test(v)) i.src = v; else i.removeAttribute('src'); };
    image.addEventListener('input', showPic);
    // The upload is a big button (the label) with the real file input over it at opacity 0. Busy line only: no progress bar (D41).
    const file = el('input', { type: 'file', class: 'ed-file-input', accept: UPLOADABLE.join(',') });
    file.id = `f${++uid}`;
    const fileHint = el('span', { class: 'ed-hint', id: `${file.id}-hint`, textContent: hint });
    file.setAttribute('aria-describedby', fileHint.id);
    const upMsg = el('span', { class: 'ed-hint ed-upmsg', role: 'status' });
    file.addEventListener('change', async () => {
      const f = file.files[0];
      if (!f) return;
      say(upMsg, 'Uploading…', 'busy');
      uploads[kind]++;
      let r;
      try { r = await upload(f); } finally { uploads[kind]--; if (!uploads[kind] && waitFor === kind) { say(T[waitFor].msg, ''); waitFor = null; } }
      file.value = '';
      if (!r.path) return say(upMsg, r.message, 'error');
      image.value = r.path;
      showPic();
      changed(kind);
      say(upMsg, 'Uploaded. Press Save to keep it.', 'ok');
    });
    showPic();
    const block = el('div', { class: 'ed-upload' }, pic, el('div', { class: 'ed-upload-side' },
      el('span', { class: 'ed-file-wrap' }, el('label', { class: 'ed-btn ed-file', htmlFor: file.id, textContent: button }), file), fileHint, upMsg));
    return { image, block };
  }

  function productRow(p = {}) {
    const thumb = el('img', { class: 'ed-thumb', alt: '', width: 64, height: 64 });
    const box = shell(thumb, 'product');
    const name = el('input', { required: true, maxLength: 120, value: p.name ?? '' });
    const id = el('input', { required: true, maxLength: 60, value: p.id ?? '', autocapitalize: 'none', spellcheck: false });
    let autoId = !p.id; // a new product’s ID follows its name until edited by hand
    name.addEventListener('input', () => { if (autoId) id.value = slug(name.value); });
    id.addEventListener('input', () => { autoId = false; });
    const type = select(TYPES, p.type);
    // Status: four radio rows (the long option words are cut off by a phone's closed select).
    const group = `st${++uid}`, start = STATUSES.some(([v]) => v === p.status) ? p.status : STATUSES[0][0];
    const statusBox = el('fieldset', { class: 'ed-choices' }, el('legend', { textContent: 'Status' }),
      ...STATUSES.map(([v, text]) => el('label', { class: 'ed-choice' }, el('input', { type: 'radio', name: group, value: v, checked: v === start }), el('span', { textContent: text }))));
    const status = () => statusBox.querySelector('input:checked')?.value ?? STATUSES[0][0];
    const price = el('input', { type: 'number', min: 0, max: 1000, step: '0.01', inputMode: 'decimal', required: true, value: Number.isInteger(p.price) ? (p.price / 100).toFixed(2) : '' });
    const { image, block: photo } = uploader('products', { value: p.image, thumb, button: 'Upload a photo', hint: 'JPG, PNG or WebP, up to 5 MB.' });
    const desc = el('textarea', { maxLength: 600, value: p.description ?? '', rows: 4 });
    const link = el('input', { type: 'url', inputMode: 'url', maxLength: 500, value: p.link ?? '', placeholder: 'https://' });
    const sizes = el('input', { maxLength: 200, value: (p.sizes ?? []).join(', '), placeholder: 'S, M, L, XL' });
    box.form.append(field('Name', name), field('Short name', id, 'Lowercase letters, numbers and dashes. It fills in from the name; leave it unless you need to change it.'),
      el('div', { class: 'ed-two' }, field('Type', type), field('Price (US dollars)', price, 'Like 25 or 25.00')),
      statusBox, field('Photo', image, 'Filled in when you upload a photo below. Leave it as it is.'), photo,
      field('Description (optional)', desc, 'Up to 600 characters'),
      field('Link (optional)', link, 'Where fans buy it: the product page on your store. Needed for the Buy button.'),
      field('Sizes (optional)', sizes, 'Separate with commas, like S, M, L, XL.'));
    const up = el('button', { type: 'button', class: 'ed-btn', textContent: 'Move up' });
    const down = el('button', { type: 'button', class: 'ed-btn', textContent: 'Move down' });
    box.form.prepend(el('div', { class: 'ed-move' }, up, down));
    box.form.append(box.delBar);
    Object.assign(box, { up, down });
    box.read = (i) => ({
      id: id.value, name: name.value, type: type.value, price: cents(price.value), image: image.value, description: desc.value,
      link: link.value, status: status(), sizes: sizes.value.split(',').map((s) => s.trim()).filter(Boolean), order: i,
    });
    const move = (dir) => {
      const other = dir < 0 ? box.previousElementSibling : box.nextElementSibling;
      if (!other) return;
      if (dir < 0) other.before(box); else other.after(box);
      number('products');
      changed('products');
      const keep = dir < 0 ? up : down;
      (keep.disabled ? (dir < 0 ? down : up) : keep).focus();
    };
    up.addEventListener('click', () => move(-1));
    down.addEventListener('click', () => move(1));
    box.del.addEventListener('click', () => {
      if (!confirm(`Delete ${name.value.trim() || 'this product'}? It goes away when you press Save.`)) return;
      box.remove();
      changed('products');
      number('products');
    });
    const sync = () => {
      box.setTitle(name.value.trim());
      box.dataset.status = status();
      const parts = [el('span', { class: `product-status is-${status()}`, textContent: SHORT[status()] })];
      if (status() !== 'sample' && price.value !== '') parts.push(el('span', { class: 'ed-price', textContent: Number(price.value) === 0 ? 'Free' : `$${Number(price.value).toFixed(2)}` })); // samples show no price (D37)
      box.setMeta(...parts);
    };
    box.form.addEventListener('input', sync);
    box.form.addEventListener('change', sync);
    sync();
    return box;
  }

  T.products.render = (products) => {
    T.products.list.replaceChildren(...[...products].sort((a, b) => a.order - b.order).map(productRow));
    number('products');
    setDirty('products', false);
  };

  // ---------- IDENTITY and Bio (site.json) ----------
  const F = { date: $('i-date'), link: $('i-link'), home: $('b-home'), bio: $('b-bio') };
  const longDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  function idToday() { // "On the site today: August 13, 2027, 268 days to go", recomputed as the date changes
    const d = F.date.value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return say($('i-today'), '');
    const days = Math.round((Date.parse(d) - Date.parse(today())) / 864e5);
    say($('i-today'), `On the site today: ${longDate(d)}, ${days <= 0 ? 'Out now' : `${days} ${days === 1 ? 'day' : 'days'} to go`}`);
  }
  F.date.addEventListener('input', idToday);
  // Fill one tab's fields from the saved site; the other tab's unsaved edits are never touched.
  function fillSite(site, kind) {
    if (kind === 'identity') { F.date.value = site.identity?.date ?? ''; F.link.value = site.identity?.link ?? ''; idToday(); }
    else { F.home.value = site.homeBio ?? ''; F.bio.value = site.bio ?? ''; }
    setDirty(kind, false);
  }
  const SITE_PART = { identity: () => ({ identity: { date: F.date.value, link: F.link.value } }), bio: () => ({ homeBio: F.home.value, bio: F.bio.value }) };
  for (const k of ['identity', 'bio']) $(`panel-${k}`).addEventListener('input', () => changed(k));

  // ---------- Tabs ----------
  const tabs = ['shows', 'releases', 'identity', 'bio', 'products'];
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
      const i = tabs.indexOf(k), n = tabs.length;
      const to = { ArrowLeft: (i + n - 1) % n, ArrowRight: (i + 1) % n, Home: 0, End: n - 1 }[e.key];
      if (to === undefined) return;
      e.preventDefault();
      pick(tabs[to], true);
    });
  }

  // ---------- Sign-in, load, save ----------
  function signedIn(name, data) {
    login.hidden = true;
    editor.hidden = false;
    say($('who'), `Signed in as ${name}`);
    if (data) {
      for (const k of ['shows', 'releases', 'products']) if (data[k]) T[k].render(data[k]);
      if (data.site) { fillSite(data.site, 'identity'); fillSite(data.site, 'bio'); }
      loaded = true;
    }
  }

  async function load() {
    let r, p, q, rl;
    try { [r, p, q, rl] = await Promise.all([api('/edit/api/shows'), api('/edit/api/products'), api('/edit/api/site'), api('/edit/api/releases')]); } catch { login.hidden = false; return say(loginMsg, "Can’t reach the site. Check your connection and reload.", 'error'); }
    const b = await reply(r);
    if (r.ok) {
      const pb = await reply(p);
      T.shows.version = b.version;
      if (p.ok) T.products.version = pb.version; else say(T.products.msg, "Couldn’t load the products. Reload the page.", 'error');
      const rb = rl.ok ? await reply(rl) : {};
      if (rl.ok) T.releases.version = rb.version; else say(T.releases.msg, "Couldn’t load the releases. Reload the page.", 'error');
      const qb = q.ok ? await reply(q) : {};
      if (q.ok) siteVersion = qb.version; else for (const k of ['identity', 'bio']) say(T[k].msg, "Couldn’t load this. Reload the page.", 'error');
      return signedIn(b.editor, { shows: b.shows, releases: rl.ok ? rb.releases : null, products: p.ok ? pb.products : null, site: q.ok ? qb.site : null });
    }
    login.hidden = false;
    if (r.status === 503) say(loginMsg, b.message || "The edit screen isn’t switched on yet. Tell the person who runs the site.", 'error');
  }

  login.addEventListener('submit', async (e) => {
    e.preventDefault();
    say(loginMsg, 'Signing in…', 'busy');
    let r;
    try { r = await api('/edit/login', { username: $('username').value, password: $('password').value }); } catch { return say(loginMsg, "That didn’t go through. Try again.", 'error'); }
    const b = await reply(r);
    if (!r.ok) return say(loginMsg, b.message || "That didn’t go through. Try again.", 'error');
    $('password').value = '';
    say(loginMsg, '');
    if (loaded) { signedIn(b.editor); for (const k of tabs) if (T[k].dirty) say(T[k].msg, 'Signed in again. Press Save.', 'dirty'); return; } // keep unsaved edits
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
    for (const t of Object.values(T)) t.dirty = false;
    location.reload();
  }

  // New rows open at once, focus on the first field.
  $('add').addEventListener('click', () => {
    const row = showRow({ type: 'show' });
    T.shows.list.prepend(row);
    number('shows');
    changed('shows');
    row.open(true);
    row.form.querySelector('input').focus();
  });
  $('r-add').addEventListener('click', () => {
    const row = releaseRow({ type: 'single' });
    T.releases.list.prepend(row);
    number('releases');
    changed('releases');
    row.open(true);
    row.form.querySelector('input').focus();
  });
  $('p-add').addEventListener('click', () => {
    const row = productRow({ type: 'shirt', status: 'coming-soon' });
    T.products.list.append(row);
    number('products');
    changed('products');
    row.open(true);
    row.form.querySelector('input').focus();
  });

  for (const k of ['shows', 'releases', 'products']) T[k].list.addEventListener('input', (e) => { if (e.target.type !== 'file') changed(k); }); // uploads mark it on success
  T.shows.played.addEventListener('input', () => changed('shows'));

  const saving = { shows: false, releases: false, products: false };
  const IDS = { shows: ['save', 'add'], releases: ['r-save', 'r-add'], products: ['p-save', 'p-add'] }; // Save and Add button per list tab
  async function save(kind) {
    if (saving[kind]) return; // no second save while one is on its way
    const t = T[kind], list = rows(kind), [btn, add] = IDS[kind].map($);
    if (uploads[kind]) { waitFor = kind; return say(t.msg, 'Wait for the photo to finish uploading, then press Save.', 'busy'); } // an upload would land in a row the reply rebuilds
    for (const r of list) { say(r.err, ''); r.classList.remove('bad'); }
    saving[kind] = true;
    btn.setAttribute('aria-disabled', 'true');
    for (const l of lists(kind)) l.inert = true; add.disabled = true; // edits made now would be replaced by the reply
    say(t.msg, 'Saving…', 'busy');
    try { await send(kind, t, list); } finally { saving[kind] = false; btn.removeAttribute('aria-disabled'); for (const l of lists(kind)) l.inert = false; add.disabled = false; }
  }
  async function send(kind, t, list) {
    let r;
    try { r = await api(`/edit/api/${kind}`, { version: t.version, [kind]: list.map((x, i) => x.read(i)) }); } catch { return say(t.msg, "That didn’t save. Check your connection and try again.", 'error'); }
    const b = await reply(r);
    if (r.ok) { t.version = b.version; t.render(b[kind]); return say(t.msg, b.message || "Saved. It’s on the site now.", 'ok'); }
    if (r.status === 401) { login.hidden = false; $('username').focus(); return say(t.msg, 'You were signed out. Sign in above, then press Save again. Your changes are still here.', 'error'); }
    if (r.status === 409) return say(t.msg, b.message || `Someone else saved the ${kind} just now, so yours didn’t save. Reloading shows their changes but clears yours, so write down what you changed first.`, 'error'); // rows untouched
    const errs = b.errors ?? [];
    for (const x of errs) {
      const row = list[x.row];
      if (row) { say(row.err, x.message); row.classList.add('bad'); row.closest('details')?.setAttribute('open', ''); row.open(true); } // a bad row in the closed Played fold opens it
    }
    const general = errs.filter((x) => !list[x.row]).map((x) => x.message).join(' ');
    say(t.msg, general || (errs.length ? `Not saved. Fix the ${errs.length === 1 ? t.noun[0] : `${errs.length} ${t.noun[1]}`} marked with !, then press Save.` : "That didn’t save. Try again."), 'error');
    list[errs[0]?.row]?.form.querySelector('input')?.focus();
  }
  // One save for IDENTITY and Bio: sends only that tab's fields on the shared version; the reply's version feeds the other tab.
  const siteSaving = { identity: false, bio: false };
  async function saveSite(kind) {
    if (siteSaving[kind]) return;
    const t = T[kind], btn = $(kind === 'identity' ? 'i-save' : 'b-save'), panel = $(`panel-${kind}`);
    siteSaving[kind] = true;
    btn.setAttribute('aria-disabled', 'true');
    panel.inert = true;
    say(t.msg, 'Saving…', 'busy');
    try {
      let r;
      try { r = await api('/edit/api/site', { version: siteVersion, site: SITE_PART[kind]() }); } catch { return say(t.msg, "That didn’t save. Check your connection and try again.", 'error'); }
      const b = await reply(r);
      if (r.ok) { siteVersion = b.version; fillSite(b.site, kind); return say(t.msg, b.message || "Saved. It’s on the site now.", 'ok'); }
      if (r.status === 401) { login.hidden = false; $('username').focus(); return say(t.msg, 'You were signed out. Sign in above, then press Save again. Your changes are still here.', 'error'); }
      if (r.status === 409) return say(t.msg, b.message || 'Someone else saved just now, so yours didn’t save. Reload the page to see their changes, but write down what you changed first.', 'error');
      say(t.msg, (b.errors ?? []).map((x) => x.message).join(' ') || "That didn’t save. Try again.", 'error');
    } finally { siteSaving[kind] = false; btn.removeAttribute('aria-disabled'); panel.inert = false; }
  }
  $('save').addEventListener('click', () => save('shows'));
  $('r-save').addEventListener('click', () => save('releases'));
  $('i-save').addEventListener('click', () => saveSite('identity'));
  $('b-save').addEventListener('click', () => saveSite('bio'));
  $('p-save').addEventListener('click', () => save('products'));

  // Backup: the plain <a download> still works without JS; with JS we fetch it so a 401 / 413 / 429 gets a message, not a saved error file.
  const bk = $('backup-link'), bkMsg = $('backup-msg');
  bk.addEventListener('click', async (e) => {
    e.preventDefault();
    if (bk.getAttribute('aria-disabled') === 'true') return;
    bk.setAttribute('aria-disabled', 'true');
    say(bkMsg, 'Making your backup…', 'busy');
    try {
      let r;
      try { r = await fetch('/edit/api/backup', { credentials: 'same-origin' }); } catch { return say(bkMsg, "That didn’t download. Check your connection and try again.", 'error'); }
      if (r.status === 401) { login.hidden = false; $('username').focus(); return say(bkMsg, 'You were signed out. Sign in above, then download again.', 'error'); }
      if (!r.ok) {
        const b = await r.json().catch(() => ({}));
        if (r.status === 413) return say(bkMsg, b.message || 'This backup is too big for one file. Tell the person who runs the site.', 'error');
        if (r.status === 429) return say(bkMsg, b.message || 'Too many backups. Wait an hour, then try again.', 'error');
        return say(bkMsg, b.message || "That didn’t download. Try again.", 'error');
      }
      const url = URL.createObjectURL(await r.blob());
      const name = /filename="([^"]+)"/.exec(r.headers.get('Content-Disposition') || '')?.[1] || 'glucak-backup.json';
      const a = el('a', { href: url, download: name });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000); // revoking at once breaks some browsers' downloads
      say(bkMsg, 'Done. Look for it in your downloads.', 'ok');
    } catch { say(bkMsg, "That didn’t download. Try again.", 'error'); } finally { bk.removeAttribute('aria-disabled'); }
  });

  addEventListener('beforeunload', (e) => { if (anyDirty()) e.preventDefault(); });

  login.hidden = true; // until we know whether this browser is signed in
  const err = new URLSearchParams(location.search).get('login'); // set by the no-JS form fallback
  if (err) say(loginMsg, err === 'locked' ? 'Too many tries. Wait 15 minutes, then try again.' : "That name and password don’t match. Check them and try again.", 'error');
  load();
})();
