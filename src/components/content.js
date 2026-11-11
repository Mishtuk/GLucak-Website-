// Build-time content: era file, releases and videos. Missing data files fall back to marked placeholders.
import { etDay } from '../lib/shows.js';
import era from '../eras/identity.json';

export { era };
// Header look, one place: 'solid' = a solid dark band from the first paint (v2, follows D25); 'scrim' = the gradient scrim over the Home hero until you scroll.
export const HEADER_STYLE = 'solid';
// D21/D23: a "From Gabe" quote ships only after Gabe OKs it. Flip this when he does; until then no quote is in the page.
export const QUOTES_APPROVED = true; // Gabe OK'd both post quotes (answers row 16, 2026-11-11). D67: Home keeps ONE quote (RISE); the live one is not placed on any page.
const QUOTES = {
  rise: { text: 'God will always be with you, and will never leave you in the valley. Trust me, I know.', url: 'https://www.instagram.com/p/Dd6keDDDefE/', credit: 'GLucak, Instagram, Sep 2026' },
  // copy ig6 7: his own lyric line from his own post (Instagram 2026-10-15). Music only; one quote per page (D67). The Scenic Route line waits on its post date.
  who: { text: 'WHO I AM should depend on the one who came for me', url: 'https://www.instagram.com/p/DehP5uyihwM/', credit: 'GLucak, Instagram, Oct 2026' },
  // D67: the LIVE quote ('Hope to see you there!', YouTube zmhbfHppXNM) is off Home to keep D39's 5.8-screen cap.
};
/** The band's quote, or null (nothing renders). */
export const quote = (band) => (QUOTES_APPROVED ? QUOTES[band] ?? null : null);
export const PHOTO_CREDITS = {
  kealey: 'Photo: Alexander Kealey.', mccc: 'Video: Montgomery County Community College, MSP program group.',
  joseph: 'Video still: Joseph Lucak.', // camera on Duck, Dodge, Jump, Fight only
  yt: 'Video stills: GLucak on YouTube.', // Crooked Eye live stills: videographer unknown (asked Gabe, rights Q1)
  identity: 'IDENTITY cover: GLucak. Logo: Dave Bahm.', // Gabe made the cover, Dave Bahm the logo (answers row 3)
  cd: 'Photos: from the IDENTITY CD.', // photographer still open in Gabe's answers; put the name in when he says
  vladd: 'Video still: Vladd (Vladdtime).', // the Scenic Route live clip, filmed by Vladd (answers row 13)
};
// Image src -> the credit it needs. Pages list their credits by hand; test/credits.test.js scans each built page's images against this so they can't drift.
export const CREDIT_FOR = [
  [/\/media\/v2\/(belt|stage)-/, PHOTO_CREDITS.yt],
  [/covers\/identity|identity-art-/, PHOTO_CREDITS.identity],
  [/\/media\/cd-/, PHOTO_CREDITS.cd],
  [/videos\/aZNW63M_C2E-/, PHOTO_CREDITS.vladd],
  [/\/media\/v2\/garage-|videos\/K-OZiNvQB14-/, PHOTO_CREDITS.joseph],
  [/a-era-grade|a-night-/, PHOTO_CREDITS.kealey],
];
export const SITE_URL = (import.meta.env.SITE_URL ?? 'https://glucak.com').replace(/\/$/, '');
export const SPOTIFY_EMBED = 'https://open.spotify.com/embed/playlist/0D45boIc9xWAdDjz1uTDRo';
export const SPOTIFY_PLAYLIST = 'https://open.spotify.com/playlist/0D45boIc9xWAdDjz1uTDRo';
export const GO = 'https://wingsmusic.lnk.to/370407-Go';
// DESIGN 25e: IDENTITY's tracklist, from the CD back (Gabe, answers row 17). Track 12 is his favourite and the first single.
export const IDENTITY_TRACKS = ['IDENTITY', 'ChurchBoy', 'Single Kids', 'WYLD LOVE', 'Life Blood', 'Mayday Mayday', 'Light', 'Mere Reflection', 'Another Dimension', 'Trenches', 'Finish Strong', 'Scenic Route'];
export const IDENTITY_TRACKS_HEADING = 'IDENTITY tracklist';
export const IDENTITY_CREDIT = 'All songs written, recorded, produced, mixed and mastered by Gabriel Lucak'; // the CD back, sentence case, no final period (copy ig6 5)
export const PATREON_LINE = 'Back my projects and merch. Get early access to songs only the inner circle knows exist.'; // copy ig6 3, option A
const SCENIC_DAY = '2027-01-15';
/** Sign-up wording (copy ig6 1a): Kit is not set up, so only a heads-up is promised. After Scenic Route's day the old line returns. */
export function signupCopy() {
  return etDay() < SCENIC_DAY
    ? { label: 'Join the list. Scenic Route is coming Jan 15, and the first listen will be yours.', ok: "You're in. We'll tell you the day Scenic Route lands." }
    : { label: 'Get the next show and every new song first.', ok: "You're on the list." };
}
export const START = { title: 'Go', link: GO }; // DESIGN 24c, Q44: the "New here?" pick (variant: the playlist)
export const SOUNDCLOUD = 'https://soundcloud.com/glucak';
export const PATREON = 'https://patreon.com/GLucakMusic';
export const YOUTUBE = 'https://www.youtube.com/channel/UCha7GtkOI9A0dzbTG3igbLg';
// id = the icon symbol (Icons.astro). Order is the footer's (DESIGN 16b).
export const SOCIALS = [
  { id: 'instagram', name: 'Instagram', href: 'https://www.instagram.com/glucakofficial/' },
  { id: 'threads', name: 'Threads', href: 'https://www.threads.com/@glucakofficial' },
  { id: 'x', name: 'X', href: 'https://x.com/GLucakOfficial' },
  { id: 'youtube', name: 'YouTube', href: YOUTUBE },
  { id: 'spotify', name: 'Spotify', href: 'https://open.spotify.com/artist/1SxMTO4oSXDbNSNzxx7cVX' },
  { id: 'soundcloud', name: 'SoundCloud', href: SOUNDCLOUD },
  { id: 'patreon', name: 'Patreon', href: PATREON },
];

// import.meta.glob survives bundling (a URL relative to this file doesn't once Astro bundles it). Missing file = null.
const DATA = import.meta.glob('../data/*.json', { eager: true, import: 'default' });
const load = (name) => {
  const j = DATA[`../data/${name}.json`];
  if (!j) return null;
  return Array.isArray(j) ? j : j.items ?? j[name] ?? null;
};
const http = (u) => { try { return ['http:', 'https:'].includes(new URL(u).protocol); } catch { return false; } };
const newest = (rows) => [...rows].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')); // undated sorts last

export function releases() {
  // Only what's out by build day (New York). Upcoming ones (Who I Am, Scenic Route, IDENTITY) are in upcoming().
  // ponytail: decided at build time, so a release-day flip needs a rebuild that day (daily rebuild on the host).
  const today = etDay();
  const rows = (load('releases') ?? []).filter((r) => r?.title && http(r.link) && r.date && r.date <= today);
  // No cover file yet -> the marked placeholder, until Gabe's art (or a downloaded cover) is in public/media.
  if (rows.length) return newest(rows).map((r) => (r.cover ? r : { ...r, cover: '/media/placeholder-cover.svg', placeholder: true }));
  return [{ title: 'Go', type: 'single', cover: '/media/placeholder-cover.svg', link: GO, soundcloud: SOUNDCLOUD, placeholder: true }];
}

/** "Sep 4, 2026" (music.md date line); '' with no date. */
export const dateLine = (d) => (d ? new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '');
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

// Hard rule 1 (Gabe, 2026-11-06): these two have flashing lights and never show, even if a feed adds them.
// The Earned Your Stripes MUSIC video is fine; only its Visualizer is out.
export const FLASHING = /running the gauntlet|earned your stripes.*visuali[sz]er/i;
const videos = () => (load('videos') ?? []).filter((v) => !FLASHING.test(v.title ?? ''));

/** Newest video with a valid 11-character YouTube id, or null (the block then links to the channel). */
export function latestVideo() {
  const rows = videos().map((v) => {
    const id = v.id ?? v.videoId ?? String(v.url ?? '').match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1];
    return { ...v, id };
  }).filter((v) => /^[\w-]{11}$/.test(v.id ?? ''));
  return rows.length ? newest(rows)[0] : null;
}

/** The Watch row: the newest video, then up to n-1 newest featured ones (unique, valid ids). */
export function videoRow(n = 3) {
  const latest = latestVideo();
  if (!latest) return [];
  const feat = newest(videos().filter((v) => v.featured && /^[\w-]{11}$/.test(v.id ?? '') && v.id !== latest.id));
  return [latest, ...feat.slice(0, n - 1)];
}

/** Every release for the Music crate (DESIGN 16a): valid rows minus IDENTITY (its own block), newest date first, undated last. `coming` = after the New York day. */
export function crate() {
  const today = etDay();
  return newest((load('releases') ?? []).filter((r) => r?.title && http(r.link) && r.title !== 'IDENTITY')).map((r) => ({ ...r, coming: Boolean(r.date) && r.date > today }));
}

/** Announced releases not out yet, soonest first (from his own posts, see docs/research/social-content.md). */
export function upcoming() {
  const today = etDay();
  return (load('releases') ?? []).filter((r) => r?.title && http(r.link) && r.date && r.date > today).sort((a, b) => a.date.localeCompare(b.date));
}

/** Scenic Route's row on the tracklist (DESIGN 25e): pre-save until its day, then out now. null = plain text. */
export function favorite() {
  const r = (load('releases') ?? []).find((x) => x?.title === 'Scenic Route' && http(x.link));
  if (!r) return null;
  const out = !r.date || r.date <= etDay();
  const day = r.date && new Date(`${r.date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  return { link: r.link, tag: out ? 'Out now' : `Out ${day}`, label: out ? 'Scenic Route: listen to the single' : 'Scenic Route: pre-save the single' };
}

/** IDENTITY block state (DESIGN.md section 7): no date -> just the name; date -> days left + pre-save; on/after the day -> Out now.
 *  ponytail: computed at build, so the day count and the release-day flip need a daily rebuild on the host. */
export function identity() {
  const r = (load('releases') ?? []).find((x) => x?.title === 'IDENTITY' && http(x.link));
  if (!r?.date) return { label: 'IDENTITY', date: null };
  const today = etDay();
  const days = Math.round((Date.parse(r.date) - Date.parse(today)) / 864e5);
  const pretty = new Date(`${r.date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  return { label: 'IDENTITY', date: r.date, pretty, days, out: days <= 0, link: r.link };
}
