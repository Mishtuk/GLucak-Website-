import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { splitShows, showsHtml, validateShow } from '../src/lib/shows.js';

const row = (o = {}) => ({ date: '2026-12-12', type: 'show', venue: 'V', city: 'C', ...o });
const noon = (d) => new Date(`${d}T17:00:00Z`); // midday in New York

test('shipped shows.json is valid', () => {
  for (const r of JSON.parse(readFileSync(new URL('../src/data/shows.json', import.meta.url), 'utf8'))) validateShow(r);
});

test('today is upcoming, yesterday is past', () => {
  const s = splitShows([row({ date: '2026-12-12' }), row({ date: '2026-12-11' })], noon('2026-12-12'));
  assert.deepEqual(s.upcoming.map((r) => r.date), ['2026-12-12']);
  assert.deepEqual(s.past.map((r) => r.date), ['2026-12-11']);
});

test('boundary uses New York time, not UTC', () => {
  // 02:00 UTC Dec 13 is still the evening of Dec 12 in New York
  assert.equal(splitShows([row({ date: '2026-12-12' })], new Date('2026-12-13T02:00:00Z')).upcoming.length, 1);
  // 06:00 UTC Dec 13 = 01:00 ET Dec 13, so Dec 12 is past
  assert.equal(splitShows([row({ date: '2026-12-12' })], new Date('2026-12-13T06:00:00Z')).past.length, 1);
});

test('sorting: upcoming ascending, past descending', () => {
  const s = splitShows([row({ date: '2027-01-05' }), row({ date: '2026-12-20' }), row({ date: '2026-01-01' }), row({ date: '2026-06-01' })], noon('2026-12-12'));
  assert.deepEqual(s.upcoming.map((r) => r.date), ['2026-12-20', '2027-01-05']);
  assert.deepEqual(s.past.map((r) => r.date), ['2026-06-01', '2026-01-01']);
});

test('validation rejects bad rows', () => {
  for (const bad of [{ date: '2026-13-40' }, { date: '12/12/2026' }, { date: '2026-02-30' }, { type: 'party' }, { time: '25:00' }, { venue: '' },
    { link: 'javascript:alert(1)' }, { link: 'ftp://x.com' }, { link: 'not a url' }]) {
    assert.throws(() => validateShow(row(bad)), undefined, JSON.stringify(bad));
  }
  validateShow(row({ time: '19:30', link: 'https://x.com' }));
});

test('button label rule', () => {
  const now = noon('2026-01-01');
  const html = (o) => showsHtml([row(o)], now);
  assert.match(html({ link: 'https://x.com' }), />Tickets</);
  assert.match(html({ type: 'open-mic', link: 'https://x.com' }), />Details</);
  assert.doesNotMatch(html({}), /<a /);
  assert.doesNotMatch(html({ type: 'open-mic' }), /<a /);
});

test('injection stays inert', () => {
  const now = noon('2026-01-01');
  const out = showsHtml([row({ venue: '<script>alert(1)</script>', city: "' OR 1=1 --", link: 'https://x.com/?a="><script>' })], now);
  assert.ok(!out.includes('<script>'));
  assert.ok(out.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(out.includes('&#39; OR 1=1 --'));
  assert.ok(!out.includes('"><script>'));
  // a javascript: link row is dropped entirely, never rendered
  const js = showsHtml([row({ venue: 'Evil', link: 'javascript:alert(1)' })], now);
  assert.ok(!js.includes('javascript:') && !js.includes('Evil'));
});

test('past list and Home limit', () => {
  const rows = [row({ date: '2026-12-12', venue: 'A' }), row({ date: '2026-12-13', venue: 'B' }), row({ date: '2026-01-01', venue: 'Old' })];
  const home = showsHtml(rows, noon('2026-06-01'), { limit: 1 });
  assert.ok(home.includes('>A<') && !home.includes('>B<') && !home.includes('Old'));
  assert.ok(showsHtml(rows, noon('2026-06-01'), { past: true }).includes('Old'));
});
