# Round IG boss gate (Laptop boss, 2026-11-10; plan section 4 step 4)
Task: rule on DESIGN 19a-19d + section 7 row, the copy rows, slice 2. Height bar on this machine: Home quotes-off 390x660
**not taller than 3633px** (5.505 screens, `baseline.txt`); 19 measures 3633 -> 3631.

## 1. DESIGN 19 + section 7 "Sign-up sending": APPROVED as written
- 19a approved: drop Now / From Gabe / Latest; Album/EP -> `span.tile-type` (`text` 700); the 16e pressed line becomes
  `.tile-link:active .tile-text :is(.tile-artists, .tile-meta, .tile-type) { color: var(--bg); }` (old `.tile-tag` pressed line deleted).
  Every Now state already starts with its own status word (D57); no test pins `now-tag`; server.js fills only between the markers.
- /v2/ ruling: **leave it out of slice 1.** `src/pages/v2/index.astro` and `src/styles/v2.css` stay as the owner saw them (frozen,
  unlinked, noindex). Slice 1's grep is over `src/` excluding those two files.
- 19b approved, ships `--tint: 0%` (D71). The 5% recommendation goes to the owner with `tint-sheet.png`; no one changes it.
- 19c approved: one removal (`.links` `border-bottom`) + the dead `.coming .release-row` line (no `.coming` element in src/).
- 19d + section 7 row approved; slice 2 matches them.

## 2. Copy rows (`docs/copy/ig-round.md`)
| Row | Ruling | Note |
|---|---|---|
| 1 Booking and shows -> Booking | **Yes** | edit `test/build.test.js:112` in the same change |
| 2 Pre-save IDENTITY -> Pre-save | **Yes** | both files; add `aria-label="Pre-save IDENTITY"` to both links (label-in-name holds, matches the "Listen to IDENTITY" pattern); edit `build.test.js:75, :110` |
| 3 All releases -> Releases | **Yes** | edit `build.test.js:110` |
| 4 About GLucak -> Full bio | **Yes** | the Home section shows one bio sentence; the button says what you get. Not pinned |
| 5 drop `tile-when` date on the art | **No** | markup, not words (slice 4 is text only); it would leave `.tile-when` dead in global.css, which the helper may not touch, and it undoes a 16a design element. Next round, designer |
| 6 "Photo slot... Waiting on Gabe's OK." -> "Crowd photo coming." | **No** | a deliberate pre-launch marker (DESIGN 18c, like the ph-chips) read by the owner and Gabe in the preview; it goes when the photo lands or at launch, not now |
| 7 RiseBand player note | **Yes** | text exactly as proposed, `<strong>` kept; `build.test.js:94, :132` still pass |

**Helper applies exactly rows 1, 2, 3, 4, 7**, verbatim, after slice 1, plus the named test lines; then `npm test`.
Claim first: the main session adds `src/components/RiseBand.astro`, `test/build.test.js`, `test/signup-ui.test.js` to the
HANDOFF claim (not in the current list; Desktop doesn't claim them).

## 3. Slice 2 (`public/js/app.js` diff): APPROVED
`preventDefault` before the in-flight check (no native double post), flag not attribute stops the second submit, `aria-disabled`
cleared on every path, `textContent` only, three messages unchanged, no global.css or Signup.astro edit. Still owed for its
"done when": the Chrome 2000 ms latency check (one POST per double tap) and the STD a11y200 run, if not yet done.

## 4. Brief changes
- **Slice 1:** add "exclude `src/pages/v2/` and `src/styles/v2.css` from the grep and the edit". Find rules by selector, not line
  number (lines shift). Delete the `.tile-link:active .tile-tag` line with the merge above. Keep `.tile-when` (row 5 rejected).
- **Slice 3:** the test also holds `text` and `muted` on `--bg-2` >= 4.5:1 at 0, 5 and 10% (19b's last line); `--tint` stays 0%.
- **Slice 5:** build 19c only: remove `border-bottom: 2px solid var(--line);` from `.links` and delete `.coming .release-row`
  (if slice 1 has not). By selector. Nothing else; the D67 check as planned (<= 5.8) and Home quotes-off <= 3633px.
