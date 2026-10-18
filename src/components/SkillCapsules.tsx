import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { RotateCcw } from "lucide-react";
import { skills } from "../content";

/**
 * Skill capsules that rain into a pit and pile up with real physics (matter-js): rounded "pill" bodies with
 * bounce, friction and rotation. Grab one to drag and fling it. "Drop again" re-runs the rain.
 *
 * The capsules are ordinary list items (so screen readers get a plain list of skills); physics only moves them
 * with transforms. The simulation starts when the pit scrolls into view, pauses when off-screen or the tab is
 * hidden, and is torn down on unmount. Reduced motion: a static wrapped list, no physics.
 */

// Brand fills, rotating per capsule. Text colour chosen for contrast on each fill.
const FILLS = [
  "bg-primary text-cream",
  "bg-primary-soft text-base",
  "bg-amber text-base",
  "bg-tertiary text-base",
  "bg-cream text-base",
];

const WALL = 200; // thick invisible walls so fast flings can't tunnel out

export default function SkillCapsules() {
  const pitRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const dropRef = useRef<() => void>(() => {});
  const [reduceMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    if (reduceMotion) return;
    const pit = pitRef.current;
    if (!pit) return;
    const { Engine, Bodies, Body, Composite, Constraint } = Matter;

    const engine = Engine.create({ gravity: { x: 0, y: 1.1 } });
    const world = engine.world;
    let walls: Matter.Body[] = [];
    let bodies: Matter.Body[] = [];
    const sizes: { w: number; h: number }[] = [];
    let raf = 0;
    let running = false;
    let started = false;
    const timers: number[] = [];

    const buildWalls = () => {
      Composite.remove(world, walls);
      const w = pit.clientWidth;
      const h = pit.clientHeight;
      walls = [
        Bodies.rectangle(w / 2, h + WALL / 2, w + WALL * 2, WALL, { isStatic: true }), // floor
        Bodies.rectangle(-WALL / 2, h / 2 - 400, WALL, h + 1200, { isStatic: true }), // left (tall, so drops stay in)
        Bodies.rectangle(w + WALL / 2, h / 2 - 400, WALL, h + 1200, { isStatic: true }), // right
      ];
      Composite.add(world, walls);
    };

    // Rain: each capsule enters from above at a random x and tilt, staggered
    const drop = () => {
      timers.splice(0).forEach((t) => window.clearTimeout(t));
      Composite.remove(world, bodies);
      bodies = [];
      const w = pit.clientWidth;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const bw = el.offsetWidth;
        const bh = el.offsetHeight;
        sizes[i] = { w: bw, h: bh };
        const x = bw / 2 + Math.random() * Math.max(1, w - bw);
        const body = Bodies.rectangle(x, -bh - 40, bw, bh, {
          chamfer: { radius: bh / 2 },
          angle: (Math.random() - 0.5) * 0.6,
          restitution: 0.42,
          friction: 0.25,
          frictionAir: 0.012,
          density: 0.0018,
        });
        bodies[i] = body;
        el.style.opacity = "0";
        timers.push(
          window.setTimeout(() => {
            Composite.add(world, body);
            el.style.opacity = "1";
          }, 140 * i),
        );
      });
    };
    dropRef.current = drop;

    const step = () => {
      raf = requestAnimationFrame(step);
      if (document.hidden) return;
      Engine.update(engine, 1000 / 60);
      bodies.forEach((b, i) => {
        const el = itemRefs.current[i];
        const s = sizes[i];
        if (!el || !s || !b) return;
        el.style.transform = `translate3d(${b.position.x - s.w / 2}px, ${b.position.y - s.h / 2}px, 0) rotate(${b.angle}rad)`;
      });
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Start (and rain) the first time the pit is on screen; pause whenever it isn't
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!started) {
            started = true;
            buildWalls();
            drop();
          }
          start();
        } else stop();
      },
      { threshold: 0.2 },
    );
    io.observe(pit);

    // Keep the walls on the pit's edges when it resizes (e.g. the full-screen toggle)
    const ro = new ResizeObserver(() => {
      if (!started) return;
      buildWalls();
      const w = pit.clientWidth;
      bodies.forEach((b, i) => {
        const s = sizes[i];
        if (b && s && b.position.x > w - s.w / 2) Body.setPosition(b, { x: w - s.w / 2, y: b.position.y });
      });
    });
    ro.observe(pit);

    // Drag & fling: a spring from the grabbed point to the pointer
    let drag: { constraint: Matter.Constraint; id: number } | null = null;
    const toLocal = (e: PointerEvent) => {
      const r = pit.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onDown = (e: PointerEvent) => {
      const li = (e.target as Element).closest<HTMLLIElement>("[data-capsule]");
      if (!li) return;
      const i = Number(li.dataset.capsule);
      const body = bodies[i];
      if (!body) return;
      e.preventDefault();
      try {
        li.setPointerCapture(e.pointerId); // keep receiving moves even if the pointer outruns the capsule
      } catch {
        /* pointer not capturable (e.g. synthetic events): moves still bubble from the pit */
      }
      const p = toLocal(e);
      const offset = Matter.Vector.rotate(Matter.Vector.sub(p, body.position), -body.angle);
      const constraint = Constraint.create({ pointA: p, bodyB: body, pointB: offset, stiffness: 0.12, damping: 0.08, length: 0 });
      Composite.add(world, constraint);
      drag = { constraint, id: e.pointerId };
      li.classList.add("is-grabbed");
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.constraint.pointA = toLocal(e);
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      Composite.remove(world, drag.constraint);
      drag = null;
      pit.querySelectorAll(".is-grabbed").forEach((n) => n.classList.remove("is-grabbed"));
    };
    pit.addEventListener("pointerdown", onDown);
    pit.addEventListener("pointermove", onMove);
    pit.addEventListener("pointerup", onUp);
    pit.addEventListener("pointercancel", onUp);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
      pit.removeEventListener("pointerdown", onDown);
      pit.removeEventListener("pointermove", onMove);
      pit.removeEventListener("pointerup", onUp);
      pit.removeEventListener("pointercancel", onUp);
      Composite.clear(world, false);
      Engine.clear(engine);
    };
  }, [reduceMotion]);

  const capsule = "inline-flex items-center whitespace-nowrap rounded-full px-4 py-2 font-mono text-xs font-medium tracking-[0.12em] shadow-[0_6px_18px_-6px_rgba(0,0,0,0.6)] sm:text-[13px]";

  return (
    <section aria-labelledby="skills-title" className="mt-14">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h3 id="skills-title" className="font-mono text-xs tracking-[0.25em] text-amber">
            WHAT I CAN HELP WITH
          </h3>
          {!reduceMotion && <p className="mt-1 text-sm text-cream/60">Grab a capsule and throw it around.</p>}
        </div>
        {!reduceMotion && (
          <button
            type="button"
            onClick={() => dropRef.current()}
            data-magnetic="0.3"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-cream/20 px-3.5 py-2 font-mono text-[11px] tracking-[0.15em] text-cream transition-colors hover:border-tertiary hover:bg-tertiary hover:text-base active:border-primary active:bg-primary active:text-cream"
          >
            <RotateCcw size={13} aria-hidden="true" />
            DROP AGAIN
          </button>
        )}
      </div>

      {reduceMotion ? (
        <ul aria-label="Skills" className="flex flex-wrap gap-2">
          {skills.map((s, i) => (
            <li key={s} className={`${capsule} ${FILLS[i % FILLS.length]}`}>
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <div
          ref={pitRef}
          className="relative h-[19rem] overflow-hidden rounded-2xl border border-cream/10 bg-[radial-gradient(120%_80%_at_50%_100%,rgba(152,58,40,0.35),transparent_70%)] sm:h-[22rem]"
        >
          <ul aria-label="Skills">
            {skills.map((s, i) => (
              <li
                key={s}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                data-capsule={i}
                className={`fx-capsule absolute left-0 top-0 cursor-grab touch-none select-none opacity-0 transition-opacity duration-300 ${capsule} ${FILLS[i % FILLS.length]}`}
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
