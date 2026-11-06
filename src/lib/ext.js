// D64: links to another site open in a new tab, with a screen-reader hint. Applied to the built pages (astro.config.mjs)
// and to every page the server serves (server.js, which fills in the shows/shop links). Idempotent. Same-site links untouched.
const HINT = ' (opens in a new tab)';
const SELF = new Set(['glucak.com', 'www.glucak.com']);
const host = (u) => { try { return new URL(u.replaceAll('&amp;', '&')).host; } catch { return ''; } };

export function externalize(html) {
  return html.replace(/<a\b([^>]*?)\shref="(https?:\/\/[^"]*)"([^>]*)>([\s\S]*?)<\/a>/g, (all, pre, href, post, inner) => {
    if (SELF.has(host(href)) || /\btarget=/.test(pre + post)) return all;
    let attrs = `${pre} href="${href}"${post}`;
    attrs = /\brel="/.test(attrs) ? attrs.replace(/\brel="([^"]*)"/, (m, v) => (/\bnoopener\b/.test(v) ? m : `rel="${v} noopener"`)) : `${attrs} rel="noopener"`;
    attrs = attrs.replace(/\baria-label="([^"]*)"/, (m, v) => `aria-label="${v}${HINT}"`);
    return `<a${attrs} target="_blank">${inner}<span class="vh">${HINT}</span></a>`;
  });
}
