// D64: brand always visible, real video thumbnail, external links in a new tab, seamless page changes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { externalize } from '../src/lib/ext.js';
import { actionHtml } from '../src/lib/products.js';
import { showsHtml } from '../src/lib/shows.js';

const ROOT = join(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const css = () => page("index.html"); // CSS is inlined in each page
const PAGES = ['index.html', 'music/index.html', 'shows/index.html', 'about/index.html', 'privacy/index.html'];
const page = (p) => readFileSync(join(DIST, p), "utf8");


test('no rule hides the brand over the Home hero', () => {
  assert.ok(!/\.brand\{[^}]*visibility:hidden/.test(css()) && !/\.brand\s*\{\s*visibility:\s*hidden/.test(readFileSync(join(ROOT, 'src/styles/global.css'), 'utf8')));
  assert.ok(!/data-home\]\[data-motion\][^{]*\.brand/.test(readFileSync(join(ROOT, 'src/styles/global.css'), 'utf8')));
});

test('every page: external links open in a new tab with the hint, internal links do not', () => {
  for (const p of PAGES) {
    const h = page(p);
    let ext = 0;
    for (const m of h.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
      const href = m[1].match(/\bhref="([^"]*)"/)?.[1] ?? '';
      if (/^https?:\/\/(www\.)?glucak\.com/.test(href) || !/^https?:\/\//.test(href)) { assert.ok(!/target=/.test(m[1]), `${p}: internal ${href}`); continue; }
      ext++;
      assert.match(m[1], /target="_blank"/, `${p}: ${href}`);
      assert.match(m[1], /rel="[^"]*noopener/, `${p}: ${href}`);
      assert.ok(m[2].includes('<span class="vh"> (opens in a new tab)</span>'), `${p}: hint ${href}`);
    }
    assert.ok(ext > 0, `${p}: has external links`);
  }
});

test('externalize: idempotent, escapes kept, aria-label extended, same-site untouched', () => {
  const a = '<a class="x" href="https://e.example/?a=1&amp;b=2" aria-label="Go">Go</a><a href="/music/">M</a><a href="https://glucak.com/x">S</a>';
  const once = externalize(a);
  assert.equal(externalize(once), once);
  assert.ok(once.includes('href="https://e.example/?a=1&amp;b=2"') && once.includes('aria-label="Go (opens in a new tab)"') && once.includes('<a href="/music/">M</a>') && once.includes('<a href="https://glucak.com/x">S</a>'));
});

test('shows.js and products.js links become new-tab links in the server output', async () => {
  const buy = externalize(actionHtml({ id: 't', name: 'T', status: 'available', link: 'https://shop.example/tee' }));
  assert.match(buy, /product-buy" href="https:\/\/shop\.example\/tee" rel="noopener" target="_blank">Buy<span class="vh">/);
  const rows = [{ date: '2099-01-01', venue: 'The Rail', city: 'X', type: 'show', link: 'https://t.example/a' }];
  assert.match(externalize(showsHtml(rows, new Date('2026-11-06T12:00:00Z'), {})), /href="https:\/\/t\.example\/a" rel="noopener" target="_blank">Tickets<span class="vh">/);
});

test('video block: <img> points at files that exist', () => {
  const h = page('shows/index.html');
  const img = h.match(/<img class="yt-img"[^>]*>/)?.[0];
  assert.ok(img, 'thumbnail img');
  assert.match(img, /alt=""/);
  assert.match(img, /loading="lazy"/);
  for (const m of img.matchAll(/(\/media\/videos\/[\w-]+-(?:640|1280)\.webp)/g)) assert.ok(existsSync(join(ROOT, 'public', m[1])), m[1]);
  assert.ok(h.includes('data-yt='), 'facade kept');
  assert.ok(!/https:\/\/i\.ytimg\.com/.test(h), 'no third-party image request');
});

test('view transitions: on by default, off under reduced motion and the Motion switch', () => {
  const c = readFileSync(join(ROOT, 'src/styles/global.css'), 'utf8');
  assert.match(c, /@view-transition\s*\{\s*navigation:\s*auto/);
  assert.match(c, /prefers-reduced-motion:\s*reduce\)\s*\{\s*@view-transition\s*\{\s*navigation:\s*none/);
  assert.match(c, /html\[data-motion='off'\]::view-transition-old\(\*\)/);
  assert.match(c, /view-transition-name:\s*site-header/);
});
