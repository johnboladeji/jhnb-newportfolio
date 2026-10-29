import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, LayoutGrid, Pause, Play } from "lucide-react";
import { projects, worksHeadline, worksShowcase as L, type Project } from "../content";
import { hasCaseStudy, WorksList } from "./Works";

/**
 * The Projects page's hero, after williamrajwan.com's structure (the content is all John's, from `projects`):
 *
 *   - A horizontal slideshow, one slide per view: the intro (the headline, one sentence per line, the last in the accent
 *     gradient), then each project (numbered kicker, the name large in its signature colour, badges, role and years,
 *     summary, tags, glowing View project / Visit live buttons). Each slide holds while it slowly zooms in, then the next
 *     slides in sideways. It pauses while the pointer is on the copy, while focus is inside, when the visitor presses
 *     pause, and when it is scrolled away; arrows, dots (with the hold's progress), swipe, and the arrow keys move it.
 *   - Behind it, luminous strands trace each project's real logo or brand name (`MARKS`), and never sit still: light
 *     pulses run along every outline, the field surges every few seconds, and the pointer parts the strands and makes
 *     them flare.
 *   - Below, the full "All work" grid with covers.
 *
 * Performance: the strands are batched into a few strokes per frame (by colour), drawn at up to 1.5× density, only
 * while on screen; the traced marks are cached for the visit; and the landing page's WebGL pauses while this full-screen
 * panel covers it (InfoDrawer sets `data-covered`). Reduced motion: no autoplay, no drift or zoom, shapes in place.
 */

/**
 * What the strands draw for each project: its real logo where the site has one (Caira's heart-to-infinity mark and
 * wordmark; TokenForge's pennant F and wordmark), otherwise its brand name set in its own typeface.
 */
type Mark =
  | { kind: "image"; src: string }
  | { kind: "text"; text: string; font: string; family: string }
  | { kind: "token"; text: string };
const MARKS: Record<string, Mark> = {
  caira: { kind: "image", src: "/work/caira/logo-light.webp" },
  nexuscore: { kind: "text", text: "NexusCore", font: "700 150px", family: "DM Sans" },
  tokenforge: { kind: "token", text: "TokenForge" },
  carf: { kind: "text", text: "CARF", font: "400 170px", family: "Anton" },
  mova: { kind: "text", text: "MOVA", font: "400 170px", family: "Anton" },
  unelo: { kind: "text", text: "Unelo", font: "700 160px", family: "Space Grotesk" },
};

/** Each project's signature colours (from its own brand where it has one); the first is the name's colour. */
const SIGNATURE: Record<string, string[]> = {
  caira: ["#d4735c", "#d4a373", "#f1e6ce", "#c05a44"],
  nexuscore: ["#bad532", "#ede9fa", "#9b87f5", "#bad532"],
  tokenforge: ["#b57af0", "#dee4fe", "#9f46e5", "#f1e6ce"],
  carf: ["#ffd0a1", "#f0937a", "#f2a65a", "#983a28"],
  mova: ["#f2a65a", "#ffd0a1", "#983a28", "#f1e6ce"],
  unelo: ["#f0937a", "#983a28", "#ffd0a1", "#f1e6ce"],
};
const INTRO_PALETTE = ["#983a28", "#f0937a", "#ffd0a1", "#f2a65a", "#f1e6ce"];
const palette = (scene: number) => (scene === 0 ? INTRO_PALETTE : SIGNATURE[projects[scene - 1].slug] ?? INTRO_PALETTE);

const pad = (n: number) => String(n).padStart(2, "0");
const hex = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];

// ---- Strands ------------------------------------------------------------------------------------------------------
const POINTS = 38;
const TAIL = 10; // points spent flowing in before tracing the mark

/** A small seeded random, so every strand keeps its character from scene to scene */
const seeded = (seed: number) => {
  const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // The first few draws of this generator are tiny for small seeds; skip them so every strand is truly random
  for (let i = 0; i < 4; i++) next();
  return next;
};

/** One outline of a mark, in 0–1 coordinates of the mark's box */
interface Subpath {
  pts: [number, number][];
  closed: boolean;
  len: number;
}
interface Shape {
  paths: Subpath[];
  /** width / height of the mark */
  aspect: number;
}

/** Draw a mark onto a canvas: the logo image, the TokenForge pennant F and wordmark, or the brand name. */
async function drawMark(mark: Mark): Promise<HTMLCanvasElement> {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  const H = 200;
  if (mark.kind === "image") {
    const img = new Image();
    img.src = mark.src;
    await img.decode();
    const w = Math.round((img.naturalWidth / img.naturalHeight) * (H - 24));
    c.width = w + 24;
    c.height = H;
    ctx.drawImage(img, 12, 12, w, H - 24);
    return c;
  }
  const family = mark.kind === "token" ? "Inter" : mark.family;
  const font = mark.kind === "token" ? "700 120px" : mark.font;
  await document.fonts.load(`${font} "${family}"`, mark.text).catch(() => undefined);
  ctx.font = `${font} "${family}", sans-serif`;
  const tw = ctx.measureText(mark.text).width;
  const markW = mark.kind === "token" ? 124 : 0; // the pennant F (68×120 at 1.15 scale) plus a gap
  c.width = Math.ceil(tw + markW + 32);
  c.height = H;
  ctx.fillStyle = "#fff";
  if (mark.kind === "token") {
    ctx.save();
    ctx.translate(14, 30);
    ctx.scale(1.15, 1.15);
    ctx.fill(new Path2D("M0 0 H64 V27 H28 V120 H0 Z"));
    ctx.fill(new Path2D("M28 46 L67 76 L28 100 Z"));
    ctx.restore();
  }
  ctx.font = `${font} "${family}", sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillText(mark.text, 16 + markW, H / 2 + 4);
  return c;
}

/** Trace the filled areas of a canvas into closed outlines (marching squares), smoothed and evenly resampled. */
function traceOutlines(c: HTMLCanvasElement): Shape {
  const w = c.width;
  const h = c.height;
  const data = c.getContext("2d")!.getImageData(0, 0, w, h).data;
  const on = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : data[(y * w + x) * 4 + 3] > 110 ? 1 : 0);
  // Edge segments of every cell on the boundary, keyed by endpoint for chaining
  const segs: number[][] = [];
  for (let y = -1; y < h; y++) {
    for (let x = -1; x < w; x++) {
      const k = on(x, y) * 8 + on(x + 1, y) * 4 + on(x + 1, y + 1) * 2 + on(x, y + 1);
      if (k === 0 || k === 15) continue;
      const T = [x + 0.5, y];
      const R = [x + 1, y + 0.5];
      const B = [x + 0.5, y + 1];
      const Lf = [x, y + 0.5];
      const add = (a: number[], b: number[]) => segs.push([a[0], a[1], b[0], b[1]]);
      if (k === 1 || k === 14) add(Lf, B);
      else if (k === 2 || k === 13) add(B, R);
      else if (k === 3 || k === 12) add(Lf, R);
      else if (k === 4 || k === 11) add(T, R);
      else if (k === 6 || k === 9) add(T, B);
      else if (k === 7 || k === 8) add(Lf, T);
      else if (k === 5) {
        add(Lf, T);
        add(B, R);
      } else if (k === 10) {
        add(T, R);
        add(Lf, B);
      }
    }
  }
  const key = (x: number, y: number) => `${x * 2},${y * 2}`;
  const at = new Map<string, number[]>();
  segs.forEach((s, i) => {
    for (const k of [key(s[0], s[1]), key(s[2], s[3])]) {
      const list = at.get(k);
      if (list) list.push(i);
      else at.set(k, [i]);
    }
  });
  const used = new Uint8Array(segs.length);
  const paths: Subpath[] = [];
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const loop: [number, number][] = [[segs[i][0], segs[i][1]]];
    let cur: [number, number] = [segs[i][2], segs[i][3]];
    for (let guard = 0; guard < 100000; guard++) {
      loop.push(cur);
      const next = (at.get(key(cur[0], cur[1])) ?? []).find((j) => !used[j]);
      if (next === undefined) break;
      used[next] = 1;
      const s = segs[next];
      cur = s[0] === cur[0] && s[1] === cur[1] ? [s[2], s[3]] : [s[0], s[1]];
    }
    if (loop.length < 24) continue; // specks
    // Smooth the pixel staircase, then resample evenly (about one point per 3 px of outline)
    let pts = loop;
    for (let pass = 0; pass < 3; pass++) {
      pts = pts.map((p, k) => {
        const a = pts[(k - 1 + pts.length) % pts.length];
        const b = pts[(k + 1) % pts.length];
        return [(a[0] + p[0] * 2 + b[0]) / 4, (a[1] + p[1] * 2 + b[1]) / 4];
      });
    }
    let len = 0;
    const cum = [0];
    for (let k = 1; k <= pts.length; k++) {
      const a = pts[k - 1];
      const b = pts[k % pts.length];
      len += Math.hypot(b[0] - a[0], b[1] - a[1]);
      cum.push(len);
    }
    const n = Math.max(16, Math.round(len / 3));
    const even: [number, number][] = [];
    let j = 0;
    for (let k = 0; k <= n; k++) {
      const d = (k / n) * len;
      while (j < cum.length - 2 && cum[j + 1] < d) j++;
      const a = pts[j % pts.length];
      const b = pts[(j + 1) % pts.length];
      const t = (d - cum[j]) / Math.max(1e-6, cum[j + 1] - cum[j]);
      even.push([(a[0] + (b[0] - a[0]) * t) / w, (a[1] + (b[1] - a[1]) * t) / h]);
    }
    paths.push({ pts: even, closed: true, len });
  }
  // Crop the box to the ink, so the mark centres on its own shape
  let minX = 1,
    minY = 1,
    maxX = 0,
    maxY = 0;
  paths.forEach((p) =>
    p.pts.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }),
  );
  const bw = Math.max(1e-6, maxX - minX);
  const bh = Math.max(1e-6, maxY - minY);
  paths.forEach((p) => (p.pts = p.pts.map(([x, y]) => [(x - minX) / bw, (y - minY) / bh])));
  return { paths, aspect: (bw * w) / (bh * h) };
}

const at = (sp: Subpath, f: number): [number, number] => {
  const n = sp.pts.length - 1;
  let x = f * n;
  if (sp.closed) x = ((x % n) + n) % n;
  else x = Math.max(0, Math.min(n, x));
  const i = Math.floor(x);
  const t = x - i;
  const a = sp.pts[i];
  const b = sp.pts[Math.min(n, i + 1)];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
};

/** Targets for every strand in one scene, in canvas pixels: [x0, y0, x1, y1, …] per strand. */
function sceneTargets(scene: number, shape: Shape | undefined, W: number, H: number, count: number): Float32Array[] {
  const wide = W >= 720;
  const out: Float32Array[] = [];
  for (let s = 0; s < count; s++) {
    const r = seeded(1000 + s * 97);
    const arr = new Float32Array(POINTS * 2);
    if (scene === 0 || !shape || shape.paths.length === 0) {
      // The fountain: a column pours from the top, then splays out to both sides
      const u = s / (count - 1);
      const side = u < 0.5 ? -1 : 1;
      const spread = Math.abs(u - 0.5) * 2;
      const x0 = (wide ? W * 0.68 : W * 0.5) + (u - 0.5) * (wide ? W * 0.14 : W * 0.3);
      const P = [
        [x0, -40],
        [x0, H * (0.5 + spread * 0.12)],
        [x0 + side * W * (0.06 + spread * 0.08), H * (0.82 + spread * 0.05)],
        [side < 0 ? -80 : W + 80, H * (0.72 + spread * 0.42)],
      ];
      for (let k = 0; k < POINTS; k++) {
        const t = k / (POINTS - 1);
        const m = 1 - t;
        arr[k * 2] = m * m * m * P[0][0] + 3 * m * m * t * P[1][0] + 3 * m * t * t * P[2][0] + t * t * t * P[3][0];
        arr[k * 2 + 1] = m * m * m * P[0][1] + 3 * m * m * t * P[1][1] + 3 * m * t * t * P[2][1] + t * t * t * P[3][1];
      }
    } else {
      // Trace the mark: its box sits right of the copy (below it on phones), sized to its aspect
      const asp = shape.aspect;
      const bw = wide ? Math.min(W * 0.33, H * 0.5 * asp) : Math.min(W * 0.62, H * 0.08 * asp);
      const bh = bw / asp;
      // On phones the copy fills the view, so the mark sits in the open band above the kicker, clear of the
      // drawer's floating bar and the title line
      const cx = wide ? W * 0.785 : W * 0.5;
      const cy = wide ? H * 0.5 : Math.max(160, H * 0.19) + bh / 2;
      const paths = shape.paths;
      // Every outline gets one strand that runs all the way round it, so letters and marks close up legibly;
      // the rest double up along the longer outlines for glow
      let sp: Subpath;
      let span: number;
      let jitter: number;
      if (s < paths.length) {
        sp = paths[s];
        span = 1.02;
        jitter = 0;
      } else {
        const weight = (p: Subpath) => Math.pow(p.len, 0.2);
        const total = paths.reduce((a, b) => a + weight(b), 0);
        let pick = r() * total;
        sp = paths[0];
        for (const p of paths) {
          if ((pick -= weight(p)) <= 0) {
            sp = p;
            break;
          }
        }
        span = 0.55 + r() * 0.5;
        jitter = (r() - 0.5) * bh * 0.05;
      }
      const start = r();
      const map = (p: [number, number]): [number, number] => [cx + (p[0] - 0.5) * bw, cy + (p[1] - 0.5) * bh];
      // Offset along the outline's normal, so the doubled strands bundle into a glowing band
      const pt = (f: number): [number, number] => {
        const a = map(at(sp, f));
        const b = map(at(sp, f + 0.01));
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const d = Math.hypot(dx, dy) || 1;
        return [a[0] - (dy / d) * jitter, a[1] + (dx / d) * jitter];
      };
      const B = pt(start);
      // Tails rise from below the view (on wide screens from under the right half, clear of the copy)...
      const A: [number, number] = wide ? [W * (0.45 + r() * 0.55), H + 60] : [W * r(), -60];
      // ...and approach each point of the mark from below it, so the inside of the mark stays clear
      const C: [number, number] = wide
        ? [B[0] + (B[0] - cx) * 0.4 + (r() - 0.5) * bw * 0.2, Math.max(B[1], cy) + bh * (0.9 + r() * 0.8)]
        : [B[0] + (B[0] - cx) * 0.4, Math.min(B[1], cy) - bh * (0.9 + r() * 0.8)];
      for (let k = 0; k < TAIL; k++) {
        const t = k / TAIL;
        const m = 1 - t;
        arr[k * 2] = m * m * A[0] + 2 * m * t * C[0] + t * t * B[0];
        arr[k * 2 + 1] = m * m * A[1] + 2 * m * t * C[1] + t * t * B[1];
      }
      for (let k = TAIL; k < POINTS; k++) {
        const p = pt(start + ((k - TAIL) / (POINTS - 1 - TAIL)) * span);
        arr[k * 2] = p[0];
        arr[k * 2 + 1] = p[1];
      }
    }
    out.push(arr);
  }
  return out;
}

// ---- Shapes, traced once per visit and kept for every later open ----------------------------------------------------
const SHAPES: (Shape | undefined)[] = [];
const pending = new Map<number, Promise<Shape | undefined>>();
function loadShape(i: number): Promise<Shape | undefined> {
  if (SHAPES[i]) return Promise.resolve(SHAPES[i]);
  const existing = pending.get(i);
  if (existing) return existing;
  const mark = MARKS[projects[i].slug];
  const job = mark
    ? drawMark(mark)
        .then(traceOutlines)
        .then((s) => (SHAPES[i] = s))
        .catch(() => undefined)
    : Promise.resolve(undefined);
  pending.set(i, job);
  return job;
}

/** Where the pointer is over the stage, and how stirred up the strands are (rises with movement, decays). */
interface Stir {
  x: number;
  y: number;
  over: boolean;
  energy: number;
}

const SLOTS = 5; // colour buckets: strands are batched by colour, so a frame is a handful of strokes, not hundreds

/**
 * The strands: they ease toward the active scene's targets, drift, and never sit still. Light pulses race along every
 * outline; the whole field surges in brightness every few seconds; the pointer pushes strands aside and makes them
 * flare. Drawn in a few batched strokes per frame, at up to 1.5× pixel density, and only while on screen.
 */
function Strands({ scene, shapes, reduce, stir }: { scene: number; shapes: (Shape | undefined)[]; reduce: boolean; stir: React.MutableRefObject<Stir> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef(scene);
  sceneRef.current = scene;
  const shapesRef = useRef(shapes);
  shapesRef.current = shapes;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let W = 0;
    let H = 0;
    let count = 0;
    let pos: Float32Array[] = [];
    let targets: Float32Array[] = [];
    let builtFor = "";
    let raf = 0;
    let visible = true;
    let last = 0;
    const cols = Array.from({ length: SLOTS }, () => [255, 208, 161]);
    let flashAt = -10;
    let nextFlash = 2.5;
    // The glow is drawn on a canvas a third the size and stretched up: soft light looks the same, at a ninth of the
    // pixels. Only the crisp strands are drawn at full size.
    const GLOW = 1 / 3;
    const glow = document.createElement("canvas");
    const gctx = glow.getContext("2d")!;

    const build = () => {
      const key = `${sceneRef.current}:${W}x${H}:${shapesRef.current.filter(Boolean).length}`;
      if (key === builtFor) return;
      builtFor = key;
      targets = sceneTargets(sceneRef.current, shapesRef.current[sceneRef.current - 1], W, H, count);
      flashAt = last; // a new scene arrives with a flare
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      // Soft light needs few pixels: large screens draw at 0.8× and let the browser scale up; small ones up to 1.25×
      const dpr = W >= 1100 ? 0.8 : Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      glow.width = Math.max(1, Math.round(W * GLOW));
      glow.height = Math.max(1, Math.round(H * GLOW));
      gctx.setTransform(GLOW, 0, 0, GLOW, 0, 0);
      const next = W < 720 ? 44 : 64;
      if (next !== count) {
        count = next;
        pos = Array.from({ length: count }, () => {
          const a = new Float32Array(POINTS * 2);
          for (let k = 0; k < POINTS; k++) {
            a[k * 2] = W * (W < 720 ? 0.5 : 0.68);
            a[k * 2 + 1] = -40;
          }
          return a;
        });
      }
      builtFor = "";
      build();
      if (reduce) pos = targets.map((t) => Float32Array.from(t));
    };

    const trace = (path: Path2D, p: Float32Array, from: number, to: number) => {
      path.moveTo(p[from * 2], p[from * 2 + 1]);
      for (let i = from + 1; i < to - 1; i++) {
        path.quadraticCurveTo(p[i * 2], p[i * 2 + 1], (p[i * 2] + p[i * 2 + 2]) / 2, (p[i * 2 + 1] + p[i * 2 + 3]) / 2);
      }
      path.lineTo(p[(to - 1) * 2], p[(to - 1) * 2 + 1]);
    };

    let frame = 0;
    let lastDraw = 0;
    const draw = (time: number) => {
      // The strands drift slowly, so 30 frames a second look as smooth as 60 at half the work (the slides, zoom, and
      // buttons around them still run at the display's full rate)
      if (!reduce && visible && time - lastDraw < 31) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastDraw = time;
      frame++;
      build();
      const t = time / 1000;
      const dt = last ? Math.min(0.1, Math.max(0, t - last)) : 1 / 60;
      last = t;
      const pal = palette(sceneRef.current).map(hex);
      const st = stir.current;
      st.energy *= Math.exp(-dt * 1.6);

      // Breathing, intermittent surges, and the pointer's stir, together set the brightness
      if (!reduce && t > nextFlash) {
        flashAt = t;
        nextFlash = t + 3.5 + Math.random() * 3;
      }
      const flash = reduce ? 0 : Math.exp(-(t - flashAt) * 2.4);
      const surge = reduce ? 1 : 0.86 + 0.14 * Math.sin(t * 0.9) + flash * 0.6 + Math.min(0.8, st.energy) * 0.5;

      for (let j = 0; j < SLOTS; j++) {
        const want = pal[j % pal.length];
        for (let c = 0; c < 3; c++) cols[j][c] += (want[c] - cols[j][c]) * (reduce ? 1 : 1 - Math.exp(-dt * 2.5));
      }

      const crisp = sceneRef.current > 0 ? shapesRef.current[sceneRef.current - 1]?.paths.length ?? 0 : count;
      const core = Array.from({ length: SLOTS }, () => new Path2D());
      const soft = Array.from({ length: SLOTS }, () => new Path2D());
      const comets = new Path2D();
      const R = W < 720 ? 90 : 150;
      const R2 = R * R;

      for (let s = 0; s < count; s++) {
        const p = pos[s];
        const g = targets[s];
        const k = reduce ? 1 : 1 - Math.exp(-dt * (1.6 + 3.2 * (((s * 7) % 11) / 11)));
        const amp = reduce ? 0 : 2 + (s % 5) * (1 + st.energy);
        for (let i = 0; i < POINTS; i++) {
          let gx = g[i * 2];
          let gy = g[i * 2 + 1];
          if (!reduce) {
            const wob = Math.sin(t * 1.1 + i * 0.32 + s * 0.7) * amp;
            gx += wob * 0.6;
            gy += wob;
            // The pointer parts the strands as it passes
            if (st.over) {
              const dx = gx - st.x;
              const dy = gy - st.y;
              const d2 = dx * dx + dy * dy;
              if (d2 < R2) {
                const d = Math.sqrt(d2) || 1;
                const f = (1 - d / R) * (34 + st.energy * 30);
                gx += (dx / d) * f;
                gy += (dy / d) * f;
              }
            }
          }
          p[i * 2] += (gx - p[i * 2]) * k;
          p[i * 2 + 1] += (gy - p[i * 2 + 1]) * k;
        }
        trace(s < crisp ? core[s % SLOTS] : soft[s % SLOTS], p, 0, POINTS);
        // A pulse of light runs along each traced outline (and along the fountain's strands)
        if (!reduce && s < crisp) {
          const u = (t * (0.16 + (s % 4) * 0.03) + s * 0.137) % 1.4;
          if (u < 1) {
            const span = POINTS - TAIL;
            const head = TAIL + Math.floor(u * span);
            const from = Math.max(TAIL, head - 6);
            if (head - from >= 3) trace(comets, p, from, head);
          }
        }
      }

      // The glow, small and soft, refreshed every other frame (it changes slowly)
      const glowNow = reduce || frame % 2 === 1;
      if (glowNow) gctx.clearRect(0, 0, W, H);
      gctx.globalCompositeOperation = "lighter";
      gctx.lineCap = "round";
      gctx.lineJoin = "round";
      const rgbs = cols.map((c) => `${c[0] | 0},${c[1] | 0},${c[2] | 0}`);
      for (let j = 0; glowNow && j < SLOTS; j++) {
        gctx.lineWidth = 7;
        gctx.strokeStyle = `rgba(${rgbs[j]},${0.06 * surge})`;
        gctx.stroke(soft[j]);
        gctx.strokeStyle = `rgba(${rgbs[j]},${0.14 * surge})`;
        gctx.stroke(core[j]);
      }
      if (!reduce && glowNow) {
        gctx.lineWidth = 10;
        gctx.strokeStyle = `rgba(255,208,161,${0.22 * surge})`;
        gctx.stroke(comets);
      }

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(glow, 0, 0, W, H);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let j = 0; j < SLOTS; j++) {
        const rgb = rgbs[j];
        ctx.lineWidth = 1.1;
        ctx.strokeStyle = `rgba(${rgb},${Math.min(1, 0.13 * surge)})`;
        ctx.stroke(soft[j]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgba(${rgb},${Math.min(1, 0.8 * surge)})`;
        ctx.stroke(core[j]);
      }
      if (!reduce) {
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = `rgba(255,240,222,${Math.min(1, 0.85 * surge)})`;
        ctx.stroke(comets);
      }
      ctx.globalCompositeOperation = "source-over";
      if (!reduce && visible) raf = requestAnimationFrame(draw);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(0);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was && !reduce) raf = requestAnimationFrame(draw);
    });
    io.observe(canvas);
    const redraw = () => draw(performance.now());
    canvas.addEventListener("redraw", redraw);
    if (reduce) draw(0);
    else raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("redraw", redraw);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  // Under reduced motion, redraw once on each scene or shape change
  useEffect(() => {
    if (reduce) canvasRef.current?.dispatchEvent(new Event("redraw"));
  }, [scene, shapes, reduce]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

// ---- Slides -------------------------------------------------------------------------------------------------------

function Kicker({ n, label }: { n: number; label: string }) {
  return (
    <p className="font-mono text-xs tracking-[0.28em] text-cream/65">
      <span className="text-tertiary">{pad(n)}</span>
      <span className="ml-3">{label}</span>
    </p>
  );
}

const rise = (reduce: boolean, d: number) => ({
  initial: reduce ? false : { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: d, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
});

function IntroSlide({ lines, onNext }: { lines: string[]; onNext: () => void }) {
  const reduce = !!useReducedMotion();
  return (
    <div className="max-w-[min(46rem,58cqw)] @max-3xl:max-w-none">
      <motion.div {...rise(reduce, 0)}>
        <Kicker n={0} label={L.intro} />
      </motion.div>
      <p className="mt-5 font-sans text-[clamp(2.4rem,7cqw,5.6rem)] font-bold leading-[1.02] tracking-tight [text-shadow:0_4px_30px_rgba(21,6,0,0.6)]">
        {lines.map((line, i) => (
          <motion.span key={line} className="block whitespace-nowrap @max-md:whitespace-normal" {...rise(reduce, 0.12 + i * 0.14)}>
            {i === lines.length - 1 ? (
              <span className="inline-block bg-[linear-gradient(90deg,#f0937a,#ffd0a1_60%,#f2a65a)] bg-clip-text pb-[0.06em] text-transparent [text-shadow:none]">{line}</span>
            ) : (
              <span className="text-cream">{line}</span>
            )}
          </motion.span>
        ))}
      </p>
      <motion.button
        {...rise(reduce, 0.6)}
        type="button"
        onClick={onNext}
        className="group mt-10 inline-flex items-center gap-4 font-mono text-xs tracking-[0.3em] text-cream/75 hover:text-tertiary"
      >
        <span aria-hidden="true" className="relative block h-px w-16 overflow-hidden bg-cream/20">
          <span className="scroll-cue absolute inset-y-0 left-0 w-1/2 bg-primary-soft" />
        </span>
        {L.begin}
        <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
      </motion.button>
    </div>
  );
}

function ProjectSlide({ p, i, onOpen }: { p: Project; i: number; onOpen: (slug: string) => void }) {
  const reduce = !!useReducedMotion();
  const ready = hasCaseStudy(p.slug);
  const colour = (SIGNATURE[p.slug] ?? INTRO_PALETTE)[0];
  return (
    <div className="max-w-[min(44rem,52cqw)] @max-3xl:max-w-none">
      <motion.div {...rise(reduce, 0)}>
        <Kicker n={i + 1} label={L.project} />
      </motion.div>
      <motion.h3
        {...rise(reduce, 0.06)}
        id={`work-${p.slug}`}
        className="mt-2 font-sans text-[clamp(2.4rem,9cqw,7rem)] font-bold leading-[0.98] tracking-tight @3xl:mt-3"
        style={{ color: colour, textShadow: `0 0 42px ${colour}55, 0 4px 30px rgba(21,6,0,0.9)` }}
      >
        {p.name}
      </motion.h3>
      <motion.p {...rise(reduce, 0.1)} className="mt-2 font-serif text-base italic text-cream/90 @3xl:mt-3 @3xl:text-2xl">
        {p.type}
      </motion.p>
      <motion.div {...rise(reduce, 0.14)} className="mt-3 flex flex-wrap gap-2 @3xl:mt-5">
        {!ready && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/60 bg-amber/15 px-3.5 py-1.5 font-mono text-[11px] tracking-[0.2em] text-amber">
            <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
            {L.comingSoon}
          </span>
        )}
        {p.url && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-tertiary/40 bg-tertiary/10 px-3.5 py-1.5 font-mono text-[11px] tracking-[0.2em] text-tertiary">
            <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-tertiary shadow-[0_0_8px_#ffd0a1]" />
            {L.live}
          </span>
        )}
      </motion.div>
      <motion.div {...rise(reduce, 0.18)} className="mt-4 flex items-baseline justify-between gap-4 border-b border-cream/15 pb-2 @3xl:mt-6 @3xl:pb-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-cream @3xl:text-[13px]">{p.role}</span>
        {p.year && (
          <span className="shrink-0 font-mono text-xs tracking-[0.18em]" style={{ color: colour }}>
            {p.year.toUpperCase()}
          </span>
        )}
      </motion.div>
      <motion.p {...rise(reduce, 0.22)} className="mt-3 text-[15px] leading-relaxed text-cream/90 [text-shadow:0_1px_12px_rgba(21,6,0,0.95)] @3xl:mt-5 @3xl:text-xl">
        {p.summary}
      </motion.p>
      <motion.ul {...rise(reduce, 0.26)} className="mt-4 flex flex-wrap gap-1.5 @3xl:mt-6 @3xl:gap-2">
        {p.tags.map((t) => (
          <li key={t} className="rounded-full border border-cream/15 bg-base/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-cream/85 backdrop-blur-sm @3xl:px-3.5 @3xl:py-1.5 @3xl:text-[11px] @3xl:tracking-[0.14em]">
            {t}
          </li>
        ))}
      </motion.ul>
      <motion.div {...rise(reduce, 0.3)} className="mt-5 flex flex-wrap items-center gap-3 @3xl:mt-8 @3xl:gap-4">
        <button
          type="button"
          onClick={() => onOpen(p.slug)}
          data-magnetic="0.2"
          className="cta-glow fx-spotlight group inline-flex items-center gap-2 rounded-full bg-cream px-5 py-3 font-mono text-[11px] font-medium tracking-[0.16em] text-base transition-colors hover:bg-tertiary @3xl:gap-2.5 @3xl:px-7 @3xl:py-3.5 @3xl:text-[13px] @3xl:tracking-[0.2em]"
          style={{ "--glow": colour } as React.CSSProperties}
        >
          {L.viewProject}
          <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
        </button>
        {p.url && (
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-glow-soft inline-flex items-center gap-1.5 rounded-full border border-tertiary/50 px-4 py-3 font-mono text-[11px] tracking-[0.16em] text-tertiary transition-colors hover:bg-tertiary hover:text-base @3xl:px-6 @3xl:py-3.5 @3xl:text-[13px] @3xl:tracking-[0.2em]"
          >
            {L.visitLive}
            <ArrowUpRight size={15} aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </motion.div>
    </div>
  );
}

// ---- The showcase -------------------------------------------------------------------------------------------------

const DWELL = { intro: 5.5, project: 8 }; // seconds each slide holds (and slowly zooms) before the next slides in

export default function WorksShowcase({ title, onOpen, columns }: { title: string; onOpen: (slug: string) => void; columns: 1 | 2 }) {
  const reduce = !!useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [[index, dir], setSlide] = useState<[number, number]>([0, 1]);
  const [shapes, setShapes] = useState<(Shape | undefined)[]>(() => [...SHAPES]);
  const [vh, setVh] = useState(600);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const stir = useRef<Stir>({ x: 0, y: 0, over: false, energy: 0 });
  const total = projects.length + 1;

  // Trace each project's mark once per visit (kept for later opens), the active one first
  useEffect(() => {
    let live = true;
    // One mark at a time, yielding to the browser between them, so opening Projects never stalls on tracing
    const idle = (fn: () => void) =>
      typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(fn, { timeout: 300 }) : setTimeout(fn, 16);
    const next = (i: number) => {
      if (!live || i >= projects.length) return;
      loadShape(i).then((s) => {
        if (live && s) setShapes((prev) => (prev[i] === s ? prev : Object.assign([...prev], { [i]: s })));
        idle(() => next(i + 1));
      });
    };
    idle(() => next(0));
    return () => {
      live = false;
    };
  }, []);

  // The showcase is exactly one scroller-height tall
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setVh(el.clientHeight));
    ro.observe(el);
    setVh(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  // Autoplay stops while the showcase is scrolled away
  useEffect(() => {
    const el = heroRef.current;
    const root = scrollRef.current;
    if (!el || !root) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.intersectionRatio > 0.6), { root, threshold: [0, 0.6, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = (n: number) => setSlide(([i]) => [((n % total) + total) % total, n >= i ? 1 : -1]);
  const step = (d: number) => setSlide(([i]) => [(i + d + total) % total, d]);

  // Autoplay runs unless the visitor paused it, is reading (pointer over the copy, or focus inside), the showcase is
  // off screen, or motion is reduced
  const running = !reduce && !userPaused && !hovering && !focused && onScreen;
  const dwell = index === 0 ? DWELL.intro : DWELL.project;

  // The headline, one sentence per line
  const lines = useMemo(() => worksHeadline.split(/(?<=\.)\s+/), []);
  const current = index > 0 ? projects[index - 1] : null;

  // Pointer over the stage: strands part and flare; quick movement stirs them more
  const lastMove = useRef({ x: 0, y: 0, t: 0 });
  const onMove = (e: React.PointerEvent) => {
    const r = heroRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const now = performance.now();
    const lm = lastMove.current;
    const speed = lm.t ? Math.hypot(x - lm.x, y - lm.y) / Math.max(8, now - lm.t) : 0;
    lastMove.current = { x, y, t: now };
    const s = stir.current;
    s.x = x;
    s.y = y;
    s.over = true;
    s.energy = Math.min(1.6, s.energy + speed * 0.18);
  };

  // Swipe between slides
  const swipe = useRef<number | null>(null);

  return (
    <div
      ref={scrollRef}
      className="@container fx-scroll relative -mx-6 min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 sm:-mx-10 sm:px-10"
      style={{ "--vh": `${vh}px` } as React.CSSProperties}
    >
      <section
        ref={heroRef}
        aria-roledescription="carousel"
        aria-label={`${title}: ${L.carousel}`}
        className="relative -mx-6 h-[var(--vh)] overflow-hidden bg-base sm:-mx-10"
        onPointerMove={onMove}
        onPointerEnter={() => (stir.current.energy = Math.min(1.6, stir.current.energy + 0.6))}
        onPointerLeave={() => {
          stir.current.over = false;
          setHovering(false);
        }}
        onPointerDown={(e) => {
          if ((e.target as Element).closest("a, button")) return;
          swipe.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (swipe.current === null) return;
          const dx = e.clientX - swipe.current;
          swipe.current = null;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
        }}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          else if (e.key === "ArrowLeft") step(-1);
        }}
      >
        {/* The stage: star dust, the strands, and a slow zoom while each slide holds */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_12%_22%,rgba(241,230,206,0.5),transparent),radial-gradient(1px_1px_at_68%_14%,rgba(255,208,161,0.45),transparent),radial-gradient(1.5px_1.5px_at_84%_62%,rgba(241,230,206,0.4),transparent),radial-gradient(1px_1px_at_32%_78%,rgba(240,147,122,0.5),transparent),radial-gradient(1px_1px_at_52%_42%,rgba(241,230,206,0.35),transparent),radial-gradient(1px_1px_at_92%_88%,rgba(255,208,161,0.4),transparent),radial-gradient(60%_50%_at_70%_40%,rgba(152,58,40,0.22),transparent)] [background-size:340px_300px,420px_380px,380px_420px,300px_340px,460px_300px,400px_360px,100%_100%]" />
          <div
            key={`zoom-${index}`}
            className="slide-zoom absolute inset-0"
            style={{ animationDuration: `${dwell}s`, animationPlayState: running ? "running" : "paused" } as React.CSSProperties}
          >
            <Strands scene={index} shapes={shapes} reduce={reduce} stir={stir} />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,6,0,0.92),rgba(21,6,0,0.55)_40%,transparent_60%)] @max-3xl:bg-[linear-gradient(180deg,transparent_0%,rgba(21,6,0,0.6)_28%,rgba(21,6,0,0.85))]" />
        </div>

        {/* The slideshow fades into the grid below, so the two read as one page */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[35%] bg-[linear-gradient(180deg,transparent,rgba(21,6,0,0.75)_60%,#150600)]" />

        {/* Top line: the page title and the counter, just under the drawer's bar (which floats over the stage) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-[calc(var(--drawer-head,5rem)+0.5rem)] sm:px-10 @3xl:pl-[calc(2.5rem+6cqw)]">
          <h2 id="drawer-title" className="font-mono text-xs tracking-[0.3em] text-cream/70">
            {title.toUpperCase()}
          </h2>
          <p aria-hidden="true" className="font-mono text-xs tracking-[0.2em]">
            <span className="text-primary-soft">{pad(index)}</span>
            <span className="text-cream/50"> / {pad(projects.length)}</span>
            <span className="ml-3 hidden text-cream/70 sm:inline">{(current ? current.name : L.intro).toUpperCase()}</span>
          </p>
        </div>

        {/* The slides, one at a time, sliding sideways; each holds and slowly zooms in */}
        <div className="absolute inset-0 z-10" aria-live={running ? "off" : "polite"}>
          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${total}`}
              aria-labelledby={current ? `work-${current.slug}` : undefined}
              custom={dir}
              className="absolute inset-0 flex flex-col justify-center px-6 pb-20 pt-[calc(var(--drawer-head,5rem)+7rem)] sm:px-10 @3xl:pb-24 @3xl:pl-[calc(2.5rem+6cqw)] @3xl:pt-[calc(var(--drawer-head,5rem)+5rem)]"
              variants={{
                enter: (d: number) => (reduce ? { opacity: 0 } : { x: `${d * 100}%`, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => (reduce ? { opacity: 0 } : { x: `${d * -35}%`, opacity: 0, scale: 0.94 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduce ? 0.25 : 0.6, ease: [0.76, 0, 0.24, 1] }}
            >
              <div
                className="slide-zoom-soft origin-left"
                style={{ animationDuration: `${dwell}s`, animationPlayState: running ? "running" : "paused" } as React.CSSProperties}
                onPointerEnter={() => setHovering(true)}
                onPointerLeave={() => setHovering(false)}
              >
                {current ? <ProjectSlide p={current} i={index - 1} onOpen={onOpen} /> : <IntroSlide lines={lines} onNext={() => step(1)} />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls: dots and the hold's progress, previous / pause / next */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 px-6 pb-5 sm:px-10 @3xl:pl-[calc(2.5rem+6cqw)]">
          <div className="flex items-center gap-2.5">
            {Array.from({ length: total }, (_, n) => (
              <button
                key={n}
                type="button"
                onClick={() => go(n)}
                aria-label={n === 0 ? L.intro : projects[n - 1].name}
                aria-current={index === n ? "true" : undefined}
                className="group relative flex h-6 items-center"
              >
                <span
                  className={`block h-1.5 overflow-hidden rounded-full transition-all duration-500 ${
                    index === n ? "w-12 bg-cream/20" : "w-1.5 bg-cream/40 group-hover:bg-tertiary"
                  }`}
                >
                  {index === n && (
                    <span
                      key={`p-${index}`}
                      className="slide-progress block h-full rounded-full bg-primary-soft"
                      style={{ animationDuration: `${dwell}s`, animationPlayState: running ? "running" : "paused" } as React.CSSProperties}
                      onAnimationEnd={() => {
                        if (!reduce) step(1);
                      }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {[
              { label: L.previous, onClick: () => step(-1), Icon: ChevronLeft },
              { label: userPaused ? L.play : L.pause, onClick: () => setUserPaused((v) => !v), Icon: userPaused ? Play : Pause, pressed: userPaused },
              { label: L.next, onClick: () => step(1), Icon: ChevronRight },
            ].map(({ label, onClick, Icon, pressed }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                aria-label={label}
                aria-pressed={pressed}
                data-magnetic="0.25"
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 bg-base/40 text-cream backdrop-blur-sm transition-colors hover:border-tertiary hover:bg-tertiary hover:text-base ${
                  reduce && pressed !== undefined ? "hidden" : ""
                }`}
              >
                <Icon size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Everything, with covers */}
      <div className="relative -mx-6 bg-base bg-[radial-gradient(60%_160px_at_70%_0,rgba(152,58,40,0.16),transparent)] px-6 pb-10 pt-12 sm:-mx-10 sm:px-10 @3xl:px-[calc(2.5rem+6cqw)]">
        <div className="flex items-center justify-between border-b border-cream/10 pb-3 font-mono text-xs tracking-[0.25em]">
          <span className="flex items-center gap-2 text-primary-soft">
            <LayoutGrid size={14} aria-hidden="true" />
            {L.allWork}
          </span>
          <span className="text-cream/60">
            {pad(projects.length)} {L.projectsCount}
          </span>
        </div>
        <div className="mt-8">
          <WorksList onOpen={onOpen} columns={columns} />
        </div>
      </div>
    </div>
  );
}
