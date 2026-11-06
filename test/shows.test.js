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
  assert.doesNotMatch(html({}), /btn-show/);
  assert.doesNotMatch(html({ type: 'open-mic' }), /btn-show/);
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
  assert.ok(page.includes('<h2>Played</h2>') && page.includes('Old, C') && !page.includes('Past shows'));
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

const WIA = { title: 'Who I Am', date: '2026-11-13', link: 'https://wingsmusic.lnk.to/WhoIAm' };
const GO = { title: 'Go', date: '2026-03-20', link: 'https://wingsmusic.lnk.to/370407-Go' };
const link = (href, text, rel = ' rel="noopener"') => `<a href="${href}"${rel}>${text}</a>`;
const OUT13 = link(WIA.link, 'Out Nov 13: Who I Am');

test('Now line D45: Nov 6 / 13 / 20 / 21 pick Out Nov 13, Out today, Out now, then a show or the newest release', () => {
  const rels = [GO, WIA];
  assert.equal(nowHtml([], noon('2026-11-06'), rels), OUT13);
  assert.equal(nowHtml([], noon('2026-10-30'), rels), OUT13, '14 days ahead');
  assert.ok(!nowHtml([], noon('2026-10-29'), rels).includes('Out Nov 13'), '15 days ahead: not yet');
  assert.equal(nowHtml([], noon('2026-11-13'), rels), link(WIA.link, 'Out today: Who I Am'));
  assert.equal(nowHtml([], noon('2026-11-20'), rels), link(WIA.link, 'Out now: Who I Am'));
  const show = row({ date: '2026-11-28', venue: 'The Rail', city: 'Doylestown' });
  assert.equal(nowHtml([show], noon('2026-11-21'), rels), link('#shows', 'Show Nov 28: The Rail, Doylestown', ''));
  assert.equal(nowHtml([], noon('2026-11-21'), rels), link(WIA.link, 'Out now: Who I Am'), 'newest release');
  assert.equal(nowHtml([row({ date: '2026-12-21' })], noon('2026-11-21'), [GO]), link(GO.link, 'Out now: Go'), 'show too far: newest');
  assert.equal(nowHtml([], noon('2026-11-21'), []), '', 'nothing at all');
});

test('Now line D45: a show on the day says Today; a coming release beats a show; day 14 counts, 15 does not', () => {
  assert.equal(nowHtml([row({ date: '2026-12-01', venue: 'Pub', city: 'Philly' })], noon('2026-12-01'), []), link('#shows', 'Show today: Pub, Philly', ''));
  assert.equal(nowHtml([row({ date: '2026-11-08' })], noon('2026-11-06'), [GO, WIA]), OUT13);
  assert.ok(nowHtml([row({ date: '2026-12-15' })], noon('2026-12-01'), []).includes('#shows'));
  assert.equal(nowHtml([row({ date: '2026-12-16' })], noon('2026-12-01'), []), '');
  assert.equal(nowHtml([row({ date: '2026-11-20' })], noon('2026-12-01'), []), ''); // past
  assert.ok(!nowHtml([], noon('2026-11-06'), [WIA]).includes('Pre-save'));
});

test('Now line D45: everything escaped, release links http(s) only', () => {
  const bad = nowHtml([row({ date: '2026-12-04', venue: '<script>x</script>', city: "' OR 1=1 --" })], noon('2026-12-01'), []);
  assert.ok(!bad.includes('<script>') && bad.includes('&lt;script&gt;') && bad.includes('&#39; OR 1=1 --'));
  const rel = nowHtml([], noon('2026-11-06'), [{ ...WIA, title: '<img src=x onerror=1>"', link: 'https://x.example/?a="b"&c=<' }]);
  assert.ok(!rel.includes('<img') && rel.includes('&lt;img') && !rel.includes('"b"'));
  assert.equal(nowHtml([], noon('2026-11-06'), [{ ...WIA, link: 'javascript:alert(1)' }]), '');
});

test('poster art: only the poster li has it, rows never', async () => {
  
  const mk = (d, venue) => ({ date: d, type: 'show', venue, city: 'X' });
  const out = showsHtml([mk('2030-01-01', 'A'), mk('2030-01-02', 'B'), mk('2030-01-03', 'C')], new Date('2029-12-01T12:00:00Z'));
  assert.equal(out.split('poster-art').length - 1, 1);
  assert.match(out, /<li class="poster"><picture><img class="poster-art graded"/);
  assert.ok(!/<li class="row">[^]*?poster-art[^]*?<\/li>/.test(out.replace(/<li class="poster">[^]*?<\/li>/, '')));
});

// ---------- D61: optional street address ----------
import { showsLdHtml, icsFor } from '../src/lib/shows.js';
import { checkShows } from '../src/lib/store.js';
const NOW = noon('2026-12-01');
const HOST = "<script>x</script>' OR 1=1 --; a,b";
test('address validation: trim, 120, one line, empty unset, type', () => {
  validateShow(row({ address: '  12 Main St  ' })); validateShow(row({ address: 'a'.repeat(120) })); validateShow(row({ address: '' }));
  assert.throws(() => validateShow(row({ address: 'a'.repeat(121) })), /^Error: That address is too long\. 120 letters at most\.$/);
  for (const a of ['1 Main\n2', '1 Main\r\n2', 'x\u2028y']) assert.throws(() => validateShow(row({ address: a })), /^Error: Put the address on one line\.$/);
  for (const a of [5, {}, []]) assert.throws(() => validateShow(row({ address: a })));
  assert.equal(checkShows([row({ address: '   ' })]).rows[0].address, undefined, 'empty is not stored');
  assert.equal(checkShows([row({ address: ' 12 Main St ' })]).rows[0].address, '12 Main St');
  assert.equal(checkShows([row({ address: 'a\nb' })]).errors[0].message, 'Show 1: Put the address on one line.');
});
test('address never in public HTML; JSON-LD streetAddress only when set', () => {
  const r = row({ address: HOST });
  assert.ok(!showsHtml([r], NOW, { past: true }).includes('script>x') && !showsHtml([r], NOW).includes('Main'));
  assert.ok(!showsHtml([row({ address: '12 Main St' })], NOW).includes('12 Main'));
  const ld = showsLdHtml([row({ address: '12 Main St' })], NOW);
  assert.equal(JSON.parse(ld.replace(/^<script[^>]*>|<\/script>$/g, ''))[0].location.address.streetAddress, '12 Main St');
  assert.ok(!showsLdHtml([row()], NOW).includes('streetAddress'));
  const h = showsLdHtml([r], NOW);
  assert.ok(!h.slice(1, -9).includes('<script'), 'hostile address cannot close the tag');
});
test('.ics LOCATION uses the address, escaped', () => {
  const loc = (r) => icsFor(r, NOW).replace(/\r\n /g, '').split('\r\n').filter((l) => l.startsWith('LOCATION:'));
  assert.deepEqual(loc(row({ address: '12 Main St' })), ['LOCATION:V\\, 12 Main St\\, C']);
  assert.deepEqual(loc(row()), ['LOCATION:V\\, C']);
  const [l] = loc(row({ address: HOST }));
  assert.equal(l, "LOCATION:V\\, <script>x</script>' OR 1=1 --\\; a\\,b\\, C");
});
test('edit.js has the address label, hint and placeholder', () => {
  const js = readFileSync(new URL('../public/js/edit.js', import.meta.url), 'utf8');
  for (const t of ['Street address (optional)', 'Helps maps and Google find the place. Not shown on the site; it goes in the calendar file.', '12 Main St']) assert.ok(js.includes(t), t);
});

test('D63 F5: a C1 control (NEL) in the address is refused like a line break', () => {
  assert.throws(() => validateShow(row({ address: '12 Main\u0085St' })), /Put the address on one line\./);
  assert.throws(() => validateShow(row({ address: '12 Main\u009fSt' })), /Put the address on one line\./);
});
