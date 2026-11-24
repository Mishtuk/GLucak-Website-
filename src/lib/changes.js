// One plain sentence for what a save changed ("Added 1 show, changed 2." / "Added: Duck Dodge video."), made by comparing a tab's
// content with the version before it. Used for the save message (with the row's name) and under each History row (`names: false`: a History
// list carries counts, never row text). Pure. `before` null = nothing to compare with: ''.
const NOUN = { shows: ['show', 'shows'], releases: ['release', 'releases'], products: ['product', 'products'], videos: ['video', 'videos'] };
// A row that was edited is told from one that was swapped out by one shared field.
const SAME = {
  shows: (a, b) => a.date === b.date || a.venue === b.venue, releases: (a, b) => a.title === b.title || a.link === b.link,
  products: (a, b) => a.id === b.id || a.name === b.name, videos: (a, b) => a.id === b.id,
};
const NAME = { shows: (r) => r.venue, releases: (r) => r.title, products: (r) => r.name, videos: (r) => r.name ?? r.title };
const key = (r) => JSON.stringify(r, (k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : 1))) : v)); // the same row whatever the order of its fields
const short = (s) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > 60 ? `${t.slice(0, 57)}...` : t; };
const end = (s) => (/[.!?]$/.test(s) ? s : `${s}.`);

export function describeChange(kind, before, after, { names = true } = {}) {
  if (before == null || after == null) return '';
  if (kind === 'identity') {
    const f = [['date', 'the release date'], ['link', 'the Pre-save link']].filter(([k]) => before.identity?.[k] !== after.identity?.[k]).map(([, t]) => t);
    return f.length ? `Changed ${f.join(' and ')}.` : '';
  }
  if (kind === 'bio') {
    const f = [['homeBio', 'the Home sentence'], ['bio', 'the About bio']].filter(([k]) => before[k] !== after[k]).map(([, t]) => t);
    return f.length ? `Changed ${f.join(' and ')}.` : '';
  }
  if (!NOUN[kind] || !Array.isArray(before) || !Array.isArray(after)) return '';
  const gone = [...before], added = [];
  for (const a of after) { const i = gone.findIndex((b) => key(b) === key(a)); if (i >= 0) gone.splice(i, 1); else added.push(a); }
  const changed = [];
  for (const a of [...added]) {
    const i = gone.findIndex((b) => SAME[kind](a, b));
    if (i >= 0) { changed.push([gone[i], a]); gone.splice(i, 1); added.splice(added.indexOf(a), 1); }
  }
  const n = added.length + changed.length + gone.length, [one, many] = NOUN[kind];
  if (n === 0) return key(before) === key(after) ? '' : 'Changed the order.';
  if (n === 1) {
    const [verb, row] = added.length ? ['Added', added[0]] : gone.length ? ['Removed', gone[0]] : ['Changed', changed[0][1]];
    let word = verb;
    if (kind === 'videos' && changed.length) { // what he did with a video: hide it, put it back, put it first
      const [was, now] = changed[0];
      word = !was.hidden && now.hidden ? 'Hid' : was.hidden && !now.hidden ? 'Put back' : !was.first && now.first ? 'Put first' : 'Changed';
    }
    const nm = names ? short(NAME[kind](row)) : '';
    if (nm) return end(`${word}: ${nm}`);
    return word === 'Put back' ? `Put 1 ${one} back.` : word === 'Put first' ? `Put 1 ${one} first.` : `${word} 1 ${one}.`;
  }
  const parts = [added.length && `added ${added.length} ${added.length === 1 ? one : many}`, changed.length && `changed ${changed.length}`, gone.length && `removed ${gone.length}`].filter(Boolean);
  return `${parts.join(', ').replace(/^./, (c) => c.toUpperCase())}.`;
}
