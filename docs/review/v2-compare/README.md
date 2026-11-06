# Home: current vs v2 (2026-11-06, Desktop designer)

Owner's note 8: a from-scratch site only if it is clearly worth it, then compare the two. The research
(`docs/research/modern-references.md` section 4) said a full rebuild isn't worth it, so v2 is **one variant Home** built inside
the real Astro build at **`/v2/`**. It is unlinked, `noindex`, and not in the sitemap. It uses the same components, data, server
fill (shows, Now line) and tests, and adds the research's top 5. Nothing in the live Home changed. The owner can pick **item by
item**, and each pick ports into the real components one at a time.

Files: `src/pages/v2/index.astro`, `src/styles/v2.css` (only that page loads it), `public/media/v2/` (4 library stills,
WebP, metadata stripped, never upscaled), `test/v2.test.js`.

## Shots

- `compare.png`: full pages side by side. Current on the left (390, then 1280 at 50%), v2 on the right, with a red divider.
- `current-390-first.png` / `v2-390-first.png`, `current-1280-first.png` / `v2-1280-first.png`: first screens.
- `*-full.png`: full pages. `measure.json`: the raw numbers.

How they were taken: `node server.js` on port 8791, Chrome through Playwright, scale 1, reduced motion on (so the heading fade
can't leave blank bands in a full-page capture), each page scrolled through, the Spotify player scrolled into view for 5 s so
it renders, then back to the top. The phone bar shows in the middle of the 390 full-page shots: that's how a full-page capture
draws a fixed bar, the same on both pages.

## Measurements (same script, same data, both pages)

| | Current 390x660 | v2 390x660 | Current 1280x800 | v2 1280x800 |
|---|---|---|---|---|
| Page height | 3600px = **5.45 screens** | 3821px = **5.79 screens** (cap 5.8, D39) | 3496px = 4.37 screens | 4214px = 5.27 screens |
| Photo slots shown | 4 | 6 | 4 | 8 (+1 empty labelled slot) |
| **Distinct photos** | **2** (the Kealey photo 3 times, 1 video thumb) | **6** | **2** | **8** |
| Spotify player, px from top | **508** (90px shows above the phone bar on the first screen) | **780** (not on the first screen) | **621** (179px on the first screen) | **902** (not on the first screen) |
| Contrast lows (text on solid grounds, need 4.5 / 3 large) | none | none | none | none |
| Smallest text | 16px | 16px | 16px | 16px |
| Tap targets under 48px | none | none | none | none |
| Sideways overflow | 0 | 0 | 0 | 0 |
| Console errors | none | none | none | none |

The current Home measures 5.45 here, not D39's 5.78, because the data has changed since then (2 upcoming shows, no quotes)
and this script doesn't count the prototype note. Both pages are measured the same way. The contrast check covers text on
solid grounds only. Text over the hero photo is the same component on both pages, already measured in DESIGN.md (L1 row).

Photos on v2 (one per slot, none repeated): hero = Kealey (A on phones, riso B from 900px, as now) · Rise, 900px up = garage
still from the Duck, Dodge, Jump, Fight video (`yt-K-OZiNvQB14-1`, camera Joseph Lucak, credited in the footer) · Live It Loud,
900px up = stage at Crooked Eye (`yt-aZNW63M_C2E-2`) · video row = 3 real thumbnails · Push Past Fear = Crooked Eye, arm
raised (`yt-aZNW63M_C2E-4`) · Join = IDENTITY art (`ig-De4m7omGlSq-2`). All are USE in `assets/from-gabe/social/INDEX.md`. The
one MAYBE (the church-hall crowd shot with a child in it) is **not used**: from 900px there's a hatched, labelled empty slot
"Photo slot: crowd shot. Waiting on Gabe's OK." in its place. The live stills are 634x1128 screen captures, so they're used
only in portrait card slots, never full-bleed.

## Item by item

| # | Item | Current | v2 | Pick |
|---|---|---|---|---|
| 1 | **Release card** (Rise) | Big RISE, the player, then a 96px cover with the title under it. On desktop the left column under RISE is empty. | One `bg-2` panel: the cover large (36% of the card on phones, 40% on desktop), "Latest single · Sep 4, 2026", title, credit, a **Listen** button, then the Spotify player and "Play full songs on Spotify" in the same panel. The release reads as something you can play. | **v2 from 900px. Current order on phones.** On desktop the card is clearly better and costs nothing. On phones, putting the cover first pushes the player from 508px to 780px, so it no longer peeks into the first screen, and listening is main action 1. Best of both: on phones, keep the panel but put the player first and the cover row under it. |
| 2 | **Video row** | One "Latest video" box: the newest upload (Hobbyist?, the IDENTITY graphic) with its thumbnail. | "Watch": latest + the 2 newest featured (You're Not Alone, Duck, Dodge, Jump, Fight), real local thumbnails, plain links to YouTube (no iframe until you leave). Phones: a still swipe row (scroll-snap, nothing moves by itself, the next card peeks), so **no extra height**. From 900px: the latest one big, the two others stacked beside it. | **v2.** Three real videos for the same phone height. The newest upload is often a short promo, so the two featured music videos make sure there's something worth a tap. |
| 3 | **A different photo in every slot** | The Kealey photo fills the hero, the show poster and the Push Past Fear band: the same man at the same mic three times. | 6 different pictures on phones, 8 from 900px, none repeated. The show poster's art (the Kealey cut) is dropped so it doesn't repeat the hero, and the poster becomes text only (bigger date, 114px shorter on phones). | **v2.** This is owner note 6 done. Cost: the approved gig-poster art (D34 c) goes. If you want it back, give it a second real photo and it can return without repeating the hero. |
| 4 | **Phrase beside its content from 900px** | Each phrase full width, with the content under it: the same "giant word, then content" rhythm five times. | 5 : 7 grid from 900px: RISE / LIVE IT LOUD / PUSH PAST FEAR / THE TIME IS NOW on the left with a photo under them, the content on the right. Phones are unchanged (stacked). | **v2.** It ends the five-stack and fills the empty half of every band. The desktop page is longer (5.27 vs 4.37 screens) because of the photos and the 3-video grid, not the grid itself. Watch FEAR: fitted to the narrow column it's very big (~270px). Give it the one-line lock if that feels heavy. |
| 5 | **Header** | A scrim over the hero photo until you scroll, then solid. | A solid `bg` band from the first paint. On phones the hero photo moves down one header height (+52px), so his face sits between the band and the name. Desktop looks almost the same. | **v2.** The current scrim puts Logo D over the photo, which D25 forbids (solid dark ground only). The solid band is the only version that fully follows D25 and D64(2). The 52px is paid for elsewhere (v2 still fits 5.79). |

**Overall:** port 2, 3, 4 and 5 as built. Port 1 on desktop as built and on phones with the player first. **No full rebuild.**
v2 shows that every gain is a layout or picture change inside the existing components, as the research predicted.

## Rules kept on v2

No new animation (the glow and the heading fade are reused as they are, D47 / D64). Nothing flashes. All tap targets are 48px
or more. All text is 16px or more. External links get the build's new-tab treatment (`target="_blank"` plus the screen-reader
hint). CSP: no inline script. The JSON-LD on the real Home was left out because v2 is noindex. The shows come from the same
`<!--gl:shows-->` marker. On any path other than `/`, the server adds "Played", so v2.css hides it and the page adds its own
"All shows" link.

## Not done / to check
- Hero B at 900px+ still uses the Kealey riso, so on desktop the hero and nothing else carries that photo (fine). The phone
  hero is unchanged apart from the strip offset.
- The Spotify embed only draws its contents once it's on screen (a Spotify behaviour, the same on both pages). The shots wait
  for it.
- Credits: only the Kealey photo and Joseph Lucak (camera on the Duck, Dodge, Jump, Fight video) are known. The Crooked Eye
  stills and the IDENTITY art have no credit until Gabe says who made them (INDEX.md rights questions 1-2).
