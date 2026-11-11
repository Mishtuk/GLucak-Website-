// Round IG2 (DESIGN 20): the section word has no fill, About's setlist, meta lines as two spans (no middle dot).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const page = (f) => readFileSync(join(ROOT, 'dist', f), 'utf8');
const css = readFileSync(join(ROOT, 'src/styles/global.css'), 'utf8');

test('20a: the section word stands on the band rule with no fill, 17px 700; sub pages show their top rule', () => {
  const tab = css.match(/\n\.tab \{([^]*?)\n\}/)[1];
  assert.ok(/--tab-h: 1\.5rem;/.test(css));
  assert.ok(!/background/.test(tab) && /color: var\(--text\)/.test(tab) && /font-size: 1\.0625rem; font-weight: 700/.test(tab));
  assert.ok(!css.includes('.sub > .band:first-child { border-top-color: transparent; }'));
});

test('20c: About has the Listen / Shows / Patreon setlist from 900px; the solid Patreon button stays for phones', () => {
  const h = page('about/index.html');
  const set = h.match(/<ul class="about-set">([^]*?)<\/ul>/)[1];
  assert.deepEqual([...set.matchAll(/<a href="([^"]+)"[^>]*>([^<]+)</g)].map((m) => [m[1], m[2]]).map(([u, t]) => [u.startsWith('http') ? 'ext' : u, t]),
    [['/music/', 'Listen'], ['/shows/', 'Shows'], ['ext', 'Patreon']]);
  assert.match(h, /<a class="btn btn-solid about-patreon"/);
  assert.match(css, /@media \(min-width: 900px\) \{\s*\.about-actions \{ display: block; align-self: start; \}\s*\.about-patreon \{ display: none; \}/);
  assert.ok(!/\.about-set[^{]*\{[^}]*(transition: (?!none)|animation|(?<!text-)transform)/.test(css), "no motion on the setlist");
});

test('20d: no middle dot in any page; the kicker and the countdown are two spans with a literal space', () => {
  for (const f of ['index.html', 'music/index.html', 'shows/index.html', 'about/index.html']) {
    assert.ok(!/&middot;|&#183;|·/.test(page(f).replace(/<script[^]*?<\/script>/g, '')), `${f}: no middle dot`);
  }
  const k = page('index.html').match(/<p class="v2-kicker">([^]*?)<\/p>/)[1];
  assert.match(k, /^<span class="v2-kicker-type">Latest \w+<\/span> <span>[A-Z][a-z]{2} \d{1,2}, \d{4}<\/span>$/);
  for (const f of ['index.html', 'music/index.html']) {
    const c = page(f).match(/<p class="identity-when identity-count">([^]*?)<\/p>/);
    if (c) assert.match(c[1], /^<time class="identity-date" datetime="[\d-]+">[^<]+<\/time> <span>\d+ days? to go<\/span>$/);
  }
});
