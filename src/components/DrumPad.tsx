import { useEffect } from "react";
import { tapDrum } from "../lib/sound";
import { CLOTH } from "./Intro";

/**
 * The landing page is a talking drum: tap or click any open space and it sounds (pitched by height, if sound is on)
 * and throws a burst of Aso-oke-coloured rings and beads. Links, buttons, form fields, the bio, the headline, the
 * drawer, and the intro keep their own behaviour. Each tap announces itself with a `jhnb:drum` event (the play hint
 * listens). Under reduced motion the burst is a single ring that fades.
 */
const SKIP = "a, button, input, textarea, select, label, [role='dialog'], [data-no-drum]";

export default function DrumPad() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let hue = 0;

    const onDown = (e: PointerEvent) => {
      if (e.button > 0) return;
      const target = e.target as Element | null;
      if (target?.closest(SKIP)) return;

      tapDrum(e.clientY / window.innerHeight);
      window.dispatchEvent(new Event("jhnb:drum"));

      const burst = document.createElement("span");
      burst.className = "drum-burst";
      burst.setAttribute("aria-hidden", "true");
      burst.style.left = `${e.clientX}px`;
      burst.style.top = `${e.clientY}px`;
      const rings = reduce.matches ? 1 : 3;
      for (let i = 0; i < rings; i++) {
        const ring = document.createElement("i");
        ring.className = "drum-ring";
        ring.style.setProperty("--c", CLOTH[(hue + i * 2) % CLOTH.length]);
        ring.style.animationDelay = `${i * 90}ms`;
        burst.appendChild(ring);
      }
      if (!reduce.matches) {
        // Beads fly out like a shaken shekere
        for (let i = 0; i < 10; i++) {
          const bead = document.createElement("b");
          bead.className = "drum-bead";
          const a = (i / 10) * Math.PI * 2 + Math.random() * 0.4;
          const d = 40 + Math.random() * 50;
          bead.style.setProperty("--x", `${Math.cos(a) * d}px`);
          bead.style.setProperty("--y", `${Math.sin(a) * d}px`);
          bead.style.setProperty("--c", CLOTH[(hue + i) % CLOTH.length]);
          burst.appendChild(bead);
        }
      }
      hue = (hue + 1) % CLOTH.length;
      document.body.appendChild(burst);
      window.setTimeout(() => burst.remove(), 1400);
    };

    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  return null;
}
