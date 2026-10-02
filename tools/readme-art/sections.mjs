/**
 * sections.mjs — hero, about and stack panels.
 *
 * All panels share the same frame, grid, hairline and type system so the four
 * images read as one continuous page.
 */

import {
  C, F, esc, rng, num, icon, panel, txt, label, rule, chip, baseDefs, svg, sheen, fadeGradient,
} from './theme.mjs';
import { PROFILE, STACK, TRAITS, PROCESS } from './data.mjs';

export const W = 1000;
export const W_HERO = 1200;

/* ------------------------------------------------------------- primitives */

export const frameOpen = ({ h, w = W, rx = 18 }) =>
  `<clipPath id="frame"><rect x="0" y="0" width="${w}" height="${h}" rx="${rx}"/></clipPath><g clip-path="url(#frame)">`;

export const frameBg = ({ h, w = W, glow = [0.78, 0.12], glow2 = [0.08, 0.95] }) =>
  `<rect width="${w}" height="${h}" fill="url(#surface)"/>` +
  `<rect width="${w}" height="${h}" fill="url(#grid16)" opacity=".42"/>` +
  `<ellipse cx="${num(glow[0] * w)}" cy="${num(glow[1] * h)}" rx="${num(w * 0.42)}" ry="${num(h * 0.5)}" fill="url(#glowCyan)" opacity=".5"/>` +
  `<ellipse cx="${num(glow2[0] * w)}" cy="${num(glow2[1] * h)}" rx="${num(w * 0.34)}" ry="${num(h * 0.45)}" fill="url(#glowViolet)" opacity=".45"/>`;

export const frameClose = ({ h, w = W, rx = 18, stroke = C.line }) =>
  `</g><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${rx - 0.5}" fill="none" stroke="${stroke}" stroke-width="1"/>`;

/** corner ticks — small command-center detail */
export function cornerTicks({ h, w = W, color = C.lineGlow, len = 18, inset = 14 }) {
  const g = `M0 ${len} V0 H${len}`;
  const g2 = `M0 ${len} V0 H-${len}`;
  return (
    `<g stroke="${color}" stroke-width="1.2" fill="none">` +
    `<path d="${g}" transform="translate(${inset} ${inset})"/>` +
    `<path d="${g2}" transform="translate(${w - inset} ${inset})"/>` +
    `<path d="${g}" transform="translate(${w - inset} ${h - inset}) rotate(180)"/>` +
    `<path d="${g2}" transform="translate(${inset} ${h - inset}) rotate(180)"/>` +
    `</g>`
  );
}

export function sectionHead({ y, idx, kicker, title, meta, w = W, inset = 32, accent = C.cyan, ruleOpacity = 0.55, metaX = null }) {
  return (
    rule({ x: inset, y: y - 30, w: w - inset * 2, from: C.lineGlow, opacity: ruleOpacity, id: `sh${idx}` }) +
    label({ x: inset, y, s: `${idx} / ${kicker}`, size: 12, fill: accent, spacing: 3.6 }) +
    txt({ x: inset, y: y + 42, s: title, size: 32, weight: 650, fill: C.white, spacing: -0.4 }) +
    (meta
      ? txt({ x: metaX ?? w - inset, y: y + 43, s: meta, size: 11, family: F.mono, fill: C.text3, anchor: 'end', spacing: 1.2 })
      : '')
  );
}

/** simple character-count text wrap, good enough for hand-tuned copy */
export function wrap(text, max) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if (!line.length) line = w;
    else if ((line + ' ' + w).length <= max) line += ' ' + w;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** 1D value noise → natural, non-jagged landscape ridges */
function noise1D(seed, points) {
  const r = rng(seed);
  const v = Array.from({ length: points }, () => r());
  return (t) => {
    const x = Math.max(0, Math.min(0.999999, t)) * (points - 1);
    const i = Math.floor(x);
    const f = x - i;
    const s = f * f * (3 - 2 * f);
    return v[i] + (v[Math.min(i + 1, points - 1)] - v[i]) * s;
  };
}

export function ridge({ x0, x1, base, amp, seed, step = 7, closeTo = null }) {
  const n1 = noise1D(seed, 5);
  const n2 = noise1D(seed * 7 + 11, 11);
  const n3 = noise1D(seed * 13 + 5, 23);
  const at = (x) => {
    const t = (x - x0) / (x1 - x0);
    const k = 0.52 * n1(t) + 0.3 * n2(t) + 0.18 * n3(t);
    const envelope = Math.sin(Math.PI * Math.min(1, Math.max(0, t * 1.08))) ** 0.6;
    return base - amp * k * (0.45 + 0.55 * envelope);
  };
  let d = `M ${num(x0)} ${num(base)}`;
  for (let x = x0; x <= x1; x += step) d += ` L ${num(x)} ${num(at(x))}`;
  d += ` L ${num(x1)} ${num(base)}`;
  if (closeTo != null) d += ` L ${num(x1)} ${num(closeTo)} L ${num(x0)} ${num(closeTo)} Z`;
  else d += ' Z';
  return d;
}

/* -------------------------------------------------------------------- hero */

export function heroSvg() {
  const W = W_HERO;
  const H = 600;
  const horizon = 432;
  const far = ridge({ x0: 470, x1: W, base: horizon, amp: 152, seed: 17, closeTo: H });
  const near = ridge({ x0: 560, x1: W, base: horizon, amp: 84, seed: 41, closeTo: H });

  // starfield + drifting particles (deterministic)
  const rs = rng(90210);
  let stars = '';
  for (let i = 0; i < 74; i++) {
    const x = 480 + rs() * 720;
    const y = 26 + rs() * 380;
    const r = 0.5 + rs() * 1.15;
    const o = 0.1 + rs() * 0.5;
    const twinkle = i % 6 === 0
      ? `<animate attributeName="opacity" values="${num(o)};${num(Math.min(1, o + 0.45))};${num(o)}" dur="${(4 + rs() * 5).toFixed(1)}s" repeatCount="indefinite"/>`
      : '';
    stars += `<circle cx="${num(x)}" cy="${num(y)}" r="${num(r)}" fill="${i % 9 === 0 ? C.cyanSoft : '#DCE9F7'}" opacity="${num(o)}">${twinkle}</circle>`;
  }

  const rp = rng(4242);
  let particles = '';
  for (let i = 0; i < 26; i++) {
    const x = 470 + rp() * 730;
    const y = 120 + rp() * 300;
    const r = 0.9 + rp() * 1.4;
    const dur = (9 + rp() * 11).toFixed(1);
    const dx = (rp() * 26 - 13).toFixed(1);
    const col = i % 4 === 0 ? C.violet : i % 3 === 0 ? C.cyanSoft : '#CFE2F5';
    particles +=
      `<circle cx="${num(x)}" cy="${num(y)}" r="${num(r)}" fill="${col}" opacity="0">` +
      `<animate attributeName="opacity" values="0;.7;0" dur="${dur}s" begin="${(-rp() * 9).toFixed(1)}s" repeatCount="indefinite"/>` +
      `<animateTransform attributeName="transform" type="translate" values="0 0;${dx} -${(40 + rp() * 70).toFixed(0)}" dur="${dur}s" begin="${(-rp() * 9).toFixed(1)}s" repeatCount="indefinite"/>` +
      `</circle>`;
  }

  // terminal card
  const px = 838;
  const py = 104;
  const pw = 300;
  const ph = 196;
  const code = [
    ['const', ' dev ', '= {'],
    ['  name', ": 'Mir Kashif',"],
    ['  role', ": 'Full-Stack',"],
    ['  stack', ": ['MERN', 'Next'],"],
    ['  shipping', ': true,'],
  ];
  let codeSvg = '';
  code.forEach((parts, i) => {
    const y = py + 58 + i * 17.5;
    let cx = px + 26;
    const seg = (s, fill, weight = 500) => {
      const out = txt({ x: cx, y, s, size: 11.5, family: F.mono, fill, weight });
      cx += s.length * 11.5 * 0.6;
      return out;
    };
    codeSvg += seg(parts[0], C.violet, 600);
    codeSvg += seg(parts[1] || '', C.text2);
    if (parts[2]) codeSvg += seg(parts[2], C.teal);
  });

  // equalizer under the terminal — "build activity"
  let bars = '';
  const rb = rng(777);
  for (let i = 0; i < 26; i++) {
    const bx = px + 26 + i * 10.6;
    const h0 = 5 + rb() * 22;
    bars +=
      `<rect x="${num(bx)}" y="${num(ph + py - 34 - h0)}" width="3" height="${num(h0)}" rx="1.5" fill="${i > 17 ? C.cyan : C.lineGlow}" opacity="${num(0.45 + rb() * 0.5)}">` +
      `<animate attributeName="height" values="${num(h0)};${num(4 + rb() * 26)};${num(h0)}" dur="${(1.4 + rb() * 1.6).toFixed(1)}s" repeatCount="indefinite"/>` +
      `<animate attributeName="y" values="${num(ph + py - 34 - h0)};${num(ph + py - 38 - 4)};${num(ph + py - 34 - h0)}" dur="${(1.4 + rb() * 1.6).toFixed(1)}s" repeatCount="indefinite"/>` +
      `</rect>`;
  }

  const marqueeY = 528;
  const seg = (x, i) =>
    txt({ x, y: marqueeY + 46, s: 'BUILD.   LEARN.   GROW.', size: 12.5, family: F.mono, fill: i % 2 ? C.text3 : C.text2, spacing: 4.6, weight: 500 }) +
    txt({ x: x + 232, y: marqueeY + 46, s: '◆', size: 9, family: F.mono, fill: i % 2 ? C.violet : C.cyan, opacity: 0.75 });
  let mq = '';
  for (let i = 0; i < 6; i++) mq += seg(i * 268, i);

  return svg({
    w: W,
    h: H,
    title: 'Mir Kashif — Full-Stack Developer, Islamabad, Pakistan',
    defs:
      baseDefs() +
      fadeGradient({ id: 'ridgeFar', stops: [['0%', '#12283F', '.85'], ['100%', '#050A11', '0']] }) +
      fadeGradient({ id: 'ridgeNear', stops: [['0%', '#060C15', '1'], ['70%', '#04070C', '1'], ['100%', '#04070C', '1']] }) +
      `<radialGradient id="sun" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="${C.cyan}" stop-opacity=".55"/>
        <stop offset=".55" stop-color="${C.cyan}" stop-opacity=".12"/>
        <stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/>
      </radialGradient>` +
      `<linearGradient id="nameGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#CBDFF2"/>
      </linearGradient>` +
      `<linearGradient id="accentBar" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.violet}"/></linearGradient>` +
      `<linearGradient id="terrainFade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${C.ink0}" stop-opacity="1"/>
        <stop offset=".62" stop-color="${C.ink0}" stop-opacity=".92"/>
        <stop offset="1" stop-color="${C.ink0}" stop-opacity="0"/>
      </linearGradient>` +
      `<linearGradient id="mqFade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${C.ink0}" stop-opacity=".96"/>
        <stop offset=".12" stop-color="${C.ink0}" stop-opacity="0"/>
        <stop offset=".88" stop-color="${C.ink0}" stop-opacity="0"/>
        <stop offset="1" stop-color="${C.ink0}" stop-opacity=".96"/></linearGradient>`,
    children:
      frameOpen({ h: H, w: W }) +
      frameBg({ h: H, w: W }) +
      // --- landscape
      `<ellipse cx="905" cy="${horizon}" rx="210" ry="180" fill="url(#sun)"/>` +
      `<circle cx="905" cy="${horizon}" r="118" fill="none" stroke="${C.cyan}" stroke-width="1" opacity=".14"/>` +
      `<circle cx="905" cy="${horizon}" r="72" fill="none" stroke="${C.cyan}" stroke-width="1" opacity=".1"/>` +
      stars +
      `<path d="${far}" fill="url(#ridgeFar)"/>` +
      particles +
      `<path d="${far}" fill="none" stroke="${C.cyanSoft}" stroke-width="1" opacity=".28"/>` +
      `<path d="${near}" fill="url(#ridgeNear)"/>` +
      `<path d="${near}" fill="none" stroke="${C.cyan}" stroke-width="1.1" opacity=".42"/>` +
      `<ellipse cx="660" cy="${horizon + 8}" rx="300" ry="92" fill="url(#glowCyan)" opacity=".3"/>` +
      `<rect x="0" y="0" width="700" height="${H}" fill="url(#terrainFade)" opacity=".96"/>` +
      // --- terminal
      `<ellipse cx="${px + pw / 2}" cy="${py + ph / 2}" rx="210" ry="140" fill="url(#glowCyan)" opacity=".35" filter="url(#soft)"/>` +
      `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="14" fill="#05090F" opacity=".86"/>` +
      `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="14" fill="none" stroke="#1D3550" stroke-width="1"/>` +
      `<rect x="${px + 1}" y="${py + 1}" width="${pw - 2}" height="1" fill="url(#topSheen)"/>` +
      `<circle cx="${px + 20}" cy="${py + 20}" r="4" fill="#20334A"/><circle cx="${px + 34}" cy="${py + 20}" r="4" fill="#20334A"/><circle cx="${px + 48}" cy="${py + 20}" r="4" fill="${C.cyan}" opacity=".75"/>` +
      txt({ x: px + 66, y: py + 24, s: 'mirkashi — zsh', size: 10, family: F.mono, fill: C.text4, spacing: 0.8 }) +
      `<rect x="${px}" y="${py + 38}" width="${pw}" height="1" fill="${C.lineSoft}"/>` +
      codeSvg +
      `<rect x="${px + 146}" y="${py + 148}" width="2" height="12" fill="${C.cyan}" opacity=".9">
        <animate attributeName="opacity" values=".9;0;.9" dur="1.15s" repeatCount="indefinite"/></rect>` +
      txt({ x: px + 26, y: py + 172, s: 'build · activity', size: 9.5, family: F.mono, fill: C.text4, spacing: 1.6 }) +
      `<circle cx="${px + 232}" cy="${py + 169}" r="3" fill="${C.teal}">
        <animate attributeName="opacity" values="1;.25;1" dur="2.4s" repeatCount="indefinite"/></circle>` +
      bars +
      // --- identity block
      `<rect x="64" y="66" width="30" height="30" rx="9" fill="#070D16" stroke="${C.lineGlow}" stroke-width="1"/>` +
      txt({ x: 71, y: 86, s: '</>', size: 12, family: F.mono, fill: C.cyan, weight: 600 }) +
      txt({ x: 108, y: 86, s: 'MIRKASHI', size: 13, family: F.mono, fill: C.white, spacing: 5.4, weight: 600 }) +
      `<rect x="256" y="74" width="1" height="14" fill="${C.line}"/>` +
      txt({ x: 274, y: 86, s: 'FULL-STACK DEVELOPER', size: 11.5, family: F.mono, fill: C.text3, spacing: 3.4 }) +
      txt({ x: 64, y: 132, s: '◆ LOOP LORD', size: 10.5, family: F.mono, fill: C.violet, spacing: 3.2, opacity: 0.9 }) +
      // name
      `<rect x="64" y="152" width="58" height="3" rx="1.5" fill="url(#accentBar)"/>` +
      `<ellipse cx="200" cy="216" rx="230" ry="60" fill="url(#glowCyan)" opacity=".22" filter="url(#soft)"/>` +
      txt({ x: 62, y: 246, s: 'MIR KASHIF', size: 78, weight: 800, fill: 'url(#nameGrad)', spacing: -1.6, family: `'Segoe UI', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif` }) +
      txt({ x: 64, y: 296, s: 'FULL-STACK DEVELOPER', size: 16.5, family: F.mono, fill: C.cyanSoft, spacing: 7.6, weight: 500 }) +
      icon({ name: 'pin', x: 64, y: 315, size: 14, fill: C.text3 }) +
      txt({ x: 86, y: 328, s: 'ISLAMABAD, PAKISTAN', size: 12, family: F.mono, fill: C.text3, spacing: 3.2 }) +
      // tagline
      wrap(PROFILE.tagline, 56)
        .slice(0, 2)
        .map((line, i) => txt({ x: 64, y: 388 + i * 27, s: line, size: 18.5, fill: i ? C.text2 : '#CBD9EA', weight: 400 }))
        .join('') +
      // meta rail
      rule({ x: 64, y: 452, w: 560, from: C.lineGlow, opacity: 0.45, id: 'heroRule' }) +
      txt({ x: 64, y: 484, s: 'MERN STACK   ·   NEXT.JS + TYPESCRIPT   ·   WEBGL / THREE.JS', size: 11, family: F.mono, fill: C.text3, spacing: 2.4 }) +
      `<circle cx="792" cy="480" r="3.4" fill="${C.teal}">
        <animate attributeName="opacity" values="1;.2;1" dur="2.6s" repeatCount="indefinite"/></circle>` +
      txt({ x: 806, y: 484, s: 'OPEN TO OPPORTUNITIES', size: 11, family: F.mono, fill: C.teal, spacing: 2.6 }) +
      // marquee rail
      `<rect x="0" y="${marqueeY}" width="${W}" height="${H - marqueeY}" fill="#05090F"/>` +
      `<rect x="0" y="${marqueeY}" width="${W}" height="1" fill="url(#hairline)"/>` +
      `<g>${mq}<animateTransform attributeName="transform" type="translate" values="0 0;-268 0" dur="26s" repeatCount="indefinite"/></g>` +
      `<rect x="0" y="${marqueeY}" width="${W}" height="${H - marqueeY}" fill="url(#mqFade)"/>` +
      cornerTicks({ h: H, w: W }) +
      frameClose({ h: H, w: W }),
  });
}

/* ------------------------------------------------------------------- about */

export function aboutSvg() {
  const H = 600;
  const lp = { x: 32, y: 146, w: 566, h: 244 };
  const rp = { x: 618, y: 146, w: 350, h: 244 };

  const body = [
    "I'm Mir Kashif — a full-stack developer from Islamabad, Pakistan. I design",
    'and build responsive products where strong visuals meet dependable',
    'engineering — from the first wireframe to the production deploy.',
  ];

  const bullets = [
    ['PRODUCT UI', 'responsive, accessible, built to be used daily'],
    ['FULL-STACK APPS', 'simple user flow, architecture ready to grow'],
    ['APIS & DATA', 'REST endpoints, auth flows, MongoDB and SQL'],
    ['LAUNCHES', 'clean Git workflow, shipped on Vercel and Netlify'],
  ];

  const term = [
    ['$ whoami', 'Mir Kashif'],
    ['$ role', 'Full-Stack Developer'],
    ['$ location', 'Islamabad, Pakistan'],
    ['$ status', '● Building something great...'],
  ];

  let termSvg = '';
  term.forEach(([cmd, out], i) => {
    const y = rp.y + 66 + i * 42;
    const [dollar, ...rest] = cmd.split(' ');
    termSvg += txt({ x: rp.x + 26, y, s: dollar, size: 12.5, family: F.mono, fill: C.cyan, weight: 600 });
    termSvg += txt({ x: rp.x + 42, y, s: rest.join(' '), size: 12.5, family: F.mono, fill: C.text, weight: 500 });
    const isStatus = out.startsWith('●');
    termSvg += txt({
      x: isStatus ? rp.x + 38 : rp.x + 26,
      y: y + 22,
      s: isStatus ? out.slice(2).trimStart() : out,
      size: 12.5,
      family: F.mono,
      fill: isStatus ? C.teal : C.text2,
    });
    if (isStatus) {
      termSvg += `<circle cx="${rp.x + 28}" cy="${y + 18}" r="3.4" fill="${C.teal}">
        <animate attributeName="opacity" values="1;.2;1" dur="2.6s" repeatCount="indefinite"/></circle>`;
    }
  });

  // trait band
  const bandY = 424;
  let traits = '';
  TRAITS.forEach((t, i) => {
    const x = 32 + i * 234;
    traits +=
      (i ? `<rect x="${x - 12}" y="${bandY}" width="1" height="58" fill="${C.lineSoft}"/>` : '') +
      label({ x: x + 16, y: bandY + 22, s: t.k, size: 10.5, fill: i % 2 ? C.cyanSoft : C.cyan, spacing: 2.4 }) +
      txt({ x: x + 16, y: bandY + 42, s: t.v, size: 11.8, fill: C.text3 });
  });

  // process rail
  const railY = 524;
  let rail = txt({ x: 32, y: railY + 22, s: 'HOW I WORK', size: 10, family: F.mono, fill: C.text4, spacing: 2.4 });
  PROCESS.forEach(([k, v], i) => {
    const x = 146 + i * 168;
    rail +=
      txt({ x, y: railY + 14, s: String(i + 1).padStart(2, '0'), size: 10, family: F.mono, fill: C.cyan, opacity: 0.85 }) +
      txt({ x: x + 24, y: railY + 14, s: k, size: 12, family: F.mono, fill: C.text, spacing: 2, weight: 600 }) +
      txt({ x, y: railY + 32, s: v, size: 11.2, fill: C.text4 }) +
      (i < PROCESS.length - 1
        ? `<path d="M${x + 150} ${railY + 8} l6 5 -6 5" fill="none" stroke="${C.lineGlow}" stroke-width="1.2"/>`
        : '');
  });

  return svg({
    w: W,
    h: H,
    title: 'About Mir Kashif — full-stack developer building responsive products end to end',
    defs: baseDefs() + fadeGradient({ id: 'lpFill', stops: [['0%', '#0A111C', '1'], ['100%', '#070C14', '1']] }),
    children:
      frameOpen({ h: H }) +
      frameBg({ h: H, glow: [0.12, 0.05], glow2: [0.88, 0.9] }) +
      sectionHead({ y: 76, idx: '01', kicker: 'ABOUT ME', title: 'The developer behind the commits', meta: 'BUILD · LEARN · GROW', accent: C.cyan }) +
      // narrative
      panel({ x: lp.x, y: lp.y, w: lp.w, h: lp.h, r: 18, fill: 'url(#lpFill)', stroke: C.line }) +
      `<rect x="${lp.x + 1}" y="${lp.y + 1}" width="${lp.w - 2}" height="1" fill="url(#topSheen)"/>` +
      txt({ x: lp.x + 26, y: lp.y + 44, s: 'Crafting the web, one interaction at a time', size: 21, weight: 650, fill: C.white, spacing: -0.3 }) +
      body.map((line, i) => txt({ x: lp.x + 26, y: lp.y + 74 + i * 20, s: line, size: 13, fill: C.text2 })).join('') +
      `<rect x="${lp.x + 26}" y="${lp.y + 144}" width="64" height="1" fill="url(#accentBar)" opacity=".8"/>` +
      bullets.map(([k, v], i) => {
        const y = lp.y + 174 + i * 22;
        return (
          `<path d="M${lp.x + 28} ${y - 4} l4 -4 4 4 -4 4 Z" fill="${i % 2 ? C.violet : C.cyan}" opacity=".85"/>` +
          txt({ x: lp.x + 44, y, s: k, size: 10.5, family: F.mono, fill: i % 2 ? C.cyanSoft : C.cyan, spacing: 1.2 }) +
          txt({ x: lp.x + 192, y, s: v, size: 12.2, fill: C.text3 })
        );
      }) +
      // terminal
      `<rect x="${rp.x}" y="${rp.y}" width="${rp.w}" height="${rp.h}" rx="16" fill="#05080E" opacity=".92"/>` +
      `<rect x="${rp.x}" y="${rp.y}" width="${rp.w}" height="${rp.h}" rx="16" fill="none" stroke="#1B3049" stroke-width="1"/>` +
      `<rect x="${rp.x + 1}" y="${rp.y + 1}" width="${rp.w - 2}" height="1" fill="url(#topSheen)"/>` +
      `<circle cx="${rp.x + 20}" cy="${rp.y + 22}" r="4" fill="#20334A"/><circle cx="${rp.x + 34}" cy="${rp.y + 22}" r="4" fill="#20334A"/><circle cx="${rp.x + 48}" cy="${rp.y + 22}" r="4" fill="${C.cyan}" opacity=".75"/>` +
      txt({ x: rp.x + 66, y: rp.y + 26, s: 'mirkashi@github', size: 10.5, family: F.mono, fill: C.text4, spacing: 0.8 }) +
      `<rect x="${rp.x}" y="${rp.y + 40}" width="${rp.w}" height="1" fill="${C.lineSoft}"/>` +
      termSvg +
      `<rect x="${rp.x + 250}" y="${rp.y + 214}" width="2" height="12" fill="${C.cyan}">
        <animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite"/></rect>` +
      // trait band + rail
      `<rect x="32" y="${bandY}" width="${W - 64}" height="1" fill="${C.lineSoft}"/>` +
      traits +
      `<rect x="32" y="${railY - 20}" width="${W - 64}" height="1" fill="${C.lineSoft}"/>` +
      rail +
      cornerTicks({ h: H }) +
      frameClose({ h: H }),
  });
}

/* ------------------------------------------------------------------- stack */

export function stackSvg() {
  const H = 540;
  const cols = [32, 352, 672].map((x) => ({ x, y: 142, w: 296, h: 328 }));

  const accentOf = { cyan: C.cyan, teal: C.teal, blue: C.blueSoft };

  let panels = '';
  STACK.forEach((group, gi) => {
    const c = cols[gi];
    const accent = accentOf[group.accent] || C.cyan;
    panels +=
      panel({ x: c.x, y: c.y, w: c.w, h: c.h, r: 18, fill: 'url(#panelFill)', stroke: C.line }) +
      `<rect x="${c.x + 1}" y="${c.y + 1}" width="${c.w - 2}" height="1" fill="url(#topSheen)"/>` +
      `<rect x="${c.x + 24}" y="${c.y + 30}" width="26" height="2.5" rx="1.25" fill="${accent}" opacity=".9"/>` +
      label({ x: c.x + 24, y: c.y + 56, s: group.kicker, size: 10.5, fill: C.text4, spacing: 3 }) +
      txt({ x: c.x + 24, y: c.y + 86, s: group.title, size: 20, weight: 650, fill: C.white, spacing: -0.2 }) +
      wrap(group.note, 38).map((line, i) => txt({ x: c.x + 24, y: c.y + 110 + i * 17, s: line, size: 12, fill: C.text3 })).join('') +
      `<rect x="${c.x + 24}" y="${c.y + 146}" width="${c.w - 48}" height="1" fill="${C.lineSoft}"/>` +
      group.items
        .map((it, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const x = c.x + 24 + col * 134;
          const y = c.y + 180 + row * 32;
          return (
            icon({ name: it.icon, x, y: y - 12, size: 15, fill: accent, opacity: 0.95 }) +
            txt({ x: x + 23, y, s: it.name, size: 12.6, fill: C.text, weight: 450 })
          );
        })
        .join('') +
      txt({ x: c.x + c.w - 24, y: c.y + 30, s: String(group.items.length).padStart(2, '0'), size: 10.5, family: F.mono, fill: C.text4, anchor: 'end', spacing: 1.4 });
  });

  const lang = 'JavaScript · TypeScript · Python · C++ · SQL / NoSQL · HTML5 · CSS3';
  const extra = 'REST · JWT · PLAYWRIGHT · TESSERACT.JS';

  return svg({
    w: W,
    h: H,
    title: 'Tech stack — frontend and UI, backend and data, tools and delivery',
    defs: baseDefs(),
    children:
      frameOpen({ h: H }) +
      frameBg({ h: H, glow: [0.5, -0.1], glow2: [0.95, 0.85] }) +
      sectionHead({ y: 76, idx: '02', kicker: 'TECH STACK', title: 'Tools I build with', meta: '23 TECHNOLOGIES · 3 LAYERS', accent: C.teal }) +
      panels +
      rule({ x: 32, y: 502, w: W - 64, from: C.lineGlow, opacity: 0.4, id: 'stackRule' }) +
      txt({ x: 32, y: 528, s: 'ALSO WORKING WITH', size: 10.5, family: F.mono, fill: C.text4, spacing: 2.6 }) +
      txt({ x: 186, y: 528, s: lang, size: 11.6, family: F.mono, fill: C.text3, spacing: 0.2 }) +
      txt({ x: W - 32, y: 528, s: extra, size: 10, family: F.mono, fill: C.text4, spacing: 1, anchor: 'end' }) +
      cornerTicks({ h: H }) +
      frameClose({ h: H }),
  });
}
