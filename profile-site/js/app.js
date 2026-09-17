/* ==========================================================================
   LOOP LORD — app.js
   Rendering, interaction and motion. No framework: plain DOM + IntersectionObserver.
   ========================================================================== */
import { PROFILE, ORG, MIREXAMPLES, BBDPROJECTS, STATS } from "./data.js";
import { initHero3D } from "./hero3d.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------------------- icons */
const ICON = {
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:12px;height:12px"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  star: '<svg viewBox="0 0 16 16" aria-hidden="true" style="width:11px;height:11px;fill:currentColor"><path d="M8 .25a.75.75 0 0 1 .67.41l1.88 3.81 4.21.61a.75.75 0 0 1 .41 1.28l-3.04 2.97.72 4.19a.75.75 0 0 1-1.09.79L8 12.34l-3.76 1.97a.75.75 0 0 1-1.09-.79l.72-4.19L.83 6.36a.75.75 0 0 1 .41-1.28l4.21-.61L7.33.66A.75.75 0 0 1 8 .25Z"/></svg>',
  code: '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:12px;height:12px"><path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4Zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4Z" fill="currentColor"/></svg>',
};

/* ---------------------------------------------------------------- utils */
function avatarHTML(url, label) {
  return `<div class="avatar"><img src="${url}" alt="${label} avatar" loading="lazy"
      onerror="this.outerHTML='<div class=&quot;avatar-fallback&quot;>${label}</div>'"></div>`;
}

/** Image with a remote screenshot attempted first, local cover as fallback. */
function mediaHTML(p) {
  const remote = p.shots && p.shots[0];
  const src = remote || p.cover;
  const fb = p.cover;
  return `<img src="${src}" alt="${p.name} preview" loading="lazy" decoding="async"
      onerror="if(this.dataset.f!=='1'){this.dataset.f='1';this.src='${fb}';}else{this.style.display='none';}">`;
}

/* ---------------------------------------------------------------- cards */
function cardHTML(p, i, spotlight) {
  const spot = spotlight && p.featured;
  const stars = p.stars > 0
    ? `<span class="card-stars">${ICON.star} ${p.stars}</span>` : "";
  const live = p.demo ? `<span class="card-live">LIVE</span>` : "";
  const tech = p.tech.map((t) => `<span>${t}</span>`).join("");
  const links = `
    ${p.demo ? `<a href="${p.demo}" target="_blank" rel="noopener noreferrer">Demo ${ICON.arrow}</a>` : ""}
    <a class="gh" href="${p.repo}" target="_blank" rel="noopener noreferrer">${ICON.code} Code</a>`;

  return `
  <article class="card reveal d${(i % 4) + 1}${spot ? " spot" : ""}" data-cat="${p.cat}">
    <div class="card-in">
      ${spot ? '<span class="spot-flag">FEATURED</span>' : ""}
      <div class="card-media">
        ${mediaHTML(p)}
        <span class="card-tag">${p.kicker}</span>
        ${stars}${live}
      </div>
      <div class="card-body">
        <p class="card-kicker">${p.kicker}</p>
        <h4>${p.name}</h4>
        <p>${p.desc}</p>
        <div class="card-tech">${tech}</div>
        <div class="card-foot">
          <span class="card-langs">${p.langs}</span>
          <span class="card-links">${links}</span>
        </div>
      </div>
    </div>
  </article>`;
}

function renderProjects(list, mount, spotlightFirst) {
  // Featured (spotlight) card first, then the rest by stars.
  const sorted = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.stars - a.stars);
  mount.innerHTML = sorted.map((p, i) => cardHTML(p, i, spotlightFirst && i === 0)).join("");
}

/* ---------------------------------------------------------------- filters */
const CATS = {
  all: "All",
  web: "Web",
  saas: "SaaS",
  ai: "AI / ML",
  tool: "Tools",
  lab: "Labs",
  learn: "Learning",
};

function buildFilters(mount, grid, list) {
  const counts = { all: list.length };
  list.forEach((p) => { counts[p.cat] = (counts[p.cat] || 0) + 1; });

  const keys = Object.keys(CATS).filter((k) => k === "all" || counts[k]);
  mount.innerHTML = keys.map((k, i) =>
    `<button class="filter${i === 0 ? " on" : ""}" data-f="${k}">${CATS[k]}<b>${counts[k]}</b></button>`).join("");

  mount.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    $$(".filter", mount).forEach((b) => b.classList.toggle("on", b === btn));
    const f = btn.dataset.f;
    let shown = 0;
    $$(".card", grid).forEach((c) => {
      const ok = f === "all" || c.dataset.cat === f;
      c.classList.toggle("hide", !ok);
      if (ok) { shown++; c.classList.add("in"); }
    });
    const empty = $(".empty", grid);
    if (empty) empty.style.display = shown ? "none" : "block";
  });
}

/* ---------------------------------------------------------------- counters */
function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  if (reduced) { el.textContent = target + suffix; return; }
  const dur = 1500, t0 = performance.now();
  (function tick(now) {
    const k = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = Math.round(target * e) + suffix;
    if (k < 1) requestAnimationFrame(tick);
  })(t0);
}

/* ---------------------------------------------------------------- typing */
function typeLoop(el, lines, hold = 1900) {
  if (reduced) { el.textContent = lines[0]; return; }
  let li = 0, ci = 0, deleting = false;
  (function step() {
    const line = lines[li];
    ci += deleting ? -1 : 1;
    el.textContent = line.slice(0, ci);
    let wait = deleting ? 26 : 58;
    if (!deleting && ci === line.length) { wait = hold; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; li = (li + 1) % lines.length; wait = 340; }
    setTimeout(step, wait);
  })();
}

/* ---------------------------------------------------------------- terminal */
const TERM_LINES = [
  ['<span class="p">mirkashi</span><span class="o">:~$</span> ', 'cat profile.json'],
  ['<span class="o">{</span>', null],
  ['  <span class="k">"name"</span><span class="o">:</span> <span class="s">"Mir Kashif"</span><span class="o">,</span>', null],
  ['  <span class="k">"alias"</span><span class="o">:</span> <span class="s">"Loop Lord"</span><span class="o">,</span>', null],
  ['  <span class="k">"role"</span><span class="o">:</span> <span class="s">"Full-Stack Developer"</span><span class="o">,</span>', null],
  ['  <span class="k">"location"</span><span class="o">:</span> <span class="s">"Islamabad, PK"</span><span class="o">,</span>', null],
  ['  <span class="k">"stack"</span><span class="o">:</span> <span class="o">[</span><span class="s">"MERN"</span><span class="o">,</span> <span class="s">"Next.js"</span><span class="o">,</span> <span class="s">"TypeScript"</span><span class="o">],</span>', null],
  ['  <span class="k">"shipping"</span><span class="o">:</span> <span class="n">true</span>', null],
  ['<span class="o">}</span>', null],
  ['<span class="p">mirkashi</span><span class="o">:~$</span> ', 'npm run build:future'],
  ['<span class="c">✓ compiled 28 repositories in 1.42s</span>', null],
  ['<span class="p">mirkashi</span><span class="o">:~$</span> ', ''],
];

function runTerminal(el) {
  if (reduced) {
    el.innerHTML = TERM_LINES.map(([a, b]) => `<div>${a}${b || ""}</div>`).join("") + '<span class="caret"></span>';
    return;
  }
  let li = 0;
  (function nextLine() {
    if (li >= TERM_LINES.length) {
      const c = document.createElement("span");
      c.className = "caret";
      el.appendChild(c);
      return;
    }
    const [prefix, text] = TERM_LINES[li];
    const row = document.createElement("div");
    row.innerHTML = prefix;
    el.appendChild(row);
    if (text === null) { li++; setTimeout(nextLine, 105); return; }
    let i = 0;
    (function ch() {
      row.innerHTML = prefix + text.slice(0, i++);
      if (i <= text.length) setTimeout(ch, 34);
      else { li++; setTimeout(nextLine, 260); }
    })();
  })();
}

/* ---------------------------------------------------------------- 3D orbit */
function buildOrbit(mount, items) {
  const n = items.length;
  const radius = Math.max(150, Math.min(260, mount.clientWidth * 0.34));
  const ring = document.createElement("div");
  ring.className = "orbit-ring";
  items.forEach((t, i) => {
    const a = (360 / n) * i;
    const node = document.createElement("span");
    node.className = "orbit-node";
    node.style.setProperty("--a", a + "deg");
    node.style.setProperty("--r", radius + "px");
    node.innerHTML = t;
    ring.appendChild(node);
  });
  mount.innerHTML = '<div class="orbit-halo"></div><div class="orbit-core">STACK</div>';
  mount.appendChild(ring);
}

/* ---------------------------------------------------------------- tilt */
function initTilt() {
  if (reduced || matchMedia("(hover: none)").matches) return;
  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest(".card-in");
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    card.style.setProperty("--mx", px * 100 + "%");
    card.style.setProperty("--my", py * 100 + "%");
    const rx = (0.5 - py) * 11;
    const ry = (px - 0.5) * 13;
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`;
  }, { passive: true });

  document.addEventListener("pointerout", (e) => {
    const card = e.target.closest(".card-in");
    if (!card || card.contains(e.relatedTarget)) return;
    card.style.transform = "rotateX(0) rotateY(0) translateZ(0)";
  });
}

/* ---------------------------------------------------------------- observers */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      $$("[data-count]", en.target).forEach(animateCount);
      if (en.target.dataset.count) animateCount(en.target);
      if (en.target.classList.contains("terminal")) runTerminal($(".term-body", en.target));
      io.unobserve(en.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

  $$(".reveal, .card, .terminal, [data-count]").forEach((el) => io.observe(el));
}

function initBars() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      $$(".bar-fill", en.target).forEach((f) => { f.style.width = f.dataset.w + "%"; });
      io.unobserve(en.target);
    });
  }, { threshold: 0.3 });
  $$(".bars").forEach((b) => io.observe(b));
}

/* ---------------------------------------------------------------- nav */
function initNav() {
  const nav = $(".nav");
  const prog = $(".progress");
  const links = $(".nav-links");

  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle("stuck", y > 24);
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // NOTE: the burger click handler lives in the inline script in index.html
  // (it also syncs aria-expanded) — don't bind it twice here or it self-cancels.
  $$(".nav-links a").forEach((a) => a.addEventListener("click", () => links.classList.remove("open")));
  // active section highlight
  const ids = $$(".nav-links a").map((a) => a.getAttribute("href").slice(1));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      $$(".nav-links a").forEach((a) =>
        a.style.color = a.getAttribute("href") === "#" + en.target.id ? "#fff" : "");
    });
  }, { threshold: 0.4 });
  ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
}

/* ---------------------------------------------------------------- boot */
function boot() {
  // identity card
  const idc = $("#idcard");
  if (idc) {
    idc.innerHTML = `
      ${avatarHTML(PROFILE.avatar, "MK")}
      <div>
        <h3>${PROFILE.name}</h3>
        <div class="handle">@${PROFILE.handle} · ${PROFILE.location}</div>
      </div>`;
  }
  const idbio = $("#idbio");
  if (idbio) idbio.textContent = PROFILE.bio;
  const idstats = $("#idstats");
  if (idstats) {
    idstats.innerHTML = `
      <div><b>${PROFILE.publicRepos}</b><span>Repos</span></div>
      <div><b>${PROFILE.followers}</b><span>Followers</span></div>
      <div><b>${STATS.mirStars}</b><span>Stars</span></div>`;
  }
  const idchips = $("#idchips");
  if (idchips) {
    idchips.innerHTML = ["MERN", "Next.js", "TypeScript", "Node.js", "MongoDB", "Tailwind", "React"]
      .map((t) => `<span class="chip">${t}</span>`).join("");
  }

  // org header
  const orgAv = $("#orgAvatar");
  if (orgAv) {
    orgAv.innerHTML = `<img src="${ORG.avatar}" alt="${ORG.name} logo" loading="lazy"
      onerror="this.style.display='none'">`;
  }

  // project grids
  const mirGrid = $("#mirGrid");
  const bbdGrid = $("#bbdGrid");
  renderProjects(MIREXAMPLES, mirGrid, true);
  renderProjects(BBDPROJECTS, bbdGrid, true);
  buildFilters($("#mirFilters"), mirGrid, MIREXAMPLES);
  buildFilters($("#bbdFilters"), bbdGrid, BBDPROJECTS);

  // stack orbit
  const orbit = $("#orbit");
  if (orbit) {
    buildOrbit(orbit, [
      "React", "Next.js", "Node.js", "Express", "MongoDB", "TypeScript",
      "Tailwind", "Python", "PostgreSQL", "Git", "Vercel", "Docker",
    ]);
    addEventListener("resize", () => {
      buildOrbit(orbit, [
        "React", "Next.js", "Node.js", "Express", "MongoDB", "TypeScript",
        "Tailwind", "Python", "PostgreSQL", "Git", "Vercel", "Docker",
      ]);
    }, { passive: true });
  }

  // typing sequences
  const heroType = $("#heroType");
  if (heroType) {
    typeLoop(heroType, [
      "> building digital experiences that feel alive",
      "> MERN · Next.js · TypeScript · API design",
      "> turning ideas into shippable products",
      "> currently: shipping at BITSANDBYTESDUDE",
    ]);
  }
  const ctaType = $("#ctaType");
  if (ctaType) {
    typeLoop(ctaType, [
      "> have an idea worth shipping?",
      "> let's turn it into something people remember",
      "> open to freelance · collaboration · full-time",
    ], 2200);
  }

  initTilt();
  initReveal();
  initBars();
  initNav();
  initHero3D();

  // year
  const yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();
}

if (document.readyState === "loading") addEventListener("DOMContentLoaded", boot);
else boot();
