import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { hero } from "../content";

/**
 * The hero bio, revealed word by word at a reading pace: each word rises out of a soft blur, the key phrases
 * (`hero.bioHighlights`) land in the accent colour, and the sign-off follows on its own line after a beat.
 *
 * Interaction: a reading light follows the pointer (or a finger) and warms the words around it; tapping or clicking
 * the text while it reveals shows it all at once; once it has finished, a replay button runs it again.
 * Screen readers get the full text at once (visually hidden copy); the animated words are aria-hidden.
 * Under reduced motion the text is simply there.
 */

interface Word {
  text: string;
  /** Position in the reveal order */
  i: number;
  hi: boolean;
}

const BIO = hero.bio;
const SIGNOFF = hero.bioSignoff;

/** Split into words, marking those inside a highlight phrase. */
function toWords(text: string, start: number, phrases: readonly string[]): Word[] {
  const ranges = phrases.map((p) => {
    const at = text.indexOf(p);
    return at < 0 ? [0, -1] : [at, at + p.length];
  });
  let pos = 0;
  return text.split(" ").map((w, k) => {
    const from = pos;
    pos += w.length + 1;
    return { text: w, i: start + k, hi: ranges.some(([a, b]) => from >= a && from < b) };
  });
}

const bioWords = toWords(BIO, 0, hero.bioHighlights);
const signWords = toWords(SIGNOFF, bioWords.length, []);

// Pacing: about 8–9 words a second, slower than a skim, quicker than a read-aloud
const STEP = 0.115;
const DURATION = 0.85;
const SIGN_PAUSE = 0.45; // a beat before the sign-off
const START = 0.35;
const EASE = [0.22, 1, 0.36, 1] as const;
const delayOf = (i: number) => START + i * STEP + (i >= bioWords.length ? SIGN_PAUSE : 0);
const TOTAL_MS = Math.round((delayOf(bioWords.length + signWords.length - 1) + DURATION) * 1000);

// On phones only three lines show, so the sign-off follows them instead of waiting for the hidden words
const COMPACT_QUERY = "(max-width: 767px)";
const SIGN_SHIFT = Math.max(0, delayOf(bioWords.length) - 3.4);

function Words({ words, mode, shift = 0 }: { words: Word[]; mode: "play" | "still"; shift?: number }) {
  return (
    <>
      {words.map((w, k) => (
        <Fragment key={w.i}>
          <motion.span
            className="inline-block whitespace-nowrap will-change-[transform,opacity,filter]"
            initial={mode === "play" ? { opacity: 0, y: "0.5em", filter: "blur(8px)" } : false}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: delayOf(w.i) - shift, duration: DURATION, ease: EASE }}
          >
            {/* The reading light writes --g (0–1) here */}
            <span
              data-word
              className={`bio-word inline-block ${w.hi ? "bio-hi text-tertiary" : ""}`}
            >
              {w.text}
            </span>
          </motion.span>
          {/* The space sits between the inline-block words, so lines break only there */}
          {k < words.length - 1 && " "}
        </Fragment>
      ))}
    </>
  );
}

interface TypewriterBioProps {
  /** Called once, when the sign-off has revealed for the first time (immediately under reduced motion) */
  onTyped?: () => void;
}

export default function TypewriterBio({ onTyped }: TypewriterBioProps) {
  const reduceMotion = useReducedMotion();
  // Each run remounts the words; "still" shows them without the reveal
  const [run, setRun] = useState(0);
  const [mode, setMode] = useState<"play" | "still">(reduceMotion ? "still" : "play");
  const [done, setDone] = useState(!!reduceMotion);
  const boxRef = useRef<HTMLParagraphElement>(null);
  // Read when each run starts, so a rotated phone gets the right pacing on replay
  const compact = () => typeof window !== "undefined" && window.matchMedia(COMPACT_QUERY).matches;
  const [shift, setShift] = useState(() => (compact() ? SIGN_SHIFT : 0));
  const total = TOTAL_MS - Math.round(shift * 1000);

  useEffect(() => {
    if (reduceMotion) setMode("still");
  }, [reduceMotion]);

  // Report readiness once, and mark the run finished
  const told = useRef(false);
  useEffect(() => {
    if (mode === "still") {
      setDone(true);
      if (!told.current) { told.current = true; onTyped?.(); }
      return;
    }
    setDone(false);
    const ready = window.setTimeout(() => {
      if (!told.current) { told.current = true; onTyped?.(); }
    }, total);
    const end = window.setTimeout(() => setDone(true), total);
    return () => {
      window.clearTimeout(ready);
      window.clearTimeout(end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, mode]);

  const replay = () => {
    setShift(compact() ? SIGN_SHIFT : 0);
    setMode("play");
    setRun((r) => r + 1);
  };

  // A tap or click while revealing shows the whole text at once
  const finish = () => {
    if (!done) setMode("still");
  };

  // The reading light: words near the pointer warm up and lift slightly
  const frame = useRef(0);
  const light = useCallback((x: number, y: number, strength = 1) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const box = boxRef.current;
      if (!box) return;
      box.querySelectorAll<HTMLElement>("[data-word]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const dx = (x - (r.left + r.width / 2)) / 90;
        const dy = (y - (r.top + r.height / 2)) / 26;
        const g = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy)) * strength;
        el.style.setProperty("--g", g.toFixed(3));
      });
    });
  }, []);
  const dim = useCallback(() => {
    cancelAnimationFrame(frame.current);
    boxRef.current?.querySelectorAll<HTMLElement>("[data-word]").forEach((el) => el.style.setProperty("--g", "0"));
  }, []);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // Below md the body shows three lines and fades out on the third (words never split); the full text is always in
  // the page (visually hidden copy) and "View more" opens About Me
  const bodyClass =
    "block max-md:max-h-[calc(1.65em*3)] max-md:overflow-hidden max-md:[mask-image:linear-gradient(to_bottom,#000_55%,transparent)]";

  return (
    <p
      ref={boxRef}
      // Full-strength cream (15:1 on the base colour) plus a soft dark halo so it stays legible over the particles and photo edges
      className={`mx-auto max-w-[34rem] touch-pan-y text-center font-sans text-[14px] font-normal leading-[1.65] tracking-[0.005em] text-cream [text-shadow:0_1px_12px_rgba(21,6,0,0.95)] sm:text-[15px] lg:mx-0 lg:text-right xl:text-[15.5px] ${done ? "" : "cursor-pointer"}`}
      onPointerMove={(e) => light(e.clientX, e.clientY)}
      onPointerDown={(e) => {
        finish();
        light(e.clientX, e.clientY);
      }}
      onPointerLeave={dim}
      onPointerCancel={dim}
      onPointerUp={(e) => {
        if (e.pointerType !== "mouse") window.setTimeout(dim, 700);
      }}
    >
      <span className="sr-only">{`${BIO} ${SIGNOFF}`}</span>
      <span key={`b${run}`} aria-hidden="true" className={`${bodyClass} select-none`}>
        <Words words={bioWords} mode={mode} />
      </span>
      {/* The sign-off always sits on its own line, with the replay control after it */}
      <span className="mt-2.5 flex items-center justify-center gap-2.5 lg:justify-end">
        <span key={`s${run}`} aria-hidden="true" className="select-none font-bold tracking-wide text-tertiary">
          <Words words={signWords} mode={mode} shift={shift} />
        </span>
        {!reduceMotion && (
          <motion.button
            type="button"
            onClick={replay}
            onPointerDown={(e) => e.stopPropagation()}
            initial={false}
            animate={done ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.6, rotate: 90 }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{ visibility: done ? "visible" : "hidden" }}
            aria-label="Replay the bio animation"
            title="Replay"
            data-magnetic="0.3"
            className="group inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cream/25 bg-base/50 text-cream/75 backdrop-blur-sm transition-colors duration-200 hover:border-tertiary hover:bg-tertiary hover:text-base"
          >
            <RotateCcw size={13} aria-hidden="true" className="transition-transform duration-500 group-hover:-rotate-180" />
          </motion.button>
        )}
      </span>
    </p>
  );
}
