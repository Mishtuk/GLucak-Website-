// Page structure over the built dist/ (npm test builds it first). Rules from the a11yproject checklist (WCAG 2.2), re-derived.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(import.meta.dirname, '../dist');
const files = readdirSync(DIST, { recursive: true }).filter((f) => String(f).endsWith('.html')).map(String);
const pages = files.map((f) => ({ f, h: readFileSync(join(DIST, f), 'utf8').replace(/<(script|style)[\s\S]*?<\/\1>|<!--[\s\S]*?-->/g, '') }));
const tags = (h, name) => h.match(new RegExp(`<${name}(?=[\\s>/])[^>]*>`, 'gi')) ?? [];
const each = (fn) => { for (const { f, h } of pages) fn(f, h); };

test('there are pages to check', () => assert.ok(pages.length >= 5));
test('one h1 and no skipped heading level', () => each((f, h) => {
  assert.equal(tags(h, 'h1').length, 1, `${f}: h1 count`);
  let prev = 0;
  for (const [, n] of h.matchAll(/<h([1-6])[\s>]/g)) { assert.ok(+n <= prev + 1, `${f}: h${prev} then h${n}`); prev = +n; }
}));
test('html lang and a unique, non-empty title', () => {
  const seen = new Map();
  each((f, h) => {
    assert.match(tags(h, 'html')[0] ?? '', /\slang="[a-z]{2}/, `${f}: lang`);
    const t = h.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1].trim();
    assert.ok(t, `${f}: title`);
    assert.ok(!seen.has(t), `${f}: title repeats ${seen.get(t)}`);
    seen.set(t, f);
  });
});
test('viewport allows zoom', () => each((f, h) => {
  const v = tags(h, 'meta').find((m) => /name="viewport"/.test(m)) ?? '';
  assert.doesNotMatch(v, /user-scalable\s*=\s*(no|0)|maximum-scale/i, `${f}: viewport`);
}));
test('every img has alt', () => each((f, h) => { for (const i of tags(h, 'img')) assert.match(i, /\salt=/, `${f}: ${i.slice(0, 80)}`); }));
test('no autofocus', () => each((f, h) => assert.doesNotMatch(h, /<[^>]+\sautofocus[\s=>]/, `${f}: autofocus`)));
test('title attributes only on iframes', () => each((f, h) => {
  for (const t of h.match(/<(?!iframe[\s>])[a-z][^>]*\stitle=[^>]*>/gi) ?? []) assert.fail(`${f}: ${t.slice(0, 80)}`); // <title> has no attribute, so it never matches
}));
test('target=_blank always has rel noopener', () => each((f, h) => {
  for (const a of tags(h, 'a')) if (/target="?_blank/.test(a)) assert.match(a, /rel="[^"]*noopener/, `${f}: ${a.slice(0, 80)}`);
}));
