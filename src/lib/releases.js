// The releases list (Gabe's Releases tab, DESIGN 28i): validate, and render escaped HTML for the <!--gl:crate-->, <!--gl:latest-->
// and <!--gl:listen--> markers. Pure (no fs, no Vite): the Astro pages call it at build, server.js on every request, so both agree.
import { curly, esc, etDay, httpUrl, validDate } from './shows.js';

export const MAX_RELEASES = 200, MAX_TITLE = 120, MAX_ARTISTS = 120, MAX_LINK = 300;
// Shipped art in /media/covers/, or an upload (server-made random name, always webp). No "..", no other folders.
export const COVER = /^\/media\/(?:covers\/[a-z0-9]+(?:-[a-z0-9]+)*\.webp|uploads\/[a-f0-9]{32}\.webp)$/;
const CTRL = new RegExp('[\x00-\x1f\x7f-\x9f\u2028\u2029]'); // a title, credit or link is one line of plain characters
const https = (u) => { try { return new URL(u).protocol === 'https:'; } catch { return false; } };
const dayDiff = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 864e5);
const GO = 'https://wingsmusic.lnk.to/370407-Go';

/** "Sep 4, 2026" (music.md date line); '' with no date. */
export const dateLine = (d) => (d ? new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '');
const shortDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
/** Spotify's credit line ("GLucak, J-BOY") only when it names someone besides GLucak. */
export const credit = (r) => (r.artists && r.artists.trim() !== 'GLucak' ? r.artists : null);
export const TYPE_TAG = { single: 'Single', ep: 'EP', album: 'Album' };
/** The type tag on a crate tile: the remix album says so (answers row 8). */
export const typeTag = (r) => (r.remix ? 'Remix album' : TYPE_TAG[r.type]);
/** The tile button for a release: Listen when out; Pre-save only for a smart link (lnk.to); anything else coming points at Spotify (no pre-save exists). */
export function tileAction(r) {
  if (!r.coming) return 'Listen';
  let host = '';
  try { host = new URL(r.link).hostname; } catch { /* no link, no pre-save */ }
  return /(^|\.)lnk\.to$/.test(host) ? 'Pre-save' : /(^|\.)spotify\.com$/.test(host) ? 'Follow on Spotify' : 'Listen';
}

const MSG = {
  shape: 'Nothing to save.', many: `That’s more than ${MAX_RELEASES} releases. Delete some first.`, row: 'This row is broken. Delete it and add it again.',
  title: `Add the title (up to ${MAX_TITLE} letters).`, reserved: 'IDENTITY has its own tab. Pick another title.',
  type: 'Pick Single, EP, Album or Remix album.', date: 'Pick a real release date.',
  link: 'The link has to start with https://', linkLong: `The link is too long. ${MAX_LINK} letters at most.`,
  artists: `Keep the artists on one line, up to ${MAX_ARTISTS} letters.`, cover: 'The cover has to be one you uploaded here. Upload it again, or empty the cover field.',
};
// The form's four types: Remix album is an album with remix: true.
const TYPES = { single: ['single', false], ep: ['ep', false], album: ['album', false], 'remix-album': ['album', true] };

/** `list` is what the Releases tab sends; `keep` is the saved rows the tab never shows (IDENTITY), added back unchanged.
 * Known fields only, strings trimmed, empty optional ones dropped. Returns { rows } or { errors: [{ row, message }] }. */
export function checkReleases(list, keep = []) {
  if (!Array.isArray(list)) return { errors: [{ row: null, message: MSG.shape }] };
  if (list.length > MAX_RELEASES) return { errors: [{ row: null, message: MSG.many }] };
  const rows = [], errors = [];
  list.forEach((r, i) => {
    const bad = (m) => errors.push({ row: i, message: `Release ${i + 1}: ${m}` });
    if (!r || typeof r !== 'object' || Array.isArray(r)) return bad(MSG.row);
    const s = (v) => (typeof v === 'string' ? v.trim() : v == null ? '' : null);
    const title = s(r.title), date = s(r.date), link = s(r.link), artists = s(r.artists), cover = s(r.cover);
    const [type, remix] = TYPES[r.remix === true && r.type === 'album' ? 'remix-album' : r.type] ?? [];
    if (!title || title.length > MAX_TITLE || CTRL.test(title)) return bad(MSG.title);
    if (title.toUpperCase() === 'IDENTITY') return bad(MSG.reserved);
    if (!type) return bad(MSG.type);
    if (!date || !validDate(date)) return bad(MSG.date);
    if (link == null || link.length > MAX_LINK) return bad(MSG.linkLong);
    if (!https(link) || CTRL.test(link) || /\s/.test(link)) return bad(MSG.link);
    if (artists == null || artists.length > MAX_ARTISTS || CTRL.test(artists)) return bad(MSG.artists);
    if (cover == null || (cover && !COVER.test(cover))) return bad(MSG.cover);
    rows.push({ title, date, type, ...(remix ? { remix: true } : {}), link, cover: cover || null, ...(artists ? { artists } : {}) });
  });
  return errors.length ? { errors } : { rows: [...rows, ...keep] };
}

// Render-time guard: a hand-edited bad file shows less, never raw HTML. IDENTITY is its own block.
const shown = (rows) => (Array.isArray(rows) ? rows : []).filter((r) => r && typeof r.title === 'string' && r.title.trim() && r.title !== 'IDENTITY' && httpUrl(r.link));
const newest = (rows) => [...rows].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')); // undated sorts last
const dated = (rows) => shown(rows).filter((r) => typeof r.date === 'string' && validDate(r.date));
const swap = (h, name, out) => (h.includes(`<!--gl:${name}-->`) ? h.replace(new RegExp(`<!--gl:${name}-->[\\s\\S]*?<!--/gl:${name}-->`), () => out) : h);

/** DESIGN 22: the sleeve for a release with no cover file, built from its own title and type. Never an image file, never in a share card (D51). */
export function noCoverHtml({ title, type, when, label, cls }) {
  const longest = Math.max(...title.split(/\s+/).map((w) => w.length));
  const fs = Math.min(100 / (longest * 0.55), Math.sqrt((100 * 68 * 0.7) / (title.length * 0.414)), 40).toFixed(1);
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"';
  return `<span class="nocover ${cls}" style="--nc-fs: ${fs}cqi" ${a11y}><span class="nocover-title" aria-hidden="true">${esc(title)}</span><span class="nocover-type" aria-hidden="true"><span>${esc(TYPE_TAG[type] ?? 'Release')}</span>${when ? `<span>${esc(when)}</span>` : ''}</span></span>`;
}
const cover = (r, title, o) => (r.cover && COVER.test(r.cover) ? o.img : noCoverHtml({ title, type: r.type, ...o.no }));

/** Every release for the Music crate (DESIGN 16a), newest first; `coming` = after the New York day. */
export function crateHtml(rows, today = etDay()) {
  const tiles = newest(shown(rows)).map((r) => {
    const coming = Boolean(r.date) && validDate(r.date) && r.date > today, title = curly(r.title), tag = typeTag(r);
    const art = cover(r, title, { img: `<img class="tile-art" src="${esc(r.cover)}" alt="" width="300" height="300" loading="lazy">`, no: { cls: 'tile-art', when: coming ? shortDate(r.date) : undefined } });
    const meta = `${tag && r.type !== 'single' ? `<span class="tile-type">${esc(tag)}</span>` : ''}${coming ? `Out ${esc(dateLine(r.date))}` : esc(dateLine(validDate(r.date ?? '') ? r.date : ''))}`;
    return `<li class="tile"${coming ? ' data-state="coming"' : ''}><a class="tile-link" href="${esc(r.link)}" rel="noopener">${art}<span class="tile-text"><h3 class="tile-title">${esc(title)}</h3>${credit(r) ? `<span class="tile-artists">${esc(credit(r))}</span>` : ''}<span class="tile-meta">${meta}</span><span class="tile-go">${esc(tileAction({ ...r, coming }))}</span></span></a></li>`;
  });
  return `<!--gl:crate-->${tiles.length ? `<ul class="crate">${tiles.join('')}</ul>` : ''}<!--/gl:crate-->`;
}

/** Home: the newest released release (cover, title, Listen) and the "Next:" line for the soonest coming one. */
export function latestHtml(rows, today = etDay()) {
  const out = newest(dated(rows).filter((r) => r.date <= today))[0] ?? { title: 'Go', type: 'single', link: GO };
  const nx = dated(rows).filter((r) => r.date > today).sort((a, b) => a.date.localeCompare(b.date))[0];
  const title = curly(out.title), c = credit(out);
  const art = cover(out, title, { img: `<img class="v2-cover" src="${esc(out.cover)}" alt="${esc(title)} cover art" width="400" height="400">`, no: { cls: 'v2-cover', label: `${title}: no cover art yet` } });
  const article = `<article class="v2-rel">${art}<div class="v2-rel-text"><p class="v2-kicker"><span class="v2-kicker-type">Latest ${esc(out.type ?? 'release')}</span>${out.date ? ` <span>${esc(dateLine(out.date).replaceAll(' ', ' '))}</span>` : ''}</p><h3>${esc(title)}</h3>${c ? `<p class="credit">${esc(c)}</p>` : ''}<a class="btn btn-solid" href="${esc(out.link)}" rel="noopener" aria-label="Listen to ${esc(title)}">Listen</a></div></article>`;
  const next = nx ? `<p class="next-rel">Next: ${esc(curly(nx.title))}, ${esc(shortDate(nx.date))}.${tileAction({ ...nx, coming: true }) === 'Pre-save' ? ` <a href="${esc(nx.link)}" rel="noopener" aria-label="Pre-save ${esc(curly(nx.title))}">Pre-save</a>.` : ''}</p>` : '';
  return `<!--gl:latest-->${article}${next}<!--/gl:latest-->`;
}

/** Music: "Listen everywhere" goes to the newest released release. */
export function listenHtml(rows, today = etDay()) {
  const r = newest(dated(rows).filter((x) => x.date <= today))[0] ?? { title: 'Go', link: GO };
  return `<!--gl:listen--><a class="under-link" href="${esc(r.link)}" rel="noopener" aria-label="Listen everywhere: ${esc(curly(r.title))}">Listen everywhere</a><!--/gl:listen-->`;
}

/** Fill every release marker in a page from the saved list. */
export const fillReleases = (html, rows, today = etDay()) => swap(swap(swap(html, 'crate', crateHtml(rows, today)), 'latest', latestHtml(rows, today)), 'listen', listenHtml(rows, today));
