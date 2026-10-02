/**
 * theme.mjs — the design system behind the README artwork.
 *
 * Everything the profile renders is generated from this file + build.mjs, so the
 * whole visual identity stays in one place: one palette, one type scale, one set
 * of primitives. No third-party badge services, no template look.
 *
 * Toolchain: sharp (raster previews), simple-icons (brand glyphs).
 *   npm i -D sharp simple-icons@13
 */

import * as si from 'simple-icons';

/* ------------------------------------------------------------------ palette */

export const C = {
  // surfaces — near-black, layered
  ink0: '#04070C',
  ink1: '#060A11',
  ink2: '#080E17',
  ink3: '#0A111C',
  panel: '#080D16',
  panelTop: '#0B1220',

  // hairlines
  line: '#16243A',
  lineSoft: '#101B2B',
  lineGlow: '#1E4A63',

  // type
  white: '#FFFFFF',
  text: '#EAF2FB',
  text2: '#A7B9D2',
  text3: '#7C8EA9',
  text4: '#5A6B85',

  // accents — used sparingly
  cyan: '#22D3EE',
  cyanSoft: '#7FE3F5',
  teal: '#5EEAD4',
  blue: '#3B82F6',
  blueSoft: '#8AB8FF',
  violet: '#A78BFA',
  green: '#34D399',
};

export const F = {
  sans: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "ui-monospace, 'SFMono-Regular', 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
};

/* ---------------------------------------------------------------- utilities */

export const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** deterministic pseudo-random so every build produces byte-identical art */
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const num = (n) => (Math.round(n * 100) / 100).toString();

/* ------------------------------------------------------------------ glyphs */

/**
 * Brand + system glyphs as 24x24 (simple-icons) or 128x128 (devicon) paths.
 * Simple Icons is CC0; the VS Code mark is the MIT-licensed devicon path.
 */
const DEV = {
  vscode:
    'M90.767 127.126a7.968 7.968 0 0 0 6.35-.244l26.353-12.681a8 8 0 0 0 4.53-7.209V21.009a8 8 0 0 0-4.53-7.21L97.117 1.12a7.97 7.97 0 0 0-9.093 1.548l-50.45 46.026L15.6 32.013a5.328 5.328 0 0 0-6.807.302l-7.048 6.411a5.335 5.335 0 0 0-.006 7.888L20.796 64 1.74 81.387a5.336 5.336 0 0 0 .006 7.887l7.048 6.411a5.327 5.327 0 0 0 6.807.303l21.974-16.68 50.45 46.025a7.96 7.96 0 0 0 2.743 1.793Zm5.252-92.183L57.74 64l38.28 29.058V34.943Z',
};

const SI = {
  html: 'siHtml5',
  css: 'siCss3',
  javascript: 'siJavascript',
  typescript: 'siTypescript',
  react: 'siReact',
  nextjs: 'siNextdotjs',
  tailwind: 'siTailwindcss',
  bootstrap: 'siBootstrap',
  sass: 'siSass',
  node: 'siNodedotjs',
  express: 'siExpress',
  mongodb: 'siMongodb',
  postgres: 'siPostgresql',
  mysql: 'siMysql',
  python: 'siPython',
  git: 'siGit',
  github: 'siGithub',
  figma: 'siFigma',
  vercel: 'siVercel',
  netlify: 'siNetlify',
  docker: 'siDocker',
  three: 'siThreedotjs',
  x: 'siX',
  linkedin: 'siLinkedin',
  gmail: 'siGmail',
};

const GLYPH = {};
for (const [key, name] of Object.entries(SI)) GLYPH[key] = { box: 24, d: si[name].path };

// mark custom glyphs (drawn here so the art never depends on a third party)
GLYPH.vscode = { box: 128, d: DEV.vscode };
GLYPH.globe = {
  box: 24,
  d: 'M12 2.2a9.8 9.8 0 1 0 0 19.6 9.8 9.8 0 0 0 0-19.6Zm6.9 6.1h-2.6a15.6 15.6 0 0 0-1.3-3.4 8 8 0 0 1 3.9 3.4ZM12 4.2c.8 1.1 1.5 2.4 1.9 4.1h-3.8c.4-1.7 1.1-3 1.9-4.1ZM4.3 13.4a8 8 0 0 1 0-2.8h3c-.1.9-.1 1.9 0 2.8h-3Zm.8 2h2.6c.3 1.2.8 2.4 1.3 3.4a8 8 0 0 1-3.9-3.4Zm2.6-6.8H5.1a8 8 0 0 1 3.9-3.4c-.5 1-1 2.2-1.3 3.4Zm4.3 9.8c-.8-1.1-1.5-2.4-1.9-4.1h3.8c-.4 1.7-1.1 3-1.9 4.1Zm2.2 2.3c.5-1 1-2.2 1.3-3.4h2.6a8 8 0 0 1-3.9 3.4Zm1.9-5.5c.1-.9.1-1.9 0-2.8h3.2a8 8 0 0 1 0 2.8h-3.2Z',
};
GLYPH.mail = {
  box: 24,
  d: 'M3.4 5h17.2A2.4 2.4 0 0 1 23 7.4v9.2a2.4 2.4 0 0 1-2.4 2.4H3.4A2.4 2.4 0 0 1 1 16.6V7.4A2.4 2.4 0 0 1 3.4 5Zm0 1.8 -.0 0 8.6 6.1 8.6-6.1H3.4Zm17.8 1v-.4l-9.2 6.5-9.2-6.5v.4l-.0 8.8c0 .3.3.6.6.6h17.2c.3 0 .6-.3.6-.6V7.8Z',
};
GLYPH.dot = { box: 24, d: 'M12 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z' };
GLYPH.pin = {
  box: 24,
  d: 'M12 1.6c-3.9 0-7 3.1-7 7 0 5.2 7 13.8 7 13.8s7-8.6 7-13.8c0-3.9-3.1-7-7-7Zm0 9.6a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Z',
};
GLYPH.arrow = { box: 24, d: 'M7.5 16.5 16.5 7.5M9 7.5h7.5V15' };
GLYPH.bolt = { box: 24, d: 'M13.4 1.5 3.6 13.4h6.2l-1.2 9.1 9.8-11.9h-6.2l1.2-9.1Z' };

export function icon({ name, x, y, size, fill = C.text2, opacity = 1, cls = '' }) {
  const g = GLYPH[name];
  if (!g) throw new Error('unknown glyph: ' + name);
  const s = size / g.box;
  return `<g transform="translate(${num(x)} ${num(y)}) scale(${num(s)})"${cls ? ` class="${cls}"` : ''}>` +
    `<path d="${g.d}" fill="${fill}"${opacity !== 1 ? ` opacity="${opacity}"` : ''}/></g>`;
}

/* -------------------------------------------------------------- primitives */

export function panel({ x, y, w, h, r = 18, fill = 'url(#panelFill)', stroke = C.line, sw = 1, extra = '' }) {
  return `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${extra}/>`;
}

export function txt({
  x,
  y,
  s,
  size = 16,
  fill = C.text,
  family = F.sans,
  weight = 400,
  anchor = 'start',
  spacing = 0,
  opacity = 1,
  textLength = null,
  extra = '',
}) {
  const a = [
    `x="${num(x)}"`,
    `y="${num(y)}"`,
    `font-family="${family}"`,
    `font-size="${num(size)}"`,
    `font-weight="${weight}"`,
    `fill="${fill}"`,
  ];
  if (anchor !== 'start') a.push(`text-anchor="${anchor}"`);
  if (spacing) a.push(`letter-spacing="${num(spacing)}"`);
  if (opacity !== 1) a.push(`opacity="${opacity}"`);
  if (textLength) {
    a.push(`textLength="${num(textLength)}"`, 'lengthAdjust="spacingAndGlyphs"');
  }
  if (extra) a.push(extra);
  return `<text ${a.join(' ')}>${esc(s)}</text>`;
}

export function label({ x, y, s, size = 12.5, fill = C.cyan, spacing = 3.4, weight = 600, opacity = 1 }) {
  return txt({ x, y, s: s.toUpperCase(), size, fill, family: F.mono, weight, spacing, opacity });
}

export function rule({ x, y, w, from = C.lineGlow, to = 'transparent', opacity = 1, h = 1, id = null }) {
  const gid = id || `rule${Math.round((x + y + w) * 7919)}`;
  return (
    `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0">` +
    `<stop offset="0" stop-color="${from}" stop-opacity="${opacity}"/>` +
    `<stop offset="1" stop-color="${to}" stop-opacity="0"/>` +
    `</linearGradient></defs>` +
    `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${h}" fill="url(#${gid})"/>`
  );
}

/** pill chip, returns { svg, w } so callers can flow them horizontally */
export function chip({ x, y, s, size = 12, h = 28, padx = 14, fill = C.text2, stroke = C.line, bg = 'none', spacing = 1.8, dot = null }) {
  const w = Math.round(s.length * size * 0.62 + padx * 2 + (dot ? 14 : 0));
  const svg =
    `<rect x="${num(x)}" y="${num(y)}" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}" stroke="${stroke}" stroke-width="1"/>` +
    (dot ? `<circle cx="${num(x + padx)}" cy="${num(y + h / 2)}" r="3" fill="${dot}"/>` : '') +
    txt({
      x: x + padx + (dot ? 12 : 0),
      y: y + h / 2 + size * 0.36,
      s: s.toUpperCase(),
      size,
      fill,
      family: F.mono,
      spacing,
      weight: 500,
    });
  return { svg, w };
}

/** shared <defs>: gradients, glows, grid patterns, grain */
export function baseDefs({ grid = true } = {}) {
  return `<defs>
    <linearGradient id="panelFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.panelTop}"/>
      <stop offset="1" stop-color="${C.panel}"/>
    </linearGradient>
    <linearGradient id="surface" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.ink1}"/>
      <stop offset="0.55" stop-color="${C.ink2}"/>
      <stop offset="1" stop-color="${C.ink0}"/>
    </linearGradient>
    <linearGradient id="hairline" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${C.cyan}" stop-opacity=".55"/>
      <stop offset="1" stop-color="${C.violet}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="topSheen" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.white}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${C.white}" stop-opacity=".22"/>
      <stop offset="1" stop-color="${C.white}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="glowCyan" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${C.cyan}" stop-opacity=".35"/>
      <stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowViolet" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${C.violet}" stop-opacity=".3"/>
      <stop offset="1" stop-color="${C.violet}" stop-opacity="0"/>
    </radialGradient>
    ${grid ? `<pattern id="grid16" width="16" height="16" patternUnits="userSpaceOnUse">
      <path d="M16 0H0V16" fill="none" stroke="${C.lineSoft}" stroke-width="1" opacity=".5"/>
    </pattern>` : ''}
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
    <filter id="soft8" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
    <filter id="soft3" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
    <clipPath id="clipSurface"><rect x="0" y="0" width="1200" height="100%" rx="0"/></clipPath>
  </defs>`;
}

export function svg({ w, h, title, children, defs = '', style = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">${defs}${
    style ? `<style>${style}</style>` : ''
  }${children}</svg>`;
}

/**
 * SMIL sweep: a gradient whose band slides left→right, forever.
 * `x0`→`x1` is the travel path, `band` the width of the moving highlight.
 */
export function sheen({ id, x0, x1, y0 = 0, y1 = 0, band = 240, dur = 7, stops, begin = 0 }) {
  const stopsSvg = stops
    .map((s) => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`)
    .join('');
  const p = (v) => num(Math.round(v * 100) / 100);
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${p(x0)}" y1="${p(y0)}" x2="${p(x0 + band)}" y2="${p(y1)}">
      ${stopsSvg}
      <animate attributeName="x1" values="${p(x0)};${p(x1)}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>
      <animate attributeName="x2" values="${p(x0 + band)};${p(x1 + band)}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>
    </linearGradient>`;
}

/** a static vertical fade used to seat previews into card bodies */
export function fadeGradient({ id, stops, dir = 'v' }) {
  const attrs =
    dir === 'v'
      ? 'x1="0" y1="0" x2="0" y2="1"'
      : 'x1="0" y1="0" x2="1" y2="0"';
  return `<linearGradient id="${id}" ${attrs}>${stops
    .map((s) => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`)
    .join('')}</linearGradient>`;
}
