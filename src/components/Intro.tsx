import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { intro } from "../content";
import { latch, playWelcome, unlock } from "../lib/sound";
import SoundToggle from "./SoundToggle";

/**
 * The welcome, once per visit (sessionStorage `jhnb-intro`): the shut door of John's studio, set in a terracotta stone
 * wall, all in the brand palette.
 *
 *   1. A sign across the carved double door types the first draft, "Welcome to my portfolio.", and strikes it through,
 *      the way John revises interface copy; the rewrite arrives in Yoruba first, then Spanish, French, and Japanese, and
 *      settles on "Ẹ káàbọ̀. Welcome." with "Let's begin where you are." (about 3.5 s).
 *   2. The brass lever turns with a click, the sign lifts away, and the doors swing open on their hinges.
 *   3. The doorway is a real opening in the wall, so the studio (the actual hero page) shows through as the doors part,
 *      and the view moves through the doorway into it.
 *
 * Clicking the door or its handle opens it at once; Skip or Escape leaves. The sound (agogo and talking drum) plays if
 * the visitor has turned it on, here or before. Reduced motion: the final words show at once and the scene fades.
 */

/** The brand palette, shared with the drum pad's bursts */
export const BRAND = ["#983a28", "#ffd0a1", "#f0937a", "#f2a65a", "#f1e6ce"];
const SEEN_KEY = "jhnb-intro";

export const introSeen = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
};

// ---- The terracotta wall: laid stone courses, drawn once as a repeating SVG tile ------------------------------------
const WALL = (() => {
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const tones = ["#983a28", "#8e3422", "#a3442e", "#7f2d1d", "#94402a", "#873120", "#9c3b26"];
  const W = 360;
  const rowH = [46, 54, 42, 58];
  let y = 0;
  let out = "";
  rowH.forEach((h, r) => {
    // Stones across the course; the course is shifted so joints never line up, and wraps seamlessly
    const widths: number[] = [];
    let total = 0;
    while (total < W - 40) {
      const w = 58 + Math.round(rnd() * 62);
      widths.push(w);
      total += w;
    }
    widths.push(W - total);
    let x = r % 2 ? -widths[0] / 2 : 0;
    widths.forEach((w) => {
      const tone = tones[Math.floor(rnd() * tones.length)];
      [x, x + W, x - W].forEach((sx) => {
        if (sx > W || sx + w < 0) return;
        const rx = 5 + rnd() * 6;
        out += `<rect x="${(sx + 2).toFixed(1)}" y="${y + 2}" width="${(w - 4).toFixed(1)}" height="${h - 4}" rx="${rx.toFixed(1)}" fill="${tone}"/>`;
        // Light catches the top edge; the bottom sits in shadow
        out += `<path d="M${sx + 6} ${y + 3.5} H${sx + w - 7}" stroke="#ffd0a1" stroke-opacity="0.16" stroke-width="1.5" stroke-linecap="round"/>`;
        out += `<path d="M${sx + 6} ${y + h - 3} H${sx + w - 7}" stroke="#150600" stroke-opacity="0.35" stroke-width="2" stroke-linecap="round"/>`;
        // Pits and flecks in the stone
        for (let k = 0; k < 3; k++) {
          const px = sx + 8 + rnd() * (w - 16);
          const py = y + 8 + rnd() * (h - 16);
          out += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(0.8 + rnd() * 1.6).toFixed(1)}" fill="${rnd() > 0.5 ? "#4e1d09" : "#f0937a"}" fill-opacity="${(0.18 + rnd() * 0.2).toFixed(2)}"/>`;
        }
      });
      x += w;
    });
    y += h;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y}"><rect width="${W}" height="${y}" fill="#3d1607"/>${out}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();

/** A carved relief panel: oniko circles or a zigzag band, cut into the wood like a Yoruba palace door. */
function Relief({ kind }: { kind: "oniko" | "zigzag" | "diamond" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
      {kind === "oniko" &&
        [34, 24, 14, 5].map((r) => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#ffd0a1" strokeOpacity="0.22" strokeWidth="2.2" />)}
      {kind === "zigzag" &&
        [22, 42, 62, 82].map((yy) => (
          <path key={yy} d={`M8 ${yy} l10.5 -9 l10.5 9 l10.5 -9 l10.5 9 l10.5 -9 l10.5 9 l10.5 -9 l10.5 9`} fill="none" stroke="#ffd0a1" strokeOpacity="0.2" strokeWidth="2.2" strokeLinejoin="round" />
        ))}
      {kind === "diamond" && (
        <g fill="none" stroke="#ffd0a1" strokeOpacity="0.22" strokeWidth="2.2">
          <path d="M50 8 L90 50 L50 92 L10 50 Z" />
          <path d="M50 26 L72 50 L50 74 L28 50 Z" />
          <circle cx="50" cy="50" r="5" fill="#ffd0a1" fillOpacity="0.2" />
        </g>
      )}
    </svg>
  );
}

const panel =
  "relative overflow-hidden rounded-[6px] bg-[linear-gradient(180deg,rgba(0,0,0,0.22),rgba(0,0,0,0.05))] shadow-[inset_0_3px_8px_rgba(0,0,0,0.65),inset_0_-1px_0_rgba(255,208,161,0.08)]";

/** One leaf of the double door: wood grain, three carved panels, brass studs, and a pull bar on the meeting edge. */
function Leaf({ side }: { side: "left" | "right" }) {
  const inner = side === "left" ? "right-3 sm:right-4" : "left-3 sm:left-4";
  return (
    <div
      className="absolute inset-0 flex flex-col gap-[3.5%] p-[9%] shadow-[inset_0_0_0_2px_rgba(21,6,0,0.6),inset_0_0_40px_rgba(0,0,0,0.45)]"
      style={{
        backgroundColor: "#4e1d09",
        backgroundImage: [
          "repeating-linear-gradient(90deg, rgba(21,6,0,0.28) 0 1.5px, transparent 1.5px 38px)",
          "repeating-linear-gradient(90deg, rgba(255,208,161,0.035) 0 1px, transparent 1px 9px)",
          side === "left"
            ? "linear-gradient(90deg, #3a1406, #4e1d09 35%, #5b2511 70%, #4a1b08)"
            : "linear-gradient(90deg, #4a1b08, #5b2511 30%, #4e1d09 65%, #3a1406)",
        ].join(","),
      }}
    >
      <div className={`${panel} h-[22%]`}>
        <Relief kind="zigzag" />
      </div>
      <div className={`${panel} flex-1`}>
        <Relief kind={side === "left" ? "oniko" : "diamond"} />
      </div>
      <div className={`${panel} h-[18%]`}>
        <Relief kind="zigzag" />
      </div>
      {/* Brass studs along the top and bottom rails */}
      {[4, 96].map((top) => (
        <div key={top} className="absolute inset-x-[9%] flex justify-between" style={{ top: `${top}%` }}>
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-[radial-gradient(circle_at_35%_35%,#ffe7cc,#c9905c_60%,#6b3a17)] shadow-[0_1px_1px_rgba(0,0,0,0.6)]" />
          ))}
        </div>
      ))}
      {/* Pull bar on the meeting edge */}
      <span
        className={`absolute top-[60%] h-[24%] w-[7px] rounded-full bg-[linear-gradient(90deg,#8a5a2e,#ffd0a1_45%,#b57b45)] shadow-[0_2px_6px_rgba(0,0,0,0.6)] ${inner}`}
      />
    </div>
  );
}

export default function Intro({ onDone }: { onDone: () => void }) {
  const reduce = !!useReducedMotion();
  const [typed, setTyped] = useState(reduce ? intro.draft : "");
  const [struck, setStruck] = useState(reduce);
  const [g, setG] = useState(reduce ? intro.greetings.length - 1 : -1);
  const [sub, setSub] = useState(reduce);
  const [phase, setPhase] = useState<"sign" | "turn" | "open" | "gone">("sign");
  const timers = useRef<number[]>([]);
  const finished = useRef(false);
  const skipRef = useRef<HTMLButtonElement>(null);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const clearAll = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    clearAll();
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* it will simply play again next visit */
    }
    setPhase("gone");
    onDone();
    window.dispatchEvent(new Event("jhnb:intro-done"));
  };

  // Turn the handle, open the doors, walk through
  const open = () => {
    if (phase !== "sign" || finished.current) return;
    clearAll();
    setTyped(intro.draft);
    setStruck(true);
    setG(intro.greetings.length - 1);
    setSub(true);
    if (reduce) {
      setPhase("open");
      later(finish, 500);
      return;
    }
    setPhase("turn");
    latch();
    later(() => {
      setPhase("open");
      playWelcome();
    }, 520);
    later(finish, 520 + 1750);
  };

  // The sign's script: type, strike, rewrite, settle, then open
  useEffect(() => {
    skipRef.current?.focus({ preventScroll: true });
    if (reduce) {
      later(open, 1700);
      return clearAll;
    }
    const draft = intro.draft;
    let i = 0;
    const type = () => {
      setTyped(draft.slice(0, ++i));
      if (i < draft.length) later(type, 34);
      else
        later(() => {
          setStruck(true);
          later(() => greet(0), 470);
        }, 260);
    };
    const greet = (n: number) => {
      setG(n);
      if (n < intro.greetings.length - 1) later(() => greet(n + 1), n === 0 ? 480 : 260);
      else {
        setSub(true);
        later(open, 1100);
      }
    };
    later(type, 450);
    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escape leaves
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "gone") return null;
  const opening = phase === "open";
  const greeting = g >= 0 ? intro.greetings[g] : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={intro.title}
      className="fixed inset-0 z-[90] overflow-hidden"
      style={
        {
          // The doorway: size and place, shared by the wall's opening, the frame, and the doors
          "--dh": "min(80dvh, 46rem, calc(88vw * 1.45))",
          "--dw": "min(88vw, calc(var(--dh) * 0.82))",
          "--dt": "calc((100dvh - var(--dh)) * 0.72)",
        } as React.CSSProperties
      }
    >
      {/* Everything moves together: as the doors open, the scene grows around the doorway, so you walk through it */}
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: "50% calc(var(--dt) + var(--dh) * 0.55)" }}
        initial={false}
        animate={opening ? (reduce ? { opacity: 0 } : { scale: 3.2, opacity: 0 }) : { scale: 1, opacity: 1 }}
        transition={reduce ? { duration: 0.45 } : { scale: { delay: 0.55, duration: 1.2, ease: [0.7, 0, 0.3, 1] }, opacity: { delay: 1.15, duration: 0.6 } }}
      >
        {/* The wall, with a real opening where the door hangs (so the studio shows through when it opens) */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundColor: "#3d1607",
            backgroundImage: [
              // Warm light falling from above the door, and the corners sinking into shadow
              "radial-gradient(ellipse 50% 40% at 50% 12%, rgba(255,208,161,0.2), transparent 70%)",
              "radial-gradient(ellipse 85% 75% at 50% 52%, transparent 30%, rgba(21,6,0,0.9) 100%)",
              "linear-gradient(rgba(21,6,0,0.32), rgba(21,6,0,0.32))",
              WALL,
            ].join(","),
            backgroundSize: "auto, auto, auto, 360px 200px",
            WebkitMaskImage: "linear-gradient(#000,#000), linear-gradient(#000,#000)",
            WebkitMaskSize: "100% 100%, var(--dw) var(--dh)",
            WebkitMaskPosition: "0 0, 50% var(--dt)",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskComposite: "xor",
            maskImage: "linear-gradient(#000,#000), linear-gradient(#000,#000)",
            maskSize: "100% 100%, var(--dw) var(--dh)",
            maskPosition: "0 0, 50% var(--dt)",
            maskRepeat: "no-repeat",
            maskComposite: "exclude",
          }}
        />

        {/* Stone frame and lintel around the doorway, with the studio's name cut into it */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2"
          style={{ top: "calc(var(--dt) - 2.6rem)", width: "calc(var(--dw) + 2.4rem)", height: "calc(var(--dh) + 2.6rem)" }}
        >
          <div className="absolute inset-x-0 top-0 flex h-[2.6rem] items-center justify-center rounded-t-md bg-[linear-gradient(180deg,#a8492f,#7f2d1d)] shadow-[0_6px_18px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,208,161,0.25)]">
            <span className="font-mono text-[11px] tracking-[0.5em] text-tertiary [text-shadow:0_-1px_0_rgba(21,6,0,0.8),0_1px_0_rgba(255,208,161,0.25)] sm:text-xs">
              {intro.sign}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 top-[2.6rem] w-[1.2rem] bg-[linear-gradient(90deg,#7f2d1d,#a3442e_40%,#7f2d1d)] shadow-[4px_0_12px_rgba(0,0,0,0.55)]" />
          <div className="absolute bottom-0 right-0 top-[2.6rem] w-[1.2rem] bg-[linear-gradient(90deg,#7f2d1d,#a3442e_60%,#7f2d1d)] shadow-[-4px_0_12px_rgba(0,0,0,0.55)]" />
        </div>

        {/* The double door */}
        <div
          className="absolute left-1/2 z-10 -translate-x-1/2 [perspective:1600px]"
          style={{ top: "var(--dt)", width: "var(--dw)", height: "var(--dh)" }}
        >
          {/* Light from inside the studio, spilling through the gap as the doors part */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(255,208,161,0.55),rgba(240,147,122,0.18)_45%,transparent_75%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: opening ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />
          {(["left", "right"] as const).map((side) => (
            <motion.button
              key={side}
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => {
                unlock();
                open();
              }}
              className="absolute top-0 h-full w-1/2 cursor-pointer [transform-style:preserve-3d]"
              style={{ left: side === "left" ? 0 : "50%", transformOrigin: side === "left" ? "0% 50%" : "100% 50%" }}
              initial={false}
              animate={{ rotateY: opening ? (side === "left" ? -104 : 104) : 0 }}
              transition={{ duration: 1.25, ease: [0.55, 0, 0.25, 1] }}
            >
              <Leaf side={side} />
            </motion.button>
          ))}

          {/* The brass lever on the right leaf: it turns before the doors open */}
          <motion.button
            type="button"
            onClick={() => {
              unlock();
              open();
            }}
            aria-label={intro.openNow}
            className="group absolute right-[calc(50%-2.75rem)] top-[66%] z-20 flex h-12 w-12 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary"
            animate={{ opacity: opening ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <span aria-hidden="true" className="absolute h-7 w-7 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffe7cc,#d79a5f_55%,#6b3a17)] shadow-[0_3px_8px_rgba(0,0,0,0.6)]" />
            <motion.span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[9px] w-12 -translate-y-1/2 rounded-full bg-[linear-gradient(180deg,#ffe7cc,#d79a5f_50%,#8a5a2e)] shadow-[0_3px_6px_rgba(0,0,0,0.55)] transition-[filter] group-hover:brightness-110"
              style={{ transformOrigin: "4px 50%", marginLeft: -4 }}
              animate={{ rotate: phase === "sign" ? 0 : 38 }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
            />
          </motion.button>

          {/* The sign across the door: the welcome, drafted and revised */}
          <motion.div
            aria-hidden="true"
            className="@container pointer-events-none absolute left-1/2 top-[12%] z-10 w-[86%] -translate-x-1/2 rounded-xl border border-tertiary/20 bg-base/80 px-[6%] py-[5%] text-left shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-[2px]"
            animate={phase === "sign" ? { opacity: 1, y: 0 } : { opacity: 0, y: -24 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="relative inline-block min-h-[1.1em] whitespace-nowrap font-sans text-[6.3cqw] font-bold leading-[1.1] tracking-tight text-cream">
              {typed}
              {!struck && <span className="ml-[0.04em] inline-block h-[0.9em] w-[0.06em] translate-y-[0.1em] animate-pulse bg-tertiary" />}
              <span
                className="absolute -left-[2%] top-[55%] h-[0.09em] rounded-full bg-primary-soft transition-[width] duration-500 ease-[cubic-bezier(0.7,0,0.2,1)]"
                style={{ width: struck ? "104%" : 0 }}
              />
            </p>
            <p
              lang={greeting?.lang}
              className="mt-[0.3em] min-h-[1.1em] font-serif text-[8.4cqw] italic leading-[1.05] text-tertiary"
            >
              {greeting?.text}
            </p>
            <p className={`mt-[0.9em] text-[max(0.85rem,3.6cqw)] text-cream/80 transition-opacity duration-500 ${sub ? "opacity-100" : "opacity-0"}`}>
              {intro.sub}
            </p>
          </motion.div>
        </div>

        {/* Two lanterns flank the door, their flames breathing */}
        {(["left", "right"] as const).map((side) => (
          <div
            key={side}
            aria-hidden="true"
            className="pointer-events-none absolute hidden w-10 sm:block"
            style={{
              top: "calc(var(--dt) + var(--dh) * 0.3)",
              [side]: "calc(50% - var(--dw) / 2 - 5.5rem)",
            }}
          >
            <span className="lantern-glow absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,208,161,0.4),rgba(242,166,90,0.12)_40%,transparent_70%)]" />
            <span className="relative mx-auto block h-3 w-6 rounded-t-md bg-[#2a0e04]" />
            <span className="relative mx-auto block h-14 w-10 rounded-md border-2 border-[#2a0e04] bg-[radial-gradient(ellipse_at_50%_60%,#ffe7cc,#f2a65a_45%,#983a28_80%)] shadow-[0_0_24px_rgba(242,166,90,0.6)]">
              <span className="absolute inset-y-1 left-1/2 w-0.5 -translate-x-1/2 bg-[#2a0e04]/70" />
            </span>
            <span className="relative mx-auto block h-2 w-8 rounded-b-md bg-[#2a0e04]" />
          </div>
        ))}

        {/* A threshold step under the door */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 h-3 -translate-x-1/2 rounded-b-md bg-[linear-gradient(180deg,#5a2410,#2a0e04)] shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
          style={{ top: "calc(var(--dt) + var(--dh))", width: "calc(var(--dw) + 3.4rem)" }}
        />
      </motion.div>

      {/* Sound (it plays as the doors open) and Skip */}
      <motion.div
        className="absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] flex items-center justify-between px-5 sm:px-8"
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <SoundToggle />
        <button
          ref={skipRef}
          type="button"
          onClick={finish}
          className="rounded-full border border-cream/40 bg-base/50 px-4 py-2 font-mono text-[11px] tracking-[0.15em] text-cream backdrop-blur-sm transition-colors hover:bg-cream hover:text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary"
        >
          {intro.skip}
        </button>
      </motion.div>
    </div>
  );
}
