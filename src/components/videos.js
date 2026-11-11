// DESIGN 26c: the Videos page groups. rows = videos.json, flashing = FLASHING from content.js.
// Pure (no import.meta) so node --test can import it.
const ok = (v, flashing) => /^[\w-]{11}$/.test(v?.id ?? '') && !flashing.test(v.title ?? '') && !flashing.test(v.name ?? '');
const newest = (rows) => [...rows].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
export function groupVideos(rows, flashing) {
  const safe = (rows ?? []).filter((v) => ok(v, flashing));
  const live = newest(safe.filter((v) => v.kind === 'live'));
  const lead = live.find((v) => v.lead) ?? live[0] ?? null;
  const music = [...newest(safe.filter((v) => v.kind === 'music-video')), ...newest(safe.filter((v) => v.kind === 'lyric-video'))];
  return { lead, live: live.filter((v) => v !== lead), music };
}
