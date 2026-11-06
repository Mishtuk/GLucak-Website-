// Shows: validate, split upcoming/past by the New York calendar day, render escaped HTML. Used by server.js and tests.
import { createHash } from 'node:crypto';
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

const monD = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

/** A stable id for a show (rows have none): date + venue slug + 6 hex of a hash of date and venue. Used by the .ics route and the calendar link. */
export const showId = (r) => {
  const slug = r.venue.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40).replace(/-$/, '') || 'show';
  return `${r.date}-${slug}-${createHash('sha256').update(`${r.date}
${r.venue}`).digest('hex').slice(0, 6)}`;
};
const cal = (r, words) => `<a class="${words ? 'cal-link' : 'cal-btn'}" href="/shows/${showId(r)}.ics" aria-label="${esc(`Add to calendar: ${r.venue}, ${monD(r.date)}`)}"><svg class="cal-icon" aria-hidden="true"><use href="#i-cal"/></svg>${words ? '<span class="cal-word">Add to calendar</span>' : ''}</a>`;

const action = (r) => r.link ? `<a class="btn btn-show" href="${esc(r.link)}" rel="noopener">${r.type === 'show' ? 'Tickets' : 'Details'}</a>` : '';
const place = (r) => `${esc(r.venue)}, ${esc(r.city)}`;
const dateTag = (r) => `<time datetime="${esc(r.date)}${r.time ? `T${esc(r.time)}` : ''}">${esc(fmtDate(r.date))}</time>`;

/** Markup per DESIGN.md (classes from prototype/styles.css). A poster is only ever a full show, never an open mic. */
const POSTER_ART = `<picture><img class="poster-art graded" src="/media/c-poster-600.webp" srcset="/media/c-poster-600.webp 600w, /media/c-poster-1000.webp 1000w" sizes="(min-width: 640px) 23rem, 50vw" width="600" height="750" alt="" loading="lazy"></picture>`;
export function posterHtml(r) {
  const meta = [r.time && fmtTime(r.time), r.with && `With ${r.with}`].filter(Boolean).map(esc).join(', ');
  return `<li class="poster">${POSTER_ART}<p class="poster-date fit"><span class="ln ln-date">${dateTag(r)}</span></p>${cal(r, true)}<p class="poster-place">${place(r)}</p>${meta ? `<p class="poster-meta">${meta}</p>` : ''}${action(r)}</li>`;
}
/** `past` rows (Played) get no calendar link: past shows have no .ics. */
export function rowHtml(r, { past = false } = {}) {
  const extra = [r.type === 'open-mic' ? 'Open mic' : 'Show', r.time && fmtTime(r.time), r.with && `With ${r.with}`].filter(Boolean).map(esc).join(', ');
  return `<li class="row"><span class="row-date">${dateTag(r)}</span>${past ? '' : cal(r, false)}<span class="row-text"><span class="row-place">${place(r)}</span><span class="row-kind">${extra}</span></span>${action(r)}</li>`;
}
// Kept for callers that want one plain row.
export const showHtml = rowHtml;

const upcomingHtml = (list) => {
  const [first, ...rest] = list;
  const items = first.type === 'show' ? posterHtml(first) + rest.map((r) => rowHtml(r)).join('') : list.map((r) => rowHtml(r)).join('');
  return `<ul class="shows">${items}</ul>`;
};
const playedHtml = (list) => list.length ? `<div class="played"><h2>Played</h2><ul class="rows">${list.map((r) => rowHtml(r, { past: true })).join('')}</ul></div>` : '';
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

/** MusicEvent JSON-LD <script> for the upcoming shows ('' when none). JSON.stringify, then '<' escaped so no value can close the tag. */
export function showsLdHtml(rows, now = new Date()) {
  const ok = rows.filter((r) => { try { return validateShow(r); } catch { return false; } });
  const events = splitShows(ok, now).upcoming.map((r) => {
    let startDate = r.date;
    if (r.time) { // the New York offset on that date, e.g. -05:00 or -04:00
      const off = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'longOffset' }).formatToParts(new Date(`${r.date}T${r.time}:00Z`)).find((p) => p.type === 'timeZoneName').value.replace('GMT', '');
      startDate = `${r.date}T${r.time}:00${off || '+00:00'}`;
    }
    const m = r.city.match(/^(.+?),\s*([A-Za-z]{2})$/);
    return { '@context': 'https://schema.org', '@type': 'MusicEvent', name: `GLucak at ${r.venue}`, startDate,
      eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: r.venue, address: { '@type': 'PostalAddress', addressLocality: m ? m[1] : r.city, ...(m && { addressRegion: m[2].toUpperCase() }) } },
      performer: { '@type': 'MusicGroup', name: 'GLucak' }, ...(r.type === 'show' && r.link && { offers: { '@type': 'Offer', url: r.link } }) };
  });
  return events.length ? `<script type="application/ld+json">${JSON.stringify(events).replace(/</g, '\\u003c')}</script>` : '';
}

const dayDiff = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 864e5);
const link = (href, text) => `<a href="${esc(href)}"${href === '#shows' ? '' : ' rel="noopener"'}>${esc(text)}</a>`; // no aria-label: the visible text is the name (WCAG 2.5.3, D57)

/**
 * The Now line (D45/D57, copy in docs/copy/round2.md), picked per visit by New York day. In order:
 * B release day "Out today: Title" (beats an upcoming release); A release 1-14 days ahead "Out Nov 13: Title"; C 1-7 days after "Out now: Title";
 * D next show or open mic within 14 days "Show Nov 20: Venue, City" / "Open mic Nov 20: ..." ("Show today: ..." on the day), linking #shows;
 * E newest release "Out now: Title". '' if nothing applies (the static release line then stays). Escaped; release links http(s) only; never "Pre-save".
 * Shows are validated rows; `releases` is the raw releases.json list.
 */
export function nowHtml(rows, now = new Date(), releases = []) {
  const today = etDay(now);
  const rel = releases.filter((r) => r && typeof r.title === 'string' && r.title.trim() && typeof r.date === 'string' && validDate(r.date) && httpUrl(r.link))
    .map((r) => ({ ...r, d: dayDiff(r.date, today) })).sort((a, b) => a.d - b.d);
  const b = rel.find((r) => r.d === 0), a = rel.find((r) => r.d >= 1 && r.d <= 14);
  const c = rel.filter((r) => r.d < 0 && r.d >= -7).pop();
  if (b) return link(b.link, `Out today: ${b.title}`);
  if (a) return link(a.link, `Out ${monD(a.date)}: ${a.title}`);
  if (c) return link(c.link, `Out now: ${c.title}`);
  const ok = rows.filter((r) => { try { return validateShow(r); } catch { return false; } });
  const next = splitShows(ok, now).upcoming[0];
  if (next && dayDiff(next.date, today) <= 14) {
    const kind = next.type === 'open-mic' ? 'Open mic' : 'Show';
    return link('#shows', `${kind} ${next.date === today ? 'today' : monD(next.date)}: ${next.venue}, ${next.city}`);
  }
  const latest = rel.filter((r) => r.d < 0).pop();
  return latest ? link(latest.link, `Out now: ${latest.title}`) : '';
}

// ---------- Add to calendar: one .ics per upcoming show (RFC 5545), GET /shows/<showId>.ics ----------
const CRLF = '\r\n';
/** TEXT value: backslash, semicolon, comma and newlines escaped; other control characters dropped. */
const icsText = (v) => String(v).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r\n|\r|\n/g, '\\n').replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '');
/** Fold at 75 octets (first line) / 74 + the leading space (the rest), never inside a UTF-8 character. */
function fold(line) {
  const out = [];
  let cur = '', bytes = 0;
  for (const ch of line) {
    const n = Buffer.byteLength(ch);
    if (bytes + n > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0; }
    cur += ch; bytes += n;
  }
  out.push(cur);
  return out.map((l, i) => (i ? ' ' : '') + l).join(CRLF);
}
const stamp = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
const VTIMEZONE = ['BEGIN:VTIMEZONE', 'TZID:America/New_York',
  'BEGIN:DAYLIGHT', 'TZOFFSETFROM:-0500', 'TZOFFSETTO:-0400', 'TZNAME:EDT', 'DTSTART:19700308T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU', 'END:DAYLIGHT',
  'BEGIN:STANDARD', 'TZOFFSETFROM:-0400', 'TZOFFSETTO:-0500', 'TZNAME:EST', 'DTSTART:19701101T020000', 'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU', 'END:STANDARD', 'END:VTIMEZONE'];

/** The .ics text for one show row: all-day until the row has a time, then a 2 hour event in New York time. CRLF lines, folded, escaped. */
export function icsFor(r, now = new Date()) {
  const url = httpUrl(r.link) ? new URL(r.link).href : null; // .href is percent-encoded: no control characters can ride in
  const desc = [r.type === 'open-mic' ? 'GLucak at an open mic.' : 'GLucak live.', r.with && `With ${r.with}.`, `${r.venue}, ${r.city}`, url && `${r.type === 'show' ? 'Tickets' : 'Details'}: ${url}`].filter(Boolean);
  const ymd = r.date.replace(/-/g, '');
  let when;
  if (r.time) { // ponytail: no end time in the data, so a fixed 2 hour slot; add an end field if Gabe wants one
    const end = new Date(Date.parse(`${r.date}T${r.time}:00Z`) + 2 * 3600e3);
    when = [`DTSTART;TZID=${TZ}:${ymd}T${r.time.replace(':', '')}00`, `DTEND;TZID=${TZ}:${stamp(end).slice(0, 15)}`];
  } else {
    when = [`DTSTART;VALUE=DATE:${ymd}`, `DTEND;VALUE=DATE:${new Date(Date.parse(`${r.date}T00:00:00Z`) + 864e5).toISOString().slice(0, 10).replace(/-/g, '')}`];
  }
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GLucak//glucak.com//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...(r.time ? VTIMEZONE : []),
    'BEGIN:VEVENT', `UID:${showId(r)}@glucak.com`, `DTSTAMP:${stamp(now).slice(0, 15)}Z`, ...when,
    `SUMMARY:${icsText(r.type === 'open-mic' ? `GLucak open mic at ${r.venue}` : `GLucak at ${r.venue}`)}`,
    `LOCATION:${icsText(`${r.venue}, ${r.city}`)}`, `DESCRIPTION:${icsText(desc.join('\n'))}`, ...(url ? [`URL:${url}`] : []), 'END:VEVENT', 'END:VCALENDAR'];
  return lines.map(fold).join(CRLF) + CRLF;
}

/** The .ics text for an upcoming show by id, or null (unknown id, invalid row or a past show: the route answers 404). */
export function icsById(rows, id, now = new Date()) {
  const ok = rows.filter((r) => { try { return validateShow(r); } catch { return false; } });
  const hit = splitShows(ok, now).upcoming.find((r) => showId(r) === id);
  return hit ? icsFor(hit, now) : null;
}
