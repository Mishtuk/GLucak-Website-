// Editor sign-in: session cookie, password hashes, rate limit, lockout, Origin check.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allow, checkLogin, cookieHeader, hashPassword, locked, parseEditors, passwordProblem, readCookie, recordFailure, clearFailures,
  sameOrigin, signSession, verifyPassword, verifySession, COOKIE, LOCK } from '../src/lib/auth.js';

const SECRET = 'x'.repeat(40);
const NOW = Date.parse('2026-11-05T15:00:00Z');
const GABE = hashPassword('a long test password');
const USERS = new Map([['gabe', GABE], ['alex', hashPassword('another long password')]]);

test('session cookie: valid, expired, wrong secret, tampered, removed editor, new password', () => {
  const v = signSession('gabe', NOW + 7 * 864e5, SECRET, GABE);
  assert.equal(verifySession(v, SECRET, USERS, NOW), 'gabe');
  assert.equal(verifySession(v, SECRET, USERS, NOW + 8 * 864e5), null, 'expired');
  assert.equal(verifySession(v, 'y'.repeat(40), USERS, NOW), null, 'other secret');
  assert.equal(verifySession(v, null, USERS, NOW), null, 'no secret');
  const [data, sig] = v.split('.');
  const ver = Buffer.from(data, 'base64url').toString().split('.').pop();
  const forge = (s) => `${Buffer.from(s).toString('base64url')}.${sig}`;
  assert.equal(verifySession(forge(`gabe.${NOW + 365 * 864e5}.${ver}`), SECRET, USERS, NOW), null, 'cannot extend expiry');
  assert.equal(verifySession(forge(`alex.${NOW + 864e5}.${ver}`), SECRET, USERS, NOW), null, 'cannot swap the name');
  assert.equal(verifySession(v, SECRET, new Map([['alex', USERS.get('alex')]]), NOW), null, 'removed from EDITOR_USERS');
  assert.equal(verifySession(v, SECRET, new Map([['gabe', hashPassword('a brand new password')]]), NOW), null, 'new password ends old sessions');
  for (const junk of [undefined, '', 'abc', 'a.b.c', '.', `${v}x`, `${data}.`]) assert.equal(verifySession(junk, SECRET, USERS, NOW), null, String(junk));
});

test('cookie header: HttpOnly, SameSite=Strict, Path=/edit, Secure on https', () => {
  assert.match(cookieHeader('abc.def', { secure: true }), /^gl_edit=abc\.def; Path=\/edit; HttpOnly; SameSite=Strict; Max-Age=604800; Secure$/);
  assert.doesNotMatch(cookieHeader('x', { secure: false }), /Secure/);
  assert.match(cookieHeader('', { secure: true, maxAge: 0 }), /Max-Age=0/);
  assert.equal(readCookie(`a=1; ${COOKIE}=abc.def; b=2`), 'abc.def');
  assert.equal(readCookie('a=1'), null);
  assert.equal(readCookie(undefined), null);
});

test('passwords: scrypt, salted, wrong password and unknown name fail', () => {
  const a = hashPassword('correct horse battery'), b = hashPassword('correct horse battery');
  assert.notEqual(a, b, 'same password, different salt');
  assert.match(a, /^[0-9a-f]{32}\.[0-9a-f]{128}$/);
  assert.ok(verifyPassword('correct horse battery', a));
  assert.ok(!verifyPassword('correct horse batterY', a));
  assert.ok(!verifyPassword('x', 'garbage'));
  assert.equal(checkLogin(USERS, ' Gabe ', 'a long test password'), 'gabe', 'name is trimmed and not case-sensitive');
  assert.equal(checkLogin(USERS, 'gabe', 'wrong password'), null);
  assert.equal(checkLogin(USERS, 'nobody', 'a long test password'), null);
  assert.equal(checkLogin(USERS, 'gabe', undefined), null);
  assert.ok(passwordProblem('short') && !passwordProblem('twelve chars'));
});

test('EDITOR_USERS parsing skips bad entries', () => {
  const warned = [];
  const m = parseEditors(`gabe:${GABE}, Alex:${GABE} ,bad,:${GABE},eve:nothash,<script>:${GABE}`, (w) => warned.push(w));
  assert.deepEqual([...m.keys()], ['gabe', 'alex']);
  assert.equal(warned.length, 4);
  assert.ok(!warned.join().includes(GABE), 'hashes never logged');
  assert.equal(parseEditors(undefined).size, 0);
});

test('rate limit: max tries per window', () => {
  const key = `ip:test-${Math.random()}`;
  for (let i = 0; i < 10; i++) assert.ok(allow(key, 10, 15 * 60e3, NOW + i));
  assert.ok(!allow(key, 10, 15 * 60e3, NOW + 20), 'eleventh try refused');
  assert.ok(allow(key, 10, 15 * 60e3, NOW + 15 * 60e3 + 20), 'works again after 15 minutes');
});

test('lockout: 5 failures lock a name for 15 minutes', () => {
  const key = `user:test-${Math.random()}`;
  for (let i = 0; i < LOCK.max - 1; i++) recordFailure(key, NOW + i);
  assert.ok(!locked(key, NOW + 10));
  recordFailure(key, NOW + 20);
  assert.ok(locked(key, NOW + 21));
  assert.ok(!locked(key, NOW + 21 + LOCK.ms), 'unlocked after 15 minutes');
  clearFailures(key);
});

test('same-origin: Origin must be present and match the host', () => {
  assert.ok(sameOrigin({ origin: 'https://glucak.com', host: 'glucak.com' }));
  assert.ok(sameOrigin({ origin: 'http://localhost:8080', host: 'localhost:8080' }));
  assert.ok(!sameOrigin({ origin: 'https://evil.example', host: 'glucak.com' }));
  assert.ok(!sameOrigin({ origin: 'https://glucak.com.evil.example', host: 'glucak.com' }));
  assert.ok(!sameOrigin({ origin: 'null', host: 'glucak.com' }));
  assert.ok(!sameOrigin({ host: 'glucak.com' }), 'missing Origin is refused');
});
