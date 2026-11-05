// Build-time content: era file, releases and videos. Missing data files fall back to marked placeholders.
import { etDay } from '../lib/shows.js';
import era from '../eras/placeholder.json';

export { era };
// D21/D23: a "From Gabe" quote ships only after Gabe OKs it. Flip this when he does; until then no quote is in the page.
export const QUOTES_APPROVED = false;
const QUOTES = {
  rise: { text: 'God will always be with you, and will never leave you in the valley. Trust me, I know.', url: 'https://www.instagram.com/p/Dd6keDDDefE/', credit: 'GLucak, Instagram, Sep 2026' },
  live: { text: 'Hope to see you there!', url: 'https://www.youtube.com/watch?v=zmhbfHppXNM', credit: 'GLucak, YouTube, Sep 2026' },
};
/** The band's quote, or null (nothing renders). */
export const quote = (band) => (QUOTES_APPROVED ? QUOTES[band] ?? null : null);
export const PHOTO_CREDITS = { kealey: 'Photo: Alexander Kealey.', paslier: 'Video: Sylvain Paslier.', mccc: 'Video: Montgomery County Community College, MSP program group.' };
export const SPOTIFY_EMBED = 'https://open.spotify.com/embed/playlist/0D45boIc9xWAdDjz1uTDRo';
export const SPOTIFY_PLAYLIST = 'https://open.spotify.com/playlist/0D45boIc9xWAdDjz1uTDRo';
export const GO = 'https://wingsmusic.lnk.to/370407-Go';
export const SOUNDCLOUD = 'https://soundcloud.com/glucak';
export const PATREON = 'https://patreon.com/GLucakMusic';
export const YOUTUBE = 'https://www.youtube.com/channel/UCha7GtkOI9A0dzbTG3igbLg';
export const SOCIALS = [
  ['Instagram', 'https://www.instagram.com/glucakofficial/'],
  ['Threads', 'https://www.threads.com/@glucakofficial'],
  ['X', 'https://x.com/GLucakOfficial'],
  ['YouTube', YOUTUBE],
  ['SoundCloud', SOUNDCLOUD],
  ['Spotify', 'https://open.spotify.com/artist/1SxMTO4oSXDbNSNzxx7cVX'],
  ['Patreon', PATREON],
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

/** Newest video with a valid 11-character YouTube id, or null (the block then links to the channel). */
export function latestVideo() {
  const rows = (load('videos') ?? []).map((v) => {
    const id = v.id ?? v.videoId ?? String(v.url ?? '').match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1];
    return { ...v, id };
  }).filter((v) => /^[\w-]{11}$/.test(v.id ?? ''));
  return rows.length ? newest(rows)[0] : null;
}

/** Announced releases not out yet, soonest first (from his own posts, see docs/research/social-content.md). */
export function upcoming() {
  const today = etDay();
  return (load('releases') ?? []).filter((r) => r?.title && http(r.link) && r.date && r.date > today).sort((a, b) => a.date.localeCompare(b.date));
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
