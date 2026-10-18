import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Shared scroll-reveal helpers (Caira case study, Content Design). */

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Words that rise out of a mask, one after another, when they scroll into view. */
export function RiseWords({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;
  // The wrapper is what's observed: the words start outside their clipping masks, so they'd never "intersect"
  return (
    <motion.span className={className} initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.5 }}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-top">
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: "110%" }, shown: { y: 0, transition: { duration: 0.7, delay: delay + i * 0.06, ease: EASE } } }}
          >
            {w}
            {" "}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Fade-and-rise on scroll, used for most blocks. */
export function Reveal({ children, className = "", delay = 0, y = 24 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

