# Charles Liu's design reels: tips, playbook, and what applies to GLucak (Laptop researcher, 2026-11-10)

Source: @charles.unemployed (public reels, Sep 17 - Nov 9 2026). Read only: nothing was commented, DM'd, liked or followed.
Transcripts were Whisper, cleaned by hand; "[screen]" marks text or visuals that only appear on screen (read from contact sheets).
His "skills" (unslop, accent) are comment-for-DM lead magnets and are not public. See `docs/research/ai-design-workflow.md` section 1.
That doc covers how to brief an AI agent (4 directions, ban lists, evaluator agent, computed-style tests); this doc does not repeat it.
Not verified: nothing here was run on our site. Hex values in his swatches are too small to read, so colours are named only.

## 1. Per-reel notes (design reels, 17)

**DfPruJSxggG, "Day 1 of Removing AI Slop": age picker (Nov 2)**
Transcript: "This is the age picker AI gives you. Make it draggable and fix the visual hierarchy. Now it looks designed. Animate the transition and add some snapping. Now it feels alive. Add a blur animation and make the font spacing consistent. Now it feels polished. Give it some momentum and make every year click. Now you can't stop playing with it. And bend it into a real wheel."
[Caption lists 13 principles] Fitts's law (whole width drags); visual hierarchy (picked number biggest); Von Restorff (one accent colour, only on the needle); object constancy (numbers slide, not swap); snapping to whole years; motion blur between numbers; natural mapping (older rolls up); tabular figures; animate only the delta (the changed digit); inertia; multimodal feedback (sound per year); hover glow as affordance; skeuomorphism (looks like a real dial).
Teaches: each "polish" step is one named principle; the state before is a purple-gradient slider, the after is a dark dial with one orange needle.

**DfUe1XXx6Jw, Day 2: OTP screen (Nov 4)**
Transcript: "This is the OTP screen AI gives you. Let's clean up the purple gradients and auto-submit. Now it feels trustworthy. Cut the extra words and lose the borders. Now it's really feeling clean. Give an iridescent background and improve the tile contrast. Now it feels premium. Animate the typing and add visual feedback to each state. Now it's satisfying. And auto-fill the code straight from your text."
[Screen] before: lavender card, emoji, "Verify Your Phone Number", "Verify Code" button. After: white card, plain digits, no tile borders, a pale rainbow ring in the corners (iridescent), checkmark on success, red tint on wrong code, one grey checking state.
Teaches: states (typing, checking, wrong, verified) are the polish; remove copy and borders first.

**DfXUrcwhPq_, Day 3: like button (Nov 5)**
Transcript: "This is the like button AI gives you. Fix the visual hierarchy and only make it red when it's liked. Kill the loading spinner and make the updates optimistic. Now it feels snappy. Animate between states and overshoot when you let go. Now it feels playful. Roll the count and give it a sound. Now it feels satisfying. I love people double tap the photo."
[Screen] 128 to 129 as a rolling count; heart outline to red fill; ring on press.
Teaches: optimistic update; neutral until active; the count rolls (only the digit that changed).

**DfcssAvBG7L, Day 4: login screen (Nov 7)**
Transcript: "Cut it to one title and a single CTA. Now it feels clean. It's a flight tracker, so let's add a sky background. Now it feels immersive. Make the corners concentric. Inner radius equals outer radius minus padding. And layer the shadows in the sky's colors. Now the card feels real. Add a plane window logo and some motion. Now it feels polished. And add a slick fly-in animation. Now logging in feels rewarding."
[Screen] before: pink-purple mesh gradient, emoji "Welcome Back", three social buttons. After: pale card on a cloud-sky photo; radius labels 32 / 24 (inner = outer - 8 padding); tags "Elevation", "Skeuomorphism", "Microinteraction", "Shared element transition" (window logo grows into the card).
Teaches: theme the background to the product's world; shadows tinted by the background; concentric corners; one shared-element move.

**DfSbrNrR3Gu, 3-colour palettes (Nov 3, format credit @niki.aroca)**
Transcript: "Dusk blue and midnight navy. It's calm but kinda cool. Add a splash of sunset orange, now people actually click. Oxblood red and apricot glow. It's warm but kinda sleepy. Switch on an electric cyan, now nobody scrolls by. Chalk white and ink black. It's sharp but way too safe. Add a hit of acid green, now it's worth paying for."
[Screen] landing pages: "Done by morning." (blue/navy, orange only in a button and a few dots), "Accent included." (oxblood + apricot, cyan on the button and a halo), "Swings like a person." (chalk/ink, acid green on the drum art). Ends on a "landing-craft skill" card.
Teaches: the accent is small and sits on the CTA or one focal object.

**Dfh2dXSBJII, accent colours again (Nov 9)**
Transcript: "Brown and pale gold. Looks good. Add a little glow and gold. Now you want stay. Lime and black. Already loud. Throw in some hot pink. Now it feels like a festival. Black and ice white. Classic. Add a touch of aurora green. Now it looks worth five figures. Two colours get it right. The third gets it noticed."
[Screen] three sites: "Still Waters" (brown/pale gold, light rays), "Three Days Louder" festival poster (lime/black/hot pink), "Northern Time" watch (black/ice white, aurora-green glow). A music-festival example is the closest to GLucak.

**DfXKRDQRBS_, 20 animation tips (Nov 5)**: the exact numbers are in section 3 (Motion). Transcript as he says it: "Use ease out for entrances. Keep dropdowns at 150 to 250ms. Stagger list rows by 30ms. Scale buttons to 0.97 on press. Stretch moving knobs by 12%. Stagger when details settle. Use arcs for object movement. Use a pulse to confirm success. Use ease in/out for onscreen movements. Start popovers at scale 0.95. Transition in from the trigger, not from the center. Transition out to the trigger. Don't use spring bounce for everyday UI transitions. Don't tween a handheld animation. Make exits about 20% shorter than entrances. Bring the new state in as the old state leaves. Use masks for reveals and colour changes. Crossfade icons with scale and blur. Rubberband past drag boundaries. Reuse the same layout ID across shared objects."
[Screen] before/after demos give the numbers (section 3).

**DfSbDWhR2bi, 20 AI design slop indicators (Nov 3)**
Cleaned: tags and pills; excessive italicised words; Instrument Serif; negative kerning; over-the-top detailed UI; overusing dividers; many colour shades and opacities; containers with borders; overly detailed diagrams; verbose or redundant text; code breadcrumbs; section numbering; eyebrows; dithering; ASCII images; squircles; excessive mono fonts; all-caps subtitles; gradient backgrounds; periods in titles.
[Screen] example per item (e.g. "A better kind of *everyday.*" cream/terracotta with an eyebrow; a blue-purple "Build your first form in minutes" gradient card; red-boxed fainter second sentence = redundant text).
Caption, how to unslop: 1) show it a reference (screenshot a site or two you like, match or combine); 2) share the video with the AI and ask it to turn it into a skill; 3) choose the fonts and colours yourself, have the AI make variants, mix and match, so you own a design system.

**DfaBWoQB1Hk, 20 AI design trends (Nov 6; caption "Honestly i do like most of these trends")**
Cleaned: dithering; ASCII over video; infinite canvases; disco logos; Renaissance branding; Monet backgrounds; dark gradient heroes; pixel loaders; Instrument Serif; the one italic word; cream backgrounds; all-caps eyebrows; pulsing live dots; sparkle icons; liquid glass; three icon cards; decorative flowcharts; endless marquees; squircles; "pretext" text wrapping.
[Screen] "pulsing live dots" = green dot + "Available for work / All systems operational / Live now"; "sparkle icons" = four-point stars on Generate / Rewrite / Summarize; "squircles" = "Smoother than a rounded rectangle."

**DfcnAJFhAa1, 20 ways to unslop (Nov 7)**: list is section 3 (Unslop). [Screen] before/after: filler badges removed; the random italic word un-italicised ("Small studio. Wide-open thinking."); mono only in the code line; spaced groups instead of boxes with arrows; "Cited answers from papers." specific headline; CTA made the loudest thing; a single orange Save; icons made consistent; headline widow fixed ("scales with / you" boxed red); play button sized to the text; "$29.99" with tabular figures and an "ADDED" lime button; a skeleton for an empty table.

**Dfh24cUh4KF, 20 design terms (Nov 9)**
Cleaned: kerning, optical centre, tabular numbers, layout shift, tracking, optimistic update, x-height, touch target, leading, origin-aware animation, OKLCH, widow, safe area, stagger, line length, affordance, combobox, interruptible animation, progressive disclosure, shared element transition.
Caption adds: orphan (lone line stranded at top of next column/page); tinted neutral (grey with a hint of colour so it looks chosen); skeleton screen; ease-out (starts fast, slows to a stop, for anything entering); empty state.
[Screen] one-line definitions: optical centre = "centred by eye, not by math" (a play triangle); tabular = "every digit the same width"; tracking = "even spacing across every letter"; x-height = "how tall the lowercase letters are"; origin-aware = "animates out of what you clicked"; stagger = items animate one after another; interruptible = "can change course mid-animation"; progressive disclosure = "show more only when it's needed".

**DffEWqKhKWo, 22 backgrounds to make designs less flat (Nov 8; no speech)**
[Screen only] felt texture; fluted glass; thermal gradients; water ripples; speckled graphite; single-hue landscapes; blueprint grids; halftone; grainy gradients; grass texture; dithered images; paper texture; contour lines; cloud sky; pixel mosaics; lens distortion; stippled gradients; square-dot grids; blurred photos; iridescent shapes; impressionist paintings; ASCII and pixels.

**DfiPzbkjKdD, "Card Draw Part 1" (other creator, @game_feel_prompts; Nov 9)**
No speech. [Screen] six ways to draw a card: 1 Flip Reveal (leaves deck face-down, flips face-up mid-arc in 0.3s); 2 Center Preview (pops to centre at 150%, holds 0.28s, drops into the hand); 3 Snap Squash (zips in 0.15s, squashes to 120% x 80%, springs back); 4 Hand Ripple (each hand card hops 12px in turn, 0.05s apart); 5 Edge Glow (mint outline pulses, a ring grows 16px and fades); 6 Rarity Shine (shine sweeps the card in 0.25s; rare cards add rays and sparkles).
Teaches: game feel is stacked small timings. Relevance to GLucak: only the principle; 5 and 6 are glow/shine and are off-limits as written (section 5).

**Dd4A1_BRZeo and DdtxTeKxPEX, "resources" playbooks (Sep 29 / Sep 25)**: mostly app business; the design and AI-workflow parts are in section 2 and 4. Said: "AI is fully capable of building an app without needing to be technical, but the reason it usually looks like slop is because it needs someone with taste to guide it." Design resources named on screen: Mobbin (inspiration) and Interface Craft (a short, practical course).

## 2. Things the reels reference, looked up

| Reference | Link | What it is |
|---|---|---|
| Mobbin | https://mobbin.com/ | Searchable library of real shipped app and web screens and flows (onboarding, checkout, empty states). Paid tiers; check the site. His pick for "inspo". |
| Interface Craft (Josh Puckett) | https://www.interfacecraft.dev | Lifetime-access library on micro-interactions, motion and critique by a veteran product designer (Dropbox, Wealthfront). Paid. Podcast: Dive Club, "Crafting interfaces with uncommon care". Site itself was not fetched; details from product listings. |
| Pretext ("pretext text wrapping") | https://tanstack.com/virtual/latest/docs/pretext | Cheng Lou's 15KB TypeScript library (released Mar 2026) that measures and lays out multiline text with Canvas `measureText`, no DOM reflow; used for text flowing around shapes. In his trends list as a fad. CSS `text-wrap: balance/pretty` already covers normal headlines. |
| Instrument Serif | https://fonts.google.com/specimen/Instrument+Serif | Free display serif (OFL, 2023, weight 400 + italic) on Google Fonts. Flagged as the AI default serif. We do not use it. |
| Concentric radius rule | https://jakub.kr/work/concentric-border-radius ; https://30secondsofcode.org/css/s/nested-border-radius | Inner = outer - padding (add border width if any; clamp at 0). Example: 24px outer, 8px padding, 16px inner. A rule of thumb, tune by eye. |
| Shared element / `layoutId` | https://framer.com/docs/layout-animations/ | Motion (ex Framer Motion): same `layoutId` on two elements animates one into the other (FLIP, transforms only). CSS equivalent for us: View Transitions (already on). |
| RevenueCat "State of Subscription Apps 2026" | https://www.revenuecat.com/state-of-subscription-apps-2026/ | Benchmarks for app businesses. Not design; skip. |
| Sub Club, Superwall Podcast, Starter Story, Jake Castillo, Hooked (Nir Eyal), Breakthrough Advertising, $100M Offers, The Cold Start Problem | not looked up | App-growth and marketing resources from the "playbook" reels; not design. |
| AI people he says to follow: Simon Willison, Logan Kilpatrick, Boris Cherny (creator of Claude Code), Thariq | not verified | Profiles seen on screen only. Search found Cherny and Shihipar as Anthropic Claude Code staff via third-party bios; Shihipar's current status is disputed. Not needed for this site. |
| Principles in the age-picker caption | https://lawsofux.com/fittss-law/ ; https://lawsofux.com/von-restorff-effect/ ; https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric ; https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch | Fitts's law, Von Restorff (the odd one out is remembered), tabular figures (`font-variant-numeric: tabular-nums`), OKLCH (perceptual colour). Standard references; links not opened this session. |

## 3. Merged playbook (de-duplicated)

### Colour: two colours + one accent
- Pick a ground and an ink; a third colour is the accent and sits on the one thing you want clicked or noticed (CTA, needle, focal object). "Two colours get it right. The third gets it noticed."
- Accent test he repeats: calm/safe pair first, then a "splash" (sunset orange, electric cyan, acid green, hot pink, aurora green, glowing gold).
- Tinted neutrals: greys carry a hint of the palette hue so they look chosen. Work in OKLCH (perceptual lightness) for steps.
- Cut "colour shades and opacities" (slop #7): fewer tints, one text colour, one muted colour.
- Gradient backgrounds and purple gradients are slop (#19, OTP/login "before"); replace with a theme-real background (sky for flights).
- Good musical pairs on screen: lime + black + hot pink (festival); black + ice white + green glow; brown + gold.

### Type
- Avoid the AI default look: Instrument Serif, one italic word in a headline, negative tracking, all-caps eyebrows and subtitles, excessive mono, periods in titles, section numbers.
- Do: tabular numbers for any number that changes or aligns; optical centring (by eye); even tracking on caps; check x-height when pairing; leading and line length for body; fix widows and orphans (`text-wrap: balance` for headlines, `pretty` for body); specific headline over a vague one; contrast of text.
- Mono only where it is really code or data.

### Layout
- Show the actual product, enlarge the main feature, group with spacing (not boxes, dividers or borders), one title and one CTA per screen, emphasise the CTA, consistent icons, remove embellishment. Concentric corners. Touch targets and safe areas. Skeleton, loading and empty states for every dynamic block. Avoid layout shift. Progressive disclosure.

### Motion (his exact numbers)
| Rule | Number |
|---|---|
| Entrances | ease-out; [screen] 250ms |
| Dropdown / menu duration | 150-250ms ([screen] before 600ms, after 200ms) |
| List row stagger | 30ms between rows (before 200ms) |
| Button press | scale 0.97, 150ms |
| Moving knob (toggle) | stretch 12%, area-preserving |
| Details settling | stagger; [screen] badge trails by 50ms |
| Object movement | arc, not a straight line; [screen] 32px arc |
| Success | one pulse (his words); [screen] label + single pulse |
| On-screen moves | ease-in-out; [screen] 300ms, not linear |
| Popover start | scale 0.95, not 0 |
| Origin | enter from the trigger (transform-origin at the trigger), exit toward it; never fade into the centre |
| Everyday UI | no spring bounce or overshoot (but the like button "overshoots when you let go" as a playful exception) |
| Held/dragged things | don't tween while held; track the pointer directly |
| Exits | about 20% shorter than entrances ([screen] 250ms in / 200ms out) |
| State change | old and new overlap (no blank beat) |
| Reveals / colour changes | use masks (clip) rather than crossfading text |
| Icon swap | crossfade with scale + opacity + blur |
| Drag past a boundary | rubber-band (diminishing resistance) |
| Shared objects | same layout ID so one object expands |
| Other | optimistic updates; interruptible animation; animate only the delta (digit that changed); momentum + snapping; sound per tick (not for us) |

### Backgrounds and texture (22, from the on-screen list)
Felt, fluted glass, thermal gradients, water ripples, speckled graphite, single-hue landscapes, blueprint grids, halftone, grainy gradients, grass, dithered images, paper, contour lines, cloud sky, pixel mosaics, lens distortion, stippled gradients, square-dot grids, blurred photos, iridescent shapes, impressionist paintings, ASCII/pixels. Note: he lists dithering and ASCII as both "less flat" and as slop/trends; the pattern is "texture is fine, the AI-default texture is not". Pick one that comes from the subject (his example: sky for a flight app).

### Unslop checklist (his 20, merged)
Delete filler badges; drop redundant labels; un-italicise the random word; mono only where needed; use a design system; show the actual product; enlarge the main feature; group with spacing; specific headlines; emphasise the CTA; add an accent; consistent icons; remove embellishments; inner radius = outer - padding; contrast; wrap headlines properly; align by eye; tabular numbers; loading states; animate useful feedback only.

### 2026 AI-design clichés (his "trends" + "slop" lists, deduplicated)
Dithering / ASCII over video / pixel loaders; infinite canvases; disco logos; Renaissance branding and Monet backgrounds; dark gradient heroes and gradient backgrounds; Instrument Serif; the one italic word; cream background; all-caps eyebrows and subtitles; pulsing live dots; sparkle icons; liquid glass; three icon cards; decorative flowcharts and over-detailed diagrams; endless marquees; squircles; Pretext-style text wrapping; tags and pills; negative kerning; excessive mono and code breadcrumbs; section numbers; divider overuse; bordered containers; periods in titles; verbose copy.

### How he says to work with AI
1. Show a reference (a screenshot of a site you like), match or combine.
2. Choose fonts and colours yourself; have the AI make variants; mix and match into a design system.
3. Turn the advice into a reusable skill (feed it the video).
4. Iterate one visible step at a time, each step named by a principle ("fix the hierarchy", "make updates optimistic"). Do not stop when it works.
5. Taste guides the AI; AI alone gives slop. (Matches `ai-design-workflow.md` sections 3 and 5; the new bit here is per-step, principle-named prompts.)

## 4. Applies to GLucak

Read first: `CONTEXT.md` hard rules (no flashing, all motion off under reduced motion, no injection, always current); `DESIGN.md` (no shadows, no cards but the release card, exactly two motions on Home, instant colour-swap `:active`); `src/styles/global.css`; `docs/research/art-system.md` and `photo-art-direction.md` (halftone / grain / two-colour print already chosen and owner-approved).

### 4a. Done already
| Tip | Where |
|---|---|
| Tabular numbers | `font-variant-numeric: tabular-nums` on `.identity-when`, `.product-price`, `.tile-meta` (global.css 460, 585, 708) |
| Headline wrapping, widows | `text-wrap: balance` on titles; `p { text-wrap: pretty }` (global.css 101, 340) |
| Optical alignment of big type | `text-box: trim-both cap alphabetic` on the name (global.css 268) |
| Two colours + one accent | `--bg / --text` plus `--accent`; accent used as a fill only (DESIGN.md section 3); era file swaps all three |
| Real photos as the focus, texture | Grain (`--texture`), hatch, graded photos (DESIGN.md 3b; art-system.md) |
| Reduced motion / motion switch | Declared only under `prefers-reduced-motion: no-preference` and `data-motion='on'` (global.css 206, 317; DESIGN.md section 8) |
| Ease-out entrances, short durations | Page view transition 0.2s ease-out (global.css 846-847); heading fade ease-out |
| Pressed feedback | Instant `:active` swap (global.css 797-817) |
| Touch targets | 48px minimum on links and the motion button (global.css 405, 477) |
| Safe area | `--safe-x`, `--bar-h` with `env(safe-area-inset-bottom)` |
| Show the product | Spotify embed near top, latest video, real shows (CONTEXT.md) |
| Empty / loading states | DESIGN.md section 7, `.empty-line` |
| No Instrument Serif, italics, mono, squircles, marquees, liquid glass, sparkle, live dots | none found in `src/` |

### 4b. Worth doing (ranked)
1. **Tint the neutrals from the era.** `--muted #b3b3b3`, `--text #f5f5f5`, `--bg #111111` are pure greys; `--bg-2`/`--line` mix in sRGB. Derive muted/line with `color-mix(in oklch, ...)` toward `--accent`/an era "tint" and give `placeholder.json` tinted values. Lands in `src/styles/global.css` (:root, lines 17-25) and `src/eras/*.json`. Must keep the 4.5:1 / 3:1 tests in DESIGN.md section 3.
2. **Drop filled tag pills where they are not needed.** `.now-tag`, `.quote-tag`, `.tile-tag`, `.v2-tag` (global.css 282, 349, 711, 1021) are the "tags and pills" cliché. Keep "Now" only if the line does not read without it; otherwise make it weight or a plain word. `src/components/Hero.astro:35`, `Quote.astro:9`, `VideoBlock.astro:25`. Owner call (DESIGN.md designer owns it).
3. **Sentence-case the small meta lines.** `.release-meta` is uppercase + tracking (global.css 550) = "all-caps subtitle". The big condensed uppercase display type is a deliberate brand choice and is not on his list; only small meta/eyebrow-size caps are.
4. **Press feedback beyond colour (optional).** His `scale(0.97)` at 150ms for press. D47 chose instant colour swap and "no movement" (global.css 793). Scale is not flashing and is safe, but only add inside the motion-on gate if the owner wants more tactility. `src/styles/global.css` section 16e.
5. **Origin-aware menu.** The mobile Menu sheet should open from the Menu button (transform-origin at the trigger, 150-250ms ease-out, exit about 20% faster, popover start 0.95) and not just appear. Check `src/components/Header.astro` and `.sheet` / `.nav-mobile` in global.css; motion-on gate only. Not verified how it behaves today.
6. **Specific states in the Signup form.** Idle, sending, success, error, each with a plain static message; the success is a text and icon swap, no pulse. `src/components/Signup.astro` and its CSS. Also the admin save bar (`.ed-bar`, DESIGN.md 15i).
7. **Skeletons for the video row and Spotify box** to avoid layout shift: reserve the 352px player-box (already `min-height: 352px`, global.css 326) and the 16:9 thumb; add a flat `--bg-2` placeholder with no shimmer (a moving shimmer is a flash risk and extra motion). `src/components/VideoBlock.astro`, global.css `.v2-thumb`.
8. **Theme the era backgrounds to the subject.** His strongest idea is a background from the product's world. For IDENTITY that is Dave Bahm's artwork plus grain/halftone/two-colour print (already in `art-system.md`), not a gradient. When the IDENTITY colours arrive, add them to `src/eras/identity.json` and check the 2+1 rule: ground, ink, one accent used only on the Listen / Get tickets CTA.
9. **Reduce dividers/borders audit.** 3-4px rules on `.band`, `.site-footer`, buttons (global.css 132, 297, 470). The heavy-border poster look is on purpose, but list them in the designer's next pass and remove any that group things already grouped by space.
10. **Concentric radii** only where there is nesting: the Spotify `.player-box` is 12px outer and the iframe inside is also 12px with no padding (global.css 326, 329), so it is already consistent. Everything else is 2px, so the rule is moot.

### 4c. Does not fit
- **Pulse to confirm success, pulsing dots, edge glow, rarity shine, shine sweep, sparkle, iridescent glow, ripples.** Rule: nothing may flash more than 3 per second and all motion stops under reduced motion (CONTEXT.md hard rule 1). A single, non-repeating, low-contrast change on press is the most that could pass; our existing answer (static colour swap) is the safe default. Never loop a pulse, never animate luminance. Card-draw glow and sparkle rays: no.
- **Sound per tick, haptics, momentum dials, rubber-banding:** no drag UI on the site.
- **Stagger of list rows (30ms):** Home has exactly two motions (DESIGN.md section 8); a stagger is a third. Shows/Music lists could take it later under the motion-on gate, but it is not needed.
- **Hover glow as affordance:** DESIGN.md bans hover animation on cards; we use underline.
- **Skeuomorphic and shared-element showpieces (plane window):** View Transitions already give the page-to-page move; no more.
- **Optimistic updates:** the public site has no mutations. Admin (`/edit/`) could, but accuracy beats speed there.
- **Dithering / ASCII / pixel loaders:** he lists these as clichés; our halftone/grain is for real photographs only and approved by the owner, keep it that way and do not extend to ASCII or dithered video.
- **Mobbin / Interface Craft:** paid; the team already has Wix music templates and its own research (`wix-templates.md`, `modern-references.md`). Mention to the owner only if he wants more reference material.

### 4d. Clichés from his "trends" and "slop" reels that our site currently uses
Checked against `global.css`, `src/components/` and `src/pages/index.astro` only; not a visual review.
- **Tags and pills (slop #1):** yes, four filled-label spans (Now, From Gabe, tile tag, Latest). They are square (2px) not pill-shaped, but the pattern is the same.
- **All-caps subtitles / eyebrows (slop #13, #18; trends #12):** partly. `.release-meta` (uppercase, 0.04em tracking); the vertical `.tab` labels ("Music" above "Rise" in `RiseBand.astro`) work as section eyebrows. The huge uppercase display headings are not the same cliché.
- **Gradient background / glow (slop #19; trends "dark gradient heroes"):** a soft accent radial `.glow` over a dark ground behind the hero (global.css 200-204) is a close cousin of the "dark gradient hero". It is slow (24s drift, opacity .68-.88, no flash) and stops under reduced motion, so it is safe, but it is the one element a reviewer of his lists would flag. The photo-led hero is what separates it.
- **Containers with borders / dividers (slop #6, #8):** moderate; heavy 3px button borders and 4px section rules are a deliberate poster look.
- **Periods in titles (slop #20):** the slogan ends "The Time Is Now." (Hero.astro:30). It is Gabe's own wording from his brief; leave it.
- **Multiple shades/opacities (slop #7):** the hero scrims use many `color-mix` percentages (global.css 232-258). They exist for contrast, documented in DESIGN.md; no action.
- Not present: Instrument Serif, italic accent word, cream background, negative kerning (our tracking is positive), mono, marquee, sparkle, live dot, liquid glass, squircles, three icon cards, section numbers, dithering, ASCII.

## 5. Flashing and motion notes for the team
- Any "pulse", "glow", "sparkle", "shine sweep" or "ripple" tip: do not build as an animation. Show the state change statically (colour, border, text).
- A one-shot opacity or transform change of 150-250ms is fine under motion-on, since it is below 3 changes per second and is gated by both reduced-motion switches.
- Never combine a stagger of bright elements with a luminance change; never loop.
- If a reel idea needs motion, put it behind `@media (prefers-reduced-motion: no-preference)` and `html[data-motion='on']` exactly as `.glow` and the heading fade do.

## 6. Skipped reels (not design/UI/AI-building)
- App-business and money: DdZRxaRRH7p, DdeYnPFx03n, DdoghP_xAkZ, DdrFa3Dxabz. (Dd4A1_BRZeo and DdtxTeKxPEX kept only for the two design/AI-proficiency resource names.)
- Jobs and news: De-F6JnSVEG (layoffs), De-x49IRhtl (Microsoft buyouts), De7G71Kx8a8 (Samsung TV privacy).
- App reverse-engineering / dark patterns (Tinder, Crossy Road, Candy Crush, a microdrama app, Instagram's models): Demh9pux3vf, DeqQs8ztMKE, DerlD7DxnCW, Dew1xuqx0rX, DfUd3XRxaDQ. Only lesson: do not fake ratings or upsell tricks; not relevant to the site.
- Skits with no design content: DfNbFS7Rbg1 ("Evolution of Coding"), DfRVA6EMKJe ("Evolution of software engineering").
- Not fetched this session: other profile reels from 2025 and early 2026 (meta only); none looked design-related from their captions.
