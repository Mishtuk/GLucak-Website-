# Round IG: redundant-text pass (slice 4)

Scope: strings WE wrote in `src/pages/*.astro`, `src/pages/{music,shows,about}/`, `src/components/*.astro`, `src/components/content.js`.
Checked against the Tiwari tells (uniform cadence, throat-clearing, filler, redundant labels). Not touched: the slogan with its
period, the quotes and credits, the bio, release titles, the D57 Now-line patterns ("Out now: ...").

Honest read: the copy is already short. Most strings are plain labels, so there are 7 rows, not 8. Rows marked **PINNED** also
need the named test edited in the same change (the helper applies the text and the test line together, or skips the row).

Shortest proposed text first.

| # | Page | File:line | Current | Proposed | Why | Pinned by a test? |
|---|------|-----------|---------|----------|-----|-------------------|
| 1 | About | `src/pages/about/index.astro:31` | `Booking and shows` | `Booking` | The section holds one booking line and no shows. The heading promises more than it has. | **PINNED**: `test/build.test.js:112` lists `'Booking and shows'`; change to `'Booking'` |
| 2 | Music, Home | `src/pages/music/index.astro:39`, `src/pages/index.astro:75` | `Pre-save IDENTITY` (button) | `Pre-save` | The word IDENTITY sits right above the button. The label repeats it. Release tiles already say just `Pre-save`. | **PINNED**: `test/build.test.js:75` and `:110` expect `Pre-save IDENTITY`; change both to `Pre-save`. Keep `aria-label="Pre-save IDENTITY"` on the link so a screen reader still hears the title |
| 3 | Music | `src/pages/music/index.astro:13` | `All releases` | `Releases` | "All" is filler; the crate is the list. | **PINNED**: `test/build.test.js:110` lists `'All releases'` |
| 4 | Home | `src/pages/index.astro:54` | `About GLucak` (button) | `Full bio` | The section tab already says About and the page is his. The button should say what you get. | Not pinned (grep of `test/` finds no hit) |
| 5 | Music | `src/pages/music/index.astro:21` and `:25` | Coming tile shows the date twice: `Jan 15` on the hatched art and `Out Jan 15, 2027` under the title | Remove the date badge on the art (`tile-when`); keep `Out Jan 15, 2027` | Same fact twice in one tile. The full line is the one that names the year and says "Out". Markup, not wording, so the helper only deletes the `{r.coming && <span class="tile-when">...}` span; the hatched box stays | **PINNED**: `test/round2.test.js:75` expects `tile-when">Jan 15<`; drop that fragment |
| 6 | Home | `src/pages/index.astro:50` (text and aria-label) | `Photo slot: crowd shot. Waiting on Gabe's OK.` | `Crowd photo coming.` (aria-label: `Crowd photo coming`) | Visitors do not need our approval status. It is an internal note shown on the page. Shorter and no inside talk. Placeholder only: it goes when the real photo lands | Not pinned |
| 7 | Home, Music | `src/components/RiseBand.astro:21` | `Loading the Spotify player. If it doesn't appear, use **Play full songs on Spotify** below.` | `Loading the Spotify player. Not showing? Use **Play full songs on Spotify** below.` | Drops the throat-clearing "If it doesn't appear". Same instruction, two words shorter. First sentence kept as is | Partly pinned: `test/build.test.js:132` matches only `Loading the Spotify player\.`, so the new text passes; `:94` needs `Play full songs on Spotify` kept |

Considered and left alone: the Home and Music `Skip the Spotify player` link (`test/seo.test.js:25` pins it); the Signup label
(`test/build.test.js:109` pins it and it is already one line); `Hear more on SoundCloud` (pinned, and it says something
different from the Home `SoundCloud` link); the footer `Listen. Shows.` closer (it is design, not copy); the 404 line
`That page isn't here. The music is.` (short, has a voice); the about page's three bio paragraphs (Gabe's words).
