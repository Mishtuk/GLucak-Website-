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

test('port notes: no quote text, mark in header, one hero image, credits, no EXIF-bearing originals', () => {
  const h = html('/');
  assert.ok(!h.includes('From Gabe') && !h.includes('Trust me, I know'), 'quotes are off until Gabe OKs');
  assert.match(h, /<a class="brand"[^>]*><img class="mark mark-head"[^>]*><span class="brand-word">GLUCAK<\/span><\/a>/);
  assert.match(h, /Play full songs on Spotify/);
  assert.ok(!h.includes('Open in Spotify') && !h.includes('mission statement has always'));
  assert.equal((h.match(/fetchpriority="high"/g) ?? []).length, 1, 'only the chosen hero image is high priority');
  assert.ok(h.includes('Out now: ') && h.includes('<!--gl:now-->'));
  assert.match(h, /class="credits">Photo: Alexander Kealey\./);
  assert.ok(html('/about/').includes('class="credits"'));
  const media = readdirSync(join(DIST, 'media'));
  assert.ok(!media.some((f) => /\.jpe?g$/i.test(f)), 'no JPG originals in media');
});

test('approved copy is on each page verbatim; no ASK GABE; no quote ships', () => {
  const bio = ['Despite facing various difficulties and struggles over the years, Epilepsy survivor and Producer-Rapper/DJ GLucak has shown no intent to give up on either his Faith in God or his mission in creating energetic music to bring others to Christ.',
    'Two albums and numerous singles and EPs into the biz and with no plans to slow down, GLucak has been running at a ferocious pace crafting brand-new content and music for 2026 and 2027.',
    'Nevertheless, no matter the musical style or genre, be it his debut single or his upcoming 3rd album (rumored to be his best work yet), the mission statement has always been the same: Rise, Live It Loud, Push Past Fear, The Time Is Now.'];
  const want = {
    '/': ['Live It Loud', bio[0], 'Get the next show and every new song first.'],
    '/music/': ['All releases', 'Hear more on SoundCloud', 'Latest release. Listen on:', 'Pre-save IDENTITY'],
    '/shows/': ['Live It Loud', 'Book GLucak:'],
    '/about/': [...bio, 'Find GLucak', 'Booking and shows', 'Photo credits', 'Photo: Alexander Kealey'],
  };
  for (const [p, texts] of Object.entries(want)) for (const t of texts) assert.ok(html(p).includes(t), `${p}: ${t}`);
  for (const p of Object.keys(pages)) {
    const h = html(p);
    assert.ok(!h.includes('ASK GABE'), p);
    for (const q of ['Trust me, I know', 'Hope to see you there', 'From Gabe']) assert.ok(!h.includes(q), `${p}: quote ${q}`);
  }
});

test('Music: artists credit shown; upcoming releases never listed as released', () => {
  const m = html('/music/');
  assert.match(m, /class="credit"[^>]*>GLucak, J-BOY</);
  const released = m.split('<ul class="releases">').pop(); // last list = released
  for (const t of ['Who I Am', 'Scenic Route']) assert.ok(!released.split('<div class="identity-state">')[0].includes(`<h3>${t}</h3>`), t);
  assert.ok(!released.split('<div class="identity-state">')[0].includes('<h3>IDENTITY</h3>'));
  assert.match(m, /<h3>Duck, Dodge, Jump, Fight<\/h3>/);
});

test('Spotify box keeps the loading / blocked note under the iframe; no era-word placeholder line on Music', () => {
  const h = html('/');
  assert.match(h, /<div class="player-box"><p class="player-note">Loading the Spotify player\./);
  assert.ok(!html('/music/').includes('Era word:'));
});

test('privacy (D34): the whole-frame crowd photo (with the child) is not used anywhere; credits list only photos shown', () => {
  for (const p of Object.keys(pages)) {
    assert.ok(!/live-kealey-(800|1600|phone)/.test(html(p)), `${p}: whole-frame Kealey photo`);
    assert.ok(!html(p).includes('live-paslier') || html(p).includes('Sylvain Paslier'), `${p}: Paslier shown without credit`);
  }
  assert.ok(!html('/').includes('Sylvain Paslier') && !html('/about/').includes('Sylvain Paslier'), 'credit for a photo not shown');
});

test('shop: /shop/ has the marker; every page carries the empty Shop markers and no Shop link in the static build', () => {
  assert.ok(readFileSync(join(DIST, 'shop/index.html'), 'utf8').includes('<!--gl:shop-->'));
  for (const p of Object.keys(pages)) {
    const h = html(p);
    assert.equal(h.split('<!--gl:nav-shop-->').length, 3, `${p}: nav + menu markers`);
    assert.match(h, /<nav class="phone-bar"[\s\S]*<!--gl:watch--><a [^>]*>[\s\S]*?<span>Watch<\/span><\/a><!--\/gl:watch-->/, `${p}: Watch wrapped`);
    assert.ok(h.includes('<!--gl:footer-shop-->'), `${p}: footer marker`);
    assert.ok(!h.includes('href="/shop/"'), `${p}: no static Shop link`);
  }
});
