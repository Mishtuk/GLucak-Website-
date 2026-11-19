// The Privacy and terms page (built): both documents, numbered sections, the photosensitivity notice, the dates, and no email address in the page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(import.meta.dirname, '../dist');
const html = readFileSync(join(DIST, 'privacy/index.html'), 'utf8');

test('privacy and terms: both parts, Motion notice, date, no email address; footer link text', () => {
  assert.match(html, /<title>Privacy and terms \| GLucak<\/title>/);
  assert.match(html, /<h2 id="privacy">Privacy Policy<\/h2>/);
  assert.match(html, /<h2 id="terms">Terms of Use<\/h2>/);
  assert.match(html, /<h3 id="intro">1\. Introduction<\/h3>/, 'sections are numbered');
  assert.match(html, /<h3 id="liability">10\. Limitation of Liability<\/h3>/);
  assert.match(html, /Effective date: November 18, 2026/);
  const health = html.match(/id="health"[\s\S]*?<h3/)?.[0] ?? '';
  assert.match(health, /photosensitive epilepsy/);
  assert.match(health, /Motion switch in the footer/);
  assert.match(html, /Last updated: November 18, 2026/);
  // the sign-up box's placeholder is the only address allowed
  assert.doesNotMatch(html.replaceAll('placeholder="you@example.com"', ''), /[\w.+-]+@[\w-]+\.[\w.]+/, 'no email address in the page (BOOKING_EMAIL is not set)');
  assert.doesNotMatch(html, /mailto:/);
  assert.match(html, /<a href="\/privacy\/">Privacy and terms<\/a>/);
});
