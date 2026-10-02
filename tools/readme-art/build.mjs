/**
 * build.mjs — writes every asset used by README.md into /assets.
 *
 *   node tools/readme-art/build.mjs            # build
 *   node tools/readme-art/build.mjs --preview  # build + rasterise PNG previews
 *
 * Panels  → SVG (crisp at any width, animated with SMIL).
 * Photos  → WebP with alpha, so the framed previews keep rounded corners.
 * Buttons → small SVGs, which is how the hero CTAs stay clickable.
 */

import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { F, txt, icon, svg } from './theme.mjs';
import { heroSvg, aboutSvg, stackSvg } from './sections.mjs';
import { pulseSvg, closingSvg } from './signals.mjs';
import { projectsHeadSvg, archiveSvg, dividerSvg, studioSvg } from './archive.mjs';
import { contribSvg } from './contrib.mjs';
import { FEATURED, PROFILE } from './data.mjs';
import { cardSvg, photoData, CARD_GEO, PREVIEW_URL } from './projects.mjs';
import { wrap } from './sections.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const ASSETS = path.join(ROOT, 'assets');
const SHOTS = path.join(ROOT, 'profile-site/assets/img');
const PREVIEW_DIR = '/tmp/readme-preview';

const written = [];
const write = async (name, data) => {
  const file = path.join(ASSETS, name);
  await fs.writeFile(file, data);
  const size = (await fs.stat(file)).size;
  written.push([name, size]);
  return file;
};

/* ------------------------------------------------------- preview framing */

/** photographic preview: chrome bar + screenshot, alpha for rounded corners */
async function photoTop({ src, w, h, url, accent, out }) {
  const barH = Math.round(h * 0.155);
  const shotH = h - barH;
  const shot = await sharp(src)
    .resize(w, shotH, { fit: 'cover', position: 'top' })
    .modulate({ brightness: 0.9 })
    .toBuffer();

  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${shotH}"><path d="${bottomMask(w, shotH, 14)}" fill="#fff"/></svg>`,
  );
  const maskedShot = await sharp(shot).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  const overlay = Buffer.from(chromeOverlay(w, h, barH, url, accent));

  await sharp({ create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: maskedShot, top: barH, left: 0 },
      { input: overlay, top: 0, left: 0 },
    ])
    .webp({ quality: 76, effort: 6, smartSubsample: true })
    .toFile(path.join(ASSETS, out));

  const size = (await fs.stat(path.join(ASSETS, out))).size;
  written.push([out, size]);
}

/* ---------------------------------------------- hero call-to-action pills */

function pillSvg({ label, sub, glyph, accent, w, href }) {
  const H = 54;
  return svg({
    w,
    h: H,
    title: `${label} — ${sub}`,
    defs: `<defs>
      <linearGradient id="pFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#101B29"/><stop offset="1" stop-color="#080E17"/>
      </linearGradient>
      <linearGradient id="pSheen" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/>
        <stop offset=".5" stop-color="#FFFFFF" stop-opacity=".18"/>
        <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="pGlow" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${accent}" stop-opacity="0"/>
        <stop offset=".5" stop-color="${accent}" stop-opacity=".85"/>
        <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
      </linearGradient>
    </defs>`,
    children:
      `<ellipse cx="${w / 2}" cy="30" rx="${w * 0.42}" ry="20" fill="url(#pGlow)" opacity=".22" filter="url(#pblur)"/>` +
      `<defs><filter id="pblur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9"/></filter></defs>` +
      `<rect x="0.5" y="0.5" width="${w - 1}" height="${H - 1}" rx="12" fill="url(#pFill)" stroke="#1E3552"/>` +
      `<rect x="1" y="1" width="${w - 2}" height="1" fill="url(#pSheen)"/>` +
      `<rect x="${w / 2 - 26}" y="0.5" width="52" height="1.4" fill="url(#pGlow)" opacity=".9"/>` +
      icon({ name: glyph, x: 20, y: 19, size: 16, fill: accent, opacity: 0.95 }) +
      txt({ x: 46, y: 25, s: label, size: 12.5, family: F.mono, fill: '#F2F7FD', spacing: 1.6, weight: 600 }) +
      txt({ x: 46, y: 41, s: sub, size: 10, family: F.mono, fill: '#7C8EA9', spacing: 0.4 }) +
      txt({ x: w - 18, y: 32, s: '↗', size: 13, family: F.mono, fill: accent, anchor: 'end', opacity: 0.85 }),
  });
}

/* -------------------------------------------------------------- build all */

async function build() {
  await fs.mkdir(ASSETS, { recursive: true });
  // drop assets from earlier revisions so the folder only ever holds the current set
  for (const f of await fs.readdir(ASSETS)) {
    if (/-top\.(svg|webp)$/.test(f)) await fs.rm(path.join(ASSETS, f), { force: true });
  }

  // full-width panels
  await write('hero.svg', heroSvg());
  await write('about.svg', aboutSvg());
  await write('stack.svg', stackSvg());
  await write('projects-head.svg', projectsHeadSvg());
  await write('archive.svg', archiveSvg());
  await write('contrib.svg', contribSvg());
  await write('pulse.svg', pulseSvg());
  await write('closing.svg', closingSvg());
  await write('divider.svg', dividerSvg());
  await write('studio.svg', studioSvg());

  // hero CTA buttons
  const ctas = [
    { name: 'btn-portfolio.svg', label: 'PORTFOLIO', sub: 'looplord.vercel.app', glyph: 'globe', accent: '#22D3EE', w: 226 },
    { name: 'btn-github.svg', label: 'GITHUB', sub: '@mirkashi', glyph: 'github', accent: '#8AB8FF', w: 186 },
    { name: 'btn-linkedin.svg', label: 'LINKEDIN', sub: 'mir-kashif', glyph: 'linkedin', accent: '#60A5FA', w: 190 },
    { name: 'btn-email.svg', label: 'EMAIL', sub: 'mirkashi111@gmail.com', glyph: 'gmail', accent: '#A78BFA', w: 262 },
  ];
  for (const cta of ctas) await write(cta.name, pillSvg(cta));

  // project cards — one self-contained SVG each
  for (const [i, p] of FEATURED.entries()) {
    const geo = p.wide ? CARD_GEO.feature : CARD_GEO.grid;
    const url = PREVIEW_URL[p.key] || 'preview';
    const photo = p.preview
      ? await photoData(sharp, path.join(SHOTS, p.preview), geo.w, geo.topH, Math.round(geo.topH * 0.16), {
          brightness: 0.92,
          focus: p.focus ?? 0,
        })
      : null;
    const lines = wrap(p.desc, 116).slice(0, 3);
    await write(
      `card-${p.key}.svg`,
      cardSvg({ ...p, descLines: lines, index: i + 1 }, { ...geo, photo, url }),
    );
    if (photo) console.log(`  ↳ ${p.key}: ${(photo.length / 1024).toFixed(1)} KB embedded screenshot`);
  }

  // report
  let total = 0;
  for (const [name, size] of written) {
    total += size;
    console.log(`${name.padEnd(28)} ${(size / 1024).toFixed(1).padStart(7)} KB`);
  }
  console.log(`${'TOTAL'.padEnd(28)} ${(total / 1024).toFixed(1).padStart(7)} KB  (${written.length} files)`);

  if (process.argv.includes('--preview')) {
    const { previewAll } = await import('./preview-cards.mjs');
    await previewAll(written.map(([n]) => n));
  }
}

await build();
