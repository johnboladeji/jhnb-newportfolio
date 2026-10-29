import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, LayoutGrid } from "lucide-react";
import { projects, worksHeadline, worksShowcase as L, type Project } from "../content";
import { hasCaseStudy, WorksList } from "./Works";

/**
 * The Projects page's hero, after williamrajwan.com's structure (the content is all John's, from `projects`):
 *
 *   - Section 00 is the intro: a numbered mono kicker with the page title, the headline in two lines (the last sentence
 *     in the accent gradient), and a scroll cue. Behind it, a fountain of luminous strands pours down and splays out.
 *   - Sections 01–06 give each project the whole view: numbered kicker, the name in the project's own signature colour,
 *     status badges, role and years on one ruled row, the summary, tag pills, and View project.
 *   - As each project scrolls in, the strands rise from below and trace that project's real logo (Caira, TokenForge) or its
 *     brand name in its own typeface, in its own colours, like the reference's company logos drawn in light. The marks
 *     are drawn on a hidden canvas and traced into outlines (marching squares); every outline gets its own strand.
 *   - A dot rail on the right (click to jump), a "01 / 06 · CAIRA" counter, and a short loading count on first open.
 *   - Below the showcase, the full "All work" grid with covers.
 *
 * The strands are a 2D canvas (additive blending, two passes per strand for the glow); the drawing loop only runs while
 * the showcase is on screen. Reduced motion: no drift, shapes jump into place, no loading count.
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
const POINTS = 56;
const TAIL = 12; // points spent flowing in from below before tracing the mark

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
      const bw = wide ? Math.min(W * 0.33, H * 0.5 * asp) : Math.min(W * 0.8, H * 0.12 * asp);
      const bh = bw / asp;
      // On phones the copy fills the view, so the mark sits in the open band above the kicker
      const cx = wide ? W * 0.785 : W * 0.5;
      const cy = wide ? H * 0.5 : 18 + bh / 2;
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

/** The strands themselves: they ease toward the active scene's targets, drift gently, and glow. */
function Strands({ scene, shapes, reduce }: { scene: number; shapes: (Shape | undefined)[]; reduce: boolean }) {
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
    let cols: number[][] = [];
    let targets: Float32Array[] = [];
    let builtFor = "";
    let raf = 0;
    let visible = true;
    let last = 0;

    const build = () => {
      const key = `${sceneRef.current}:${W}x${H}:${shapesRef.current.filter(Boolean).length}`;
      if (key === builtFor) return;
      builtFor = key;
      targets = sceneTargets(sceneRef.current, shapesRef.current[sceneRef.current - 1], W, H, count);
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const next = W < 720 ? 64 : 110;
      if (next !== count) {
        count = next;
        // Start collapsed at the top centre, so the first scene pours in
        pos = Array.from({ length: count }, () => {
          const a = new Float32Array(POINTS * 2);
          for (let k = 0; k < POINTS; k++) {
            a[k * 2] = W * (W < 720 ? 0.5 : 0.68);
            a[k * 2 + 1] = -40;
          }
          return a;
        });
        cols = Array.from({ length: count }, () => [255, 208, 161]);
      }
      builtFor = "";
      build();
      if (reduce) pos = targets.map((t) => Float32Array.from(t));
    };

    const draw = (time: number) => {
      build();
      const pal = palette(sceneRef.current).map(hex);
      ctx.clearRect(0, 0, W, H);
      // The strands that trace each outline once are drawn crisp and bright; the rest are a soft glow around them
      const crisp = sceneRef.current > 0 ? shapesRef.current[sceneRef.current - 1]?.paths.length ?? 0 : count;
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const t = time / 1000;
      // Time-based easing, so the marks assemble in about a second whatever the frame rate
      const dt = last ? Math.min(0.1, Math.max(0, t - last)) : 1 / 60;
      last = t;
      for (let s = 0; s < count; s++) {
        const p = pos[s];
        const g = targets[s];
        // Each strand travels at its own pace, so a scene change reads as a flow, not a jump
        const k = reduce ? 1 : 1 - Math.exp(-dt * (1.6 + 3.2 * (((s * 7) % 11) / 11)));
        const amp = reduce ? 0 : 2.2 + (s % 5);
        for (let i = 0; i < POINTS; i++) {
          const wob = Math.sin(t * 1.1 + i * 0.32 + s * 0.7) * amp;
          p[i * 2] += (g[i * 2] + wob * 0.6 - p[i * 2]) * k;
          p[i * 2 + 1] += (g[i * 2 + 1] + wob - p[i * 2 + 1]) * k;
        }
        const c = cols[s];
        const want = pal[s % pal.length];
        for (let j = 0; j < 3; j++) c[j] += (want[j] - c[j]) * (reduce ? 1 : 1 - Math.exp(-dt * 2.5));
        ctx.beginPath();
        ctx.moveTo(p[0], p[1]);
        for (let i = 1; i < POINTS - 1; i++) {
          const mx = (p[i * 2] + p[i * 2 + 2]) / 2;
          const my = (p[i * 2 + 1] + p[i * 2 + 3]) / 2;
          ctx.quadraticCurveTo(p[i * 2], p[i * 2 + 1], mx, my);
        }
        ctx.lineTo(p[(POINTS - 1) * 2], p[(POINTS - 1) * 2 + 1]);
        const rgb = `${c[0] | 0},${c[1] | 0},${c[2] | 0}`;
        ctx.strokeStyle = `rgba(${rgb},${s < crisp ? 0.08 : 0.04})`;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.strokeStyle = `rgba(${rgb},${s < crisp ? 0.85 : 0.13})`;
        ctx.lineWidth = s % 6 === 0 ? 1.8 : 1.1;
        ctx.stroke();
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
    const redraw = () => draw(0);
    canvas.addEventListener("redraw", redraw);
    if (reduce) draw(0);
    else raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("redraw", redraw);
    };
  }, [reduce]);

  // Under reduced motion, redraw once on each scene change
  useEffect(() => {
    if (reduce) canvasRef.current?.dispatchEvent(new Event("redraw"));
  }, [scene, reduce]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

// ---- Sections -----------------------------------------------------------------------------------------------------

function Kicker({ n, label }: { n: number; label: string }) {
  return (
    <p className="font-mono text-[11px] tracking-[0.25em] text-cream/60">
      <span className="text-tertiary">{pad(n)}</span>
      <span className="ml-3">{label}</span>
    </p>
  );
}

function ProjectSection({ p, i, onOpen, active }: { p: Project; i: number; onOpen: (slug: string) => void; active: boolean }) {
  const reduce = useReducedMotion();
  const ready = hasCaseStudy(p.slug);
  const colour = (SIGNATURE[p.slug] ?? INTRO_PALETTE)[0];
  const rise = (d: number) => ({
    initial: reduce ? false : { opacity: 0, y: 26 },
    animate: active || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 },
    transition: { delay: active ? d : 0, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  });
  return (
    <section
      aria-labelledby={`work-${p.slug}`}
      data-scene={i + 1}
      className="relative flex min-h-[var(--vh)] snap-start flex-col justify-center pb-14 pr-8 pt-32 sm:pr-14 @3xl:pt-14"
    >
      <div className="relative max-w-[34rem] @3xl:ml-[6cqw] @3xl:max-w-[36rem] @6xl:ml-[8cqw]">
        <motion.div {...rise(0)}>
          <Kicker n={i + 1} label={L.project} />
        </motion.div>
        <motion.h3
          {...rise(0.06)}
          id={`work-${p.slug}`}
          className="mt-3 font-sans text-[clamp(2.6rem,8cqw,4.75rem)] font-bold leading-[1.02] tracking-tight [text-shadow:0_4px_30px_rgba(21,6,0,0.9)]"
          style={{ color: colour }}
        >
          {p.name}
        </motion.h3>
        <motion.p {...rise(0.1)} className="mt-2 font-serif text-lg italic text-cream/85 sm:text-xl">
          {p.type}
        </motion.p>
        <motion.div {...rise(0.14)} className="mt-4 flex flex-wrap gap-2">
          {!ready && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/60 bg-amber/15 px-3 py-1 font-mono text-[10px] tracking-[0.2em] text-amber">
              <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
              {L.comingSoon}
            </span>
          )}
          {p.url && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-tertiary/40 bg-tertiary/10 px-3 py-1 font-mono text-[10px] tracking-[0.2em] text-tertiary">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-tertiary shadow-[0_0_8px_#ffd0a1]" />
              {L.live}
            </span>
          )}
        </motion.div>
        <motion.div {...rise(0.18)} className="mt-5 flex items-baseline justify-between gap-4 border-b border-cream/15 pb-3">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-cream">{p.role}</span>
          {p.year && <span className="shrink-0 font-mono text-[11px] tracking-[0.18em]" style={{ color: colour }}>{p.year.toUpperCase()}</span>}
        </motion.div>
        <motion.p {...rise(0.22)} className="mt-4 text-[15px] leading-relaxed text-cream/85 [text-shadow:0_1px_12px_rgba(21,6,0,0.95)] sm:text-[16px]">
          {p.summary}
        </motion.p>
        <motion.ul {...rise(0.26)} className="mt-5 flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <li key={t} className="rounded-full border border-cream/15 bg-base/50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-cream/80 backdrop-blur-sm">
              {t}
            </li>
          ))}
        </motion.ul>
        <motion.div {...rise(0.3)} className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onOpen(p.slug)}
            data-magnetic="0.2"
            className="fx-spotlight group inline-flex items-center gap-2 rounded-full border border-cream/30 bg-base/40 px-5 py-2.5 font-mono text-[11px] tracking-[0.18em] text-cream backdrop-blur-sm transition-colors hover:border-tertiary hover:bg-tertiary hover:text-base"
          >
            {L.viewProject}
            <ArrowRight size={13} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
          </button>
          {p.url && (
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[11px] tracking-[0.18em] text-tertiary underline decoration-tertiary/30 underline-offset-4 hover:decoration-tertiary"
            >
              {L.visitLive}
              <ArrowUpRight size={13} aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default function WorksShowcase({ title, onOpen, columns }: { title: string; onOpen: (slug: string) => void; columns: 1 | 2 }) {
  const reduce = !!useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState(0);
  const [shapes, setShapes] = useState<(Shape | undefined)[]>([]);
  const [vh, setVh] = useState(600);

  // Trace each project's logo or name once, as soon as its image or font is ready
  useEffect(() => {
    let live = true;
    projects.forEach((p, i) => {
      const mark = MARKS[p.slug];
      if (!mark) return;
      drawMark(mark)
        .then((c) => traceOutlines(c))
        .then((shape) => {
          if (!live) return;
          setShapes((prev) => {
            const next = [...prev];
            next[i] = shape;
            return next;
          });
        })
        .catch(() => undefined);
    });
    return () => {
      live = false;
    };
  }, []);

  // Each showcase section is exactly one scroller-height tall
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setVh(el.clientHeight));
    ro.observe(el);
    setVh(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  // The section nearest the middle of the view is the active scene
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setScene(Number((e.target as HTMLElement).dataset.scene));
        });
      },
      { root, rootMargin: "-45% 0px -45% 0px" },
    );
    root.querySelectorAll("[data-scene]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // A short loading count, the first time the page opens in a visit
  const [loading, setLoading] = useState(() => {
    if (reduce) return -1;
    try {
      return sessionStorage.getItem("jhnb-works-loaded") ? -1 : 0;
    } catch {
      return -1;
    }
  });
  useEffect(() => {
    if (loading < 0) return;
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const n = Math.min(100, Math.round(((performance.now() - start) / 900) * 100));
      setLoading(n);
      if (n < 100) raf = requestAnimationFrame(tick);
      else
        window.setTimeout(() => {
          setLoading(-1);
          try {
            sessionStorage.setItem("jhnb-works-loaded", "1");
          } catch {
            /* ignore */
          }
        }, 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (n: number) => {
    const root = scrollRef.current;
    const el = root?.querySelector<HTMLElement>(`[data-scene="${n}"]`);
    if (root && el) root.scrollTo({ top: el.offsetTop, behavior: reduce ? "auto" : "smooth" });
  };

  // The headline's last sentence takes the accent gradient, like the reference's second line
  // The headline, one sentence per line; the last line takes the accent gradient, like the reference's second line
  const lines = useMemo(() => worksHeadline.split(/(?<=\.)\s+/), []);

  const current = scene > 0 ? projects[scene - 1] : null;

  return (
    <div
      ref={scrollRef}
      className="@container fx-scroll relative -mx-6 min-h-0 flex-1 snap-y snap-proximity overflow-y-auto overscroll-contain px-6 sm:-mx-10 sm:px-10"
      style={{ "--vh": `${vh}px` } as React.CSSProperties}
    >

      <div className="relative">
        {/* The stage stays put while the sections scroll over it: deep base colour, star dust, and the strands */}
        <div
          aria-hidden="true"
          className="pointer-events-none sticky top-0 -mx-6 h-[var(--vh)] overflow-hidden bg-base sm:-mx-10"
          style={{ marginBottom: "calc(-1 * var(--vh))" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_12%_22%,rgba(241,230,206,0.5),transparent),radial-gradient(1px_1px_at_68%_14%,rgba(255,208,161,0.45),transparent),radial-gradient(1.5px_1.5px_at_84%_62%,rgba(241,230,206,0.4),transparent),radial-gradient(1px_1px_at_32%_78%,rgba(240,147,122,0.5),transparent),radial-gradient(1px_1px_at_52%_42%,rgba(241,230,206,0.35),transparent),radial-gradient(1px_1px_at_92%_88%,rgba(255,208,161,0.4),transparent),radial-gradient(60%_50%_at_70%_40%,rgba(152,58,40,0.22),transparent)] [background-size:340px_300px,420px_380px,380px_420px,300px_340px,460px_300px,400px_360px,100%_100%]" />
          <div className="absolute inset-0">
            <Strands scene={scene} shapes={shapes} reduce={reduce} />
          </div>
          {/* Keep the copy legible over the light */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,6,0,0.94),rgba(21,6,0,0.6)_42%,transparent_62%)] @max-3xl:bg-[linear-gradient(180deg,rgba(21,6,0,0.82),rgba(21,6,0,0.35)_55%,transparent)]" />
        </div>

        {/* Above the sections: the dot rail, the counter, and the loading count */}
        <div className="pointer-events-none sticky top-0 z-20 -mx-6 h-[var(--vh)] sm:-mx-10" style={{ marginBottom: "calc(-1 * var(--vh))" }}>
          {/* Dot rail */}
          <nav aria-label={L.railLabel} className="pointer-events-auto absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-3 sm:right-5">
            {[0, ...projects.map((_, i) => i + 1)].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => goTo(n)}
                aria-label={n === 0 ? title : projects[n - 1].name}
                aria-current={scene === n ? "true" : undefined}
                className="group flex h-4 w-4 items-center justify-center"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    scene === n ? "h-2.5 w-2.5 bg-primary-soft shadow-[0_0_10px_#f0937a]" : "h-2 w-2 border border-cream/50 group-hover:border-tertiary"
                  }`}
                />
              </button>
            ))}
          </nav>

          {/* Counter */}
          <div aria-hidden="true" className="absolute bottom-5 right-5 hidden text-right font-mono text-[11px] tracking-[0.2em] sm:right-8 @3xl:block">
            <span className="text-primary-soft">{pad(scene)}</span>
            <span className="text-cream/50"> / {pad(projects.length)}</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={scene}
                className="mt-1 block text-[10px] text-cream/60"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                {(current ? current.name : L.intro).toUpperCase()}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Loading count */}
          <AnimatePresence>
            {loading >= 0 && (
              <motion.div
                className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center bg-base"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
              >
                <span className="h-px w-32 bg-cream/15">
                  <span className="block h-full bg-primary-soft" style={{ width: `${Math.max(0, loading)}%` }} />
                </span>
                <span className="mt-4 font-mono text-[11px] tracking-[0.3em] text-cream/70">
                  {L.loading} <span className="text-primary-soft">{String(Math.max(0, loading)).padStart(3, "0")}</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 00 — Intro */}
        <section aria-labelledby="drawer-title" data-scene={0} className="relative flex min-h-[var(--vh)] snap-start flex-col justify-center py-14 pr-8 sm:pr-14">
          <div className="@3xl:ml-[6cqw] @6xl:ml-[8cqw]">
            <p className="font-mono text-[11px] tracking-[0.25em] text-cream/60">
              <span className="text-tertiary">00</span>
              <span id="drawer-title" role="heading" aria-level={2} className="ml-3">
                {title.toUpperCase()}
              </span>
            </p>
            <p className="mt-5 font-sans text-[clamp(2.1rem,6.2cqw,4.6rem)] font-bold leading-[1.04] tracking-tight [text-shadow:0_4px_30px_rgba(21,6,0,0.6)]">
              {lines.map((line, i) => (
                <motion.span
                  key={line}
                  className="block whitespace-nowrap @max-md:whitespace-normal"
                  initial={reduce ? false : { opacity: 0, y: "0.45em" }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.14, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  {i === lines.length - 1 ? (
                    <span className="inline-block bg-[linear-gradient(90deg,#f0937a,#ffd0a1_60%,#f2a65a)] bg-clip-text pb-[0.06em] text-transparent [text-shadow:none]">{line}</span>
                  ) : (
                    <span className="text-cream">{line}</span>
                  )}
                </motion.span>
              ))}
            </p>
            <button
              type="button"
              onClick={() => goTo(1)}
              className="group mt-10 inline-flex items-center gap-4 font-mono text-[11px] tracking-[0.3em] text-cream/70 hover:text-tertiary"
            >
              <span aria-hidden="true" className="relative block h-px w-14 overflow-hidden bg-cream/20">
                <span className="scroll-cue absolute inset-y-0 left-0 w-1/2 bg-primary-soft" />
              </span>
              {L.scroll}
            </button>
          </div>
        </section>

        {/* 01–06 — one project per view */}
        {projects.map((p, i) => (
          <ProjectSection key={p.slug} p={p} i={i} onOpen={onOpen} active={scene === i + 1} />
        ))}
      </div>

      {/* Everything, with covers */}
      <div className="relative z-30 -mx-6 bg-base px-6 pb-10 pt-12 sm:-mx-10 sm:px-10">
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
