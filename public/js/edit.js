// Gabe's edit screen (shows). Builds every row with createElement and sets data only through textContent / value.
// Talks to /edit/login, /edit/logout and /edit/api/shows (same origin, JSON, session cookie on Path=/edit).
(() => {
  const $ = (id) => document.getElementById(id);
  const login = $('login'), editor = $('editor'), list = $('list'), msg = $('msg'), loginMsg = $('login-msg');
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
  const say = (el, text) => { el.textContent = text; };
  let dirty = false, loaded = false, uid = 0, version = null; // version: the list we loaded, sent back on save

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

  function showRow(s = {}) {
    const date = el('input', { type: 'date', required: true, value: s.date ?? '' });
    const time = el('input', { type: 'time', value: s.time ?? '' });
    const type = el('select', {}, el('option', { value: 'show', textContent: 'Show' }), el('option', { value: 'open-mic', textContent: 'Open mic' }));
    type.value = s.type === 'open-mic' ? 'open-mic' : 'show';
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
      changed();
      number();
    });
    box.mark();
    return box;
  }

  const rows = () => [...list.children];
  const number = () => rows().forEach((r, i) => say(r.heading, `Show ${i + 1}`));
  function changed() { dirty = true; say(msg, 'Not saved yet.'); }

  function render(shows) {
    const t = today();
    const up = shows.filter((s) => s.date >= t).sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`));
    const past = shows.filter((s) => s.date < t).sort((a, b) => b.date.localeCompare(a.date));
    list.replaceChildren(...[...up, ...past].map(showRow));
    number();
    dirty = false;
    loaded = true;
  }

  function signedIn(name, shows) {
    login.hidden = true;
    editor.hidden = false;
    say($('who'), `Signed in as ${name}`);
    if (shows) render(shows);
  }

  async function load() {
    let r;
    try { r = await api('/edit/api/shows'); } catch { login.hidden = false; return say(loginMsg, "Can't reach the site. Check your connection and reload."); }
    const b = await reply(r);
    if (r.ok) { version = b.version; return signedIn(b.editor, b.shows); }
    login.hidden = false;
    if (r.status === 503) say(loginMsg, b.message || 'The edit screen is not set up yet.');
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
    if (loaded) { signedIn(b.editor); return say(msg, 'Signed in again. Press Save.'); } // keep unsaved edits
    load();
  });

  $('logout').addEventListener('click', async () => {
    if (dirty && !confirm('You have changes that are not saved. Sign out anyway?')) return;
    try { await api('/edit/logout', {}); } catch { /* the cookie ends anyway after 7 days */ }
    dirty = false;
    location.reload();
  });

  $('add').addEventListener('click', () => {
    const row = showRow({ type: 'show' });
    list.prepend(row);
    number();
    changed();
    row.querySelector('input').focus();
  });

  list.addEventListener('input', changed);

  $('save').addEventListener('click', async () => {
    for (const r of rows()) { say(r.err, ''); r.classList.remove('bad'); }
    say(msg, 'Saving…');
    let r;
    try { r = await api('/edit/api/shows', { version, shows: rows().map((x) => x.read()) }); } catch { return say(msg, "That didn't save. Check your connection and try again."); }
    const b = await reply(r);
    if (r.ok) { version = b.version; render(b.shows); return say(msg, b.message || "Saved. It's on the site now."); }
    if (r.status === 401) { login.hidden = false; $('username').focus(); return say(msg, 'You were signed out. Sign in above, then press Save again. Your changes are still here.'); }
    if (r.status === 409) return say(msg, b.message || 'Someone else saved the shows a moment ago. Reload to see their changes; yours are still on this page.'); // rows untouched
    const errs = b.errors ?? [];
    for (const x of errs) {
      const row = rows()[x.row];
      if (row) { say(row.err, x.message); row.classList.add('bad'); }
    }
    const general = errs.filter((x) => !rows()[x.row]).map((x) => x.message).join(' ');
    say(msg, general || (errs.length ? `Not saved. Fix the ${errs.length === 1 ? 'show' : `${errs.length} shows`} marked with !, then press Save.` : "That didn't save. Try again."));
    rows()[errs[0]?.row]?.querySelector('input')?.focus();
  });

  addEventListener('beforeunload', (e) => { if (dirty) e.preventDefault(); });

  login.hidden = true; // until we know whether this browser is signed in
  const err = new URLSearchParams(location.search).get('login'); // set by the no-JS form fallback
  if (err) say(loginMsg, err === 'locked' ? 'Too many tries. Wait 15 minutes, then try again.' : "That name and password don't match. Check them and try again.");
  load();
})();
