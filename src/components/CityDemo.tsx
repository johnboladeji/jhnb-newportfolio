import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { about } from "../content";

const EASE = [0.2, 0.8, 0.2, 1] as const;
const D = about.cityDemo;

/**
 * "Two cities read the same button." One "Try again" button, read in Chicago (safe advice) or Lagos (it can send
 * the money twice). Picking Lagos strikes the button and slides in the rewrite; the note under it is announced.
 */
export default function CityDemo() {
  const reduce = useReducedMotion();
  const [city, setCity] = useState(0);
  const id = useId();
  const lagos = D.cities[city].city === "Lagos";

  return (
    <section aria-labelledby={`${id}-q`} className="mb-6 rounded-2xl border border-cream/10 bg-base/35 p-5 sm:p-6">
      <p id={`${id}-q`} className="font-mono text-[10px] tracking-[0.2em] text-amber">
        {D.kicker.toUpperCase()}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        {/* The button under discussion: a picture of interface copy, not a control */}
        <p
          className={`inline-block rounded-xl bg-cream px-5 py-2.5 font-sans text-2xl font-bold tracking-tight text-base decoration-primary decoration-[3px] transition-[opacity,text-decoration-color] duration-500 sm:text-3xl ${
            lagos ? "line-through opacity-60" : ""
          }`}
        >
          “{D.button}”
        </p>
        <div role="group" aria-label="City" className="inline-flex shrink-0 rounded-full border border-cream/15 bg-base/40 p-1">
          {D.cities.map((c, i) => (
            <button
              key={c.city}
              type="button"
              aria-pressed={city === i}
              onClick={() => setCity(i)}
              className={`relative min-h-10 rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.18em] transition-colors ${
                city === i ? "text-cream" : "text-cream/60 hover:text-tertiary"
              }`}
            >
              {city === i && (
                <motion.span
                  layoutId={`${id}-pill`}
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative">{c.city.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {lagos && (
          <motion.div
            key="rewrite"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="pt-4 font-mono text-[10px] tracking-[0.2em] text-cream/60">{D.rewriteLabel.toUpperCase()}</p>
            <p className="mt-1 font-serif text-2xl italic leading-snug text-tertiary sm:text-[1.7rem]">{D.rewrite}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <p aria-live="polite" className="mt-4 max-w-[52ch] border-l-[3px] border-primary-soft pl-4 font-serif text-[17px] italic leading-snug text-cream/85">
        {D.cities[city].note}
      </p>
    </section>
  );
}
