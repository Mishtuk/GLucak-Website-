import { SITE_URL } from '../components/content.js';

// ponytail: /shop/ is left out: it is switched on per visit by SHOP_ENABLED, not at build. Add it here when the shop opens.
const PAGES = ['/', '/music/', '/shows/', '/videos/', '/about/', '/privacy/'];
const urls = PAGES.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n');

export const GET = () => new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
