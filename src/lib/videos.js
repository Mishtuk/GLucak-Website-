// Gabe's videos (A3, D123, D127): the Videos tab's check, the order the site shows them in, and the Records block
// (Home, /videos/, the /shows/ watch row) and /videos/'s "Now showing" rendered live from the saved list at the
// <!--gl:records-->, <!--gl:records-more-->, <!--gl:records-compact--> and <!--gl:vnow--> markers. Pure (no fs): used by
// server.js and tests. The markup is a copy of src/components/Records.astro and src/pages/videos/index.astro; test/edit-videos.test.js
// renders the shipped list and compares it with the build, byte for byte, so the two cannot drift.
import { curly, esc, etDay, validDate } from './shows.js';
import { groupVideos } from '../components/videos.js';

export const ID = /^[\w-]{11}$/; // a YouTube video id
export const SITE_KINDS = ['music-video', 'lyric-video', 'live']; // what the site lists; 'other' rows (Shorts) stay in the file, out of the tab
export const LAYOUTS = ['a', 'b', 'c', 'd'], STYLES = ['toner', 'print', 'mono'];
export const MAX_TITLE = 120, MAX_VIDEOS = 80;
// Hard rule 1 (Gabe, 2026-11-06): these never show. Same pattern as FLASHING in src/components/content.js (a test keeps them equal).
export const FLASHING = /running the gauntlet|earned your stripes.*visuali[sz]er/i;
const SHORTS = 'https://www.youtube.com/channel/UCha7GtkOI9A0dzbTG3igbLg/shorts'; // content.js YOUTUBE + /shorts

/** The 11-character id from a pasted YouTube link (watch, youtu.be or Shorts), or null for anything else. */
export function parseYouTubeLink(text) {
  if (typeof text !== 'string') return null;
  const s = text.trim();
  if (!s || s.length > 200 || /[\x00-\x20\x7f]/.test(s)) return null; // the URL parser would quietly drop tabs and newlines
  let u;
  try { u = new URL(s); } catch { return null; }
  if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password || u.port) return null;
  const host = u.hostname.toLowerCase();
  let id = null;
  if (host === 'youtu.be') id = /^\/([^/]+)\/?$/.exec(u.pathname)?.[1];
  else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)) id = u.pathname === '/watch' ? u.searchParams.get('v') : /^\/shorts\/([^/]+)\/?$/.exec(u.pathname)?.[1];
  return typeof id === 'string' && ID.test(id) ? id : null;
}

// A fixed hash of the id (FNV-1a): a new video keeps its sleeve layout and print look whatever is hidden or put first.
const h32 = (s) => { let h = 0x811c9dc5; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; };
export const layoutFor = (id) => LAYOUTS[h32(id) % 4];
export const styleFor = (id) => STYLES[(h32(id) >>> 2) % 3];

/** The order the site shows: music (newest first, lyric after), the lead live clip, other live; one row put first goes above all. */
export function displayOrder(rows) {
  const list = (Array.isArray(rows) ? rows : []).filter((v) => v && typeof v === 'object' && SITE_KINDS.includes(v.kind));
  const pin = list.find((v) => v.first === true && v.hidden !== true);
  const g = groupVideos(pin ? list.filter((v) => v !== pin) : list, FLASHING);
  return [...(pin && ID.test(pin.id ?? '') && !FLASHING.test(`${pin.title} ${pin.name ?? ''}`) ? [pin] : []), ...g.music, ...(g.lead ? [g.lead, ...g.live] : g.live)];
}
/** What the tab edits and History keeps: the listed kinds, in the site's order (Shorts stay in the file, out of sight). */
export const tabRows = (rows) => displayOrder(rows);
/** What the public pages show: not hidden, ticked "No fast flashing lights", a real id. */
// Public pages only: a damaged or hand-edited file can never put a bad id (it goes into href/src unescaped) or a flashing video on the site.
const TEXT = ['title', 'name', 'with', 'place'];
export const shownRows = (rows) => displayOrder((Array.isArray(rows) ? rows : [])
  .filter((v) => v?.hidden !== true && v?.noFlash === true && typeof v.id === 'string' && ID.test(v.id)
    && !FLASHING.test(`${v.title ?? ''} ${v.name ?? ''}`))
  .map((v) => { const o = { ...v }; for (const k of TEXT) if (o[k] != null && typeof o[k] !== 'string') o[k] = String(o[k]); return o; }));

const MSG = {
  link: 'That isn’t a YouTube link. Paste the link from YouTube’s Share button.', noLink: 'Add the YouTube link.', title: 'Add the title.',
  long: `Keep each field under ${MAX_TITLE} letters.`, kind: 'Pick Music video or Live.', dup: 'That video is already in the list.',
  flash: 'Tick the box once you’ve watched it. Leave out anything that flashes quickly.', flashing: 'That video can’t go on this site.', shape: 'This row is broken. Reload the page.',
};
const text = (v) => (typeof v === 'string' ? v.trim() : v == null ? '' : null);
const CTRL = new RegExp('[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\u2028\u2029]'); // control characters and line separators

/** `list` is what the Videos tab sends; `keep` the rows it never shows (Shorts), added back. A visible row needs noFlash === true.
 *  Returns { rows } (in the site's order, Shorts last) or { errors: [{ row, message }] }. */
export function checkVideos(list, keep = []) {
  if (!Array.isArray(list)) return { errors: [{ row: null, message: 'Nothing to save.' }] };
  if (list.length > MAX_VIDEOS) return { errors: [{ row: null, message: `That’s more than ${MAX_VIDEOS} videos. Hide the ones you don’t need.` }] };
  const rows = [], errors = [], seen = new Set();
  list.forEach((r, i) => {
    const bad = (m) => errors.push({ row: i, message: `Video ${i + 1}: ${m}` });
    if (!r || typeof r !== 'object' || Array.isArray(r)) return bad(MSG.shape);
    const hasId = r.id !== undefined && r.id !== null && r.id !== '';
    if (!hasId && !(typeof r.link === 'string' && r.link.trim())) return bad(MSG.noLink);
    const id = hasId ? (typeof r.id === 'string' && ID.test(r.id) ? r.id : null) : parseYouTubeLink(r.link);
    if (!id) return bad(MSG.link);
    const title = text(r.title), name = text(r.name), withs = text(r.with), place = text(r.place);
    if (!title) return bad(MSG.title);
    if ([title, name, withs, place].some((v) => v === null || v.length > MAX_TITLE || CTRL.test(v))) return bad(MSG.long);
    if (!SITE_KINDS.includes(r.kind)) return bad(MSG.kind);
    if (FLASHING.test(`${title} ${name ?? ''}`)) return bad(MSG.flashing);
    const hidden = r.hidden === true;
    if (!hidden && r.noFlash !== true) return bad(MSG.flash); // the box cannot be skipped: the server refuses, whatever the page sends
    if (seen.has(id)) return bad(MSG.dup);
    seen.add(id);
    const crop = Array.isArray(r.crop) && r.crop.length === 4 && r.crop.every((n) => Number.isFinite(n) && n >= 0 && n <= 1) ? r.crop : null;
    rows.push({
      id, title, date: r.date === null ? null : typeof r.date === 'string' && validDate(r.date) ? r.date : etDay(), kind: r.kind, featured: r.featured === true,
      ...(name ? { name } : {}), ...(withs ? { with: withs } : {}), ...(place ? { place } : {}), ...(r.lead === true ? { lead: true } : {}), ...(crop ? { crop } : {}),
      noFlash: r.noFlash === true, ...(hidden ? { hidden: true } : {}), ...(r.first === true && !hidden ? { first: true } : {}),
      layout: LAYOUTS.includes(r.layout) ? r.layout : layoutFor(id), style: STYLES.includes(r.style) ? r.style : styleFor(id),
    });
  });
  if (errors.length) return { errors };
  const firsts = rows.filter((v) => v.first);
  for (const v of firsts.slice(1)) delete v.first; // one row at the top
  const others = (Array.isArray(keep) ? keep : []).filter((v) => v && typeof v === 'object' && ID.test(v.id ?? '') && !SITE_KINDS.includes(v.kind) && !seen.has(v.id));
  return { rows: [...displayOrder(rows), ...others] };
}

// ---------- the Records block, from the saved list ----------
const pad = (n) => String(n).padStart(2, '0');
const metaOf = (v, sep) => [v.place ? `Live at ${v.place}` : v.kind === 'lyric-video' ? 'Lyric video' : 'Music video', v.with].filter(Boolean).join(sep);
const nameOf = (v) => curly(v.name ?? v.title);
const watch = (id) => `https://www.youtube.com/watch?v=${id}`;
const DIALOG = '<dialog class="rec-open" id="rec-open" aria-labelledby="ro-title"><div class="ro-in"><div class="ro-head"><div><h2 id="ro-title"></h2><p class="vid-meta ro-meta"></p></div><button type="button" class="ro-close">Close</button></div><div class="ro-stage"><span class="ro-disc" aria-hidden="true"></span><div class="ro-screen"></div></div></div></dialog>';

/** Home (`more`), /videos/ (default) or the /shows/ watch row (`compact`), then the dialog. `hasStill(id)`: both sleeve files exist. */
export function recordsHtml(rows, { more = false, compact = false } = {}, hasStill = () => false) {
  const every = shownRows(rows), all = compact ? every.slice(0, 3) : every;
  const sep = more || compact ? ', ' : ' · '; // Home prints no middle dot (test 20d)
  const lis = all.map((v, i) => {
    const art = hasStill(v.id) ? `/media/sleeves/${v.id}` : null, t = esc(nameOf(v)), m = esc(metaOf(v, sep)), n = pad(i + 1);
    const img = art ? `<img class="rec-img" src="${art}-320.webp" srcset="${art}-320.webp 320w, ${art}-640.webp 640w" sizes="(min-width: 900px) 22vw, 42vw" width="640" height="640" alt="" loading="lazy" decoding="async">` : '';
    return `<li class="rec rec-${LAYOUTS.includes(v.layout) ? v.layout : 'abcd'[i % 4]}"><a class="rec-link" href="${watch(v.id)}" rel="noopener" data-yt="${v.id}" data-title="${t}" data-meta="${m}"><span class="rec-disc" aria-hidden="true"><span class="rec-label">${n}</span></span><span class="rec-sleeve" aria-hidden="true">${img}<span class="rec-type"><span class="rec-artist">GLucak</span><span class="rec-name"><span>${t}</span></span><span class="rec-no"><span class="rec-no-l">No. </span>${n}</span></span></span><span class="rec-cap"><span class="v2-vtitle">${t}</span><span class="vid-meta">${m}</span></span></a></li>`;
  }).join('');
  let block = '';
  if (all.length && compact) block = `<div class="records-watch" id="shows-video"><h2><a class="h-go" href="/videos/">Watch<span class="vh"> all videos</span></a></h2><ul class="records records-static">${lis}</ul></div>`;
  else if (all.length) {
    block = `<section class="band band-crate" data-hs="row" aria-labelledby="h-crate"><div class="wrap"><h2 class="crate-h" id="h-crate">${more ? '<a class="h-go" href="/videos/">Records<span class="vh"> all videos</span></a>' : 'Records'}</h2>`
      + `<p class="crate-sub">Every music video and live clip. Scroll to flip through, then press a record to open it.</p><ul class="records">${lis}</ul>`
      + `<p class="start-line vid-more">${more ? '<a class="go" href="/videos/">All videos</a>' : `<a class="go" href="${SHORTS}" rel="noopener">New shorts most weeks on YouTube.</a>`}</p></div></section>`;
  }
  return block + DIALOG;
}

/** /videos/'s "Now showing": the first video the site shows (the Records' No. 01). `still(id)`: { wide: bool, sleeve: bool }. */
export function nowShowingHtml(rows, still = () => ({})) {
  const lead = shownRows(rows)[0];
  if (!lead) return '<p class="vid-lead">No videos here right now. <a class="go" href="https://www.youtube.com/channel/UCha7GtkOI9A0dzbTG3igbLg" rel="noopener">GLucak on YouTube</a></p>';
  const s = still(lead.id), t = esc(nameOf(lead));
  const img = s.wide ? `<img class="yt-img" src="/media/videos/${lead.id}-640.webp" srcset="/media/videos/${lead.id}-640.webp 640w, /media/videos/${lead.id}-1280.webp 1280w" sizes="(min-width: 1200px) 1100px, 92vw" width="1280" height="720" alt="" loading="eager" fetchpriority="high" decoding="async">`
    : s.sleeve ? `<img class="yt-img" src="/media/sleeves/${lead.id}-640.webp" width="1280" height="720" alt="" loading="eager" decoding="async">` : ''; // a video Gabe added has only the square sleeve
  return `<div class="v2-vid now-showing" id="now-showing"><p class="now-label">Now showing</p><a href="${watch(lead.id)}" rel="noopener" data-yt="${lead.id}" data-title="${t}"><span class="v2-thumb">${img}<span class="yt-play" aria-hidden="true"></span></span><span class="v2-vtitle">${t}</span></a><p class="vid-meta"><span>${esc(metaOf(lead, ' · '))}</span></p></div>`;
}

const swap = (html, name, out) => (html.includes(`<!--gl:${name}-->`) ? html.replace(new RegExp(`<!--gl:${name}-->[\\s\\S]*?<!--/gl:${name}-->`), () => `<!--gl:${name}-->${out}<!--/gl:${name}-->`) : html);
/** Fill every video marker in a page from the saved list. `has`: { sleeve(id), wide(id) } say which stills exist. */
export function fillVideos(html, rows, has) {
  let h = html;
  const o = (opts) => recordsHtml(rows, opts, has.sleeve);
  h = swap(h, 'records', o({})); h = swap(h, 'records-more', o({ more: true })); h = swap(h, 'records-compact', o({ compact: true }));
  return swap(h, 'vnow', nowShowingHtml(rows, (id) => ({ wide: has.wide(id), sleeve: has.sleeve(id) })));
}
export const VIDEO_MARKER = /<!--gl:(records|records-more|records-compact|vnow)-->/;
