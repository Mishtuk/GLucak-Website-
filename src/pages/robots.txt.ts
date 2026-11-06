import { SITE_URL } from '../components/content.js';

export const GET = () => new Response(`User-agent: *
Allow: /
Disallow: /edit/

Sitemap: ${SITE_URL}/sitemap.xml
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
