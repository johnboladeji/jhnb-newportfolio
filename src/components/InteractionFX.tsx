import { useEffect, useRef } from "react";

/**
 * Site-wide pointer effects, attached once with event delegation (no per-component listeners):
 *
 *   - Cursor follower: a peach dot plus a trailing ring that swells and tints over anything interactive.
 *     The system cursor stays visible; the follower is decoration only.
 *   - Magnetic elements: anything with `data-magnetic` (value = strength, default 0.3) leans toward the pointer
 *     and springs back on leave. Uses the CSS `translate` property, so it composes with Tailwind transforms.
 *   - Spotlight: elements with `.fx-spotlight` get --mx/--my so a soft light follows the pointer inside them.
 *   - Click burst: a ring expands from the click point on links and buttons.
 *
 * Fine pointers only (mouse/trackpad); everything is skipped under prefers-reduced-motion.
 */
const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label, [data-magnetic]';

export default function InteractionFX() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let magnet: HTMLElement | null = null;
    let raf = 0;
    let visible = false;

    const release = (el: HTMLElement | null) => {
      if (el) el.style.translate = "";
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        ringPos.x = pos.x;
        ringPos.y = pos.y;
        document.documentElement.classList.add("fx-cursor-on");
      }
      const target = e.target as Element | null;

      // Hover state for the ring
      ring.classList.toggle("is-active", !!target?.closest(INTERACTIVE));

      // Magnetic pull
      const m = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (m !== magnet) {
        release(magnet);
        magnet = m;
      }
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const strength = parseFloat(magnet.dataset.magnetic || "") || 0.3;
        const dx = (e.clientX - (r.left + r.width / 2)) * strength;
        const dy = (e.clientY - (r.top + r.height / 2)) * strength;
        magnet.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
      }

      // Spotlight position inside the element
      const s = target?.closest<HTMLElement>(".fx-spotlight");
      if (s) {
        const r = s.getBoundingClientRect();
        s.style.setProperty("--mx", `${e.clientX - r.left}px`);
        s.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
    };

    const onLeaveWindow = () => {
      visible = false;
      document.documentElement.classList.remove("fx-cursor-on");
      release(magnet);
      magnet = null;
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      ring.classList.add("is-pressed");
      if (!(e.target as Element | null)?.closest("a, button, [role='button']")) return;
      const burst = document.createElement("span");
      burst.className = "fx-burst";
      burst.style.left = `${e.clientX}px`;
      burst.style.top = `${e.clientY}px`;
      document.body.appendChild(burst);
      burst.addEventListener("animationend", () => burst.remove(), { once: true });
    };
    const onUp = () => ring.classList.remove("is-pressed");

    // The dot tracks exactly; the ring eases behind it for a fluid trail
    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
      document.documentElement.classList.remove("fx-cursor-on");
      release(magnet);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} aria-hidden="true" className="fx-cursor-ring" />
      <div ref={dotRef} aria-hidden="true" className="fx-cursor-dot" />
    </>
  );
}
