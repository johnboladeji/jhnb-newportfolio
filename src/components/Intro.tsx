import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { intro } from "../content";
import { playWelcome } from "../lib/sound";
import SoundToggle from "./SoundToggle";

/**
 * The welcome, once per visit (sessionStorage `jhnb-intro`): on the dark base colour, the first draft "Welcome to my
 * portfolio." types itself and is struck through, the way John revises interface copy; the rewrite arrives in Yoruba
 * first, then Spanish, French, and Japanese, and settles on "Ẹ káàbọ̀. Welcome." with "Let's begin where you are."
 * (about 3.5 s, from the owner's v2 draft). Then the whole thing fades away onto the landing page.
 *
 * Skip or Escape leaves at once. The welcome sound (agogo and talking drum) plays as it fades, if sound is on.
 * Reduced motion: the final words show at once, then a fade.
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

export default function Intro({ onDone }: { onDone: () => void }) {
  const reduce = !!useReducedMotion();
  const [typed, setTyped] = useState(reduce ? intro.draft : "");
  const [struck, setStruck] = useState(reduce);
  const [g, setG] = useState(reduce ? intro.greetings.length - 1 : -1);
  const [sub, setSub] = useState(reduce);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);
  const finished = useRef(false);
  const skipRef = useRef<HTMLButtonElement>(null);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const clearAll = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  // Fade away; the parent unmounts the intro once the fade has finished
  const leave = () => {
    if (finished.current) return;
    finished.current = true;
    clearAll();
    playWelcome();
    setLeaving(true);
  };

  const done = () => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* it will simply play again next visit */
    }
    onDone();
    window.dispatchEvent(new Event("jhnb:intro-done"));
  };

  // The script: type, strike, rewrite, settle, then fade
  useEffect(() => {
    skipRef.current?.focus({ preventScroll: true });
    if (reduce) {
      later(leave, 1600);
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
        later(leave, 1100);
      }
    };
    later(type, 400);
    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escape leaves
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        leave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const greeting = g >= 0 ? intro.greetings[g] : null;

  return (
    <AnimatePresence onExitComplete={done}>
      {!leaving && (
        <motion.div
          key="intro"
          role="dialog"
          aria-modal="true"
          aria-label={intro.title}
          className="fixed inset-0 z-[90] grid place-items-center bg-base px-6 text-cream sm:px-10"
          exit={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(6px)", scale: 1.03 }}
          transition={{ duration: reduce ? 0.4 : 0.7, ease: [0.65, 0, 0.35, 1] }}
        >
          {/* A warm glow behind the words */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_50%,rgba(152,58,40,0.22),transparent_70%)]" />

          <div aria-hidden="true" className="relative w-full max-w-[56rem]">
            <p className="relative inline-block min-h-[1.1em] font-sans text-[clamp(2rem,6vw,4.6rem)] font-bold leading-[1.05] tracking-tight text-cream">
              {typed}
              {!struck && <span className="ml-[0.04em] inline-block h-[0.9em] w-[0.06em] translate-y-[0.1em] animate-pulse bg-tertiary" />}
              <span
                className="absolute -left-[2%] top-[55%] h-[0.09em] rounded-full bg-primary-soft transition-[width] duration-500 ease-[cubic-bezier(0.7,0,0.2,1)]"
                style={{ width: struck ? "104%" : 0 }}
              />
            </p>
            <p lang={greeting?.lang} className="mt-[0.25em] min-h-[1.1em] font-serif text-[clamp(2.2rem,7vw,5.6rem)] italic leading-[1.02] text-tertiary">
              {greeting?.text}
            </p>
            <p className={`mt-5 text-[clamp(1rem,2vw,1.35rem)] text-cream/80 transition-opacity duration-500 ${sub ? "opacity-100" : "opacity-0"}`}>
              {intro.sub}
            </p>
          </div>

          {/* Sound (it plays as the welcome fades) and Skip */}
          <div className="absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] flex items-center justify-between px-5 sm:px-8">
            <SoundToggle />
            <button
              ref={skipRef}
              type="button"
              onClick={leave}
              className="rounded-full border border-cream/40 px-4 py-2 font-mono text-[11px] tracking-[0.15em] text-cream transition-colors hover:bg-cream hover:text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary"
            >
              {intro.skip}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
