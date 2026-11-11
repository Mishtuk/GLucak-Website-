// Round IG3 (DESIGN 21, D87): the ledge under the section word, setlist arrows, the placeholder chip on the footer rule.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const css = readFileSync(join(ROOT, 'src/styles/global.css'), 'utf8').replace(/\r\n/g, '\n');
const htmlFiles = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? htmlFiles(p) : p.endsWith('.html') ? [p] : []; });

test('21a: the ledge is a static solid step under the word (clip-path, no box, no motion)', () => {
  const ledge = css.match(/\n\.tab::before \{([^]*?)\n\}/)[1];
  assert.ok(/clip-path: polygon/.test(ledge) && /background: currentColor/.test(ledge) && /height: 0\.5rem/.test(ledge));
  assert.ok(!/animation|transition|transform/.test(ledge));
  assert.ok(!/\.tab-blank \{[^}]*(background|border)/.test(css), 'the blank ledge has no hatch');
});

test('21b: each setlist row gets an arrow from 900px; the new-tab row the diagonal; no motion', () => {
  assert.match(css, /@media \(min-width: 900px\) \{[^]*?\.about-set a::after \{[^}]*mask: url\(/);
  assert.match(css, /\.about-set a\[target='_blank'\]::after \{/);
  const arrow = css.match(/\.about-set a::after \{([^}]*)\}/)[1];
  assert.ok(!/transition|animation|transform/.test(arrow) && /currentColor/.test(arrow));
});

test('21c: the placeholder chip is off the hero and off every page footer now the era is IDENTITY (D93)', () => {
  assert.ok(!readFileSync(join(DIST, 'index.html'), 'utf8').includes('hero-chip'));
  assert.ok(!css.includes('.hero-chip'));
  for (const f of htmlFiles(DIST)) {
    const h = readFileSync(f, 'utf8');
    if (!h.includes('class="site-footer"')) continue;
    assert.ok(!h.includes('ph-chip footer-chip'), `${f}: no Placeholder chip with the IDENTITY era`);
  }
});
