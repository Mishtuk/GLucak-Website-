// Product image uploads for the edit screen. Never trusts the client's file name or type: sharp must decode the bytes
// as JPEG, PNG or WebP, then they are rotated upright, resized and re-encoded as a fresh WebP with no metadata
// (EXIF, GPS, XMP, ICC all dropped: sharp keeps none unless asked). Anything else in the file (an HTML tail, a comment
// segment) does not survive the re-encode. Server-only.
export const MAX_BYTES = 5 * 1024 * 1024;
export const MAX_PIXELS = 40_000_000;
export const MAX_SIDE = 1200;
export const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const UPLOAD_NAME = /^[a-f0-9]{32}\.webp$/;

/** WebP buffer, or throws Error('not_image' | 'too_many_pixels'). */
export async function toWebp(buf) {
  const { default: sharp } = await import('sharp'); // lazy: the public site runs even if sharp's binary is missing
  let meta;
  try { meta = await sharp(buf).metadata(); } catch { throw new Error('not_image'); }
  if (!['jpeg', 'png', 'webp'].includes(meta.format)) throw new Error('not_image'); // no SVG, GIF, TIFF, HEIF...
  if (!(meta.width > 0 && meta.height > 0) || meta.width * meta.height > MAX_PIXELS) throw new Error('too_many_pixels');
  try {
    return await sharp(buf, { limitInputPixels: MAX_PIXELS, failOn: 'error' })
      .rotate() // upright from the EXIF orientation, before the EXIF is dropped
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch { throw new Error('not_image'); }
}
