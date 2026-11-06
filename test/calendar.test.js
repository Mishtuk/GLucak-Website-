import { test } from 'node:test';
import assert from 'node:assert/strict';
import { icsById, icsFor, nowHtml, showId, showsHtml } from '../src/lib/shows.js';

const row = (o = {}) => ({ date: '2026-12-12', type: 'show', venue: 'V', city: 'C', ...o });
const noon = (d) => new Date(`${d}T17:00:00Z`);
const link = (href, text, rel = ' rel="noopener"') => `<a href="${href}"${rel}>${text}</a>`;
const GO = { title: 'Go', date: '2026-03-20', link: 'https://x.example/go' };
const WIA = { title: 'Who I Am', date: '2026-11-13', link: 'https://x.example/wia' };

test('D57 Now wording: Show / Open mic / today, linking #shows; no aria-label on the Now line in any state', () => {
  assert.equal(nowHtml([row({ date: '2026-11-28', type: 'open-mic', venue: 'The Rail', city: 'Doylestown' })], noon('2026-11-21'), []), link('#shows', 'Open mic Nov 28: The Rail, Doylestown', ''));
  assert.equal(nowHtml([row({ date: '2026-12-01', type: 'open-mic', venue: 'Pub', city: 'Philly' })], noon('2026-12-01'), []), link('#shows', 'Open mic today: Pub, Philly', ''));
  assert.equal(nowHtml([row({ date: '2026-12-01', venue: 'Pub', city: 'Philly' })], noon('2026-12-01'), []), link('#shows', 'Show today: Pub, Philly', ''));
  assert.equal(nowHtml([row({ date: '2026-11-28', venue: 'The Rail', city: 'Doylestown' })], noon('2026-11-21'), []), link('#shows', 'Show Nov 28: The Rail, Doylestown', ''));
  const states = [nowHtml([], noon('2026-11-06'), [GO, WIA]), nowHtml([], noon('2026-11-13'), [GO, WIA]), nowHtml([], noon('2026-11-20'), [GO, WIA]),
    nowHtml([row({ date: '2026-12-02' })], noon('2026-12-01'), []), nowHtml([], noon('2027-03-01'), [GO])];
  for (const h of states) assert.ok(h.startsWith('<a ') && !h.includes('aria-label'), h);
});

test('Now line: release DAY beats an upcoming release (B before A)', () => {
  const SR = { title: 'Scenic Route', date: '2026-11-20', link: 'https://x.example/sr' };
  assert.equal(nowHtml([], noon('2026-11-13'), [GO, WIA, SR]), link(WIA.link, 'Out today: Who I Am'));
  assert.equal(nowHtml([], noon('2026-11-06'), [GO, WIA, SR]), link(WIA.link, 'Out Nov 13: Who I Am'), 'before the day the sooner one leads');
});

test('calendar link: upcoming rows and the poster only, never Played; hostile venue stays escaped in the name', () => {
  const now = noon('2026-12-01');
  const out = showsHtml([row({ date: '2026-12-05', venue: 'The Rail' }), row({ date: '2026-12-06', venue: 'B' }), row({ date: '2026-11-01', venue: 'Old' })], now, { past: true });
  const [up, played] = out.split('<div class="played">');
  assert.match(up, /<a class="cal-link" href="\/shows\/2026-12-05-the-rail-[0-9a-f]{6}\.ics" aria-label="Add to calendar: The Rail, Dec 5"><svg class="cal-icon" aria-hidden="true"><use href="#i-cal"\/><\/svg><span class="cal-word">Add to calendar<\/span><\/a>/);
  assert.match(up, /<a class="cal-btn" href="\/shows\/2026-12-06-b-[0-9a-f]{6}\.ics" aria-label="Add to calendar: B, Dec 6"><svg/);
  assert.ok(!/cal-(link|btn)/.test(played), 'no calendar on Played rows');
  const bad = showsHtml([row({ date: '2026-12-05', venue: '<script>"x"' })], now);
  assert.ok(!bad.includes('<script>') && bad.includes('aria-label="Add to calendar: &lt;script&gt;&quot;x&quot;, Dec 5"'));
});

const HOSTILE = "<script>alert(1)</script>' OR 1=1 --; a,b\\c\nBEGIN:VEVENT\r\nSUMMARY:pwned and a very long venue name to force folding past seventy-five octets, with café éééé";
test('.ics for a hostile venue: valid (CRLF, escaped, folded) and inert', () => {
  const r = row({ date: '2026-12-05', venue: HOSTILE, city: 'Phil\\a;delphia, PA', link: 'https://x.example/t?a=1;b=2', with: 'Fran, Carroll' });
  const ics = icsFor(r, new Date('2026-12-01T12:00:00Z'));
  assert.ok(ics.endsWith('\r\n') && !/[^\r]\n/.test(ics), 'CRLF only');
  for (const l of ics.split('\r\n').slice(0, -1)) assert.ok(Buffer.byteLength(l) <= 75, `folded at 75 octets: ${l}`);
  const lines = ics.replace(/\r\n /g, '').split('\r\n').slice(0, -1);
  assert.equal(lines.filter((l) => l === 'BEGIN:VEVENT').length, 1, 'a newline in the venue cannot start a second event');
  assert.equal(lines.filter((l) => l.startsWith('SUMMARY:')).length, 1);
  const sum = lines.find((l) => l.startsWith('SUMMARY:'));
  assert.ok(sum.startsWith("SUMMARY:GLucak at <script>alert(1)</script>' OR 1=1 --\\; a\\,b\\\\c\\nBEGIN:VEVENT\\nSUMMARY:pwned"), sum);
  assert.ok(lines.some((l) => l.startsWith('LOCATION:') && l.endsWith('Phil\\\\a\\;delphia\\, PA')));
  assert.ok(lines.every((l) => !/[\x00-\x08\x0b-\x1f\x7f]/.test(l)), 'no control characters');
  assert.deepEqual(lines.slice(0, 2), ['BEGIN:VCALENDAR', 'VERSION:2.0']);
  assert.equal(lines.at(-1), 'END:VCALENDAR');
  assert.ok(lines.includes(`UID:${showId(r)}@glucak.com`) && lines.includes('DTSTART;VALUE=DATE:20261205') && lines.includes('DTEND;VALUE=DATE:20261206'));
  assert.ok(lines.includes('DTSTAMP:20261201T120000Z') && lines.includes('URL:https://x.example/t?a=1;b=2'));
});

test('.ics: timed event uses America/New_York with a VTIMEZONE; open mic wording; no link means no URL', () => {
  const ics = icsFor(row({ date: '2026-12-05', time: '20:00', type: 'open-mic', venue: 'Pub', city: 'Philly' }), new Date('2026-12-01T12:00:00Z'));
  assert.ok(ics.includes('BEGIN:VTIMEZONE') && ics.includes('DTSTART;TZID=America/New_York:20261205T200000') && ics.includes('DTEND;TZID=America/New_York:20261205T220000'));
  assert.ok(ics.includes('SUMMARY:GLucak open mic at Pub') && ics.includes('GLucak at an open mic.'));
  assert.ok(!ics.includes('\r\nURL:'));
});

test('.ics lookup: upcoming by id; past show and unknown id are null; ids are stable and distinct', () => {
  const now = noon('2026-12-01');
  const up = row({ date: '2026-12-05', venue: 'The Rail' }), old = row({ date: '2026-11-01', venue: 'Old' });
  assert.equal(showId(up), showId({ ...up, city: 'Elsewhere' }), 'stable');
  assert.notEqual(showId(up), showId({ ...up, venue: 'The Rail 2' }));
  assert.ok(icsById([up, old], showId(up), now).includes('SUMMARY:GLucak at The Rail'));
  assert.equal(icsById([up, old], showId(old), now), null);
  assert.equal(icsById([up, old], 'nope', now), null);
  assert.match(showId(row({ venue: '!!!' })), /-show-[0-9a-f]{6}$/);
});
