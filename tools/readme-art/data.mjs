/**
 * data.mjs — the single source of truth for everything the README claims.
 * Numbers are refreshed by tools/readme-art/fetch-stats.sh; copy comes from
 * the previous profile README, restructured.
 */

export const PROFILE = {
  name: 'Mir Kashif',
  alias: 'Loop Lord',
  handle: '@mirkashi',
  role: 'Full-Stack Developer',
  location: 'Islamabad, Pakistan',
  tagline: 'Turning ideas into real products with code, design and a passion for technology.',
  mindset: 'Build. Learn. Grow.',
  closeline: 'Same person, bigger dreams.',
  studio: 'BITSANDBYTESDUDE',
  email: 'mirkashi111@gmail.com',
  links: {
    portfolio: 'https://looplord.vercel.app/',
    github: 'https://github.com/mirkashi',
    linkedin: 'https://www.linkedin.com/in/mir-kashif-28987428b',
    email: 'mailto:mirkashi111@gmail.com',
    x: 'https://x.com/LoopLord10',
    studio: 'https://github.com/BITSANDBYTESDUDE',
    studioSite: 'https://bitsandbytesdude.vercel.app/',
    repos: 'https://github.com/mirkashi?tab=repositories',
  },
};

/* ------------------------------------------------------------------ stack */

export const STACK = [
  {
    title: 'Frontend & UI',
    kicker: 'interface',
    accent: 'cyan',
    note: 'Product surfaces that stay fast and legible on any screen.',
    items: [
      { icon: 'html', name: 'HTML' },
      { icon: 'css', name: 'CSS' },
      { icon: 'javascript', name: 'JavaScript' },
      { icon: 'typescript', name: 'TypeScript' },
      { icon: 'react', name: 'React' },
      { icon: 'nextjs', name: 'Next.js' },
      { icon: 'tailwind', name: 'Tailwind' },
      { icon: 'bootstrap', name: 'Bootstrap' },
      { icon: 'sass', name: 'Sass' },
    ],
  },
  {
    title: 'Backend & Data',
    kicker: 'systems',
    accent: 'teal',
    note: 'APIs, auth flows and data models built to hold real load.',
    items: [
      { icon: 'node', name: 'Node.js' },
      { icon: 'express', name: 'Express' },
      { icon: 'mongodb', name: 'MongoDB' },
      { icon: 'postgres', name: 'PostgreSQL' },
      { icon: 'mysql', name: 'MySQL' },
      { icon: 'python', name: 'Python' },
    ],
  },
  {
    title: 'Tools & Delivery',
    kicker: 'pipeline',
    accent: 'blue',
    note: 'The workflow from first commit to production deploy.',
    items: [
      { icon: 'git', name: 'Git' },
      { icon: 'github', name: 'GitHub' },
      { icon: 'vscode', name: 'VS Code' },
      { icon: 'figma', name: 'Figma' },
      { icon: 'vercel', name: 'Vercel' },
      { icon: 'netlify', name: 'Netlify' },
      { icon: 'docker', name: 'Docker' },
      { icon: 'three', name: 'three.js' },
    ],
  },
];

/* --------------------------------------------------------------- projects */

/** featured = the five cards that earn their own artwork */
export const FEATURED = [
  {
    key: 'looplord',
    name: 'Loop Lord',
    kicker: 'flagship · personal',
    desc: 'The personal portfolio that became the brand — animated sections, project showcase, testimonials and a direct contact flow.',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Netlify'],
    repo: 'https://github.com/BITSANDBYTESDUDE/Looplord',
    live: 'https://looplord.vercel.app/',
    liveLabel: 'looplord.vercel.app',
    accent: 'violet',
    wide: true,
    art: 'portfolio',
  },
  {
    key: 'smart-profits',
    name: 'Smart Profits',
    kicker: 'saas · studio',
    desc: 'Business finance SaaS with registration, an advisor flow and a scenario simulator — every figure computed server-side.',
    tech: ['TypeScript', 'Next.js', 'Vercel'],
    repo: 'https://github.com/BITSANDBYTESDUDE/Smart-Profits',
    live: 'https://smart-profits-ruddy.vercel.app',
    liveLabel: 'smart-profits-ruddy.vercel.app',
    accent: 'teal',
    preview: 'smart-profits.jpg',
    focus: 0.18,
  },
  {
    key: 'actiondoc',
    name: 'ActionDoc AI',
    kicker: 'ai · studio',
    desc: 'AI document intelligence: it pulls tasks, owners and deadlines out of business documents as suggestions a human approves.',
    tech: ['TypeScript', 'Next.js', 'pdf.js', 'Zod'],
    repo: 'https://github.com/BITSANDBYTESDUDE/ActionDoc-AI',
    live: null,
    accent: 'violet',
    art: 'docToTasks',
  },
  {
    key: 'sitepulse',
    name: 'SitePulse',
    kicker: 'audit engine · studio',
    desc: 'Point it at any public URL and get an evidence-based health audit — performance, SEO, accessibility, security and more.',
    tech: ['Next.js 14', 'Express', 'Playwright', 'SSE', 'MongoDB'],
    repo: 'https://github.com/BITSANDBYTESDUDE/Website-Health-Audit',
    live: 'https://sitepulse-rho.vercel.app',
    liveLabel: 'sitepulse-rho.vercel.app',
    accent: 'cyan',
    art: 'gauge',
  },
  {
    key: '9t-angle',
    name: '9T-Angle Operations',
    kicker: 'platform · studio',
    desc: 'Agency management for tasks, targets, attendance and performance — with a weighted scoring engine and scheduled alerts.',
    tech: ['Next.js 16', 'React 19', 'Express 5', 'MongoDB', 'Recharts'],
    repo: 'https://github.com/BITSANDBYTESDUDE/9T-Angle-Management',
    live: null,
    accent: 'blue',
    art: 'chart',
  },
];

/** everything else, compact — grouped so the section stays readable */
export const MORE_WORK = [
  {
    group: 'STUDIO · BITSANDBYTESDUDE',
    items: [
      { name: 'PDF Contact Extractor', desc: 'offline OCR → xlsx/csv', repo: 'https://github.com/BITSANDBYTESDUDE/PDF-Contact-Extractor', live: 'https://pdf-contact-extractor-gamma.vercel.app' },
      { name: 'ReportHub', desc: 'skeuomorphic MERN reporting', repo: 'https://github.com/BITSANDBYTESDUDE/report-hub', live: 'https://report-hub-ivory.vercel.app' },
      { name: 'SmartOrderReader', desc: 'invoice OCR → CSV · Python', repo: 'https://github.com/BITSANDBYTESDUDE/SmartOrderReader' },
      { name: 'Solar Expert', desc: 'MERN content platform', repo: 'https://github.com/BITSANDBYTESDUDE/solr-blog' },
      { name: 'DevToolkit', desc: 'client-side developer utilities', repo: 'https://github.com/BITSANDBYTESDUDE/DevToolkit', live: 'https://dev-toolkit-bitsandbytesdude.vercel.app/' },
    ],
  },
  {
    group: 'PERSONAL · @MIRKASHI',
    items: [
      { name: 'Barber Master', desc: 'local business site', repo: 'https://github.com/mirkashi/Barber-master', live: 'https://mirkashi.github.io/Barber-master/' },
      { name: 'AquaGrow', desc: 'final-year aquaponics storefront', repo: 'https://github.com/mirkashi/AquaGrow' },
      { name: 'JavaScript Course', desc: '123 commits of practice', repo: 'https://github.com/mirkashi/JavaScript-course' },
      { name: 'AI Chatbot', desc: 'LangChain + GPT-4o-mini', repo: 'https://github.com/mirkashi/AI-Chatbot-Using-LLM-Public' },
      { name: 'Weather App', desc: 'live API widget', repo: 'https://github.com/mirkashi/weather-app' },
      { name: 'Food Restaurant', desc: 'menu-first landing', repo: 'https://github.com/mirkashi/Food-Restaurant', live: 'https://mirkashi.github.io/Food-Restaurant/' },
      { name: 'Gym Website', desc: 'fitness landing, TypeScript', repo: 'https://github.com/mirkashi/Gym-website', live: 'https://mirkashi.github.io/Gym-website/' },
      { name: 'Paksky Wings', desc: 'travel site · HTML + CSS', repo: 'https://github.com/mirkashi/Paksky-Wings', live: 'https://mirkashi.github.io/Paksky-Wings/' },
      { name: 'Headphone Web', desc: 'product landing · SCSS', repo: 'https://github.com/mirkashi/Headphone-web' },
      { name: 'Shoe Store', desc: 'landing page', repo: 'https://github.com/mirkashi/shoe-store' },
      { name: '3D Flip Card', desc: 'CSS 3D transform', repo: 'https://github.com/mirkashi/3d-Flip-card', live: 'https://mirprofilecard.netlify.app' },
    ],
  },
];

/* ------------------------------------------------------------ about rails */

export const TRAITS = [
  { k: 'WEB DEVELOPMENT', v: 'responsive product UI, shipped' },
  { k: 'PROBLEM SOLVING', v: 'architecture built to grow' },
  { k: 'CONTINUOUS LEARNING', v: 'TypeScript · WebGL · AI tooling' },
  { k: 'OPEN TO OPPORTUNITIES', v: 'freelance · collab · full-time' },
];

export const PROCESS = [
  ['DISCOVER', 'goals, users, constraints'],
  ['DESIGN', 'layout, type, motion'],
  ['BUILD', 'typed, reviewed, tested'],
  ['SHIP', 'preview → production'],
  ['IMPROVE', 'measure, refine, repeat'],
];

export const PRINCIPLES = [
  ['Motion with intent', 'animation guides attention — it never competes with the content.'],
  ['Evidence over vibes', 'real crawls, real numbers, real API data — no mocked dashboards.'],
  ['Ship, then sharpen', 'production deploy first, polish on top of something that already works.'],
];
