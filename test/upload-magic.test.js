// Upload first wall: magic bytes are checked before sharp sees the file.
import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { toWebp } from '../src/lib/upload.js';

const img = () => sharp({ create: { width: 20, height: 10, channels: 3, background: '#ff4d2e' } });
const pad = (b) => Buffer.concat([b, Buffer.alloc(64)]);

test('not JPEG/PNG/WebP by magic bytes: not_image, even when sharp could read it', async () => {
  const gif = await img().gif().toBuffer(); // a real GIF sharp decodes happily; only the magic check refuses it
  const tiff = await img().tiff().toBuffer();
  const bad = [
    Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>'),
    gif, tiff, pad(Buffer.from('II*\0')),
    Buffer.from('<!doctype html><script>alert(1)</script>'),
    Buffer.alloc(0), Buffer.from('RIFF\0\0\0\0WAVE'),
  ];
  for (const b of bad) await assert.rejects(toWebp(b), { message: 'not_image' });
});

test('real JPEG, PNG and WebP still pass', async () => {
  for (const b of [await img().jpeg().toBuffer(), await img().png().toBuffer(), await img().webp().toBuffer()]) {
    assert.equal((await sharp(await toWebp(b)).metadata()).format, 'webp');
  }
});
