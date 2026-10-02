/**
 * projects.mjs — the "Selected Projects" system.
 *
 * One asset per project: a self-contained SVG that holds the framed preview
 * (a real screenshot embedded as a data URI, or generated vector art), the
 * title block, tech chips and the link rail. Single asset = no seam between
 * two <img> tags = the card reads as one panel on GitHub.
 */

import { C, F, esc, rng, num, icon, txt, label, rule, baseDefs } from './theme.mjs';

export const CARD_BG = '#080D16';
const ACCENT = { cyan: C.cyan, teal: C.teal, violet: C.violet, blue: C.blueSoft };
const RADIUS = 16;

/* ------------------------------------------------------------ masks */

export const topMask = (w, h, r) =>
  `M0 ${r} A${r} ${r} 0 0 1 ${r} 0 H${w - r} A${r} ${r} 0 0 1 ${w} ${r} V${h} H0 Z`;
export const bottomMask = (w, h, r) =>
  `M0 0 H${w} V${h - r} A${r} ${r} 0 0 1 ${w - r} ${h} H${r} A${r} ${r} 0 0 1 0 ${h - r} Z`;

/**
 * The screenshot strip, embedded straight into the card SVG as a JPEG data URI
 * (JPEG + an SVG clipPath is smaller than carrying an alpha channel, and every
 * browser renders data URIs inside SVG-in-<img>: webp does not, so don't).
 */
export async function photoData(sharp, src, w, h, barH, { brightness = 0.9, quality = 72, focus = 0 } = {}) {
  const shotH = h - barH;
  const meta = await sharp(src).metadata();
  const srcBand = Math.round(shotH * (meta.width / w)); // height of the region we keep
  const top = Math.round(Math.max(0, Math.min(meta.height - srcBand, focus * (meta.height - srcBand))));
  return sharp(src)
    .extract({ left: 0, top, width: meta.width, height: Math.min(srcBand, meta.height - top) })
    .resize(w, shotH, { fit: 'cover' })
    .modulate({ brightness })
    .jpeg({ quality, chromaSubsampling: '4:2:0', mozjpeg: true })
    .toBuffer();
}

/* -------------------------------------------------------- window chrome */

function chrome(w, h, barH, url, accent) {
  const dots = [0, 1, 2]
    .map((i) => `<circle cx="${22 + i * 15}" cy="${num(barH / 2)}" r="4" fill="#1E324A"/>`)
    .join('');
  return (
    `<rect width="${w}" height="${barH}" fill="#0A1119"/>` +
    `<rect width="${w}" height="1" fill="url(#winSheen)"/>` +
    dots +
    txt({ x: 76, y: barH / 2 + 3.5, s: url, size: 10.5, family: F.mono, fill: C.text4, spacing: 0.6 }) +
    `<circle cx="${num(w - 22)}" cy="${num(barH / 2)}" r="3.2" fill="${accent}" opacity=".8">
      <animate attributeName="opacity" values=".8;.25;.8" dur="3.4s" repeatCount="indefinite"/></circle>` +
    `<rect x="0" y="${num(barH - 1)}" width="${w}" height="1" fill="${C.lineSoft}"/>`
  );
}

/* --------------------------------------------------- generated previews */

function artDoc(w, h, barH, accent) {
  const top = barH;
  const cy = top + (h - top) / 2;
  const docX = w * 0.12;
  const docW = w * 0.28;
  const docH = (h - top) * 0.6;
  const docY = cy - docH / 2;
  let lines = '';
  for (let i = 0; i < 6; i++) {
    lines += `<rect x="${num(docX + 20)}" y="${num(docY + 54 + i * 15)}" width="${num(docW - 40 - (i % 3) * 20)}" height="5" rx="2.5" fill="#33455C"/>`;
  }
  const tasks = [
    ['Design review', 'Fri'],
    ['Send invoice', 'Mon'],
    ['Ship v2', 'Wed'],
  ];
  const tx = w * 0.56;
  let cards = '';
  tasks.forEach(([t, d], i) => {
    const ty = cy - 64 + i * 44;
    cards +=
      `<rect x="${num(tx)}" y="${num(ty)}" width="${num(w * 0.31)}" height="34" rx="9" fill="#0B1420" stroke="#1E3752"/>` +
      `<circle cx="${num(tx + 18)}" cy="${num(ty + 17)}" r="6" fill="none" stroke="${accent}" stroke-width="1.6" opacity="${0.5 + i * 0.2}"/>` +
      `<path d="M${num(tx + 15)} ${num(ty + 17)} l2.5 2.5 4.5 -5" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>` +
      txt({ x: tx + 34, y: ty + 21, s: t, size: 12, fill: C.text, weight: 500 }) +
      txt({ x: tx + w * 0.31 - 16, y: ty + 21, s: d, size: 10.5, family: F.mono, fill: C.text4, anchor: 'end' });
  });
  let flow = '';
  for (let i = 0; i < 3; i++) {
    flow += `<path d="M${num(docX + docW + 14 + i * 6)} ${num(docY + 46 + i * 26)} h${num(w * 0.05)}" stroke="${accent}" stroke-width="1.4" opacity=".45" fill="none"/>`;
  }
  return (
    txt({ x: num(w * 0.03), y: num(barH + 24), s: 'DOCUMENT', size: 9.5, family: F.mono, fill: C.text4, spacing: 2 }) +
    `<rect x="${num(docX)}" y="${num(docY)}" width="${num(docW)}" height="${num(docH)}" rx="10" fill="#0B1320" stroke="#223A56"/>` +
    `<rect x="${num(docX)}" y="${num(docY)}" width="${num(docW)}" height="32" rx="10" fill="#12203A" opacity=".7"/>` +
    txt({ x: docX + 20, y: docY + 22, s: 'Q3-brief.pdf', size: 11, family: F.mono, fill: C.text2 }) +
    lines +
    flow +
    `<path d="M${num(w * 0.44)} ${num(cy)} h${num(w * 0.045)}" stroke="${accent}" stroke-width="2" fill="none" stroke-dasharray="6 5">
      <animate attributeName="stroke-dashoffset" values="0;-22" dur="1.2s" repeatCount="indefinite"/></path>` +
    `<path d="M${num(w * 0.485)} ${num(cy - 5)} l6 5 -6 5" fill="none" stroke="${accent}" stroke-width="1.8"/>` +
    cards +
    txt({ x: num(tx), y: num(cy - 78), s: 'EXTRACTED ACTIONS · AWAITING APPROVAL', size: 9.5, family: F.mono, fill: accent, spacing: 1.6, opacity: 0.9 })
  );
}

function artGauge(w, h, barH, accent) {
  const cy = barH + 70;
  const cx = w * 0.2;
  const r = 46;
  const deg = (d) => (d * Math.PI) / 180;
  const pt = (d, rad) => [cx + Math.cos(deg(d)) * rad, cy + Math.sin(deg(d)) * rad];
  let ticks = '';
  for (let i = 0; i < 30; i++) {
    const d = 166 + (i / 29) * 208;
    const on = i < 23;
    const [x1, y1] = pt(d, r);
    const [x2, y2] = pt(d, r + (i % 5 === 0 ? 11 : 6));
    ticks += `<path d="M${num(x1)} ${num(y1)} L${num(x2)} ${num(y2)}" stroke="${on ? accent : '#26405A'}" stroke-width="${i % 5 === 0 ? 2 : 1.2}" opacity="${on ? 0.9 : 0.6}"/>`;
  }
  const [sx, sy] = pt(166, r);
  const [ex, ey] = pt(374, r);
  const sectors = [
    ['PERFORMANCE', '96'],
    ['SEO', '91'],
    ['ACCESSIBILITY', '88'],
  ];
  const bx = w * 0.46;
  const bw = w - bx - 34;
  let bars = '';
  sectors.forEach(([name, val], i) => {
    const by = barH + 26 + i * 42;
    bars +=
      txt({ x: num(bx), y: num(by), s: name, size: 9.5, family: F.mono, fill: C.text4, spacing: 1.8 }) +
      txt({ x: num(bx + bw), y: num(by), s: val, size: 13, family: F.mono, fill: C.text, anchor: 'end', weight: 600 }) +
      `<rect x="${num(bx)}" y="${num(by + 10)}" width="${num(bw)}" height="4" rx="2" fill="#182B41"/>` +
      `<rect x="${num(bx)}" y="${num(by + 10)}" width="${num((bw * Number(val)) / 100)}" height="4" rx="2" fill="${accent}">
        <animate attributeName="opacity" values="1;.45;1" dur="${(3 + i).toFixed(1)}s" repeatCount="indefinite"/></rect>`;
  });
  return (
    ticks +
    `<path d="M${num(sx)} ${num(sy)} A${num(r)} ${num(r)} 0 0 1 ${num(ex)} ${num(ey)}" fill="none" stroke="${accent}" stroke-width="2.4" opacity=".32"/>` +
    `<line x1="${num(cx)}" y1="${num(cy)}" x2="${num(cx)}" y2="${num(cy - r + 8)}" stroke="${accent}" stroke-width="2" opacity=".85">
      <animateTransform attributeName="transform" type="rotate" values="-112 ${num(cx)} ${num(cy)};112 ${num(cx)} ${num(cy)};-112 ${num(cx)} ${num(cy)}" dur="9s" repeatCount="indefinite"/></line>` +
    `<circle cx="${num(cx)}" cy="${num(cy)}" r="3" fill="${accent}"/>` +
    txt({ x: num(cx), y: num(cy + 38), s: '92', size: 27, family: F.mono, fill: C.white, anchor: 'middle', weight: 700 }) +
    txt({ x: num(cx), y: num(cy + 54), s: 'HEALTH SCORE', size: 9, family: F.mono, fill: accent, anchor: 'middle', spacing: 2 }) +
    txt({ x: 18, y: num(h - 12), s: 'EVIDENCE-BASED AUDIT', size: 9.5, family: F.mono, fill: C.text4, spacing: 2 }) +
    bars
  );
}

function artChart(w, h, barH, accent) {
  const baseY = h - 26;
  const top = barH + 44;
  const bx = w * 0.06;
  const bw = w * 0.62;
  const slot = bw / 7;
  let bars = '';
  [0.42, 0.58, 0.5, 0.72, 0.66, 0.88, 0.78].forEach((v, i) => {
    const bh = (baseY - top) * v;
    bars +=
      `<rect x="${num(bx + i * slot)}" y="${num(baseY - bh)}" width="${num(slot - 12)}" height="${num(bh)}" rx="4" fill="${i > 4 ? accent : '#243B56'}" opacity="${0.5 + i * 0.07}"/>`;
  });
  const pts = [0.3, 0.42, 0.38, 0.55, 0.6, 0.72, 0.86].map((v, i) => [bx + i * slot + (slot - 12) / 2, baseY - (baseY - top) * v]);
  let line = '';
  pts.forEach(([x, y], i) => {
    line += i ? ` L${num(x)} ${num(y)}` : `M${num(x)} ${num(y)}`;
  });
  let tileSvg = '';
  [
    ['TARGET', '128%'],
    ['TASKS', '412'],
    ['ON TIME', '97%'],
  ].forEach(([k, v], i) => {
    const ty = barH + 20 + i * 43;
    tileSvg +=
      `<rect x="${num(w * 0.73)}" y="${num(ty)}" width="${num(w * 0.23)}" height="36" rx="8" fill="#0B1420" stroke="#1E3752"/>` +
      txt({ x: num(w * 0.73 + 12), y: num(ty + 14), s: k, size: 9, family: F.mono, fill: C.text4, spacing: 1.4 }) +
      txt({ x: num(w * 0.73 + 12), y: num(ty + 30), s: v, size: 14, family: F.mono, fill: C.white, weight: 600 });
  });
  return (
    txt({ x: num(bx), y: num(barH + 24), s: 'WEEKLY PERFORMANCE INDEX', size: 9.5, family: F.mono, fill: C.text4, spacing: 1.8 }) +
    bars +
    `<path d="${line}" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round"/>` +
    `<circle cx="${num(pts[6][0])}" cy="${num(pts[6][1])}" r="4.5" fill="${accent}">
      <animate attributeName="r" values="4.5;7;4.5" dur="2.6s" repeatCount="indefinite"/></circle>` +
    `<line x1="${num(bx)}" y1="${num(baseY + 6)}" x2="${num(bx + bw)}" y2="${num(baseY + 6)}" stroke="#1E3752" stroke-width="1"/>` +
    tileSvg
  );
}

function artPortfolio(w, h, barH, accent) {
  const pad = Math.round(w * 0.055);
  const cy = barH + (h - barH) / 2;
  const nav = ['WORK', 'SERVICES', 'ABOUT', 'CONTACT'];

  let navSvg = txt({ x: pad, y: barH + 34, s: '◆ LOOP LORD', size: 11, family: F.mono, fill: C.white, spacing: 3, weight: 600 });
  let nx = pad + 210;
  nav.forEach((n) => {
    navSvg += txt({ x: nx, y: barH + 34, s: n, size: 9.5, family: F.mono, fill: C.text4, spacing: 2.2 });
    nx += 34 + n.length * 7.2;
  });
  navSvg +=
    `<rect x="${num(nx)}" y="${num(barH + 24)}" width="86" height="22" rx="11" fill="none" stroke="${C.lineGlow}"/>` +
    txt({ x: nx + 43, y: barH + 39, s: 'HIRE ME', size: 9.5, family: F.mono, fill: accent, spacing: 1.6, anchor: 'middle' });

  // headline block
  const headY = cy - 2;
  const title = 'Design. Code. Ship.';
  const glyph = `<g>
    ${txt({ x: pad, y: headY, s: title, size: 40, weight: 750, fill: '#F4F9FF', spacing: -1 })}
    <rect x="${num(pad)}" y="${num(headY + 16)}" width="${num(title.length * 21.5)}" height="2.4" rx="1.2" fill="url(#artAccent)" opacity=".85">
      <animate attributeName="width" values="${num(title.length * 21.5)};${num(title.length * 21.5 + 60)};${num(title.length * 21.5)}" dur="11s" repeatCount="indefinite"/>
    </rect></g>`;
  const sub = txt({ x: pad, y: headY + 42, s: 'Full-stack development for people who care how it feels.', size: 12.5, fill: C.text2 });
  const btns =
    `<rect x="${num(pad)}" y="${num(headY + 60)}" width="132" height="30" rx="8" fill="${accent}" opacity=".92"/>` +
    txt({ x: pad + 66, y: headY + 79, s: 'SEE MY WORK', size: 9.5, family: F.mono, fill: '#04121A', spacing: 1.4, anchor: 'middle', weight: 700 }) +
    `<rect x="${num(pad + 144)}" y="${num(headY + 60)}" width="120" height="30" rx="8" fill="none" stroke="${C.lineGlow}"/>` +
    txt({ x: pad + 204, y: headY + 79, s: 'CONTACT', size: 9.5, family: F.mono, fill: C.text2, spacing: 1.4, anchor: 'middle' });

  // project thumbnails on the right
  const tw = 168;
  const th = 104;
  const gap = 22;
  const x0 = w - pad - tw * 3 - gap * 2;
  const y0 = cy - th / 2 + 4;
  let thumbs = '';
  [0, 1, 2].forEach((i) => {
    const x = x0 + i * (tw + gap);
    const lift = i === 1 ? -12 : i === 2 ? 6 : 0;
    thumbs +=
      `<rect x="${num(x)}" y="${num(y0 + lift)}" width="${tw}" height="${th}" rx="10" fill="#0A121E" stroke="${C.line}"/>` +
      `<rect x="${num(x + 10)}" y="${num(y0 + lift + 10)}" width="${num(tw - 20)}" height="54" rx="7" fill="${i === 1 ? 'url(#artThumb)' : '#111C2B'}"/>` +
      `<rect x="${num(x + 10)}" y="${num(y0 + lift + 72)}" width="${num(tw - 46)}" height="6" rx="3" fill="#2A3F59"/>` +
      `<rect x="${num(x + 10)}" y="${num(y0 + lift + 84)}" width="${num(tw - 70)}" height="6" rx="3" fill="#22344B"/>`;
  });
  return (
    `<rect x="0" y="${num(barH)}" width="${w}" height="1" fill="${C.lineSoft}"/>` +
    `<ellipse cx="${num(x0 + tw * 1.5 + gap)}" cy="${num(y0 + 40)}" rx="220" ry="110" fill="url(#winGlow)" opacity=".55"/>` +
    navSvg +
    glyph + sub + btns + thumbs
  );
}

const ART = { docToTasks: artDoc, gauge: artGauge, chart: artChart, portfolio: artPortfolio };

/* ------------------------------------------------------------ the card */

const chipFlow = ({ x, y, max, items }) => {
  let out = '';
  let cx = x;
  items.forEach((t) => {
    const size = 10.5;
    const cw = Math.round(t.length * size * 0.63 + 26);
    if (cx + cw > max) return;
    out +=
      `<rect x="${num(cx)}" y="${num(y)}" width="${num(cw)}" height="24" rx="6" fill="#0C1524" stroke="#1B2E44"/>` +
      txt({ x: cx + 13, y: y + 16, s: t, size, family: F.mono, fill: C.text2, spacing: 0.3 });
    cx += cw + 8;
  });
  return out;
};

/**
 * @param p   project record (name, kicker, descLines, tech, accent, index…)
 * @param o   { w, topH, wide, photo?: Buffer, url }
 */
export function cardSvg(p, { w, topH, wide = false, photo = null, url }) {
  const accent = ACCENT[p.accent] || C.cyan;
  const barH = Math.round(topH * 0.16);
  const pad = wide ? 34 : 28;
  const inner = w - pad * 2;

  /* --- vertical rhythm, computed so nothing can collide --- */
  const nameY = topH + (wide ? 62 : 56);
  const descY = nameY + 26;
  const lines = p.descLines || [];
  const chipsY = descY + (lines.length - 1) * 18 + 22;
  const ruleY = chipsY + 24 + 20;
  const footY = ruleY + 22;
  const h = ruleY + 46;

  const nameSize = wide ? 28 : 25;

  let body = '';
  body += label({ x: pad, y: nameY - 26, s: p.kicker, size: 10.5, fill: accent, spacing: 2.6 });
  body += txt({ x: w - pad, y: nameY - 26, s: String(p.index ?? '').padStart(2, '0'), size: 10.5, family: F.mono, fill: C.text4, anchor: 'end', spacing: 1.4 });
  body += txt({ x: pad, y: nameY, s: p.name, size: nameSize, weight: 650, fill: C.white, spacing: -0.3 });
  lines.forEach((line, i) => {
    body += txt({ x: pad, y: descY + i * 18, s: line, size: 12.6, fill: C.text2 });
  });
  body += chipFlow({ x: pad, y: chipsY, max: pad + inner - 84, items: p.tech });
  body += rule({ x: pad, y: ruleY, w: inner, from: C.lineGlow, opacity: 0.4, id: `cf${p.key}` });
  body += p.live
    ? icon({ name: 'globe', x: pad, y: footY - 12, size: 13, fill: accent, opacity: 0.9 }) +
      txt({ x: pad + 20, y: footY, s: p.liveLabel || 'live demo', size: 11, family: F.mono, fill: C.text3, spacing: 0.3 })
    : icon({ name: 'github', x: pad, y: footY - 12, size: 13, fill: C.text3, opacity: 0.85 }) +
      txt({ x: pad + 20, y: footY, s: 'source on github', size: 11, family: F.mono, fill: C.text3, spacing: 0.3 });
  body += txt({ x: w - pad, y: footY, s: 'VIEW →', size: 11, family: F.mono, fill: accent, anchor: 'end', spacing: 1.6, weight: 600, opacity: 0.95 });

  const preview = photo
    ? `<g clip-path="url(#shotClip)"><image x="0" y="${barH}" width="${w}" height="${topH - barH}" preserveAspectRatio="none" xlink:href="data:image/jpeg;base64,${photo.toString('base64')}"/></g>`
    : ART[p.art](w, topH, barH, accent);

  const defs =
    baseDefs() +
    `<defs>
      <clipPath id="cardClip"><rect x="0" y="0" width="${w}" height="${h}" rx="${RADIUS}"/></clipPath>
      <clipPath id="shotClip"><path d="M0 ${barH} H${w} V${topH - RADIUS} A${RADIUS} ${RADIUS} 0 0 1 ${w - RADIUS} ${topH} H${RADIUS} A${RADIUS} ${RADIUS} 0 0 1 0 ${topH - RADIUS} Z"/></clipPath>
      <linearGradient id="cardSheen" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity=".14"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="winSheen" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity=".16"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="winBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0C1420"/><stop offset="1" stop-color="#060B13"/>
      </linearGradient>
      <linearGradient id="artAccent" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.violet}"/>
      </linearGradient>
      <linearGradient id="artThumb" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#16324C"/><stop offset="1" stop-color="#2A1F4D"/>
      </linearGradient>
      <radialGradient id="winGlow" cx="76%" cy="58%" r="72%">
        <stop offset="0" stop-color="${accent}" stop-opacity=".28"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
      <pattern id="winGrid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M20 0H0V20" fill="none" stroke="#16273C" stroke-width="1" opacity=".55"/>
      </pattern>
    </defs>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(`${p.name} — ${p.kicker}`)}">${defs}<g clip-path="url(#cardClip)">
    <rect width="${w}" height="${h}" fill="${CARD_BG}"/>
    <rect y="${barH}" width="${w}" height="${topH - barH}" fill="url(#winBg)"/>
    <rect y="${barH}" width="${w}" height="${topH - barH}" fill="url(#winGrid)"/>
    <rect y="${barH}" width="${w}" height="${topH - barH}" fill="url(#winGlow)"/>
    ${preview}
    ${chrome(w, topH, barH, url, accent)}
    <rect y="${topH}" width="${w}" height="1.4" fill="#05070C"/>
    <rect y="${topH + 1.4}" width="${w}" height="1" fill="url(#cardSheen)" opacity=".5"/>
  </g>${body}<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${RADIUS}" fill="none" stroke="${C.line}" stroke-width="1"/></svg>`;
}

export const CARD_GEO = {
  // every card spans the README column, so nothing has to shrink to stay legible
  feature: { w: 1000, topH: 288, wide: true },
  grid: { w: 1000, topH: 232, wide: false },
};

export const PREVIEW_URL = {
  looplord: 'looplord.vercel.app',
  'smart-profits': 'smart-profits-ruddy.vercel.app',
  actiondoc: 'actiondoc-ai — studio build',
  sitepulse: 'sitepulse-rho.vercel.app',
  '9t-angle': '9t-angle — operations platform',
};
