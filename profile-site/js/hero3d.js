/* ==========================================================================
   hero3d.js — the WebGL hero
   A code-lab in space: GPU starfield, a glowing wireframe core with orbiting
   particles, and translucent "code panels" drifting in real 3D depth.
   Uses the vendored three.module.js — no CDN, no network required.
   ========================================================================== */
import * as THREE from "../vendor/three/three.module.js";

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Build a canvas texture containing syntax-highlighted code. */
function codeTexture(lines, accent = "#22d3ee") {
  const W = 512, H = 320, pad = 26, lh = 26;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d");

  g.fillStyle = "rgba(6,11,22,0.94)";
  g.fillRect(0, 0, W, H);

  g.strokeStyle = "rgba(126,158,214,0.28)";
  g.lineWidth = 2;
  g.strokeRect(1, 1, W - 2, H - 2);

  // window dots
  ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => {
    g.fillStyle = col;
    g.beginPath();
    g.arc(pad + i * 18, pad - 4, 5, 0, Math.PI * 2);
    g.fill();
  });

  g.font = "500 17px ui-monospace, Menlo, Consolas, monospace";
  g.textBaseline = "top";

  lines.forEach((tokens, row) => {
    let x = pad;
    const y = pad + 22 + row * lh;
    tokens.forEach(([txt, col]) => {
      g.fillStyle = col;
      g.fillText(txt, x, y);
      x += g.measureText(txt).width;
    });
  });

  // accent bar
  g.fillStyle = accent;
  g.globalAlpha = 0.85;
  g.fillRect(0, 0, W, 4);
  g.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

const SNIPPETS = [
  {
    accent: "#22d3ee",
    lines: [
      [["const ", "#c792ea"], ["app", "#82aaff"], [" = ", "#89ddff"], ["express", "#ffcb6b"], ["()", "#89ddff"]],
      [["app", "#82aaff"], [".", "#89ddff"], ["use", "#82aaff"], ["(req, res) => {", "#eeffff"]],
      [["  res", "#89ddff"], [".", "#89ddff"], ["json", "#82aaff"], ["({ ", "#eeffff"], ["ok", "#f78c6c"], [": ", "#89ddff"], ["true", "#ff5370"], [" })", "#eeffff"]],
      [["})", "#89ddff"]],
      [["", "#eeffff"]],
      [["// ", "#546e7a"], ["ship it", "#546e7a"]],
    ],
  },
  {
    accent: "#a78bfa",
    lines: [
      [["export default ", "#c792ea"], ["function", "#82aaff"], [" ", "#eeffff"], ["Hero", "#ffcb6b"], ["() {", "#89ddff"]],
      [["  ", "#eeffff"], ["return", "#c792ea"], [" (", "#89ddff"]],
      [["    <", "#89ddff"], ["section", "#f07178"], [" ", "#eeffff"], ["className", "#c792ea"], ["=", "#89ddff"], ["\"3d\"", "#c3e88d"], [" ", "#eeffff"], ["/>", "#89ddff"]],
      [["  )", "#89ddff"]],
      [["}", "#89ddff"]],
    ],
  },
  {
    accent: "#f472b6",
    lines: [
      [["db", "#82aaff"], [".", "#89ddff"], ["orders", "#ffcb6b"], [".", "#89ddff"], ["aggregate", "#82aaff"], ["([", "#89ddff"]],
      [["  { ", "#eeffff"], ["$match", "#c792ea"], [": { ", "#eeffff"], ["paid", "#f78c6c"], [": ", "#89ddff"], ["true", "#ff5370"], [" } }", "#eeffff"]],
      [["])", "#89ddff"]],
      [["", "#eeffff"]],
      [["→ ", "#a3e635"], ["28", "#f78c6c"], [" documents", "#546e7a"]],
    ],
  },
  {
    accent: "#a3e635",
    lines: [
      [["git ", "#a3e635"], ["push ", "#eeffff"], ["origin ", "#ffcb6b"], ["main", "#c3e88d"]],
      [["Enumerating objects", "#546e7a"], [": 128, ", "#89ddff"], ["done", "#a3e635"]],
      [["Writing objects", "#546e7a"], [": 100% ", "#89ddff"], ["(128/128)", "#eeffff"]],
      [["To github.com:mirkashi", "#546e7a"]],
      [["   ", "#eeffff"], ["e8384cb", "#f78c6c"], ["..", "#89ddff"], ["a1f9c2d", "#f78c6c"], ["  main", "#c3e88d"]],
    ],
  },
];

export function initHero3D() {
  const mount = document.getElementById("heroCanvas");
  if (!mount) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (err) {
    console.warn("WebGL unavailable, skipping 3D hero:", err);
    mount.style.display = "none";
    return;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03060e, 0.028);

  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 220);
  camera.position.set(0, 1.4, 15);

  const dpr = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(mount.clientWidth, mount.clientHeight, false);
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  const world = new THREE.Group();
  scene.add(world);

  /* ---------------- starfield: GPU points with custom shader ---------------- */
  const STAR_COUNT = 5200;
  const pos = new Float32Array(STAR_COUNT * 3);
  const aSeed = new Float32Array(STAR_COUNT);
  const aSize = new Float32Array(STAR_COUNT);
  const aColor = new Float32Array(STAR_COUNT * 3);

  const palette = [
    new THREE.Color("#67e8f9"),
    new THREE.Color("#a78bfa"),
    new THREE.Color("#f8fafc"),
    new THREE.Color("#f472b6"),
  ];

  for (let i = 0; i < STAR_COUNT; i++) {
    // distribute in a wide flattened shell so it reads as depth, not a ball
    const r = 16 + Math.pow(Math.random(), 0.62) * 74;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = (r * Math.cos(phi)) * 0.55;
    pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 22;
    aSeed[i] = Math.random();
    aSize[i] = 0.6 + Math.pow(Math.random(), 3) * 3.4;
    const c = palette[(Math.random() * palette.length) | 0];
    aColor[i * 3] = c.r; aColor[i * 3 + 1] = c.g; aColor[i * 3 + 2] = c.b;
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  starGeo.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 1));
  starGeo.setAttribute("aSize", new THREE.BufferAttribute(aSize, 1));
  starGeo.setAttribute("aColor", new THREE.BufferAttribute(aColor, 3));

  const starMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: dpr },
    },
    vertexShader: /* glsl */`
      attribute float aSeed;
      attribute float aSize;
      attribute vec3 aColor;
      uniform float uTime;
      uniform float uPixelRatio;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = aColor;
        vec3 p = position;
        // slow drift so the field breathes
        p.x += sin(uTime * 0.16 + aSeed * 24.0) * 1.6;
        p.y += cos(uTime * 0.13 + aSeed * 17.0) * 1.2;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float twinkle = 0.55 + 0.45 * sin(uTime * (1.1 + aSeed * 2.4) + aSeed * 40.0);
        vAlpha = twinkle;
        gl_PointSize = aSize * uPixelRatio * twinkle * (240.0 / max(-mv.z, 1.0));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float core = smoothstep(0.5, 0.0, d);
        float halo = pow(core, 3.0);
        gl_FragColor = vec4(vColor, (halo * 0.95 + core * 0.25) * vAlpha);
      }`,
  });
  const stars = new THREE.Points(starGeo, starMat);
  world.add(stars);

  /* ---------------- glowing core: wireframe icosahedron + shells ---------------- */
  const core = new THREE.Group();
  core.position.set(0, 0.6, 0);
  world.add(core);

  const icoGeo = new THREE.IcosahedronGeometry(3.1, 1);
  const icoWire = new THREE.LineSegments(
    new THREE.WireframeGeometry(icoGeo),
    new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.55 })
  );
  core.add(icoWire);

  const innerGeo = new THREE.IcosahedronGeometry(2.05, 0);
  const inner = new THREE.Mesh(innerGeo, new THREE.MeshBasicMaterial({
    color: 0xa78bfa, wireframe: true, transparent: true, opacity: 0.42,
  }));
  core.add(inner);

  const glowMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: { uColor: { value: new THREE.Color("#22d3ee") } },
    vertexShader: /* glsl */`
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor;
      varying vec3 vNormal;
      void main() {
        float rim = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
        gl_FragColor = vec4(uColor, clamp(rim, 0.0, 1.0) * 0.75);
      }`,
  });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(4.5, 40, 40), glowMat);
  core.add(glow);

  /* ---------------- orbiting particle rings ---------------- */
  function makeRing(radius, count, color, tilt, size) {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * 0.24;
      p[i * 3] = Math.cos(a) * (radius + jitter);
      p[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      p[i * 3 + 2] = Math.sin(a) * (radius + jitter);
    }
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    const m = new THREE.PointsMaterial({
      color, size, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    });
    const pts = new THREE.Points(g, m);
    pts.rotation.x = tilt;
    return pts;
  }
  const ringA = makeRing(5.4, 460, 0x67e8f9, Math.PI / 2.35, 0.075);
  const ringB = makeRing(6.6, 380, 0xa78bfa, Math.PI / 1.75, 0.06);
  const ringC = makeRing(7.9, 300, 0xf472b6, Math.PI / 3.1, 0.05);
  core.add(ringA, ringB, ringC);

  /* ---------------- floating code panels ---------------- */
  const panels = SNIPPETS.map((snip, i) => {
    const tex = codeTexture(snip.lines, snip.accent);
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, opacity: 0.9,
      side: THREE.DoubleSide, depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.9), mat);
    const a = (i / SNIPPETS.length) * Math.PI * 2 + 0.5;
    mesh.userData = {
      angle: a,
      radius: 9.2 + (i % 2) * 2.2,
      y: (i % 2 === 0 ? 1 : -1) * (1.5 + (i % 3) * 0.7),
      speed: 0.085 + (i % 3) * 0.022,
      bob: Math.random() * Math.PI * 2,
    };
    world.add(mesh);
    return mesh;
  });

  /* ---------------- perspective grid floor ---------------- */
  const grid = new THREE.GridHelper(160, 64, 0x1e40af, 0x0e2a4a);
  grid.material.transparent = true;
  grid.material.opacity = 0.24;
  grid.position.y = -7.4;
  world.add(grid);

  /* ---------------- pointer parallax ---------------- */
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  addEventListener("pointermove", (e) => {
    target.x = (e.clientX / innerWidth - 0.5) * 2;
    target.y = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ---------------- resize ---------------- */
  function resize() {
    const w = mount.clientWidth, h = mount.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the core framed on narrow screens
    camera.position.z = w < 720 ? 20 : w < 1100 ? 17.5 : 15;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener("resize", resize, { passive: true });

  /* ---------------- loop (pauses when off-screen) ---------------- */
  const clock = new THREE.Clock();
  let visible = true;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0.01 })
    .observe(mount);

  let frame = 0;
  function tick() {
    frame = requestAnimationFrame(tick);
    if (!visible) return;

    const t = clock.getElapsedTime();
    starMat.uniforms.uTime.value = t;

    if (!reduceMotion) {
      stars.rotation.y = t * 0.012;

      core.rotation.y = t * 0.16;
      core.rotation.x = Math.sin(t * 0.22) * 0.16;
      icoWire.rotation.x = -t * 0.1;
      inner.rotation.y = -t * 0.34;
      inner.rotation.z = t * 0.2;

      ringA.rotation.z = t * 0.3;
      ringB.rotation.z = -t * 0.24;
      ringC.rotation.z = t * 0.18;

      const pulse = 1 + Math.sin(t * 1.5) * 0.035;
      glow.scale.setScalar(pulse);
      icoWire.material.opacity = 0.44 + Math.sin(t * 1.9) * 0.14;

      panels.forEach((m) => {
        const d = m.userData;
        const a = d.angle + t * d.speed;
        m.position.set(Math.cos(a) * d.radius, d.y + Math.sin(t * 0.7 + d.bob) * 0.55, Math.sin(a) * d.radius);
        m.lookAt(camera.position);
        // fade panels as they pass behind the core
        const depth = (m.position.z + d.radius) / (d.radius * 2);
        m.material.opacity = 0.22 + depth * 0.72;
      });

      // scroll the floor by exactly one cell (160/64 = 2.5 units) so it loops seamlessly
      grid.position.z = (t * 1.6) % 2.5;
    }

    // damped pointer parallax
    current.x += (target.x - current.x) * 0.045;
    current.y += (target.y - current.y) * 0.045;
    world.rotation.y = current.x * 0.19;
    world.rotation.x = current.y * 0.11;
    camera.position.x = current.x * 1.1;
    camera.position.y = 1.4 - current.y * 0.7;
    camera.lookAt(0, 0.4, 0);

    renderer.render(scene, camera);
  }
  tick();

  /* ---------------- cleanup when the hero scrolls far away ---------------- */
  let idleTimer;
  const io = new IntersectionObserver((es) => {
    if (es[0].isIntersecting) {
      if (frame === 0) tick();
      clearTimeout(idleTimer);
    } else {
      idleTimer = setTimeout(() => { cancelAnimationFrame(frame); frame = 0; }, 1200);
    }
  }, { threshold: 0 });
  io.observe(mount);

  addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    renderer.dispose();
    starGeo.dispose(); starMat.dispose();
    icoGeo.dispose(); innerGeo.dispose();
  });
}
