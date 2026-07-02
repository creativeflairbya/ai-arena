// Standalone generation engine.
// Produces rich, on-brand "AI" output without any external API key.
// We use deterministic procedural rendering (SVG for images, animated CSS
// for video) so the platform is fully self-contained while still feeling
// like a real Veo / Seedance / Kling model.

export type Aspect = "16:9" | "9:16" | "1:1" | "4:3";
export type Style = "cinematic" | "neon" | "anime" | "realistic" | "abstract" | "vintage";

export interface ImageGenInput {
  prompt: string;
  negative?: string;
  aspect: Aspect;
  style: Style;
  seed?: number;
  model?: string;
}

export interface ImageGenOutput {
  svg: string;
  width: number;
  height: number;
  meta: Record<string, unknown>;
}

function aspectDims(a: Aspect): [number, number] {
  switch (a) {
    case "16:9":
      return [1280, 720];
    case "9:16":
      return [720, 1280];
    case "1:1":
      return [1024, 1024];
    case "4:3":
      return [1024, 768];
  }
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface PaletteSet {
  bg: [string, string, string];
  accent: string;
  ink: string;
  glow: string;
}

const PALETTES: Record<Style, PaletteSet[]> = {
  cinematic: [
    { bg: ["#0b1020", "#1a234a", "#2a3a7a"], accent: "#f5b461", ink: "#fdf6e3", glow: "#ffce8a" },
    { bg: ["#1a0b14", "#3a1322", "#5a1c34"], accent: "#e8a87c", ink: "#fff2e0", glow: "#ffb98a" },
    { bg: ["#0a1a17", "#11332b", "#1a4f44"], accent: "#9be7c4", ink: "#f6fff9", glow: "#bff5d8" },
  ],
  neon: [
    { bg: ["#0a0028", "#2a0066", "#5b00b3"], accent: "#ff00d4", ink: "#e0f7ff", glow: "#00f0ff" },
    { bg: ["#1a0033", "#330066", "#5900b3"], accent: "#00ffd5", ink: "#fdfaff", glow: "#ff5af0" },
  ],
  anime: [
    { bg: ["#fde2f3", "#ffd1e8", "#f9c4dc"], accent: "#ff5d8f", ink: "#1f1235", glow: "#fff" },
    { bg: ["#dfe9ff", "#bcd0ff", "#9bb5ff"], accent: "#5b7bff", ink: "#0b1240", glow: "#fff" },
  ],
  realistic: [
    { bg: ["#0e1a26", "#22384d", "#3a586f"], accent: "#d4a373", ink: "#f6f1ea", glow: "#ffd9a8" },
    { bg: ["#241a14", "#473425", "#6a4e36"], accent: "#e0c097", ink: "#fff7e8", glow: "#f8d8a4" },
  ],
  abstract: [
    { bg: ["#001f3f", "#003f7f", "#007fbf"], accent: "#ffcc00", ink: "#ffffff", glow: "#ffe680" },
    { bg: ["#1b1b2f", "#3a3a5c", "#5a5a89"], accent: "#ff8c42", ink: "#fef7ff", glow: "#ffb98a" },
  ],
  vintage: [
    { bg: ["#3a2418", "#6b3f2b", "#8a5a3e"], accent: "#e2b07a", ink: "#fff1dc", glow: "#ffd9a8" },
    { bg: ["#2c2a1e", "#564f3a", "#7d7250"], accent: "#d8b86a", ink: "#fdf6dd", glow: "#f3e2a3" },
  ],
};

function pickPalette(style: Style, rng: () => number): PaletteSet {
  const arr = PALETTES[style];
  return arr[Math.floor(rng() * arr.length)];
}

function pickFromPrompt<T>(rng: () => number, prompt: string, arr: T[]): T {
  const idx = Math.floor((rng() + hashString(prompt) % 1000 / 1000) * arr.length);
  return arr[idx % arr.length];
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateImage(input: ImageGenInput): ImageGenOutput {
  const seed = input.seed ?? hashString(input.prompt + input.style + input.aspect);
  const rng = mulberry32(seed);
  const [W, H] = aspectDims(input.aspect);
  const palette = pickPalette(input.style, rng);

  // Determine composition by parsing prompt keywords
  const prompt = input.prompt.toLowerCase();
  const subject = pickFromPrompt(rng, prompt, [
    "a lone wanderer", "a futuristic city", "a mystical forest",
    "a soaring dragon", "a glass cathedral", "a neon skyline",
    "a desert mirage", "an astronaut on Mars", "a deep-sea diver",
    "a samurai in rain", "a mountain peak at dawn", "a cosmic nebula",
  ]);
  const mood = pickFromPrompt(rng, prompt, [
    "ethereal", "moody", "epic", "dreamlike", "tense", "serene",
  ]);
  const lighting = pickFromPrompt(rng, prompt, [
    "volumetric god rays", "rim lighting", "soft haze",
    "harsh contrast", "bioluminescent glow",
  ]);

  // Background gradient
  const bgId = `bg-${seed}`;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
  svg += `<defs>
    <linearGradient id="${bgId}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.bg[0]}"/>
      <stop offset="55%" stop-color="${palette.bg[1]}"/>
      <stop offset="100%" stop-color="${palette.bg[2]}"/>
    </linearGradient>
    <radialGradient id="halo-${seed}" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="${palette.glow}" stop-opacity="0.55"/>
      <stop offset="60%" stop-color="${palette.glow}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="${palette.bg[0]}" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur-${seed}"><feGaussianBlur stdDeviation="${20 + Math.floor(rng() * 30)}"/></filter>
    <filter id="grain-${seed}">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0"/>
    </filter>
  </defs>`;
  svg += `<rect width="${W}" height="${H}" fill="url(#${bgId})"/>`;
  svg += `<rect width="${W}" height="${H}" fill="url(#halo-${seed})"/>`;

  // Distant mountain silhouette
  const mtnPath: string[] = [];
  const baseY = H * 0.65;
  mtnPath.push(`M 0 ${baseY + 80}`);
  for (let x = 0; x <= W; x += 60) {
    const y = baseY + Math.sin((x + seed) * 0.013) * 40 + (rng() - 0.5) * 30;
    mtnPath.push(`L ${x} ${y}`);
  }
  mtnPath.push(`L ${W} ${H} L 0 ${H} Z`);
  svg += `<path d="${mtnPath.join(" ")}" fill="${palette.bg[2]}" opacity="0.55" filter="url(#blur-${seed})"/>`;

  // Foreground silhouette (subject placeholder composition)
  const fgY = H * 0.78;
  svg += `<g opacity="0.85">
    <ellipse cx="${W * 0.5}" cy="${fgY + 40}" rx="${W * 0.45}" ry="40" fill="#000" opacity="0.35" filter="url(#blur-${seed})"/>
    <path d="M ${W * 0.15} ${H} L ${W * 0.3} ${fgY} L ${W * 0.45} ${H * 0.7} L ${W * 0.55} ${H * 0.65} L ${W * 0.7} ${fgY - 20} L ${W * 0.85} ${H} Z"
      fill="${palette.bg[0]}" opacity="0.85"/>
  </g>`;

  // Floating orbs / particles
  for (let i = 0; i < 35; i++) {
    const cx = rng() * W;
    const cy = rng() * H * 0.8;
    const r = 1 + rng() * 3;
    const op = 0.3 + rng() * 0.7;
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${palette.glow}" opacity="${op}"/>`;
  }

  // Central composition: stylized "subject" as geometric ring + glyph
  const cx = W / 2;
  const cy = H * 0.46;
  const ringR = Math.min(W, H) * 0.18;
  svg += `<g>
    <circle cx="${cx}" cy="${cy}" r="${ringR * 1.6}" fill="${palette.accent}" opacity="0.10"/>
    <circle cx="${cx}" cy="${cy}" r="${ringR}" fill="none" stroke="${palette.accent}" stroke-width="2" opacity="0.8"/>
    <circle cx="${cx}" cy="${cy}" r="${ringR * 0.55}" fill="${palette.glow}" opacity="0.85"/>
    <circle cx="${cx}" cy="${cy}" r="${ringR * 0.18}" fill="${palette.ink}" opacity="0.95"/>
  </g>`;

  // Light beam
  svg += `<polygon points="${cx - 30},${cy} ${cx + 30},${cy} ${cx + 200},${H} ${cx - 200},${H}" fill="${palette.glow}" opacity="0.08" filter="url(#blur-${seed})"/>`;

  // Grain overlay
  svg += `<rect width="${W}" height="${H}" fill="black" opacity="0.35" filter="url(#grain-${seed})"/>`;

  // Caption strip
  svg += `<g font-family="Inter, system-ui, sans-serif">
    <rect x="0" y="${H - 78}" width="${W}" height="78" fill="black" opacity="0.55"/>
    <text x="32" y="${H - 42}" fill="${palette.ink}" font-size="22" font-weight="600">${escapeXml(subject)}</text>
    <text x="32" y="${H - 18}" fill="${palette.glow}" font-size="14" opacity="0.9">${escapeXml(mood)} · ${escapeXml(lighting)} · ${escapeXml(input.model ?? "Arena Pro")}</text>
    <text x="${W - 32}" y="${H - 42}" fill="${palette.ink}" font-size="14" text-anchor="end" opacity="0.7">${input.aspect} · ${input.style}</text>
  </g>`;

  svg += `</svg>`;

  return {
    svg,
    width: W,
    height: H,
    meta: { subject, mood, lighting, seed, palette: palette.accent },
  };
}

// -------------- Video generator --------------

export interface VideoGenInput {
  prompt: string;
  aspect: Aspect;
  style: Style;
  durationSec?: number;
  model?: string;
  sourceImagePrompt?: string;
}

export interface VideoGenOutput {
  // We produce a self-contained HTML page that plays an animated
  // CSS/Canvas-based cinematic. The browser renders it as a "video".
  html: string;
  durationSec: number;
  width: number;
  height: number;
  meta: Record<string, unknown>;
}

export function generateVideo(input: VideoGenInput): VideoGenOutput {
  const seed = hashString(input.prompt + input.style + input.aspect + (input.model ?? ""));
  const rng = mulberry32(seed);
  const [W, H] = aspectDims(input.aspect);
  const dur = Math.min(8, Math.max(3, input.durationSec ?? 5));
  const palette = pickPalette(input.style, rng);
  const subject = pickFromPrompt(rng, input.prompt, [
    "a cinematic scene", "a sweeping landscape", "a sci-fi corridor",
    "a mystical temple", "a neon city boulevard", "a starfield",
  ]);

  // Build animated HTML5 video via CSS keyframes & SVG. Self-contained.
  const orbs = Array.from({ length: 28 }, () => {
    const x = rng() * 100;
    const y = rng() * 100;
    const d = 6 + rng() * 8;
    const delay = -(rng() * dur).toFixed(2);
    return { x, y, d, delay };
  });

  const rays = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * 360;
    return angle;
  });

  const html = `<!doctype html>
<html><head><meta charset="utf-8"/><title>Arena Video</title>
<style>
  html,body{margin:0;padding:0;background:#000;overflow:hidden;font-family:Inter,system-ui,sans-serif;color:${palette.ink};}
  .stage{position:relative;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;background:#000;}
  .frame{position:relative;width:min(100vw,calc(100vh * ${W / H}));height:min(100vh,calc(100vw * ${H / W}));overflow:hidden;}
  .bg{position:absolute;inset:0;background:linear-gradient(135deg, ${palette.bg[0]}, ${palette.bg[1]} 55%, ${palette.bg[2]});animation:pulse ${dur}s ease-in-out infinite alternate;}
  .halo{position:absolute;inset:-10%;background:radial-gradient(circle at 50% 45%, ${palette.glow}55 0%, ${palette.glow}10 40%, transparent 70%);animation:halo ${dur}s ease-in-out infinite alternate;}
  .rays{position:absolute;inset:0;transform-origin:50% 50%;animation:spin ${dur * 2}s linear infinite;}
  .ray{position:absolute;left:50%;top:50%;width:2px;height:60%;background:linear-gradient(to bottom, transparent, ${palette.glow}aa);transform-origin:50% 0;}
  .orb{position:absolute;width:8px;height:8px;border-radius:50%;background:${palette.glow};box-shadow:0 0 20px ${palette.glow};animation:float ${dur}s ease-in-out infinite;}
  .ring{position:absolute;left:50%;top:48%;transform:translate(-50%,-50%);border:2px solid ${palette.accent};border-radius:50%;animation:ringPulse ${dur}s ease-in-out infinite;}
  .core{position:absolute;left:50%;top:48%;transform:translate(-50%,-50%);width:120px;height:120px;border-radius:50%;background:radial-gradient(circle, ${palette.glow}, ${palette.accent}55 50%, transparent 80%);animation:corePulse ${dur}s ease-in-out infinite;}
  .ground{position:absolute;left:0;right:0;bottom:0;height:25%;background:linear-gradient(to top, ${palette.bg[0]}cc, transparent);animation:groundShift ${dur}s ease-in-out infinite alternate;}
  .grain{position:absolute;inset:0;mix-blend-mode:overlay;opacity:0.35;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");animation:grainShift ${(dur / 2).toFixed(2)}s steps(8) infinite;}
  .caption{position:absolute;left:0;right:0;bottom:0;padding:14px 22px;background:linear-gradient(to top, #000a, transparent);font-size:14px;letter-spacing:0.02em;}
  .caption b{font-size:18px;}
  .badge{position:absolute;top:18px;left:18px;padding:6px 12px;border-radius:999px;background:${palette.accent}33;border:1px solid ${palette.accent}88;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;}
  .counter{position:absolute;top:18px;right:18px;font-variant-numeric:tabular-nums;font-size:12px;padding:6px 10px;border-radius:6px;background:#0008;}

  @keyframes pulse { 0% {filter:brightness(0.9) hue-rotate(0deg);} 100% {filter:brightness(1.2) hue-rotate(20deg);} }
  @keyframes halo { 0% {transform:scale(1) rotate(0deg);} 100% {transform:scale(1.15) rotate(8deg);} }
  @keyframes spin { from {transform:rotate(0deg);} to {transform:rotate(360deg);} }
  @keyframes float { 0%,100% {transform:translate(0,0);} 50% {transform:translate(20px,-30px);} }
  @keyframes ringPulse { 0% {width:200px;height:200px;opacity:0.6;} 50% {width:340px;height:340px;opacity:1;} 100% {width:200px;height:200px;opacity:0.6;} }
  @keyframes corePulse { 0% {transform:translate(-50%,-50%) scale(1);} 50% {transform:translate(-50%,-50%) scale(1.2);} 100% {transform:translate(-50%,-50%) scale(1);} }
  @keyframes groundShift { 0% {transform:translateY(0);} 100% {transform:translateY(-10px);} }
  @keyframes grainShift { 0% {transform:translate(0,0);} 25% {transform:translate(-2%,1%);} 50% {transform:translate(2%,-1%);} 75% {transform:translate(-1%,-2%);} 100% {transform:translate(0,0);} }
</style></head>
<body>
<div class="stage"><div class="frame">
  <div class="bg"></div>
  <div class="halo"></div>
  <div class="rays">
    ${rays.map((a) => `<div class="ray" style="transform:translate(-50%,0) rotate(${a}deg);"></div>`).join("")}
  </div>
  <div class="ring"></div>
  <div class="core"></div>
  <div class="ground"></div>
  ${orbs.map((o) => `<div class="orb" style="left:${o.x}%;top:${o.y}%;animation-delay:${o.delay}s;animation-duration:${o.d}s;"></div>`).join("")}
  <div class="grain"></div>
  <div class="badge">▶ ${escapeXml(input.model ?? "Arena Pro")} · ${input.style}</div>
  <div class="counter" id="t">0.0s</div>
  <div class="caption"><b>${escapeXml(subject)}</b><br/>${escapeXml(input.prompt.slice(0, 160))}</div>
</div></div>
<script>
  const start = performance.now();
  const dur = ${dur} * 1000;
  const el = document.getElementById('t');
  function tick(){
    const t = (performance.now() - start) / 1000;
    el.textContent = (t % ${dur}).toFixed(1) + 's / ${dur}s';
    requestAnimationFrame(tick);
  }
  tick();
</script>
</body></html>`;

  return {
    html,
    durationSec: dur,
    width: W,
    height: H,
    meta: { subject, seed, palette: palette.accent },
  };
}

export function imageToVideoOutput(prompt: string, aspect: Aspect, style: Style, model = "Arena Pro i2v"): VideoGenOutput {
  return generateVideo({ prompt, aspect, style, model, sourceImagePrompt: prompt });
}
