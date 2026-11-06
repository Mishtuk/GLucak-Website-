# Shop copy (Copywriter draft, 2026-11-05) - for Gabe to review via the owner

Page: /shop/ (D36, temporary store; D8 phone bar). Checked against what the Desktop built in 0dbed0b: `src/pages/shop/index.astro`,
`src/lib/products.js`, `src/data/products.json`. Counts are characters including spaces and punctuation. "Site" = plain label.
"Built" = what is live now. Where my draft equals the built text it says **keep**. Nothing here is final until Gabe approves.

Rules applied: no dates promised, no price shown as real, no invented merch, no card-data talk beyond the plain fact, his
words only exact (D23/D29). Release titles as Spotify writes them (D31/D33): "IDENTITY".

Sources: `CONTEXT.md` (Owner's instructions 2026-11-05, later), DECISIONS D8/D23/D29/D31/D33/D36, `docs/research/shop-and-tools.md`
(Fourthwall Free picked, checkout on their page), `docs/research/social-content.md` (his own words).

Every user-facing string on /shop/ is below (page, banner, chip, cards, detail, empty, alt text, SEO description, nav).

---

## 1. Page heading and nav

| Part | Built | Draft | Chars |
|---|---|---|---|
| Tab word (nav, phone bar, footer, heading tab) | Shop | **Shop** (keep; D8: Shop replaces Watch on the phone bar) | 4 |
| Display phrase beside the tab | Merch | **Merch** (keep) | 5 |
| Page title (browser tab) | Shop \| GLucak | **Shop \| GLucak** (keep) | 14 |
| Search description | GLucak merch and music: shirts, hoodies, CDs, vinyl and stickers. | **GLucak merch and music.** | 26 |

Why the description changes: it lists five product kinds that are only samples today, and a search result is a promise. Add kinds back
only when real products exist. [no ask: change it when the real list is known]

## 2. Preview chip (shop not switched on)

| Built | Draft | Chars |
|---|---|---|
| Preview: the shop is not open yet | **Preview: the shop is not open yet** (keep) | 33 |

## 3. Sample banner

| Built (48) | Draft | Chars |
|---|---|---|
| This store is a preview. Products are samples. | **This shop is a preview. Everything here is a sample and can't be bought.** | 73 |

Why: "store" and "shop" both appear; the page and nav say Shop, so use one word. "Can't be bought" says plainly what a sample means. It
promises nothing about when real items arrive. Build note: show it only when EVERY product is a sample (`every`, not `some`) (D37); it goes away by itself once one real product is in.

## 4. Product card (grid)

Card order: picture, name, price, status.

| Part | Built | Draft | Chars |
|---|---|---|---|
| Name | the product's name | as entered | n/a |
| Price, real product | $25.00 | **$25.00** (keep format; two decimals) | n/a |
| Price, sample product | $25.00 (looks real) | **(no price line)** on the card and the detail (D37) | 0 |
| Price, zero | Free | **Free** (keep as built) | 4 |
| Status, can't buy yet | Coming soon | **Coming soon** (keep) | 11 |
| Status, for sale | Available | **Available** (keep; the detail page carries Buy) | 9 |
| Status, none left | Sold out | **Sold out** (keep) | 8 |

Why no price line for samples: D36 says samples must be obviously samples, and $25.00, $45.00 and $30.00 under a tee, a hoodie and a
vinyl read as real prices. "Price to come" would be worse: it promises a price for things that are "nothing confirmed". So show none.
This needs a small build change (no price line for status Sample, card and detail).

What "Coming soon" promises: only that it can't be bought yet. No date, no "soon" in a sentence, no "restock". Don't add "Notify me" or
"Back soon". Sold out also promises nothing (no "more coming").

## 5. Product detail

| Part | Built | Draft | Chars |
|---|---|---|---|
| Name (heading) | name | as entered | n/a |
| Price | as card | as card | n/a |
| Description | as entered | as entered; sample ones below | n/a |
| Sizes line | Sizes: S, M, L, XL, 2XL | **Sizes: S, M, L, XL, 2XL** (keep) | n/a |
| Buy button (available and has the store link) | Buy | **Buy** (keep) | 3 |
| Not buyable | plain label, not a button | **Coming soon** or **Sold out**, same words as the card (keep) | n/a |
| Picture alt text, real | the product's name | the product's name (keep) | n/a |

Buy opens the store's own page in the same way it does now; there is no button that does nothing. Keep that.

### How buying works (one line under the Buy button, only on products that can be bought)

| Option | Draft | Chars |
|---|---|---|
| Recommended | **You pay on the store's own page. We never see your card details.** | 66 |
| Once the provider is final | **You pay on Fourthwall's page. We never see your card details.** | 64 |

Plain and true: it matches the build (link out, no card data here, `products.js` header). Don't claim shipping times, returns or "secure"
beyond this. It appears only under a Buy button (available and has a Link), never on Sample, Coming soon or Sold out products (D37).

### Sample product text

Keeps the built "Sample:" names (they are already obvious). Descriptions only tightened, and "Not for sale." kept.

| Product | Built name | Draft name | Built description | Draft description (chars) |
|---|---|---|---|---|
| Tee | Sample: GLucak tee | keep | SAMPLE product. Not for sale. The real shirt, photo and price come when Gabe's merch is ready. | **Sample product. Not for sale. The real shirt, photo and price go here once Gabe's merch is ready.** (99) |
| Hoodie | Sample: GLucak hoodie | keep | (same with hoodie) | **Sample product. Not for sale. The real hoodie, photo and price go here once Gabe's merch is ready.** (101) |
| CD | Sample: IDENTITY CD | keep | SAMPLE product. Not for sale. A placeholder for a possible IDENTITY CD; nothing here is confirmed. | **Sample product. Not for sale. A placeholder for a possible IDENTITY CD. Nothing here is confirmed.** (99) |
| Vinyl | Sample: IDENTITY vinyl | keep | (same with vinyl) | **Sample product. Not for sale. A placeholder for a possible IDENTITY vinyl. Nothing here is confirmed.** (102) |
| Sticker | Sample: GLucak sticker | keep | SAMPLE product. Not for sale. A placeholder sticker. | **Sample product. Not for sale. A placeholder sticker.** (53) |

Why: "SAMPLE" in capitals reads as shouting at fans (the page banner already says it); "come when" can read as a date; "go here once ready"
is the same promise-free idea. Both IDENTITY lines say "possible" and "nothing confirmed" because no CD or vinyl is confirmed (Fourthwall
research flagged it as an open condition). Title is "IDENTITY", all caps, as released (D31). No release date is repeated here.
"Not for sale" and "can't be bought" are the same fact in two places; fine, the banner is page-level and this is item-level.

## 6. Empty state (no products)

| Built | Draft | Chars |
|---|---|---|
| Nothing in the shop yet. | **Nothing in the shop yet.** (keep) | 24 |

No second line, no "check back soon", no date.

## 7. Gabe's own words about merch

Checked `social-content.md`. The only merch line he wrote is "be sure to come out if you like free merch, live music and unreleased songs!"
(Instagram, 2026-10-26, https://www.instagram.com/p/De9guuDidBP/). **Do not use it on the shop page:** "free merch" is a stale promise
(and a shop selling merch contradicts it), and part of the sentence would be a trim under D23/D29. **No quote on /shop/ for now.**

## 8. Releases on the shop page

If IDENTITY merch appears: title **IDENTITY** (D31), no artists line (solo), no date unless the Home date line is reused unchanged
("August 13, 2027", still [ASK GABE] #2 in home.md). Spotify/streaming links are not repeated on this page.

---

## New [ASK GABE] items

Merged into the combined list in home.md (10-13).
