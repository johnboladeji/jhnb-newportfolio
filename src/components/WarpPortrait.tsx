import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { PortraitRig } from "../content";

/**
 * A cut-out portrait drawn through a WebGL deformation shader so the head, eyes and (optionally) a raised hand
 * turn toward the cursor. The photo is never sliced: each fragment looks up a *displaced* coordinate in the same
 * texture (inverse mapping), with smooth falloffs around each region, so there are no seams or ghost edges.
 *
 *   - Eyes lead, the head follows, the hand lags most (different spring rates) — reads as natural attention.
 *   - When the pointer is idle (or on touch screens) the eyes make small random saccades and the figure blinks.
 *   - The black-and-white + warm multiply tone is done in the shader, so it follows the warped silhouette exactly.
 *   - Hovering with a mouse opens a soft lens around the cursor that drops the warm tone to pure black & white.
 *   - Reduced motion: one static, un-warped frame. No WebGL: falls back to a plain <img> with the same look.
 */

// Brand tone multiplied over the grey image (whites → this colour, blacks stay black).
// Raw sRGB channels on purpose: THREE.Color would convert to linear and over-saturate the tint.
const TONE_HEX = "#e2a77f";
const TONE = [0xe2 / 255, 0xa7 / 255, 0x7f / 255] as const;

// Motion ranges (fractions are of the region's own size, so they scale with each photo)
const HEAD_TILT = 0.06; // radians (~3.4°) of roll toward the cursor side
const HEAD_SHIFT = [0.05, 0.035]; // x/y of the head radii — the "turn" toward the cursor
const IRIS_SHIFT = 0.32; // of the eye radius
const HAND_TILT = 0.09; // radians
const HAND_SHIFT = [0.035, 0.03];

// Spring rates (per second): eyes snap, head follows, hand lags
const RATE = { eyes: 16, head: 5, hand: 3.5 };
const IDLE_AFTER_MS = 2500;

const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uSize;
uniform vec4 uHead;      // centre xy, radii zw
uniform vec2 uNeck;
uniform float uHeadAngle;
uniform vec2 uHeadShift;
uniform vec2 uEye0;
uniform vec2 uEye1;
uniform float uEyeR;
uniform vec2 uIris;
uniform float uBlink;
uniform float uHandOn;
uniform vec4 uHand;      // centre xy, radii zw
uniform vec2 uWrist;
uniform float uHandAngle;
uniform vec2 uHandShift;
uniform vec3 uTone;
uniform vec2 uLens;      // hover lens centre (image px)
uniform float uLensR;    // lens radius (image px)
uniform float uLensAmt;  // 0 = off, 1 = full black & white inside the lens

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }

// Inverse-map one region: rotate about a pivot and shift, weighted by a soft ellipse
vec2 region(vec2 q, vec4 area, vec2 pivot, float angle, vec2 shift, float inner, float outer) {
  float w = 1.0 - smoothstep(inner, outer, length((q - area.xy) / area.zw));
  return pivot + rot(-angle * w) * (q - pivot) - shift * w;
}

vec2 eye(vec2 q, vec2 e) {
  vec2 d = (q - e) / vec2(uEyeR * 1.4, uEyeR * 0.85);
  float r = length(d);
  // iris/pupil glide inside the eye opening; the sclera stretches gently toward the lids
  q -= uIris * (1.0 - smoothstep(0.2, 1.0, r));
  // blink: sample the upper-lid skin across the eye opening
  float lid = (1.0 - smoothstep(0.55, 1.05, r)) * uBlink;
  q.y = mix(q.y, e.y - uEyeR * 0.95 + (q.y - e.y) * 0.15, lid);
  return q;
}

void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uSize;  // image pixels, y down
  vec2 q = p;
  if (uHandOn > 0.5) q = region(q, uHand, uWrist, uHandAngle, uHandShift, 0.7, 1.2);
  q = region(q, uHead, uNeck, uHeadAngle, uHeadShift, 0.8, 1.3);
  q = eye(q, uEye0);
  q = eye(q, uEye1);

  vec2 uv = vec2(q.x / uSize.x, 1.0 - q.y / uSize.y);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0); return; }
  vec4 t = texture2D(uTex, uv);
  float g = dot(t.rgb, vec3(0.299, 0.587, 0.114)) * 0.9;   // grayscale + brightness .9
  g = clamp((g - 0.5) * 1.25 + 0.5, 0.0, 1.0);              // contrast 1.25
  vec3 c = g * uTone;                                        // multiply tone
  // Hover lens: inside a soft circle around the cursor the warm tone drops away to pure black & white.
  // Measured in on-screen (un-warped) pixels so it sits exactly under the cursor while the figure moves.
  float lens = (1.0 - smoothstep(0.55, 1.0, length(p - uLens) / uLensR)) * uLensAmt;
  c = mix(c, vec3(g), lens);
  gl_FragColor = vec4(c * t.a, t.a);                         // premultiplied
}
`;

interface WarpPortraitProps {
  src: string;
  rig: PortraitRig | null;
  alt: string;
  onError: () => void;
  className?: string;
}

export default function WarpPortrait({ src, rig, alt, onError, className = "" }: WarpPortraitProps) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const [fallback, setFallback] = useState(false);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    const host = hostRef.current;
    if (!host || fallback) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, premultipliedAlpha: true });
    } catch {
      setFallback(true);
      return;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    const canvas = renderer.domElement;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", alt);
    canvas.className = "block h-full w-auto max-w-none select-none";
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const v2 = (x = 0, y = 0) => new THREE.Vector2(x, y);
    const v4 = (a = 0, b = 0, c = 1, d = 1) => new THREE.Vector4(a, b, c, d);
    const uniforms = {
      uTex: { value: null as THREE.Texture | null },
      uSize: { value: v2(1, 1) },
      uHead: { value: v4() },
      uNeck: { value: v2() },
      uHeadAngle: { value: 0 },
      uHeadShift: { value: v2() },
      uEye0: { value: v2(-999, -999) },
      uEye1: { value: v2(-999, -999) },
      uEyeR: { value: 1 },
      uIris: { value: v2() },
      uBlink: { value: 0 },
      uHandOn: { value: 0 },
      uHand: { value: v4() },
      uWrist: { value: v2() },
      uHandAngle: { value: 0 },
      uHandShift: { value: v2() },
      uTone: { value: new THREE.Vector3(...TONE) },
      uLens: { value: v2(-9999, -9999) },
      uLensR: { value: 200 },
      uLensAmt: { value: 0 },
    };
    if (rig) {
      uniforms.uHead.value.set(...rig.head);
      uniforms.uNeck.value.set(...rig.neck);
      if (rig.eyes[0]) uniforms.uEye0.value.set(...rig.eyes[0]);
      if (rig.eyes[1]) uniforms.uEye1.value.set(...rig.eyes[1]);
      uniforms.uEyeR.value = rig.eyeR;
      if (rig.hand) {
        uniforms.uHandOn.value = 1;
        uniforms.uHand.value.set(...rig.hand.centre, ...rig.hand.radii);
        uniforms.uWrist.value.set(...rig.hand.wrist);
      }
    }
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true });
    scene.add(new THREE.Mesh(geometry, material));

    let disposed = false;
    let raf = 0;
    let texture: THREE.Texture | null = null;

    // ---- Motion state ------------------------------------------------------------------------------------
    const target = { nx: 0, ny: 0 }; // where attention points, -1..1 relative to the head
    const cur = { eyeX: 0, eyeY: 0, headX: 0, headY: 0, handX: 0, handY: 0 };
    let lastMove = coarse ? -Infinity : 0;
    let nextSaccade = 0;
    let nextBlink = performance.now() + 2500 + Math.random() * 3000;
    let blinkStart = -1;
    const lens = { x: -9999, y: -9999, tx: -9999, ty: -9999, amt: 0, over: false };

    const onPointer = (e: PointerEvent) => {
      if (!rig || !texture) return;
      const r = canvas.getBoundingClientRect();
      if (r.width === 0) return;
      const sx = r.width / uniforms.uSize.value.x;
      const hx = r.left + rig.head[0] * sx;
      const hy = r.top + rig.head[1] * sx;
      target.nx = Math.max(-1, Math.min(1, (e.clientX - hx) / (window.innerWidth * 0.45)));
      target.ny = Math.max(-1, Math.min(1, (e.clientY - hy) / (window.innerHeight * 0.45)));
      lastMove = performance.now();
      // Hover lens: only for a mouse that is over the photo
      const over = e.pointerType === "mouse" && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      lens.over = over;
      if (over) {
        lens.tx = (e.clientX - r.left) / sx;
        lens.ty = (e.clientY - r.top) / sx;
        if (lens.amt < 0.01) {
          lens.x = lens.tx; // appear where the cursor is, rather than sliding in from the last spot
          lens.y = lens.ty;
        }
      }
    };
    const onLeave = () => {
      lens.over = false;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    const render = () => renderer.render(scene, camera);

    let prev = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      // Hidden tab, or a full-screen panel over the hero: nothing to draw
      if (document.hidden || document.documentElement.dataset.covered === "1") {
        prev = now;
        return;
      }
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;

      // Idle / touch: small random saccades around centre, held for 1–3s each
      if (now - lastMove > IDLE_AFTER_MS && now > nextSaccade) {
        target.nx = (Math.random() * 2 - 1) * 0.55;
        target.ny = (Math.random() * 2 - 1) * 0.3;
        nextSaccade = now + 1000 + Math.random() * 2000;
      }

      const ease = (rate: number) => 1 - Math.exp(-rate * dt);
      cur.eyeX += (target.nx - cur.eyeX) * ease(RATE.eyes);
      cur.eyeY += (target.ny - cur.eyeY) * ease(RATE.eyes);
      cur.headX += (target.nx - cur.headX) * ease(RATE.head);
      cur.headY += (target.ny - cur.headY) * ease(RATE.head);
      cur.handX += (target.nx - cur.handX) * ease(RATE.hand);
      cur.handY += (target.ny - cur.handY) * ease(RATE.hand);

      // Lens follows the cursor with a slight glide and fades in/out
      lens.x += (lens.tx - lens.x) * ease(18);
      lens.y += (lens.ty - lens.y) * ease(18);
      lens.amt += ((lens.over ? 1 : 0) - lens.amt) * ease(lens.over ? 9 : 5);
      uniforms.uLens.value.set(lens.x, lens.y);
      uniforms.uLensAmt.value = lens.amt;

      if (rig) {
        const breathe = Math.sin(now / 1600) * 0.004; // barely-there sway so the figure never looks frozen
        uniforms.uHeadAngle.value = cur.headX * HEAD_TILT + breathe;
        uniforms.uHeadShift.value.set(cur.headX * HEAD_SHIFT[0] * rig.head[2], cur.headY * HEAD_SHIFT[1] * rig.head[3]);
        uniforms.uIris.value.set(cur.eyeX * IRIS_SHIFT * rig.eyeR, cur.eyeY * IRIS_SHIFT * 0.6 * rig.eyeR);
        if (rig.hand) {
          uniforms.uHandAngle.value = -cur.handX * HAND_TILT;
          uniforms.uHandShift.value.set(cur.handX * HAND_SHIFT[0] * rig.hand.radii[0], cur.handY * HAND_SHIFT[1] * rig.hand.radii[1]);
        }
        // Blink: 140ms close-open, every 3–7s
        if (blinkStart < 0 && now > nextBlink) blinkStart = now;
        if (blinkStart >= 0) {
          const k = (now - blinkStart) / 140;
          uniforms.uBlink.value = k < 1 ? Math.sin(Math.PI * k) : 0;
          if (k >= 1) {
            blinkStart = -1;
            nextBlink = now + 3000 + Math.random() * 4000;
          }
        }
      }
      render();
    };

    new THREE.TextureLoader().load(
      src,
      (tex) => {
        if (disposed) {
          tex.dispose();
          return;
        }
        texture = tex;
        tex.colorSpace = THREE.NoColorSpace; // keep raw sRGB values; the shader writes them straight out
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        const img = tex.image as HTMLImageElement;
        uniforms.uTex.value = tex;
        uniforms.uSize.value.set(img.naturalWidth, img.naturalHeight);
        uniforms.uLensR.value = img.naturalWidth * 0.2;
        // Drawing buffer = image size: gives the canvas the photo's intrinsic aspect ratio for CSS (h-full w-auto)
        renderer.setPixelRatio(1);
        renderer.setSize(img.naturalWidth, img.naturalHeight, false);
        if (reduceMotion || !rig) render();
        else raf = requestAnimationFrame(tick);
      },
      undefined,
      () => {
        if (!disposed) onErrorRef.current();
      },
    );

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      texture?.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [src, rig, alt, fallback]);

  if (fallback) {
    return (
      <span className={`relative block h-full [isolation:isolate] ${className}`}>
        <img
          src={src}
          alt={alt}
          onError={onError}
          draggable={false}
          className="block h-full w-auto max-w-none select-none brightness-90 contrast-125 grayscale"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 mix-blend-multiply"
          style={{ backgroundColor: TONE_HEX, WebkitMaskImage: `url(${src})`, maskImage: `url(${src})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}
        />
      </span>
    );
  }
  return <span ref={hostRef} className={`block h-full ${className}`} />;
}
