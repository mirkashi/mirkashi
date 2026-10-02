/**
 * signals.mjs — "GitHub Pulse" and the closing identity panel.
 *
 * The pulse panel shows verified numbers only (fetched from the GitHub API by
 * tools/readme-art/fetch-stats.sh) and links out to the live contribution grid
 * and activity graph, so nothing here can drift out of date on its own.
 */

import { C, F, rng, num, icon, panel, txt, label, rule, baseDefs, svg, sheen, fadeGradient } from './theme.mjs';
import { PROFILE } from './data.mjs';
import { sectionHead, cornerTicks, frameOpen, frameBg, frameClose, wrap, W } from './sections.mjs';

import stats from './data/contributions.json' with { type: 'json' };

export const PULSE = {
  repos: String(stats.repos),
  stars: String(stats.stars),
  followers: String(stats.followers),
  contributions: stats.contributions >= 1000 ? `${(stats.contributions / 1000).toFixed(1)}k` : String(stats.contributions),
  years: String(new Date().getUTCFullYear() - stats.since),
  languages: stats.languages.join(' · '),
  updated: stats.updated,
};

/* ------------------------------------------------------------------ pulse */

export function pulseSvg() {
  const H = 574;
  const tiles = [
    { v: PULSE.repos, k: 'PUBLIC REPOS', s: 'clean, shipped, public', accent: C.cyan, glyph: 'github' },
    { v: PULSE.stars, k: 'STARS EARNED', s: 'across those repos', accent: C.violet, glyph: 'bolt' },
    { v: PULSE.followers, k: 'FOLLOWERS', s: 'building in public', accent: C.teal, glyph: 'dot' },
    { v: PULSE.contributions, k: 'CONTRIBUTIONS', s: 'in the last 12 months', accent: C.blueSoft, glyph: 'bolt' },
  ];

  const tw = (W - 64 - 3 * 14) / 4; // 4 tiles, 3 gutters
  let tileSvg = '';
  tiles.forEach((t, i) => {
    const x = 32 + i * (tw + 14);
    tileSvg +=
      panel({ x, y: 142, w: tw, h: 112, r: 16, fill: 'url(#panelFill)', stroke: C.line }) +
      `<rect x="${num(x + 1)}" y="143" width="${num(tw - 2)}" height="1" fill="url(#topSheen)"/>` +
      icon({ name: t.glyph, x: x + 20, y: 158, size: 12, fill: t.accent, opacity: 0.8 }) +
      label({ x: x + 40, y: 167, s: t.k, size: 9.5, fill: C.text4, spacing: 2.2 }) +
      `<ellipse cx="${num(x + tw - 30)}" cy="${num(202)}" rx="46" ry="30" fill="url(#glowCyan)" opacity=".28"/>` +
      txt({ x: x + 20, y: 208, s: t.v, size: 36, weight: 700, fill: C.white, spacing: -1.2 }) +
      txt({ x: x + 20, y: 230, s: t.s, size: 10.5, fill: C.text4 });
  });

  const links = [
    {
      x: 32,
      title: 'CONTRIBUTION GRID',
      sub: 'the year above, live on github',
      cta: 'OPEN',
      accent: C.cyan,
    },
    {
      x: 522,
      title: 'ACTIVITY GRAPH',
      sub: 'commit velocity, pull requests, issues',
      cta: 'OPEN',
      accent: C.violet,
    },
  ];
  const LW = (W - 64 - 20) / 2;
  let linkSvg = '';
  links.forEach((l) => {
    linkSvg +=
      panel({ x: l.x, y: 272, w: LW, h: 68, r: 14, fill: '#070C14', stroke: C.line }) +
      `<rect x="${num(l.x + 1)}" y="273" width="${num(LW - 2)}" height="1" fill="url(#topSheen)"/>` +
      label({ x: l.x + 22, y: 294, s: l.title, size: 10, fill: l.accent, spacing: 2.4 }) +
      txt({ x: l.x + 22, y: 316, s: l.sub, size: 11.5, fill: C.text3 }) +
      txt({ x: l.x + LW - 22, y: 312, s: `${l.cta}  →`, size: 10.5, family: F.mono, fill: l.accent, anchor: 'end', spacing: 1.4, weight: 600 });
  });

  /* language mix — measured across every public repo, owner + studio */
  const mix = stats.languageMix.combined.slice(0, 9);
  const total = stats.languageMix.combined.reduce((t, x) => t + x.n, 0);
  const RAMP = ['#22D3EE', '#38BDF8', '#5EEAD4', '#8AB8FF', '#A78BFA', '#7C8EA9', '#5A6B85', '#41536B', '#31425A'];
  const railW = W - 64;
  const gap = 3;
  let cursor = 32;
  let rail = '';
  mix.forEach((m, i) => {
    const w = Math.max(10, Math.round(((railW - gap * (mix.length - 1)) * m.n) / total));
    rail +=
      `<rect x="${num(cursor)}" y="396" width="${num(w)}" height="18" rx="6" fill="${RAMP[i]}" opacity="${i < 4 ? 0.95 : 0.55}">` +
      `<title>${m.lang} — ${m.n} repos</title></rect>`;
    if (w > 78) {
      rail += txt({ x: cursor + 12, y: 408.5, s: m.lang.toUpperCase(), size: 9, family: F.mono, fill: '#05121A', spacing: 1.2, weight: 700 });
    }
    cursor += w + gap;
  });

  const cols = 3;
  const rows = Math.ceil(mix.length / cols);
  const colW = (W - 64) / cols;
  let legend = '';
  mix.forEach((m, i) => {
    const c = Math.floor(i / rows);
    const r = i % rows;
    const x = 32 + c * colW;
    const y = 456 + r * 30;
    legend +=
      `<rect x="${num(x)}" y="${num(y - 9)}" width="9" height="9" rx="2.5" fill="${RAMP[i]}" opacity="${i < 4 ? 1 : 0.6}"/>` +
      txt({ x: x + 19, y, s: m.lang, size: 12.2, fill: C.text, weight: 450 }) +
      txt({ x: x + colW - 40, y, s: `${m.n} · ${((m.n / total) * 100).toFixed(0)}%`, size: 10.5, family: F.mono, fill: C.text4, anchor: 'end', spacing: 0.6 });
  });

  return svg({
    w: W,
    h: H,
    title: 'GitHub pulse — repositories, stars, followers, contribution activity and language mix for @mirkashi',
    defs: baseDefs() + fadeGradient({ id: 'pulseFade', stops: [['0%', C.cyan, '.25'], ['100%', C.cyan, '0']] }),
    children:
      frameOpen({ h: H }) +
      frameBg({ h: H, glow: [0.5, -0.12], glow2: [0.06, 0.86] }) +
      sectionHead({ y: 76, idx: '04', kicker: 'GITHUB PULSE', title: 'The signal, not the noise', meta: `SYNCED ${PULSE.updated}`, accent: C.violet, metaX: 968 }) +
      tileSvg +
      linkSvg +
      `<rect x="32" y="366" width="${W - 64}" height="1" fill="${C.lineSoft}"/>` +
      label({ x: 32, y: 384, s: 'LANGUAGE MIX · PRIMARY LANGUAGE PER REPO', size: 10, fill: C.text4, spacing: 2.4 }) +
      rail +
      legend +
      `<rect x="32" y="${H - 26}" width="${W - 64}" height="1" fill="${C.lineSoft}"/>` +
      txt({ x: 32, y: H - 6, s: `SINCE ${stats.since} · ${total} PUBLIC REPOS · OWNER + STUDIO`, size: 10, family: F.mono, fill: C.text4, spacing: 1.2 }) +
      txt({ x: W - 32, y: H - 6, s: 'NUMBERS PULLED FROM THE GITHUB API — NOT A WIDGET', size: 10, family: F.mono, fill: C.text4, spacing: 1.2, anchor: 'end' }) +
      cornerTicks({ h: H }) +
      frameClose({ h: H }),
  });
}

/* ------------------------------------------------------- language mix */

/**
 * Every repository's primary language (owner + studio), straight from the API.
 * A single stacked rail plus a legend — no third-party language widget.
 */
/* ---------------------------------------------------------------- closing */

export function closingSvg() {
  const H = 452;
  const cx = W / 2;

  // concentric identity rings
  const rings = [176, 136, 98]
    .map((r, i) => {
      const dur = (28 + i * 12).toFixed(0);
      const dash = i === 1 ? '8 14' : i === 2 ? '3 9' : '24 18';
      return `<circle cx="${num(cx)}" cy="196" r="${r}" fill="none" stroke="${i === 1 ? C.violet : C.cyan}" stroke-width="1" opacity="${0.22 - i * 0.04}" stroke-dasharray="${dash}">
        <animateTransform attributeName="transform" type="rotate" from="0 ${num(cx)} 196" to="${i % 2 ? -360 : 360} 196" dur="${dur}s" repeatCount="indefinite"/>
      </circle>`;
    })
    .join('');

  return svg({
    w: W,
    h: H,
    title: 'Build. Learn. Grow. — Mir Kashif, full-stack developer',
    defs:
      baseDefs() +
      sheen({
        id: 'footerSweep',
        x0: -300,
        x1: W + 300,
        band: 300,
        dur: 6,
        stops: [
          [0, C.cyan, 0],
          [0.45, C.cyan, 0.75],
          [0.55, C.violet, 0.75],
          [1, C.violet, 0],
        ],
      }) +
      `<linearGradient id="closingType" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="${C.cyanSoft}"/><stop offset="1" stop-color="${C.violet}"/>
      </linearGradient>` +
      `<radialGradient id="closingHalo" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="${C.cyan}" stop-opacity=".22"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/>
      </radialGradient>`,
    children:
      frameOpen({ h: H }) +
      frameBg({ h: H, glow: [0.5, 0.1], glow2: [0.5, 1.1] }) +
      `<ellipse cx="${num(cx)}" cy="196" rx="330" ry="180" fill="url(#closingHalo)"/>` +
      rings +
      `<circle cx="${num(cx)}" cy="196" r="4" fill="${C.cyan}">
        <animate attributeName="opacity" values="1;.3;1" dur="3.2s" repeatCount="indefinite"/></circle>` +
      label({ x: cx, y: 118, s: '06 / THE NEXT BUILD', size: 11.5, fill: C.text3, spacing: 4, anchor: 'middle' }) +
      txt({ x: cx, y: 214, s: 'Build. Learn. Grow.', size: 48, weight: 750, fill: 'url(#closingType)', anchor: 'middle', spacing: -0.6 }) +
      txt({ x: cx, y: 252, s: 'Same person, bigger dreams.', size: 16, fill: C.text2, anchor: 'middle', family: F.mono, spacing: 1.2 }) +
      `<rect x="0" y="330" width="${W}" height="1.4" fill="url(#footerSweep)" opacity=".9"/>` +
      txt({ x: cx, y: 372, s: 'MIR KASHIF   ·   @MIRKASHI   ·   FULL-STACK DEVELOPER   ·   ISLAMABAD, PAKISTAN', size: 10.5, family: F.mono, fill: C.text3, anchor: 'middle', spacing: 2.8 }) +
      wrap('Open to freelance work, collaboration and full-time roles — if the idea is worth shipping, let’s build it properly.', 88)
        .map((line, i) => txt({ x: cx, y: 404 + i * 20, s: line, size: 12.5, fill: C.text4, anchor: 'middle' }))
        .join('') +
      cornerTicks({ h: H }) +
      frameClose({ h: H, stroke: C.line }),
  });
}
