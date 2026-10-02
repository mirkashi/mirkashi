/**
 * contrib.mjs — the contribution grid.
 *
 * Rendered from tools/readme-art/data/contributions.json (refreshed by
 * fetch-stats.sh), so no third-party widget decides what this looks like.
 * The animation is a single scanning column plus a soft sweep: alive, never
 * flickering.
 */

import { C, F, num, txt, label, baseDefs, svg, sheen } from './theme.mjs';
import { sectionHead, cornerTicks, frameOpen, frameBg, frameClose, W } from './sections.mjs';
import stats from './data/contributions.json' with { type: 'json' };

const CELL = 13;
const GAP = 4.4;
const PITCH = CELL + GAP;

const LEVEL = ['#0C1C29', '#123F55', '#0E7490', '#22D3EE', '#7FE3F5'];
const LEVEL_OPACITY = [1, 1, 0.92, 0.9, 0.95];

function level(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

export function contribSvg() {
  const weeks = stats.weeks;
  const H = 384;
  const gridW = weeks.length * PITCH - GAP;
  const gridX = Math.round((W - gridW) / 2);
  const gridY = 158;
  const gridH = 7 * PITCH - GAP;

  /* cells */
  let cells = '';
  weeks.forEach((week, wi) => {
    week.forEach((count, di) => {
      const lv = level(count);
      const x = gridX + wi * PITCH;
      const y = gridY + di * PITCH;
      cells +=
        `<rect x="${num(x)}" y="${num(y)}" width="${CELL}" height="${CELL}" rx="3" fill="${LEVEL[lv]}" opacity="${LEVEL_OPACITY[lv]}">` +
        (count > 0 && lv >= 3 ? `<title>${count} contribution${count === 1 ? '' : 's'}</title>` : '') +
        `</rect>`;
    });
  });

  /* month labels — one label per month, anchored on its first week */
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthStarts = [];
  stats.firstDays.forEach((iso, wi) => {
    const m = new Date(iso + 'T00:00:00Z').getUTCMonth();
    if (!monthStarts.length || monthStarts[monthStarts.length - 1].m !== m) monthStarts.push({ m, wi });
  });
  // the range starts mid-month: drop a leading stub that would collide with the next label
  if (monthStarts.length > 1 && monthStarts[1].wi - monthStarts[0].wi < 3) monthStarts.shift();
  let months = '';
  monthStarts.forEach((ms) => {
    months += txt({
      x: gridX + ms.wi * PITCH,
      y: gridY - 18,
      s: MONTHS[ms.m],
      size: 9.5,
      family: F.mono,
      fill: C.text4,
      spacing: 1.2,
    });
  });

  /* weekday rails */
  const dayLabels =
    txt({ x: gridX - 44, y: gridY + 1 * PITCH + 10, s: 'MON', size: 9, family: F.mono, fill: C.text4, spacing: 1 }) +
    txt({ x: gridX - 44, y: gridY + 3 * PITCH + 10, s: 'WED', size: 9, family: F.mono, fill: C.text4, spacing: 1 }) +
    txt({ x: gridX - 44, y: gridY + 5 * PITCH + 10, s: 'FRI', size: 9, family: F.mono, fill: C.text4, spacing: 1 });

  /* stats strip */
  const s = [
    [stats.contributions.toLocaleString('en-US'), 'CONTRIBUTIONS'],
    [String(stats.longestStreak), 'LONGEST STREAK'],
    [String(stats.currentStreak), 'CURRENT STREAK'],
    [String(stats.activeDays), 'ACTIVE DAYS'],
    [`${stats.bestDay.count}`, 'BEST DAY'],
  ];
  const sw = (W - 64) / s.length;
  let strip = '';
  s.forEach(([v, k], i) => {
    const x = 32 + i * sw;
    strip +=
      (i ? `<rect x="${num(x - 1)}" y="286" width="1" height="40" fill="${C.lineSoft}"/>` : '') +
      txt({ x, y: 306, s: v, size: 26, weight: 700, fill: C.white, spacing: -0.6 }) +
      label({ x, y: 324, s: k, size: 9.5, fill: C.text4, spacing: 2.2 });
  });

  /* legend */
  const legendX = W - 32 - 5 * PITCH - 92;
  let legend = txt({ x: legendX - 12, y: 342, s: 'LESS', size: 9, family: F.mono, fill: C.text4, anchor: 'end', spacing: 1 });
  LEVEL.forEach((c, i) => {
    legend += `<rect x="${num(legendX + i * PITCH)}" y="333" width="${CELL - 1}" height="${CELL - 1}" rx="3" fill="${c}" opacity="${LEVEL_OPACITY[i]}"/>`;
  });
  legend += txt({ x: legendX + 5 * PITCH + 10, y: 342, s: 'MORE', size: 9, family: F.mono, fill: C.text4, spacing: 1 });

  /* the scanner: one soft column travelling across the grid */
  const scanW = 120;
  const scanner =
    `<rect x="0" y="${gridY - 6}" width="${scanW}" height="${gridH + 12}" fill="url(#scanGrad)" opacity=".5">` +
    `<animateTransform attributeName="transform" type="translate" values="${num(gridX - scanW)} 0;${num(gridX + gridW)} 0" dur="14s" repeatCount="indefinite"/></rect>`;

  return svg({
    w: W,
    h: H,
    title: `Contribution grid — ${stats.contributions} contributions over the last 12 months`,
    defs:
      baseDefs() +
      `<linearGradient id="scanGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/>
        <stop offset=".5" stop-color="${C.cyanSoft}" stop-opacity=".16"/>
        <stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/>
      </linearGradient>` +
      `<clipPath id="gridClip"><rect x="${num(gridX - 8)}" y="${gridY - 6}" width="${num(gridW + 16)}" height="${gridH + 12}" rx="10"/></clipPath>`,
    children:
      frameOpen({ h: H }) +
      frameBg({ h: H, glow: [0.5, -0.2], glow2: [0.9, 1.05] }) +
      sectionHead({
        y: 74,
        idx: '05',
        kicker: 'CONTRIBUTION GRID',
        title: 'A year of building, in pixels',
        meta: `SINCE ${stats.since} · PUBLIC ACTIVITY ONLY`,
        metaX: 968,
        accent: C.teal,
      }) +
      months +
      dayLabels +
      `<g clip-path="url(#gridClip)">` +
      `<rect x="${num(gridX - 8)}" y="${gridY - 6}" width="${num(gridW + 16)}" height="${gridH + 12}" fill="#070D15"/>` +
      cells +
      scanner +
      `</g>` +
      `<rect x="${num(gridX - 8)}" y="${gridY - 6}" width="${num(gridW + 16)}" height="${gridH + 12}" rx="10" fill="none" stroke="${C.lineSoft}"/>` +
      `<rect x="32" y="256" width="${W - 64}" height="1" fill="${C.lineSoft}"/>` +
      strip +
      legend +
      cornerTicks({ h: H }) +
      frameClose({ h: H }),
  });
}
