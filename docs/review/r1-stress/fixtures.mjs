import { readFileSync, writeFileSync } from 'node:fs';
const WT = 'wt-stress/';
const rd = (f) => JSON.parse(readFileSync(WT + f, 'utf8'));
const T40 = 'Forty Characters Of Title Is Quite A Lot'; // 40
console.log(T40.length);
// releases: newest = 40-char title, long artists, no cover (becomes Home "Latest single" placeholder)
const rel = rd('src/data/releases.json');
rel.unshift(
  { title: T40, date: '2026-11-10', type: 'single', link: 'https://example.com/a', cover: null, artists: 'GLucak, J-BOY, Micah Haun, Emily Mae, The Crooked Eye Brewery House Band' },
  { title: 'Supercalifragilisticexpialidocious Remixxx', date: '2026-11-09', type: 'ep', link: 'https://example.com/b', cover: '/media/covers/go.webp', artists: 'GLucak, Supercalifragilisticexpialidociousartist' },
  { title: 'No Cover Here', date: '2026-11-08', type: 'single', link: 'https://example.com/c', cover: null },
  { title: 'A Coming Release With A Rather Long Name Too', date: '2027-03-01', type: 'ep', link: 'https://example.com/d', cover: null },
);
writeFileSync(WT + 'src/data/releases.json', JSON.stringify(rel, null, 1));
const vid = rd('src/data/videos.json');
const T60 = 'This Is A Sixty Character Video Title That Wraps On Phones!!';
console.log(T60.length);
vid.unshift({ id: 'AAAAAAAAAAA', title: T60, date: '2026-11-10', kind: 'other', featured: true }, { id: 'BBBBBBBBBBB', title: 'Supercalifragilisticexpialidocious_Unbroken_Title_Without_Spaces_At_All', date: '2026-11-09', kind: 'other', featured: true });
writeFileSync(WT + 'src/data/videos.json', JSON.stringify(vid, null, 1));
// shows
const V45 = 'The Crooked Eye Brewery and Taproom Pennsylvania'.slice(0, 45); const C40 = 'West Bumblesville-on-the-Delaware, Pennsylvan'.slice(0, 40);
console.log(V45.length, C40.length);
const WITH2 = 'Micah Haun, J-BOY of J-BOY CULTURE, Emily Mae and the Crooked Eye House Band, plus a very special surprise guest to be announced';
const mk = (i) => ({ date: `2026-12-${String(12 + i).padStart(2, '0')}`, time: '19:30', type: i % 3 === 2 ? 'open-mic' : 'show', venue: i === 0 ? V45 : i === 1 ? 'Supercalifragilisticexpialidocious_Venue_Unbroken' : `Venue Number ${i}`, city: i < 2 ? C40 : `City ${i}, PA`, with: i < 3 ? WITH2 : undefined, link: i % 4 === 3 ? undefined : 'https://example.com/t' });
const clean = (r) => JSON.parse(JSON.stringify(r));
const all = [...Array(15).keys()].map((i) => clean(mk(i)));
all.push({ date: '2026-03-01', type: 'show', venue: V45, city: C40, with: WITH2, link: 'https://example.com/t' });
writeFileSync('data15/shows.json', JSON.stringify(all, null, 1));
writeFileSync('data1/shows.json', JSON.stringify([all[0]], null, 1));
writeFileSync('data0/shows.json', '[]');
// products (every DATA_DIR)
const prod = rd('src/data/products.json');
prod.unshift({ id: 'long-name', name: 'GLucak Limited Edition Signed Deluxe Collector\'s Hoodie With Embroidered Back Print (Black, Oversized)', type: 'hoodie', price: 4500, image: '/media/shop/sample-hoodie.webp', description: 'A very long description. '.repeat(20).trim(), status: 'sample', sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'], order: 0 },
  { id: 'unbroken', name: 'Supercalifragilisticexpialidocious_Unbroken_Product_Name_Here', type: 'shirt', price: 2500, image: '/media/shop/sample-tee.webp', status: 'sample', order: 1 });
prod.forEach((p, i) => { p.order = i; });
for (const d of ['data0', 'data1', 'data15']) writeFileSync(d + '/products.json', JSON.stringify(prod, null, 1));
// bio (about page + home lead)
let a = readFileSync(WT + 'src/pages/about/index.astro', 'utf8');
const P = 'Gabe grew up in a small town outside Philadelphia and spent years learning to produce in a bedroom studio, stacking drum samples, layering synth lines and writing verses at two in the morning between shifts, and none of it was easy, and all of it was worth it. ';
a = a.replace(/<div class="bio">[\s\S]*?<\/div>\n      <div class="push-actions about-actions">/, `<div class="bio"><p class="bio-lead">${P.repeat(2)}https://www.instagram.com/glucakofficial/reel/Dd6keDDDefE-a-very-long-unbroken-link-in-the-text-of-a-paragraph/</p><p>${P.repeat(3)}</p><p>${P.repeat(2)}</p></div>\n      <div class="push-actions about-actions">`);
writeFileSync(WT + 'src/pages/about/index.astro', a);
