# Oversight Supply (supply.madebyoversight.com) as a design-reference source (Researcher, 2026-11-17)

Read only. No login, no sign-up, nothing bought, nothing downloaded. Pages read with WebFetch and Claude in Chrome
(one tab, navigation and one click on a "Details" link only).

## 1. The Reddit post: NOT READ (blocker)
- `www.reddit.com` is refused by WebFetch ("unable to fetch"); `old.reddit.com` is refused by Claude in Chrome
  ("not allowed due to safety restrictions"). A web search found nothing about the thread.
- So **no comment analysis exists**: no other reference sources named by commenters, no "how people feed references
  to Claude", no sales-funnel or licensing criticism from the thread. Not guessed. What we know of the post is only
  the owner's summary (192+ references, 32 free sections, "show Claude a reference and say what you like").
- To close this: the owner pastes the post text and top comments into chat, or opens it in his own browser and shares
  a screenshot. Then add a section here.

## 2. What the site is (read directly)
- Operator: "© 2026 OversightStudio, LLC" (Webflow/Framer template studio). Contact: info@madebyoversight.com.
  Links: /terms, /privacy, /refunds, /pricing. No dedicated license page.
- Catalog (home page): **192 templates to preview**; 18 are "AI-ready" (full prompt you paste into Claude / Cursor / v0).
  Templates sit on Webflow (Stillpoint, Evergrid, Protocol, Lumenis, Legion, Nullify) or Framer (Cherry, Madeline,
  Queue, Pretty, Wings, Daylight). Template categories seen: Therapy & Psychology, Software & SaaS, Business & Finance
  Blog, Design Portfolio, Photography & Video Portfolio, Waitlist, Freelancers & Consultants, Architecture.
  **None are music / artist / event / entertainment templates.**
- **Sections page now lists 70 sections, not 32** (41 free, 29 Pro). The "32" in the post is out of date or counts a
  subset. Each section = live preview + "full source code" + a prompt to paste into Claude Code, Cursor, Windsurf, v0,
  Bolt, Lovable or Replit. Free ones need only a free account ("Sign in, no card, no plan").
- One free full template prompt (Lumenis) is available after sign-in.

## 3. Free vs paid (https://supply.madebyoversight.com/pricing)
| Plan | Price | What it gives |
|---|---|---|
| Free account | $0 | 41 sections (prompt + source), 1 template prompt (Lumenis) |
| Sections | $15/month | All 29 Pro sections, 1 template credit/month, keep what you unlocked, 14-day refund |
| Sections + Templates | $39/month | 3 credits/month, Webflow/Framer files, Figma where available |
| Lifetime | $499 once | Every template + every Pro section, now and future |
| Video plans (separate) | $9.99/mo or $79.99/yr | Claude video skills; not relevant to us |

We need none of the paid tiers (see verdict). Spending is the owner's call (CONTEXT hard rule 4).

## 4. License (verdict: usable on a client site, with caveats)
Verbatim, https://supply.madebyoversight.com/terms (template use section):
> "You may use an unlocked template in your own or a client project, subject to any licence terms supplied with that
> template or its source platform. You may not resell or redistribute the template files or access links, share your
> account, or present the template itself as your own product for sale. Reuse across multiple projects is not promised
> unless the applicable template licence permits it."

Verbatim, https://supply.madebyoversight.com/pricing (license points + FAQ): "Use in your own personal or client
projects." / "No redistribution or resale of the template files." / "No account sharing and no sharing of fulfillment
links." / "Yes — personal and client projects are both fine."

Verdict: a section's code/layout on Gabe's paid site is **allowed** for personal/client projects. Gaps: the terms are
written for *templates*; they say nothing explicit about *free sections* (only "free to copy after signing in"); no
attribution rule stated; "any licence terms supplied with that template" is open-ended. Safest use for us: treat
sections as **visual and structural references** and write our own code in our own stack, which sidesteps the question
entirely and is what our rules need anyway (below). Do not paste their code into the repo without owner OK.

## 5. Fit to Gabe and to our rules
Hard rules: nothing flashes > 3/s, all motion off under `prefers-reduced-motion`; Astro static + plain CSS/JS, CSP
`script-src 'self'` (no third-party scripts, no Framer/Webflow embeds).
- **Format problem:** the 3D sections are tagged "3D & WebGL" (needs three.js or similar, bundled locally; heavy,
  and scroll-flying 3D is exactly the motion reduced-motion must switch off). Source is "AI-builder prompt + code",
  framework unstated; Framer/Webflow templates cannot be embedded at all.
- None of the sections are about EDM/rap/rock/faith, but several are **dark, musician-themed or poster-like**.
- No flashing seen in descriptions; I did NOT run any preview (previews are JS and need a signed-in copy to inspect
  code). Motion safety is **unverified** for every item below; anything we adopt gets our own reduced-motion pass.

## 6. Sections list (what I could verify)
Method: card names and categories from /sections (all 70); one-line descriptions only where the detail page loaded
(URL pattern `/sections/<category>-<name>`, e.g. `/sections/portfolio-vinyl`). The rest I could not describe: their
detail URLs 404'd on my guesses (`hero-*`) and I did not click through all 70. Marked "category only".

Verified descriptions:
| Section | Plan | What it is (site's words, shortened) | GLucak verdict |
|---|---|---|---|
| Vinyl | Free | Musician portfolio hero, dark: turntable that plays a generated beat and lets you scratch | **maybe/use as idea.** Closest to Gabe (DJ/producer, dark). Audio autoplay is a no for us: user-tap only, no autoplay, mute under reduced-motion; the scratch is an interaction not a flash. Concept: a DJ deck on Music page |
| Jewelcase | Pro | Art-director hero: stack of frosted 3D CD cases you scroll, spin, flip (light, WebGL) | **maybe.** Fits IDENTITY CD art (jewel case) but light + WebGL; do a CSS-only 2D flip of the CD art instead |
| Vortex | Pro | Dark 3D hero: 14 curved cards spiral toward a point of light on scroll; cards open to case studies (WebGL) | **no** as built (scroll-flight motion, WebGL). Idea only: release cards as a dark tunnel list |
| Volumes | Pro | 10 3D books fly past, open and flip pages on scroll (light, WebGL) | **no** (motion + WebGL) |
| Pavement | Pro | Poster studio: fly over paper posters, each peels and blows away (light, WebGL) | **maybe idea only.** Poster-like is Gabe's brief, but needs static posters + CSS |
| Collage | Free | Photographer hero: endless collage tied with hairlines, with lightbox (light) | **maybe.** Pattern for a Photos page gallery; lightbox must trap focus and respect reduced-motion |
| Folio | Free | Writer/illustrator hero: magazine whose pages curl as you turn them (WebGL) | **no** (curl animation, WebGL) |
| Desktop | Pro | Dev portfolio: pixel desktop on a meadow with a working terminal (light) | **no** (wrong tone) |

Category only (not opened; judgment from name/category, low confidence):
- Free scroll stories (Studio Original): Signal & Soil, Condensation, Transmission, Florilegium, Joiner, Cyanotype,
  Rootsong, Herbarium, Phototropism, Pigment. Names read as nature/craft; **no** for tone, except Transmission
  ("maybe", a signal/broadcast idea could suit a radio-play "Montco Radio" block; unverified).
- Free heroes: Parlor, Horizon, Murmur. **Unknown**, not opened. Parlor/Murmur could be moody; check by eye.
- Free pricing sections: Studio, Choice, License. **no** (we have no pricing).
- Free "Evergrid" template sections (Home Hero 01, Features 01/02, Use Cases 01, CTA 01, FAQ 01, Navigation 01,
  Footer 01, Blog 01, Contact 01, Team 01, etc.; 22 items): SaaS layout blocks. **no** except Contact 01, Footer 01,
  Navigation 01 as **structure** references for our booking form, footer, nav (low value; plain SaaS).
- Pro: Vessel, Corridor, Plan (portfolio heroes); Meadow, Bloom, Darkroom, Tide, Kernel, Petal, Atlas (heroes);
  Orbit, Fold (scroll stories); Circuit, Strata, Fit, Meter (pricing); 404 pages: 404 Planet, Halo, Receipt,
  Breakout, Scribble, Mosaic, CRT. Mostly **no/unknown**. **Darkroom** (dark? unverified) and **404 CRT / 404
  Mosaic** are worth a glance by eye for a branded 404 (our 404 page must still not flash: CRT noise is a risk).

Count honesty: I verified 8 of 70, not 32. The free-vs-Pro split above matches the site's own listing.

## 7. What we already do (compared)
- `docs/research/ai-design-workflow.md` section 3 item 14: "Feed real references: a named existing site or a DESIGN.md
  from a real brand as a style anchor, then say what to keep and what to change. Never 'make it like X' without saying
  which attributes." **This is already our rule**; Oversight's "show a reference and say what you like" is the same
  method. Also there: 4-directions-then-pick, banned-defaults list, evaluator agent (some proposed, not yet confirmed
  adopted; see that file section 4).
- `docs/research/modern-references.md` and CONTEXT: Wix Music templates, Manafest, Riverside, TFK embed are our
  references. We have **real artwork and photos** as the anchor, which beats any stock reference.
- Gap this site fills: *interactive* section references for specific components (hero, gallery, 404) in a dark/music
  mood. It does not fill the genre gap (no music templates among the 192).

## 8. Workflow change (max 5 rules for the designer agent)
1. **Reference = one image/URL + 3 stated attributes to keep and 1 to change** (layout, type, motion, color). Already
   in ai-design-workflow.md item 14; make it a required field in the designer brief.
2. **References are for structure and feel, never code.** Rebuild in Astro + plain CSS; no pasted third-party section
   code (license is open-ended for sections, CSP forbids scripts anyway). New.
3. **Every reference gets a safety line before use:** motion type, flash risk, reduced-motion fallback, JS/WebGL
   dependency. No WebGL or scroll-flight; 2D CSS substitute. New.
4. **Pick references from our genre first** (dark ground + one accent, poster/gig-flyer, DJ/rap/rock/faith sites);
   use off-genre libraries (Oversight) only for a component pattern (gallery, 404, form). New.
5. **Keep the evaluator pass:** a second agent screenshots the build next to the reference and scores "same
   structure, not a copy." Already proposed in ai-design-workflow.md (#9, #10); confirm adopted.

## 9. Top 5 to study for GLucak
| # | URL | Page + element it would improve | Effort |
|---|---|---|---|
| 1 | https://supply.madebyoversight.com/sections/portfolio-vinyl | Music page: a DJ-deck/turntable interaction to play a track preview (tap to start, no autoplay, still under reduced-motion). Study the look; build ours in CSS + a plain `<audio>` element | M |
| 2 | https://supply.madebyoversight.com/sections/portfolio-jewelcase | Music/Home: IDENTITY CD art as a tilt/flip jewel case. Copy the idea in CSS 3D transform, no WebGL; off under reduced-motion | M |
| 3 | https://supply.madebyoversight.com/sections/portfolio-collage | Photos page gallery with lightbox (hairline-tied collage of Gabe's real photos) | M |
| 4 | https://supply.madebyoversight.com/sections/portfolio-pavement | Shows page: poster-like show flyers as the visual (static posters, hover lift only) | S |
| 5 | https://supply.madebyoversight.com/sections (404 group: CRT, Mosaic, Halo) | Branded 404 in our dark + accent; static only, no scan-line flicker | S |

Owner decisions needed: (a) paste the Reddit thread if he wants the comment analysis; (b) do NOT buy any plan for
this site; the free tier is enough for reference viewing. Signing in for the free sections is an account creation:
ask first.
