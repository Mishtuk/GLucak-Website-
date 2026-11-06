import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { externalize } from './src/lib/ext.js';

// D64: after the build, external links in every page get target=_blank + the screen-reader hint.
const newTabLinks = { name: 'new-tab-links', hooks: { 'astro:build:done': ({ dir }) => {
  const walk = (d) => readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const f = join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (e.name.endsWith('.html')) writeFileSync(f, externalize(readFileSync(f, 'utf8')));
  });
  walk(fileURLToPath(dir));
} } };

export default defineConfig({
  site: process.env.SITE ?? 'https://glucak.com',
  output: 'static',
  build: { inlineStylesheets: 'always' },
  integrations: [newTabLinks],
});
