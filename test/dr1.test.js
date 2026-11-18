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
