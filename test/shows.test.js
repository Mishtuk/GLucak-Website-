import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nowHtml, splitShows, showsHtml, validateShow } from '../src/lib/shows.js';

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
    { link: 'javascript:alert(1)' }, { link: 'ftp://x.com' }, { link: 'not a url' }, { time: ['19:30'] }, { time: 1930 }, { date: '0000-00-00' }]) {
    assert.throws(() => validateShow(row(bad)), undefined, JSON.stringify(bad));
  }
  validateShow(row({ time: '19:30', link: 'https://x.com' }));
  assert.throws(() => validateShow(row({ date: '0000-00-00' })), /bad date/, 'not a RangeError');
  assert.throws(() => validateShow(row({ time: ['19:30'] })), /bad time/, 'an array would render "12: PM"');
});

test('links: only http(s); disguised javascript:, data:, vbscript: and scheme-relative are refused', () => {
  for (const link of [' javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'java\tscript:alert(1)', '\x01javascript:alert(1)', '\u00a0javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>', 'vbscript:msgbox(1)', '//evil.com']) {
    assert.throws(() => validateShow(row({ link })), /bad link/, JSON.stringify(link));
  }
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

test('optional with line, escaped', () => {
  const now = noon('2026-01-01');
  assert.ok(showsHtml([row({ with: 'Fran Carroll' })], now).includes('With Fran Carroll'));
  assert.ok(!showsHtml([row()], now).includes('With '));
  const bad = showsHtml([row({ with: '<script>x</script>' })], now);
  assert.ok(!bad.includes('<script>') && bad.includes('With &lt;script&gt;'));
  assert.throws(() => validateShow(row({ with: '  ' })));
});

test('past list and Home limit', () => {
  const rows = [row({ date: '2026-12-12', venue: 'A' }), row({ date: '2026-12-13', venue: 'B' }), row({ date: '2026-01-01', venue: 'Old' })];
  const home = showsHtml(rows, noon('2026-06-01'), { limit: 1 });
  assert.ok(home.includes('A, C') && !home.includes('B, C') && !home.includes('Old'));
  const page = showsHtml(rows, noon('2026-06-01'), { past: true });
  assert.ok(page.includes('<h3>Played</h3>') && page.includes('Old, C') && !page.includes('Past shows'));
  assert.ok(showsHtml(rows, noon('2026-06-01'), { limit: 3, allLink: '/shows/' }).includes('href="/shows/">All shows<'));
});

test('poster is the first full show, never an open mic', () => {
  const now = noon('2026-06-01');
  const show = showsHtml([row({ venue: 'Big' }), row({ date: '2026-12-13', venue: 'Next' })], now);
  assert.match(show, /<li class="poster">.*Big, C/);
  assert.equal((show.match(/class="poster"/g) || []).length, 1);
  assert.doesNotMatch(showsHtml([row({ type: 'open-mic' }), row({ date: '2026-12-13' })], now), /class="poster"/);
});

test('empty state: never blank, Played rows if any, no Request button without a booking email', () => {
  const now = noon('2026-12-31');
  const none = showsHtml([], now);
  assert.ok(none.includes('No shows booked right now') && none.includes('>Follow<') && !none.includes('Played'));
  assert.ok(!none.includes('Request a show'));
  assert.ok(showsHtml([row({ venue: 'Old' })], now, { past: true }).includes('Played'));
});

test('Now line: next show within 14 days, else empty so the release line stays; escaped', () => {
  const now = noon('2026-12-01');
  assert.equal(nowHtml([row({ date: '2026-12-04', venue: 'Pub', city: 'Philly' })], now), '<a href="#shows">Next show: Pub, Philly</a>');
  assert.equal(nowHtml([row({ date: '2026-12-21' })], now), ''); // 20 days
  assert.equal(nowHtml([row({ date: '2026-12-15' })], now).startsWith('<a'), true); // day 14 counts
  assert.equal(nowHtml([row({ date: '2026-11-20' })], now), ''); // past
  const bad = nowHtml([row({ date: '2026-12-04', venue: '<script>x</script>', city: "' OR 1=1 --" })], now);
  assert.ok(!bad.includes('<script>') && bad.includes('&lt;script&gt;'));
});
