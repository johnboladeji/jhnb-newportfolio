import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { hero } from "../content";

const BIO = hero.bio;
const SIGNOFF = hero.bioSignoff;
const TOTAL_CHARS = BIO.length + SIGNOFF.length;
// Stagger per character (~12ms), capped so the whole bio finishes typing in about 4 seconds
const CHAR_DELAY = Math.min(0.012, 4 / TOTAL_CHARS);
const CHAR_DURATION = 0.05;
// Type once per visit: after the first pass the full text simply shows, even if the hero re-renders
const PLAYED_KEY = "jhnb-bio-typed";
const alreadyPlayed = () => {
  try {
    return sessionStorage.getItem(PLAYED_KEY) === "1";
  } catch {
    return false;
  }
};

/** Split text into words of indexed characters (indices continue from `start`) so lines only break at spaces. */
function toWords(text: string, start: number) {
  let index = start;
  const words = text.split(" ").map((word) => {
    const chars = word.split("").map((ch) => ({ ch, i: index++ }));
    index++; // account for the space
    return chars;
  });
  return { words, next: index };
}

const bioWords = toWords(BIO, 0);
const signoffWords = toWords(SIGNOFF, bioWords.next).words;
// The sign-off's last character finishes appearing at this point in each typing cycle
const signoffChars = signoffWords.flat();
const LAST_INDEX = signoffChars.length ? signoffChars[signoffChars.length - 1].i : 0;
const TYPED_MS = Math.round((LAST_INDEX * CHAR_DELAY + CHAR_DURATION) * 1000);

function Typed({ words }: { words: { ch: string; i: number }[][] }) {
  return (
    <>
      {words.map((chars, w) => (
        <span key={w} className="inline-block whitespace-nowrap">
          {chars.map(({ ch, i }) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * CHAR_DELAY, duration: CHAR_DURATION }}
            >
              {ch}
            </motion.span>
          ))}
          {w < words.length - 1 && " "}
        </span>
      ))}
    </>
  );
}

interface TypewriterBioProps {
  /** Called once, when "— Just Hold No Bounds." has finished typing for the first time (immediately under reduced motion) */
  onTyped?: () => void;
}

export default function TypewriterBio({ onTyped }: TypewriterBioProps) {
  const reduceMotion = useReducedMotion();
  // Decided once on mount, so a re-render never restarts the typing
  const [skip] = useState(alreadyPlayed);
  const still = reduceMotion || skip;

  useEffect(() => {
    if (still) {
      onTyped?.();
      return;
    }
    const id = window.setTimeout(() => {
      try {
        sessionStorage.setItem(PLAYED_KEY, "1");
      } catch {
        /* storage unavailable: it will simply type again next time */
      }
      onTyped?.();
    }, TYPED_MS);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [still]);

  const signoffClass = "mt-2 block font-semibold tracking-wide text-tertiary";
  // Below md the body shows three lines and fades out on the third (no awkward "…" gap, since words never split);
  // the full text is always in the page (visually hidden copy) and "View more" opens About Me
  const bodyClass =
    "block max-md:max-h-[calc(1.625em*3)] max-md:overflow-hidden max-md:[mask-image:linear-gradient(to_bottom,#000_55%,transparent)]";

  return (
    <p
      // Full-strength cream (15:1 on the base colour) plus a soft dark halo so it stays legible over the particles and photo edges
      className="mx-auto max-w-[34rem] text-center font-sans text-[13px] font-medium leading-relaxed text-cream [text-shadow:0_1px_10px_rgba(21,6,0,0.9)] sm:text-sm lg:mx-0 lg:text-right"
    >
      <span className="sr-only">{`${BIO} ${SIGNOFF}`}</span>
      {still ? (
        <span aria-hidden="true">
          <span className={bodyClass}>{BIO}</span>
          <span className={signoffClass}>{SIGNOFF}</span>
        </span>
      ) : (
        <span aria-hidden="true">
          <span className={bodyClass}>
            <Typed words={bioWords.words} />
          </span>
          {/* The sign-off always sits on its own line */}
          <span className={signoffClass}>
            <Typed words={signoffWords} />
          </span>
        </span>
      )}
    </p>
  );
}
