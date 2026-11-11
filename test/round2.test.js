// Round 2 over HTTP against the real build in dist/: the .ics route, the 404 page, the Music crate, the link grid.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { showId } from '../src/lib/shows.js';

const dir = mkdtempSync(join(tmpdir(), 'gl-r2-'));
const d = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const HOSTILE = "<script>alert(1)</script>' OR 1=1 --; a,b\nline two";
const shows = [
  { date: d(5), type: 'show', venue: HOSTILE, city: 'Doylestown, PA', link: 'https://example.com/t?a=1;b=2' },
  { date: d(-5), type: 'open-mic', venue: 'Gone Venue', city: 'X' },
];
writeFileSync(join(dir, 'shows.json'), JSON.stringify(shows));
process.env.SHOWS_FILE = join(dir, 'shows.json');
process.env.RELEASES_FILE = join(dir, 'none.json');
process.env.DATA_DIR = join(dir, 'data');
delete process.env.DIST_DIR;
const { server } = await import('../server.js');
let base;
before(() => new Promise((r) => server.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r(); })));
after(() => server.close());

test('.ics route: text/calendar utf-8, attachment, CRLF, inert for a hostile venue', async () => {
  const id = showId(shows[0]);
  const r = await fetch(`${base}/shows/${id}.ics`);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('content-type'), 'text/calendar; charset=utf-8');
  assert.equal(r.headers.get('content-disposition'), `attachment; filename="glucak-${id}.ics"`);
  const ics = await r.text();
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n') && ics.endsWith('END:VCALENDAR\r\n') && !/[^\r]\n/.test(ics));
  const lines = ics.replace(/\r\n /g, '').split('\r\n');
  assert.equal(lines.filter((l) => l === 'BEGIN:VEVENT').length, 1);
  assert.ok(lines.some((l) => l.startsWith('SUMMARY:GLucak at <script>') && l.endsWith('line two') && l.includes('\\n')));
  assert.ok(lines.includes('URL:https://example.com/t?a=1;b=2'));
  // the same id appears on the page's calendar link
  assert.ok((await (await fetch(`${base}/shows/`)).text()).includes(`/shows/${id}.ics`));
});

test('.ics route: a past show and an unknown id are 404 with the Wrong turn page', async () => {
  for (const p of [`/shows/${showId(shows[1])}.ics`, '/shows/nope.ics', '/shows/2030-01-01-x-000000.ics']) {
    const r = await fetch(`${base}${p}`);
    assert.equal(r.status, 404, p);
    const h = await r.text();
    assert.ok(h.includes('Wrong') && />turn<\/span>/.test(h) && !h.includes('turn.') && h.includes('Page not found'), p);
  }
});

test('unknown path: 404 with the Wrong turn page (title, line, Listen / Shows / Home, noindex)', async () => {
  const r = await fetch(`${base}/no/such/page`);
  assert.equal(r.status, 404);
  assert.match(r.headers.get('content-type'), /text\/html/);
  const h = await r.text();
  assert.match(h, /<title>Page not found - GLucak<\/title>/);
  assert.ok(h.includes('Wrong') && />turn<\/span>/.test(h) && !h.includes('turn.') && h.includes("That page isn&#39;t here. The music is.") || h.includes("That page isn't here. The music is."));
  for (const [href, w] of [['/music/', 'Listen'], ['/shows/', 'Shows'], ['/', 'Home']]) assert.match(h, new RegExp(`<a [^>]*href="${href}"[^>]*>${w}</a>`), w);
  assert.match(h, /name="robots" content="noindex"/);
  assert.ok(!h.includes('gl:'), 'no raw markers');
});

test('Music: single-link tiles with distinct names, newest first, hatched slot for coming singles, Pre-save', async () => {
  const h = await (await fetch(`${base}/music/`)).text();
  const tiles = [...h.matchAll(/<li class="tile"[^>]*>([\s\S]*?)<\/li>/g)].map((m) => m[0]);
  assert.ok(tiles.length >= 10);
  const names = [];
  for (const t of tiles) {
    assert.equal((t.match(/<a /g) ?? []).length, 1, 'one link per tile');
    assert.ok(!t.includes('aria-label'), 'name comes from the visible words (2.5.3)');
    names.push(t.match(/<h3 class="tile-title">([^<]*)</)[1]);
  }
  assert.equal(new Set(names).size, names.length, 'distinct names');
  assert.deepEqual(names.slice(0, 3), ['Scenic Route', 'Welcome Home', 'Who I Am']);
  assert.match(tiles[0], /data-state="coming"[\s\S]*nocover tile-art[\s\S]*<span>Jan 15<\/span>[\s\S]*Out Jan 15, 2027[\s\S]*tile-go">Pre-save</);
  assert.match(tiles[3], /<img class="tile-art" src="\/media\/covers\/duck-dodge-jump-fight\.webp" alt=""[\s\S]*tile-go">Listen</);
  assert.ok(!h.includes('IDENTITY</h3>'), 'IDENTITY has its own block');
  assert.ok(!h.includes('class="release"') && !h.includes('Latest release. Listen on:'), 'RiseBand without its release block on Music');
  assert.match(h, /<span class="tile-type">Album<\/span>Dec 19, 2025/);
});

test('footer and About: link grid with inline icons, Patreon wide, no loose socials list', async () => {
  for (const p of ['/', '/about/', '/music/']) {
    const h = await (await fetch(`${base}${p}`)).text();
    assert.ok(!h.includes('class="socials"'), p);
    assert.ok(h.includes('<symbol id="i-instagram"') && h.includes('<symbol id="i-cal"'), `${p}: sprite`);
    assert.match(h, /<li class="links-wide"><a href="https:\/\/patreon\.com\/GLucakMusic" rel="noopener" target="_blank"><svg aria-hidden="true"><use href="#i-patreon"><\/use><\/svg><span>Patreon<\/span>/);
  }
  const about = await (await fetch(`${base}/about/`)).text();
  assert.match(about, /<ul class="links links-lg">/);
  const order = [...about.match(/<ul class="links links-lg">[\s\S]*?<\/ul>/)[0].matchAll(/<span>([^<]+)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(order, ['Spotify', 'YouTube', 'Instagram', 'SoundCloud', 'Threads', 'X', 'Patreon']);
});

test('the Round 2 CSS ships once: no duplicate :active rule blocks, no interim rules, touchstart line in boot.js', () => {
  const css = readFileSync(join(import.meta.dirname, '../src/styles/global.css'), 'utf8');
  const sels = [...css.matchAll(/([^{}]+)\{[^{}]*\}/g)].map((m) => m[1].trim().replace(/\s+/g, ' ')).filter((s) => s.includes(':active'));
  assert.equal(new Set(sels).size, sels.length, 'a selector list with :active appears twice');
  for (const sel of ['.btn-solid:active', '.btn-line:active', '.btn-show:active', '.sheet a:active', '.product-link:active .product-name']) {
    assert.equal(sels.filter((s) => s.split(', ').includes(sel)).length, 1, `${sel} in exactly one block`);
  }
  assert.ok(!css.includes('.product-card:active') && !css.includes('.socials'), 'interim rules removed');
  assert.ok(readFileSync(join(import.meta.dirname, '../public/js/boot.js'), 'utf8').includes("addEventListener('touchstart', () => {}, { passive: true })"));
});
