# IDENTITY art system: how to design the music's art better (Desktop designer, 2026-11-06)

Owner (2026-11-06): "Keep on doing research on ... the art for the music. How to better design it." This is the art half of
research round 2 (the website half is `design-round-2.md`). It builds on, and does not repeat, `photo-art-direction.md`
(photo treatments, riso/screen-print behaviour, AI tells) and `social-content.md` (rollout dates, tracklist, his words).
No AI generation anywhere: real photos, real fonts, the real logo, print processes we can actually run. Mockups are in
`shots/round2/art-*.webp`, every one labelled MOCKUP.

## 1. His visual language today (what I looked at, honestly)
Looked at: the 8 covers in `public/media/covers/`, the Who I Am and Scenic Route smart-link art (Linkfire og:image, read
only, not saved in the repo), the IDENTITY smart-link art, and the 5 logos in `assets/from-gabe/`.

| Family | Where | What it is |
|---|---|---|
| **Single template** | Go (blue), One And Done (red), Rapping Like (yellow), Duck Dodge (sky), **Who I Am** (olive), Earned Your Stripes (over a photo) | Flat colour with a radial glow from the centre, the flat yellow-wing cross (`logo-new`) centred, and the **title repeated round all four edges** as a frame |
| **Album band** | Fall Down 7 Stand Up 8, Time Is At The Essence | Ochre header band with the title in a bold sans, a B&W photo, spaced `G L U C A K` with the flaming cross (`logo-classic`) |
| **Lit photo** | Deluxe, **IDENTITY** promo | Gabe in coloured light. IDENTITY: deep blue, violet glow top right, Gabe nearly a silhouette, white sans `IDENTITY`, Logo D under it |
| **Chrome** | **Scenic Route** | Route 66 road photo with a crunchy HDR look, chrome extended italic title, `logo-a` (chrome cross, yellow wings). File metadata: Photoshop (Mac), July 2025 |

**Recurring motifs.** The cross with lightning wings is the constant, but in **five versions**: flat yellow (`logo-new`),
chrome + yellow wings (`logo-a`), gradient cross + grey wings (`logo-b`), chrome + grey wings (`logo-d`, IDENTITY's), the
flaming cross (`logo-classic`, also printed on the shirt he wears on stage in Kealey's photo). Colours: one saturated
colour per single; IDENTITY moves to night blue/violet. Type: a plain humanist sans on most covers, chrome italic once,
never the same title face twice. Photos: him, lit by stage or room light, often as a silhouette.

**What's strong.** (1) The single template **is already a series system**: one constant device (the frame text + mark) and
one variable (colour per song). In a grid his singles read as his. That's what Sheeran's symbols and The 1975's box do
(section 2). (2) The IDENTITY promo has restraint: one light, one colour world, the face withheld, which suits an album
asking "who am I". (3) Logo D (grey wings) is the cleanest mark he has.

**What's inconsistent.** Four cover families in about 18 months, and **three inside the IDENTITY campaign alone** (Who I
Am uses the old single template in olive, Scenic Route the chrome road, the album the blue photo), so the singles don't
yet point at the album. Five marks. Frame text reads in mixed directions and is cut mid-word at the corners.

**Homemade vs designed tells.** Homemade: centre radial gradients (the default-tool look), flat yellow clip-art wings with
a thin outline, bevel/chrome type and HDR road photo (2000s web), letterspaced `G L U C A K`, small edge type that turns
into a dotted line at thumbnail size. Designed: the IDENTITY promo's light and composition, Logo D. **Unknown: which covers
are Dave Bahm's** (Gabe thanked him for "these album covers", Oct 27). Ask before calling any one "homemade" to anyone.

## 2. Craft research
| Topic | Finding | Source | What we take |
|---|---|---|---|
| Series systems | Sheeran's albums are one device (a maths symbol) with a new colour each time; ÷ and = shared a spin-art method | [thisisdig](https://thisisdig.com/?p=4985), [Radio X](https://radiox.co.uk/news/music/ed-sheeran-finished-mathematical-album-titles) | One constant, one variable. Gabe's frame device is his constant |
| | The 1975's glowing rectangle recurred across covers and stage; fans complained when a cover dropped it | [Coup de Main](https://coupdemainmagazine.com/the-1975/14803) | A device is worth keeping once fans know it: keep the frame text, redraw it |
| | Fred again.. ties a series by personal photos and a naming system (dates in the title), not by one graphic | [Rolling Stone UK](https://rollingstone.co.uk/music/fred-again-actual-life-interview-16307), [Dummy](https://www.dummymag.com/new-music/fred-again-announces-debut-album-actual-life-april-14-december-17-2020/) | Numbering is a system too: **track number = the series ID** |
| | Album art anchors single covers, posters, lyric videos, stage visuals and merch; the lead single sets the frame | [Made Good Designs](https://madegooddesigns.com/album-cover-design/), [Eric Alper](https://www.thatericalper.com/?p=233105) | Design the system before the next single, not per release |
| Faith lane | "Cheesy Christian album art" is a known genre joke (light rays, doves, stock skies); the good ones tell the story with one image | [Relevant](https://www.relevantmagazine.com/culture/definitive-ranking-insanely-awesome-christian-album-covers), [Hope Nation](https://hopenation.org/?p=268911), NF in `photo-art-direction.md` | Faith shows through the cross mark and his words, never stock heavenly light |
| | Reach Records' covers come from in-house designers (Kevin Hackett, Jeremiah Bligen) | [Holy Culture](https://holyculture.net/?p=243804), [Rapzilla](https://rapzilla.com/2020-05-christian-rap-creative-designers-holding-culture/) | One designer owning the system (here Dave) keeps it consistent |
| Cover type | Covers show as small as ~64 px in lists; keep one big readable element, test at thumbnail size (third-party guides, not platform specs) | [Orphiq](https://orphiq.com/resources/album-artwork-guidelines), [Made Good Designs](https://madegooddesigns.com/album-cover-design/) | The big number reads at 64 px (checked in the mockup); the frame text is texture |
| | Distributors reject URLs, social handles and promo text on covers; 3000x3000 RGB is the safe size | [CD Baby](https://support.cdbaby.com/hc/en-us/articles/360037660592-Artwork-Requirements), [buycoverartwork](https://buycoverartwork.com/distrokid-cover-art-size/) | No handles, no "out now" on covers; that goes on social posts |
| Gig posters | Hatch Show Print: hand-set wood type and carved blocks, one colour per pass; uneven ink from worn blocks is the appeal | [Hatch Show Print](https://hatchshowprint.com/custom-prints-design), [Grafikens hus](https://www.grafikenshus.se/we-are-using-the-same-type-used-since-it-opened-in-1879-the-hatch-show-print-usa/) | Poster = big condensed type, few inks, imperfect ink. Riso/screen detail: `photo-art-direction.md` |
| Merch | Core sellers: tees, hoodies, hats, totes; tees ~$20-30, hoodies ~$35-50; start print-on-demand, bulk once you know what sells | [Eric Alper 2026](https://www.thatericalper.com/2026/05/29/how-to-sell-merchandise-as-an-independent-artist/), [CD Baby DIY](https://diymusician.cdbaby.com/music-career/how-to-boost-your-merch-sales/) | Three items, not ten |
| | Screen setup ~$15-35 per colour per job, so four colours cost 4x setup; minimums 12-24; under ~20-50 pieces DTG wins | [Printable Press](https://www.printablepress.com/screen-printing-pricing-guide/), [Printful](https://www.printful.com/blog/custom-t-shirts-cost-in-bulk), [AlwaysDoBetter](https://alwaysdobetterllc.com/how-much-does-screen-printing-cost/) | Design every print in 1-2 flat colours. Chrome Logo D can't screen-print as is |
| | Tour dates on the back go back to 1970s rock tees and still sell (AC/DC, Godsmack); printed dates are sometimes wrong (a 2012 Dylan shirt listed a show that never happened) | [Wikipedia](https://en.wikipedia.org/wiki/Concert_T-shirt), [V&A Bowie shirt](https://collections.vam.ac.uk/item/O1781973/serious-moonlight-t-shirt-neon-black), [Godsmack](https://shop.godsmack.com/products/lighting-up-the-sky-tour-tee) | Tour back only for confirmed dates; reorder after changes |
| Social | Story UI covers ~250 px top and ~340 px bottom of 1080x1920 (community measurements, not Meta's) | [inro](https://www.inro.social/blog/instagram-story-size), [socialsizes](https://socialsizes.io/instagram-stories-size/) | Type and stickers inside the middle band |

## 3. The IDENTITY art system (proposal)
### 3.1 Colour
Same four roles as the site's IDENTITY guess era (`DESIGN.md` 3c), so site, covers, posters and posts are one world, plus
two art-only values. **Still a guess until Gabe/Dave send the real IDENTITY colours (about Nov 30).** Ratios computed
(WCAG maths, same as `app.js`):

| Pair | Ratio | Rule |
|---|---|---|
| text `#f6f5ff` on bg `#08044a` | 17.24 | All small text on the ground |
| muted `#bab6e6` on bg | 9.69 | Labels, frame text |
| accent `#a866ff` on bg | 5.33 | Big numbers, dates; passes 4.5 but stays large by habit (the era test only promises 3:1) |
| bg on paper `#f1eee6` (print stock) | 16.08 | Every word on a printed poster |
| accent on paper | 3.01 | **Large only** (photo plate, mark, 24px+ bold). Never small text |
| glow `#8312c8` on bg | 2.56 | **Art only** (a light, a fill), never text; text on glow 6.73 |

Inks: indigo, violet, white (paper-white on dark stock). At a riso studio the nearest drums are Purple (about `#765ba7`,
4.74:1 on paper, OK for text) and Medium Blue; check their swatch. No yellow in IDENTITY: it belongs to the earlier singles.

### 3.2 Type (locked fonts, no third face)
- **Big Shoulders Display 900, caps:** every title, track number, name, date, venue. Fitted lines for lockups (as the site).
- **Atkinson Hyperlegible Next:** 700 caps, tracked +0.12em for small labels (`GLUCAK · IDENTITY`); 400 sentence case for
  the slogan and details.
- No chrome, bevel, outline or glow type (matches DESIGN 3a). On covers: number at least 20% of the cover's height, title
  at least 9%; only the frame text goes below 3%, because it is texture, not information.

### 3.3 Logo use (adds to DESIGN 3a, which stays the rule on the site)
- IDENTITY materials use **Logo D only**. The yellow wings (`logo-new`, `logo-a`) stay on the back catalogue.
- Logo D (chrome, 65% grey wings) goes only on dark solid ground: never on a photo, paper or the accent.
- **Needed: a one-colour vector of the mark** (cross and wings as flat shapes, a thin gap between them) for posters, merch,
  stickers, the favicon. The mockups use a stand-in cut from Logo D's own alpha; Dave or Gabe draws the real one.
- The flaming cross is his stage shirt today: ask whether it's merch he sells, and whether it retires with IDENTITY.

### 3.4 Single-cover template (`art-single-series.webp`)
3000x3000. Constant: indigo ground, a frame band 7% of the width with the title repeated **clockwise, whole words only,
justified to the edge**, a + at each corner (his device, redrawn), a photo window (70% of the inner height) printed in two
inks (violet mid-tones, white highlights, slightly off register) or holding Dave's own art, a solid band with the **track
number** (accent), title (white), `GLUCAK · IDENTITY` and Logo D. Variable per track: photo, number, title. That's it.
At 64 px the number and the photo's shape still read (checked in the mockup).
- **Who makes it:** Dave (it's his job and his tool, Photoshop by the file metadata); we hand him the spec, the fonts and
  this mockup as an offer, not a ruling. Gabe: one photo per track.
- Who I Am and Scenic Route already have art. **We never repaint or tint them** (DESIGN rule); on the site the series is
  carried by the tracklist "sleeve" (3.5) instead.

### 3.5 Tracklist reveal (`art-social.webp`, right)
Square 1080 (4:5: add 135 px top and bottom). `IDENTITY` fitted, `GLUCAK · THE ALBUM · 08.13.27`, a rule, 12 rows of
number (accent) + title, Logo D centred, the frame device round it. **On the site** the Music page uses the same layout as
the album's "sleeve": 12 slots, a released single shows its own cover in its slot, an unreleased one shows number + title in
the frame device, and it fills in by itself as dates pass. Who: we (template + site); Gabe confirms spelling and order.

### 3.6 Show poster (`art-show-poster.webp`) and the site's poster card
18x24 in, two inks on warm white stock. Hierarchy: `GLUCAK` fitted across the top, a rule, `LIVE · THE IDENTITY SHOWS` /
`ALBUM 08.13.27`, a halftone photo (violet plate for tone, indigo plate for deep shadows, off register), the date as a
solid indigo block knocked out to paper, the venue big, `TOWN · TIME · AGES · PRICE`, the slogan, the one-colour mark.
Only the date block, venue and details change per show. The site's poster card (DESIGN: paper = `text`, ink = `bg`) is
this layout, so the printed poster and the card match. Who: we make the file per show from the Shows data; a local riso or
screen shop prints it; Gabe sends the show facts. Paper is ours to pick (about $20-50 at a riso studio, `photo-art-direction.md`).

### 3.7 Social templates (`art-social.webp`, left)
Story 1080x1920: `TONIGHT` (or the day word) fitted, the photo window, venue, town/time/price, one line in his voice, a
space for the link sticker, Logo D + `Rise. Live It Loud.`; nothing in the top 250 / bottom 340 px. Square/4:5 posts reuse
the cover frame (new single, pre-save, show calendar). This could replace his monthly calendar image with one readable
post per week. Who: we build them as fill-in templates (one SVG per format, our sharp script fills it from the shows file);
Gabe posts. Need: does he want to keep making his own, and which app he edits in (Canva templates are an option).

### 3.8 Merch (`art-merch.webp`)
| Item | Graphic | Screens |
|---|---|---|
| Slogan tee | His four phrases as fitted lines, the site's hero lockup, white on black | 1 |
| Mark hoodie | The one-colour mark big on the chest, `GLUCAK` under it, white on navy | 1 |
| Tour-back tee | Front: small mark. Back: `GLUCAK`, `IDENTITY · 2027`, confirmed dates (violet) and venues (white) | 2 |
Who: we draw the files; Dave's mark; Gabe picks items and supplier (DESIGN's shop options); printed on demand first.

### 3.9 Who makes what, what we need
| Piece | Gabe | Dave | Us |
|---|---|---|---|
| Single covers | Photo per track, final titles, track numbers | Makes them (template 3.4 offered) | Spec, fonts, thumbnail check |
| Tracklist reveal + site sleeve | Spelling, order, OK to show before the reveal | - | Builds both |
| Show posters + stories | Show facts, any per-show photo | - | Template, file per show |
| Merch | Items, supplier, budget | One-colour mark | Print files |
| Colour | Real IDENTITY colours or the source file | Same | Re-test 3.1, update the era |

## 4. The mockups (how they were made)
`art-single-series` (193 KB), `art-show-poster` (172 KB), `art-social` (105 KB), `art-merch` (51 KB). Made with sharp and
hand-written SVG: text is set as outlines from our two OFL fonts (fontTools, no kerning, so tight pairs may differ a
little from the browser); halftones are real AM screens computed per pixel at the output size, with uneven ink, skips
and fixed misregistration; paper grain is clumped noise. Photos: Kealey (Gabe-only crops, the pallet cross through a
"green filter" channel mix so the foliage cross reads, no audience faces, the child's area never in a crop) and the MCCC
still at native size; nothing upscaled (the script refuses). Venue, town and tour dates are sample data. Scripts sit in
the session scratchpad, not the repo (owner rule for this task); move them to `tools/art/` if the system is approved.

## 5. Questions for Gabe and Dave (owner sends)
1. Which covers and which logos are Dave's? (Credits, and who owns the system.)
2. Are Who I Am and Welcome Home on IDENTITY? They aren't in the 12-track list (Oct 24 post). Final track order and spelling.
3. Would Dave use a shared single template for the remaining IDENTITY singles? Is Scenic Route's road photo his own or licensed?
4. The real IDENTITY colours (or the cover's source file), and a one-colour vector of the mark.
5. Merch: is the flaming-cross shirt sold now? Which three items first; any supplier already?
6. A per-track photo plan: a shoot for IDENTITY would give the single series its photos (see `photo-art-direction.md` 8).
