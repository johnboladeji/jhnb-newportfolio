import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Check, Code2, Copy, Layers, Palette, Sparkles, Type, Users, Wand2 } from "lucide-react";
import { tokenStudy as T } from "../content";
import RollText from "./RollText";
import { Reveal, RiseWords } from "./Reveal";
import { LitWords, LiveRow, StudyBar, StudyChapter, pad, useStudyProgress, type LiveAccent, type StudyTone } from "./StudyKit";

/**
 * TokenForge case study. Same structure as Caira and NexusCore (shared StudyKit: sticky chapter bar, numbered
 * chapters, words that light up, LIVE rows), in TokenForge's own world: near-black ink, violet, lavender, Inter,
 * and the radiating "spoke burst" motif from the team's case study.
 *
 * Motion: a slowly turning spoke burst, a prompt that types itself, a 6+ hours → < 60 seconds swap, the problem
 * flowing into the solution, a four-phase process, a tappable SWOT, persona empathy maps, and an interactive
 * generator that turns an example prompt into a palette, type, spacing, and CSS / Tailwind / JSON exports.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;
const TF_TONE: StudyTone = {
  kicker: "text-tf-lav",
  rule: "bg-tf-violet/70",
  dot: "bg-tf-violet",
  progress: "bg-[linear-gradient(90deg,#9f46e5,#dee4fe)]",
  title: "font-inter font-bold tracking-tight",
};
const TF_LIVE: LiveAccent = {
  text: "text-tf-lav",
  fill: "bg-tf-violet",
  on: "text-white",
  tint: "bg-[radial-gradient(120%_160%_at_0%_0%,rgba(159,70,229,0.28),transparent_60%)]",
};
const CHAPTERS = ["Overview", "Problem & solution", "Who it's for", "Process", "The market", "Personas", "Visual language", "The product", "The team"];

function Chapter(props: { n: number; title?: string; onEnter: (n: number) => void; children: ReactNode }) {
  return <StudyChapter id="tokenforge" chapters={CHAPTERS} tone={TF_TONE} {...props} />;
}

/** The radiating spoke burst from TokenForge's visual language. */
function Burst({ className = "", spin = true }: { className?: string; spin?: boolean }) {
  const reduce = useReducedMotion();
  const n = 36;
  return (
    <motion.svg
      viewBox="-50 -50 100 100"
      aria-hidden="true"
      className={className}
      animate={reduce || !spin ? undefined : { rotate: 360 }}
      transition={{ duration: 60, ease: "linear", repeat: Infinity }}
    >
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const r1 = 22;
        const r2 = 44 - (i % 3) * 4;
        return <line key={i} x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * r2} y2={Math.sin(a) * r2} stroke="#9f46e5" strokeWidth="2.4" strokeLinecap="round" />;
      })}
    </motion.svg>
  );
}

/** The TokenForge mark (a violet F with a pennant cut into its stem), redrawn from the logo, plus the wordmark. */
export function TokenMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 68 120" aria-hidden="true" className={className}>
      <path d="M0 0 H64 V27 H28 V120 H0 Z" fill="#9f46e5" />
      <path d="M28 46 L67 76 L28 100 Z" fill="#9f46e5" />
      <path d="M28 58 L4 118" stroke="#6d28b5" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Mark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[0.45em] font-inter font-bold tracking-tight text-white ${className}`} aria-label="TokenForge">
      <TokenMark className="h-[1.1em] w-auto" />
      <span aria-hidden="true">TokenForge</span>
    </span>
  );
}

/** Types the example prompts one after another. */
function useTypedPrompt(prompts: string[]) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [n, setN] = useState(reduce ? prompts[0].length : 0);
  useEffect(() => {
    if (reduce) return;
    const full = prompts[i];
    if (n < full.length) {
      const id = window.setTimeout(() => setN(n + 1), 28);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => {
      setI((i + 1) % prompts.length);
      setN(0);
    }, 2600);
    return () => window.clearTimeout(id);
  }, [n, i, prompts, reduce]);
  return prompts[i].slice(0, n);
}

/* ------------------------------------------------------------------------------------------------ */
/* Cover                                                                                              */
/* ------------------------------------------------------------------------------------------------ */

export function TokenCover() {
  return (
    <div aria-hidden="true" className="relative h-full w-full overflow-hidden bg-tf-ink">
      <div className="absolute inset-0 bg-[radial-gradient(70%_80%_at_80%_20%,rgba(159,70,229,0.35),transparent_65%)]" />
      <Burst className="absolute -bottom-[18%] -left-[8%] w-[42%] opacity-80" />
      <span className="absolute left-[6%] top-[9%] font-mono text-xs tracking-[0.25em] text-tf-lav">03</span>
      <div className="absolute left-[6%] top-[22%]">
        <Mark className="text-[clamp(0.95rem,3.2vw,1.6rem)]" />
        <p className="mt-1 max-w-[12em] font-inter text-[clamp(0.55rem,1.6vw,0.8rem)] text-tf-grey">Brand idea → design tokens, in seconds</p>
      </div>
      {/* Token cards */}
      <div className="absolute right-[5%] top-1/2 w-[42%] -translate-y-1/2 space-y-[4%] transition-transform duration-700 ease-out group-hover:-translate-y-[54%]">
        <div className="flex gap-[4%] rounded-xl border border-white/10 bg-tf-panel p-[4%]">
          {["#9f46e5", "#c084fc", "#dee4fe", "#9fa1a9", "#ffffff"].map((c) => (
            <span key={c} className="aspect-square flex-1 rounded-md" style={{ background: c }} />
          ))}
        </div>
        <div className="flex items-end justify-between rounded-xl border border-white/10 bg-tf-panel p-[4%] font-inter text-white">
          <span className="text-[clamp(1.2rem,4vw,2.2rem)] font-bold leading-none">Aa</span>
          <span className="text-[clamp(0.45rem,1.3vw,0.65rem)] text-tf-grey">Inter · 24 / 1.2</span>
        </div>
        <div className="rounded-xl border border-tf-violet/50 bg-black/40 p-[4%] font-mono text-[clamp(0.45rem,1.3vw,0.7rem)] leading-relaxed text-tf-lav">
          --color-primary: <span className="text-white">#9F46E5</span>;
          <br />
          --radius-md: <span className="text-white">10px</span>;
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* Hero                                                                                               */
/* ------------------------------------------------------------------------------------------------ */

function Hero() {
  const typed = useTypedPrompt(T.prompts);
  return (
    <div className="relative isolate overflow-hidden rounded-3xl bg-tf-ink p-5 text-white @xl:p-8">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(70%_70%_at_85%_10%,rgba(159,70,229,0.32),transparent_60%)]" />
      <Burst className="absolute -right-16 -top-16 -z-10 w-56 opacity-50 @xl:w-72" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Mark className="text-xl" />
        <span className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 font-inter text-xs text-tf-lav">
          <span className="caira-ping h-2 w-2 rounded-full bg-tf-violet" aria-hidden="true" />
          {T.statusPill}
        </span>
      </div>
      <p className="mt-8 font-mono text-[11px] tracking-[0.15em] text-tf-lav">{T.kicker.toUpperCase()}</p>
      <h3 className="mt-3 max-w-[18ch] font-inter text-[clamp(2rem,7.5cqw,3.6rem)] font-bold leading-[1.05] tracking-[-0.02em]">
        <RiseWords text={T.headline[0]} />
        <RiseWords text={T.headline[1]} className="text-tf-violet" delay={0.3} />
      </h3>
      <Reveal delay={0.3} y={12}>
        <p className="mt-4 max-w-[52ch] font-inter text-[16px] leading-relaxed text-tf-grey">{T.oneLine}</p>
      </Reveal>
      {/* The prompt box, typing the app's own example prompts */}
      <Reveal delay={0.4} className="mt-6">
        <div className="rounded-2xl border border-white/10 bg-tf-panel p-4">
          <p className="min-h-[3.2em] font-inter text-[15px] leading-relaxed text-white/90" aria-label={T.prompts[0]}>
            <span aria-hidden="true">
              {typed}
              <span className="fx-caret" />
            </span>
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[10px] tracking-[0.15em] text-tf-grey">EXPORT TO CSS · TAILWIND · JSON</span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-tf-violet px-4 py-2 font-inter text-sm font-bold">
              <Sparkles size={14} aria-hidden="true" /> Generate design system
            </span>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* Sections                                                                                           */
/* ------------------------------------------------------------------------------------------------ */

function ProblemSolution() {
  const reduce = useReducedMotion();
  return (
    <div className="mt-8 grid gap-4 @3xl:grid-cols-[1fr_auto_1fr] @3xl:items-center">
      <Reveal>
        <div className="rounded-2xl border border-white/10 bg-tf-ink p-5">
          <p className="font-mono text-[10px] tracking-[0.2em] text-tf-grey">PROBLEM</p>
          <p className="mt-2 font-inter text-[15px] leading-relaxed text-white/85">{T.problem}</p>
        </div>
      </Reveal>
      <svg viewBox="0 0 60 60" className="mx-auto h-12 w-12 rotate-90 @3xl:rotate-0" aria-hidden="true">
        <motion.path
          d="M4 30 C 20 6, 40 54, 56 30"
          fill="none"
          stroke="#9f46e5"
          strokeWidth="2"
          strokeDasharray="3 4"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        />
      </svg>
      <Reveal delay={0.2}>
        <div className="rounded-2xl border border-tf-violet/50 bg-[linear-gradient(160deg,rgba(159,70,229,0.25),rgba(15,15,18,0.9))] p-5">
          <p className="font-mono text-[10px] tracking-[0.2em] text-tf-lav">SOLUTION</p>
          <p className="mt-2 font-inter text-[15px] leading-relaxed text-white/90">{T.solution}</p>
        </div>
      </Reveal>
    </div>
  );
}

function Speed() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const after = reduce || inView;
  return (
    <div ref={ref} className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl bg-tf-violet p-5 text-white">
      <span className="relative font-inter text-4xl font-bold leading-none @xl:text-5xl">
        {T.speed.from}
        <motion.span
          aria-hidden="true"
          className="absolute left-0 right-0 top-1/2 h-1 origin-left rounded bg-white"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: after ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />
      </span>
      <span className="font-mono text-lg">→</span>
      <motion.span
        className="font-inter text-4xl font-bold leading-none @xl:text-5xl"
        initial={reduce ? false : { opacity: 0, scale: 0.8 }}
        animate={after ? { opacity: 1, scale: 1 } : undefined}
        transition={{ delay: 0.8, type: "spring", stiffness: 260, damping: 18 }}
      >
        {T.speed.to}
      </motion.span>
      <span className="w-full font-mono text-[11px] tracking-[0.15em] text-white/80">{T.speed.note.toUpperCase()}</span>
    </div>
  );
}

function Audiences() {
  const icons = [Palette, Code2, Users];
  return (
    <ul className="mt-8 grid gap-3 @xl:grid-cols-3">
      {T.audiences.map((a, i) => {
        const Icon = icons[i % icons.length];
        return (
          <Reveal key={a.name} delay={i * 0.08} y={20}>
            <li className="group h-full rounded-2xl border border-white/10 bg-tf-ink p-5 transition-colors hover:border-tf-violet/60">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tf-violet/20 text-tf-lav transition-transform group-hover:-rotate-6">
                <Icon size={18} aria-hidden="true" />
              </span>
              <p className="mt-4 font-inter text-lg font-bold text-white">{a.name}</p>
              <p className="mt-1 font-inter text-[14px] leading-relaxed text-tf-grey">{a.text}</p>
            </li>
          </Reveal>
        );
      })}
    </ul>
  );
}

function Process() {
  const reduce = useReducedMotion();
  return (
    <ol className="mt-8 grid gap-3 @3xl:grid-cols-4">
      {T.process.map((p, i) => (
        <motion.li
          key={p.phase}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: i * 0.12, ease: EASE }}
          className="rounded-2xl border border-white/10 bg-tf-ink p-4"
        >
          <span className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-tf-violet font-mono text-xs text-white">{pad(i + 1)}</span>
            <span className="font-inter text-[15px] font-bold leading-tight text-white">{p.phase}</span>
          </span>
          <ul className="mt-3 space-y-1.5 border-l border-dashed border-tf-violet/50 pl-3">
            {p.steps.map((s) => (
              <li key={s} className="rounded-md bg-white/5 px-2.5 py-1 font-inter text-[12.5px] text-tf-lav/90">{s}</li>
            ))}
          </ul>
        </motion.li>
      ))}
    </ol>
  );
}

function Market() {
  const [q, setQ] = useState(0);
  const colors = ["#9f46e5", "#6366f1", "#14b8a6", "#ca8a04"];
  const S = T.swot[q];
  return (
    <>
      <ul className="mt-8 grid gap-2 @xl:grid-cols-2">
        {T.competitors.map((c, i) => (
          <Reveal key={c.name} delay={i * 0.06} y={14}>
            <li className="h-full rounded-2xl border border-white/10 bg-tf-ink p-4">
              <p className="font-inter text-[15px] font-bold text-white">{c.name}</p>
              <p className="font-mono text-[10px] tracking-[0.12em] text-tf-lav">{c.kind.toUpperCase()}</p>
              <p className="mt-1.5 font-inter text-[13.5px] leading-relaxed text-tf-grey">{c.text}</p>
            </li>
          </Reveal>
        ))}
      </ul>
      <Reveal className="mt-6">
        <blockquote className="border-l-4 border-tf-violet pl-5 font-inter text-xl font-medium leading-snug text-cream @xl:text-2xl">
          <span className="mb-2 block font-mono text-[10px] tracking-[0.2em] text-tf-lav">THE GAP</span>
          {T.gap}
        </blockquote>
      </Reveal>
      <p className="mt-10 font-mono text-[10px] tracking-[0.2em] text-cream/55">SWOT · TAP A QUADRANT</p>
      <div className="mt-3 grid gap-4 @xl:grid-cols-[13rem_1fr]">
        <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="SWOT">
          {T.swot.map((s, i) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={q === i}
              onClick={() => setQ(i)}
              className={`flex aspect-square flex-col items-start justify-between rounded-2xl border-2 p-3 text-left transition-all ${q === i ? "scale-[1.03] bg-white/10" : "bg-tf-ink hover:bg-white/5"}`}
              style={{ borderColor: q === i ? colors[i] : "rgba(255,255,255,0.1)" }}
            >
              <span className="font-inter text-3xl font-bold leading-none text-white">{s.key}</span>
              <span className="font-mono text-[9px] tracking-[0.12em] text-tf-lav">{s.name.toUpperCase()}</span>
            </button>
          ))}
        </div>
        <div className="rounded-2xl border-2 bg-tf-ink p-5" style={{ borderColor: colors[q] }} aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div key={S.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              <p className="font-inter text-2xl font-bold text-white">{S.name}</p>
              <ul className="mt-3 space-y-2">
                {S.points.map((p, k) => (
                  <motion.li key={p} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + k * 0.06 }} className="flex gap-2 font-inter text-[14px] leading-relaxed text-white/85">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: colors[q] }} />
                    {p}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

function Personas() {
  const [p, setP] = useState(0);
  const P = T.personas[p];
  const quads: [keyof typeof P.map, string][] = [
    ["says", "Says"],
    ["thinks", "Thinks"],
    ["feels", "Feels"],
    ["does", "Does"],
  ];
  return (
    <div className="mt-8">
      <div role="tablist" aria-label="Personas" className="flex flex-wrap gap-2">
        {T.personas.map((x, i) => (
          <button
            key={x.name}
            type="button"
            role="tab"
            aria-selected={p === i}
            onClick={() => setP(i)}
            className={`relative flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 font-inter text-sm font-bold transition-colors ${p === i ? "text-white" : "border border-white/15 text-cream/70 hover:text-tf-lav"}`}
          >
            {p === i && <motion.span layoutId="tf-persona" className="absolute inset-0 rounded-full bg-tf-violet" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-[11px]">{x.name.split(" ").map((w) => w[0]).join("")}</span>
            <span className="relative">{x.name}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={P.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="mt-4 grid gap-4 @3xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-tf-ink p-5">
            <p className="font-mono text-[10px] tracking-[0.2em] text-tf-lav">{P.who.toUpperCase()}</p>
            <p className="mt-2 font-inter text-[15px] leading-relaxed text-white/90">{P.motivation}</p>
            <p className="mt-4 font-mono text-[10px] tracking-[0.2em] text-tf-grey">GOALS</p>
            <ul className="mt-2 space-y-1.5">
              {P.goals.map((g) => (
                <li key={g} className="flex gap-2 font-inter text-[14px] text-white/85">
                  <Check size={14} className="mt-0.5 shrink-0 text-tf-lav" aria-hidden="true" />
                  {g}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-[10px] tracking-[0.2em] text-tf-grey">PAIN POINTS</p>
            <ul className="mt-2 space-y-1.5">
              {P.pains.map((g) => (
                <li key={g} className="flex gap-2 font-inter text-[14px] text-white/75">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-tf-violet" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
          {/* Empathy map */}
          <div className="relative grid grid-cols-2 gap-2">
            {quads.map(([k, label], i) => (
              <motion.div
                key={k}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-tf-panel p-3"
              >
                <p className="inline-block rounded-full border border-tf-violet/60 px-2.5 py-0.5 font-mono text-[10px] tracking-[0.15em] text-tf-lav">{label.toUpperCase()}</p>
                <ul className="mt-2 space-y-1.5">
                  {P.map[k].map((line) => (
                    <li key={line} className="font-inter text-[12.5px] leading-snug text-white/80">
                      {k === "says" ? `“${line}”` : line}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
            <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-tf-violet bg-tf-ink font-inter text-sm font-bold text-white">
              {P.name.split(" ").map((w) => w[0]).join("")}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StyleGuide() {
  const [copied, setCopied] = useState("");
  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      window.setTimeout(() => setCopied(""), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="mt-8 grid gap-4 @3xl:grid-cols-2">
      <Reveal>
        <div className="h-full rounded-2xl border border-white/10 bg-tf-ink p-5">
          <p className="font-mono text-[10px] tracking-[0.2em] text-tf-grey">TYPOGRAPHY</p>
          <p className="mt-2 font-inter text-7xl font-bold leading-none text-tf-violet">{T.style.font}</p>
          <p className="mt-3 font-inter text-[14px] leading-relaxed text-white/80">{T.style.fontNote}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {T.style.weights.map((w, i) => (
              <span key={w} className="rounded-full border border-white/15 px-3 py-1 font-inter text-[12px] text-white" style={{ fontWeight: [400, 500, 600, 700][i] }}>
                {w}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="h-full rounded-2xl border border-white/10 bg-tf-ink p-5">
          <p className="font-mono text-[10px] tracking-[0.2em] text-tf-grey">COLOUR · TAP TO COPY</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {T.style.colours.map((c, i) => (
              <motion.button
                key={c}
                type="button"
                onClick={() => copy(c)}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                aria-label={`Copy ${c}`}
                className="group text-left"
              >
                <span className="block aspect-square rounded-xl border border-white/10" style={{ background: c }} />
                <span className="mt-1.5 flex items-center gap-1 font-mono text-[10px] text-tf-lav">
                  {copied === c ? <Check size={10} aria-hidden="true" /> : <Copy size={10} className="opacity-60" aria-hidden="true" />}
                  {copied === c ? "Copied" : c}
                </span>
              </motion.button>
            ))}
          </div>
          <p className="sr-only" aria-live="polite">{copied ? `Copied ${copied}` : ""}</p>
          <div className="mt-5 flex items-center gap-4">
            <Burst className="h-16 w-16" />
            <p className="font-inter text-[13px] leading-relaxed text-tf-grey">The spoke burst: the case study's recurring motif, a system radiating from one idea.</p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* The product: an illustrative generator                                                             */
/* ------------------------------------------------------------------------------------------------ */

const SYSTEMS = [
  { label: "Fintech", mood: "Professional", font: "Inter", radius: 8, palette: { primary: "#4F46E5", secondary: "#0EA5E9", accent: "#10B981", surface: "#F8FAFC", text: "#0F172A" } },
  { label: "Fitness", mood: "Bold", font: "Outfit", radius: 16, palette: { primary: "#F97316", secondary: "#EF4444", accent: "#FACC15", surface: "#FFF7ED", text: "#1C1917" } },
  { label: "Healthcare", mood: "Calm", font: "Merriweather", radius: 12, palette: { primary: "#0D9488", secondary: "#5EEAD4", accent: "#94A3B8", surface: "#F0FDFA", text: "#134E4A" } },
];

function exportCode(s: (typeof SYSTEMS)[number], fmt: number) {
  const p = s.palette;
  if (fmt === 0)
    return `:root {\n${Object.entries(p).map(([k, v]) => `  --color-${k}: ${v};`).join("\n")}\n  --font-sans: "${s.font}";\n  --radius-md: ${s.radius}px;\n}`;
  if (fmt === 1)
    return `theme: {\n  extend: {\n    colors: {\n${Object.entries(p).map(([k, v]) => `      ${k}: "${v}",`).join("\n")}\n    },\n    borderRadius: { md: "${s.radius}px" },\n  },\n}`;
  return JSON.stringify({ color: p, font: { sans: s.font }, radius: { md: s.radius } }, null, 2);
}

function Generator() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [fmt, setFmt] = useState(0);
  const [run, setRun] = useState(0);
  const s = SYSTEMS[i];
  const pick = (k: number) => {
    setI(k);
    setRun((r) => r + 1);
  };
  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-tf-ink">
      <div className="border-b border-white/10 p-4 @xl:p-5">
        <p className="font-mono text-[10px] tracking-[0.2em] text-tf-lav">TRY AN EXAMPLE · ILLUSTRATIVE DEMO</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SYSTEMS.map((x, k) => (
            <button
              key={x.label}
              type="button"
              aria-pressed={i === k}
              onClick={() => pick(k)}
              className={`rounded-xl px-3 py-2 text-left font-inter text-[13px] transition-colors ${i === k ? "bg-tf-violet text-white" : "bg-white/5 text-white/75 hover:bg-white/10"}`}
            >
              <span className="block font-bold">{x.label}</span>
              <span className="block text-[11px] opacity-80">Mood: {x.mood}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 font-inter text-[14px] text-white/80">
          <Wand2 size={13} className="mr-1.5 inline text-tf-lav" aria-hidden="true" />
          {T.prompts[i]}
        </p>
      </div>

      <div className="grid gap-px bg-white/10 @3xl:grid-cols-[1.1fr_1fr]">
        {/* Generated system */}
        <div key={run} className="bg-tf-ink p-4 @xl:p-5">
          <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-tf-grey">
            <Palette size={11} aria-hidden="true" /> COLOUR ROLES
          </p>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {Object.entries(s.palette).map(([k, v], n) => (
              <motion.span key={k} initial={reduce ? false : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: n * 0.07, type: "spring", stiffness: 300, damping: 20 }}>
                <span className="block aspect-[4/5] rounded-lg border border-white/10" style={{ background: v }} />
                <span className="mt-1 block truncate font-mono text-[9px] text-tf-lav">{k}</span>
              </motion.span>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-tf-grey">
            <Type size={11} aria-hidden="true" /> TYPE SCALE · {s.font.toUpperCase()}
          </p>
          <div className="mt-1.5 flex items-end gap-3 text-white">
            {[30, 22, 16, 12].map((size, n) => (
              <motion.span key={size} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + n * 0.06 }} className="font-bold leading-none" style={{ fontSize: size }}>
                Aa
              </motion.span>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-tf-grey">
            <Layers size={11} aria-hidden="true" /> SPACING · RADIUS {s.radius}px
          </p>
          <div className="mt-1.5 flex items-end gap-1.5">
            {[4, 8, 12, 16, 24, 32, 48].map((sp, n) => (
              <motion.span
                key={sp}
                initial={reduce ? false : { height: 0 }}
                animate={{ height: sp }}
                transition={{ delay: 0.45 + n * 0.05, duration: 0.4 }}
                className="w-3 rounded-sm"
                style={{ background: s.palette.primary }}
              />
            ))}
          </div>
          {/* A component in the generated style */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-4 p-3"
            style={{ background: s.palette.surface, borderRadius: s.radius, color: s.palette.text }}
          >
            <p className="text-sm font-bold">Welcome back</p>
            <span className="mt-2 block h-6 border" style={{ borderRadius: s.radius / 2, borderColor: s.palette.accent }} />
            <span className="mt-2 block py-1.5 text-center text-xs font-bold text-white" style={{ background: s.palette.primary, borderRadius: s.radius }}>
              Sign in
            </span>
          </motion.div>
        </div>
        {/* Export */}
        <div className="bg-tf-panel p-4 @xl:p-5">
          <div role="group" aria-label="Export format" className="flex gap-1.5">
            {["CSS", "Tailwind", "JSON"].map((f, k) => (
              <button
                key={f}
                type="button"
                aria-pressed={fmt === k}
                onClick={() => setFmt(k)}
                className={`relative rounded-lg px-3 py-1.5 font-mono text-[11px] transition-colors ${fmt === k ? "text-white" : "text-tf-grey hover:text-tf-lav"}`}
              >
                {fmt === k && <motion.span layoutId="tf-fmt" className="absolute inset-0 rounded-lg bg-tf-violet" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                <span className="relative">{f}</span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.pre
              key={`${i}-${fmt}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 overflow-x-auto rounded-xl bg-black/50 p-3 font-mono text-[11.5px] leading-relaxed text-tf-lav"
            >
              {exportCode(s, fmt)}
            </motion.pre>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Steps() {
  return (
    <ol className="mt-8 grid gap-2 @xl:grid-cols-2">
      {T.steps.map((s, i) => (
        <Reveal key={s.name} delay={i * 0.07} y={14}>
          <li className="flex h-full gap-3 rounded-2xl border border-white/10 bg-tf-ink p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-tf-violet font-mono text-xs text-tf-lav">{i + 1}</span>
            <span>
              <span className="block font-inter text-[15px] font-bold text-white">{s.name}</span>
              <span className="mt-0.5 block font-inter text-[13.5px] leading-relaxed text-tf-grey">{s.text}</span>
            </span>
          </li>
        </Reveal>
      ))}
    </ol>
  );
}

function Workstation() {
  return (
    <div className="mt-6 grid gap-2 @xl:grid-cols-3">
      {T.workstation.map((w, i) => (
        <Reveal key={w.panel} delay={i * 0.08} y={14}>
          <div className="h-full rounded-2xl border border-dashed border-tf-violet/50 p-4">
            <p className="font-mono text-[10px] tracking-[0.15em] text-tf-lav">PANEL {i + 1}</p>
            <p className="mt-1 font-inter text-[15px] font-bold text-white">{w.panel}</p>
            <p className="mt-1 font-inter text-[13.5px] leading-relaxed text-tf-grey">{w.text}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* The study                                                                                          */
/* ------------------------------------------------------------------------------------------------ */

export default function TokenStudy({ scrollRef, onLetsWork }: { scrollRef?: RefObject<HTMLElement | null>; onLetsWork: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);
  const progress = useStudyProgress(scrollRef, rootRef);
  const live = T.facts.find((f) => "url" in f && f.url);
  const facts = T.facts.filter((f) => f !== live);

  return (
    <div ref={rootRef} className="@container">
      <StudyBar id="tokenforge" label="TOKENFORGE · CASE STUDY" chapters={CHAPTERS} chapter={chapter} progress={progress} tone={TF_TONE} />
      <Hero />

      <Chapter n={1} onEnter={setChapter}>
        <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-cream/10 bg-cream/10 @md:grid-cols-2 @3xl:grid-cols-3">
          {facts.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.05} y={14} className={`bg-secondary p-5 ${i === facts.length - 1 && facts.length % 2 ? "@md:col-span-2 @3xl:col-span-1" : ""}`}>
              <dt className="font-mono text-[10px] tracking-[0.2em] text-tf-lav">{f.label.toUpperCase()}</dt>
              <dd className="mt-1.5 font-inter text-[15px] font-medium leading-snug text-cream">{f.value}</dd>
            </Reveal>
          ))}
          {live && "url" in live && live.url && <LiveRow label={live.label} value={live.value} url={live.url} accent={TF_LIVE} />}
        </dl>
        <dl className="mt-3">
          <LiveRow label="Full case study on Behance" value="behance.net · TokenForge" url={T.behance} accent={TF_LIVE} framed />
        </dl>
      </Chapter>

      <Chapter n={2} title="Hours of setup, or one sentence" onEnter={setChapter}>
        <ProblemSolution />
        <Speed />
      </Chapter>

      <Chapter n={3} title="Built for three kinds of builder" onEnter={setChapter}>
        <Audiences />
      </Chapter>

      <Chapter n={4} title="User-centred, and iterative" onEnter={setChapter}>
        <Process />
      </Chapter>

      <Chapter n={5} title="Where the market stops short" onEnter={setChapter}>
        <Market />
      </Chapter>

      <Chapter n={6} title="The designer and the developer" onEnter={setChapter}>
        <Personas />
      </Chapter>

      <Chapter n={7} title="Clean, precise, and violet" onEnter={setChapter}>
        <StyleGuide />
      </Chapter>

      <Chapter n={8} title="From a sentence to a system" onEnter={setChapter}>
        <Generator />
        <Steps />
        <Workstation />
      </Chapter>

      <Chapter n={9} title="Ten people, four weeks" onEnter={setChapter}>
        <LitWords
          text="TokenForge was a team build for the Dev & Design Academy capstone: research, flows, a full design system, an AI-backed product, testing, and a live launch, in four weeks."
          scrollRef={scrollRef}
          className="mt-6 font-inter text-2xl font-medium leading-snug tracking-tight text-cream @xl:text-3xl"
        />
        <ul className="mt-8 flex flex-wrap gap-2">
          {T.team.map((m, i) => (
            <motion.li
              key={m}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-full px-3.5 py-1.5 font-inter text-[13px] ${m.startsWith("John B. Oladeji") ? "bg-tf-violet font-bold text-white" : "border border-cream/15 text-cream/80"}`}
            >
              {m}
            </motion.li>
          ))}
        </ul>
      </Chapter>

      <Reveal className="mt-12 flex flex-wrap items-center gap-3">
        <a
          href={T.url}
          target="_blank"
          rel="noopener noreferrer"
          data-magnetic="0.2"
          className="fx-spotlight group inline-flex items-center gap-2 rounded-full bg-tf-violet px-5 py-2.5 font-mono text-xs font-medium tracking-[0.15em] text-white transition-colors hover:bg-tertiary hover:text-base active:bg-primary active:text-cream"
        >
          <RollText text="TRY TOKENFORGE" />
          <Sparkles size={14} aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={onLetsWork}
          data-magnetic="0.2"
          className="fx-spotlight group inline-flex items-center gap-2 rounded-full border border-cream/25 px-5 py-2.5 font-mono text-xs font-medium tracking-[0.15em] text-cream transition-colors hover:border-tertiary hover:bg-tertiary hover:text-base active:border-primary active:bg-primary active:text-cream"
        >
          <RollText text="START SOMETHING SIMILAR" />
        </button>
      </Reveal>
    </div>
  );
}
