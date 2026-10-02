/**
 * archive.mjs — the projects section header, the compact "more builds" list
 * and the hairline that closes the page.
 */

import { C, F, num, txt, label, panel, baseDefs, svg, sheen } from './theme.mjs';
import { MORE_WORK } from './data.mjs';
import { sectionHead, cornerTicks, frameOpen, frameBg, frameClose, W } from './sections.mjs';

export function projectsHeadSvg() {
  const H = 132;
  return svg({
    w: W,
    h: H,
    title: 'Selected projects — flagship builds first',
    defs: baseDefs(),
    children:
      frameOpen({ h: H }) +
      frameBg({ h: H, glow: [0.86, -0.4], glow2: [0.06, -0.5] }) +
      sectionHead({
        y: 76,
        idx: '03',
        kicker: 'SELECTED PROJECTS',
        title: 'Work that shipped',
        meta: '5 FEATURED · 16 PUBLIC REPOS',
        metaX: 968,
        accent: C.cyanSoft,
      }) +
      cornerTicks({ h: H }) +
      frameClose({ h: H }),
  });
}

export function archiveSvg() {
  const H = 470;
  const cols = [
    { x: 32, w: 464 },
    { x: 512, w: 456 },
  ];
  let body = '';
  MORE_WORK.forEach((group, gi) => {
    const c = cols[gi];
    const rows = group.items;
    body +=
      panel({ x: c.x, y: 108, w: c.w, h: 306, r: 16, fill: 'url(#panelFill)', stroke: C.line }) +
      `<rect x="${num(c.x + 1)}" y="109" width="${num(c.w - 2)}" height="1" fill="url(#topSheen)"/>` +
      label({ x: c.x + 22, y: 138, s: group.group, size: 10, fill: gi ? C.cyanSoft : C.violet, spacing: 2.4 }) +
      txt({ x: c.x + c.w - 22, y: 138, s: `${group.items.length} BUILDS`, size: 10, family: F.mono, fill: C.text4, anchor: 'end', spacing: 1.4 }) +
      `<rect x="${c.x + 22}" y="152" width="${c.w - 44}" height="1" fill="${C.lineSoft}"/>` +
      rows
        .map((it, i) => {
          const step = rows.length > 8 ? 18 : 20;
          const y = 180 + i * step;
          return (
            txt({ x: c.x + 22, y, s: it.name, size: 12.2, fill: C.text, weight: 500 }) +
            txt({ x: c.x + 186, y, s: it.desc, size: 11.2, family: F.mono, fill: C.text4 }) +
            (it.live ? `<circle cx="${num(c.x + c.w - 26)}" cy="${num(y - 4)}" r="3" fill="${C.teal}" opacity=".9"/>` : '')
          );
        })
        .join('');
  });

  // footer rails: the studio column has room to spare, so it carries the links
  body +=
    `<rect x="54" y="376" width="420" height="1" fill="url(#arcRule40)"/>` +
    txt({ x: 54, y: 398, s: 'github.com/BITSANDBYTESDUDE', size: 11, family: F.mono, fill: C.text3 }) +
    txt({ x: 474, y: 398, s: 'STUDIO SITE →', size: 10.5, family: F.mono, fill: C.violet, anchor: 'end', spacing: 1.4, weight: 600 }) +
    `<rect x="534" y="376" width="412" height="1" fill="url(#arcRule40)"/>` +
    txt({ x: 534, y: 398, s: 'github.com/mirkashi — 16 public repos', size: 11, family: F.mono, fill: C.text3 }) +
    txt({ x: 946, y: 398, s: 'ALL REPOS →', size: 10.5, family: F.mono, fill: C.cyanSoft, anchor: 'end', spacing: 1.4, weight: 600 });

  return svg({
    w: W,
    h: H,
    title: 'More builds — the rest of the public repositories',
    defs:
      baseDefs() +
      `<linearGradient id="arcRule40" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".5"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>` +
      `<linearGradient id="arcRule615" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.violet}" stop-opacity=".5"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></linearGradient>`,
    children:
      frameOpen({ h: H }) +
      frameBg({ h: H, glow: [0.5, -0.3], glow2: [0.95, 0.7] }) +
      label({ x: 32, y: 62, s: '03 / SELECTED PROJECTS · CONTINUED', size: 11, fill: C.text4, spacing: 3.2 }) +
      txt({ x: 32, y: 92, s: 'More builds', size: 22, weight: 650, fill: C.white, spacing: -0.2 }) +
      txt({ x: W - 32, y: 92, s: '● LIVE DEMO AVAILABLE', size: 10.5, family: F.mono, fill: C.text4, anchor: 'end', spacing: 2 }) +
      body +
      txt({ x: 32, y: 446, s: 'EVERY REPOSITORY IS PUBLIC — PICK ONE AND READ THE CODE', size: 10, family: F.mono, fill: C.text4, spacing: 2 }) +
      cornerTicks({ h: H }) +
      frameClose({ h: H }),
  });
}

/** the studio strip: one designed panel instead of a third-party badge */
export function studioSvg() {
  const H = 108;
  const y = 22;
  const x = 32;
  return svg({
    w: W,
    h: H,
    title: 'BITSANDBYTESDUDE — software studio',
    defs: baseDefs(),
    children:
      frameOpen({ h: H }) +
      frameBg({ h: H, glow: [0.84, -0.6], glow2: [0.1, 1.9] }) +
      `<rect x="${x}" y="${y}" width="${W - 64}" height="64" rx="14" fill="url(#panelFill)" stroke="${C.line}"/>` +
      `<rect x="${x + 1}" y="${y + 1}" width="${W - 66}" height="1" fill="url(#topSheen)"/>` +
      `<rect x="${x + 22}" y="${y + 20}" width="22" height="22" rx="7" fill="#0A111C" stroke="${C.lineGlow}"/>` +
      `<path d="M${x + 33} ${y + 26} l6 5 -6 5 -6 -5 Z" fill="${C.violet}" opacity=".9"/>` +
      txt({ x: x + 56, y: y + 28, s: 'BITSANDBYTESDUDE', size: 14, family: F.mono, fill: C.white, spacing: 2.6, weight: 600 }) +
      txt({ x: x + 56, y: y + 46, s: 'a forward-thinking software studio — 10 repositories, contributor on 9', size: 11.5, fill: C.text4 }) +
      `<rect x="${W - 260}" y="${y + 20}" width="1" height="24" fill="${C.lineSoft}"/>` +
      txt({ x: W - 240, y: y + 28, s: 'STUDIO GITHUB  →', size: 10.5, family: F.mono, fill: C.violet, spacing: 1.6, weight: 600 }) +
      txt({ x: W - 240, y: y + 42, s: 'github.com/BITSANDBYTESDUDE', size: 10.5, family: F.mono, fill: C.text4 }) +
      `<rect x="${W - 118}" y="${y + 20}" width="1" height="24" fill="${C.lineSoft}"/>` +
      txt({ x: W - 98, y: y + 28, s: 'WEBSITE  →', size: 10.5, family: F.mono, fill: C.cyanSoft, spacing: 1.6, weight: 600 }) +
      txt({ x: W - 98, y: y + 42, s: 'bitsandbytesdude.vercel.app', size: 10.5, family: F.mono, fill: C.text4 }) +
      frameClose({ h: H }),
  });
}

/** slim animated hairline used above the footer */
export function dividerSvg() {
  const H = 6;
  return svg({
    w: W,
    h: H,
    title: 'divider',
    defs:
      baseDefs({ grid: false }) +
      sheen({
        id: 'divSweep',
        x0: -400,
        x1: W + 400,
        band: 420,
        dur: 7,
        stops: [
          [0, C.cyan, 0],
          [0.4, C.cyan, 0.9],
          [0.6, C.violet, 0.9],
          [1, C.violet, 0],
        ],
      }),
    children:
      `<rect x="0" y="2" width="${W}" height="1" fill="${C.lineSoft}"/>` +
      `<rect x="0" y="2" width="${W}" height="1.6" fill="url(#divSweep)"/>`,
  });
}
