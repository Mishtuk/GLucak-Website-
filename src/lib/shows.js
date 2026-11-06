// Shows: validate, split upcoming/past by the New York calendar day, render escaped HTML. Used by server.js and tests.
const TZ = 'America/New_York';
export const etDay = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(now);

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const validDate = (d) => { const t = new Date(`${d}T00:00:00Z`); return /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === d; };
const httpUrl = (u) => { try { return ['http:', 'https:'].includes(new URL(u).protocol); } catch { return false; } };

/** Returns the row if valid, else throws. */
export function validateShow(r) {
  if (!r || typeof r !== 'object') throw new Error('show must be an object');
  if (typeof r.date !== 'string' || !validDate(r.date)) throw new Error('bad date');
  if (r.time != null && (typeof r.time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(r.time))) throw new Error('bad time');
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

const fmtDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).toUpperCase();
const fmtTime = (t) => { const h = +t.slice(0, 2); return `${h % 12 || 12}:${t.slice(3)} ${h < 12 ? 'AM' : 'PM'}`; };
const INSTAGRAM = 'https://www.instagram.com/glucakofficial/';
// ponytail: booking email unknown until Gabe answers (direction.md Q4); the Request a show button stays off until set.
export const BOOKING_EMAIL = null;

const action = (r) => r.link ? `<a class="btn btn-show" href="${esc(r.link)}" rel="noopener">${r.type === 'show' ? 'Tickets' : 'Details'}</a>` : '';
const place = (r) => `${esc(r.venue)}, ${esc(r.city)}`;
const dateTag = (r) => `<time datetime="${esc(r.date)}${r.time ? `T${esc(r.time)}` : ''}">${esc(fmtDate(r.date))}</time>`;

/** Markup per DESIGN.md (classes from prototype/styles.css). A poster is only ever a full show, never an open mic. */
const POSTER_ART = `<picture><img class="poster-art graded" src="/media/c-poster-600.webp" srcset="/media/c-poster-600.webp 600w, /media/c-poster-1000.webp 1000w" sizes="(min-width: 640px) 23rem, 50vw" width="600" height="750" alt="" loading="lazy"></picture>`;
export function posterHtml(r) {
  const meta = [r.time && fmtTime(r.time), r.with && `With ${r.with}`].filter(Boolean).map(esc).join(', ');
  return `<li class="poster">${POSTER_ART}<p class="poster-date fit"><span class="ln ln-date">${dateTag(r)}</span></p><p class="poster-place">${place(r)}</p>${meta ? `<p class="poster-meta">${meta}</p>` : ''}${action(r)}</li>`;
}
export function rowHtml(r) {
  const extra = [r.type === 'open-mic' ? 'Open mic' : 'Show', r.time && fmtTime(r.time), r.with && `With ${r.with}`].filter(Boolean).map(esc).join(', ');
  return `<li class="row"><span class="row-date">${dateTag(r)}</span><span class="row-text"><span class="row-place">${place(r)}</span><span class="row-kind">${extra}</span></span>${action(r)}</li>`;
}
// Kept for callers that want one plain row.
export const showHtml = rowHtml;

const upcomingHtml = (list) => {
  const [first, ...rest] = list;
  const items = first.type === 'show' ? posterHtml(first) + rest.map(rowHtml).join('') : list.map(rowHtml).join('');
  return `<ul class="shows">${items}</ul>`;
};
const playedHtml = (list) => list.length ? `<div class="played"><h3>Played</h3><ul class="rows">${list.map(rowHtml).join('')}</ul></div>` : '';
const emptyHtml = (played) => `<div class="empty"><p class="empty-line">No shows booked right now</p><div class="empty-actions"><a class="btn btn-solid" href="${INSTAGRAM}" rel="noopener">Follow</a>${BOOKING_EMAIL ? `<a class="btn btn-line" href="mailto:${esc(BOOKING_EMAIL)}?subject=Show%20request">Request a show</a>` : ''}</div>${playedHtml(played)}</div>`;

/**
 * The list for the page marker. Invalid rows are skipped, never rendered.
 * Home: { limit: 3, allLink: '/shows/' } -> poster + 2 rows + All shows. Shows page: { past: true } -> everything + Played.
 * No upcoming shows: the empty state (DESIGN.md section 7), with Played rows if any.
 */
export function showsHtml(rows, now = new Date(), { limit = Infinity, past = false, allLink = null } = {}) {
  const ok = rows.filter((r) => { try { return validateShow(r); } catch { return false; } });
  const s = splitShows(ok, now);
  if (!s.upcoming.length) return emptyHtml(past ? s.past : s.past.slice(0, 3));
  let out = upcomingHtml(s.upcoming.slice(0, limit));
  if (allLink) out += `<a class="text-link" href="${esc(allLink)}">All shows</a>`;
  if (past) out += playedHtml(s.past);
  return out;
}

const dayDiff = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 864e5);
const link = (href, text, label) => `<a href="${esc(href)}"${label ? ` aria-label="${esc(label)}"` : ''}${href === '#shows' ? '' : ' rel="noopener"'}>${esc(text)}</a>`;

/**
 * The Now line (D45, copy in docs/copy/round2.md), picked per visit by New York day. In order:
 * A release 1-14 days ahead "Out Nov 13: Title"; B release day "Out today: Title"; C 1-7 days after "Out now: Title";
 * D next show or open mic within 14 days "Nov 20: Venue, City" ("Today: ..." on the day, linking #shows); E newest release "Out now: Title".
 * '' if nothing applies (the static release line then stays). Escaped; release links http(s) only; never "Pre-save".
 * Shows are validated rows; `releases` is the raw releases.json list.
 */
export function nowHtml(rows, now = new Date(), releases = []) {
  const today = etDay(now);
  const rel = releases.filter((r) => r && typeof r.title === 'string' && r.title.trim() && typeof r.date === 'string' && validDate(r.date) && httpUrl(r.link))
    .map((r) => ({ ...r, d: dayDiff(r.date, today) })).sort((a, b) => a.d - b.d);
  const out = (r, text, label) => link(r.link, text, label);
  const a = rel.find((r) => r.d >= 1 && r.d <= 14), b = rel.find((r) => r.d === 0);
  const c = rel.filter((r) => r.d < 0 && r.d >= -7).pop();
  const pretty = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const listen = (r, text) => out(r, text, `Listen to ${r.title}`);
  if (a) return out(a, `Out ${pretty(a.date)}: ${a.title}`, `${a.title}, out ${pretty(a.date)}. Opens the release link`);
  if (b) return listen(b, `Out today: ${b.title}`);
  if (c) return listen(c, `Out now: ${c.title}`);
  const ok = rows.filter((r) => { try { return validateShow(r); } catch { return false; } });
  const next = splitShows(ok, now).upcoming[0];
  if (next && dayDiff(next.date, today) <= 14) {
    const when = next.date === today ? 'Today' : pretty(next.date);
    return link('#shows', `${when}: ${next.venue}, ${next.city}`, `${next.venue}, ${next.city}, ${pretty(next.date)}. Details`);
  }
  const latest = rel.filter((r) => r.d < 0).pop();
  return latest ? listen(latest, `Out now: ${latest.title}`) : '';
}
