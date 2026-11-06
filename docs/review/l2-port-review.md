# L4 review: the Desktop's L2 port (3844472)

Laptop boss, 2026-11-06. Spec: DESIGN.md sections 14 and 15, section 11 "Port of L2"; reference `prototype/shop.html`,
`edit.html`, `admin.js`; D41, D42. Screenshots: `docs/review/l2-port/`.

## Verdict
**Approved, with two fixes.** F1 must land before the owner switches `SHOP_ENABLED` on. F2 must land before Gabe gets the
edit screen. Neither blocks other work, and nothing fans can see today is wrong.

## How it was checked
- `npm ci` and `npm test` on the Laptop (Node 24): build OK (7 pages), **99/99 pass**.
- `server.js` was run with `SHOP_ENABLED=1 DEV_EDITOR=1`, a temp `DATA_DIR` and its own port, then stopped by its PID. Headless
  Chrome over DevTools gave true 390x844 and 1280x800 viewports. Four product sets were used: the shipped samples; a mixed
  set with one of each status, a free item, an `<img onerror>` name, a `<b>` description and a `javascript:` link; a D42
  set; and an empty list. The shows were future, open mic and past.
- On every page and state the script checked sideways scroll, the smallest visible text, every target under 48px,
  `document.getAnimations()` (also with `prefers-reduced-motion: reduce`), text contrast against the real background,
  and the console.
- **CSS is word for word.** The prototype's L2 "Shop" block and `src/styles/global.css`, diffed with whitespace ignored,
  differ by one blank line. The prototype's "Admin console" block and the `<style is:global>` in
  `src/pages/edit/index.astro` are identical.

| Check | Result |
|---|---|
| Sideways scroll | 0 everywhere (shop samples, mixed, empty, 3 details; edit shows / products open, upload, error row; 390 and 1280) |
| Smallest text | 16px, nothing under it |
| Contrast | Lowest text 5.71:1 (accent buttons). Field borders 7.68:1 against `bg-2`. Nothing under 4.5 (3 for large) |
| Targets under 48px | None (the radio inputs are measured by their 52px label row and the file input by its overlay label, as in 15g) |
| Animations | 0 on /shop/ and /edit/, with normal motion and with reduced motion. The tape is a static rotation |
| `:target` | No hash: 0 details shown. `#product-<id>`: exactly 1, with a `text` top edge, 102px from the top at 390 |
| Buy on the first screen (390) | Buy bottom 475, note bottom 535, phone bar top 782 |
| Statuses | sample -> `is-coming-soon` + tape Sample, no price; available + link -> `is-available` + price; available without a link -> `is-coming-soon`; sold-out -> `is-sold-out` + tape Sold out + grey picture; price 0 -> "Free" |
| Injection | `<img src=x onerror>` in a name shows as text (0 `img[src=x]`). `<b>` in a description shows as text. A product with a `javascript:` link is dropped from the page. An API save of `<script>…' OR 1=1 --` comes back escaped on /shop/ (`&lt;script&gt;`, no raw tag). The edit screen refuses a `javascript:` link on that row ("The link has to start with https://…"), and the row opens with the paper "!" |
| Card `alt` / detail `alt` | `""` on cards; the detail uses the name, escaped |
| Admin rows | Collapsed; Edit sets `aria-expanded` and focuses the first field; Move up is disabled on the first row and Move down on the last; past show = dashed border + muted text + "Played" tag; product meta shows the glyph + word, and no price for samples |
| Save guard | With the POST held, three Save clicks sent **one** request; `aria-disabled="true"`, "Saving…" (busy), then "Saved. It's on the site now." (ok) and the guard released |
| Upload | With the POST held, "Uploading…" (busy). Released: "Uploaded. Press Save to keep it." (ok), the path field filled, the thumbnail and the 120px preview loaded (webp) |
| Sign out with unsaved changes | The paper box opens with focus on **Stay** |
| Console | No CSP errors, no exceptions. The only entry was the expected 400 from the `javascript:` save |

## Findings (ranked)

### F1. The phone bar shows Shop when nothing can be bought (`src/lib/products.js:114`)
`const bar = enabled && valid(rows).some((p) => p.status === 'available');` counts a product as "available" even with no
Link. The rest of the file treats that product as not buyable: `buyable()` at line 78 needs `link`, so the card says
"Coming soon" and there is no Buy.
**Failure:** with `SHOP_ENABLED=1`, a sample tee and a hoodie marked Available with an empty Link, the 390 bar reads
`Listen | Shows | Shop | Join`. The shop shows "Coming soon" twice and 0 Buy buttons (`d42-bar-no-buyable-390.webp`). Gabe will
hit this: he sets a product to Available before he pastes the store link, and the admin label itself reads
"Available (shows Buy once it has a Link)". So Watch leaves the bar for a page with nothing to buy. D42 exists to prevent
exactly that.
**Fix:** `valid(rows).some(buyable)`. Add a case to `test/shop.test.js:192`: `product({ link: undefined })` keeps Watch.
The test's `product()` helper always has a link, so it can't catch this today. Logged as **D43**.

### F2. Edits made during a save are thrown away (`public/js/edit.js:336-349`)
L2's Save guard stops a second request, but the rows stay editable while "Saving…" shows. When the reply arrives,
`t.render(b[kind])` (line 349) rebuilds every row from the server's copy and sets `dirty = false`.
**Failure:** with the POST held, I changed Product 1's name to "Typed during save", then released it. The row came back
as "Before save", collapsed, and the bar said "Saved. It's on the site now." (ok). The change is gone and nothing says
so. The same happens to an upload that finishes after Save is pressed. Its `change` handler (lines 177-188) writes the
path into a row that `render` has already replaced, so the photo vanishes and "Uploaded…" shows on a detached element.
On a phone over mobile data a save can take seconds, so this will happen.
**Fix (no new words, no new look):**
- In `save()`, set `t.list.inert = true` and disable that tab's Add button, and clear both in the `finally`. The busy line
  "Saving…" already says why nothing responds.
- While any upload in the tab is busy, the guard treats Save as busy: return early with `say(t.msg, 'Uploading…', 'busy')`.
- Test: hold the POST, type, release, and the typed value is either refused (inert) or kept.

### Not defects (noted so nobody re-opens them)
- The edit help line "Past shows are grey" is still true: the title and date are `muted`. The opacity is gone, as 15f asks.
- The phone bar's Shop item gets `aria-current` and its 3px top bar on /shop/. In full-page shots the fixed bar shows
  mid-page; that's an artifact of the capture, not the layout.
- The sold-out picture's `filter` + `opacity` is static. DESIGN 8 bans animating `filter`, not using it.

## What's good
- A faithful port: both CSS blocks are byte-for-byte the reviewed prototype. The markup follows section 11's list item by
  item, including `data-status` on card and article, tape words fixed in code (never data), card `alt=""`, and Stay as a
  plain `ed-btn`.
- The shop reads at a glance: 2.14 screens at 390 for the five samples, glyph + word statuses, tape SAMPLE in real 20px
  type, and Buy with its card note on the first screen of a detail.
- The admin console is calm and big: every target 48px+, 52px fields, radio rows with the full words, the paper "!" on
  the bad row with the message in the row's head, and Move up / Move down disabled at the ends.
- Security habits held: everything goes through `esc()` or `textContent`/`value`, links are http(s) only, uploads are
  re-encoded to webp with server-made names, and the 409 path is untouched.
- D42 is wired through `shopLinks(rows)` from the same per-visit read as the shop, so the bar and the page can't disagree
  about the data, only about the rule (F1).

## Screenshots (`docs/review/l2-port/*.webp`)
`shop-samples-390` (+ `-first-screen`), `shop-samples-1280`, `shop-mixed-390`, `shop-mixed-1280`,
`shop-detail-{tour-tee,vinyl,sample-tee}-{390,1280}`, `shop-empty-390`, `d42-bar-no-buyable-390` (F1),
`edit-shows-open-{390,1280}`, `edit-products-open-{390,1280}`, `edit-dirty-390`, `edit-saving-390`, `edit-saved-390`,
`edit-upload-busy-390`, `edit-upload-done-390`, `edit-error-row-390`, `edit-signout-ask-390`.
