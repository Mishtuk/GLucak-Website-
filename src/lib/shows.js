// Shows: validate, split upcoming/past by the New York calendar day, render escaped HTML. Used by server.js and tests.
const TZ = 'America/New_York';
export const etDay = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(now);

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const validDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;
const httpUrl = (u) => { try { return ['http:', 'https:'].includes(new URL(u).protocol); } catch { return false; } };

/** Returns the row if valid, else throws. */
export function validateShow(r) {
  if (!r || typeof r !== 'object') throw new Error('show must be an object');
  if (typeof r.date !== 'string' || !validDate(r.date)) throw new Error('bad date');
  if (r.time != null && !/^([01]\d|2[0-3]):[0-5]\d$/.test(r.time)) throw new Error('bad time');
  if (r.type !== 'show' && r.type !== 'open-mic') throw new Error('bad type');
  for (const k of ['venue', 'city']) if (typeof r[k] !== 'string' || !r[k].trim()) throw new Error(`bad ${k}`);
  if (r.link != null && (typeof r.link !== 'string' || !httpUrl(r.link))) throw new Error('bad link');
  if (r.with != null && (typeof r.with !== 'string' || !r.with.trim())) throw new Error('bad with');
  return r;
}

/** { upcoming (soonest first), past (latest first) }. A show stays upcoming through its whole day. */
export function splitShows(rows, now = new Date()) {
  const today = etDay(now);
  const key = (r) => `${r.date} ${r.time ?? ''}`;
  const all = rows.map(validateShow);
  return {
    upcoming: all.filter((r) => r.date >= today).sort((a, b) => key(a).localeCompare(key(b))),
    past: all.filter((r) => r.date < today).sort((a, b) => key(b).localeCompare(key(a))),
  };
}

const fmtDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const fmtTime = (t) => { const h = +t.slice(0, 2); return `${h % 12 || 12}:${t.slice(3)} ${h < 12 ? 'AM' : 'PM'}`; };

export function showHtml(r) {
  const btn = r.link ? `<a href="${esc(r.link)}" rel="noopener">${r.type === 'show' ? 'Tickets' : 'Details'}</a>` : '';
  const time = r.time ? ` <span>${esc(fmtTime(r.time))}</span>` : '';
  return `<li><time datetime="${esc(r.date)}">${esc(fmtDate(r.date))}</time>${time} <strong>${esc(r.venue)}</strong> <span>${esc(r.city)}</span>${r.with ? ` <span>With ${esc(r.with)}</span>` : ''}${r.type === 'open-mic' ? ' <span>Open mic</span>' : ''} ${btn}</li>`;
}

/** The list for the page marker. limit caps the upcoming list (Home). Invalid rows are skipped, never rendered. */
export function showsHtml(rows, now = new Date(), { limit = Infinity, past = false } = {}) {
  const ok = rows.filter((r) => { try { return validateShow(r); } catch { return false; } });
  const s = splitShows(ok, now);
  const list = (a) => `<ul>${a.map(showHtml).join('')}</ul>`;
  let out = s.upcoming.length ? list(s.upcoming.slice(0, limit)) : '<p>No upcoming shows yet.</p>';
  if (past && s.past.length) out += `<h2>Past shows</h2>${list(s.past)}`;
  return out;
}
