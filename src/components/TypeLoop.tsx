import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Continuous typewriter: types the text, holds, erases, and types it again — forever — with a blinking caret.
 * The full text is laid out invisibly underneath so the block never changes height while it types.
 * Screen readers get the complete sentence once; reduced motion shows it static.
 */
const TYPE_MS = 42;
const ERASE_MS = 16;
const HOLD_FULL_MS = 7000;
const HOLD_EMPTY_MS = 500;

export default function TypeLoop({ text, className = "" }: { text: string; className?: string }) {
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    let delay = erasing ? ERASE_MS : TYPE_MS;
    if (!erasing && count === text.length) delay = HOLD_FULL_MS;
    if (erasing && count === 0) delay = HOLD_EMPTY_MS;
    // Small random jitter so the typing feels human rather than metronomic
    if (!erasing && count < text.length) delay += Math.random() * 40;
    const id = window.setTimeout(() => {
      if (!erasing && count === text.length) setErasing(true);
      else if (erasing && count === 0) setErasing(false);
      else setCount((c) => c + (erasing ? -1 : 1));
    }, delay);
    return () => window.clearTimeout(id);
  }, [count, erasing, text.length, reduceMotion]);

  const shown = reduceMotion ? text : text.slice(0, count);

  return (
    <span className={`relative block ${className}`}>
      <span className="sr-only">{text}</span>
      {/* Sizer: reserves the final height so nothing below jumps */}
      <span aria-hidden="true" className="invisible block">
        {text}
      </span>
      <span aria-hidden="true" className="absolute inset-0 block">
        {shown}
        <span className="fx-caret" />
      </span>
    </span>
  );
}
