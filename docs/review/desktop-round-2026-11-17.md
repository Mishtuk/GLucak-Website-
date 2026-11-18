# Desktop round, 2026-11-17 (boss plan; Desktop back after silence since Nov 7)

**Task:** get `npm test` green, give Welcome Home its Pre-save link, close the S round on the Desktop's own files (server.js, src/lib/), then set up a daily build.
**Done when:** `npm test` has 0 failures; Welcome Home's Music tile says Pre-save -> https://wingsmusic.lnk.to/383142-WelcomeHome; S1 and S7 are
closed with HTTP tests; failed sign-ins leave a log line; the shows poster is the first full show; Dependabot is on; a scheduled
GitHub Actions run builds and tests every day (publishing only after the owner says yes).

Inputs: `docs/review/laptop-plan-2026-11-11.md` (Update row 2, Roadmap row 5), `docs/review/security-2026-11-10.md`,
`docs/review/patches/s1-signup-crash.md`, `docs/research/ig-security-reels.md` rows 2-4. Start: `npm test` gives 2 failures, both stale
date tests (Who I Am came out 2026-11-13). The site output itself is correct.

## Claims (read before slice 1)
- The Laptop's **2026-11-10 claim** (HANDOFF "Now working on") was never released, and the Laptop has been silent since its V1 post
  (2026-11-11 23:16Z). So it counts as live. In this round it only touches **`test/ig6.test.js`**, which the Laptop made (IG6). The other
  tests touched here were made by the Desktop (build, shows, server, products) or are new. `src/data/` and `.github/` are not claimed.
- **Step 0 (main session, before any edit):** `git pull --rebase`. Add a HANDOFF claim line: `server.js`, `src/lib/`, `src/data/releases.json`,
  `test/{build,shows,server,products,signup-http}.test.js`, `.github/`, and push it. Then post on the board: "Desktop: back. Round plan in
  docs/review/desktop-round-2026-11-17.md. Asking you to release test/ig6.test.js (lines 87-95: stale Who I Am, Welcome Home now has a
  smart link). Also FYI: the global.css:702 fit (--w-close) was measured with 'Shop.', so it needs a re-measure after slice 6 (your file)."
  Slice 2 waits for a reply. If the Laptop is still silent after one day, the owner decides. Every other slice goes ahead in the meantime.

## Slices (in order; boss reviews each one against its done-when before the next starts)
1. **Make the Who I Am test date-proof**: coder (Sonnet). Files: `test/build.test.js` (125-131) only.
   Done when: the test checks every non-IDENTITY release dated after the build day (New York time, the same TZ as src/lib/shows.js) and finds each
   one as a `data-state="coming"` tile with Pre-save. Released titles are never coming. No title is hard-coded, so the test stays correct after Dec 18 and
   Jan 15. `npm test` shows only the ig6 failure left. OUT: the faked-clock scratch build from nocover.test.js (too heavy for this check);
   other tests.
2. **Welcome Home link -> Pre-save** (after the Laptop releases the file): coder (Sonnet). Files: `src/data/releases.json` line 4, `test/ig6.test.js` 87-95.
   Done when: the link is `https://wingsmusic.lnk.to/383142-WelcomeHome` and the tile reads Pre-save (tileAction already maps lnk.to to Pre-save, so no
   code change). The ig6 test asserts against the data instead of titles: every coming lnk.to tile reads Pre-save. The "no smart link never
   says Pre-save" rule moves to a unit check of `tileAction({ coming: true, link: 'https://open.spotify.com/artist/x' })`, which must return
   'Follow on Spotify'. `npm test` 0 failures. OUT: a cover, Who I Am / Welcome Home copy, the Now line, anything that waits on Gabe.
3. **S1: one POST must not kill the server**: coder. Files: `server.js`, `src/lib/signup.js`, new `test/signup-http.test.js` (all from the patch).
   Note: on this checkout a plain `git apply` **fails** (the .diff is CRLF on disk, server.js is LF). `git apply --check --ignore-whitespace` passes.
   Done when: the patch is applied, `git diff --stat` shows only the patched lines (no whole-file line-ending churn, LF kept), the 3 new HTTP
   tests pass, and `npm test` is green. Tick S1 in HANDOFF + `docs/launch/checklist.md` item 5 stays for launch day. OUT: changing the patch,
   COOP / upgrade-insecure-requests / security.txt (optional, a later round).
4. **S7: the folder redirect never starts with `//`**: coder. Files: `server.js` ~300, `test/server.test.js`.
   Done when: the 301 Location is built as `'/' + url.pathname.replace(/^\/+/, '') + '/' + url.search`. A test shows `/a/..//music`,
   `/shows/..//shows` and `/%2e%2e//about` never produce a Location starting with `//`, and `/music` still answers 301 -> `/music/`. OUT: other routes.
5. **Log failed sign-ins and lockouts**: coder. Files: `server.js` 215 (locked) and 217 (wrong), `test/server.test.js`.
   Done when: each case writes one `console.warn` line with the ISO time, `clientIp(req)` and `JSON.stringify(username)` (already capped at 64,
   so quotes and newlines come out escaped). The password is never logged. A test with a name containing `\n` and `"` shows one escaped line.
   OUT: log files, alerting, a privacy-page change (put it on the launch checklist as a question for the owner instead).
6. **'Shop.' -> 'Shop'** (footer words lost their periods in IG4): helper (Haiku). Files: `src/lib/products.js` 118, `test/products.test.js` 119.
   Done when: the marker renders ` <a href="/shop/">Shop</a>` and `npm test` is green. OUT: global.css:702 `--w-close` (Laptop's file, flagged in step 0).
7. **Poster = first full show, not an open mic**: coder. Files: `src/lib/shows.js` (`upcomingHtml` / `showsHtml` ~75-93), `test/shows.test.js` (~88-93).
   Done when: the poster is the first upcoming `type: 'show'` even when open mics come before it (today Riverside Jan 16 sits behind 16 open
   mics). Home with `limit: 3` = that poster + the next 2 rows by date, and the poster is not repeated as a row. With no full show there is no poster.
   The old assertion at line 93 ("open mic first -> no poster") is rewritten. The XSS rows still pass. OUT: the blank-poster empty state, Directions,
   editor warnings (inner-audit row 2 rest), per-field caps. These are later and the Laptop's styling is involved.
8. **Dependabot**: helper. Files: new `.github/dependabot.yml` only (npm, weekly, plus `github-actions` once slice 9 exists).
   Done when: the file is valid v2 and GitHub shows it under Insights > Dependency graph. Free, public repo. OUT: `npm ci` in `docs/launch/runbook.md`
   11/58: that is a second file, and the host isn't picked yet. It goes in with the host setup. Slice 9 uses `npm ci` now.
9. **Daily build for release-day flips**: coder; advisor (Sonnet) reads it for the token scope. Files: new `.github/workflows/daily.yml`.
   9a (no owner OK needed): cron daily ~09:00 UTC + `workflow_dispatch`, Node 22, `npm ci`, `npm test` (pretest builds), `permissions: contents: read`.
   It publishes nothing. A public repo uses no paid minutes. A red run tells us about stale date tests like today's.
   Done when: one manual run is green.
   9b (**owner OK first**, because it publishes publicly): add `node tools/preview.mjs --publish` after the tests, with `contents: write`, so the
   mishtuk.github.io/GLucak-Website-/ snapshot refreshes itself on release days (Welcome Home Dec 18, Scenic Route Jan 15). The push is a
   fast-forward to gh-pages with the Alex Mishtuk identity (preview.mjs:63) through checkout's persisted token. Done when the owner says yes and the
   next scheduled run updates gh-pages. OUT: a host deploy hook (that comes with the host; the owner decides), Slack/email alerts, caching tweaks.

## Held: waits on Gabe / the owner (not in this round)
- New Spotify bio ("Reforaged" vs Reforged, and the bio no longer says "Epilepsy survivor"): About bio text, the About `epi-head` line and
  `CONTEXT.md` bio stay as they are until the owner has Gabe's answer. Then a copywriter round.
- Anything else from the owner's follow-up email to Gabe. Laptop plan items D81 (compact player) and the tint (owner picks).
- Republishing the preview by hand for Who I Am: routine before, but there's no need now if 9b gets a yes. Ask the owner in the same message.

## Review checks (every slice)
No HTML injection (escaped output, http(s) links only; `<script>` / `' OR 1=1 --` tests stay green). No new motion or flashing. No edits
outside the slice's files. Commits as Alex Mishtuk, no AI line. After each push: HANDOFF line + a board post (hash + one line per commit).
