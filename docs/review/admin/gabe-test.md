# Gabe test, live run (Laptop boss, 2026-11-23, after A3 af5cc4c)

Task: run plan.md section 4 live at 390x660 and decide DONE or a fix loop. Done when this file has a verdict per item and a triage table.
Setup: own server on :8091, fresh temp DATA_DIR (seeded from shipped data), real EDITOR_USERS hash, SESSION_SECRET, no DEV_EDITOR.
Headless Chrome over raw CDP, mobile emulation 390x660, touch on, reduced motion. Every tap is a real `Input.dispatchMouseEvent`
counted by the script. Typing is `Input.insertText` (not counted). Native date/time pickers: the field tap is real, plus 1 counted
for the picker OK. The day or time choice counts as data entry. "Strict" also counts that choice. Shots: `docs/review/admin/gabe/`.

## Results
| # | Item (budget) | Taps | Result | Evidence |
|---|---|---|---|---|
| 1 | Add show from Today (<= 8) | 8 (strict 10) | PASS | Add show, Date+OK, Time+OK, Venue, City, Save. Type defaulted to Open mic. "Saved at 10:51 PM. Added: The Test Room." `02-1-add-show.png` |
| 2 | Copy Mike's York Road show (<= 5) | 5 (strict 6) | PASS | Edit, Copy this show (Date gets focus), Date+OK, Save. Both York Road dates on disk. `03-2-copy-show.png` |
| 3 | Fix a release typo (<= 5) | 4 | PASS | Today "Fix a release" focuses Edit, Edit, title, Save. "Changed: Scenic Route ...". `04-3-fix-release.png` |
| 4a | Undo a delete (1) | 1 | PASS | Rows 24 -> 23 -> 24 with no Save. `05-4a-undo-bar.png` |
| 4b | Go back after Save (<= 4) | 3 | PASS | History, Go back to this, Go back. The typo save is undone on disk. Exactly 1 "On the site now" tag (A1-A2 finding 1 fixed). `06-4b-history.png`, `07-4b-after.png` |
| 5 | 12 MB sideways photo (<= 3 after picking) | 1 | PASS | 29.7 MB 4000x3000 q100 JPEG, EXIF Orientation 6, picked through the real file-chooser event. "Uploaded. Press Save to keep it." No size message. Stored 900x1200 webp (160 KB), bright band at the TOP (upright; checked by eye, `up.png` in scratchpad). `08-5-photo.png` |
| 6 | Failed save: code, nothing lost | 2 | PASS | Real 500: shows.json read-only, so the rename failed with EPERM. "That didn't save. Try again." + code XJ4XAZ, same code in the server log. Typed venue still in the open row. `09-6-failed-save.png` |
| 7 | Tab killed, draft back in 1 tap | 1 | PASS | `Page.crash` 2.6 s after typing, then a new tab. "You have changes from Today, 10:52 PM that were never saved." Keep them brings back both typed fields. `10-7-draft-offer.png`, `11-7-kept.png` |
| 8 | Add video by link + hide one | 6 add, 3 hide | PASS | Today Add video, Link, Title, Live, flash box, Save. REAL i.ytimg fetch: `sleeves/zmhbfHppXNM-320/640.webp` written and served (200). The new id and its sleeve are on /videos/. Hid "Thank you Riverside!": OOGT3GxlQJk gone from /videos/ and Home. /videos/ at 390 has no h-scroll. `12-8-video-added.png`, `13-8-hidden.png`, `16-8-videos-page.png` |
| 9 | Session expiry mid-edit | 5 | PASS | Cookies cleared, then Save: "You were signed out. Sign in above, then press Save again. Your changes are still here." Signed in: "Signed in again. Press Save." The edit was still in the field. Save wrote it to disk. `14-9-signed-out.png`, `15-9-saved.png` |

Also: Today + all 6 tabs fit the first 660px screen (`01-today.png`). The script logged no page script errors.

## Triage
| # | Source | Evidence | Conf. | Decision |
|---|---|---|---|---|
| 1 | script (tap size) | The "No fast flashing lights" checkbox input is 24x24. It sits inside `label.ed-choice` with its text, so the label is the tap area. The script tapped the input itself. | low | Skip: the label row is the target (31h). Nothing to fix. |
| 2 | script (dialog) | One blank `beforeunload` prompt fired when the tab left /edit/ for /videos/ at the end. The last save (releases) reported "Saved", and Shows and Videos were saved before. Either a tab stayed marked unsaved, or it is the draft/Keep-them path from item 7. | medium | Act, small: fold into W2 seams. Repro the leave after items 7-9 and say which tab is still dirty. Fix only if a saved tab stays dirty. Not a Gabe-test fail: his data was saved. |
| 3 | script (strict count) | Counting the picker day or time choice puts item 1 at 10 and item 2 at 6. | medium | Skip: the plan counts picker OKs. A1-A2 finding 4's "default time to the venue's last time" is not needed: item 1 is within budget. Copy covers repeat venues. |
| 4 | A1-A2 carry-overs 1, 3, 4 | Single live tag (4b), real 12 MB photo (5), live sign-out (9), item 1 tap count | high | Done: all closed by this run. Carry-over 2 ("what changed" lines) shows in the save messages. |

## Verdict
**DONE.** All 9 items pass within budget, with live evidence. No hard rule failed: reduced motion was on throughout, no flashing
was added, and the flash box is required on add. No high-confidence finding is open. No fix loop. Next: website loops W1-W3
(plan section 5). Finding 2 rides in W2. Then the proposal (private repo).
