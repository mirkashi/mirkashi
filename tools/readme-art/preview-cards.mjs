/**
 * preview-cards.mjs — dev helper used by `build.mjs --preview`.
 * Rasterises generated assets to /tmp/readme-preview so the layout can be
 * checked without pushing. (sharp renders SMIL at its t=0 state.)
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const ASSETS = new URL('../../assets/', import.meta.url).pathname;
const OUT = '/tmp/readme-preview';

export async function previewAll(names) {
  await fs.mkdir(OUT, { recursive: true });
  for (const name of names) {
    if (!name.endsWith('.svg')) continue;
    const src = await fs.readFile(path.join(ASSETS, name));
    const out = path.join(OUT, name.replace(/\.svg$/, '.png'));
    await sharp(src, { density: 96 }).flatten({ background: '#0B0F16' }).png().toFile(out);
  }
  console.log(`previews → ${OUT}`);
}

export const CARD_FILES = [
  'card-looplord.svg',
  'card-smart-profits.svg',
  'card-actiondoc.svg',
  'card-sitepulse.svg',
  'card-9t-angle.svg',
];
