# Admin console copy (Copywriter draft, 2026-11-05) - for the owner and Gabe

Page: /edit/ (D36, 0dbed0b). Read from `src/pages/edit/index.astro`, `public/js/edit.js`, `server.js` (messages), `src/lib/store.js`,
`src/lib/products.js`, `src/lib/upload.js`. The people who read this are Gabe and the owner: plain words, phone first, no codes, no jargon.
"Built" = what is live now. **Keep** = my draft equals the built text. Counts are characters including spaces and punctuation.
Only changes where the new text is clearer. Nothing here is a fact about Gabe; no asks to him except at the bottom.

Sources: `CONTEXT.md` (Owner's instructions 2026-11-05, later), DECISIONS D36, the built files above.

Place for a change: the string lives where noted. "Client" = `edit.js` or `edit/index.astro`. "Server" = `server.js`/`store.js`/`products.js`.

---

## 1. Page

| String | Built | Draft | Chars |
|---|---|---|---|
| Browser tab | Edit the site \| GLucak | **Edit the site \| GLucak** (keep) | 23 |
| Heading | Edit the site | **Edit the site** (keep) | 13 |
| No JavaScript | This page needs JavaScript. Turn it on, then reload. | **This page needs JavaScript. Turn it on, then reload.** (keep) | 52 |

## 2. Sign in

| String | Built | Draft | Chars |
|---|---|---|---|
| Card heading | Sign in | **Sign in** (keep) | 7 |
| Field label | Name | **Name** (keep) | 4 |
| Field label | Password | **Password** (keep) | 8 |
| Button | Sign in | **Sign in** (keep) | 7 |
| Working | Signing in… | **Signing in…** (keep) | 11 |
| Wrong name or password (Server) | That name and password don't match. Check them and try again. | **keep** | 61 |
| Lockout (Server) | Too many tries. Wait 15 minutes, then try again. | **keep** | 48 |
| Could not reach the server | That didn't go through. Try again. | **keep** | 34 |
| Page load, no connection | Can't reach the site. Check your connection and reload. | **keep** | 56 |
| Not switched on (Server) | The edit screen is not set up yet. | **The edit screen isn't switched on yet. Tell the person who runs the site.** | 76 |
| Blocked request (Server) | Refused: this has to come from the edit page itself. | **That didn't go through. Try again.** | 34 |

Why the last two change: "not set up yet" gives the reader nothing to do; "Refused ... edit page itself" is a security word for something they can't
fix. The lockout message is already right: it says what happened and how long.

## 3. Signed in

| String | Built | Draft | Chars |
|---|---|---|---|
| Who | Signed in as {name} | **Signed in as {name}** (keep) | n/a |
| Button | Sign out | **Sign out** (keep) | 8 |
| Sign out with unsaved changes (confirm) | You have changes that are not saved. Sign out anyway? | **You have changes that aren't saved. Sign out anyway?** | 54 |
| Signed out while editing (after Save, 401) | You were signed out. Sign in above, then press Save again. Your changes are still here. | **keep** | 88 |
| Signed back in with unsaved changes | Signed in again. Press Save. | **keep** | 28 |
| Leaving the page with unsaved changes | the browser's own message | n/a (browser decides; can't be changed) | n/a |

## 4. Tabs

| String | Built | Draft | Chars |
|---|---|---|---|
| Tab group label (screen reader) | What to edit | **keep** | 12 |
| Tab | Shows | **Shows** (keep) | 5 |
| Tab | Products | **Products** (keep) | 8 |

## 5. Shows tab

| String | Built | Draft | Chars |
|---|---|---|---|
| Help | Change anything, then press Save. Past shows are grey: they stay on the Shows page under Played. | **keep** | 94 |
| Button | Add show | **Add show** (keep) | 8 |
| Each card heading | Show 1, Show 2 | **Show 1** (keep) | n/a |
| Past tag | Played | **Played** (keep) | 6 |
| Empty state (new; the list is blank now) | none | **No shows yet. Press Add show.** | 30 |
| Save button | Save shows | **Save shows** (keep) | 10 |
| Delete button | Delete | **Delete** (keep) | 6 |
| Delete confirm | Delete {venue}? It goes away when you press Save. | **keep** (falls back to "this show") | 48 |

Fields (label / hint):

| Label | Hint | Built | Draft |
|---|---|---|---|
| Date | none | Date | **keep** |
| Time (optional) | none | Time (optional) | **keep** |
| Type | none | Show / Open mic | **keep** |
| Venue | none | Venue | **keep** |
| City | example in the box: Doylestown, PA | City | **keep** (the example is a format hint, not a claim) |
| With (optional) | Another act on the bill | | **keep** |
| Link (optional) | Tickets or details page | | **keep** |

Row errors (Server, each starts "Show N:" and the card gets a "!" mark):

| Built | Draft |
|---|---|
| Pick a real date. | **keep** |
| Time should look like 19:30, or leave it empty. | **Pick a time, or leave it empty.** (the phone picker shows AM/PM; "19:30" is a 24-hour format) |
| Pick Show or Open mic. | **keep** |
| Add the venue. / Add the city. | **keep** |
| The link has to start with https:// (or http://), or leave it empty. | **keep** |
| Leave "With" empty or add a name. | **keep** |
| This row is broken. Delete it and add it again. | **keep** |
| Keep each field under {n} characters. | **keep** |
| That's more than {n} shows. Delete some old ones first. | **keep** |
| Nothing to save. | **keep** |
| That list is too big to save. Delete some old shows. | **keep** |

## 6. Products tab

| String | Built | Draft | Chars |
|---|---|---|---|
| Help | Products show on the Shop page in this order (Up and Down move them). Change anything, then press Save. Fans buy on the store's own page (the Link); this site never takes card details. | **Products show on the Shop page in this order. Use Move up and Move down. Change anything, then press Save. Fans buy on the store's own page (the Link). This site never takes card details.** | 183 |
| Add | Add product | **Add product** (keep) | 11 |
| Each card heading | Product 1 | **Product 1** (keep) | n/a |
| Empty state (new) | none | **No products yet. Press Add product.** | 38 |
| Save | Save products | **Save products** (keep) | 13 |
| Reorder | Up / Down | **Move up / Move down** | 7 / 9 |
| Open a row (L2, D41) | (new) | **Edit** (pressed look + `aria-expanded` show it's open; no "Close" label) | 4 |
| Sign-out confirm, stay button (D41) | Stay | **Stay** (keep as built; a plain button, not the accent one) | 4 |
| Delete | Delete | **Delete** (keep) | 6 |
| Delete confirm | Delete {name}? It goes away when you press Save. | **keep** (falls back to "this product") | n/a |
| Products would not load | Couldn't load the products. Reload the page. | **keep** | 44 |

Fields (label / hint):

| Built label | Built hint | Draft label | Draft hint |
|---|---|---|---|
| Name | none | **Name** | none |
| ID | Lowercase letters, numbers and dashes; the end of the Shop link (/shop/#product-ID) | **Short name** | **Lowercase letters, numbers and dashes. It fills in from the name; leave it unless you need to change it.** (105) |
| Type | none | **Type** (Shirt, Hoodie, CD, Vinyl, Sticker, Other: keep) | none |
| Price (US dollars) | none | **Price (US dollars)** | **Like 25 or 25.00** |
| Status | none | **Status** | none |
| Status options | Coming soon / Available (shows Buy when it has a Link) / Sold out / Sample (shows Coming soon) | **Coming soon / Available (shows Buy once it has a Link) / Sold out / Sample (shows Coming soon, no price)** | |
| Image | Upload a photo below, or keep the path | **Photo** | **Filled in when you upload a photo below. Leave it as it is.** (56) |
| Upload a photo | JPG, PNG or WebP, up to 5 MB | **Upload a photo** | **JPG, PNG or WebP, up to 5 MB.** (keep) |
| Description (optional) | Up to 600 characters | **keep** | |
| Link (optional) | The product page on Fourthwall or Bandcamp; needed for the Buy button | **Link (optional)** | **Where fans buy it: the product page on your store. Needed for the Buy button.** (77) |
| Sizes (optional) | Separate with commas | **keep** | **Separate with commas, like S, M, L, XL.** |

Upload messages:

| Situation | Built | Draft | Chars |
|---|---|---|---|
| Working | Uploading… | **keep** | 10 |
| Done | Uploaded. Press Save to keep it. | **keep** | 32 |
| Wrong type (client) | Pick a JPG, PNG or WebP photo. | **keep** | 30 |
| Wrong type (Server) | That file isn't a photo we can use. Try a JPG, PNG or WebP. | **keep** | 58 |
| Over 5 MB (client and Server) | That photo is over 5 MB. Pick a smaller one. | **keep** | 44 |
| Over 40 megapixels (Server) | That photo is too big (over 40 megapixels). Pick a smaller one. | **That photo is too big (over 40 megapixels). Shrink it or pick another one.** | 76 |
| Too many uploads (Server) | Too many uploads. Wait a few minutes, then try again. | **keep** | 53 |
| No connection | That didn't upload. Check your connection and try again. | **keep** | 56 |
| Signed out | You were signed out. Sign in above, then upload again. | **keep** | 54 |
| Other | That didn't upload. Try again. | **keep** | 30 |

Why megapixels changes: Gabe won't know what it means. Use the plain "Shrink it" and keep the number so the owner can see the limit.

Row errors (Server, "Product N:" in front):

| Built | Draft |
|---|---|
| The ID is lowercase letters, numbers and dashes, like glucak-tee (up to 60). | **The short name is lowercase letters, numbers and dashes, like glucak-tee (up to 60).** |
| Add a name (up to 120 characters). | **keep** |
| Pick a type. / Pick a status. | **keep** |
| The price is a number of dollars from 0 to 1000, like 25 or 25.00. | **keep** |
| Upload an image. | **Add a photo: upload one below.** |
| Keep the description to 600 characters. | **keep** |
| The link has to start with https:// (or http://), or leave it empty. | **keep** |
| Sizes are short, like S, M, L, XL (up to 12, 12 characters each), or leave it empty. | **keep** |
| This row is broken. Delete it and add it again. | **keep** |
| Another product already has the ID {id}. Each needs its own. | **Another product already uses the short name {id}. Each one needs its own.** |
| That's more than 200 products. Delete some first. | **keep** |
| That list is too big to save. Delete some products or shorten descriptions. | **keep** |

## 7. Saving (both tabs)

| Situation | Built | Draft | Chars |
|---|---|---|---|
| Changed | Not saved yet. | **keep** | 14 |
| Working | Saving… | **keep** | 7 |
| Saved, shows | Saved. It's on the site now. | **keep** | 28 |
| Saved, products, shop open to fans | same | **keep** | 28 |
| Saved, products, shop not open yet | same (not true: the shop isn't linked in the menu yet) | **Saved. The shop isn't open to fans yet, so they won't see it until it's switched on.** | 84 |
| No connection | That didn't save. Check your connection and try again. | **keep** | 54 |
| Fix marked rows, one | Not saved. Fix the show marked with !, then press Save. | **keep** | n/a |
| Fix marked rows, several | Not saved. Fix the 2 shows marked with !, then press Save. | **keep** (same with "products") | n/a |
| Garbled request (Server) | That save got garbled. Try again. | **That didn't save. Try again.** | 28 |
| Anything else | That didn't save. Try again. | **keep** | 28 |

`server.js` picks the message when the shop is off (D37); no page change.

### The conflict message (HTTP 409, "someone else saved first")

| Built (Server `STALE`, 103) | Draft | Chars |
|---|---|---|
| Someone else saved the {shows/products} a moment ago. Reload to see their changes; yours are still on this page. | **Someone else saved the {shows/products} just now, so yours didn't save. Reloading shows their changes but clears yours, so write down what you changed first.** | 158 |

Why it changes: the built text is wrong in one way. It says "yours are still on this page" right after telling the reader to reload, and
a reload clears what they typed. The new text says what happened, what reload does, and what to do first. No code, no "409".

Both the page text and the server's `STALE` string should use the same new line.

---

## New [ASK GABE] items (not in home.md)

None for Gabe about the admin text itself.

For the owner (not Gabe):
- Do you want the admin sign-in help (where to reset a password, who to call) on the sign-in card? We don't know who that person is, so I didn't write one.
- Is the edit page's address given to Gabe by you directly? (We keep the page unlinked; no copy is needed for that.)
