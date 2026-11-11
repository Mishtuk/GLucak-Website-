# Round IG2 boss gate (Laptop boss, 2026-11-10)

Reviewed: DESIGN.md 20 (20a-20e), `design/labels-sheet.png` and the 20a-20d shots, against `docs/review/round-ig2-plan.md`,
CONTEXT.md ("What goes on the site"), D6 / D75 / D77. Slice A met its "done when": sheet saved, exact deltas with measured px.

| Item | Ruling | Decision |
|---|---|---|
| 20a label | **Approve direction 2**: word unfilled on the 4px rule, `--tab-h` 24px, sub pages show their top rule. 3714px (d3) and 3.80 / 4.05:1 on About's photo (d3, d4) rule those out. Home 3621, worst pixel 14.3:1 | D79 |
| 20b Play on screen one | **HOLD** for the owner / Gabe. Nothing from 20b is built, spacing cuts included | D81 |
| 20c About >= 900 | **Approve the setlist** (not the button fallback). One accent fill per view; phones unchanged | D83 |
| 20d middle dots | **Approve** two spans with a literal space | D83 |
| 20e change count | **Approve as amended**: 2 visible changes + the 20d detail | D79-D83 |
| Blocked-shot method | `--host-resolver-rules` from now on; setBlockedURLs doesn't block the OOPIF | D85 |

**Why 20b is held, and not built in a smaller form.** I looked for a version that keeps the playlist. There isn't one at 390x660:
with the 352px player Play needs 142px and every allowed source together gives 138.8 (the RISE line deleted included). Spotify's
current 152px compact player also loses the track list and still misses. The 80px player plays the same playlist, but it drops
the visible track list that the "like Thousand Foot Krutch" request points at. It also uses a size the generator no longer offers,
has a 28px Play (under our 48px floor), and still misses 320x568. Gabe named this item and the owner is away, so it is the owner's
call. Building only the spacing cuts would change the hero's rhythm with no goal behind it, so they wait too.

**Owner question (for HANDOFF "Owner"):** On phones, keep Home's full playlist player (track list visible, Play just below the
first screen) or switch to Spotify's slim 80px player (Play on the first screen, no track list; /music/ keeps the full one)?
Compare `design/20b-home-390-before-unblocked.png` with `design/20b-home-390-rec.png`. Ask Gabe if you want his view.

**Briefs updated** in the plan: the task line, STD shots (D85), slice 1 (20a only, `global.css` only, `after/label.txt`), slice 2
(the setlist, D83), slice 3 (block per D85; measure Play but don't rank it as a fix). DESIGN 20b and 20e carry the gate note.
**Not done here:** no build, no commit, no HANDOFF edit (the main session adds the owner question with the next push).
**Next:** slice 1 (glucak-coder, port 8853, `dist-coder`), then slice 2, then slice 3.
