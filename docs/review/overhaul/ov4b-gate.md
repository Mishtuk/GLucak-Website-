# OV4b gate (Desktop main session, boss role, 2026-11-18)

**Verdict: pass, pushed.** Commits e34b89e..6168a1b plus the gate fix.

- Review (`ov4b-review.md`): no P0. Both P1s fixed in bbc7e7c: backups carry releases and their covers, with a round-trip test and the old-backup case;
  the "Coming" tag is no longer clipped at 390. P2s fixed: a corrupt releases.json no longer returns 500; the date hint is honest for
  Spotify links; the upload counter is per tab.
- **Gate fix:** a restore took the IDENTITY row from the backup file without checking it. Now IDENTITY is never read from a file:
  `writeBackup` keeps the site's own row (as a Releases save does). The test proves a backup's IDENTITY row is not written.
- Loop-3 items in the same push: `test/html-a11y.test.js` (8 checks over dist, all pass today), CSP `frame-ancestors 'none'` +
  `base-uri 'none'` + `X-Frame-Options: DENY` (nothing frames our origin; no `<base>`), boss.md rule lesson.
- Left (P2, logged): the cover path is shape-checked, not existence-checked (a missing file shows a broken image until Gabe re-uploads);
  a save moves the IDENTITY row to the end of releases.json (harmless: every reader sorts or filters).
- `npm test` 297/297.
