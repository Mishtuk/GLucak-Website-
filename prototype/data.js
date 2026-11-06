// Prototype data. Field names match src/eras/*.json and src/data/shows.json; `with` is the one proposed addition.
// Everything here is a visible placeholder. Dates are deliberately not real dates.
window.GL = {
  eras: {
    // Same values as src/eras/placeholder.json, so the prototype and the contrast test agree.
    placeholder: {
      name: 'Placeholder',
      colors: { bg: '#111111', text: '#f5f5f5', accent: '#ff4d2e', 'accent-text': '#111111', muted: '#b3b3b3' },
      art: 'assets/cover.svg',
      texture: 'assets/grain.png',
      word: 'Placeholder',
    },
    // Second made-up era: proves a color swap touches nothing but the era data.
    'placeholder-b': {
      name: 'Placeholder B',
      colors: { bg: '#0e1420', text: '#f2f5f7', accent: '#2fd6c3', 'accent-text': '#0e1420', muted: '#aab4bf' },
      art: 'assets/cover.svg',
      texture: 'assets/grain.png',
      word: 'Placeholder B',
    },
    // A GUESS, not Gabe's colors (2026-11-05): sampled from the IDENTITY smart-link art (wingsmusic.lnk.to/IDENTITY,
    // its og:image): Gabe in deep blue light, a violet glow, white type. bg is the art's indigo field, text its white
    // type, accent its violet light lifted to pass 3:1 on bg. Same roles as every era. Replaced when Gabe's art arrives.
    'identity-guess': {
      name: 'IDENTITY guess',
      colors: { bg: '#08044a', text: '#f6f5ff', accent: '#a866ff', 'accent-text': '#08044a', muted: '#bab6e6' },
      art: 'assets/cover.svg',
      texture: 'assets/grain.png',
      word: 'IDENTITY',
    },
  },
  // Prototype-only labels, keyed by era slug (never part of an era file). Shown so nobody mistakes a guess for Gabe's.
  eraLabels: {
    'identity-guess': {
      chip: 'IDENTITY colors: our guess from the smart-link art',
      note: 'Colors are our guess at IDENTITY, sampled from the smart-link art, not Gabe’s.',
    },
  },
  shows: [
    { date: 'MMM 00', time: '0:00 PM', type: 'show', venue: 'Venue name', city: 'City', link: 'https://example.com/placeholder', with: 'Guest name' },
    { date: 'MMM 00', time: '0:00 PM', type: 'open-mic', venue: 'Venue name', city: 'City', link: 'https://example.com/placeholder' },
    { date: 'MMM 00', type: 'open-mic', venue: 'Venue name', city: 'City' },
  ],
  played: [
    { date: 'MMM 00', type: 'show', venue: 'Venue name', city: 'City' },
    { date: 'MMM 00', type: 'open-mic', venue: 'Venue name', city: 'City' },
  ],
  // Shop (L2): mirrors src/data/products.json word for word (names, descriptions, sizes, order). Images are the
  // prototype's placeholder line art (assets/shop/*.svg, DESIGN.md section 14), not the built SAMPLE webps.
  products: [
    { id: 'sample-glucak-tee', name: 'Sample: GLucak tee', type: 'shirt', price: 2500, image: 'assets/shop/sample-tee.svg', description: "Sample product. Not for sale. The real shirt, photo and price go here once Gabe's merch is ready.", status: 'sample', sizes: ['S', 'M', 'L', 'XL', '2XL'], order: 0 },
    { id: 'sample-glucak-hoodie', name: 'Sample: GLucak hoodie', type: 'hoodie', price: 4500, image: 'assets/shop/sample-hoodie.svg', description: "Sample product. Not for sale. The real hoodie, photo and price go here once Gabe's merch is ready.", status: 'sample', sizes: ['S', 'M', 'L', 'XL', '2XL'], order: 1 },
    { id: 'sample-identity-cd', name: 'Sample: IDENTITY CD', type: 'cd', price: 1200, image: 'assets/shop/sample-identity-cd.svg', description: 'Sample product. Not for sale. A placeholder for a possible IDENTITY CD. Nothing here is confirmed.', status: 'sample', order: 2 },
    { id: 'sample-identity-vinyl', name: 'Sample: IDENTITY vinyl', type: 'vinyl', price: 3000, image: 'assets/shop/sample-identity-vinyl.svg', description: 'Sample product. Not for sale. A placeholder for a possible IDENTITY vinyl. Nothing here is confirmed.', status: 'sample', order: 3 },
    { id: 'sample-glucak-sticker', name: 'Sample: GLucak sticker', type: 'sticker', price: 300, image: 'assets/shop/sample-sticker.svg', description: 'Sample product. Not for sale. A placeholder sticker.', status: 'sample', order: 4 },
  ],
  // ?shop=mixed only: one product per fan-facing state, so the Available / Coming soon / Sold out / Free looks can be
  // designed. Prototype-only examples (a chip says so); never real products, never shipped.
  demoProducts: [
    { id: 'example-available', name: 'Example: available item', type: 'shirt', price: 2500, image: 'assets/shop/sample-tee.svg', description: 'Prototype example of a product that can be bought.', status: 'available', link: 'https://example.com/placeholder', sizes: ['S', 'M', 'L', 'XL', '2XL'], order: 0 },
    { id: 'example-coming-soon', name: 'Example: coming soon item', type: 'hoodie', price: 4500, image: 'assets/shop/sample-hoodie.svg', description: 'Prototype example of a product that is not on sale yet.', status: 'coming-soon', sizes: ['S', 'M', 'L', 'XL', '2XL'], order: 1 },
    { id: 'example-sold-out', name: 'Example: sold out item', type: 'cd', price: 1200, image: 'assets/shop/sample-identity-cd.svg', description: 'Prototype example of a product with none left.', status: 'sold-out', order: 2 },
    { id: 'example-free', name: 'Example: free item', type: 'sticker', price: 0, image: 'assets/shop/sample-sticker.svg', description: 'Prototype example of a free product.', status: 'available', link: 'https://example.com/placeholder', order: 3 },
    { id: 'example-sample', name: 'Sample: IDENTITY vinyl', type: 'vinyl', price: 3000, image: 'assets/shop/sample-identity-vinyl.svg', description: 'Sample product. Not for sale. A placeholder for a possible IDENTITY vinyl. Nothing here is confirmed.', status: 'sample', order: 4 },
  ],
  // Admin prototype only: example shows for the Shows tab (the edit form needs real date values).
  adminShows: [
    { date: '2026-12-05', time: '19:30', type: 'show', venue: 'Venue name', city: 'Doylestown, PA', with: 'Guest name', link: 'https://example.com/placeholder' },
    { date: '2026-12-12', type: 'open-mic', venue: 'Venue name', city: 'City' },
    { date: '2026-10-24', type: 'open-mic', venue: 'Venue name', city: 'City' },
  ],
};
