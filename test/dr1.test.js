// Round DR1 (DESIGN 27, D96). One section per item.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { curly, showsHtml, nowHtml, esc } from '../src/lib/shows.js';

const ROOT = join(import.meta.dirname, '..');
const read = (f) => readFileSync(join(ROOT, f), 'utf8');
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : []; });
const visible = (html) => html.replace(/<(script|style|svg)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]*>/g, '\n').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"');
const css = read('src/styles/global.css');

// A served copy of the real dist, with a fixture show whose venue has a straight apostrophe.
const dir = mkdtempSync(join(tmpdir(), 'dr1-'));
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
const plus = (n) => new Date(Date.parse(`${today}T12:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
writeFileSync(join(dir, 'shows.json'), JSON.stringify([{ date: plus(3), time: '19:00', type: 'open-mic', venue: "M.O.M's", city: 'Doylestown, PA', with: '"Hi" & <b>' }]));
process.env.SHOWS_FILE = join(dir, 'shows.json');
process.env.RELEASES_FILE = join(dir, 'none.json');
process.env.DATA_DIR = join(dir, 'data');
const { server } = await import('../server.js');
let base;
before(() => new Promise((r) => server.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r(); })));
after(() => server.close());

// ---------- 27d ----------
test('27d curly: quotes become typographic, empty stays empty', () => {
  assert.equal(curly("M.O.M's"), 'M.O.M’s');
  assert.equal(curly('"Hi"'), '“Hi”');
  assert.equal(curly(''), '');
  assert.equal(curly(null), '');
});

test('27d curly runs before esc: hostile text stays inert, no broken entities', () => {
  const evil = ['<script>alert(1)</script>', '"a" & \'b\'', "' OR 1=1 --"];
  for (const v of evil) {
    const html = showsHtml([{ date: plus(2), type: 'show', venue: v, city: v, with: v }], new Date());
    assert.ok(!html.includes('<script>') && !/&(?!amp;|lt;|gt;|quot;|#39;)/.test(html.replace(/&[a-z]+;|&#\d+;/g, '')), v);
    assert.ok(!/&(quot|#39);/.test(html.match(/row-place[^<]*|poster-place[^<]*/)[0]), 'curly text has no entity quotes');
  }
  assert.ok(showsHtml([{ date: plus(2), type: 'show', venue: '"a" & \'b\'', city: 'C' }]).includes('“a” &amp; ‘b’, C'));
  assert.ok(showsHtml([{ date: plus(2), type: 'show', venue: '<script>', city: 'C' }]).includes('&lt;script&gt;'));
});

test('27d no straight quote in the visible text of any built page or served / and /shows/', async () => {
  for (const f of walk(join(ROOT, 'dist'))) assert.deepEqual(visible(readFileSync(f, 'utf8')).split('\n').filter((l) => /['"]/.test(l)), [], f);
  for (const p of ['/', '/shows/']) {
    const t = visible(await (await fetch(`${base}${p}`)).text());
    assert.deepEqual(t.split('\n').filter((l) => /['"]/.test(l)), [], p);
    if (p === '/shows/') assert.ok(t.includes('M.O.M’s') && t.includes('“Hi”'));
  }
});

test('27d public/js strings have no straight apostrophe inside words', () => {
  for (const f of ['public/js/app.js', 'public/js/edit.js']) {
    const strings = read(f).match(/"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g) ?? [];
    assert.deepEqual(strings.filter((s) => /[A-Za-z]'[A-Za-z]/.test(s)), [], f);
  }
});

// ---------- 27f ----------
test('27f browser surfaces use tokens only', () => {
  const lines = [
    '::selection { background: var(--text); color: var(--bg); }',
    'html { scrollbar-color: var(--muted) var(--bg); }',
    'input, textarea { caret-color: var(--text); }',
  ];
  for (const l of lines) {
    assert.ok(css.includes(l), l);
    assert.ok(!/#[0-9a-f]{3,8}\b|rgb|hsl|oklch/i.test(l), 'no colour literal');
  }
});

// ---------- 27a ----------
test('27a Speculation-Rules header on pages, not on /edit/ or JSON', async () => {
  for (const p of ['/', '/music/', '/nope-404']) assert.equal((await fetch(`${base}${p}`)).headers.get('speculation-rules'), '"/speculation-rules.json"', p);
  assert.equal((await fetch(`${base}/edit/`)).headers.get('speculation-rules'), null);
  const api = await fetch(`${base}/edit/api/shows`);
  assert.equal(api.headers.get('speculation-rules'), null);
  assert.equal((await fetch(`${base}/speculation-rules.json`)).headers.get('speculation-rules'), null);
});

test('27a /speculation-rules.json: right type, prefetch + prerender, never /edit/ /api/ .ics', async () => {
  const r = await fetch(`${base}/speculation-rules.json`);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('content-type'), 'application/speculationrules+json');
  const j = await r.json();
  for (const k of ['prefetch', 'prerender']) {
    const w = JSON.stringify(j[k][0].where);
    for (const x of ['/edit/*', '/api/*', '/*.ics']) assert.ok(w.includes(x), `${k} excludes ${x}`);
  }
});

test('27a CSP unchanged: no inline-speculation-rules, no unsafe-inline in script-src; no inline rules in built pages', async () => {
  const csp = (await fetch(`${base}/`)).headers.get('content-security-policy');
  assert.ok(!csp.includes('inline-speculation-rules'));
  assert.match(csp, /script-src 'self'(;|$)/);
  for (const f of walk(join(ROOT, 'dist'))) assert.ok(!readFileSync(f, 'utf8').includes('type="speculationrules"'), f);
});

test('27a phone bar held still in the view transition', () => {
  assert.ok(css.includes('.phone-bar { view-transition-name: phone-bar; }'));
  assert.ok(css.includes('::view-transition-group(phone-bar), ::view-transition-old(phone-bar), ::view-transition-new(phone-bar) { animation: none; }'));
});

// ---------- 27c ----------
test('27c platform row under the Spotify button on Home and Music', () => {
  const want = ['https://music.apple.com/us/artist/glucak/1732285138', 'https://www.youtube.com/channel/UCha7GtkOI9A0dzbTG3igbLg', 'https://soundcloud.com/glucak'];
  for (const f of ['dist/index.html', 'dist/music/index.html']) {
    const h = read(f);
    const under = h.slice(h.indexOf('id="after-player"'), h.indexOf('</p>', h.indexOf('id="after-player"')));
    const links = [...under.matchAll(/<a class="under-link" href="([^"]+)"([^>]*)>([^<]+)<span class="vh"> \(opens in a new tab\)<\/span><\/a>/g)];
    assert.deepEqual(links.slice(0, 3).map((m) => m[1]), want, f);
    for (const m of links.slice(0, 3)) assert.ok(m[2].includes('target="_blank"') && !m[2].includes('aria-label'), `${f} ${m[1]}`);
    if (f.includes('music')) assert.ok(under.indexOf('Listen everywhere') > under.indexOf('soundcloud.com'), 'Listen everywhere stays last');
  }
});

// ---------- 27e ----------
test('27e Shows Watch from 72rem: lead plus two, no sideways scroll rule', () => {
  assert.ok(!/\.shows-grid \.v2-vrow[^}]*overflow-x: auto/.test(css));
  assert.ok(css.includes('.shows-grid .v2-vid:first-child { grid-column: 1 / -1; grid-row: auto; }'));
  assert.ok(css.includes('.shows-grid .v2-vrow { grid-auto-flow: row; grid-auto-columns: auto; grid-template-columns: repeat(2, minmax(0, 1fr)); overflow: visible; }'));
});
