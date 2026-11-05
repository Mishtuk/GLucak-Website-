import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { signup, validEmail, _resetLimits } from '../src/lib/signup.js';

const env = { KIT_API_KEY: 'test-key', KIT_FORM_ID: '311' };
const ctx = (o = {}) => ({ ip: '1.2.3.4', headers: { origin: 'https://glucak.com' }, host: 'glucak.com', env, ...o });
const kit = (codes = [201, 201]) => {
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push({ url, init }); return { ok: codes[calls.length - 1] < 300, status: codes[calls.length - 1] }; };
  return { calls, fetchImpl };
};
beforeEach(() => _resetLimits());

test('valid email goes to Kit: create subscriber, then add to the form, key only in the header', async () => {
  const k = kit();
  const r = await signup({ email: ' fan@example.com ' }, ctx({ fetchImpl: k.fetchImpl }));
  assert.deepEqual(r, { status: 200, body: { ok: true } });
  assert.equal(k.calls[0].url, 'https://api.kit.com/v4/subscribers');
  assert.equal(k.calls[1].url, 'https://api.kit.com/v4/forms/311/subscribers');
  assert.equal(k.calls[1].init.headers['X-Kit-Api-Key'], 'test-key');
  assert.equal(JSON.parse(k.calls[1].init.body).email_address, 'fan@example.com');
});

test('bad emails and injection attempts never reach Kit', async () => {
  for (const [i, email] of ['', 'nope', 'a@b', '<script>alert(1)</script>@x.com', "' OR 1=1 --", 'a@b..com', 'x'.repeat(250) + '@x.com', 'a b@c.com'].entries()) {
    const k = kit();
    const r = await signup({ email }, ctx({ ip: `9.9.9.${i}`, fetchImpl: k.fetchImpl })); // one IP each, so the rate limit doesn't kick in
    assert.equal(r.status, 400, email);
    assert.equal(k.calls.length, 0, email);
  }
  assert.ok(validEmail('name.last+tag@sub.example.org'));
});

test('honeypot: a bot that fills the hidden field gets a fake OK and nothing is sent', async () => {
  const k = kit();
  const r = await signup({ email: 'bot@example.com', website: 'http://spam' }, ctx({ fetchImpl: k.fetchImpl }));
  assert.equal(r.status, 200);
  assert.equal(k.calls.length, 0);
});

test('cross-site posts are refused; same-origin and no-origin are allowed', async () => {
  assert.equal((await signup({ email: 'a@b.co' }, ctx({ headers: { origin: 'https://evil.example' }, fetchImpl: kit().fetchImpl }))).status, 403);
  assert.equal((await signup({ email: 'a@b.co' }, ctx({ headers: {}, fetchImpl: kit().fetchImpl }))).status, 200);
});

test('rate limit: the 6th try in 10 minutes from one IP is refused, another IP is fine', async () => {
  for (let i = 0; i < 5; i++) assert.equal((await signup({ email: 'a@b.co' }, ctx({ fetchImpl: kit().fetchImpl }))).status, 200);
  assert.equal((await signup({ email: 'a@b.co' }, ctx({ fetchImpl: kit().fetchImpl }))).status, 429);
  assert.equal((await signup({ email: 'a@b.co' }, ctx({ ip: '5.6.7.8', fetchImpl: kit().fetchImpl }))).status, 200);
});

test('not set up yet or Kit down -> 503 (the page says try again), never a crash', async () => {
  assert.equal((await signup({ email: 'a@b.co' }, ctx({ env: {} }))).status, 503);
  assert.equal((await signup({ email: 'a@b.co' }, ctx({ env: { KIT_API_KEY: 'k', KIT_FORM_ID: '../x' } }))).status, 503);
  assert.equal((await signup({ email: 'a@b.co' }, ctx({ fetchImpl: kit([500]).fetchImpl }))).status, 503);
  assert.equal((await signup({ email: 'a@b.co' }, ctx({ fetchImpl: async () => { throw new Error('offline'); } }))).status, 503);
});
