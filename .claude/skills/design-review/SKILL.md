---
name: design-review
description: Review a GLucak page or round with a scored critique (Nielsen 0-4 rubric, audit /20 with P0-P3) and the craft floor, from screenshots at 390 and 1280 in both motion states. Use after any UI change, before the boss gate, or when the owner asks to review / critique / audit the design.
---
# GLucak design review

The reference files are vendored, unchanged, from impeccable (github.com/pbakaus/impeccable, Apache-2.0, see
`reference/LICENSE-impeccable`): `critique.md`, `critique-rubric.md`, `audit.md` and `craft-floor.md`. Read the one you need.

## Our overrides (they win over the reference files)
1. **No impeccable tooling is installed.** Skip every step that runs `scripts/impeccable` (detect, live-server, detect.js,
   audit-storage, hooks) or asks to install it. Assessment B uses OUR evidence instead: screenshots, `npm test`, and the
   a11y / perf tools in `tools/`.
2. **Evidence:** the built site (`npm run build && node server.js`, or `dist/`), screenshots at **390x844 and 1280x800**, each with
   motion on and with `prefers-reduced-motion: reduce`, saved to `docs/review/<round>/`. Look at them yourself, do not guess.
3. **Hard rules beat the rubric:** nothing flashes more than 3 times a second, every animation is off under reduced motion (Gabe is an
   epilepsy survivor), no HTML / SQL injection, every section one click from the nav. The craft floor's "motion" line
   (blur, clip-path, mask) applies only inside those rules.
4. **DECISIONS.md rulings win over "Refuse" items.** Where the floor bans something a D-ruling chose (e.g. the section word on the
   rule, D79 / D87), report it as a conflict for the boss; don't change it.
5. **Real photos only** (owner): no stock, no generated images, no AI upscaling.
6. Output: the critique / audit report as the reference files describe, saved as `docs/review/<round>/design-review.md`, ending
   with P0-P3 fixes (file:line, the change). No edits to site code: the reviewer reports, the coder fixes, the boss gates
   (pass = no P0 / P1, no craft-floor FAIL, reduced-motion set intact). At most 2 fix rounds, then the boss decides.
