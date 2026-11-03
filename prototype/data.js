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
