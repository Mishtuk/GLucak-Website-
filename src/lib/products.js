// Shop products (D36): validate, render escaped HTML for /shop/, and the SHOP_ENABLED nav links. No fs here (store.js
// reads and writes the file). Checkout is always the provider's page (Fourthwall / Bandcamp): we never handle card data.
import { esc } from './shows.js';

export const MAX_PRODUCTS = 200;
export const TYPES = ['shirt', 'hoodie', 'cd', 'vinyl', 'sticker', 'other'];
export const STATUSES = ['sample', 'coming-soon', 'available', 'sold-out'];
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Shipped art in /media/shop/, or an upload (server-made random name, always webp). No "..", no other folders.
export const IMAGE = /^\/media\/(?:shop\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:webp|png|jpg)|uploads\/[a-f0-9]{32}\.webp)$/;
const httpUrl = (u) => { try { return ['http:', 'https:'].includes(new URL(u).protocol); } catch { return false; } };

const PLAIN = {
  id: 'The short name is lowercase letters, numbers and dashes, like glucak-tee (up to 60).',
  name: 'Add a name (up to 120 characters).',
  type: 'Pick a type.',
  price: 'The price is a number of dollars from 0 to 1000, like 25 or 25.00.',
  image: 'Add a photo: upload one below.',
  description: 'Keep the description to 600 characters.',
  link: 'The link has to start with https:// (or http://), or leave it empty.',
  status: 'Pick a status.',
  sizes: 'Sizes are short, like S, M, L, XL (up to 12, 12 characters each), or leave it empty.',
  order: 'This row is broken. Delete it and add it again.',
  object: 'This row is broken. Delete it and add it again.',
};

/** Returns the product if valid, else throws Error(field). */
export function validateProduct(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) throw new Error('object');
  const str = (v, max, min = 1) => typeof v === 'string' && v.trim().length >= min && v.length <= max;
  if (!str(p.id, 60) || !ID.test(p.id)) throw new Error('id');
  if (!str(p.name, 120)) throw new Error('name');
  if (!TYPES.includes(p.type)) throw new Error('type');
  if (!Number.isInteger(p.price) || p.price < 0 || p.price > 100000) throw new Error('price');
  if (typeof p.image !== 'string' || !IMAGE.test(p.image)) throw new Error('image');
  if (p.description != null && !str(p.description, 600, 0)) throw new Error('description');
  if (p.link != null && (!str(p.link, 500) || !httpUrl(p.link))) throw new Error('link');
  if (!STATUSES.includes(p.status)) throw new Error('status');
  if (p.sizes != null && (!Array.isArray(p.sizes) || p.sizes.length > 12 || !p.sizes.every((s) => str(s, 12)))) throw new Error('sizes');
  if (!Number.isInteger(p.order) || p.order < 0 || p.order > 100000) throw new Error('order');
  return p;
}

const FIELDS = ['id', 'name', 'type', 'price', 'image', 'description', 'link', 'status', 'sizes', 'order'];
/** Keep only known fields, trim strings, drop empty optional ones, ids unique. Returns { rows } or { errors: [{ row, message }] }. */
export function checkProducts(list) {
  if (!Array.isArray(list)) return { errors: [{ row: null, message: 'Nothing to save.' }] };
  if (list.length > MAX_PRODUCTS) return { errors: [{ row: null, message: `That's more than ${MAX_PRODUCTS} products. Delete some first.` }] };
  const rows = [], errors = [], seen = new Set();
  list.forEach((r, i) => {
    let clean = null;
    if (r && typeof r === 'object' && !Array.isArray(r)) {
      clean = {};
      for (const k of FIELDS) {
        let v = r[k];
        if (typeof v === 'string') v = v.trim();
        if (k === 'sizes' && Array.isArray(v)) v = v.map((s) => (typeof s === 'string' ? s.trim() : s)).filter((s) => s !== '');
        if (['description', 'link', 'sizes'].includes(k) && (v === '' || v == null || (Array.isArray(v) && !v.length))) continue;
        clean[k] = v;
      }
    }
    try {
      validateProduct(clean);
      if (seen.has(clean.id)) throw new Error('duplicate');
      seen.add(clean.id);
      rows.push(clean);
    } catch (e) {
      const why = e.message === 'duplicate' ? `Another product already uses the short name ${clean.id}. Each one needs its own.` : PLAIN[e.message] ?? PLAIN.object;
      errors.push({ row: i, message: `Product ${i + 1}: ${why}` });
    }
  });
  return errors.length ? { errors } : { rows };
}

const valid = (rows) => rows.filter((r) => { try { return validateProduct(r); } catch { return false; } });
const sorted = (rows) => valid(rows).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
export const price = (cents) => (cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`);
const buyable = (p) => p.status === 'available' && Boolean(p.link);
/** The label a fan sees: Buy (a link) only when it's for sale and has the provider's page. */
export const statusText = (p) => (p.status === 'sold-out' ? 'Sold out' : buyable(p) ? 'Available' : 'Coming soon');
const anchor = (p) => `product-${p.id}`;

/** Buy opens the provider's product page; anything else is a plain label, never a button that does nothing. */
export function actionHtml(p) {
  if (buyable(p)) return `<a class="btn btn-solid product-buy" href="${esc(p.link)}" rel="noopener">Buy</a><p class="product-note">You pay on the store's own page. We never see your card details.</p>`;
  return `<p class="product-status${p.status === 'sold-out' ? ' is-sold-out' : ''}">${statusText(p)}</p>`;
}

const img = (p, cls) => `<img class="${cls}" src="${esc(p.image)}" alt="${esc(p.name)}" width="600" height="600" loading="lazy" decoding="async" />`;
const priceHtml = (p) => (p.status === 'sample' ? '' : `<p class="product-price">${price(p.price)}</p>`); // a sample's price would read as real (D37)
const card = (p) => `<li class="product-card"><a class="product-link" href="#${anchor(p)}">${img(p, 'product-media')}<p class="product-name">${esc(p.name)}</p>${priceHtml(p)}<p class="product-status">${statusText(p)}</p></a></li>`;
const detail = (p) => `<article class="product-detail" id="${anchor(p)}">${img(p, 'product-media')}<div class="product-body"><h2 class="product-name">${esc(p.name)}</h2>${priceHtml(p)}${p.description ? `<p class="product-desc">${esc(p.description)}</p>` : ''}${p.sizes?.length ? `<p class="product-sizes">Sizes: ${p.sizes.map(esc).join(', ')}</p>` : ''}${actionHtml(p)}</div></article>`;

/** The /shop/ marker: optional Preview chip (shop not switched on), sample banner, grid, then one detail per product. */
export function productsHtml(rows, { preview = false } = {}) {
  const list = sorted(rows);
  const chip = preview ? '<p class="shop-preview"><span class="ph-chip inline">Preview: the shop is not open yet</span></p>' : '';
  if (!list.length) return `${chip}<p class="shop-empty">Nothing in the shop yet.</p>`;
  const banner = list.every((p) => p.status === 'sample') ? '<p class="shop-banner" role="note">This shop is a preview. Everything here is a sample and can\'t be bought.</p>' : '';
  return `${chip}${banner}<ul class="shop-grid">${list.map(card).join('')}</ul><div class="shop-details">${list.map(detail).join('')}</div>`;
}

// SHOP_ENABLED (D8, D36): the built pages carry empty markers; the server fills them per request.
const BAG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';
/** Header nav + menu sheet get Shop; the phone bar's Watch becomes Shop; the footer line gets Shop. Off: markers emptied. */
export function shopLinks(html, { enabled, path }) {
  const cur = path.startsWith('/shop/') ? ' aria-current="page"' : '';
  return html
    .replaceAll('<!--gl:nav-shop-->', enabled ? `<a href="/shop/"${cur}>Shop</a>` : '')
    .replace(/<!--gl:watch-->([\s\S]*?)<!--\/gl:watch-->/, (_, watch) => (enabled ? `<a href="/shop/"${cur}>${BAG}<span>Shop</span></a>` : watch))
    .replaceAll('<!--gl:footer-shop-->', enabled ? ' <a href="/shop/">Shop.</a>' : '');
}
