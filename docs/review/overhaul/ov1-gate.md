# OV1 gate (boss, 2026-11-18)

**APPROVED** after two tiny fixes (commit "OV1 gate fixes"). Commits gated: 3bc283f, 4de5419, fd89357, 6ae3fc8, 43c6125, 4075e60.

- **Scope:** OV1a/OV1b done-when met. Built Home: new title + og:url, og:site_name, og:image:alt, twitter:image:alt; `dist/v2/` gone; theme=0; Menu focus; ETag test in `test/server.test.js:132`. Nothing outside the file lists. fd89357 alone has a quoting syntax error, fixed by 6ae3fc8: push both together, never split.
- **Security:** ETag/304 sits after the DIST prefix check (no traversal); tag is size+mtime only (standard, no path/content leak); If-None-Match is split/trimmed and exact-compared, no regex, no throw; 304 sends no body, so HEAD is fine. Deploy job: hook only in `env`, `curl -fsS` prints no URL, inert without the secret, `needs: daily` so it runs after `npm test` and the preview publish. Boot warnings are fixed strings, no env values.
- **Deletions (3bc283f):** 367 files; every deleted basename grepped across HEAD; only hits are history notes in DECISIONS/DESIGN/plan/technical.md. No src/test/public import of v2.css or pages/v2.
- **Date bombs:** full suite with Date faked (preload, as in nocover.test.js) at 2026-12-18, 2026-12-19 and 2027-01-16 (noon NY): 246/246 each. `round2.test.js:74` follows the clock; `gabe-answers.test.js` only pins the Dec 18 date in releases.json, no clock. No fix needed.
- **npm audit:** 10 high, all in the astro -> vite / picomatch / tinyglobby / unstorage chain (build and dev server only). server.js imports only node: built-ins, its own files and sharp (not flagged). **Accept.** `--omit=dev` still lists them only because astro sits in `dependencies`.
- **Keep astro in dependencies.** The runbook sets `NODE_ENV=production` on Render; `npm install` / `npm ci` then skip devDependencies and `npm run build` would fail on the host. Moving it would need `--include=dev` in the build command for no runtime gain.

Gate fixes made:
1. `tools/preview.mjs:14`: dropped `'/v2/'` from PAGES (page deleted; the daily publish only logged "skip").
2. `docs/launch/runbook.md` steps 9-10: the old hand-written rebuild workflow block is replaced by a pointer to 6b / the `deploy` job, so the owner does not add a second daily deploy.

Not blocking (later): 304 omits `Vary: Accept-Encoding` (RFC nicety; no shared cache in front); deploy also waits on the gh-pages publish step; no test pins the new Home title/tags (add to `test/rules.test.js` in R6).
