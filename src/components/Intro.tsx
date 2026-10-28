import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Volume2 } from "lucide-react";
import { hero, intro, site } from "../content";
import { playWelcome, setSound } from "../lib/sound";

/**
 * The welcome, once per visit (sessionStorage `jhnb-intro`). Built to be understood in about two seconds, in the
 * site's own colours:
 *
 *   0.0 s  the J. mark, its tertiary ring drawing around it, and "Ẹ káàbọ̀ · Welcome"
 *   0.3 s  JOHN B. OLADEJI rises
 *   0.6 s  "designs with" (outlined, like the hero) and then RHETORIC · CULTURE · CODE stamp in (the hero's three words)
 *   1.3 s  the three roles
 *   1.5 s  Enter with sound / Enter quietly; it enters by itself, quietly, after a short countdown
 *
 * Entering plays the welcome on the agogo bell and talking drum (src/lib/sound.ts) while the page lifts away like a
 * curtain, its edge a woven band in the brand colours. Escape enters quietly. Reduced motion: everything is shown at
 * once and the page fades instead of lifting.
 */

/** The brand palette, shared with the drum pad's bursts */
export const BRAND = ["#983a28", "#ffd0a1", "#f0937a", "#f2a65a", "#f1e6ce"];
const SEEN_KEY = "jhnb-intro";
const AUTO_SECONDS = 6;
const EASE = [0.22, 1, 0.36, 1] as const;

export const introSeen = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
};

/** A faint Adire field in the brand's own tones: oniko circles and stencil dots, barely there behind the message. */
function AdireTexture() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full opacity-[0.07]" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="adire-brand" width="96" height="96" patternUnits="userSpaceOnUse">
          {[18, 12, 6].map((r) => (
            <circle key={r} cx="24" cy="24" r={r} fill="none" stroke="#ffd0a1" strokeWidth="1.6" />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={64 + (i % 2) * 14} cy={60 + Math.floor(i / 2) * 14} r="2.4" fill="#f1e6ce" />
          ))}
          <path d="M52 22 q6 -8 12 0 t12 0 t12 0" fill="none" stroke="#f0937a" strokeWidth="1.6" strokeLinecap="round" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#adire-brand)" />
    </svg>
  );
}

export default function Intro({ onDone }: { onDone: () => void }) {
  const reduce = !!useReducedMotion();
  const [leaving, setLeaving] = useState(false);
  const [left, setLeft] = useState(AUTO_SECONDS);
  const enterBtn = useRef<HTMLButtonElement>(null);
  const finished = useRef(false);
  const ticker = useRef(0);

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

  const enter = (withSound: boolean) => {
    if (leaving) return;
    setSound(withSound);
    if (withSound) playWelcome();
    setLeaving(true);
  };

  useEffect(() => enterBtn.current?.focus({ preventScroll: true }), []);

  // Escape enters quietly; a countdown enters quietly too, for anyone who just waits
  useEffect(() => {
    if (leaving) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        enter(false);
      }
    };
    window.addEventListener("keydown", onKey);
    const start = window.setTimeout(() => {
      ticker.current = window.setInterval(() => setLeft((n) => n - 1), 1000);
    }, 1500);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(start);
      window.clearInterval(ticker.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaving]);
  useEffect(() => {
    if (left <= 0 && !leaving) {
      enter(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const at = (s: number) => (reduce ? 0 : s);
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: at(delay), duration: 0.55, ease: EASE },
  });
  const roles = hero.tagline.split("·").map((r) => r.trim());

  return (
    <AnimatePresence onExitComplete={finish}>
      {!leaving && (
        <motion.div
          key="intro"
          role="dialog"
          aria-modal="true"
          aria-labelledby="intro-title"
          className="fixed inset-0 z-[90] flex flex-col overflow-hidden bg-base text-cream"
          exit={reduce ? { opacity: 0 } : { y: "-100%" }}
          transition={{ duration: reduce ? 0.4 : 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          <h2 id="intro-title" className="sr-only">
            {intro.title}
          </h2>
          {/* Warm brand glow and a whisper of Adire behind the message */}
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_45%,rgba(152,58,40,0.42),rgba(78,29,9,0.25)_45%,transparent_75%)]" />
          <AdireTexture />

          <div className="relative flex flex-1 flex-col items-center justify-center px-5 text-center">
            {/* The J. mark, its ring drawing round it */}
            <motion.div
              className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28"
              initial={reduce ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                <circle cx="50" cy="50" r="47" fill="none" stroke="#4e1d09" strokeWidth="2" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="47"
                  fill="none"
                  stroke="#ffd0a1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease: EASE }}
                />
              </svg>
              <img src={site.logoSrc} alt="" className="h-14 w-14 rounded-xl sm:h-16 sm:w-16" />
            </motion.div>

            <motion.p {...rise(0.15)} className="mt-5 font-mono text-[11px] tracking-[0.28em] text-tertiary">
              <span lang={intro.greetingLang}>{intro.greeting.toUpperCase()}</span> · {intro.greetingMeaning.toUpperCase()}
            </motion.p>

            {/* Name */}
            <div className="mt-3 overflow-hidden pb-1">
              <motion.p
                initial={reduce ? false : { y: "105%" }}
                animate={{ y: 0 }}
                transition={{ delay: at(0.3), duration: 0.6, ease: EASE }}
                className="font-display text-[2.6rem] uppercase leading-none tracking-wide text-cream sm:text-7xl lg:text-8xl"
              >
                {site.fullName}
              </motion.p>
            </div>

            {/* "designs with" + the hero's three words */}
            <motion.p {...rise(0.6)} className="text-stroke mt-4 font-display text-xl uppercase tracking-[0.12em] sm:text-3xl">
              {intro.lead}
            </motion.p>
            <p className="mt-2 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-display text-[clamp(1.6rem,8.4vw,2.25rem)] uppercase leading-none text-primary sm:gap-x-5 sm:text-6xl lg:text-7xl">
              {hero.rotatingWords.map((w, i) => (
                <motion.span
                  key={w}
                  className="flex items-center gap-x-2.5 sm:gap-x-5"
                  initial={reduce ? false : { opacity: 0, scale: 1.6, filter: "blur(6px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ delay: at(0.75 + i * 0.15), duration: 0.45, ease: EASE }}
                >
                  {i > 0 && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-tertiary sm:h-3 sm:w-3" />}
                  {w}
                </motion.span>
              ))}
            </p>

            {/* Roles */}
            <motion.ul {...rise(1.3)} className="mt-6 flex flex-wrap justify-center gap-2 font-mono text-[10px] tracking-[0.18em] text-cream/85 sm:text-xs">
              {roles.map((r) => (
                <li key={r} className="rounded-full border border-cream/20 px-3 py-1.5">
                  {r}
                </li>
              ))}
            </motion.ul>

            {/* Enter */}
            <motion.div {...rise(1.5)} className="mt-9 flex flex-col items-center gap-3">
              <button
                ref={enterBtn}
                type="button"
                onClick={() => enter(true)}
                className="fx-spotlight group inline-flex items-center gap-2.5 rounded-full bg-cream px-6 py-3 font-mono text-xs font-medium tracking-[0.18em] text-base transition-colors duration-300 hover:bg-tertiary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary"
              >
                <Volume2 size={16} aria-hidden="true" />
                {intro.enterWithSound}
                <ArrowRight size={15} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => enter(false)}
                className="font-mono text-[11px] tracking-[0.14em] text-cream/70 underline decoration-cream/30 underline-offset-4 transition-colors hover:text-tertiary hover:decoration-tertiary"
              >
                {intro.enterQuietly}
                <span className="text-cream/45">
                  {" "}
                  · {intro.autoEnter} {Math.max(0, left)}
                </span>
              </button>
            </motion.div>
          </div>

          {/* The curtain's edge: a woven band in the brand colours, seen as the page lifts away */}
          <span aria-hidden="true" className="aso-band absolute inset-x-0 bottom-0 h-1.5" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
