// Admin round A1 (DESIGN 31a-e, 31i): tabs, View site, Today, Undo bar (no confirm()), wrapping rows, sign-out guard,
// "Saved at", in-browser photo resize with a fallback to the original.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const src = (f) => readFileSync(join(import.meta.dirname, '..', f), 'utf8');
const page = src('src/pages/edit/index.astro'), js = src('public/js/edit.js');

test('31a: six tab buttons (role tab, one per panel; Videos last), the span rule only fires on a fifth last tab, no intro line', () => {
  const tabs = [...page.matchAll(/<button id="tab-(\w+)" class="ed-tab" type="button" role="tab" aria-selected="(true|false)" aria-controls="panel-\1"/g)];
  assert.deepEqual(tabs.map((t) => t[1]), ['shows', 'releases', 'identity', 'bio', 'products', 'videos']);
  assert.deepEqual(tabs.map((t) => t[2]), ['true', 'false', 'false', 'false', 'false', 'false']);
  assert.match(page, /\.ed-tab:nth-child\(5\):last-child \{ grid-column: span 2; \}/);
  assert.match(page, /grid-auto-flow: column; grid-auto-columns: minmax\(0, 1fr\); grid-template-columns: none;/);
  assert.ok(!page.includes('Change your shows, releases, IDENTITY and bio here'), 'Today replaces the intro line');
});

test('31b: View site opens the home page in a new tab, next to Sign out', () => {
  assert.match(page, /<a class="ed-btn ed-plain" href="\/" target="_blank" rel="noopener">View site<\/a>\s*<button id="logout"/);
});

test('31c: Today card markup (heading, two items, note, three buttons; A3 shows and wires Add video)', () => {
  assert.match(page, /<section class="ed-now" aria-labelledby="now-h">\s*<h2 id="now-h" class="ed-now-h">Today<\/h2>/);
  for (const t of ['Next show', 'IDENTITY', 'id="now-show"', 'id="now-id"', 'id="now-note" hidden', 'data-go="add-show">Add show', 'data-go="fix-release">Fix a release']) assert.ok(page.includes(t), t);
  assert.match(page, /data-go="add-video">Add video</);
  assert.ok(!/data-go="add-video" hidden/.test(page) && /go === 'add-video'/.test(js), 'A3 wires Add video');
});

test('31c: Today values go in through textContent (a <script> venue stays text)', () => {
  assert.ok(!js.includes('innerHTML') && !js.includes('insertAdjacentHTML') && !js.includes('document.write'));
  assert.match(js, /function renderToday\(\)/);
  assert.match(js, /say\(\$\('now-show'\),/);
  assert.match(js, /el\.textContent = text/, 'say() writes textContent');
});

test('31d: Undo bar is the first child of each list tab\'s save bar; Delete no longer asks', () => {
  for (const k of ['shows', 'releases', 'products']) {
    assert.match(page, new RegExp(`<div class="ed-bar">\\s*<div id="undo-${k}" class="ed-undo" role="status" hidden><p class="ed-undo-t"></p><button class="ed-btn ed-undo-b" type="button">Undo</button></div>`));
  }
  assert.ok(!/\bconfirm\(/.test(js), 'no window.confirm left');
  assert.equal([...js.matchAll(/removeRow\('(shows|releases|products)'/g)].length, 3);
  assert.ok(js.includes('removed so far.') && js.includes('removed: '));
  assert.ok(!/setTimeout\([^)]*undo/i.test(js), 'no timer on the Undo bar');
  assert.match(page, /\.ed-undo\[hidden\] \{ display: none; \}/);
});

test('31e: rows wrap instead of cutting (no nowrap / ellipsis on title and meta); the year sits under the date', () => {
  assert.doesNotMatch(page, /\.ed-row-title, \.ed-row-meta \{ white-space: nowrap/);
  assert.match(page, /\.ed-row-meta \{ display: flex; flex-wrap: wrap;/);
  assert.match(page, /\.ed-row-title \{ overflow-wrap: anywhere; \}/);
  assert.ok(js.includes("class: 'ed-row-year'"));
});

test('31i: sign-out guard names the tabs; "Saved at" goes in front of the server\'s Saved.; empty states stay', () => {
  assert.match(page, /id="out-q"/);
  assert.ok(js.includes('Not saved yet in ') && js.includes('Sign out anyway?'));
  assert.ok(!js.includes('You have changes that aren'));
  assert.ok(js.includes("toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })"));
  for (const t of ['No shows yet. Press Add show.', 'No releases yet. Press Add release.', 'No products yet. Press Add product.']) assert.ok(js.includes(t), t);
});

test('amendment 4 and ruling 10: Add show starts as Open mic; scroll padding 16rem', () => {
  assert.ok(js.includes("showRow({ type: 'open-mic' })"));
  assert.match(page, /scroll-padding: 1rem 0 16rem/);
});

// ---- photo resize: the size math and the fall back to the original ----
const block = js.match(/\/\/ <shrink>([\s\S]*?)\/\/ <\/shrink>/)?.[1];
const load = (env = {}) => new Function('createImageBitmap', 'document', `${block}; return { fitSize, shrink, MAX_UPLOAD };`)(env.createImageBitmap, env.document);

test('resize: long edge 2000, never enlarged, ratio kept', () => {
  assert.ok(block, 'the shrink block is in edit.js');
  const { fitSize } = load();
  assert.deepEqual(fitSize(4000, 3000), { w: 2000, h: 1500 });
  assert.deepEqual(fitSize(3000, 4000), { w: 1500, h: 2000 });
  assert.deepEqual(fitSize(800, 600), { w: 800, h: 600 });
  assert.deepEqual(fitSize(1, 5000), { w: 1, h: 2000 });
  assert.equal(fitSize(0, 0), null);
  assert.equal(fitSize(NaN, 10), null);
});

const fakeCanvas = (blobFor) => ({ createElement: () => ({ getContext: () => ({ drawImage() {} }), toBlob: (done, type, q) => done(blobFor(type, q)) }) });
const bmp = (w, h) => ({ width: w, height: h, close() {} });

test('resize: a throw in decode, a missing canvas, a null blob or a blob that stays too big all give null (original goes up)', async () => {
  const file = { type: 'image/jpeg', size: 1000 };
  assert.equal(await load({ createImageBitmap: async () => { throw new Error('decode'); }, document: fakeCanvas(() => null) }).shrink(file), null);
  assert.equal(await load({ createImageBitmap: async () => bmp(4000, 3000), document: { createElement: () => ({ getContext: () => null }) } }).shrink(file), null);
  assert.equal(await load({ createImageBitmap: async () => bmp(4000, 3000), document: fakeCanvas(() => null) }).shrink(file), null);
  assert.equal(await load({ createImageBitmap: async () => bmp(4000, 3000), document: fakeCanvas((type) => ({ type, size: 9 * 1024 * 1024 })) }).shrink(file), null);
  assert.equal(await load({ createImageBitmap: async () => bmp(4000, 3000), document: { createElement: () => { throw new Error('no memory'); } } }).shrink(file), null);
});

test('resize: steps quality down until under 5 MB; WebP first, JPEG when the browser makes something else', async () => {
  const sizes = [];
  const webp = await load({ createImageBitmap: async () => bmp(4000, 3000), document: fakeCanvas((type, q) => { sizes.push(q); return { type, size: q > 0.7 ? 6e6 : 3e6 }; }) }).shrink({});
  assert.equal(webp.type, 'image/webp');
  assert.deepEqual(sizes, [0.85, 0.75, 0.65]);
  const types = [];
  const jpeg = await load({ createImageBitmap: async () => bmp(4000, 3000), document: fakeCanvas((type) => { types.push(type); return { type: 'image/png', size: 1000 }; }) }).shrink({});
  assert.ok(jpeg, 'a result');
  assert.deepEqual(types.slice(0, 2), ['image/webp', 'image/jpeg'], 'Safari path');
});

test('resize: upload() sends the original when shrinking fails and it is under 5 MB; refuses without sending when it is over', () => {
  assert.ok(js.includes('const body = small ?? file;'));
  assert.ok(js.includes('if (!small && file.size > MAX_UPLOAD)'));
  assert.ok(js.includes('That photo is too big and this phone wouldn’t shrink it. Try another one.'));
  assert.ok(!js.includes('over 5 MB. Pick a smaller one'));
  assert.ok(js.includes('Getting your photo ready...') && js.includes('Uploaded. Press Save to keep it.'));
});
