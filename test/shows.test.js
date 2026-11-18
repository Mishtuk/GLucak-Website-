import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nowHtml, splitShows, showsHtml, validateShow, bookingHref, showId } from '../src/lib/shows.js';

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
  assert.ok(out.includes('‘ OR 1=1 --'));
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

test('28a: items in date order; the first is the lead; a later full show is the paper poster with a small date', () => {
  const now = noon('2026-11-18');
  const out = showsHtml([row({ type: 'open-mic', date: '2026-11-18', venue: 'M1' }), row({ date: '2027-01-16', venue: 'Big' }), row({ type: 'open-mic', date: '2026-11-19', venue: 'M2' })], now);
  const li = out.split('<li ').slice(1);
  assert.equal(li.length, 3);
  assert.ok(li[0].startsWith('class="poster is-plain"') && li[0].includes('ln-date') && !li[0].includes('poster-art') && li[0].includes('M1, C'));
  assert.ok(li[1].startsWith('class="row"') && li[1].includes('M2, C'));
  assert.ok(li[2].startsWith('class="poster"') && li[2].includes('date-sm') && !li[2].includes('ln-date') && li[2].includes('<strong class="flag">Full show</strong>') && li[2].includes('poster-art'));
});

test('28a: a full show first is the lead card (no is-plain) and prints no Next full show line', () => {
  const now = noon('2026-11-18');
  const out = showsHtml([row({ date: '2026-11-18', venue: 'Big' }), row({ type: 'open-mic', date: '2026-11-19' })], now, { past: true });
  assert.match(out, /<li class="poster" id="s-[^"]*"><picture>/);
  assert.ok(out.includes('ln-date') && !out.includes('is-plain') && !out.includes('next-full'));
  assert.ok(out.includes('<strong class="flag">Full show</strong>'));
});

test('28a: Next full show line on /shows/ and Home foot row; none without a later full show; ids on upcoming only', () => {
  const now = noon('2026-11-18');
  const mic = row({ type: 'open-mic', date: '2026-11-18', venue: 'M1' });
  const big = row({ date: '2027-01-16', venue: '<script>x</script>' });
  const page = showsHtml([mic, big], now, { past: true });
  assert.ok(page.includes(`class="next-full"><a class="text-link" href="#s-${showId(big)}">Next full show: Jan 16, &lt;script&gt;x&lt;/script&gt;</a>`) && !page.includes('<script>x'));
  const home = showsHtml([mic, big], now, { limit: 3, allLink: '/shows/' });
  assert.ok(home.includes('class="shows-foot"') && home.includes('>All shows<') && home.includes(`href="/shows/#s-${showId(big)}">Next full show: Jan 16<`));
  const none = showsHtml([mic, row({ type: 'open-mic', date: '2026-11-20' })], now, { limit: 3, allLink: '/shows/' });
  assert.ok(!none.includes('shows-foot') && !none.includes('next-full') && none.includes('>All shows<'));
  const withPast = showsHtml([mic, row({ date: '2026-10-01', venue: 'Old' })], now, { past: true });
  const [up, played] = withPast.split('<div class="played">');
  assert.equal((up.match(/ id="s-/g) || []).length, 1);
  assert.ok(!played.includes(' id="s-'));
});

test('28b: Played shows the last 3, the rest fold under All played (n)', () => {
  const now = noon('2026-11-18');
  const past = (n) => Array.from({ length: n }, (_, i) => row({ type: 'open-mic', date: `2026-10-${String(i + 1).padStart(2, '0')}`, venue: `P${i}` }));
  const out = showsHtml([row({ date: '2026-12-01' }), ...past(8)], now, { past: true });
  const [before, after] = out.split('<details class="played-more">');
  assert.equal((before.split('<div class="played">')[1].match(/<li class="row"/g) || []).length, 3);
  assert.ok(after.includes('<summary>All played (8)</summary>') && (after.match(/<li class="row"/g) || []).length === 5);
  assert.ok(!showsHtml([row({ date: '2026-12-01' }), ...past(3)], now, { past: true }).includes('<details'));
  assert.ok(!showsHtml([row({ date: '2026-12-01' })], now, { past: true }).includes('Played'));
});

test('28c: every upcoming item has one hidden share button for its id; Played has none; hostile values escaped', () => {
  const now = noon('2026-11-18');
  const evil = '"><img src=x onerror=alert(1)>';
  const rows = [row({ type: 'open-mic', date: '2026-11-18', venue: evil }), row({ date: '2027-01-16', venue: "' OR 1=1 --" }), row({ type: 'open-mic', date: '2026-11-20' }), row({ date: '2026-10-01' })];
  const out = showsHtml(rows, now, { past: true });
  const [up, played] = out.split('<div class="played">');
  for (const r of rows.slice(0, 3)) assert.equal(up.split(`data-share="/shows/#s-${showId(r)}"`).length - 1, 1);
  assert.equal((up.match(/<button class="share-[a-z]+" type="button" hidden data-share=/g) || []).length, 3);
  assert.ok(!played.includes('data-share') && !played.includes('share-'));
  assert.ok(!up.includes('<img src=x') && up.includes('data-title="GLucak open mic at “&gt;&lt;img src=x onerror=alert(1)&gt;"') && up.includes('data-text="Open mic Nov 18') && up.includes('aria-label="Share: “&gt;&lt;img'));
});

test('28c: share button is hidden until JS enables it and has an aria-label', () => {
  const out = showsHtml([row({ date: '2027-01-16' })], noon('2026-11-18'), {});
  const btns = out.match(/<button class="share-[a-z]+"[^>]*>/g) || [];
  assert.ok(btns.length >= 1);
  for (const b of btns) assert.ok(/ hidden /.test(b) && /aria-label="Share: /.test(b));
});

test('28c: app.js share block: textContent only, no motion, URL built from location.origin', () => {
  const js = readFileSync(new URL('../public/js/app.js', import.meta.url), 'utf8');
  const blk = js.slice(js.indexOf('Share a show (DESIGN 28c'), js.indexOf('Swipe row'));
  assert.ok(blk.length > 200 && blk.includes('textContent') && blk.includes('new URL(b.dataset.share, location.origin)'));
  assert.ok(!/innerHTML|insertAdjacentHTML|outerHTML|transition|animate/.test(blk));
});

test('28d: cost renders last in the meta line, escaped; a newline or 41 characters is refused; Riverside says Free; bookingHref', () => {
  const now = noon('2026-11-18');
  const evil = showsHtml([row({ date: '2026-11-20', time: '18:00', cost: "<script>x</script>' OR 1=1 --" })], now);
  assert.ok(!evil.includes('<script>x') && evil.includes('6:00 PM, &lt;script&gt;x&lt;/script&gt;’ OR 1=1 --</p>'));
  assert.throws(() => validateShow(row({ cost: 'a\nb' })), /Put the cost on one line/);
  assert.throws(() => validateShow(row({ cost: 'x'.repeat(41) })), /too long/);
  validateShow(row({ cost: 'x'.repeat(40) }));
  const riv = JSON.parse(readFileSync(new URL('../src/data/shows.json', import.meta.url), 'utf8')).find((r) => r.venue === 'Riverside');
  assert.ok(showsHtml([riv], noon('2026-12-01')).includes('6:00 PM, Free'));
  const saved = checkShows([row({ cost: '  Free  ' }), row({ cost: '' })]);
  assert.equal(saved.rows[0].cost, 'Free'); assert.ok(!('cost' in saved.rows[1]));
  assert.match(checkShows([row({ cost: 'a\nb' })]).errors[0].message, /Put the cost on one line/);
  assert.equal(bookingHref(), 'https://www.instagram.com/glucakofficial/');
  assert.equal(bookingHref('a@b.co'), 'mailto:a@b.co?subject=Booking%3A%20%5Bdate%20%2F%20venue%5D');
});

test('empty state: never blank, Played rows if any, Request a show goes to Instagram while no booking email', () => {
  const now = noon('2026-12-31');
  const none = showsHtml([], now);
  assert.ok(none.includes('No shows booked right now') && none.includes('>Follow<') && !none.includes('Played'));
  assert.ok(none.includes('>Request a show<') && none.includes('href="https://www.instagram.com/glucakofficial/"') && !none.includes('btn-solid'));
  assert.ok(showsHtml([row({ venue: 'Old' })], now, { past: true }).includes('Played'));
});

const WIA = { title: 'Who I Am', date: '2026-11-13', link: 'https://wingsmusic.lnk.to/WhoIAm' };
const GO = { title: 'Go', date: '2026-03-20', link: 'https://wingsmusic.lnk.to/370407-Go' };
const stub = (href, when, place, sub, rel = ' rel="noopener"') => `<a class="stub" href="${href}"${rel}><span class="stub-when">${when}</span> <span class="stub-what"><span class="stub-place">${place}</span>${sub ? ` <span class="stub-sub">${sub}</span>` : ''}</span></a>`;
const OUT13 = stub(WIA.link, 'Out Nov 13', 'Who I Am');

test('Now line D45: Nov 6 / 13 / 20 / 21 pick Out Nov 13, Out today, Out now, then a show or the newest release', () => {
  const rels = [GO, WIA];
  assert.equal(nowHtml([], noon('2026-11-06'), rels), OUT13);
  assert.equal(nowHtml([], noon('2026-10-30'), rels), OUT13, '14 days ahead');
  assert.ok(!nowHtml([], noon('2026-10-29'), rels).includes('Out Nov 13'), '15 days ahead: not yet');
  assert.equal(nowHtml([], noon('2026-11-13'), rels), stub(WIA.link, 'Out today', 'Who I Am'));
  assert.equal(nowHtml([], noon('2026-11-20'), rels), stub(WIA.link, 'Out now', 'Who I Am'));
  const show = row({ date: '2026-11-28', venue: 'The Rail', city: 'Doylestown' });
  assert.equal(nowHtml([show], noon('2026-11-21'), rels), stub('#shows', 'Nov 28', 'The Rail', 'Show, Doylestown', ''));
  assert.equal(nowHtml([], noon('2026-11-21'), rels), stub(WIA.link, 'Out now', 'Who I Am'), 'newest release');
  assert.equal(nowHtml([row({ date: '2026-12-21' })], noon('2026-11-21'), [GO]), stub(GO.link, 'Out now', 'Go'), 'show too far: newest');
  assert.equal(nowHtml([], noon('2026-11-21'), []), '', 'nothing at all');
});

test('Now line D45: a show on the day says Today; a coming release beats a show; day 14 counts, 15 does not', () => {
  assert.equal(nowHtml([row({ date: '2026-12-01', venue: 'Pub', city: 'Philly' })], noon('2026-12-01'), []), stub('#shows', 'Today', 'Pub', 'Show, Philly', ''));
  assert.equal(nowHtml([row({ date: '2026-11-08' })], noon('2026-11-06'), [GO, WIA]), OUT13);
  assert.ok(nowHtml([row({ date: '2026-12-15' })], noon('2026-12-01'), []).includes('#shows'));
  assert.equal(nowHtml([row({ date: '2026-12-16' })], noon('2026-12-01'), []), '');
  assert.equal(nowHtml([row({ date: '2026-11-20' })], noon('2026-12-01'), []), ''); // past
  assert.ok(!nowHtml([], noon('2026-11-06'), [WIA]).includes('Pre-save'));
});

test('Now line D45: everything escaped, release links http(s) only', () => {
  const bad = nowHtml([row({ date: '2026-12-04', venue: '<script>x</script>', city: "' OR 1=1 --" })], noon('2026-12-01'), []);
  assert.ok(!bad.includes('<script>') && bad.includes('&lt;script&gt;') && bad.includes('‘ OR 1=1 --'));
  const rel = nowHtml([], noon('2026-11-06'), [{ ...WIA, title: '<img src=x onerror=1>"', link: 'https://x.example/?a="b"&c=<' }]);
  assert.ok(!rel.includes('<img') && rel.includes('&lt;img') && !rel.includes('"b"'));
  assert.equal(nowHtml([], noon('2026-11-06'), [{ ...WIA, link: 'javascript:alert(1)' }]), '');
});

test('poster art: only the poster li has it, rows never', async () => {
  
  const mk = (d, venue) => ({ date: d, type: 'show', venue, city: 'X' });
  const out = showsHtml([mk('2030-01-01', 'A'), mk('2030-01-02', 'B'), mk('2030-01-03', 'C')], new Date('2029-12-01T12:00:00Z'));
  assert.equal(out.split('poster-art').length - 1, 1, 'DESIGN 29d: art on the first full show only');
  assert.match(out, /<li class="poster" id="s-[^"]*"><picture><img class="poster-art graded"/);
  assert.ok(!/<li class="row"[^>]*>[^]*?poster-art[^]*?<\/li>/.test(showsHtml([mk('2030-01-01', 'A'), { ...mk('2030-01-02', 'B'), type: 'open-mic' }], new Date('2029-12-01T12:00:00Z')).replace(/<li class="poster"[^>]*>[^]*?<\/li>/, '')));
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

// ---------- DR1 27b: Today / Tomorrow ----------
test('27b rows and poster: Today / Tomorrow lead the line; other days and Played rows get nothing', () => {
  const now = noon('2026-11-17');
  const out = (r) => showsHtml([r], now);
  assert.ok(showsHtml([row({ date: '2026-11-17', type: 'show' }), row({ date: '2026-11-17', type: 'open-mic', time: '19:00' })], now).includes('<span class="row-kind"><strong class="row-soon">Today</strong>, Open mic, 7:00 PM</span>'));
  assert.ok(out(row({ date: '2026-11-18', type: 'open-mic', time: '18:00' })).includes('<strong class="row-soon">Tomorrow</strong>, Open mic, 6:00 PM'));
  assert.ok(!out(row({ date: '2026-11-19' })).includes('row-soon'));
  const played = showsHtml([row({ date: '2026-11-16' })], now, { past: true });
  assert.ok(!played.includes('row-soon'));
  assert.ok(out(row({ date: '2026-11-17', time: '18:00' })).includes('<p class="poster-meta"><strong class="row-soon">Today</strong>, <strong class="flag">Full show</strong>, 6:00 PM</p>'));
  assert.ok(out(row({ date: '2026-11-17' })).includes('<p class="poster-meta"><strong class="row-soon">Today</strong>, <strong class="flag">Full show</strong></p>'));
  // New York day: 03:30Z on Nov 18 is still Nov 17 there
  assert.ok(showsHtml([row({ date: '2026-11-17', type: 'open-mic' })], new Date('2026-11-18T03:30:00Z')).includes('row-soon">Today<'));
});

test('27b Now line T: a show or open mic today / tomorrow beats releases A and C, not B', () => {
  const mic = (date) => row({ date, type: 'open-mic', venue: 'M.O.M’s', city: 'Doylestown, PA' });
  const c = { ...WIA, date: '2026-11-13' }; // 4 days old on the 17th: C
  const t = nowHtml([mic('2026-11-17')], noon('2026-11-17'), [c]);
  assert.equal(t, stub('#shows', 'Today', 'M.O.M’s', 'Open mic, Doylestown, PA', ''));
  assert.ok(t.includes('href="#shows"'));
  assert.equal(nowHtml([mic('2026-11-18')], noon('2026-11-17'), [c]), stub('#shows', 'Tomorrow', 'M.O.M’s', 'Open mic, Doylestown, PA', ''));
  assert.ok(nowHtml([mic('2026-11-17')], noon('2026-11-13'), [c]).includes('>Out today<') && nowHtml([mic('2026-11-17')], noon('2026-11-13'), [c]).includes('>Who I Am<'), 'B still wins');
  assert.ok(nowHtml([mic('2026-11-20')], noon('2026-11-17'), [c]).includes('>Out now<'), 'three days out: C as before');
});

test('28f: the Now line is one ticket stub link; type words under the title; escaped; no Pre-save', () => {
  const t = nowHtml([], noon('2026-11-06'), [{ ...WIA, type: 'remix', title: '<img src=x onerror=1>' }]);
  assert.equal((t.match(/<a /g) || []).length, 1);
  assert.ok(t.startsWith('<a class="stub" ') && t.includes('<span class="stub-when">Out Nov 13</span>') && t.includes('<span class="stub-sub">Remix album</span>') && !t.includes('<img') && !t.includes('Pre-save'));
  assert.ok(nowHtml([], noon('2026-11-06'), [{ ...WIA, type: 'single' }]).includes('stub-sub">Single<'));
  const s = nowHtml([row({ date: '2026-12-04', time: '19:00', type: 'open-mic', venue: '<script>x</script>', city: "' OR 1=1 --" })], noon('2026-12-01'), []);
  assert.ok(s.includes('Open mic, 7:00 PM, ‘ OR 1=1 --') && !s.includes('<script>') && s.includes('stub-when">Dec 4<'));
});
