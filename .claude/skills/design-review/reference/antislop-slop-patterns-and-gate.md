Source: miqdadbadjuber/anti-slop/skills/antislop/SKILL.md lines 129-220 and 619-700 (R-numbers refer to the source's rules, not vendored) @ 57b92d497a67c226b060b71c6f263c8631f37da4, MIT, stripped per docs/research/repo-safety-log.md (frontmatter, tool lists, run/push/self-edit lines removed). Our overrides in SKILL.md win.

## Part 1: AI Slop Patterns (Warning Signs)

These are the most common patterns found in AI-generated designs. Use this table to **audit** your output: scan for clusters, then ask each one "what does this serve?" A single pattern from this list is fine if it serves a purpose, unless a **Hard Gate** rule in Part 2 forbids it (R-02, R-03, R-17, R-18, R-23 to R-28, R-32 to R-40). What makes a design slop is many of these appearing together with no reason. This is a **diagnostic scan, not a ban list**: Part 1 itself bans nothing, but the Hard Gate rules in Part 2 are absolute, and every other pattern must pass the purpose test (Part 2, Purpose-Gate group).

### Visual & Color

| Pattern | Telltale Signs |
|---------|---------------|
| **Generic Blue-Purple Gradient** | Blue to Purple, Blue to Cyan, Purple to Pink, full-page colored glow background |
| **Excessive Glassmorphism** | Blur on navbar, cards, modals, sidebar all at once |
| **Excessive Border Radius** | Every element is pill-shaped: buttons, inputs, cards, badges, modals |
| **Overly Soft Shadows** | Every component has a large shadow, the whole page feels like it's floating |
| **Glow Everywhere** | Glow on cards, buttons, icons, badges, backgrounds, and borders all at once |
| **AI Default Palette** | Harsh or rainbow gradients, purple-and-black schemes, neon accents, pastel blocks, radial orbs, used as the default color treatment |
| **Background Grid** | Grid squares, blueprint lines, graph paper, dot grids, thin horizontal/vertical lines |
| **Too Much Decoration / Trend-Stacking** | Blob, mesh gradient, glow, noise, pattern, grid with no purpose, especially when multiple trends are stacked (e.g. Glassmorphism + Mesh Gradient + Glow + Monospace + Grid + Rounded UI) |
| **Dark Mode Default for No Reason** | Entire page is dark just because it looks "tech", with no branding consideration |
| **Too Many Colors in Palette** | Using 5-7 different colors on one page without a clear design system |
| **Excessive Accent Color** | One accent color on buttons, icons, badges, links, lines, backgrounds, and glows |
| **Sterile Default** | Flat white/near-white, thin grey borders, small radius, no texture, generic font, no identity. The "safe result" of over-filtering without direction |
| **Skeleton Preview as Product Shot** | Grey placeholder bars / skeleton blocks used as the "product screenshot" in the hero or feature areas |

### Layout & Components

| Pattern | Telltale Signs |
|---------|---------------|
| **Monotonous Layout** | Hero, Subtitle, 2 CTAs, Screenshot, Feature Grid, Testimonials, FAQ, CTA, Footer |
| **Copy-Paste Feature Cards** | Identical size, height, icon, layout, and padding across all cards |
| **Bento Grid** | A mosaic of differently-sized cards filling a section, the default "app-like" layout |
| **Fake Terminal Window** | A styled terminal window with typed-out commands as the hero or feature visual |
| **Uniform Spacing** | Padding, margin, and element gaps are identical across every section |
| **Broken Mobile** | Horizontal overflow, cards clipping off-screen, broken navbar, colliding text |
| **Template Animations** | Every element uses Fade Up, Fade In, Floating, Scale, Bounce |
| **"How It Works" Always 3 Steps** | Round icon + number 1, 2, 3 + short text, always three steps, always the same |
| **"Trusted By" Logo Bar** | Row of generic company logos placed directly below the hero |
| **"Most Popular" Pricing Card** | Middle tier always highlighted with a capsule badge |
| **3 Pricing Tiers** | Always three columns whatever the real pricing structure, with the middle tier highlighted |
| **4-Column Template Footer** | Product / Company / Resources / Legal columns with no variation |
| **Uniform Section Rhythm** | Every section is the same composition: centered title + subtitle + identical card grid, with no variation between sections |
| **Alternating Background Only** | The only variation between sections is flipping the background color every other section |

### Copywriting & Content

| Pattern | Telltale Signs |
|---------|---------------|
| **Em Dash (—)** | "Fast, secure — and built for developers." |
| **Generic CTAs** | Get Started, Learn More, Try Now, Explore, Discover |
| **AI Marketing Buzzwords** | AI Powered, Revolutionary, Next Generation, Seamless, Cutting Edge |
| **Fake Statistics** | 10K+ Users, 99.9% Uptime, 500M Requests, 120+ Countries |
| **Fake Testimonials** | AI avatars, random names, random job titles, fictional reviews |
| **Fabricated Trust Claims** | "SOC 2 compliant", "ISO 27001", "Enterprise-grade security", "300% faster" for a product with no such evidence |
| **Demo Without a Product** | Sells a product that is never shown working: no real demo, no Terms of Service, no Privacy Policy |

### Decorative Elements

| Pattern | Telltale Signs |
|---------|---------------|
| **Generic AI Icons** | Sparkle, Star, Magic, Lightning, Diamond, Cube, Robot, AI Orb |
| **Lucide Icons** | Every icon from the same thin-stroke rounded library (Lucide or a clone), the default icon-set look |
| **Colored Left Stripe** | A thin colored vertical bar on the left edge of cards, rows, or section headers, as decoration |
| **Small Arrows (→ / ↗)** | Placed on almost every button as pure decoration |
| **AI Capsule Badges** | Pill shape, thin border, glow, small dot, uppercase, containing: "AI Powered", "Beta", "New" |
| **Eyebrow Badge Above the Headline** | A small pill parked directly above the H1, often with a dot and a thin border, holding a category label the headline already says |
| **Generic AI Typography** | Large monospace headings, HOW IT WORKS uppercase with wide tracking |
| **Typeface Chosen Without Reason** | Font picked because it's the AI default, not because it fits brand character. Popular fonts like Inter are still valid if there's a reason |
| **Generic Illustrations** | Undraw, Storyset, or 3D blob characters with no real connection to the product |

### Functionality & Content

| Pattern | Telltale Signs |
|---------|---------------|
| **Non-Functional Interactive Elements** | Buttons do nothing, dropdowns won't open, forms can't be submitted. AI builds the visuals but forgets the logic |
| **Happy Path Only Design** | No empty state, loading state, or error state. UI looks perfect in screenshots but isn't ready for real use |
| **Irrelevant FAQ** | FAQ contains generic template questions ("Is my data secure?", "Can I cancel anytime?") with no real relevance to the product |
| **Assumed Logo & Profile Photos** | Creating app logos, avatars, or profile photos without explicit instructions, generated purely on assumption |
| **Navbar Links to Nowhere** | Navbar contains links to pages (Features, Contact, About, etc.) that have no actual section or page |
| **File/CSS Patching via Script** | A feature (e.g. dark mode) added by an external script that rewrites source or CSS with string replacement. Signs: a `.py`/`.js` helper doing `str.replace` on `.css` files, "patch" scripts left in the repo |

### Identity & Originality

| Pattern | Telltale Signs |
|---------|---------------|
| **No Visual Identity** | Swap the logo and the design still feels the same; could belong to any product |
| **Clone of Popular Products** | Overall visual that mimics Linear, Vercel, Stripe, Notion, or other popular products without being asked |

### Accessibility

| Pattern | Telltale Signs |
|---------|---------------|
| **Poor Color Contrast** | Grey text on grey background, white text on a gradient that's light in some areas. Looks fine visually but fails WCAG |
| **Not Keyboard Navigable** | UI can only be used with a mouse. Interactive elements can't be reached with Tab, no visible focus state |


## Delivery Gate (Mandatory)

Run this gate BEFORE delivering. Output its status with your deliverable as a **PASS/FAIL report**: one line per item, and every `PASS` backed by concrete evidence (e.g. "R-26 PASS: every button has a real `href` or `onClick`; no dead controls", "R-35 PASS: ran the build and clicked every control: Signup -> /signup, empty form -> validation, mobile menu -> opens, no console errors").
If any item is **FAIL** (or any answer is **yes**), do not deliver: fix it first, then re-run. A report containing a FAIL must never be shipped.


The gate has four blocks: Hard Gate (absolute), Purpose-Gate (technique + written reason), Liveliness (dials + levers), Craftsmanship & Quality Locks (C-1..C-5 plus the consistency locks R-05, R-11, R-15, R-16, R-20, R-21, R-29, R-30, R-31).

### Block 1: Hard Gate (absolute)

Before declaring the design done, answer every question below. All answers must be **no**:

- [ ] Is there an em dash (`—`) anywhere in the text, outside the R-02 carve-out and any voice sample the owner approved under R-37? *(R-02)*
- [ ] Is there any horizontal overflow, text escaping its container, or broken layout on mobile? *(R-03)*
- [ ] Are there any statistics without a real source (10K+ Users, 99.9% Uptime, etc.)? *(R-17)*
- [ ] Are there any fictional testimonials (AI avatars, random names or job titles)? *(R-18)*
- [ ] Were any visual assets (logo, avatar/profile photo, statistics, testimonials, or navigation structure) created without explicit instructions or confirmation, and without an honest placeholder? *(R-23)*
- [ ] Are there navbar links pointing to sections or pages that do not exist? *(R-24)*
- [ ] Is there any text with contrast below the WCAG AA standard (4.5:1 for normal text, 3:1 for large text)? *(R-25)*
- [ ] Are there any buttons, dropdowns, or forms that do nothing, with no real behavior and no `// TODO` + visible label? *(R-26)*
- [ ] Does the UI lack an empty state, loading state, or error state? *(R-27)*
- [ ] Does the FAQ contain generic questions that are not relevant to the product? *(R-28)*
- [ ] Can the UI not be navigated by keyboard (Tab, Enter, Escape) or is there no visible focus state? *(R-32)*
- [ ] Was any feature added by patching source/CSS with an external script instead of writing it in source? *(R-33)*
- [ ] If a theme toggle exists, does one mode (light or dark) break styles, fonts, or layout? *(R-34)*
- [ ] Was the app delivered without being run or built, or without a recorded click-through of every interactive element? *(R-35)*
- [ ] Are there any fabricated security, compliance, performance, or customer claims? *(R-36)*
- [ ] Was the design built without direction and not labeled *"draft without direction"* with honest default dials ENERGY 1 / RHYTHM 1 / MOTION 1? *(R-37)*
- [ ] Is there any realistically-styled content that was fabricated (testimonials, features, statistics, ghost links, fictional team) without a real source? *(R-38)*
- [ ] Does any control lack `cursor: pointer`, a native element, an accessible name, or hover/active/disabled states; any field a visible label or image its `alt`; does motion ignore `prefers-reduced-motion` or run longer than 5 seconds without a pause control; does ARIA contradict the native role; or does a whole document lack `lang`, `<title>`, or landmarks, or block zoom? *(R-39)*
- [ ] Does any media element ship without dimensions, any late content without reserved space, the hero image load lazily or without `fetchpriority="high"`, a third-party script block render in `<head>`, or a performance number get reported that was not measured? *(R-40)*

### Block 2: Purpose-Gate (technique allowed, reason required)

For each technique, the technique itself is allowed. FAIL if it appears as a default without purpose, or if the reason is not written down:

- [ ] Do gradients/glows appear as a default with no stated hierarchy or brand purpose? *(R-01)*
- [ ] Are there generic icons (sparkle, star, magic, lightning, diamond, robot, orb), an icon set picked for its library look (Lucide-style), or icons irrelevant to their content, with no written relevance? *(R-04)*
- [ ] Is there a large monospace font, uppercase label with wide tracking, or a typeface chosen without a written brand-character reason? *(R-06)*
- [ ] Is there a background grid, blueprint, graph paper, or dot pattern without a written visual-identity purpose? *(R-07)*
- [ ] Are arrows (`→` / `↗`) placed on almost every button purely as decoration, with no written purpose? *(R-08)*
- [ ] Are there capsule badges ("AI Powered", "Beta", "New", "Secure", "Fast") with no real function, the full capsule + thin border + glow + uppercase combination, or a pill parked above the H1 holding a label the headline already says? *(R-09)*
- [ ] Is glassmorphism applied to more than 1-2 elements simultaneously (navbar + card + modal + sidebar)? *(R-10)*
- [ ] Is a large shadow applied to every component, with no written elevation reason, making the page feel like it is floating? *(R-12)*
- [ ] Is glow applied to cards, buttons, badges, icons, backgrounds, and borders simultaneously? *(R-13)*
- [ ] Do all feature cards have identical size, icon, padding, and layout, with no written hierarchy reason? *(R-14)*
- [ ] Do all elements use template animations simultaneously (Fade Up + Floating + Scale + Bounce) without a written UX purpose, or does the motion contradict the declared MOTION dial? *(R-19)*
- [ ] Are there generic illustrations (Undraw, Storyset, 3D blob) with no written product connection? *(R-22)*

### Block 3: Liveliness (required to be alive, not just clean)

All answers must be **yes**:

- [ ] Are the dials set and explicit (ENERGY / RHYTHM / MOTION declared)?
- [ ] Is the output consistent with the claimed dials? (RHYTHM 3 but uniform sections = FAIL)
- [ ] Is there at least one clear focal point per screen?
- [ ] Is whitespace structural (used to separate and set rhythm), not leftover?
- [ ] Is there one deliberate accent (not zero, not everywhere)?
- [ ] Is there an identity motif (one specific, repeated pattern, gesture, or typographic voice)?
- [ ] Was a Design Read declared before generation?

### Block 4: Craftsmanship & Quality Locks

All answers must be **no**:

- [ ] C-1: Is there any visual or copy decision whose only justification is "it's the AI default"? *(Intentionality)*
- [ ] C-2: Does any interactive element do nothing, with no clear label? *(Functional Completeness)*
- [ ] C-3: Does any section exist only to fill an AI template, not to serve the product's content? *(Content-Driven Composition)*
- [ ] C-4: Does the UI break in any state, theme, breakpoint, or without a mouse? *(Resilience)*
- [ ] C-5: Is any testimonial, statistic, or claim fabricated? *(Evidence Over Claims)*
- [ ] Does the layout follow an AI template (generic Hero+cards, "How It Works" always 3 steps, "Trusted By" logo bar, bento-grid mosaic, fake terminal window, 3 pricing columns, 4-column footer with no variation, uniform section rhythm), or does the section rhythm contradict the declared RHYTHM dial? *(R-05)*
- [ ] Are all elements (buttons, cards, inputs, badges) made pill-shaped with no radius variation? *(R-11)*
- [ ] Are CTAs still generic (Get Started, Learn More, Try Now, Explore, Discover)? *(R-15)*
- [ ] Are there any AI marketing buzzwords (AI Powered, Seamless, Revolutionary, Cutting Edge, etc.)? *(R-16)*
- [ ] Does the design still feel generic even if the logo and product name are swapped? *(R-20)*
- [ ] Was dark mode forced as a default without a branding/user reason, or was a required light/dark toggle deferred with an excuse? *(R-21)*
- [ ] Does the color palette exceed 2-3 core colors + 1 accent without a clear design system? *(R-29)*
- [ ] Does the overall design look like a clone of another popular product (Linear, Vercel, Stripe, Notion, etc.)? *(R-30)*
- [ ] Is there any major visual decision (color, layout, typography, spacing, cards, illustration) whose reason cannot be written in one line? *(R-31)*

If even one answer is **yes** (or **no** in Block 3), do not deliver. Fix it, re-run the gate, and only then ship. Delivery without a clean gate is a failure.
