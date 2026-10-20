import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { hero } from "../content";
import WarpPortrait from "./WarpPortrait";

// A wheel gesture has to travel this far before it changes photo, then input is ignored briefly
// so one trackpad swipe (dozens of events) moves exactly one photo.
const WHEEL_THRESHOLD = 40;
const WHEEL_COOLDOWN_MS = 900;

/**
 * Cut-out photos that take turns sliding sideways. They advance on a timer (right → left), and the mouse
 * wheel drives them too: scroll down for the next photo, up for the previous one (left → right).
 */
export default function HeroImage() {
  const [failed, setFailed] = useState<string[]>([]);
  const images = useMemo(() => hero.images.filter((img) => !failed.includes(img.src)), [failed]);
  const [[index, direction], setSlide] = useState<[number, 1 | -1]>([0, 1]);
  const reduceMotion = useReducedMotion();

  const step = useCallback(
    (dir: 1 | -1) => setSlide(([i]) => [(i + dir + images.length) % images.length, dir]),
    [images.length],
  );

  // Warm the cache so the next photo doesn't pop in half-loaded
  useEffect(() => {
    hero.images.forEach(({ src }) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Auto-advance; restarts after every change, so a wheel-driven slide gets a full interval too
  useEffect(() => {
    if (images.length < 2) return;
    const id = window.setTimeout(() => step(1), hero.imageIntervalSec * 1000);
    return () => window.clearTimeout(id);
  }, [index, images.length, step]);

  // Mouse wheel → sideways slide. Ignored inside the drawer so its content still scrolls normally.
  const wheel = useRef({ total: 0, lockedUntil: 0 });
  useEffect(() => {
    if (images.length < 2) return;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as Element | null)?.closest?.('[role="dialog"]')) return;
      const now = performance.now();
      if (now < wheel.current.lockedUntil) return;
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      wheel.current.total += delta;
      if (Math.abs(wheel.current.total) < WHEEL_THRESHOLD) return;
      step(wheel.current.total > 0 ? 1 : -1);
      wheel.current = { total: 0, lockedUntil: now + WHEEL_COOLDOWN_MS };
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [images.length, step]);

  if (images.length === 0) return null;
  const { src, rig } = images[index % images.length];

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={src}
          custom={direction}
          className="absolute inset-0"
          variants={{
            enter: (dir: number) => (reduceMotion ? { opacity: 0 } : { x: `${60 * dir}%`, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (dir: number) => (reduceMotion ? { opacity: 0 } : { x: `${-60 * dir}%`, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: reduceMotion ? 0.6 : 1.2, ease: [0.65, 0, 0.35, 1] }}
        >
          {/* Sized so the head stays put while the photo grows past the bottom edge (cropped): the cut-out
              always runs off the bottom of the page. Below lg it starts under the text (--hero-text-bottom). */}
          <span
            className="pointer-events-auto absolute bottom-[calc((100%-var(--hero-text-bottom,19.5rem)-0.75rem)*-0.2)] left-1/2 block h-[calc((100%-var(--hero-text-bottom,19.5rem)-0.75rem)*1.2)] -translate-x-1/2 transition-transform duration-700 ease-out hover:scale-[1.04] lg:bottom-0 lg:h-[80%] xl:bottom-[-13.5%] xl:left-[56%] xl:h-[103.5%]"
            style={{ transformOrigin: "bottom center" }}
          >
            {/* Head, eyes and hand turn toward the cursor (WebGL warp), toned black-and-white in the shader */}
            <WarpPortrait src={src} rig={rig} alt={hero.imageAlt} onError={() => setFailed((f) => [...f, src])} />
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
