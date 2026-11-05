import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { contrast } from '../src/lib/contrast.js';

const dir = new URL('../src/eras/', import.meta.url);
for (const f of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  test(`era ${f} meets contrast`, () => {
    const era = JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
    for (const k of ['name', 'colors', 'art', 'word']) assert.ok(era[k], `missing ${k}`);
    const allowed = ['name', 'colors', 'art', 'texture', 'mark', 'word'];
    for (const k of Object.keys(era)) assert.ok(allowed.includes(k), `unknown field ${k}`);
    assert.ok(era.mark == null || /^\/[\w./-]+\.(webp|png|svg)$/.test(era.mark), 'mark is a path or null');
    if (era.mark) assert.ok(contrast(era.colors.bg, '#000000') <= 1.5, 'mark only on a dark bg (D25)');
    const c = era.colors;
    assert.ok(contrast(c.text, c.bg) >= 4.5, 'text/bg');
    assert.ok(contrast(c.muted, c.bg) >= 4.5, 'muted/bg');
    assert.ok(contrast(c['accent-text'], c.accent) >= 4.5, 'accent-text/accent');
    assert.ok(contrast(c.accent, c.bg) >= 3, 'accent/bg');
  });
}
test('contrast sanity', () => {
  assert.equal(Math.round(contrast('#000000', '#ffffff')), 21);
});
