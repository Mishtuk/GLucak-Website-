# Admin self-sufficiency plan (Laptop boss, 2026-11-23)

Inputs: `docs/research/admin-panel-research-2026-11-23.md` (gap ids P0-1..P2-7), shots `before/edit-<390|1280>-<0..4>.png`,
Mulligan-Games-B `docs/admin/design.md` (Today home, Undo, drafts), kit `patterns/event-admin.md` (soft delete), DESIGN 10 + 15.
Rules: kit pairing (advisor with every boss <-> coder/designer exchange, mediator between coder and designer), D119-D125.

## 1. Task
**Task:** Gabe can keep his own site current from his phone (shows, releases, IDENTITY, bio, products, videos) and undo his own
mistakes without messaging us. **Done when:** A1-A3 pass their done-whens, the Gabe test (section 4) passes on a fresh run
by an agent that has only `docs/guide/gabe-guide.md`, `npm test` is green, and the owner has the proposal.

Facts that shaped it: the server already rotates and re-encodes uploads (`src/lib/upload.js`, 1200px WebP), so P0-2 is only the
5 MB cap. `saveList` already keeps one `.prev.json`; history extends that. Videos are NOT automatic: `src/data/videos.json` is
hand-fed at build time and each video has a designed sleeve (tools/film, yt-dlp). CONTEXT "Practical" lists videos among Gabe's
own small changes, and hard rule 3 says latest videos update themselves; today neither is true. The live-marker pattern
(`<!--gl:crate-->`, releases.js) is the way to make them live without a rebuild.

## 2. Rounds (each: designer spec covers it -> coder -> shots -> boss review -> at most 2 fix loops -> gate)
Every round's done-when also has: `npm test` green; shots at 390 and 1280, reduced motion, of every tab; no h-scroll at
320/390/768/1280/1600; 48px targets; data only via `textContent`; `<script>`, `' OR 1=1 --` and `javascript:` tests for every
new field; no new dependency; CSP stays self (no inline script); copy in Gabe's words (no "JSON", "server", "version", "409").

### A1 "No-fear basics" (client side only; smallest useful slice)
- **Scope:** shell at 390: tabs laid out for 6 (Videos comes in A3; 3+3 or one scrolling row, designer's call), "View site" link in
  the header, row subtitles wrap so the year and type never truncate. P1-1 Today card (next show, IDENTITY / next release
  status, 3 quick buttons: Add show, Fix a release, Add a video (disabled until A3, or hidden)). P0-3 Undo bar, `confirm()` gone
  for rows. P0-2 browser resize (createImageBitmap, long edge 2000, JPEG/WebP under 5 MB) before upload; server cap and
  re-encode stay. P1-5 empty states, P1-7 sign-out guard names the tabs, P1-8 "Saved at 4:12" by the See it link.
- **Files:** `src/pages/edit/index.astro`, `public/js/edit.js`, `DESIGN.md` (new section 31 only), `docs/copy/admin.md`,
  `test/edit.test.js`, new `test/edit-a1.test.js`. **Out:** server.js, store.js, any public page, history, drafts.
- **Done when:** `test/edit-a1.test.js` (no `confirm(` in edit.js; View site link; Today renders a `<script>` venue inert;
  6-tab markup roles) green; Undo brings a deleted row back before Save (Chrome script in `.work/`); a 12 MB 4000x3000 phone
  JPEG with EXIF rotation uploads upright with no size message; at 390x660 Today + tabs fit the first screen.
- **Briefs, in order:**
  1. designer (Sonnet, medium), partner advisor (Sonnet, low): DESIGN 31 for ALL three rounds' look in one pass (31a tabs at 390,
     31b header + View site, 31c Today card, 31d Undo bar, 31e row subtitles, 31f history list, 31g draft offer + error code,
     31h Videos rows + add form). Section 15's language only: no new colours, fonts or motion; Undo bar has no animation.
     Strings written in place, docs/copy/admin.md style. Out: public pages, eras, photo framing.
  2. mediator (Haiku, low): coder and designer read DESIGN 31a-e against the current file; settle what is hard to build; one
     page of rulings, no edits.
  3. coder (Sonnet, medium), partner advisor (Sonnet, low): build A1 to DESIGN 31a-e.
  4. boss review + Gabe test items 1, 3, 4a, 5. helper (Haiku, low) for copy swaps and the HANDOFF line.

### A2 "A way back" (small server change)
- **Scope:** P0-1 history: `saveList` keeps the last 10 versions per file (`<name>.history/<iso-time>-<rand>.json`, server-made
  names only); `GET /edit/api/history/<kind>` lists when + row count; `POST /edit/api/history/<kind>/<id>` restores through
  `saveList` (so a restore is itself undoable) with the usual version check. Per tab. This list is also the audit trail (P2-1).
  P1-2 local draft per dirty tab (localStorage, try/catch, offer "Keep or throw away" on load); on a 409 his edits stay as a
  draft (this is our P1-4). P1-6 short error code shown + logged. P2-5 error summary takes focus. Today gets "Last saved".
- **Files:** A1 files + `server.js` (edit routes only), `src/lib/store.js`, `src/lib/backup.js` (exclude history), new
  `test/edit-history.test.js`. **Out:** restore from a backup file in the screen, a log screen, upload deletion, public pages.
- **Done when:** `test/edit-history.test.js`: 11 saves keep 10; restore writes and is listed; stale version -> 409; unknown kind
  or id, `../`, absolute and encoded paths -> 404; signed out -> 401; cross-site -> 403; backup ignores history; site.json
  restore keeps the IDENTITY merge rule; same error code in reply and log. Gabe test items 4b, 6, 7 pass.
- **Briefs:** 1. coder (Sonnet, high), partner advisor (Sonnet, medium, data-loss + path checklist): build A2 to DESIGN
  31f-g. 2. mediator (Haiku, low) only if the coder departs from 31f-g. 3. boss review; helper (Haiku) for copy and HANDOFF.

### A3 "Videos + finish"
- **Scope:** Videos tab (D123): add by YouTube link (watch, youtu.be, shorts, embed; 11-char id), title, Music video / Live,
  required box "No fast flashing lights in this video"; Hide / Show; "Put first" (Now showing). Server fetches the thumbnail
  only from `https://i.ytimg.com/vi/<id>/` (timeout, size cap, sharp re-encode) as the sleeve still. Records render live via
  a `<!--gl:records-->` marker, same HTML as today. P2-3 Duplicate show. P1-3 "Fans will tap: <link>" under link fields.
  `docs/guide/gabe-guide.md` updated, incl. a "Something went wrong" section.
- **Files:** A2 files + `src/components/Records.astro`, `src/components/videos.js`, new `src/lib/videos.js`, the Home and
  Videos page marker lines, `src/data/videos.json` (format only), `docs/guide/`, new `test/edit-videos.test.js`.
  **Claim extended at A3 start in HANDOFF.** **Out:** sleeve layouts, cover flow, dialog, Records CSS, the hero film, auto feed.
- **Done when:** golden test: the marker output for the shipped `videos.json` equals the A2 build's Records HTML byte for byte
  (Home and /videos/); hidden video absent from both; link parser refuses non-YouTube, `javascript:`, `http://evil/?v=`;
  title injection tests; thumbnail fetch never follows a redirect off i.ytimg.com; Gabe test items 2, 8 pass.
- **Briefs:** 1. mediator (Haiku, low) first: coder and the DESIGN 30 / Nov 18 owner rounds on Records; list what must not
  change. 2. coder (Sonnet, high), partner advisor (Sonnet, medium). 3. helper (Haiku, low): gabe-guide + copy. 4. boss review.

## 3. Rulings
- Do-not-build list: **accept all 9.** Add: no photo-album editing (About album is curated, credited, Print-treated: big job).
- P0-4 era / "Album look" picker: **out of this effort** (D121). One person, a new album look every year or two, eras are
  real designer work and the owner has not even picked a palette yet (?palettes). A new era is a "send it to us" job.
- Open Q Bandsintown: answered (he has a Bandsintown page, CONTEXT 2026-11-18). P2-7 sync: **out of the build; into the
  proposal** as an option (needs their API terms and the owner's call on which list is the master).
- Open Q eras: moot (P0-4 out). Open Q "Go back" scope: **per tab** (accept default).
- P2-1 audit trail: folded into A2 history. P2-2 restore from file: **skip** (A2 covers it; `tools/backup.mjs` stays ours).
  P2-3: **A3**. P2-4 framing: **skip**. P2-5: **A2**. P2-6 home-screen manifest: **skip**; one line in the guide instead.
- P1-4 merge-on-clash: **overrule** to "your edits stay as a draft" (A2); one user makes clashes rare.
- Videos: **Gabe controls them in A3**; no automatic YouTube feed in this effort (an unchecked auto-add could put a flashing
  video on the site; proposal item). Hide/feature control: yes.

## 4. Review rubric (after each round: "another loop" or "done")
Gabe test, run at 390x660 in Chrome, signed in, by a fresh agent with only the guide. Tap budgets exclude typing.
1. Add a show (date, time, venue, city, Open mic) and save: <= 8 taps from Today.
2. Duplicate a Mike's York Road show to a new date and save: <= 5 taps (A3).
3. Fix a typo in a release title and save: <= 5 taps.
4. (a) Delete a show by mistake, get it back before Save: 1 tap. (b) After Save, Go back to before: <= 4 taps (A2).
5. Upload a 12 MB phone photo taken sideways: lands upright, no size message, <= 3 taps after picking it.
6. A save fails (server 500): plain message + code he can text, nothing he typed lost (A2).
7. Tab killed mid-edit, page reopened: his typing offered back in 1 tap (A2).
8. Add a YouTube video, hide an old one, see both on /videos/ (A3).
9. Signed out mid-edit, signs in again: changes still there.
Plus: hard rules (no flashing, reduced motion honoured, injection tests), every tab one tap from anywhere, screen reader names.
**Another loop** if any item fails or is over budget, any hard rule fails, or a high-confidence finding is open (triage table
first: source, evidence, confidence, decision). **Done** when all pass with evidence. Max 2 fix loops per round; then cut scope.

## 5. Website refinement loops (after A3; at most 2 loops, these 3 items only)
- **W1 Gabe-proof the public pages (S-M):** now that his data goes live unreviewed, check 0 upcoming shows, 1 release,
  1 video, a 60-character venue and release title at 320-1600; fix only what breaks. Why: self-edit = new data shapes.
- **W2 Seams (S):** every "See it on the site" link lands on the right section (anchor); /videos/ and Home after a hide.
- **W3 Privacy line (S, helper Haiku):** add the /edit/ draft in localStorage (Gabe's device only) to Privacy and terms.
- **Do NOT touch:** Records / Videos look, cover flow, record dialog, About album, hero film, palettes and ?palettes, the poster
  wall layout, header nav, the formal Privacy / Terms text beyond that one line (all owner-tuned Nov 18).

## 6. Proposal (last)
Boss drafts the proposal for the owner OUTSIDE this public repo (pricing and terms stay private: owner's private repo or a
private doc): what Gabe can do alone now (with shots), what still needs us, and options with size: Bandsintown sync, YouTube
auto-feed with a flash check, new album look as a paid job, home-screen icon.

## 7. Decisions logged
D119 effort scope + research rulings, D121 era picker out, D123 videos in the edit screen, D125 history model.
