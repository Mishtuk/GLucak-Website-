// Accessibility structure, robots/sitemap and JSON-LD. Static checks read dist/; the Events checks run over HTTP with a temp dist.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const DIST = join(import.meta.dirname, '../dist');
const PAGES = { '/': 'index.html', '/music/': 'music/index.html', '/shows/': 'shows/index.html', '/about/': 'about/index.html', '/privacy/': 'privacy/index.html' };
const html = (p) => readFileSync(join(DIST, PAGES[p]), 'utf8');

test('exactly one h1 and heading levels never skip, on every page', () => {
  for (const p of Object.keys(PAGES)) {
    const levels = [...html(p).matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
    assert.equal(levels.filter((l) => l === 1).length, 1, `${p}: h1 count`);
    levels.forEach((l, i) => assert.ok(i === 0 ? l === 1 : l <= levels[i - 1] + 1, `${p}: h${levels[i - 1]} -> h${l}`));
  }
});

test('Spotify skip link comes right before the player and its target exists (/ and /music/)', () => {
  for (const p of ['/', '/music/']) {
    const h = html(p);
    const link = h.indexOf('href="#after-player"');
    assert.ok(link > 0 && link < h.indexOf('<iframe'), `${p}: skip link before iframe`);
    assert.match(h, /Skip the Spotify player/);
    assert.equal(h.match(/id="after-player"/g)?.length, 1, `${p}: target`);
    assert.ok(h.indexOf('id="after-player"') > h.indexOf('<iframe'), `${p}: target after the player`);
  }
});

test('/music/: no two links share an accessible name but differ in target; signup describes its status', () => {
  const names = new Map();
  for (const m of html('/music/').matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const href = m[1].match(/href="([^"]*)"/)?.[1];
    const name = (m[1].match(/aria-label="([^"]*)"/)?.[1] ?? m[2].replace(/<[^>]*>/g, '')).trim().toLowerCase();
    if (names.has(name)) assert.equal(names.get(name), href, `"${name}" goes to two places`);
    names.set(name, href);
  }
  assert.match(html('/music/'), /<input id="email"[^>]*aria-describedby="signup-status"/);
});

test('app.js sets and clears aria-invalid on the email input', () => {
  const js = readFileSync(join(import.meta.dirname, '../public/js/app.js'), 'utf8');
  assert.ok(js.includes("setAttribute('aria-invalid', 'true')") && js.includes("removeAttribute('aria-invalid')"));
});

test('home MusicGroup + WebSite JSON-LD parses; sameAs is SOCIALS', () => {
  const m = [...html('/').matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(m.length, 1);
  const [group, site] = JSON.parse(m[0][1]);
  assert.equal(group['@type'], 'MusicGroup');
  const socials = [...html('/').match(/<ul class="socials">[\s\S]*?<\/ul>/)[0].matchAll(/href="([^"]+)"/g)].map((x) => x[1]); // footer is built from SOCIALS
  assert.ok(socials.length > 3);
  assert.deepEqual(group.sameAs, socials);
  assert.deepEqual(group.genre, ['EDM', 'Hip-Hop/Rap', 'Rock']);
  assert.equal(site['@type'], 'WebSite');
});

const dir = mkdtempSync(join(tmpdir(), 'gl-seo-'));
mkdirSync(join(dir, 'shows'));
writeFileSync(join(dir, 'shows/index.html'), '<!doctype html><head><!--gl:shows-ld--></head><ul><!--gl:shows--></ul>');
const d = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
writeFileSync(join(dir, 'shows.json'), JSON.stringify([
  { date: d(5), type: 'show', venue: '</script><script>alert(1)</script>', city: "' OR 1=1 --", link: 'https://example.com/t' },
  { date: d(9), time: '19:30', type: 'open-mic', venue: 'Cafe', city: 'Warminster, PA', link: 'https://example.com/o' },
  { date: d(-5), type: 'show', venue: 'Gone Venue', city: 'X' },
]));
Object.assign(process.env, { DIST_DIR: dir, SHOWS_FILE: join(dir, 'shows.json'), DATA_DIR: join(dir, 'data'), RELEASES_FILE: join(dir, 'none.json') });
const { server } = await import('../server.js');
let base;
before(() => new Promise((r) => server.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r(); })));
after(() => server.close());

test('shows MusicEvent JSON-LD: one per upcoming show, hostile values stay inert', async () => {
  const body = await (await fetch(`${base}/shows/`)).text();
  assert.ok(!body.includes('gl:shows-ld'));
  const ld = body.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(ld && !ld[1].includes('</script') && !ld[1].includes('<'), 'nothing can close the tag');
  const ev = JSON.parse(ld[1]);
  assert.equal(ev.length, 2);
  assert.equal(ev[0].name, 'GLucak at </script><script>alert(1)</script>');
  assert.equal(ev[0].startDate, d(5));
  assert.equal(ev[0].location.address.addressLocality, "' OR 1=1 --");
  assert.equal(ev[0].offers.url, 'https://example.com/t');
  assert.match(ev[1].startDate, /^\d{4}-\d{2}-\d{2}T19:30:00-0[45]:00$/);
  assert.equal(ev[1].location.address.addressRegion, 'PA');
  assert.equal(ev[1].offers, undefined, 'open mic: no offers');
  assert.equal(body.match(/<script\b/g).length, 1, 'no extra script element');
});

test('no upcoming shows: no JSON-LD script', async () => {
  writeFileSync(join(dir, 'shows.json'), '[]');
  assert.ok(!(await (await fetch(`${base}/shows/`)).text()).includes('ld+json'));
});

test('robots.txt and sitemap.xml are built, valid and served from dist', () => {
  const robots = readFileSync(join(DIST, 'robots.txt'), 'utf8');
  assert.match(robots, /Allow: \/\n/); assert.match(robots, /Disallow: \/edit\//); assert.match(robots, /Sitemap: https?:\/\/[^\s]+\/sitemap\.xml/);
  const map = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
  for (const p of Object.keys(PAGES)) assert.match(map, new RegExp(`<loc>https?://[^<]*${p}</loc>`), p);
  assert.ok(!map.includes('/shop/'));
});

test('robots.txt and sitemap.xml over HTTP: 200 and the right content-type', async () => {
  const { copyFileSync } = await import('node:fs');
  for (const f of ['robots.txt', 'sitemap.xml']) copyFileSync(join(DIST, f), join(dir, f));
  const r = await fetch(`${base}/robots.txt`), s = await fetch(`${base}/sitemap.xml`);
  assert.equal(r.status, 200); assert.match(r.headers.get('content-type'), /^text\/plain/);
  assert.equal(s.status, 200); assert.match(s.headers.get('content-type'), /xml/);
  assert.ok((await s.text()).includes('/music/'));
});
