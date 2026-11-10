import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

// Runs public/js/app.js against a tiny fake DOM and drives the sign-up form (no browser needed; no dist/ needed).
const SRC = readFileSync(join(import.meta.dirname, '../public/js/app.js'), 'utf8');

function setup(fetchImpl, valid = true) {
  const handlers = {};
  const el = () => ({ textContent: '', attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, removeAttribute(k) { delete this.attrs[k]; }, addEventListener() {}, dataset: {} });
  const status = el(), join = el(), motion = el();
  const email = Object.assign(el(), { value: 'fan@example.com', addEventListener(t, f) { handlers[`email:${t}`] = f; } });
  const form = Object.assign(el(), {
    action: '/api/signup', elements: { email, website: { value: '' } },
    addEventListener(t, f) { handlers[t] = f; }, checkValidity: () => valid, reset() { email.value = ''; },
    querySelector: (s) => (s === 'button[type="submit"]' ? join : null),
  });
  const nodes = { '#signup': form, '#signup-status': status, '#motion': motion };
  const doc = { documentElement: { dataset: { motion: 'off' } }, querySelector: (s) => nodes[s] ?? null, querySelectorAll: () => [] };
  const mq = { matches: false, addEventListener() {} };
  vm.runInNewContext(SRC, { document: doc, matchMedia: () => mq, localStorage: { getItem: () => null, setItem() {} }, innerHeight: 800, addEventListener() {}, IntersectionObserver: class { observe() {} unobserve() {} }, fetch: fetchImpl, URLSearchParams });
  const submit = () => handlers.submit({ preventDefault() {} });
  return { status, join, submit };
}

test('sign-up: a valid submit shows Sending..., sets aria-disabled on Join, and a second submit sends nothing', async () => {
  let calls = 0, release;
  const gate = new Promise((r) => { release = r; });
  const { status, join, submit } = setup(async () => { calls++; await gate; return { ok: false, status: 503 }; });
  const first = submit();
  const second = submit(); // double tap while the first is in flight
  assert.equal(status.textContent, 'Sending…');
  assert.equal(join.attrs['aria-disabled'], 'true');
  await second;
  assert.equal(calls, 1);
  release();
  await first;
  assert.equal(status.textContent, "That didn't go through. Try again.");
  assert.equal(join.attrs['aria-disabled'], undefined);
});

test('sign-up: the three existing messages still come back, and Join is released each time', async () => {
  for (const [res, text] of [[{ ok: true, status: 200 }, "You're on the list."], [{ ok: false, status: 422 }, 'Enter an email like name@example.com.'], [{ ok: false, status: 503 }, "That didn't go through. Try again."]]) {
    const { status, join, submit } = setup(async () => res);
    await submit();
    assert.equal(status.textContent, text);
    assert.equal(join.attrs['aria-disabled'], undefined);
  }
  const { status, join, submit } = setup(async () => { throw new Error('offline'); });
  await submit();
  assert.equal(status.textContent, "That didn't go through. Try again.");
  assert.equal(join.attrs['aria-disabled'], undefined);
});

test('sign-up: an invalid email never sends, never shows Sending..., never disables Join', async () => {
  let calls = 0;
  const { status, join, submit } = setup(async () => { calls++; return { ok: true }; }, false);
  await submit();
  assert.equal(calls, 0);
  assert.equal(status.textContent, 'Enter an email like name@example.com.');
  assert.equal(join.attrs['aria-disabled'], undefined);
});
