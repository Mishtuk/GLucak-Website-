// Gabe's edit screen: Shows | Releases | IDENTITY | Bio | Products | Videos tabs. Builds every row with createElement and sets data only through
// textContent / value. Talks to /edit/login, /edit/logout, /edit/api/shows, /edit/api/releases, /edit/api/site, /edit/api/products,
// /edit/api/videos, /edit/api/history/<tab>[/<id>] and /edit/api/upload (same origin, session cookie on Path=/edit).
// A3: Videos (add by YouTube link, Hide, Put first), Copy this show, "Fans will tap" under link fields, what each save changed.
// A2: History (go back to one of the last 10 saves), drafts kept in this browser (localStorage), a code for server failures, an error summary.
(() => {
  const $ = (id) => document.getElementById(id);
  const login = $('login'), editor = $('editor'), loginMsg = $('login-msg');
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
  // state: dirty | busy | ok | error. CSS draws a glyph for each, never colour alone.
  // A save bar's "See it on the site" link shows only while its message says Saved.
  const say = (el, text, state = '') => {
    el.textContent = text; if (state) el.dataset.state = state; else delete el.dataset.state;
    const box = el.closest('.ed-say'), see = box?.querySelector('.ed-see'); if (see) see.hidden = state !== 'ok';
    if (box && el.classList.contains('ed-msg')) { box.querySelector('.ed-code')?.replaceChildren(); box.querySelector('.ed-fix')?.replaceChildren(); const re = box.querySelector('.ed-reload'); if (re) re.hidden = true; } // a new message ends the old code, summary and Reload
  };
  let loaded = false, uid = 0;
  // Per tab: its list, message line, unsaved flag and the version it loaded (sent back on save -> 409 if stale).
  const T = {
    shows: { list: $('list'), msg: $('msg'), dirty: false, version: null, base: null, undo: [], noun: ['show', 'shows'], label: 'Show' },
    releases: { list: $('r-list'), msg: $('r-msg'), dirty: false, version: null, base: null, undo: [], noun: ['release', 'releases'], label: 'Release' },
    products: { list: $('p-list'), msg: $('p-msg'), dirty: false, version: null, base: null, undo: [], noun: ['product', 'products'], label: 'Product' },
    videos: { list: $('v-list'), msg: $('v-msg'), dirty: false, version: null, base: null, undo: [], noun: ['video', 'videos'], label: 'Video' }, // no Delete: Hide is the way back
    // IDENTITY and Bio are fields, not rows. Both save into site.json: one shared version (siteVersion), kept from every reply.
    identity: { msg: $('i-msg'), dirty: false },
    bio: { msg: $('b-msg'), dirty: false },
  };
  T.shows.played = $('played-list');
  let siteVersion = null, siteBase = null; // siteBase: when site.json was last saved, as this screen loaded it (a draft's starting point)
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

  // "Fans will tap: https://...": plain text under a link field, only while the field holds a link that works (a check on typing only echoes it).
  const linkOf = (v) => { const t = String(v ?? '').trim(); if (!t || /\s/.test(t)) return null; try { return ['http:', 'https:'].includes(new URL(t).protocol) ? t : null; } catch { return null; } };
  function fansFor(input, p, pick = linkOf) {
    const show = () => { const t = pick(input.value); p.hidden = !t; p.textContent = t ? `Fans will tap: ${t}` : ''; };
    input.addEventListener('input', show);
    show();
    return show;
  }
  function field(label, input, hint, fans) {
    input.id = `f${++uid}`;
    const l = el('label', { htmlFor: input.id, textContent: label });
    const wrap = el('div', { class: 'ed-field' }, l, input);
    const ids = [];
    if (hint) {
      const h = el('span', { class: 'ed-hint', id: `${input.id}-hint`, textContent: hint });
      ids.push(h.id);
      wrap.append(h);
    }
    if (fans) {
      const p = el('p', { class: 'ed-fans ed-hint', id: `${input.id}-fans`, hidden: true });
      p.setAttribute('aria-live', 'off');
      ids.push(p.id);
      wrap.append(p);
      fansFor(input, p, typeof fans === 'function' ? fans : linkOf);
    }
    if (ids.length) input.setAttribute('aria-describedby', ids.join(' '));
    return wrap;
  }

  const select = (options, value) => {
    const s = el('select', {}, ...options.map(([v, text]) => el('option', { value: v, textContent: text })));
    s.value = options.some(([v]) => v === value) ? value : options[0][0];
    return s;
  };

  // "Saved at 4:12 PM. ...": the browser's clock goes in front of the server's "Saved."
  // A3: and what the save changed, when the server says it: Saved at 4:12 PM. Added 1 show, changed 2. It’s on the site now.
  const savedText = (m, changes) => (m || 'Saved. It’s on the site now.').replace(/^Saved\./, `Saved at ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}.${typeof changes === 'string' && changes ? ` ${changes}` : ''}`);
  function changed(kind) { setDirty(kind, true); say(T[kind].msg, 'Not saved yet.', 'dirty'); queueDraft(kind); }
  const lists = (kind) => (kind === 'shows' ? [T.shows.list, T.shows.played] : [T[kind].list]);
  const rows = (kind) => lists(kind).flatMap((l) => [...l.children]); // shows: upcoming, then Played (one array, so error row numbers match)
  // Delete removes the row at once; Undo (one bar per tab, in the save bar) puts the latest removal back where it was.
  function showUndo(kind) {
    const t = T[kind], bar = $(`undo-${kind}`), last = t.undo[t.undo.length - 1];
    if (!bar) return; // Videos have no Delete, so no Undo bar
    if (!last) { bar.hidden = true; return; }
    const base = last.name ? `${t.label} removed: ${last.name}.` : `${t.label} removed.`;
    bar.querySelector('.ed-undo-t').textContent = t.undo.length > 1 ? `${base} ${t.undo.length} removed so far.` : base;
    bar.hidden = false;
  }
  function clearUndo(kind) { T[kind].undo.length = 0; showUndo(kind); }
  function removeRow(kind, box, name) {
    T[kind].undo.push({ row: box, list: box.parentElement, next: box.nextElementSibling, name });
    say(box.err, ''); box.classList.remove('bad'); // a removed row's save error goes with it
    box.remove();
    changed(kind);
    number(kind);
    showUndo(kind);
    $(`undo-${kind}`).querySelector('button').focus();
  }
  function undoRow(kind) {
    const item = T[kind].undo.pop();
    if (!item) return;
    item.list.insertBefore(item.row, item.next?.parentNode === item.list ? item.next : null);
    item.row.open(false);
    changed(kind);
    number(kind);
    showUndo(kind);
    const fold = item.row.closest?.('details') ?? item.row.edit.closest('details');
    if (fold) fold.open = true; // a Played row comes back inside its fold: open it so the focus lands
    if (T[kind].undo.length) $(`undo-${kind}`).querySelector('button').focus(); else item.row.edit.focus();
  }
  const EMPTY = { shows: 'No shows yet. Press Add show.', releases: 'No releases yet. Press Add release.', products: 'No products yet. Press Add product.', videos: 'No videos yet. Press Add video.' };
  function number(kind) {
    const list = rows(kind), t = T[kind];
    list.forEach((r, i) => {
      say(r.num, `${t.label} ${i + 1}`);
      say(r.legend, `${t.label} ${i + 1}`);
      if (r.up) { r.up.disabled = i === 0; r.down.disabled = i === list.length - 1; } // no button that does nothing
      if (r.putFirst) r.putFirst.disabled = i === 0 || r.state.hidden; // nor Put first on the first row, or on a hidden one
    });
    if (kind === 'videos') markVideos();
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
    const lead = thumb ?? el('div', { class: 'ed-row-lead' }, el('p', { class: 'ed-row-date' }), el('p', { class: 'ed-row-year' }));
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
    const city = el('input', { maxLength: 300, value: s.city ?? '', placeholder: 'Doylestown, PA' });
    const address = el('input', { maxLength: 300, value: s.address ?? '', placeholder: '12 Main St' });
    const cost = el('input', { maxLength: 40, value: s.cost ?? '', placeholder: 'Free' });
    const withIn = el('input', { maxLength: 300, value: s.with ?? '' });
    const link = el('input', { type: 'url', inputMode: 'url', maxLength: 300, value: s.link ?? '', placeholder: 'https://' });
    // Copy this show: a new open row at the top with everything but the Date; the old row stays as it is (DESIGN 31j)
    const copy = el('button', { type: 'button', class: 'ed-btn ed-plain ed-copy', textContent: 'Copy this show' }), copyMsg = el('p', { class: 'ed-upmsg', role: 'status' });
    box.legend.after(copy, copyMsg);
    box.copyMsg = copyMsg;
    copy.addEventListener('click', () => {
      const row = showRow({ ...box.read(), date: '' });
      T.shows.list.prepend(row);
      number('shows');
      changed('shows');
      row.open(true);
      say(row.copyMsg, 'Copied. Pick the new date.', 'ok');
      row.form.querySelector('input').focus(); // the Date
    });
    box.form.append(el('div', { class: 'ed-two' }, field('Date', date), field('Time (optional)', time)),
      field('Type', type), field('Venue', venue), field('City (optional)', city), field('Street address (optional)', address, 'Shown on the show as a map link, and goes in the calendar file.'),
      field('With (optional)', withIn, 'Another act on the bill'), field('Link (optional)', link, 'Tickets or details page', true), field('Cost (optional)', cost, 'Shown after the time, like "Free" or "$10"'));
    box.form.append(box.delBar);
    box.read = () => ({ date: date.value, time: time.value, type: type.value, venue: venue.value, city: city.value, address: address.value, with: withIn.value, link: link.value, cost: cost.value });
    const mark = () => {
      say(box.lead.firstChild, shortDate(date.value));
      say(box.lead.lastChild, /^\d{4}-/.test(date.value) ? date.value.slice(0, 4) : '');
      box.setTitle(venue.value.trim()); // empty until typed: the row number names it
      const past = Boolean(date.value) && date.value < today();
      box.classList.toggle('past', past); // a dashed border in CSS, not opacity
      const kind = type.value === 'open-mic' ? 'Open mic' : 'Show';
      box.setMeta(el('span', { textContent: city.value.trim() ? `${city.value.trim()}, ${kind}` : kind }), ...(past ? [el('span', { class: 'ed-tag', textContent: 'Played' })] : []));
    };
    box.form.addEventListener('input', mark);
    box.form.addEventListener('change', mark);
    box.del.addEventListener('click', () => removeRow('shows', box, venue.value.trim()));
    mark();
    return box;
  }

  T.shows.render = (shows, draft = false) => {
    const t = today();
    const up = shows.filter((s) => s.date >= t).sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`));
    const past = shows.filter((s) => s.date < t).sort((a, b) => b.date.localeCompare(a.date));
    T.shows.list.replaceChildren(...up.map(showRow));
    T.shows.played.replaceChildren(...past.map(showRow));
    if (!draft) T.shows.saved = shows; // Today shows what was saved, never unsaved typing
    clearUndo('shows');
    number('shows');
    setDirty('shows', false);
    renderToday();
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
    const { image, block } = uploader('releases', { value: r.cover, thumb, button: 'Upload a cover', hint: 'Square JPG, PNG or WebP. Straight from your phone is fine. No art yet? Leave it empty: the site shows the title on a plain sleeve.' });
    box.form.append(field('Title', title), field('Type', type),
      field('Date', date, 'The day it comes out. Until then a smart link shows Pre-save.'),
      field('Link', link, 'Your smart link (like wingsmusic.lnk.to/…) or the Spotify link.', true),
      field('Artists (optional)', artists, 'Only if someone joins you, like: GLucak, J-BOY'),
      field('Cover', image, 'Filled in when you upload a cover below. Empty it to remove the cover.'), block, box.delBar);
    box.read = () => ({ title: title.value, type: type.value === 'remix-album' ? 'album' : type.value, remix: type.value === 'remix-album', date: date.value, link: link.value, artists: artists.value, cover: image.value });
    const mark = () => {
      box.setTitle(title.value.trim());
      const label = REL_TYPES.find(([v]) => v === type.value)[1], when = dayText(date.value);
      box.setMeta(el('span', { textContent: [label, when].filter(Boolean).join(', ') }), ...(date.value > today() ? [el('span', { class: 'ed-tag', textContent: 'Coming' })] : [])); // the type first, then Coming; the meta wraps, nothing is cut
    };
    box.form.addEventListener('input', mark);
    box.form.addEventListener('change', mark);
    box.del.addEventListener('click', () => removeRow('releases', box, title.value.trim()));
    mark();
    return box;
  }

  // IDENTITY is not here: it has its own tab (the server keeps its row).
  T.releases.render = (releases) => {
    T.releases.list.replaceChildren(...releases.filter((r) => r.title !== 'IDENTITY').sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).map(releaseRow));
    clearUndo('releases');
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

  // <shrink>
  const MAX_UPLOAD = 5 * 1024 * 1024, LONG_EDGE = 2000, QUALITY = [0.85, 0.75, 0.65, 0.5, 0.4];
  function fitSize(w, h, edge = LONG_EDGE) { // the picture's size with its long edge at 2000px (never enlarged)
    const long = Math.max(w, h);
    if (!(long > 0) || !Number.isFinite(long)) return null;
    const k = Math.min(1, edge / long);
    return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) };
  }
  // A smaller, upright copy of the photo (a Blob under 5 MB), or null when this browser can't make one. Never throws.
  async function shrink(file) {
    let bmp;
    try {
      bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const size = fitSize(bmp.width, bmp.height);
      if (!size) return null;
      const canvas = document.createElement('canvas');
      canvas.width = size.w; canvas.height = size.h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(bmp, 0, 0, size.w, size.h);
      const encode = (type, q) => new Promise((done) => canvas.toBlob(done, type, q));
      let type = 'image/webp';
      for (const q of QUALITY) {
        let blob = await encode(type, q);
        if (blob && type === 'image/webp' && blob.type !== 'image/webp') { type = 'image/jpeg'; blob = await encode(type, q); } // Safari: no WebP, JPEG instead
        if (!blob) return null;
        if (blob.size < MAX_UPLOAD) return blob;
      }
      return null;
    } catch { return null; } finally { bmp?.close?.(); }
  }
  // </shrink>

  async function upload(file, upMsg) {
    if (!UPLOADABLE.includes(file.type)) return { message: 'Pick a JPG, PNG or WebP photo.' };
    const small = await shrink(file); // any failure: the original goes up as is, unless it is over the server's 5 MB
    if (!small && file.size > MAX_UPLOAD) return { message: 'That photo is too big and this phone wouldn’t shrink it. Try another one.' };
    const body = small ?? file;
    say(upMsg, 'Uploading…', 'busy');
    let r;
    try { r = await fetch('/edit/api/upload', { method: 'POST', credentials: 'same-origin', headers: { Accept: 'application/json', 'Content-Type': body.type }, body }); } catch { return { message: "That didn’t upload. Check your connection and try again." }; }
    const b = await reply(r);
    if (r.status === 401) { login.hidden = false; return { message: 'You were signed out. Sign in above, then upload again.' }; }
    return r.ok ? { path: b.path } : { message: b.message || "That didn’t upload. Try again.", code: b.code };
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
      say(upMsg, 'Getting your photo ready...', 'busy');
      clearCode(upMsg.parentElement);
      uploads[kind]++;
      let r;
      try { r = await upload(f, upMsg); } finally { uploads[kind]--; if (!uploads[kind] && waitFor === kind) { say(T[waitFor].msg, ''); waitFor = null; } }
      file.value = '';
      if (!r.path) { say(upMsg, r.message, 'error'); return showCode(upMsg.parentElement, r.code); }
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
    const { image, block: photo } = uploader('products', { value: p.image, thumb, button: 'Upload a photo', hint: 'JPG, PNG or WebP. Straight from your phone is fine.' });
    const desc = el('textarea', { maxLength: 600, value: p.description ?? '', rows: 4 });
    const link = el('input', { type: 'url', inputMode: 'url', maxLength: 500, value: p.link ?? '', placeholder: 'https://' });
    const sizes = el('input', { maxLength: 200, value: (p.sizes ?? []).join(', '), placeholder: 'S, M, L, XL' });
    box.form.append(field('Name', name), field('Short name', id, 'Lowercase letters, numbers and dashes. It fills in from the name; leave it unless you need to change it.'),
      el('div', { class: 'ed-two' }, field('Type', type), field('Price (US dollars)', price, 'Like 25 or 25.00')),
      statusBox, field('Photo', image, 'Filled in when you upload a photo below. Leave it as it is.'), photo,
      field('Description (optional)', desc, 'Up to 600 characters'),
      field('Link (optional)', link, 'Where fans buy it: the product page on your store. Needed for the Buy button.', true),
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
    box.del.addEventListener('click', () => removeRow('products', box, name.value.trim()));
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
    clearUndo('products');
    number('products');
    setDirty('products', false);
  };

  // ---------- Videos ----------
  // The same link rule as the server (src/lib/videos.js parseYouTubeLink): watch, youtu.be and Shorts links; the server checks again.
  const YT_ID = /^[\w-]{11}$/;
  function ytId(text) {
    const s = String(text ?? '').trim();
    if (!s || s.length > 200 || /[\x00-\x20\x7f]/.test(s)) return null;
    let u;
    try { u = new URL(s); } catch { return null; }
    if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password || u.port) return null;
    const host = u.hostname.toLowerCase();
    let id = null;
    if (host === 'youtu.be') id = /^\/([^/]+)\/?$/.exec(u.pathname)?.[1];
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)) id = u.pathname === '/watch' ? u.searchParams.get('v') : /^\/shorts\/([^/]+)\/?$/.exec(u.pathname)?.[1];
    return typeof id === 'string' && YT_ID.test(id) ? id : null;
  }
  const watchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
  const VIDEO_KINDS = [['music-video', 'Music video'], ['live', 'Live']], KIND_LABEL = { 'music-video': 'Music video', 'lyric-video': 'Lyric video', live: 'Live' };
  const FLASH_LINE = 'Tick the box once you’ve watched it. Leave out anything that flashes quickly.';
  function videoRow(v = {}) {
    const thumb = el('img', { class: 'ed-thumb ed-thumb-wide', alt: '', width: 72, height: 48 });
    const box = shell(thumb, 'video');
    box.classList.add('ed-row-vid');
    const saved = typeof v.id === 'string' && YT_ID.test(v.id); // a saved video's link is fixed; a new one is typed
    const keep = { ...v }; // what the form does not edit (date, name, sleeve layout...) goes back as it came
    const state = box.state = { hidden: v.hidden === true, first: v.first === true };
    if (saved) { thumb.src = `/media/sleeves/${v.id}-320.webp`; thumb.addEventListener('error', () => thumb.removeAttribute('src')); } // no picture yet: the hatch shows
    const link = el('input', { type: 'url', inputMode: 'url', required: true, maxLength: 200, value: v.link ?? '', placeholder: 'https://', spellcheck: false });
    const title = el('input', { required: true, maxLength: 120, value: v.name ?? v.title ?? '' });
    const group = `vk${++uid}`, kinds = v.kind === 'lyric-video' ? [VIDEO_KINDS[0], ['lyric-video', 'Lyric video'], VIDEO_KINDS[1]] : VIDEO_KINDS;
    const kindBox = el('fieldset', { class: 'ed-choices' }, el('legend', { textContent: 'Type' }),
      ...kinds.map(([val, text]) => el('label', { class: 'ed-choice' }, el('input', { type: 'radio', name: group, value: val, checked: val === v.kind }), el('span', { textContent: text }))));
    const kind = () => kindBox.querySelector('input:checked')?.value;
    const flash = el('input', { type: 'checkbox', checked: v.noFlash === true });
    flash.id = `f${++uid}`;
    const flashHint = el('span', { class: 'ed-hint', id: `${flash.id}-hint`, textContent: 'Watch it first. If anything flashes quickly, leave it off the site.' });
    flash.setAttribute('aria-describedby', flashHint.id);
    const hide = el('button', { type: 'button', class: 'ed-btn', textContent: 'Hide from site' }), putFirst = el('button', { type: 'button', class: 'ed-btn', textContent: 'Put first' });
    const linkField = saved
      ? el('div', { class: 'ed-field' }, el('p', { class: 'ed-lab', textContent: 'YouTube link' }), el('p', { class: 'ed-linked', textContent: watchUrl(v.id) }), el('span', { class: 'ed-hint', textContent: 'Change the link by adding a new video.' }))
      : field('YouTube link', link, 'Paste the link from YouTube. Watch, Share and Shorts links all work.', (val) => { const id = ytId(val); return id ? watchUrl(id) : null; });
    box.form.append(linkField, field('Title', title), kindBox,
      el('div', { class: 'ed-flash' }, el('label', { class: 'ed-choice ed-check' }, flash, el('span', { textContent: 'No fast flashing lights in this video' })), flashHint),
      el('div', { class: 'ed-vis' }, hide, putFirst));
    Object.assign(box, { putFirst, kindNow: kind });
    box.read = () => {
      const o = { ...keep };
      if (saved) o.id = v.id; else { delete o.id; o.link = link.value; }
      if (keep.name) { o.name = title.value; o.title = title.value.trim() ? keep.title : ''; } else o.title = title.value; // a shipped video shows its short name: that is what the Title field edits
      return Object.assign(o, { kind: kind(), noFlash: flash.checked, hidden: state.hidden, first: state.first && !state.hidden });
    };
    box.mark = () => {
      box.setTitle(title.value.trim());
      const label = KIND_LABEL[kind()];
      box.setMeta(...[label && el('span', { textContent: label }), box.showing && el('span', { class: 'ed-tag', textContent: 'Now showing' }), state.hidden && el('span', { class: 'ed-tag', textContent: 'Hidden' }),
        !saved && el('span', { textContent: 'Picture comes after you save.' })].filter(Boolean));
      box.classList.toggle('past', state.hidden); // hidden: a dashed border and grey title, as the Played rows
      hide.textContent = state.hidden ? 'Put back on site' : 'Hide from site';
    };
    box.form.addEventListener('input', () => markVideos());
    box.form.addEventListener('change', () => markVideos());
    hide.addEventListener('click', () => {
      if (state.hidden && !flash.checked) { say(box.err, `${T.videos.label} ${rows('videos').indexOf(box) + 1}: ${FLASH_LINE}`); box.classList.add('bad'); return flash.focus(); } // never back on the site without the ticked box
      state.hidden = !state.hidden;
      if (state.hidden) state.first = false;
      say(box.err, ''); box.classList.remove('bad');
      number('videos');
      changed('videos');
      hide.focus();
    });
    putFirst.addEventListener('click', () => {
      for (const r of rows('videos')) r.state.first = false;
      state.first = true;
      T.videos.list.prepend(box);
      number('videos');
      changed('videos');
      hide.focus();
    });
    return box;
  }
  // "Now showing" is the first video the site shows: the one put first, else the first music video, else the first live clip.
  function markVideos() {
    const list = rows('videos'), on = list.filter((b) => !b.state.hidden);
    const now = on.find((b) => b.state.first) ?? on.find((b) => b.kindNow() !== 'live') ?? on[0];
    for (const b of list) { b.showing = b === now; b.mark(); }
  }
  T.videos.render = (videos) => {
    T.videos.list.replaceChildren(...videos.map(videoRow));
    number('videos');
    setDirty('videos', false);
  };

  // ---------- Today (what the screen last loaded or saved, never unsaved typing) ----------
  let savedId = null, idFailed = false; // null = still loading
  const clock = (t) => { const m = /^(\d{2}):(\d{2})$/.exec(t || ''); return m ? `${Number(m[1]) % 12 || 12}:${m[2]} ${Number(m[1]) < 12 ? 'AM' : 'PM'}` : ''; };
  function renderToday() {
    const t = today(), shows = T.shows.saved;
    const next = shows && [...shows].filter((s) => s.date >= t).sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`))[0];
    const day = next && (next.date === t ? 'Today' : new Date(`${next.date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }));
    say($('now-show'), !shows ? 'Loading...' : next ? [day, clock(next.time), next.venue].filter(Boolean).join(', ') : 'No shows booked. Press Add show.');
    let id = 'Loading...';
    if (idFailed) id = 'Couldn’t load. Reload the page.';
    else if (savedId === '') id = 'No release date set.';
    else if (savedId) {
      const days = Math.round((Date.parse(savedId) - Date.parse(t)) / 864e5);
      id = days > 0 ? `Out ${dayText(savedId)} (${days} ${days === 1 ? 'day' : 'days'} to go)` : days === 0 ? 'Out today' : `Out now (${dayText(savedId)})`;
    }
    say($('now-id'), id);
  }

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
  const idFans = fansFor(F.link, $('i-link-fans')); // the Pre-save link: what fans will tap
  // Fill one tab's fields from the saved site; the other tab's unsaved edits are never touched.
  function fillSite(site, kind) {
    if (kind === 'identity') { F.date.value = site.identity?.date ?? ''; F.link.value = site.identity?.link ?? ''; idToday(); idFans(); savedId = F.date.value; renderToday(); }
    else { F.home.value = site.homeBio ?? ''; F.bio.value = site.bio ?? ''; }
    setDirty(kind, false);
  }
  const SITE_PART = { identity: () => ({ identity: { date: F.date.value, link: F.link.value } }), bio: () => ({ homeBio: F.home.value, bio: F.bio.value }) };
  for (const k of ['identity', 'bio']) $(`panel-${k}`).addEventListener('input', () => changed(k));

  // ---------- Tabs ----------
  const tabs = ['shows', 'releases', 'identity', 'bio', 'products', 'videos'];
  const TAB_NAME = { shows: 'Shows', releases: 'Releases', identity: 'IDENTITY', bio: 'Bio', products: 'Products', videos: 'Videos' };
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

  // ---------- A2: when, the code for a server failure, the 409 line ----------
  // "Today, 4:12 PM" / "Yesterday, 9:05 AM" / "Tue, Nov 17, 4:12 PM", in the browser's own time.
  function when(x) {
    const d = new Date(x);
    if (Number.isNaN(d.getTime())) return '';
    const day = (v) => new Date(v.getFullYear(), v.getMonth(), v.getDate()).getTime();
    const ago = Math.round((day(new Date()) - day(d)) / 864e5), time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return ago === 0 ? `Today, ${time}` : ago === 1 ? `Yesterday, ${time}` : `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, ${time}`;
  }
  const nameList = (names) => (names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0]); // "Shows and Bio"
  const CODE = /^[A-HJ-NP-Z2-9]{6}$/; // what the server makes: A-Z and 2-9 without O, I, 0, 1
  const slot = (box, tag, cls) => { let x = box.querySelector(`.${cls.split(' ').at(-1)}`); if (!x) { x = el(tag, { class: cls }); box.append(x); } return x; };
  // "Send this code to the person who runs the site: K7P4Q2": text only, no button (he reads it out or screenshots it).
  function showCode(box, code) {
    if (!CODE.test(String(code ?? ''))) return;
    slot(box, 'p', 'ed-code').replaceChildren('Send this code to the person who runs the site: ', el('strong', { textContent: code }));
  }
  const clearCode = (box) => box.querySelector('.ed-code')?.replaceChildren();
  const bar = (kind) => T[kind].msg.closest('.ed-say');
  const focusMsg = (kind) => { T[kind].msg.tabIndex = -1; T[kind].msg.focus({ preventScroll: true }); }; // a failed Save is read out first (P2-5)
  let leaving = false; // Reload keeps the changes as a draft, so the browser's own "leave?" question is skipped
  const STALE_LINE = 'This was saved from another screen or tab, so yours didn’t save. Your changes are kept.';
  // 409: nothing was overwritten. His edits stay on screen and in a draft; Reload brings the other save in, then Keep them puts his back.
  function stale(kind) {
    writeDraft(kind);
    say(T[kind].msg, STALE_LINE, 'error');
    const re = slot(bar(kind), 'button', 'ed-btn ed-reload');
    re.type = 'button'; re.textContent = 'Reload'; re.hidden = false;
    re.onclick = () => { flush(); leaving = true; location.reload(); };
    focusMsg(kind);
  }
  const versionOf = (kind) => (kind === 'identity' || kind === 'bio' ? siteVersion : T[kind].version);

  // ---------- Today's note: "Last saved" and the drafts waiting ----------
  let lastSaved = null;
  function seen(iso) { // the server's newest save time, from any reply
    if (typeof iso === 'string' && Number.isFinite(Date.parse(iso)) && (!lastSaved || iso > lastSaved)) lastSaved = iso;
    renderNote();
  }
  function renderNote() {
    const note = $('now-note'), lines = [];
    if (lastSaved) lines.push(`Last saved: ${when(lastSaved)}`);
    const waiting = tabs.filter((k) => T[k].offer).map((k) => TAB_NAME[k]);
    if (waiting.length) lines.push(`Unsaved changes waiting in ${nameList(waiting)}.`);
    note.replaceChildren(...lines.flatMap((l, i) => [...(i ? [el('br')] : []), document.createTextNode(l)]));
    note.hidden = !lines.length;
  }

  // ---------- Drafts: a tab with unsaved changes is kept in this browser; offered back after a reload (DESIGN 31g) ----------
  // Never trusted: the text is parsed in a try, cut down to the fields we know, and goes into the screen only as values.
  // <drafts>
  const DRAFT = (kind) => `gl-edit-draft-${kind}`;
  const LIST_KEYS = {
    shows: ['date', 'time', 'type', 'venue', 'city', 'address', 'with', 'link', 'cost'],
    releases: ['title', 'type', 'remix', 'date', 'link', 'artists', 'cover'],
    products: ['id', 'name', 'type', 'price', 'image', 'description', 'link', 'status', 'sizes', 'order'],
    videos: ['id', 'link', 'title', 'name', 'with', 'place', 'kind', 'date', 'lead', 'featured', 'noFlash', 'hidden', 'first', 'layout', 'style', 'crop'],
  };
  const BOOLS = new Set(['remix', 'noFlash', 'hidden', 'first', 'lead', 'featured']);
  const SITE_KEYS = { identity: ['date', 'link'], bio: ['homeBio', 'bio'] };
  const MAX_DRAFT = 400000;
  function cleanDraft(kind, d) {
    if (!d || typeof d !== 'object' || d.v !== 1 || !Number.isFinite(d.at)) return null;
    const base = typeof d.base === 'string' ? d.base : null, str = (v) => (typeof v === 'string' ? v.slice(0, 5000) : undefined);
    if (LIST_KEYS[kind]) {
      if (!Array.isArray(d.data) || d.data.length > 300) return null;
      const out = [];
      for (const r of d.data) {
        if (!r || typeof r !== 'object' || Array.isArray(r)) return null;
        const o = {};
        for (const k of LIST_KEYS[kind]) {
          const v = r[k];
          const ok = k === 'sizes' ? (Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 30).map((x) => x.slice(0, 60)) : undefined)
            : k === 'price' ? (v === null || Number.isFinite(v) ? v : undefined)
              : k === 'order' ? (Number.isFinite(v) ? v : undefined)
                : k === 'crop' ? (Array.isArray(v) && v.length === 4 && v.every((n) => Number.isFinite(n)) ? v : undefined)
                  : k === 'date' && v === null ? null
                    : BOOLS.has(k) ? (typeof v === 'boolean' ? v : undefined) : str(v);
          if (ok !== undefined) o[k] = ok;
        }
        out.push(o);
      }
      return { base, at: d.at, data: out };
    }
    if (!d.data || typeof d.data !== 'object' || Array.isArray(d.data)) return null;
    const o = {};
    for (const k of SITE_KEYS[kind]) if (str(d.data[k]) !== undefined) o[k] = str(d.data[k]);
    return { base, at: d.at, data: o };
  }
  const timers = {};
  function dropDraft(kind) { clearTimeout(timers[kind]); try { localStorage.removeItem(DRAFT(kind)); } catch { /* nothing to remove */ } }
  function readDraft(kind) { // null when none; a draft that is not ours or is broken is ignored and removed
    let raw;
    try { raw = localStorage.getItem(DRAFT(kind)); } catch { return null; }
    if (raw == null) return null;
    let d = null;
    try { if (raw.length <= MAX_DRAFT * 2) d = cleanDraft(kind, JSON.parse(raw)); } catch { d = null; }
    if (!d) dropDraft(kind);
    return d;
  }
  // </drafts>
  const baseOf = (kind) => (kind === 'identity' || kind === 'bio' ? siteBase : T[kind].base);
  const snapshot = (kind) => (LIST_KEYS[kind] ? rows(kind).map((r, i) => r.read(i)) : kind === 'identity' ? SITE_PART.identity().identity : SITE_PART.bio());
  const loadedAt = Date.now(), wrote = {}; // a draft written by another browser tab after this one loaded (or after its own last write) is not overwritten
  function writeDraft(kind) {
    clearTimeout(timers[kind]);
    if (!T[kind].dirty || T[kind].offer) return; // saved since; or an older draft still waits for his answer (that tab is locked, so this is only a guard)
    try {
      let stored = null;
      try { stored = JSON.parse(localStorage.getItem(DRAFT(kind)) ?? 'null'); } catch { /* a broken old draft is simply replaced */ }
      if (stored && Number.isFinite(stored.at) && stored.at > (wrote[kind] ?? loadedAt)) return;
      const at = Date.now(), raw = JSON.stringify({ v: 1, base: baseOf(kind), at, data: snapshot(kind) });
      if (raw.length <= MAX_DRAFT) { localStorage.setItem(DRAFT(kind), raw); wrote[kind] = at; }
    } catch { /* storage off or full: no draft, nothing shows */ }
  }
  function queueDraft(kind) { clearTimeout(timers[kind]); timers[kind] = setTimeout(() => writeDraft(kind), 2000); }
  function flush() { for (const k of tabs) if (T[k].dirty) writeDraft(k); }
  function lock(kind, on) { // while the offer waits for his answer the rest of the tab is still (so nothing he types can overwrite the waiting draft)
    for (const c of $(`panel-${kind}`).children) if (c !== T[kind].box) c.inert = on;
  }
  function offerBox(kind) {
    const t = T[kind];
    if (t.box) return t.box;
    const q = el('p'), keep = el('button', { type: 'button', class: 'ed-btn', textContent: 'Keep them' }), toss = el('button', { type: 'button', class: 'ed-btn', textContent: 'Throw away' });
    const box = el('div', { class: 'ed-ask ed-draft', role: 'group', hidden: true }, q, el('p', { class: 'ed-ask-btns' }, keep, toss));
    box.setAttribute('aria-label', 'Changes that were never saved');
    $(`panel-${kind}`).prepend(box);
    keep.addEventListener('click', () => keepDraft(kind));
    toss.addEventListener('click', () => throwDraft(kind));
    return Object.assign(t, { box, boxText: q }).box;
  }
  function offerDrafts() { // after load: a tab with a draft starts with the question
    for (const kind of tabs) {
      const t = T[kind];
      if (t.dirty || t.offer) continue;
      const d = readDraft(kind);
      if (!d) continue;
      const now = cleanDraft(kind, { v: 1, at: 1, base: null, data: snapshot(kind) });
      if (now && JSON.stringify(now.data) === JSON.stringify(d.data)) { dropDraft(kind); continue; } // the same as what is saved: nothing to offer
      t.offer = d;
      const box = offerBox(kind), same = d.base === baseOf(kind);
      t.boxText.textContent = `You have changes from ${when(d.at)} that were never saved. ${same ? 'Keep them, or throw them away?' : 'This was saved again since. Keep yours or throw it away?'}`;
      box.hidden = false;
      lock(kind, true);
    }
    renderNote();
  }
  function keepDraft(kind) {
    const t = T[kind], d = t.offer;
    if (!d) return;
    t.offer = null; t.box.hidden = true; lock(kind, false);
    if (kind === 'identity') { F.date.value = d.data.date ?? ''; F.link.value = d.data.link ?? ''; idToday(); idFans(); }
    else if (kind === 'bio') { F.home.value = d.data.homeBio ?? ''; F.bio.value = d.data.bio ?? ''; }
    else t.render(d.data, true);
    changed(kind);
    renderNote();
    focusMsg(kind);
  }
  function throwDraft(kind) {
    const t = T[kind];
    t.offer = null; t.box.hidden = true; lock(kind, false); dropDraft(kind);
    renderNote();
    (IDS[kind] ? $(IDS[kind][1]) : kind === 'identity' ? F.date : F.home).focus();
  }

  // ---------- History: go back to one of the last 10 saves of a tab (DESIGN 31f) ----------
  const HIST_ID = /^\d{8}T\d{9}Z-[0-9a-f]{8}$/; // what the server makes; anything else is never put in a URL
  const H = {};
  function initHistory(kind) {
    const fold = $(`hist-${kind}`), body = fold.querySelector('.ed-hist');
    const h = H[kind] = { fold, body, seq: 0, busy: false, ol: el('ol', { class: 'ed-list ed-hist-list' }), msg: el('p', { class: 'ed-upmsg', role: 'status' }),
      empty: el('p', { class: 'ed-help ed-empty', hidden: true, textContent: 'Nothing to go back to yet. Each time you save, the old version is kept here.' }) };
    body.append(h.empty, h.ol, h.msg);
    fold.addEventListener('toggle', () => { if (fold.open) loadHistory(kind); });
  }
  async function loadHistory(kind) {
    const h = H[kind], seq = ++h.seq;
    clearCode(h.body);
    h.ol.replaceChildren(); h.empty.hidden = true;
    say(h.msg, 'Loading...', 'busy');
    const failed = (b = {}) => { say(h.msg, 'Couldn’t load the history. Try again.', 'error'); showCode(h.body, b.code); };
    let r;
    try { r = await api(`/edit/api/history/${kind}`); } catch { return seq === h.seq && failed(); }
    if (seq !== h.seq) return;
    if (r.status === 401) { login.hidden = false; return say(h.msg, 'You were signed out. Sign in above, then open History again.', 'error'); }
    const b = await reply(r);
    if (seq !== h.seq) return;
    if (!r.ok || !Array.isArray(b.entries)) return failed(b);
    say(h.msg, '');
    h.empty.hidden = b.entries.length > 0;
    for (const e of b.entries) if (e && HIST_ID.test(e.id) && when(e.at)) h.ol.append(historyItem(kind, e));
  }
  function historyItem(kind, e) {
    const noun = T[kind].noun, n = Number.isInteger(e.count) && e.count >= 0 ? e.count : null;
    const meta = el('p', { class: 'ed-row-meta' });
    if (noun && n !== null) meta.append(el('span', { textContent: `${n} ${n === 1 ? noun[0] : noun[1]}` }));
    if (e.live === true) meta.append(el('span', { class: 'ed-tag', textContent: 'On the site now' }));
    const li = el('li', { class: 'ed-row ed-hist-item' }, el('div', { class: 'ed-hist-text' }, el('p', { class: 'ed-row-title', textContent: when(e.at) }), ...(meta.childNodes.length ? [meta] : []),
      ...(typeof e.what === 'string' && e.what ? [el('p', { class: 'ed-row-meta ed-hist-what', textContent: e.what })] : []))); // what that save changed, counts only
    if (e.live !== true) {
      const go = el('button', { type: 'button', class: 'ed-btn ed-hist-go', textContent: 'Go back to this' });
      go.addEventListener('click', () => askBack(kind, e, li, go));
      li.append(go);
    }
    return li;
  }
  function askBack(kind, e, li, go) { // an inline question, no window.confirm
    for (const old of H[kind].ol.querySelectorAll('.ed-ask')) old.remove();
    const yes = el('button', { type: 'button', class: 'ed-btn', textContent: 'Go back' }), no = el('button', { type: 'button', class: 'ed-btn', textContent: 'Stay' });
    const ask = el('div', { class: 'ed-ask', role: 'alert' },
      el('p', { textContent: `Go back to ${when(e.at)}? What is on the site now stays in History, so you can undo this.${T[kind].dirty ? ' Your unsaved changes here will be lost.' : ''}` }),
      el('p', { class: 'ed-ask-btns' }, yes, no));
    li.append(ask);
    no.addEventListener('click', () => { ask.remove(); go.focus(); });
    yes.addEventListener('click', () => goBack(kind, e, ask));
    no.focus();
  }
  async function goBack(kind, e, ask) {
    const h = H[kind], t = T[kind];
    if (h.busy) return;
    if (uploads[kind]) return say(h.msg, 'Wait for the photo to finish uploading, then try again.', 'error');
    if (saving[kind] || siteSaving[kind]) return say(h.msg, 'Wait for the save to finish, then try again.', 'error');
    h.busy = true;
    const still = [...$(`panel-${kind}`).children].filter((c) => c !== h.fold && !c.inert); // nothing else in the tab can change or save while we go back
    for (const c of still) c.inert = true;
    const buttons = h.body.querySelectorAll('button'); for (const b of buttons) b.disabled = true;
    clearCode(h.body);
    say(h.msg, 'Going back...', 'busy');
    try {
      let r;
      try { r = await api(`/edit/api/history/${kind}/${e.id}`, { version: versionOf(kind) }); } catch { return say(h.msg, 'That didn’t work. Check your connection and try again.', 'error'); }
      const b = await reply(r);
      if (r.ok) {
        if (kind === 'identity' || kind === 'bio') { siteVersion = b.version; siteBase = b.fileSavedAt ?? null; fillSite(b.site, kind); } // only this tab's fields are filled; the other tab's typing stays
        else { t.version = b.version; t.base = b.fileSavedAt ?? null; t.render(b[kind]); }
        seen(b.savedAt); dropDraft(kind); h.fold.open = false; say(h.msg, '');
        say(t.msg, `Done. The site is back to how it was on ${when(e.at)}.`, 'ok');
        return focusMsg(kind);
      }
      ask.remove();
      if (r.status === 401) { login.hidden = false; $('username').focus(); return say(h.msg, 'You were signed out. Sign in above, then try again.', 'error'); }
      if (r.status === 404) { await loadHistory(kind); return say(h.msg, 'That version isn’t there any more. Pick another.', 'error'); }
      if (r.status === 409) { say(h.msg, ''); return stale(kind); }
      say(h.msg, r.status >= 500 ? 'That didn’t work. Try again.' : b.message || 'That didn’t work. Try again.', 'error');
      if (r.status >= 500) showCode(h.body, b.code);
    } finally { h.busy = false; for (const x of buttons) x.disabled = false; for (const c of still) c.inert = false; }
  }

  // ---------- Sign-in, load, save ----------
  function signedIn(name, data) {
    login.hidden = true;
    editor.hidden = false;
    say($('who'), `Signed in as ${name}`);
    if (data) {
      for (const k of ['shows', 'releases', 'products', 'videos']) if (data[k]) T[k].render(data[k]);
      if (data.site) { fillSite(data.site, 'identity'); fillSite(data.site, 'bio'); } else { idFailed = true; renderToday(); }
      loaded = true;
      offerDrafts();
    }
  }

  async function load() {
    let r, p, q, rl, vd;
    try { [r, p, q, rl, vd] = await Promise.all([api('/edit/api/shows'), api('/edit/api/products'), api('/edit/api/site'), api('/edit/api/releases'), api('/edit/api/videos')]); } catch { login.hidden = false; return say(loginMsg, "Can’t reach the site. Check your connection and reload.", 'error'); }
    const b = await reply(r);
    if (r.ok) {
      const pb = await reply(p);
      T.shows.version = b.version; T.shows.base = b.fileSavedAt ?? null; seen(b.savedAt);
      if (p.ok) { T.products.version = pb.version; T.products.base = pb.fileSavedAt ?? null; } else say(T.products.msg, "Couldn’t load the products. Reload the page.", 'error');
      const rb = rl.ok ? await reply(rl) : {};
      if (rl.ok) { T.releases.version = rb.version; T.releases.base = rb.fileSavedAt ?? null; } else say(T.releases.msg, "Couldn’t load the releases. Reload the page.", 'error');
      const vb = vd.ok ? await reply(vd) : {};
      if (vd.ok) { T.videos.version = vb.version; T.videos.base = vb.fileSavedAt ?? null; } else say(T.videos.msg, "Couldn’t load the videos. Reload the page.", 'error');
      const qb = q.ok ? await reply(q) : {};
      if (q.ok) { siteVersion = qb.version; siteBase = qb.fileSavedAt ?? null; } else for (const k of ['identity', 'bio']) say(T[k].msg, "Couldn’t load this. Reload the page.", 'error');
      return signedIn(b.editor, { shows: b.shows, releases: rl.ok ? rb.releases : null, products: p.ok ? pb.products : null, videos: vd.ok ? vb.videos : null, site: q.ok ? qb.site : null });
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
    if (anyDirty()) { // small inline ask, no window.confirm; it names the tabs: "Shows and Bio"
      const names = tabs.filter((k) => T[k].dirty).map((k) => TAB_NAME[k]);
      $('out-q').textContent = `Not saved yet in ${nameList(names)}. Sign out anyway?`;
      $('out-ask').hidden = false; $('out-no').focus(); return;
    }
    signOut();
  });
  $('out-no').addEventListener('click', () => { $('out-ask').hidden = true; $('logout').focus(); });
  $('out-yes').addEventListener('click', () => signOut());
  async function signOut() {
    try { await api('/edit/logout', {}); } catch { /* the cookie ends anyway after 7 days */ }
    for (const k of tabs) if (T[k].dirty) dropDraft(k); // he chose to sign out without saving these
    for (const t of Object.values(T)) t.dirty = false;
    location.reload();
  }

  // New rows open at once, focus on the first field.
  function addShow() { // most of his shows are open mics: the Type starts there; Date gets the focus
    const row = showRow({ type: 'open-mic' });
    T.shows.list.prepend(row);
    number('shows');
    changed('shows');
    row.open(true);
    row.form.querySelector('input').focus();
  }
  $('add').addEventListener('click', addShow);
  for (const b of document.querySelectorAll('.ed-now-btns [data-go]')) b.addEventListener('click', () => {
    const go = b.dataset.go, kind = go === 'add-show' ? 'shows' : go === 'add-video' ? 'videos' : 'releases';
    if (T[kind].offer) { pick(kind); T[kind].box.querySelector('button').focus(); return; } // answer the draft question first
    if (go === 'add-show') { if ($('add').disabled) return; pick('shows'); addShow(); }
    if (go === 'add-video') { if ($('v-add').disabled) return; pick('videos'); addVideo(); }
    if (go === 'fix-release') { pick('releases'); (T.releases.list.firstElementChild?.edit ?? $('r-add')).focus(); }
  });
  for (const k of ['shows', 'releases', 'products']) $(`undo-${k}`).querySelector('button').addEventListener('click', () => undoRow(k));
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
  function addVideo() { // a new open row at the top; the link comes first
    const row = videoRow({});
    T.videos.list.prepend(row);
    number('videos');
    changed('videos');
    row.open(true);
    row.form.querySelector('input').focus();
  }
  $('v-add').addEventListener('click', addVideo);

  for (const k of ['shows', 'releases', 'products', 'videos']) T[k].list.addEventListener('input', (e) => { if (e.target.type !== 'file') changed(k); }); // uploads mark it on success
  T.shows.played.addEventListener('input', () => changed('shows'));

  const saving = { shows: false, releases: false, products: false, videos: false };
  const IDS = { shows: ['save', 'add'], releases: ['r-save', 'r-add'], products: ['p-save', 'p-add'], videos: ['v-save', 'v-add'] }; // Save and Add button per list tab
  async function save(kind) {
    if (saving[kind]) return; // no second save while one is on its way
    if (H[kind]?.busy) return; // nor while a go-back is on its way
    const t = T[kind], list = rows(kind), [btn, add] = IDS[kind].map($);
    if (uploads[kind]) { waitFor = kind; return say(t.msg, 'Wait for the photo to finish uploading, then press Save.', 'busy'); } // an upload would land in a row the reply rebuilds
    for (const r of list) { say(r.err, ''); r.classList.remove('bad'); }
    saving[kind] = true;
    btn.setAttribute('aria-disabled', 'true');
    for (const l of lists(kind)) l.inert = true; add.disabled = true; // edits made now would be replaced by the reply
    const undoBtn = $(`undo-${kind}`)?.querySelector('button'); if (undoBtn) undoBtn.disabled = true;
    say(t.msg, 'Saving…', 'busy');
    try { await send(kind, t, list); } finally { saving[kind] = false; btn.removeAttribute('aria-disabled'); for (const l of lists(kind)) l.inert = false; add.disabled = false; if (undoBtn) undoBtn.disabled = false; }
  }
  async function send(kind, t, list) {
    let r;
    try { r = await api(`/edit/api/${kind}`, { version: t.version, [kind]: list.map((x, i) => x.read(i)) }); } catch { return say(t.msg, "That didn’t save. Check your connection and try again.", 'error'); }
    const b = await reply(r);
    if (r.ok) { t.version = b.version; t.base = b.fileSavedAt ?? null; seen(b.savedAt); dropDraft(kind); t.render(b[kind]); return say(t.msg, savedText(b.message, b.changes), 'ok'); }
    if (r.status === 401) { login.hidden = false; $('username').focus(); return say(t.msg, 'You were signed out. Sign in above, then press Save again. Your changes are still here.', 'error'); }
    if (r.status === 409) return stale(kind); // rows untouched, kept as a draft
    if (r.status >= 500) { say(t.msg, 'That didn’t save. Try again.', 'error'); showCode(bar(kind), b.code); writeDraft(kind); return focusMsg(kind); }
    const errs = b.errors ?? [];
    for (const x of errs) {
      const row = list[x.row];
      if (row) { say(row.err, x.message); row.classList.add('bad'); row.closest('details')?.setAttribute('open', ''); row.open(true); } // a bad row in the closed Played fold opens it
    }
    const general = errs.filter((x) => !list[x.row]).map((x) => x.message).join(' ');
    say(t.msg, general || (errs.length ? `Not saved. Fix the ${errs.length === 1 ? t.noun[0] : `${errs.length} ${t.noun[1]}`} marked with !, then press Save.` : "That didn’t save. Try again."), 'error');
    const marked = errs.filter((x) => list[x.row]); // under the line: one link per bad row; it opens the row and lands on the first bad field
    if (marked.length) slot(bar(kind), 'ul', 'ed-fix').replaceChildren(...marked.map((x) => {
      const row = list[x.row], a = el('a', { class: 'text-link', href: `#${row.form.id}`, textContent: x.message });
      a.addEventListener('click', (ev) => { ev.preventDefault(); row.closest('details')?.setAttribute('open', ''); row.open(true); (row.form.querySelector(':invalid') ?? row.form.querySelector('input'))?.focus(); });
      return el('li', {}, a);
    }));
    focusMsg(kind);
  }
  // One save for IDENTITY and Bio: sends only that tab's fields on the shared version; the reply's version feeds the other tab.
  const siteSaving = { identity: false, bio: false };
  async function saveSite(kind) {
    if (siteSaving[kind] || H[kind]?.busy) return;
    const t = T[kind], btn = $(kind === 'identity' ? 'i-save' : 'b-save'), panel = $(`panel-${kind}`);
    siteSaving[kind] = true;
    btn.setAttribute('aria-disabled', 'true');
    panel.inert = true;
    say(t.msg, 'Saving…', 'busy');
    try {
      let r;
      try { r = await api('/edit/api/site', { version: siteVersion, site: SITE_PART[kind]() }); } catch { return say(t.msg, "That didn’t save. Check your connection and try again.", 'error'); }
      const b = await reply(r);
      if (r.ok) { siteVersion = b.version; siteBase = b.fileSavedAt ?? null; seen(b.savedAt); dropDraft(kind); fillSite(b.site, kind); return say(t.msg, savedText(b.message, b.changes), 'ok'); }
      if (r.status === 401) { login.hidden = false; $('username').focus(); return say(t.msg, 'You were signed out. Sign in above, then press Save again. Your changes are still here.', 'error'); }
      if (r.status === 409) return stale(kind);
      if (r.status >= 500) { say(t.msg, 'That didn’t save. Try again.', 'error'); showCode(bar(kind), b.code); writeDraft(kind); return focusMsg(kind); }
      say(t.msg, (b.errors ?? []).map((x) => x.message).join(' ') || "That didn’t save. Try again.", 'error');
      focusMsg(kind);
    } finally { siteSaving[kind] = false; btn.removeAttribute('aria-disabled'); panel.inert = false; }
  }
  $('save').addEventListener('click', () => save('shows'));
  $('r-save').addEventListener('click', () => save('releases'));
  $('i-save').addEventListener('click', () => saveSite('identity'));
  $('b-save').addEventListener('click', () => saveSite('bio'));
  $('p-save').addEventListener('click', () => save('products'));
  $('v-save').addEventListener('click', () => save('videos'));

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

  addEventListener('beforeunload', (e) => { if (anyDirty() && !leaving) e.preventDefault(); });
  // A tab killed or switched away from keeps its typing as a draft (the timer alone may not have fired yet).
  addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  for (const k of tabs) initHistory(k);

  login.hidden = true; // until we know whether this browser is signed in
  const err = new URLSearchParams(location.search).get('login'); // set by the no-JS form fallback
  if (err) say(loginMsg, err === 'locked' ? 'Too many tries. Wait 15 minutes, then try again.' : "That name and password don’t match. Check them and try again.", 'error');
  load();
})();
