# DR1 boss gate (DESIGN 27, D96), 2026-11-17

**Verdict: APPROVED.** Review PASS WITH FIXES 31/40 (was 29), hard rules pass, fixes in 380906c; `npm test` 245/245.

1. **Security, 24ef212.** `public/speculation-rules.json` matches DESIGN 27a byte for byte: `/*` only (same origin, resolves
   against the JSON's URL, so no off-site URL), with `/edit/*`, `/api/*`, `/*.ics` and `[target=_blank], [download], [rel~=nofollow]`
   excluded in both prefetch and prerender. The only state-changing routes are POST (`/api/signup`, `/edit/login`, `/edit/logout`,
   `/edit/api/*` saves / upload); every GET with a side effect or a log line (`/edit/api/backup`) is under `/edit/*`. Page JS on
   load only reads `localStorage('motion')`; sign-up fetches on submit only, so a prerender cannot count or log anything.
   Header sent only via the two HTML `send` calls, skipped for `/edit/` pages (server.js 325); JSON, redirects, `.ics` and
   uploads never carry it. `/speculation-rules.json` served as `application/speculationrules+json` (server.js 319). CSP line
   untouched in the diff. Note, accepted: a 404 under `/edit/...` carries the header (server.js 104); harmless, the rules
   still exclude `/edit/*` and that page is the public 404, not the editor.
2. **b4575db.** Today / Tomorrow uses `etDay(now)` (New York) from `showsHtml`, same as the Now line; Played rows never get it.
   Boundary test `2026-11-18T03:30:00Z` -> "Today" on Nov 17 (test/shows.test.js 207). D45 amendment logged in D96 (b).
3. **Scope.** Outside DESIGN 27's lists: a25b658 (RESOURCES.md + one line each in CONTEXT, boss/designer/researcher agents),
   the owner's 2026-11-17 instruction, docs only: accepted. 27d also curled a few code comments in server.js: harmless, accepted.
   Everything else is in 27a-f's named files, test text updates, or the review fix.
4. D96 header set to "Approved by the boss 2026-11-17". Ready to push.
