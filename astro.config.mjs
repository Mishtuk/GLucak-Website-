import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE ?? 'https://glucak.com',
  output: 'static',
  build: { inlineStylesheets: 'always' },
});
