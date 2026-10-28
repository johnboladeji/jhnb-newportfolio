import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { intro } from "../content";
import { BEAT, hush, playIntro, pluck, note, setSound } from "../lib/sound";

/**
 * The welcome, played once per visit (sessionStorage `jhnb-intro`).
 *
 * 1. The gate: an indigo Adire field (oniko circles, dots, and waves, the resist-dye motifs of Abẹ́òkúta cloth) drifts
 *    behind a turning ring of Aso-oke colours, while the greeting cycles through Yoruba, Igbo, Hausa, Naija Pidgin,
 *    and English. The visitor enters with sound or quietly (browsers only allow sound after a tap anyway).
 * 2. The show, eight beats at 112 BPM in step with the talking drum (src/lib/sound.ts): woven Aso-oke bands sweep in
 *    one per beat, a coloured ring bursts on every drum stroke, the J. mark lands, "JUST HOLD NO BOUNDS" stamps in
 *    word by word, and the cloth splits open onto the site.
 *
 * Escape (or Skip) leaves at any point. Under reduced motion the show is skipped: the gate simply fades away.
 */

// Aso-oke and Ankara colours: indigo, gold, terracotta, palm green, magenta, ochre, brand red, cream
export const CLOTH = ["#2b3990", "#f2a93b", "#c8462b", "#1f7a4d", "#b23a73", "#d98c1f", "#983a28", "#f1e6ce"];
const SEEN_KEY = "jhnb-intro";
const DRUM_BEATS = [0, 1, 1.5, 2, 3, 3.5, 4, 5, 5.5, 5.75, 6, 6.5, 7];
const REVEAL_AT = 8 * BEAT;

export const introSeen = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
};

/** The Adire field: tiled resist-dye motifs on indigo, slowly drifting. */
function AdireField({ still }: { still: boolean }) {
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="adire" width="132" height="132" patternUnits="userSpaceOnUse">
          {!still && <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="132 66" dur="22s" repeatCount="indefinite" />}
          <rect width="132" height="132" fill="#1b1f4d" />
          {/* Oniko: tied concentric circles */}
          {[22, 16, 10, 4].map((r, i) => (
            <circle key={r} cx="33" cy="33" r={r} fill="none" stroke={["#f2a93b", "#c8462b", "#f1e6ce", "#1f7a4d"][i]} strokeWidth="2.4" strokeOpacity="0.85" />
          ))}
          {/* Dots, the starch-paste stencil marks */}
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={84 + (i % 2) * 18} cy={18 + Math.floor(i / 2) * 18} r="3.2" fill="#f1e6ce" fillOpacity="0.7" />
          ))}
          {/* Waves */}
          <path d="M70 78 q8 -10 16 0 t16 0 t16 0 t16 0" fill="none" stroke="#b23a73" strokeWidth="3" strokeLinecap="round" />
          <path d="M70 92 q8 -10 16 0 t16 0 t16 0 t16 0" fill="none" stroke="#f2a93b" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />
          {/* A leaf-and-stem stitch */}
          <path d="M12 86 v40 M12 96 l10 -8 M12 108 l-10 -8 M12 120 l10 -8" stroke="#1f7a4d" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <rect x="40" y="96" width="22" height="22" rx="3" fill="none" stroke="#d98c1f" strokeWidth="2.2" transform="rotate(45 51 107)" />
        </pattern>
        <radialGradient id="adire-fade" cx="0.5" cy="0.5" r="0.62">
          <stop offset="0" stopColor="#0d0b22" stopOpacity="0.92" />
          <stop offset="0.55" stopColor="#0d0b22" stopOpacity="0.55" />
          <stop offset="1" stopColor="#0d0b22" stopOpacity="0.15" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#adire)" />
      <rect width="100%" height="100%" fill="url(#adire-fade)" />
    </svg>
  );
}

/** A turning ring of Aso-oke colours around the mark. */
function ColourRing({ size, still }: { size: number; still: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${CLOTH.map((c, i) => `${c} ${(i / CLOTH.length) * 100}% ${((i + 1) / CLOTH.length) * 100}%`).join(",")})`,
        WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9px))",
        mask: "radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9px))",
      }}
      animate={still ? undefined : { rotate: 360 }}
      transition={{ duration: 14, ease: "linear", repeat: Infinity }}
    />
  );
}

/** One woven band: a base colour, fine warp threads, and a pair of contrasting weft stripes. */
function bandStyle(i: number): React.CSSProperties {
  const base = CLOTH[i % CLOTH.length];
  const a = CLOTH[(i + 3) % CLOTH.length];
  const b = CLOTH[(i + 5) % CLOTH.length];
  return {
    backgroundColor: base,
    backgroundImage: [
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.09) 0 2px, transparent 2px 7px)",
      "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 1px, transparent 1px 5px)",
      `linear-gradient(to bottom, transparent 30%, ${a} 30% 38%, transparent 38% 58%, ${b} 58% 63%, transparent 63%)`,
    ].join(","),
  };
}

export default function Intro({ onDone }: { onDone: () => void }) {
  const reduce = !!useReducedMotion();
  const [phase, setPhase] = useState<"gate" | "show" | "leaving">("gate");
  const [reveal, setReveal] = useState(false);
  const [g, setG] = useState(0);
  const soundBtn = useRef<HTMLButtonElement>(null);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* it will simply play again next visit */
    }
    onDone();
    window.dispatchEvent(new Event("jhnb:intro-done"));
  };

  // Cycle the greetings while the gate waits
  useEffect(() => {
    if (phase !== "gate") return;
    const id = window.setInterval(() => setG((n) => (n + 1) % intro.greetings.length), 1700);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => soundBtn.current?.focus(), []);

  // Escape skips, at any point
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (phase === "show") hush(1.6);
      setPhase("leaving");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  // The show's clock: open the cloth at the end of bar two, then hand over to the site
  useEffect(() => {
    if (phase !== "show") return;
    const r = window.setTimeout(() => setReveal(true), REVEAL_AT * 1000);
    const d = window.setTimeout(() => setPhase("leaving"), REVEAL_AT * 1000 + 1100);
    return () => {
      window.clearTimeout(r);
      window.clearTimeout(d);
    };
  }, [phase]);

  const enter = (withSound: boolean) => {
    setSound(withSound);
    if (reduce) {
      [5, 7, 9].forEach((n, i) => pluck(note(n), i * 0.08, 0.45, 1.6));
      setPhase("leaving");
      return;
    }
    playIntro();
    setPhase("show");
  };

  const greeting = intro.greetings[g];

  return (
    <AnimatePresence onExitComplete={finish}>
      {phase !== "leaving" && (
        <motion.div
          key="intro"
          role="dialog"
          aria-modal="true"
          aria-labelledby="intro-title"
          className="fixed inset-0 z-[90] overflow-hidden bg-[#0d0b22] text-cream"
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.4 : 0.6 }}
        >
          <h2 id="intro-title" className="sr-only">
            {intro.title}
          </h2>

          {/* ---- The gate ---- */}
          <AnimatePresence>
            {phase === "gate" && (
              <motion.div
                key="gate"
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.5 }}
              >
                <AdireField still={reduce} />
                <div className="relative flex flex-col items-center px-5 text-center">
                  <div className="relative flex h-44 w-44 items-center justify-center sm:h-52 sm:w-52">
                    <ColourRing size={208} still={reduce} />
                    <motion.div
                      className="absolute h-[9.5rem] w-[9.5rem] rounded-full border border-cream/15 sm:h-44 sm:w-44"
                      animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
                      transition={{ duration: BEAT * 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <img src="/jhnb-icon.png" alt="" className="relative h-20 w-20 rounded-2xl shadow-[0_10px_40px_rgba(242,169,59,0.35)] sm:h-24 sm:w-24" />
                  </div>

                  <p className="mt-6 font-mono text-[10px] tracking-[0.3em] text-[#f2a93b] sm:text-xs">{intro.kicker.toUpperCase()}</p>

                  {/* The greeting, cycling through languages */}
                  <div className="relative mt-3 h-[6.5rem] w-[min(90vw,40rem)] sm:h-[8rem]" aria-live="off">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={greeting.text}
                        className="absolute inset-0 flex flex-col items-center justify-center"
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -24, filter: "blur(8px)" }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {/* Padded so the gradient also paints the dots under Ẹ and Ọ, and the tone marks above */}
                        <p lang={greeting.lang} className="font-display text-5xl uppercase leading-none tracking-wide sm:text-7xl">
                          <span className="inline-block bg-[linear-gradient(90deg,#f2a93b,#f1e6ce_45%,#f0937a)] bg-clip-text px-1 py-[0.2em] text-transparent">
                            {greeting.text}
                          </span>
                        </p>
                        <p className="font-mono text-[11px] tracking-[0.25em] text-cream/60">{greeting.language.toUpperCase()}</p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                    <button
                      ref={soundBtn}
                      type="button"
                      onClick={() => enter(true)}
                      className="group inline-flex items-center gap-2.5 rounded-full bg-cream px-6 py-3 font-mono text-xs font-medium tracking-[0.18em] text-base shadow-[0_0_0_0_rgba(242,169,59,0.6)] transition-[background-color,box-shadow] duration-300 hover:bg-[#f2a93b] hover:shadow-[0_0_0_8px_rgba(242,169,59,0.18)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2a93b]"
                    >
                      <Volume2 size={16} aria-hidden="true" className="transition-transform group-hover:scale-110" />
                      {intro.enterWithSound}
                    </button>
                    <button
                      type="button"
                      onClick={() => enter(false)}
                      className="inline-flex items-center gap-2.5 rounded-full border border-cream/30 px-6 py-3 font-mono text-xs font-medium tracking-[0.18em] text-cream transition-colors duration-300 hover:border-cream hover:bg-cream/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2a93b]"
                    >
                      <VolumeX size={16} aria-hidden="true" />
                      {intro.enterQuietly}
                    </button>
                  </div>
                  <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-cream/60">{intro.note}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---- The show ---- */}
          {phase === "show" && (
            <div className="absolute inset-0" aria-hidden="true">
              {/* Eight woven bands, one per beat, splitting open at the reveal */}
              {CLOTH.map((_, i) => {
                const top = i < 4;
                return (
                  <motion.div
                    key={i}
                    className="absolute inset-x-0"
                    style={{ top: `${i * 12.5}%`, height: "12.6%" }}
                    animate={reveal ? { y: top ? `-${(4 - i) * 100 + 10}%` : `${(i - 3) * 100 + 10}%` } : { y: 0 }}
                    transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1], delay: reveal ? Math.abs(i - 3.5) * 0.03 : 0 }}
                  >
                    <motion.div
                      className="h-full w-full shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
                      style={bandStyle(i)}
                      initial={{ x: i % 2 ? "105%" : "-105%" }}
                      animate={{ x: 0 }}
                      transition={{ delay: i * BEAT, duration: BEAT * 0.9, ease: [0.22, 1.2, 0.36, 1] }}
                    />
                  </motion.div>
                );
              })}

              {/* A coloured ring on every drum stroke */}
              <div className="absolute inset-0 flex items-center justify-center">
                {DRUM_BEATS.map((beat, k) => (
                  <motion.span
                    key={k}
                    className="absolute h-24 w-24 rounded-full"
                    style={{ border: `${k % 3 === 0 ? 5 : 3}px solid ${CLOTH[(k * 3) % CLOTH.length]}`, boxShadow: `0 0 24px ${CLOTH[(k * 3) % CLOTH.length]}` }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0.2, 7], opacity: [1, 0] }}
                    transition={{ delay: beat * BEAT, duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
                  />
                ))}

                {/* The mark lands on beat 5, the words stamp in on the drum */}
                <motion.div
                  className="relative flex flex-col items-center"
                  animate={reveal ? { scale: 1.35, opacity: 0 } : undefined}
                  transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
                >
                  <motion.div
                    className="relative flex h-40 w-40 items-center justify-center rounded-full bg-[#150600] shadow-[0_0_60px_rgba(242,169,59,0.45)] sm:h-48 sm:w-48"
                    initial={{ scale: 0, rotate: -120 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 4 * BEAT, type: "spring", stiffness: 220, damping: 14 }}
                  >
                    <ColourRing size={200} still={false} />
                    <img src="/jhnb-icon.png" alt="" className="h-24 w-24 rounded-2xl sm:h-28 sm:w-28" />
                  </motion.div>
                  <div className="mt-5 flex flex-wrap justify-center gap-x-3 font-display text-5xl uppercase leading-none text-cream [text-shadow:0_4px_24px_rgba(13,11,34,0.9),0_0_2px_#150600] sm:text-7xl">
                    {intro.words.map((w, i) => (
                      <motion.span
                        key={w}
                        initial={{ opacity: 0, scale: 2.2, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: (4.5 + i * 0.75) * BEAT, type: "spring", stiffness: 420, damping: 16 }}
                      >
                        {w}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Skip, during the show */}
          {phase === "show" && (
            <button
              type="button"
              onClick={() => {
                hush(1.6);
                setPhase("leaving");
              }}
              className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-10 rounded-full border border-cream/40 bg-[#0d0b22]/60 px-4 py-2 font-mono text-[11px] tracking-[0.2em] text-cream backdrop-blur-sm transition-colors hover:bg-cream hover:text-base"
            >
              {intro.skip}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
