// No secrets in tracked files (loop 5; key shapes after gitleaks' rules, our own regexes). Scans every file git tracks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';

const SHAPES = {
  'AWS key id': /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/,
  'GitHub token': /\bgh[pousr]_[A-Za-z0-9]{36,}\b|\bgithub_pat_[A-Za-z0-9_]{60,}\b/,
  'Anthropic / OpenAI key': /\bsk-(?:ant-)?[A-Za-z0-9_-]{32,}\b/,
  'Slack token': /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/,
  'Stripe live key': /\b[rs]k_live_[A-Za-z0-9]{20,}\b/,
  'Google API key': /\bAIza[0-9A-Za-z_-]{35}\b/,
  'private key block': /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  'scrypt editor hash': /\b[a-z0-9_-]{1,32}:(?:s2\.)?[0-9a-f]{32}\.[0-9a-f]{128}\b/, // EDITOR_USERS belongs in the host's env, never the repo
};
const TEXT = /\.(?:m?js|json|astro|md|css|html|ya?ml|txt|svg|ics|env|sh|ps1|toml)$|^\.[a-z]+rc$|^[^.]+$/;

test('no tracked file holds a secret-shaped string', () => {
  const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter((f) => f && TEXT.test(f.split('/').pop()));
  const hits = [];
  for (const f of files) {
    let s; try { if (statSync(f).size > 2e6) continue; s = readFileSync(f, 'utf8'); } catch { continue; }
    for (const [name, re] of Object.entries(SHAPES)) if (re.test(s) && f !== 'test/secrets.test.js') hits.push(`${f}: ${name}`);
  }
  assert.deepEqual(hits, []);
});

test('the shapes catch what they should', () => {
  assert.ok(SHAPES['GitHub token'].test(`ghp_${'a'.repeat(36)}`));
  assert.ok(SHAPES['AWS key id'].test('AKIAABCDEFGHIJKLMNOP'));
  assert.ok(SHAPES['scrypt editor hash'].test(`gabe:s2.${'a'.repeat(32)}.${'b'.repeat(128)}`));
  assert.ok(!SHAPES['GitHub token'].test('ghp_short'));
});
