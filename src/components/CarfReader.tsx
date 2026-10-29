import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ScanSearch } from "lucide-react";
import { carfStudy } from "../content";
import RollText from "./RollText";

const R = carfStudy.reader;
const EASE = [0.2, 0.8, 0.2, 1] as const;

type Finding = { label: string; note: string };
type Piece = { text: string; n?: number };

/**
 * Match every rule, number the rules that fire in reading order, and cut the text into plain and highlighted
 * pieces (no overlaps).
 */
function read(text: string): { pieces: Piece[]; found: Finding[] } {
  const fired = R.rules
    .map((rule) => {
      const re = new RegExp(rule.match.source, rule.match.flags.includes("g") ? rule.match.flags : rule.match.flags + "g");
      return { rule, ms: [...text.matchAll(re)].filter((m) => m[0].length) };
    })
    .filter((f) => f.ms.length)
    .sort((a, b) => a.ms[0].index! - b.ms[0].index!);
  const found: Finding[] = fired.map(({ rule }) => ({ label: rule.label, note: rule.note }));
  const hits = fired.flatMap(({ ms }, i) => ms.map((m) => ({ start: m.index!, end: m.index! + m[0].length, n: i + 1 })));
  hits.sort((a, b) => a.start - b.start || b.end - a.end);
  const pieces: Piece[] = [];
  let at = 0;
  for (const h of hits) {
    if (h.start < at) continue;
    if (h.start > at) pieces.push({ text: text.slice(at, h.start) });
    pieces.push({ text: text.slice(h.start, h.end), n: h.n });
    at = h.end;
  }
  if (at < text.length) pieces.push({ text: text.slice(at) });
  return { pieces, found };
}

/**
 * CARF, light: paste interface copy (or pick a sample), press the button, and the phrases that carry an assumption
 * light up, each numbered against a short note. The result is announced; under reduced motion it appears still.
 */
export default function CarfReader() {
  const reduce = useReducedMotion();
  const id = useId();
  const [text, setText] = useState(R.samples[0]);
  const [result, setResult] = useState<ReturnType<typeof read> | null>(null);
  const [run, setRun] = useState(0);

  const analyze = (t: string) => {
    setResult(t.trim() ? read(t.trim()) : null);
    setRun((r) => r + 1);
  };

  return (
    <div className="grid gap-4 @xl:grid-cols-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          analyze(text);
        }}
        className="rounded-3xl bg-secondary p-5 @xl:p-6"
      >
        <label htmlFor={`${id}-in`} className="block font-sans text-[15px] font-bold text-cream">
          {R.inputLabel}
        </label>
        <textarea
          id={`${id}-in`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="mt-3 w-full resize-y rounded-2xl border border-cream/25 bg-base/40 p-3.5 font-sans text-[16px] leading-relaxed text-cream outline-none transition-colors placeholder:text-cream/40 focus:border-tertiary"
        />
        <div role="group" aria-label="Samples" className="mt-3 flex flex-wrap gap-2">
          {R.samples.map((s, i) => (
            <button
              key={s}
              type="button"
              aria-label={`Sample ${i + 1}: ${s}`}
              onClick={() => {
                setText(s);
                analyze(s);
              }}
              className={`min-h-9 rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] transition-colors ${
                text === s ? "border-tertiary text-tertiary" : "border-cream/30 text-cream/75 hover:border-tertiary hover:text-tertiary"
              }`}
            >
              SAMPLE {i + 1}
            </button>
          ))}
        </div>
        <button
          type="submit"
          data-magnetic="0.2"
          className="fx-spotlight group mt-5 inline-flex items-center gap-2 rounded-full bg-tertiary px-5 py-2.5 font-mono text-xs font-medium tracking-[0.15em] text-base transition-colors hover:bg-cream active:bg-primary active:text-cream"
        >
          <ScanSearch size={14} aria-hidden="true" />
          <RollText text={R.button.toUpperCase()} />
        </button>
      </form>

      <div aria-live="polite" className="rounded-3xl border border-cream/10 bg-base/50 p-5 @xl:p-6">
        {!result ? (
          <p className="font-serif text-lg italic leading-snug text-cream/60">{R.empty}</p>
        ) : (
          <motion.div key={run} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
            <p className="font-sans text-xl leading-relaxed text-cream">
              {result.pieces.map((p, i) =>
                p.n ? (
                  <mark key={i} className="rounded-[3px] border-b-[2.5px] border-primary-soft bg-primary/45 px-0.5 text-cream">
                    {p.text}
                    <sup aria-hidden="true" className="ml-0.5 font-mono text-[10px] text-tertiary">{p.n}</sup>
                  </mark>
                ) : (
                  <span key={i}>{p.text}</span>
                ),
              )}
            </p>
            {result.found.length ? (
              <ol className="mt-5 grid gap-2.5">
                {result.found.map((f, i) => (
                  <motion.li
                    key={f.label}
                    initial={reduce ? false : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 + i * 0.07, ease: EASE }}
                    className="flex gap-3 rounded-2xl border border-cream/10 bg-secondary/50 p-3.5"
                  >
                    <span aria-hidden="true" className="font-mono text-[11px] text-tertiary">
                      {i + 1}
                    </span>
                    <span>
                      <b className="block font-sans text-[15px] font-bold text-cream">{f.label}</b>
                      <span className="text-[14px] leading-snug text-cream/70">{f.note}</span>
                    </span>
                  </motion.li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 font-serif text-lg italic leading-snug text-cream/60">{R.none}</p>
            )}
          </motion.div>
        )}
        <p className="mt-5 border-t border-cream/10 pt-3 font-mono text-[10px] leading-relaxed tracking-[0.12em] text-cream/50">{R.limits.toUpperCase()}</p>
      </div>
    </div>
  );
}
