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
};
