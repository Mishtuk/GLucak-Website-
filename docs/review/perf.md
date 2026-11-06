# Performance pass (2026-11-05)

Lighthouse is not installed, so `node tools/perf.mjs` measures with the Chrome DevTools Protocol: server.js on localhost,
390px mobile viewport (DPR 2), cold cache, no throttling, Spotify/YouTube iframes excluded. Run `npm run build` first.
Localhost has no network latency, so the LCP times show order of magnitude only; the byte counts are the real numbers.

| Page | Transfer KB (html / js / fonts / img) | After full scroll | LCP element | LCP ms | CLS |
|---|---|---|---|---|---|
| / | 141 (9 / 3 / 48 / 80) | 140 | hero photo a-era-grade-phone-800.webp | 268 | 0 |
| /music/ | 141 (9 / 3 / 48 / 80) | 146 | text (.player-note) | 40 | 0 |
| /shows/ | 80 (8 / 3 / 48 / 21) | 80 | text (.ln-live) | 36 | 0 |
| /about/ | 100 (8 / 3 / 48 / 40) | 100 | d-crowd-phone-800.webp | 48 | 0 |
| /shop/ | 125 (8 / 3 / 48 / 65) | 131 | sample-tee.webp | 44 | 0 |

CSS is inlined in the HTML (build.inlineStylesheets: always), so it counts under html.

## Findings

- Every image already has width and height; none are missing. Hero images are `fetchpriority=high`, everything below the
  fold is `loading=lazy`, and `srcset`/`sizes` serve 800w phone files. Nothing to fix.
- CLS is 0 on all pages. Both fonts are `font-display: swap` and loaded; only two font files, one weight of the display
  face (900) and the variable Atkinson (200-800), both in use. No unused weights.
- Largest cost is the two fonts (48 KB, same on every page) and the hero photo (home, ~80 KB).

## Change made

- Base.astro now also preloads `atkinson-hyperlegible-next-wght.woff2` (the display font was already preloaded). On a real
  network the body text no longer waits for CSS parse to start the font fetch. Localhost numbers are unchanged
  (before and after: same transfer, same CLS); the gain only shows with latency.

Not done on purpose: preloading the hero image (already discovered in HTML with high priority), metric-override
fallback fonts (CLS is already 0).
