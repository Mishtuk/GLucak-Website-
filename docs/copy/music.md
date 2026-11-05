# Music copy (Copywriter draft, 2026-11-05) - for Gabe to review via the owner

Blocks are named as in DESIGN.md section 6 (Music) and section 7 (States). Counts are characters including spaces and
punctuation. "Site" = plain label. "Gabe" = first person, his own words, exact (D23). Nothing is final until Gabe approves.

Fixed, not touched: the slogan; tab and nav words (Music, Listen); "Play full songs on Spotify"; the fitted phrase RISE.

Sources: `src/data/releases.json` (titles, dates, links), `docs/research/social-content.md` (his words), `DESIGN.md` sections 6 and 7.

---

## 1. Page intro

DESIGN section 6 gives Music no intro text: the page opens with its tab (Music) and its one fitted phrase (RISE), then the player.
**Draft: none.** Any extra line would push the player down on a phone.

Player note (state "Embed blocked or slow", DESIGN section 7; the designer's wording, reused as is):

| Part | Draft | Chars |
|---|---|---|
| Note under the Spotify iframe (only while loading or blocked) | **Loading the Spotify player. If it doesn't appear, use Play full songs on Spotify below.** | 87 |
| Link below the player | **Play full songs on Spotify** (fixed) | 26 |

---

## 2. Releases cover strip

One cover per release, newest first by `date`. Titles exactly as credited on Spotify, features included; `releases.json` must match (D31).

| Part | Draft | Chars |
|---|---|---|
| Strip heading (site label) | **All releases** | 12 |
| Listen link (already out) | **Listen** | 6 |
| Pre-save link (date still in the future, New York time) | **Pre-save** | 8 |
| Date line, released | **Sep 4, 2026** style (month abbreviated, no leading zero) | 11 |
| Date line, upcoming | **Out Nov 13, 2026** style | 16 |
| Type tag | **Single** / **EP** / **Album** (from `type`) | 6 / 2 / 5 |
| Cover alt text | **{title} cover art** | title + 10 |
| No `date` | no date line at all (never "TBA") | - |
| No cover image yet (all covers are `null` in the data today) | the title in display type on the era color; no broken image | - |

Rows today (title / date line / link label), from `releases.json`:

| Title (exact) | Date line | Label |
|---|---|---|
| IDENTITY | Out Aug 13, 2027 | Pre-save (this one also has the IDENTITY block, section 3) |
| Scenic Route | Out Jan 15, 2027 | Pre-save |
| Who I Am | Out Nov 13, 2026 | Pre-save (becomes Listen on 11-13) |
| Duck, Dodge, Jump, Fight / artists line "GLucak, J-BOY" | Sep 4, 2026 | Listen |
| Rapping Like (Oh Yeah) / artists line as Spotify shows them (Micah Haun) | Jul 24, 2026 | Listen |
| One and Done | May 22, 2026 | Listen |
| Earned Your Stripes (Live at Riverside) | May 15, 2026 | Listen |
| Go | Mar 20, 2026 | Listen |
| GLucak (Deluxe Edition) | Dec 19, 2025 | Listen |
| Fall Down 7, Stand Up 8 (A Remix Album) | none | Listen |
| Anomaly | none | Listen |
| You're Not Alone (EP) | none | Listen |

Spotify wins (D31, D33). Spotify's titles carry no "feat." or "w/"; collaborators are separate artist credits, so the title is exact and the artists line under it shows them as Spotify does. `releases.json` was checked against Spotify (70461b5) and is the source for every title, artist and date. Never drop a collaborator credit.

---

## 3. IDENTITY block

Same wording as Home so the two never disagree. Facts: album IDENTITY, 2027-08-13, pre-save https://wingsmusic.lnk.to/IDENTITY.
Source: his Instagram post https://www.instagram.com/p/DezSq7QCu7K/ (2026-10-22): "New album IDENTITY dropping on August 13th of 2027!"

| State | Draft | Chars |
|---|---|---|
| Brand line (era word, fitted) | **IDENTITY** | 8 |
| Before release: date line | **August 13, 2027** | 15 |
| Before release: countdown | **August 13, 2027 · 281 days to go** (days as of 2026-11-05; the page computes it; "1 day" singular; no ticking digits) | - |
| Before release: button | **Pre-save IDENTITY** | 17 |
| Release day and after (New York time) | **Out now.** + link **Listen** (the pre-save goes) | 8 + 6 |
| No date set (fallback only) | the mark and **IDENTITY** alone; no countdown, no pre-save | - |
| Track slots (D10) | wait on Gabe; filling in toward Scenic Route as the larger last row | - |
| Scenic Route row (last, large) | **Scenic Route**, tag **Track 12**, date line **Out Jan 15, 2027**, **Pre-save** | 12 / 8 / 16 |

Track 12 and the order come from his own tracklist image (Instagram, Oct 24; read from a thumbnail, see social-content.md section 2).
Other eleven titles stay hidden until Gabe confirms spelling and says it is OK (social-content.md open question 9).

### From Gabe (D21), IDENTITY block: after the pre-save button

| # | Quote (exact) | Chars | Credit | Source |
|---|---|---|---|---|
| M1 | "putting your hope and your sense of purpose Identity in something that won't last is a bad idea" | 95 | GLucak, Instagram, Sep 2026 | https://www.instagram.com/p/DdpsSGLCa6n/ (2026-09-23) |
| M2 | "Wrote a new single about the question of where we put our identity" | 66 | GLucak, Instagram, Oct 2026 | https://www.instagram.com/p/Dek4NnpiTUx/ (2026-10-16) |

**None for now (D29).** M1 is part of a longer sentence of his, and we don't have the whole sentence. M2 says "new single", which goes stale. The lyric lines wait on Gabe's OK (social-content.md Q9).

---

## 4. SoundCloud

| Part | Draft | Chars |
|---|---|---|
| Link label (to https://soundcloud.com/glucak) | **Hear more on SoundCloud** | 23 |

---

## 5. Empty and loading states (DESIGN section 7)

| Case | Draft |
|---|---|
| Embed blocked or slow | Section 1 note (87 chars) |
| No IDENTITY date | Mark and "IDENTITY" only, nothing else |
| Release day | "Out now." + Listen |
| No quote | nothing, no box |
| A release has no link | build fails; no "#" link, no dead button |
| No JS | page reads fully; the Spotify facade is a plain link, "Play full songs on Spotify" |

---

**Picks:** Music: none.

## ASK GABE
Moved into the combined list in home.md.
