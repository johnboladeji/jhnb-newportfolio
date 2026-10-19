import { useEffect, useRef, useState, type RefObject } from "react";
import {
  motion,
  useAnimationControls,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";

/**
 * The travelling pen (Writing pages). One fountain pen, drawn in code, lives in the reading pane's right margin and
 * is never still, after "one product that travels the whole page" landing pages:
 *
 *   - it flies in when a page opens, nib first, with a twirl;
 *   - at rest the writing hand keeps scribbling (a small looping wobble) and the barrel catches light;
 *   - as you scroll it travels down the margin, leaning into the direction of travel, and its nib writes a cursive,
 *     looping ink trail behind it (the trail is how far you've read);
 *   - at each quarter of the page it drops an ink splash and does a flourish spin.
 *
 * Purely decorative (aria-hidden, no pointer events); shown only when the pane has room (see ReadingShell); hidden
 * under reduced motion.
 */

// The handwriting: a drifting stroke with small cursive loops. x as a fraction of the gutter width; y as page progress.
const LOOPS = 22;
const hx = (t: number) => 0.5 + 0.24 * Math.sin(t * Math.PI * 3) * (1 - 0.3 * t) + 0.09 * Math.sin(t * Math.PI * 2 * LOOPS);
const hy = (t: number) => t + 0.011 * Math.cos(t * Math.PI * 2 * LOOPS);
// How the hand tilts as the stroke turns. Positive leans the barrel out toward the margin (a right hand), away from the text.
const tilt = (t: number) => 15 + 9 * Math.cos(t * Math.PI * 3) + 5 * Math.cos(t * Math.PI * 2 * LOOPS);

const STEPS = 900;
const PATH = Array.from({ length: STEPS + 1 }, (_, i) => {
  const t = i / STEPS;
  return `${i === 0 ? "M" : "L"}${(hx(t) * 100).toFixed(2)} ${(Math.min(1, Math.max(0, hy(t))) * 1000).toFixed(1)}`;
}).join(" ");

const PEN_W = 40;
const PEN_H = (186 * PEN_W) / 48; // keeps the drawing's proportions
const TIP = { x: (24 * PEN_W) / 48, y: (182 * PEN_W) / 48 }; // the nib tip, in drawn pixels

/** The pen, nib down, with a glint that sweeps the barrel. */
function Pen() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 48 186" width={PEN_W} height={PEN_H} aria-hidden="true">
      <defs>
        <linearGradient id="pen-barrel" x1="0" x2="1">
          <stop offset="0" stopColor="#5e2416" />
          <stop offset="0.35" stopColor="#983a28" />
          <stop offset="0.55" stopColor="#c0614a" />
          <stop offset="1" stopColor="#4e1d09" />
        </linearGradient>
        <linearGradient id="pen-metal" x1="0" x2="1">
          <stop offset="0" stopColor="#b77a3f" />
          <stop offset="0.5" stopColor="#ffd0a1" />
          <stop offset="1" stopColor="#a8642d" />
        </linearGradient>
        <linearGradient id="pen-glint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="pen-body">
          <path d="M12 2 H36 V112 H12 Z" />
        </clipPath>
      </defs>
      <rect x="12" y="2" width="24" height="16" rx="8" fill="url(#pen-barrel)" />
      <path d="M12 12 H36 L35 112 H13 Z" fill="url(#pen-barrel)" />
      <rect x="31" y="10" width="4" height="54" rx="2" fill="url(#pen-metal)" />
      <rect x="12" y="108" width="24" height="7" fill="url(#pen-metal)" />
      <path d="M14 115 H34 L30 140 H18 Z" fill="#2a0d03" />
      <path d="M18 140 H30 L26 168 L24 182 L22 168 Z" fill="url(#pen-metal)" />
      <line x1="24" y1="150" x2="24" y2="178" stroke="#4e1d09" strokeWidth="0.9" />
      <circle cx="24" cy="150" r="1.6" fill="#4e1d09" />
      <rect x="17" y="16" width="2.2" height="90" rx="1.1" fill="#f1e6ce" opacity="0.28" />
      {/* A glint of light sweeping down the barrel */}
      <g clipPath="url(#pen-body)">
        <rect x="8" y="-40" width="32" height="40" fill="url(#pen-glint)" transform="skewY(-25)">
          {!reduce && <animate attributeName="y" values="-60;150;150" keyTimes="0;0.5;1" dur="3.2s" repeatCount="indefinite" />}
        </rect>
      </g>
      {/* A bead of ink at the nib, pulsing */}
      <circle cx="24" cy="183" r="1.8" fill="#f0937a">
        {!reduce && <animate attributeName="r" values="1.2;2.4;1.2" dur="1.4s" repeatCount="indefinite" />}
      </circle>
    </svg>
  );
}

export default function TravellingPen({ progress, paneRef }: { progress: MotionValue<number>; paneRef: RefObject<HTMLElement | null> }) {
  const reduce = useReducedMotion();
  const smooth = useSpring(progress, { stiffness: 90, damping: 20, restDelta: 0.0005 });
  const velocity = useVelocity(smooth);

  // Gutter size, so the pen and the ink trail share one coordinate system
  const W = 80;
  const [h, setH] = useState(600);
  useEffect(() => {
    const el = paneRef.current;
    if (!el) return;
    const update = () => setH(el.clientHeight);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, [paneRef]);

  // The trail runs from TOP px (room above the nib for the pen) to BOTTOM px above the pane's foot
  const TOP = PEN_H + 14;
  const BOTTOM = 24;
  const span = Math.max(1, h - TOP - BOTTOM);
  const px = (t: number) => hx(t) * W;
  const py = (t: number) => TOP + Math.min(1, Math.max(0, hy(t))) * span;

  const x = useTransform(smooth, px);
  const y = useTransform(smooth, py);
  // Lean into the motion: scrolling down tips the pen forward, scrolling up tips it back
  const lean = useSpring(useTransform(velocity, [-1.5, 0, 1.5], [-12, 0, 12]), { stiffness: 140, damping: 18 });
  const baseTilt = useTransform(smooth, tilt);
  const rotate = useTransform([baseTilt, lean] as MotionValue<number>[], ([a, b]: number[]) => a + b);

  // Ink drawn so far, along the trail
  const drawn = useMotionValue(0.0001);
  useMotionValueEvent(smooth, "change", (t) => drawn.set(Math.max(0.0001, Math.min(1, t))));

  // Quarter marks: an ink splash and a flourish spin
  const flourish = useAnimationControls();
  const [splashes, setSplashes] = useState<number[]>([]);
  const lastQuarter = useRef(0);
  useMotionValueEvent(smooth, "change", (t) => {
    const q = Math.min(4, Math.floor(t * 4 + 0.02));
    if (q > lastQuarter.current) {
      lastQuarter.current = q;
      setSplashes(Array.from({ length: q }, (_, i) => (i + 1) / 4));
      flourish.start({ rotate: [0, 25, -360], scale: [1, 1.15, 1], transition: { duration: 0.9, ease: [0.2, 0.8, 0.2, 1] } });
    } else if (q < lastQuarter.current) {
      lastQuarter.current = q;
      setSplashes(Array.from({ length: q }, (_, i) => (i + 1) / 4));
    }
  });

  if (reduce) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20">
      {/* The handwriting trail */}
      <svg className="absolute left-0 w-full overflow-visible" style={{ top: TOP, height: span }} viewBox="0 0 100 1000" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pen-ink" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffd0a1" />
            <stop offset="0.4" stopColor="#f0937a" />
            <stop offset="1" stopColor="#983a28" />
          </linearGradient>
        </defs>
        <path d={PATH} fill="none" stroke="rgba(241,230,206,0.06)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        <motion.path
          d={PATH}
          fill="none"
          stroke="url(#pen-ink)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: drawn }}
        />
      </svg>

      {/* Ink splashes at each quarter */}
      {splashes.map((t) => (
        <span key={t} className="absolute" style={{ left: px(t), top: py(t) }}>
          <motion.span
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute -left-2 -top-2 h-4 w-4 rounded-full border border-primary-soft"
          />
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 12 }}
            className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-primary-soft shadow-[0_0_10px_rgba(240,147,122,0.8)]"
          />
        </span>
      ))}

      {/* The pen, in layers that all pivot on the nib: position → fly-in → lean/tilt → flourish → idle scribble */}
      <motion.div className="absolute left-0 top-0" style={{ x, y }}>
        <motion.div
          className="absolute"
          style={{ left: -TIP.x, top: -TIP.y, width: PEN_W, height: PEN_H, transformOrigin: `${TIP.x}px ${TIP.y}px` }}
          // Flies in from the top-right with a twirl when the page opens
          initial={{ opacity: 0, x: 70, y: -90, rotate: 160 }}
          animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 13, delay: 0.25 }}
        >
          <motion.div style={{ rotate, transformOrigin: `${TIP.x}px ${TIP.y}px` }}>
            <motion.div animate={flourish} style={{ transformOrigin: `${TIP.x}px ${TIP.y}px` }}>
              <div className="pen-scribble" style={{ transformOrigin: `${TIP.x}px ${TIP.y}px`, filter: "drop-shadow(0 12px 14px rgba(0,0,0,0.55))" }}>
                <Pen />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
