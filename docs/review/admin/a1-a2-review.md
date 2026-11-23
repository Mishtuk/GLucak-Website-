# A1 + A2 review (Laptop boss, 2026-11-23)

Task: Gabe keeps his site current from his phone and undoes his own mistakes. This review: do A1 (6aef2a2) and A2 (cc4b125)
meet their done-when lines in `plan.md` section 2 and the Gabe test items they cover (section 4)?
Evidence: advisor reports (A1 ship; A2 fix-first, fixed), `npm test` 374/374, shots `a1/` + `a2/` at 390, main-session Go back
run, `test/edit-a1.test.js`, `test/edit-history.test.js` (27 tests), `public/js/edit.js` read where needed, local
`/edit/api/history/shows` read (GET only; nothing saved).

## Triage
| # | Source | Evidence | Conf. | Decision |
|---|---|---|---|---|
| 1 | boss (live API) | After a Go back to the original 33-show save, History has TWO `live:true` entries (newest 23:33 and oldest 22:41, same rows), so two rows say "On the site now". `server.js:274` marks live by content match. | medium | Fold into A3: only the newest matching entry is "On the site now". |
| 2 | boss (shot a2/edit-390-1) | Three History rows read "Today, 6:20 PM"; only the show count tells them apart. Real use rarely saves 3x a minute, but a go-back target must be clear. | medium | Fold into A3: the "what changed" save line A3 already builds goes under each History row (e.g. "Added The Venue"). No seconds. |
| 3 | plan A1 done-when | "12 MB 4000x3000 EXIF-rotated JPEG uploads upright, no size message": only unit-tested with fake `createImageBitmap`/canvas (`edit-a1.test.js` 76-102). No real-file run in Chrome. Failure mode is a plain message, server cap + re-encode still hold: no data risk. | medium | Fold into A3: real-file run in the Gabe test (item 5). Not a blocker. |
| 4 | boss (Gabe item 1) | Today "Add show" opens the form straight away, type defaults to Open mic. Count: Add show 1, date picker 2-3, time picker 2-3, venue, city, Save = 8-10 if native picker taps count. | medium | Fold into A3: count it in the fresh-agent Gabe run; if over, A3's Duplicate show is the fix for repeat venues, and the time field could default to the venue's last time. |
| 5 | boss (shot a2/edit-390-0, a1/undo-390) | Save bar overlapping the draft offer / list, and h1 "11 10 11 TRUE FALSE TRUE" | high | Skip: shot artifacts (full-page capture of a sticky-bottom bar at an 844 viewport; the undo script wrote its row counts into the h1). a2/edit-390-1 shows the real layout. |
| 6 | advisors A2 | STALE wording, history route prefix, goBack during save, cleanDraft keys, two-tab drafts | high | Done in cc4b125 (tests 437-463). |

Hard rules: injection (`<script>`, `' OR 1=1 --` render inert in shots; history test 197; drafts 402), no `confirm(`/`innerHTML`
(test 378), no motion added, 401/403/404/415/429 paths tested, history out of backups (test 322). Copy is in Gabe's words
("Go back to this", "What is on the site now stays in History, so you can undo this", "Send this code to the person who runs
the site"). 390x660: Today + both tab rows end near y=600, fit the first screen. PASS.

## Gabe test (A1/A2 items)
| Item | Status | Evidence |
|---|---|---|
| 1 Add show <= 8 | untested | needs the fresh-agent run; estimate 8-10 with native pickers (finding 4) |
| 3 Fix release typo <= 5 | pass (code) | Today "Fix a release" focuses the newest release's Edit (edit.js 768): Edit, title, Save = 4 taps |
| 4a Undo delete, 1 tap | pass | undo-390 script: 11 rows -> delete 10 -> Undo 11 |
| 4b Go back <= 4 | pass | History, Go back to this, Go back = 3 taps (a2/edit-390-2); main session restored the 33-show save end to end; the go-back is itself in History |
| 5 Sideways 12 MB photo | untested (real file) | unit-tested only (finding 3) |
| 6 Failed save: code, nothing lost | pass | a2/edit-390-5: "That didn't save. Try again." + code K7P4Q2, the open row keeps every field; test 296 same code in reply and log |
| 7 Draft back in 1 tap | pass | a2/edit-390-1: offer at the top of Shows, "Keep them" 1 tap; Today says "Unsaved changes waiting in Shows" |
| 9 Expiry keeps changes | pass (code) | 401 on Save shows sign-in, rows untouched; sign-in when loaded keeps edits, "Signed in again. Press Save." (edit.js 731); not run live |

## Verdict
**A1 and A2 are done.** No high-confidence finding open, no hard rule fails, every A1/A2 Gabe item measured so far passes.
No fix loop. Fold into A3 (A3 owns server.js/edit.js), smallest first:
1. One "On the site now" badge: newest live entry only (server.js:274 or the client render).
2. Each History row gets the A3 "what changed" line.
3. In the A3 Gabe run: real 12 MB EXIF photo (item 5), live sign-out mid-edit (item 9), and count item 1's taps with native
   pickers; only if item 1 is over 8, default the time to that venue's last show time.
