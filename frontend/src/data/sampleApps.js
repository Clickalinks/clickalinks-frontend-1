const svgUri = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const icon = (background, mark) => svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="56" fill="${background}"/>
  ${mark}
</svg>`);

const shot = (background, artwork, caption) => svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="390" height="700" viewBox="0 0 390 700">
  <rect width="390" height="700" fill="${background}"/>
  ${artwork}
  <text x="28" y="640" fill="#ffffff" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="28" font-weight="700">${caption}</text>
</svg>`);

export function listingFromPurchase(purchase, position) {
  if (!purchase) return null;
  const isApp = purchase.listingType === 'app' || purchase.appStoreUrl || purchase.playStoreUrl;
  if (!isApp) return null;
  if (purchase.paymentStatus !== 'paid' || purchase.status !== 'active') return null;

  const iconUrl = purchase.icon || purchase.logoData || purchase.logoURL || purchase.logo || '';

  return {
    name: purchase.appName || purchase.businessName || 'App',
    developer: purchase.developer || purchase.developerName || purchase.businessName || 'Developer',
    icon: iconUrl,
    screenshots: Array.isArray(purchase.screenshots) ? purchase.screenshots.filter(Boolean) : [],
    rating: Number(purchase.rating) || null,
    ratingCount: Number(purchase.ratingCount) || null,
    ageRating: purchase.ageRating || '',
    category: purchase.category || 'Games',
    description: purchase.description || purchase.offer || '',
    reviews: Array.isArray(purchase.reviews) ? purchase.reviews : [],
    appStoreUrl: purchase.appStoreUrl || '',
    playStoreUrl: purchase.playStoreUrl || '',
    sample: false,
    squareNumber: position
  };
}

export const SAMPLE_APPS = [
  {
    name: 'Castlefold',
    developer: 'Northshore Games',
    sample: true,
    icon: icon('#C4A574', `
      <rect x="78" y="48" width="100" height="150" rx="8" fill="#F3E6C8"/>
      <rect x="96" y="28" width="22" height="36" fill="#F3E6C8"/>
      <rect x="138" y="28" width="22" height="36" fill="#F3E6C8"/>
      <rect x="108" y="132" width="40" height="66" rx="4" fill="#8C6239"/>
    `),
    screenshots: [
      shot('#87B8D6', `
        <rect x="0" y="430" width="390" height="270" fill="#7DAA6A"/>
        <rect x="145" y="180" width="100" height="250" fill="#E7D3A1"/>
        <rect x="160" y="150" width="24" height="50" fill="#E7D3A1"/>
        <rect x="206" y="150" width="24" height="50" fill="#E7D3A1"/>
        <rect x="175" y="300" width="40" height="130" fill="#8C6239"/>
        <circle cx="70" cy="90" r="28" fill="#F6E27A"/>
      `, 'Build the keep'),
      shot('#1E3A5F', `
        <rect x="40" y="80" width="70" height="70" rx="8" fill="#E7D3A1"/>
        <rect x="130" y="80" width="70" height="70" rx="8" fill="#8C6239"/>
        <rect x="220" y="80" width="70" height="70" rx="8" fill="#E7D3A1"/>
        <rect x="85" y="180" width="70" height="70" rx="8" fill="#C4A574"/>
        <rect x="175" y="180" width="70" height="70" rx="8" fill="#F3E6C8"/>
        <rect x="40" y="280" width="70" height="70" rx="8" fill="#8C6239"/>
        <rect x="130" y="280" width="70" height="70" rx="8" fill="#E7D3A1"/>
        <rect x="220" y="280" width="70" height="70" rx="8" fill="#C4A574"/>
      `, 'Fold the courtyard'),
      shot('#243044', `
        <circle cx="195" cy="250" r="90" fill="none" stroke="#F6E27A" stroke-width="8"/>
        <path d="M195 190 L206 230 L248 230 L214 254 L226 296 L195 272 L164 296 L176 254 L142 230 L184 230 Z" fill="#F6E27A"/>
      `, 'Three stars')
    ],
    rating: 4.6,
    ratingCount: 1284,
    ageRating: '4+',
    category: 'Games',
    description: 'Stack, fold, and rebuild a wooden castle one courtyard at a time. A quiet puzzle game about shape, balance, and the next piece.',
    reviews: [
      { title: 'Calm and clever', author: 'Marta', stars: 5, text: 'I keep coming back for one more courtyard. The castle pieces feel satisfying to place.' },
      { title: 'Lovely short sessions', author: 'Owen', stars: 4, text: 'Perfect on the train. A few puzzles are strict, and that is the fun of it.' }
    ],
    appStoreUrl: 'https://apps.apple.com/gb/search?term=Castlefold',
    playStoreUrl: 'https://play.google.com/store/search?q=Castlefold&c=apps'
  },
  {
    name: 'Lantern Run',
    developer: 'Hearth & Pine',
    sample: true,
    icon: icon('#1C2430', `
      <path d="M128 36 C128 36 84 110 84 150 C84 186 108 214 128 214 C148 214 172 186 172 150 C172 110 128 36 128 36 Z" fill="#F6C453"/>
      <rect x="116" y="206" width="24" height="18" rx="3" fill="#8C6239"/>
    `),
    screenshots: [
      shot('#121820', `
        <rect x="0" y="460" width="390" height="240" fill="#1E2A22"/>
        <circle cx="196" cy="250" r="36" fill="#F6C453"/>
        <rect x="188" y="280" width="16" height="70" fill="#D7C4A3"/>
        <polygon points="40,460 90,360 140,460" fill="#243028"/>
        <polygon points="250,460 310,330 370,460" fill="#243028"/>
      `, 'Keep the light'),
      shot('#0E141C', `
        <rect x="0" y="500" width="390" height="200" fill="#243028"/>
        <circle cx="80" cy="420" r="18" fill="#F6C453"/>
        <circle cx="180" cy="360" r="18" fill="#F6C453" opacity="0.7"/>
        <circle cx="280" cy="300" r="18" fill="#F6C453" opacity="0.45"/>
        <path d="M40 500 C120 470 180 520 250 480 C300 456 340 490 390 470" fill="none" stroke="#F6C453" stroke-width="6"/>
      `, 'Follow the path'),
      shot('#182028', `
        <text x="48" y="220" fill="#F6C453" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="64" font-weight="700">2,480</text>
        <text x="48" y="280" fill="#D7C4A3" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="24">metres of night</text>
      `, 'How far tonight')
    ],
    rating: 4.4,
    ratingCount: 860,
    ageRating: '9+',
    category: 'Games',
    description: 'Run a forest path at night with nothing but a lantern. The light is the level. Let it fade and the trail disappears.',
    reviews: [
      { title: 'Tense in a good way', author: 'Priya', stars: 5, text: 'The lantern mechanic is simple and I still lean forward on every run.' },
      { title: 'Short and sharp', author: 'Leon', stars: 4, text: 'Runs last a few minutes. I would love a longer forest later.' }
    ],
    appStoreUrl: 'https://apps.apple.com/gb/search?term=Lantern%20Run',
    playStoreUrl: 'https://play.google.com/store/search?q=Lantern%20Run&c=apps'
  },
  {
    name: 'Paper Orbit',
    developer: 'Folded Star',
    sample: true,
    icon: icon('#F4EFE6', `
      <circle cx="128" cy="128" r="62" fill="none" stroke="#2C3E50" stroke-width="10"/>
      <circle cx="128" cy="66" r="10" fill="#E25B45"/>
      <path d="M128 128 L176 104" stroke="#2C3E50" stroke-width="8" stroke-linecap="round"/>
    `),
    screenshots: [
      shot('#F7F1E6', `
        <circle cx="195" cy="280" r="110" fill="#F2D7A6" stroke="#2C3E50" stroke-width="6"/>
        <circle cx="300" cy="180" r="28" fill="#E25B45"/>
        <circle cx="90" cy="160" r="8" fill="#2C3E50"/>
        <circle cx="120" cy="120" r="5" fill="#2C3E50"/>
      `, 'A paper planet'),
      shot('#E7F0F6', `
        <polygon points="195,120 230,210 160,210" fill="#F7F1E6" stroke="#2C3E50" stroke-width="6"/>
        <rect x="184" y="210" width="22" height="80" fill="#E25B45"/>
        <circle cx="195" cy="430" r="70" fill="none" stroke="#2C3E50" stroke-width="4" stroke-dasharray="8 8"/>
      `, 'Fold a rocket'),
      shot('#2C3E50', `
        <circle cx="80" cy="140" r="4" fill="#F7F1E6"/>
        <circle cx="140" cy="90" r="3" fill="#F7F1E6"/>
        <circle cx="250" cy="160" r="5" fill="#F7F1E6"/>
        <circle cx="300" cy="80" r="3" fill="#F7F1E6"/>
        <circle cx="195" cy="300" r="80" fill="none" stroke="#F2D7A6" stroke-width="6"/>
      `, 'Stay in orbit')
    ],
    rating: 4.8,
    ratingCount: 2406,
    ageRating: '4+',
    category: 'Games',
    description: 'Fold paper into a tiny spacecraft and keep it in orbit. Gentle physics, bright paper, and a sky that gets busier as you fly.',
    reviews: [
      { title: 'Charming', author: 'Helen', stars: 5, text: 'It looks like a picture book and plays like a proper little puzzle.' },
      { title: 'My kids asked for one more', author: 'Sam', stars: 5, text: 'Easy to start, and the later orbits ask you to be careful.' }
    ],
    appStoreUrl: 'https://apps.apple.com/gb/search?term=Paper%20Orbit',
    playStoreUrl: 'https://play.google.com/store/search?q=Paper%20Orbit&c=apps'
  }
];
