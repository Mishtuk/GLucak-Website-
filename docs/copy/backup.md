# Backup link words (edit screen, `src/pages/edit/index.astro` ~64-65)

Voice: `admin.md` (plain, short, true, phone first). Built from `round2.md` section 5; this file is the final text for the plain link.

| String | Words | Chars |
|---|---|---|
| Link | **Download a backup** | 17 |
| Hint | **One file with your shows, products and photos. Keep it somewhere safe.** | 71 |
| Link fails: signed out | **You were signed out. Sign in above, then download again.** | 56 |

Why: the link says what pressing it does (it downloads, it does not save edits). The hint says what is inside (photos are in the file:
`src/lib/backup.js`) and what to do with it. The restore sentence in round2.md stays out of the page: Gabe never restores.

## When Gabe's session has expired

The link is a plain `<a download>`. The server answers 401 with a JSON error, so the browser either saves a small error file or shows
"Failed - no file" depending on the browser. Neither tells Gabe what to do. **A page message is needed**, but not with a plain link:
it needs the fetch step in `round2.md` section 5 (Mechanism): on click fetch the file, on 401 show the sign-in card and the line above.
The plain link stays as the no-JavaScript fallback. Until that step is built, the line above has nowhere to appear.
