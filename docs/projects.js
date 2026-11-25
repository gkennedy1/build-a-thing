const projects = [
  {
    id: 'cellar-dweller',
    slug: 'cellar-dwellers',
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
        caption: 'Opening an avatar from the gallery reveals the portrait, rarity, vintage and wine details.',
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
    id: 'buschoppa',
    name: 'BusChoppa',
    description: 'Track Adelaide Metro buses and trains live, see predicted arrivals at your favourite stop or station, and find out if there’s time for coffee before you leave.',
    status: 'shipped',
    links: [
      { label: 'Visit BusChoppa', url: 'https://buschoppa-adelaide.dbg-technolo-7649.chatgpt.site/' },
    ],
    milestones: [
      { label: 'Track live buses and predict arrivals at a favourite stop', done: true },
      { label: 'Add a coffee-or-run cue based on walking time', done: true },
      { label: 'Add live train tracking and station arrivals', done: true },
      { label: 'Save separate route and stop preferences for Home and Work', done: true },
    ],
    updates: [
      { date: '2026-11-25', text: 'Added BusChoppa to the tracker. The live app covers Adelaide Metro buses and trains, with separate Home and Work favourites.' },
    ],
    pitch: [
      'When I’m about to head out, I want to know when my bus or train will reach my stop and whether I have time to make a coffee. BusChoppa uses live Adelaide Metro arrival predictions, my walking time and my coffee-making time to tell me when to leave.',
      'I can watch the vehicles on a map and save separate Home and Work favourites for the two ends of my commute. The app keeps those preferences in the browser so I can open it and go straight to my routes.',
    ],
    screenshots: [
      {
        src: './images/buschoppa/live-map.jpg',
        width: 1280,
        height: 800,
        alt: 'BusChoppa showing live Gawler line trains on a map, predicted arrivals at Salisbury Railway Station, and a Leave now cue.',
        caption: 'Live train positions and station arrival predictions, with a cue based on walking and coffee-making time.',
      },
      {
        src: './images/buschoppa/setup.jpg',
        width: 1280,
        height: 800,
        alt: 'BusChoppa’s Home setup with the Gawler line, Adelaide Railway Station, and walking and coffee timing fields.',
        caption: 'Set up a favourite by choosing services, a stop or station, and your timing.',
      },
    ],
  },
  {
    id: 'art-and-memory',
    name: 'Art & Memory',
    description: 'An archive for the art you live with and the stories behind it. Browse the collection or point your phone camera at a registered artwork to discover its memories.',
    status: 'in-progress',
    links: [
      { label: 'Visit Art & Memory', url: 'https://art-and-memory-greg-trial.dbg-technolo-7649.chatgpt.site/' },
    ],
    milestones: [
      { label: 'Build an owner studio for artworks and memories', done: true },
      { label: 'Share a collection through visitor links and printable QR codes', done: true },
      { label: 'Add on-device camera recognition for registered artworks', done: true },
      { label: 'Test recognition with artworks in place on iPhone and Android', done: false },
    ],
    updates: [
      { date: '2026-11-25', text: 'Added Art & Memory to the tracker. The hosted trial is up, with in-home phone testing next.' },
    ],
    pitch: [
      'A piece of art at home can bring back the place it came from, the person who gave it to you, or the time you first saw it. Art & Memory gives those stories a place alongside the work itself. Collection owners can add photos and dates, and choose which memories to keep private.',
      'Invited visitors can browse the collection without an account or point their phone camera at a registered piece. Recognition runs on the phone, and the same stories are available from the catalogue.',
    ],
    screenshots: [
      {
        src: './images/art-and-memory/landing.jpg',
        width: 1280,
        height: 800,
        alt: 'Art & Memory home page with a landscape from the illustrative collection and options to browse or open the camera.',
        caption: 'The public preview opens with a featured piece from the illustrative collection.',
      },
      {
        src: './images/art-and-memory/story.jpg',
        width: 1280,
        height: 800,
        alt: 'Artwork detail for Somewhere, in summer, with a landscape on the left and a sample memory on the right.',
        caption: 'Opening an artwork reveals its details and the memories attached to it.',
      },
    ],
  },
  {
    id: '8-minutes',
    name: '8 minutes',
    description: 'A silent kitchen timer that repeats every eight minutes. Tap anywhere to restart it, or install it on your phone to use it offline.',
    status: 'shipped',
    links: [
      { label: 'Visit 8 minutes', url: 'https://eight-minutes.dbg-technolo-7649.chatgpt.site/' },
    ],
    milestones: [
      { label: 'Build a silent repeating countdown with tap-to-restart', done: true },
      { label: 'Support installation and offline use', done: true },
      { label: 'Publish the web app', done: true },
    ],
    updates: [
      { date: '2026-11-25', text: 'Added 8 minutes to the tracker. The timer is live and can be installed for offline use.' },
    ],
    pitch: [
      '8 minutes is a kitchen timer for jobs that come in rounds. Press Start and turn your phone sideways for a large countdown. It starts a fresh eight-minute cycle silently each time it reaches zero, and a tap restarts it early.',
      'The timer starts a fresh cycle when you return from another app. Open it once online so it can prepare for offline use, then you can run it from your phone’s home screen.',
    ],
    screenshots: [
      {
        src: './images/8-minutes/countdown.jpg',
        width: 1180,
        height: 664,
        alt: 'A landscape countdown showing 8:00 in large cream digits on a black background.',
        caption: 'The landscape countdown at the start of an eight-minute cycle.',
      },
      {
        src: './images/8-minutes/start.jpg',
        width: 1180,
        height: 664,
        alt: 'The 8 minutes start screen with a Start button and a collapsible phone installation guide.',
        caption: 'Start the timer or open the home-screen installation instructions.',
      },
    ],
  },
  {
    id: 'build-a-thing',
    name: 'Build a Thing',
    description: 'A public home for my side projects, with a record of what’s changed and what I’m working on next.',
    status: 'shipped',
    links: [],
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
