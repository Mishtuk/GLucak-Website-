// The editable site text (Gabe's Bio and IDENTITY tabs, DESIGN 28i): validate, and render escaped HTML for the
// <!--gl:bio-->, <!--gl:home-bio-->, <!--gl:identity--> markers. Pure (no fs): used by server.js, the Astro pages and tests.
import { curly, esc, etDay, httpUrl, validDate } from './shows.js';

export const MAX_HOME = 400, MAX_BIO = 4000, MAX_LINK = 300;
const CTRL = new RegExp('[\\x00-\\x08\\x0b\\x0c\\x0e-\\x1f\\x7f\\u2028\\u2029]'); // every control character; a bio may still hold newline and carriage return
const https = (u) => { try { return new URL(u).protocol === 'https:'; } catch { return false; } };
const dayDiff = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 864e5);

const MSG = {
  home: 'Add the Home sentence.', homeLong: `The Home sentence is too long. ${MAX_HOME} letters at most.`, homeLine: 'Keep the Home sentence on one line.',
  bio: 'Add the About bio.', bioLong: `The About bio is too long. ${MAX_BIO} letters at most.`,
  ctrl: 'That text has a character the site can’t show. Retype it.',
  date: 'Pick a real release date.', link: 'The Pre-save link has to start with https://', linkLong: `The Pre-save link is too long. ${MAX_LINK} letters at most.`,
  shape: 'Nothing to save.',
};

/** `input` is what one tab sends (any of homeBio, bio, identity); it is merged onto `base` (the saved site), and the whole
 * result must be valid. Unknown keys are dropped. Returns { rows: site } (same name as the other lists) or { errors }. */
export function checkSite(input, base = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { errors: [{ row: null, message: MSG.shape }] };
  const s = { ...base }, errors = [];
  for (const k of ['homeBio', 'bio', 'identity']) if (k in input) s[k] = input[k];
  const bad = (message) => errors.push({ row: null, message });
  const text = (v) => (typeof v === 'string' ? v.replace(/\r\n?/g, '\n').trim() : null);
  const home = text(s.homeBio), bio = text(s.bio);
  if (!home) bad(MSG.home); else if (home.length > MAX_HOME) bad(MSG.homeLong); else if (/\n/.test(home)) bad(MSG.homeLine); else if (CTRL.test(home)) bad(MSG.ctrl);
  if (!bio) bad(MSG.bio); else if (bio.length > MAX_BIO) bad(MSG.bioLong); else if (CTRL.test(bio)) bad(MSG.ctrl);
  const id = s.identity, date = typeof id?.date === 'string' ? id.date.trim() : '', link = typeof id?.link === 'string' ? id.link.trim() : '';
  if (!validDate(date)) bad(MSG.date);
  if (link.length > MAX_LINK) bad(MSG.linkLong); else if (!https(link) || CTRL.test(link) || /\s/.test(link)) bad(MSG.link);
  return errors.length ? { errors } : { rows: { homeBio: home, bio, identity: { date, link } } };
}

const ok = (s) => checkSite(s).rows; // render-time guard: a hand-edited bad file renders nothing, and the static page stays
/** The paragraphs of the About bio: a blank line splits them; the second is the lead (as the page was built). Text only. */
export const bioHtml = (s) => `<!--gl:bio-->${ok(s)?.bio.split(/\n\s*\n/).map((p, i) => `<p${i === 1 ? ' class="bio-lead"' : ''}>${esc(curly(p.replace(/\s*\n\s*/g, ' ').trim()))}</p>`).join('') ?? ''}<!--/gl:bio-->`;
export const homeBioHtml = (s) => `<!--gl:home-bio-->${ok(s) ? esc(curly(ok(s).homeBio)) : ''}<!--/gl:home-bio-->`;

/** IDENTITY's state under its name (DESIGN 7): days to go + Pre-save, or Out now + Listen from the day. Days count per request. */
export function identityHtml(s, today = etDay()) {
  const id = ok(s)?.identity;
  let inner = '';
  if (id) {
    const days = dayDiff(id.date, today), link = esc(id.link);
    const pretty = new Date(`${id.date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    inner = days <= 0
      ? `<p class="identity-when">Out now. <a class="text-link" href="${link}" rel="noopener" aria-label="Listen to IDENTITY">Listen</a></p>`
      : `<p class="identity-when identity-count"><time class="identity-date" datetime="${id.date}">${pretty}</time> <span>${days} ${days === 1 ? 'day' : 'days'} to go</span></p><a class="btn btn-line" href="${link}" rel="noopener" aria-label="Pre-save IDENTITY">Pre-save</a>`;
  }
  return `<!--gl:identity-->${inner}<!--/gl:identity-->`;
}

/** Fill every site marker in a page from the saved site; an invalid site leaves the page as built. */
export function fillSite(html, s, today = etDay()) {
  if (!ok(s)) return html;
  const swap = (h, name, out) => (h.includes(`<!--gl:${name}-->`) ? h.replace(new RegExp(`<!--gl:${name}-->[\\s\\S]*?<!--/gl:${name}-->`), () => out) : h);
  return swap(swap(swap(html, 'bio', bioHtml(s)), 'home-bio', homeBioHtml(s)), 'identity', identityHtml(s, today));
}
