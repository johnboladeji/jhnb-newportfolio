import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { hero } from "../content";

const BIO = hero.bio;
const SIGNOFF = hero.bioSignoff;
const TOTAL_CHARS = BIO.length + SIGNOFF.length;
// Stagger per character, capped so a long bio still finishes typing in ~6s
const CHAR_DELAY = Math.min(0.02, 6 / TOTAL_CHARS);
const CHAR_DURATION = 0.05;
// Replay once typing has finished and the full text has been readable for a while
const HOLD_MS = 8000;
const LOOP_MS = Math.round((TOTAL_CHARS * CHAR_DELAY + CHAR_DURATION) * 1000) + HOLD_MS;

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
  const [cycle, setCycle] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!onTyped) return;
    if (reduceMotion) {
      onTyped();
      return;
    }
    const id = window.setTimeout(onTyped, TYPED_MS);
    return () => window.clearTimeout(id);
    // Fire for the first typing pass only; later replays don't hide anything again
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setCycle((c) => c + 1), LOOP_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const signoffClass = "mt-2 block font-semibold tracking-wide text-tertiary";
  // Below md the body shows three lines and fades out on the third (no awkward "…" gap, since words never split);
  // the full text stays in aria-label and "View more" opens About Me
  const bodyClass =
    "block max-md:max-h-[calc(1.625em*3)] max-md:overflow-hidden max-md:[mask-image:linear-gradient(to_bottom,#000_55%,transparent)]";

  return (
    <p
      aria-label={`${BIO} ${SIGNOFF}`}
      // Full-strength cream (15:1 on the base colour) plus a soft dark halo so it stays legible over the particles and photo edges
      className="mx-auto max-w-[34rem] text-center font-sans text-[13px] font-medium leading-relaxed text-cream [text-shadow:0_1px_10px_rgba(21,6,0,0.9)] sm:text-sm lg:mx-0 lg:text-right"
    >
      {reduceMotion ? (
        <span aria-hidden="true">
          <span className={bodyClass}>{BIO}</span>
          <span className={signoffClass}>{SIGNOFF}</span>
        </span>
      ) : (
        <span key={cycle} aria-hidden="true">
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
