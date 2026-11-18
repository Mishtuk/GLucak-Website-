# Instagram design research, round 2 (Researcher, 2026-11-17)

Source: @charles.unemployed (read only; Chrome was already signed in, nothing was liked, followed, saved, commented or messaged; no dialogs).
Method: opened each reel page, read the caption by scrolling the caption pane and zooming screenshots (the page text is not exposed to the tools, and a DOM read was blocked). Video speech was NOT transcribed; where a point comes from on-screen text it says [screen]. Dates are Instagram's relative ages as of 2026-11-17 (Nov 13-16), not exact.
Not verified: nothing here was run on our site. "Typography hacks" and "design hacks" are his claims, some disputed in comments (noted).

## 1. Already covered in round 1 (skipped)
`ig-design-tips.md`: DfPruJSxggG (age picker), DfUe1XXx6Jw (OTP), DfXUrcwhPq_ (like button), DfcssAvBG7L (login), DfSbrNrR3Gu (3-colour palettes), Dfh2dXSBJII (accent colours), DfXKRDQRBS_ (20 animation tips), DfSbDWhR2bi (20 slop indicators), DfaBWoQB1Hk (20 trends), DfcnAJFhAa1 (20 unslop), Dfh24cUh4KF (20 design terms), DffEWqKhKWo (22 backgrounds), DfiPzbkjKdD (Card Draw 1, @game_feel_prompts), Dd4A1_BRZeo, DdtxTeKxPEX, plus the skipped list in its section 6. Covered elsewhere: `ai-design-workflow.md`, `ig-security-reels.md` (security, not design).
@game_feel_prompts (8.8K followers): grid now shows Card Draw 2, Critical Hit 1, Nitro Boost 1, XP Gem Pickup 2, Water Splash 1, Rare Pull 1, Footsteps 1, Health Bar 1, Harvest 1, Breakable Crate 1. Only titles were read (profile grid); all are game-effect packs (glow, shake, burst), not applicable to a flash-free music site. Not opened, so not counted as "new reels with tips". Principle only: "same action, six variants, pick one".

## 2. New reels found: 8 (all @charles.unemployed, all Nov 13-16)

All URLs: `https://www.instagram.com/charles.unemployed/reel/<ID>/`

### N1. DfsT4vkRM9H, "Fonts that don't look AI-made, part 1" (~Nov 14)
Caption (his lists). Vintage: Editorial New, ABC Arizona, ABC Marist, Concrete, GT Super, Blazeface. Modern serif: Tiempos Fine, Reckless, Signifier, Canela, Luperca, Domaine Display. Soft serif: EB Garamond, Exposure, GT Alpina, Mioya, Tiempos Text, Lyon Text. Soft fun: Gautreaux, Hobeaux, Obviously, Absans, GT Maru, 5by7. AI-looking, skip: Inter, Roboto, Arial, Instrument Serif, Fraunces, Playfair Display. Part 2 followed.
- Workflow: Add a font ban list and a "pick the face yourself first" step. Rule for designer.md: never choose Inter, Roboto, Arial, Instrument Serif, Fraunces, Playfair Display, Geist, Space Grotesk, Bricolage Grotesque, Instrument Sans, JetBrains Mono, Space Mono. Note: most of his picks are paid foundry fonts; we need free ones (Google/Fontshare/Fontsource).
- GLucak: n/a, already done. Display = Big Shoulders Display (condensed poster face), body = Atkinson Hyperlegible Next. Neither is on his skip list. Keep; do not swap. A commenter's counterpoint worth keeping: "a font still has to fit the product and stay readable at small sizes".

### N2. DfuhpYpxM96, "Fonts that don't look AI-made, part 2" (~Nov 14)
Clean Swiss: ABC Diatype, TWK Lausanne, Switzer, Saans, Areal, Strichpunkt Sans. Friendly: Studio Feixen Sans, PP Mori, Aeonik, Degular, GT Walsheim, Circular. A bit of personality: Apfel Grotezk, Aktiv Grotesk, ABC Favorit, Familjen Grotesk, ABC Monument Grotesk, ABC Oracle. Techy mono: ABC Diatype Mono, Sohne Mono, GT America Mono, IBM Plex Mono, Commit Mono, Departure Mono. AI-looking, skip: Geist, Space Grotesk, Bricolage Grotesque, Instrument Sans, JetBrains Mono, Space Mono.
- Workflow: same ban list as N1 (merge into one line). Free ones on his lists usable for us: Familjen Grotesk (Google Fonts, OFL), IBM Plex Mono, EB Garamond.
- GLucak: n/a (already done, see N1). Do not add mono.

### N3. DfsTwyAxO_N, accent colour 1 (~Nov 13)
Caption: "rule of thumb: the accent goes on whatever you're selling". [screen] tangerine + black + cobalt blue: "BOLD ideas" page, the cobalt appears only on the one product image.
- Workflow: designer.md: name the one "thing being sold" per page and give the accent only to it.
- GLucak: Home = the release/Listen CTA is the thing sold; check the accent appears only there and on Shows = "Get tickets". Per `ig-design-tips.md` 4a that rule is already in DESIGN.md section 3 (accent as fill only). Verdict: already done in principle; the check is an audit, S.

### N4. DfuhfgpRQxa, accent colour 2 (~Nov 14; 378K likes, his biggest)
Caption: "the trick is literally just the colour wheel". [screen] sky blue + navy + lemon yellow "POWDER" poster: yellow is the accent and is the complement of the blue. A commenter: "The accent colour does most of the work."
- Workflow: designer.md: choose the accent as the colour-wheel complement of the ground (or its triad), not a random bright.
- GLucak: n/a for the colours (era accent is the owner's/Gabe's choice). Use when the IDENTITY era palette is picked: test the accent against the complement of the cover's main hue.

### N5. DfzqwB3y0vS, accent colour 3: warm/cool rule (~Nov 16; 36.7K likes)
Caption: "warm page = cool accent, cool page = warm accent. that's the whole trick". [screen] bottle green + bone + vermilion ("Spring Season" dance poster), then sand + terracotta with a cobalt accent. Comments: "I like the ones with 2 colors not 3"; "the last one looks like typical thing AI generates" (764 likes; shows taste is split).
- Workflow: designer.md: "State the page temperature (warm or cool), then pick an accent of the opposite temperature." Gives an objective test the evaluator agent can run.
- GLucak: Home/era files: our ground is near-black neutral (`--bg #111111`), accent per era. Add a one-line check in DESIGN.md section 3 that the era accent is opposite in temperature to the era's dominant photo colour. S, docs only.

### N6. DfxOT_IyBP7, accent colour 4 (~Nov 15)
Caption: "the gelato one gets me every time". [screen] blush pink + deep wine + kelly green accent on the model's glasses and jacket ("MIRAGE" page); narration "the glasses first" = accent lands on the focal object.
- Workflow: same as N3; the accent goes on the focal object (an image detail or the CTA), never on body text or chrome.
- GLucak: n/a (covered by N3).

### N7. DfxOhZmyLXz, "10 Niche Design Hacks" (~Nov 15; 16.4K likes). Caption is a paste-into-your-agent rule list
Verbatim rules (short): nested corners = inner radius is outer radius minus padding; borders use alpha colours like `rgb(0 0 0 / 0.12)` not solid hex; palettes in OKLCH not HSL; gradients "in oklch" (e.g. `linear-gradient(90deg in oklch, blue, orange)`) so the middle does not go grey; icon stroke width matches the weight of the adjacent text; carousels fade their edges with `mask: linear-gradient(90deg, transparent, black 15% 85%, transparent)`; icon swaps blur the outgoing icon as it fades (`filter: blur(4px)`); dark mode shows depth with lighter surfaces because shadows barely show; full-height sections use `100dvh` not `100vh`; product shots on white use `mix-blend-mode: multiply`. Comments: multiply "also drops your product/image's highlights"; the 100dvh tip "saves so many mobile hero sections".
- Workflow: coder.md: adopt the rule list as a CSS checklist (see rules below). The "Give this to your AI agent:" caption format is the useful pattern itself: short, testable, CSS-level rules beat adjectives.
- GLucak: already done: `100dvh` (global.css 88; `100vh` only as a fallback and the off-screen skip link), `color-mix(in oklch ...)` for `--bg-2`/`--line` (26-27), lighter surfaces instead of shadows (DESIGN.md: no shadows). Gaps: (a) video row `.v2-vrow` (global.css 1062) is a horizontal swipe row with hard edge clipping, so a mask edge-fade is possible, but it is a still row on a site with its own look, low value; (b) borders use `--line` mixes, fine; (c) icon stroke vs text weight on the 3-4px arrow mask icons (global.css 476): the arrow is a fixed `stroke-width 4` next to weight-700 text, check by eye. (d) product images on the shop: `mix-blend-mode: darken` already used on the hero image (398); shop shots are not white-background, n/a.

### N8. Dfzq7tSSEER, "10 Niche Typography Hacks" (~Nov 16; 1.6K likes). Caption: paste-into-agent typography rules
Verbatim rules (short): tabs reserve the bold width (`.tab::after { content: attr(data-text); font-weight: 700; visibility: hidden }` in an inline-grid, so selecting does not shift layout); labels and buttons `text-box-trim: trim-both; text-box-edge: cap alphabetic`; links `text-underline-offset: 0.2em` so underlines clear g and y; superscripts `sup { line-height: 0; position: relative; vertical-align: baseline; top: -0.5em }`; headlines `font-size: clamp(2rem, 1rem + 5vw, 4rem)`; acronyms `font-variant-caps: all-small-caps`; quotes and apostrophes always curly, never straight; file names truncate in the middle (flex row, `.ext { flex-shrink: 0 }`); narrow columns `hyphens: auto` with `lang="en"` on `<html>`; card titles cap at two lines with `-webkit-line-clamp: 2`. Comments: the first suggestion (reserved bold width via hidden copy) "seems awful for accessibility" (5 likes; not tested, the hidden text is `visibility: hidden` so it is out of the a11y tree, so likely fine); another: "basic reset.css".
- Workflow: coder.md rule: the typography checklist, as a pre-flight grep. Curly quotes and apostrophes are a cheap automated check.
- GLucak: already done: `text-box: trim-both cap alphabetic` (global.css 126, 282, 284, 328), `text-underline-offset` throughout, `clamp()` type scale (34-36), `hyphens: auto` on poster text (994), `lang="en"` on `<html>` (dist/index.html), two-line clamp on video titles (v2.css 47), no sup. Not done / unchecked: (a) curly apostrophes: `dist/index.html` visible copy was only spot-checked (matches like `e'l`, `u'r` are likely inside JSON/attributes, not verified), so run a one-off check on `src/pages` and `docs/copy` for straight `'` in visible text; (b) `font-variant-caps` n/a (no acronyms in small text); (c) nav tab shift on current-page: we show current page with underline, not bold, so n/a.

### Skipped from the profile grid (not design)
DJrbdK7hugY ("I left my job" intro/announcement), DIWt7j-O40r (pinned, "I just left my $300k/year" intro). Both older/personal.

## 3. Checked against our site (what is already there)
Files: `dist/index.html`, `src/styles/global.css`, `src/styles/v2.css`; `docs/review/` holds only `.md` reports and an `r1-stress` folder (no loose .png at top level), so no new screenshots were viewed. Existing plan docs I did not re-read: `docs/review/round-ig2-plan.md` (check it before building anything below; it may already schedule some of these).
Already done: dvh, OKLCH mixes, tint var, text-box trim, underline offsets, clamp scale, hyphens + lang, line-clamp, no shadows, fonts off his skip lists, one accent as fill.

## 4. Proposed agent-rule additions (max 8)
1. designer.md: "Never use Inter, Roboto, Arial, Instrument Serif, Fraunces, Playfair Display, Geist, Space Grotesk, Bricolage Grotesque, Instrument Sans, JetBrains Mono or Space Mono; pick a face from Google Fonts/Fontshare yourself and have the evaluator confirm." (N1/N2: "the AI-looking ones to skip".)
2. designer.md: "Name the one thing the page sells; the accent colour goes only on that (CTA or focal image), nowhere else." (N3: "the accent goes on whatever you're selling"; N6: "the glasses first".)
3. designer.md: "State the page temperature; make the accent the opposite temperature (warm page = cool accent) and prefer the colour-wheel complement." (N5: "warm page = cool accent, cool page = warm accent"; N4: "just the colour wheel".)
4. designer.md: "Write design rules as short testable CSS lines, not adjectives; end every brief with 'Follow these rules in every UI you build:'." (N7/N8 "Give this to your AI agent" caption format.)
5. coder.md: "Inner radius = outer radius minus padding; borders as alpha colours; gradients with `in oklch`; icon stroke = adjacent text weight; `100dvh` never `100vh`." (N7 caption: "make the inner radius the outer radius minus the padding".)
6. coder.md: "Labels and buttons use `text-box: trim-both cap alphabetic`; links `text-underline-offset`; headlines `clamp()`; narrow columns `hyphens: auto` with `lang` on `<html>`." (N8 caption.)
7. coder.md: "Curly quotes and apostrophes in all visible copy, never straight; grep for them before handing off." (N8: "always curly, never straight".)
8. evaluator/designer.md: "Count the colours: two plus one accent; reject a third mid-tone and any 'safe' palette with no accent." (N5 comment-consensus and round 1 "two colours get it right".) Caveat from comments: taste splits, so the owner decides.

## 5. Top 6 site changes, ranked
All must keep: no flashing above 3 per second; any motion off under `prefers-reduced-motion` and `html[data-motion]` off. None below adds motion except 5.
1. **All pages, visible copy: straight to curly quotes/apostrophes** (`src/pages`, components, `docs/copy`). Effort S. Hard-rule check: n/a (text only). Verify first with a grep; it may already be done.
2. **DESIGN.md section 3: add the "accent only on the thing sold" and "accent temperature opposite the era photo" checks**, then audit Home (Listen CTA), Shows (Get tickets) and Music for any accent use elsewhere. Effort S. Hard-rule check: n/a.
3. **Arrow icon (global.css 476, link arrow mask)**: check by eye that stroke weight matches the weight-700 text beside it; adjust the SVG `stroke-width` if it looks heavy. Effort S. n/a.
4. **IDENTITY era palette (`src/eras/identity.json`) when the colours arrive**: pick the accent as the complement of the cover/logo's dominant hue, check the 2+1 rule and the 4.5:1 / 3:1 contrast tests. Effort M. n/a (static colour).
5. **Video row `.v2-vrow` (global.css 1062), phone swipe row**: edge-fade mask on the right edge to show it scrolls. Effort S. Static mask, no animation; scroll itself is user driven. Low value; skip if the swipe affordance is already clear.
6. **Fonts: no change.** Record in DESIGN.md that Big Shoulders Display + Atkinson Hyperlegible Next were checked against his 2026 skip lists (they are not on them) so nobody swaps them. Effort S.
Not recommended: his reserved-bold-width tab trick (we have no bold-on-select tabs), `mix-blend-mode: multiply` for product shots (no white-background shots), glow/shine ideas from @game_feel_prompts (flash rule).
