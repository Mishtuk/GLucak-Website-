// The GitHub Pages look-around copy of the edit screen: edit.js switches to it only on the marker the preview build writes, reads snapshot files
// under the base, and never calls fetch with anything but GET. The real edit page carries no marker.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = (f) => join(import.meta.dirname, '..', f);
const js = readFileSync(root('public/js/edit.js'), 'utf8').replace(/\r\n/g, '\n');

// Run just the marker block and api() from edit.js against a fake page and a fetch spy.
function load(meta) {
  const marker = js.slice(js.indexOf('  const PREVIEW ='), js.indexOf('  const login ='));
  const apiLine = js.slice(js.indexOf('  const api ='), js.indexOf('  const reply ='));
  const calls = [];
  const document = { getElementById: () => null, querySelector: (q) => (q.includes('gl-preview') ? meta : null) };
  const fetch = async (url, init = {}) => { calls.push({ url, method: init.method ?? 'GET' }); return new Response('{}', { status: 200 }); };
  const api = new Function('document', 'fetch', `const $ = () => null;\n${marker}\n${apiLine}\nreturn { api, PREVIEW, BASE, LOOK };`)(document, fetch);
  return { ...api, calls };
}
const marked = { content: 'readonly', dataset: { base: '/GLucak-Website-/' } };

test('preview mode: every write answers 403 look-around and fetch is never called with a non-GET method', async () => {
  const { api, calls, LOOK } = load(marked);
  for (const path of ['/edit/api/shows', '/edit/api/site', '/edit/api/products', '/edit/api/releases', '/edit/api/videos', '/edit/login', '/edit/logout', '/edit/api/history/shows/20260101T000000000Z-abcdef12']) {
    const r = await api(path, { version: 'x' });
    assert.equal(r.status, 403, path);
    const b = await r.json();
    assert.equal(b.message, LOOK);
    assert.equal(b.errors[0].message, 'Look-around mode: nothing is saved right now.');
  }
  assert.deepEqual(calls, []);
});

test('preview mode: reads come from the snapshot files under the base, GET only', async () => {
  const { api, calls } = load(marked);
  await api('/edit/api/shows');
  await api('/edit/api/history/videos');
  assert.deepEqual(calls, [{ url: '/GLucak-Website-/edit/api/shows.json', method: 'GET' }, { url: '/GLucak-Website-/edit/api/history/videos.json', method: 'GET' }]);
});

test('no marker: the real paths and real writes, as before', async () => {
  const { api, calls, PREVIEW } = load(null);
  assert.equal(PREVIEW, false);
  await api('/edit/api/shows');
  await api('/edit/api/shows', { a: 1 });
  assert.deepEqual(calls, [{ url: '/edit/api/shows', method: 'GET' }, { url: '/edit/api/shows', method: 'POST' }]);
});

test('edit.js: upload, backup, sign-in and sign-out are guarded in preview mode, and no write fetch is left outside api()', () => {
  assert.match(js, /async function upload\(file, upMsg\) \{\n\s+if \(PREVIEW\) return \{ message: LOOK \};/);
  assert.match(js, /if \(PREVIEW\) return say\(bkMsg, LOOK, 'error'\);/);
  assert.match(js, /if \(PREVIEW\) \{ say\(loginMsg, ''\); return load\(\); \}/);
  assert.match(js, /if \(PREVIEW\) return location\.reload\(\);/);
  const fetches = js.match(/\bfetch\(/g).length; // api(), upload's POST (guarded above), the backup GET (guarded above)
  assert.equal(fetches, 4, 'a new fetch call needs a preview guard and a look at this test');
});

test('the preview build: shipped data in a fresh DATA_DIR, read-only dev editor, a snapshot of every tab and History, marker written, no notice swap', () => {
  const s = readFileSync(root('tools/preview.mjs'), 'utf8');
  assert.match(s, /DEV_EDITOR: '1', EDIT_READONLY: '1'/);
  assert.match(s, /mkdtempSync\(join\(tmpdir\(\), 'gl-preview-'\)\)/);
  assert.match(s, /\['shows', 'site', 'products', 'releases', 'videos'\]/);
  assert.match(s, /HISTORY_KINDS/);
  assert.match(s, /<meta name="gl-preview" content="readonly" data-base=/);
  assert.doesNotMatch(s, /Preview only/);
  assert.match(s, /<head><meta name="robots" content="noindex">/);
});

test('the real edit page has no preview marker', () => {
  const page = root('dist/edit/index.html');
  if (!existsSync(page)) return; // npm test builds first
  assert.doesNotMatch(readFileSync(page, 'utf8'), /gl-preview/);
});
