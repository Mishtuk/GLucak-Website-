// Checks the built site in dist/ (run `npm run build` first).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(import.meta.dirname, '../dist');
const pages = { '/': 'index.html', '/music/': 'music/index.html', '/shows/': 'shows/index.html', '/about/': 'about/index.html', '/privacy/': 'privacy/index.html' };
const html = (p) => readFileSync(join(DIST, pages[p]), 'utf8');

test('build output exists', () => assert.ok(existsSync(join(DIST, 'index.html')), 'run npm run build'));

test('no inline script bodies (CSP script-src self)', () => {
  for (const p of Object.keys(pages)) {
    for (const m of html(p).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      assert.match(m[1], /\bsrc=/, `${p}: script without src`);
      assert.equal(m[2].trim(), '', `${p}: inline script body`);
    }
    assert.ok(!/\son(click|load|error)=/i.test(html(p)), `${p}: inline handler`);
  }
});

test('every page has header nav, mobile bar, footer Motion switch', () => {
  for (const p of Object.keys(pages)) {
    const h = html(p);
    const nav = h.match(/<nav class="nav-desktop"[\s\S]*?<\/nav>/)?.[0] ?? '';
    for (const w of ['Music', 'Shows', 'About']) assert.match(nav, new RegExp(`>${w}</a>`), `${p}: nav ${w}`);
    const bar = h.match(/<nav class="phone-bar"[\s\S]*?<\/nav>/)?.[0] ?? '';
    for (const w of ['Listen', 'Shows', 'Watch', 'Join']) assert.match(bar, new RegExp(`<span>${w}</span>`), `${p}: bar ${w}`);
    assert.match(h, /<button class="motion-btn" id="motion"/, `${p}: motion switch`);
  }
});

test('Spotify iframe is the exact embed URL, lazy, titled, 352px', () => {
  const tag = html('/').match(/<iframe[^>]*open\.spotify\.com[^>]*>/)?.[0] ?? '';
  assert.match(tag, /src="https:\/\/open\.spotify\.com\/embed\/playlist\/0D45boIc9xWAdDjz1uTDRo"/);
  assert.match(tag, /loading="lazy"/);
  assert.match(tag, /title="[^"]+"/);
  assert.match(tag, /height="352"/);
});

test('shows marker on / and /shows/', () => {
  for (const p of ['/', '/shows/']) assert.ok(html(p).includes('<!--gl:shows-->'), p);
});

test('YouTube is a facade: no iframe until tapped', () => {
  assert.ok(!/youtube/.test(html('/').match(/<iframe[^>]*>/g)?.join('') ?? ''));
});

test('no innerHTML in public/js', () => {
  const dir = join(import.meta.dirname, '../public/js');
  for (const f of readdirSync(dir)) assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML|document\.write/.test(readFileSync(join(dir, f), 'utf8')), f);
});

test('Home shows the newest RELEASED release and the newest dated video', () => {
  const esc = (s) => s.replace(/&/g, '&amp;');
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
  const rel = JSON.parse(readFileSync(new URL('../src/data/releases.json', import.meta.url), 'utf8'));
  const out = rel.filter((r) => r.date && r.date <= today).sort((a, b) => b.date.localeCompare(a.date))[0];
  const home = html('/');
  assert.ok(home.includes(esc(out.title)), `latest release should be ${out.title}`);
  for (const r of rel.filter((r) => r.date > today)) assert.ok(!home.includes(`<h3>${esc(r.title)}`), `${r.title} isn't out yet`);
  const vids = JSON.parse(readFileSync(new URL('../src/data/videos.json', import.meta.url), 'utf8')).filter((v) => v.date);
  const latest = vids.sort((a, b) => b.date.localeCompare(a.date))[0];
  assert.ok(home.includes(`data-yt="${latest.id}"`), `latest video should be ${latest.title}`);
});

test('IDENTITY block: real date from releases.json, pre-save before the day, Out now after', () => {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
  const idn = JSON.parse(readFileSync(new URL('../src/data/releases.json', import.meta.url), 'utf8')).find((r) => r.title === 'IDENTITY');
  for (const p of ['/', '/music/']) {
    const h = html(p);
    assert.ok(h.includes(`datetime="${idn.date}"`), `${p}: IDENTITY date`);
    if (idn.date > today) assert.ok(h.includes(`href="${idn.link}"`) && h.includes('Pre-save IDENTITY'), `${p}: pre-save`);
    else assert.ok(h.includes('Out now'), `${p}: out now`);
    assert.ok(!h.includes('IDENTITY, 2027'), `${p}: old placeholder line`);
  }
});

test('edit page: noindex, external script only, not linked from the site', () => {
  const h = readFileSync(join(DIST, 'edit/index.html'), 'utf8');
  assert.match(h, /<meta name="robots" content="noindex/);
  assert.match(h, /<script src="\/js\/edit\.js" defer><\/script>/);
  for (const m of h.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) assert.equal(m[2].trim(), '', 'inline script body');
  assert.match(h, /<form id="login"[^>]*method="post" action="\/edit\/login"/);
  for (const p of Object.keys(pages)) assert.ok(!html(p).includes('/edit/'), `${p} links to /edit/`);
});
