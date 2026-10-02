/**
 * preview.mjs — dev helper: rasterise generated SVGs so they can be eyeballed.
 *   node tools/readme-art/preview.mjs assets/hero.svg [more.svg ...]
 * Output goes to /tmp/readme-preview/<name>.png
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const outDir = '/tmp/readme-preview';
await fs.mkdir(outDir, { recursive: true });

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node preview.mjs <file.svg> ...');
  process.exit(1);
}

for (const f of files) {
  const svg = await fs.readFile(f, 'utf8');
  const m = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const height = m ? Number(m[2]) : 600;
  const name = path.basename(f).replace(/\.svg$/, '');
  const out = path.join(outDir, `${name}.png`);
  await sharp(Buffer.from(svg), { density: 96 }).png().toFile(out);
  const st = await fs.stat(out);
  console.log(`${name}.png  ${height}px tall  ${(st.size / 1024).toFixed(0)} KB`);
}
