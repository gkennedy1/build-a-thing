const projects = [
  {
    id: 'cellar-dweller',
    name: 'Cellar Dwellers',
    description: 'Scan a wine label to discover a collectible mythical character and story inspired by the bottle, its producer and its region. Each character joins a gallery you can build and share.',
    status: 'in-progress',
    links: [
      { label: 'Visit Cellar Dwellers', url: 'https://the-fermented-bazaar.vercel.app/' },
    ],
    milestones: [
      { label: 'Build wine label scanning and research', done: true },
      { label: 'Generate character stories and portraits', done: true },
      { label: 'Build a personal gallery for collected characters', done: true },
      { label: 'Validate the experience with a small private beta', done: false },
    ],
    updates: [
      { date: '2026-11-23', text: 'Added Cellar Dwellers to the tracker. The core scanning, character generation and gallery are built, with a small private beta up next.' },
    ],
    pitch: [
      'Wine discovery can feel like homework when the first things you encounter are scores, tasting jargon and rules about what to buy. I wanted a way to remember a bottle by what made it interesting and where I found it.',
      'Cellar Dwellers turns a label scan into a mythical character. AI researches the wine and uses details like the producer, region, vintage and label to create an original portrait and story. The character goes into a gallery that grows with every bottle you explore.',
      'The idea is to give curious wine drinkers a reason to try unfamiliar bottles, visit wineries and share what they’ve discovered. It also gives producers a new way to tell the stories behind their wines.',
    ],
    screenshots: [
      {
        src: './images/cellar-dweller/gallery.jpg',
        width: 1280,
        height: 1050,
        alt: 'Signed-in gallery showing a searchable collection of wine-inspired characters, including Morgonnet, Nell Narra and Kallin.',
        caption: 'The signed-in gallery, where you can search, filter and sort the characters you’ve collected.',
      },
      {
        src: './images/cellar-dweller/character.jpg',
        width: 450,
        height: 1040,
        alt: 'Mobile character detail for Kallin, a spectral hound inspired by Rib Tickler Shiraz, with Rare and 2024 vintage badges.',
        caption: 'Opening Kallin from the gallery reveals the portrait, rarity, vintage and wine details.',
      },
      {
        src: './images/cellar-dweller/beta-landing.jpg',
        width: 1200,
        height: 800,
        alt: 'The Cellar Dwellers beta landing screen beside Aniscar Valehorn, a mythical bull inspired by a McLaren Vale Tempranillo.',
        caption: 'The private beta landing page and an example of a summoned character.',
      },
      {
        src: './images/cellar-dweller/how-it-works.jpg',
        width: 350,
        height: 697,
        alt: 'Mobile walkthrough explaining how to scan a bottle, summon an avatar, keep the memory and share the story.',
        caption: 'The four steps from scanning a bottle to sharing its story.',
      },
    ],
  },
  {
    id: 'build-a-thing',
    name: 'Build a Thing',
    description: 'A public home for my side projects, with a record of what’s changed and what I’m working on next.',
    status: 'shipped',
    links: [
      { label: 'Source on GitHub', url: 'https://github.com/gkennedy1/build-a-thing' },
    ],
    milestones: [
      { label: 'Build the project dashboard', done: true },
      { label: 'Set up the project data file', done: true },
      { label: 'Publish the site on GitHub Pages', done: true },
    ],
    updates: [
      { date: '2026-11-23', text: 'Redesigned the tracker with bolder typography and a dedicated section for recent updates.' },
      { date: '2026-11-23', text: 'Launched the project tracker on GitHub Pages. This site is the first entry.' },
    ],
  },
];
