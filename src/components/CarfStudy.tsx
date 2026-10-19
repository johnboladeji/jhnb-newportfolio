import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Circle, Loader } from "lucide-react";
import { carfStudy as C } from "../content";
import RollText from "./RollText";
import { Reveal, RiseWords } from "./Reveal";
import { LitWords, StudyBar, StudyChapter, pad, useStudyProgress, type StudyTone } from "./StudyKit";

/**
 * CARF research case study. The researched twin of the Caira study (same StudyKit: sticky chapter bar, numbered
 * chapters, words that light up), dressed as a manuscript in the site's own palette: Newsreader italics, amber
 * labels, peach accents, and paper cards for the interface language under study.
 *
 * Motion: two onboarding screens that read the same rule in opposite registers, the CTDA layers peeling apart,
 * a review count that climbs to 37,460, a dimension switcher, the five pathways lighting in sequence, and a
 * status list that ticks itself off. Everything is static under reduced motion.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;
const CARF_TONE: StudyTone = {
  kicker: "text-amber",
  rule: "bg-amber/60",
  dot: "bg-amber",
  progress: "bg-[linear-gradient(90deg,#983a28,#ffd0a1)]",
  title: "font-serif italic font-normal",
};
const CHAPTERS = ["The question", "The argument", "The corpus", "Method", "The framework", "Research questions", "Where it stands", "Related work"];

function Chapter(props: { n: number; title?: string; onEnter: (n: number) => void; children: ReactNode }) {
  return <StudyChapter id="carf" chapters={CHAPTERS} tone={CARF_TONE} {...props} />;
}

function CountUp({ to }: { to: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce) {
      setV(to);
      return;
    }
    if (!inView) return;
    const c = animate(0, to, { duration: 1.8, ease: EASE, onUpdate: setV });
    return () => c.stop();
  }, [inView, to, reduce]);
  return (
    <span ref={ref} className="tabular-nums">
      {Math.round(v).toLocaleString("en-US")}
    </span>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* Cover (Selected Works list)                                                                        */
/* ------------------------------------------------------------------------------------------------ */

export function CarfCover() {
  return (
    <div aria-hidden="true" className="relative h-full w-full overflow-hidden bg-[linear-gradient(150deg,#2a0d03_0%,#150600_70%)]">
      <div className="absolute inset-0 opacity-[0.1] [background-image:radial-gradient(#f1e6ce_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="absolute -right-[10%] -top-[20%] h-[110%] w-[60%] rounded-full bg-[radial-gradient(circle,rgba(242,166,90,0.3),transparent_65%)] blur-3xl" />
      <span className="absolute left-[6%] top-[9%] font-mono text-xs tracking-[0.25em] text-amber">04</span>
      {/* The same rule, two registers */}
      <div className="absolute right-[6%] top-1/2 w-[44%] -translate-y-1/2 space-y-[5%] font-sans text-[clamp(0.5rem,1.4vw,0.75rem)] leading-snug transition-transform duration-700 ease-out group-hover:-translate-y-[54%]">
        <div className="rotate-[-2deg] rounded-lg bg-cream p-[5%] text-base shadow-xl">
          <span className="font-mono text-[0.8em] text-primary">LAGOS</span>
          <p className="mt-1">Any information that cannot be matched may restrict your account.</p>
        </div>
        <div className="translate-x-[8%] rotate-[2deg] rounded-lg bg-tertiary p-[5%] text-base shadow-xl">
          <span className="font-mono text-[0.8em] text-primary">CHICAGO</span>
          <p className="mt-1">We just need to confirm who&apos;s signing up.</p>
        </div>
      </div>
      <span className="text-stroke absolute bottom-[6%] left-[5%] font-display text-[clamp(3.25rem,11vw,6.5rem)] uppercase leading-[0.85] transition-transform duration-700 ease-out group-hover:-translate-y-1">
        CARF
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* Sections                                                                                           */
/* ------------------------------------------------------------------------------------------------ */

function Hero() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-cream/10 bg-[linear-gradient(150deg,rgba(152,58,40,0.35),rgba(21,6,0,0.6))] p-6 @xl:p-8">
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.08] [background-image:repeating-linear-gradient(0deg,#f1e6ce_0_1px,transparent_1px_28px)]" />
      <p className="relative font-mono text-[11px] tracking-[0.25em] text-amber">RESEARCH · M.A. THESIS</p>
      <p className="text-stroke relative mt-4 font-display text-[clamp(4rem,18cqw,8rem)] uppercase leading-[0.85]">{C.name}</p>
      <h3 className="relative mt-3 font-serif text-[clamp(1.5rem,5cqw,2.4rem)] italic leading-tight text-tertiary">
        <RiseWords text={C.fullName} />
      </h3>
      <Reveal delay={0.3} y={10}>
        <p className="relative mt-4 max-w-[44ch] font-sans text-[17px] leading-relaxed text-cream/85">{C.line}</p>
      </Reveal>
      <dl className="relative mt-8 grid gap-px overflow-hidden rounded-2xl border border-cream/10 bg-cream/10 @md:grid-cols-2">
        {C.facts.map((f, i) => (
          <Reveal key={f.label} delay={0.35 + i * 0.05} y={10} className="bg-base/80 p-4">
            <dt className="font-mono text-[10px] tracking-[0.2em] text-amber">{f.label.toUpperCase()}</dt>
            <dd className="mt-1 text-[15px] font-medium leading-snug text-cream">{f.value}</dd>
          </Reveal>
        ))}
      </dl>
    </div>
  );
}

function Screen({ city, text, reading, tilt, delay }: { city: string; text: string; reading: string; tilt: number; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.figure
      initial={reduce ? false : { opacity: 0, y: 30, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className="rounded-[1.6rem] border-[5px] border-[#0b0402] bg-cream p-4 text-base shadow-[0_24px_50px_-26px_rgba(0,0,0,0.9)]"
    >
      <p className="font-mono text-[10px] tracking-[0.2em] text-primary">{city.toUpperCase()} · VERIFY YOUR IDENTITY</p>
      <p className="mt-3 font-sans text-[16px] font-medium leading-snug">{text}</p>
      <span className="mt-4 block h-9 rounded-lg bg-base/90" />
      <figcaption className="mt-4 border-t border-base/15 pt-3 font-serif text-[15px] italic text-primary">{reading}</figcaption>
    </motion.figure>
  );
}

function Question({ scrollRef }: { scrollRef?: RefObject<HTMLElement | null> }) {
  const Q = C.question;
  return (
    <>
      <div className="mt-8 grid gap-5 @xl:grid-cols-2">
        <Screen {...Q.lagos} tilt={-1.5} delay={0} />
        <Screen {...Q.chicago} tilt={1.5} delay={0.15} />
      </div>
      <p className="mt-3 text-center font-mono text-[10px] tracking-[0.15em] text-cream/50">PARAPHRASED FROM THE TWO ONBOARDING FLOWS</p>
      <Reveal className="mt-8">
        <p className="font-serif text-2xl italic text-tertiary">{Q.contrast}</p>
      </Reveal>
      <LitWords text={Q.ask} scrollRef={scrollRef} className="mt-4 font-sans text-2xl font-bold leading-snug tracking-tight text-cream @xl:text-3xl" />
    </>
  );
}

function Argument() {
  return (
    <>
      <Reveal>
        <p className="mt-6 max-w-[64ch] text-[16px] leading-relaxed text-cream/85">{C.argument.lead}</p>
      </Reveal>
      <ol className="mt-6 grid gap-3 @3xl:grid-cols-3">
        {C.argument.parts.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.08} y={20}>
            <li className="group h-full rounded-2xl border border-cream/10 bg-base/30 p-5 transition-colors hover:border-tertiary/40">
              <span className="text-stroke font-display text-4xl leading-none transition-colors group-hover:text-primary-soft">{pad(i + 1)}</span>
              <p className="mt-3 font-serif text-2xl italic text-tertiary">{p.name}</p>
              <p className="mt-1 text-[14.5px] leading-relaxed text-cream/80">{p.text}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </>
  );
}

function Corpus() {
  const reduce = useReducedMotion();
  const col = (title: string, code: string, rows: { name: string; kind: string }[], d: number) => (
    <div>
      <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-amber">
        <span className="rounded bg-amber px-1.5 py-0.5 text-[10px] text-base">{code}</span>
        {title.toUpperCase()}
      </p>
      <ul className="mt-3 space-y-2">
        {rows.map((r, i) => (
          <motion.li
            key={r.name}
            initial={reduce ? false : { opacity: 0, x: code === "NG" ? -16 : 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: d + i * 0.08, ease: EASE }}
            className="rounded-xl border border-cream/10 bg-base/30 px-4 py-3"
          >
            <span className="block font-sans text-[16px] font-bold text-cream">{r.name}</span>
            <span className="block text-[13px] text-cream/65">{r.kind}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
  return (
    <>
      <Reveal>
        <p className="mt-6 max-w-[64ch] text-[16px] leading-relaxed text-cream/85">{C.corpus.lead}</p>
      </Reveal>
      <div className="mt-6 grid gap-6 @xl:grid-cols-2">
        {col("Nigeria", "NG", C.corpus.nigeria, 0)}
        {col("United States", "US", C.corpus.us, 0.1)}
      </div>
      <p className="mt-8 font-mono text-[10px] tracking-[0.2em] text-cream/55">FIVE HIGH-STAKES MOMENTS</p>
      <ol className="mt-3 flex flex-wrap gap-2">
        {C.corpus.moments.map((m, i) => (
          <motion.li
            key={m}
            initial={reduce ? false : { opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-2 rounded-full border border-tertiary/40 px-3.5 py-1.5 text-[14px] text-cream"
          >
            <span className="font-mono text-[10px] text-amber">{i + 1}</span>
            {m}
          </motion.li>
        ))}
      </ol>
    </>
  );
}

function Method() {
  const reduce = useReducedMotion();
  const M = C.method;
  return (
    <div className="mt-8 grid gap-4 @3xl:grid-cols-[1.2fr_1fr]">
      <div className="rounded-2xl border border-cream/10 bg-base/30 p-5">
        <p className="font-mono text-[10px] tracking-[0.2em] text-amber">READ ON THREE LAYERS AT ONCE</p>
        <p className="mt-1 font-serif text-xl italic text-tertiary">{M.ctda.name}</p>
        <div className="mt-5 space-y-2">
          {M.ctda.layers.map((l, i) => (
            <motion.div
              key={l}
              initial={reduce ? false : { opacity: 0, y: -12 * (i + 1) }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: EASE }}
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: ["rgba(241,230,206,0.08)", "rgba(255,208,161,0.14)", "rgba(152,58,40,0.45)"][i], marginLeft: `${i * 6}%` }}
            >
              <span className="font-mono text-[10px] text-amber">{["SYSTEM", "MEANING", "POWER"][i]}</span>
              <span className="text-[14.5px] text-cream">{l}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-cream/10 bg-base/30 p-5">
            <p className="font-serif text-xl italic text-tertiary">{M.vsd.name}</p>
            <p className="mt-1 text-[14.5px] leading-relaxed text-cream/80">{M.vsd.text}</p>
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="rounded-2xl bg-primary p-5 text-cream">
            <p className="font-display text-5xl leading-none">
              <CountUp to={M.evidence.n} />
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-cream/90">{M.evidence.text}</p>
          </div>
        </Reveal>
      </div>
      <Reveal className="@3xl:col-span-2">
        <p className="border-l-2 border-amber pl-4 font-serif text-[17px] italic text-cream/85">{M.note}</p>
      </Reveal>
    </div>
  );
}

function Framework() {
  const reduce = useReducedMotion();
  const [d, setD] = useState(0);
  const F = C.framework;
  return (
    <>
      <Reveal>
        <p className="mt-6 max-w-[64ch] text-[16px] leading-relaxed text-cream/85">{F.lead}</p>
      </Reveal>
      <p className="mt-8 font-mono text-[10px] tracking-[0.2em] text-cream/55">THREE DIMENSIONS TO EXAMINE</p>
      <div role="tablist" aria-label="Dimensions" className="mt-3 flex flex-wrap gap-2">
        {F.dimensions.map((x, i) => (
          <button
            key={x.name}
            type="button"
            role="tab"
            aria-selected={d === i}
            onClick={() => setD(i)}
            className={`relative rounded-full px-4 py-2 font-serif text-lg italic transition-colors ${d === i ? "text-cream" : "border border-cream/15 text-cream/70 hover:text-tertiary"}`}
          >
            {d === i && <motion.span layoutId="carf-dim" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
            <span className="relative">{x.name}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 min-h-[4.5rem] rounded-2xl border border-cream/10 bg-base/30 p-5" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p key={d} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="text-[16px] leading-relaxed text-cream/90">
            {F.dimensions[d].text}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="mt-10 font-mono text-[10px] tracking-[0.2em] text-cream/55">FIVE PRACTICES TO APPLY</p>
      <ol className="relative mt-4 space-y-3">
        <span aria-hidden="true" className="absolute bottom-3 left-[0.95rem] top-3 w-px bg-tertiary/25" />
        {F.pathways.map((p, i) => (
          <motion.li
            key={p.name}
            initial={reduce ? false : { opacity: 0.25 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="relative grid grid-cols-[2rem_1fr] gap-3"
          >
            <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-tertiary/60 bg-secondary font-mono text-xs text-tertiary">{i + 1}</span>
            <span>
              <span className="block font-sans text-[16px] font-bold text-cream">{p.name}</span>
              <span className="block text-[14px] leading-relaxed text-cream/75">{p.text}</span>
            </span>
          </motion.li>
        ))}
      </ol>
    </>
  );
}

function Questions() {
  return (
    <ol className="mt-8 space-y-4">
      {C.questions.map((q, i) => (
        <Reveal key={q} delay={i * 0.06} y={14}>
          <li className="grid grid-cols-[3rem_1fr] gap-4 border-b border-cream/10 pb-4">
            <span className="font-serif text-4xl italic leading-none text-primary-soft">{i + 1}</span>
            <span className="font-serif text-xl italic leading-snug text-cream">{q}</span>
          </li>
        </Reveal>
      ))}
    </ol>
  );
}

function Status() {
  const icon = { done: Check, now: Loader, next: Circle } as const;
  return (
    <ul className="mt-8 space-y-3">
      {C.status.map((s, i) => {
        const Icon = icon[s.state];
        return (
          <Reveal key={s.text} delay={i * 0.1} y={10}>
            <li className="flex gap-3 text-[15.5px] leading-relaxed text-cream/90">
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  s.state === "done" ? "bg-amber text-base" : s.state === "now" ? "border-2 border-amber text-amber" : "border-2 border-dashed border-cream/40 text-cream/40"
                }`}
              >
                <Icon size={12} strokeWidth={3} aria-hidden="true" className={s.state === "now" ? "motion-safe:animate-spin" : ""} />
              </span>
              <span>
                {s.text}
                <span className="sr-only"> ({s.state === "done" ? "done" : s.state === "now" ? "in progress" : "next"})</span>
              </span>
            </li>
          </Reveal>
        );
      })}
    </ul>
  );
}

function Related() {
  return (
    <>
      <ul className="mt-8 space-y-4">
        {C.related.map((r, i) => (
          <Reveal key={r.title} delay={i * 0.06} y={12}>
            <li className="border-l-2 border-tertiary/40 pl-4">
              <em className="block font-serif text-[18px] leading-snug text-tertiary">{r.title}.</em>
              <span className="mt-1 block text-[14px] text-cream/70">{r.where}</span>
            </li>
          </Reveal>
        ))}
      </ul>
      <p className="mt-4 font-mono text-[10px] tracking-[0.15em] text-cream/55">{C.relatedNote.toUpperCase()}</p>
    </>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* The study                                                                                          */
/* ------------------------------------------------------------------------------------------------ */

export default function CarfStudy({ scrollRef, onLetsWork }: { scrollRef?: RefObject<HTMLElement | null>; onLetsWork: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);
  const progress = useStudyProgress(scrollRef, rootRef);

  return (
    <div ref={rootRef} className="@container">
      <StudyBar id="carf" label="CARF · RESEARCH" chapters={CHAPTERS} chapter={chapter} progress={progress} tone={CARF_TONE} />
      <Hero />

      <Chapter n={1} title="Who is the interface written for?" onEnter={setChapter}>
        <Question scrollRef={scrollRef} />
      </Chapter>
      <Chapter n={2} title="Microcopy is never neutral" onEnter={setChapter}>
        <Argument />
      </Chapter>
      <Chapter n={3} title="Six platforms, two markets" onEnter={setChapter}>
        <Corpus />
      </Chapter>
      <Chapter n={4} title="System, meaning, power" onEnter={setChapter}>
        <Method />
      </Chapter>
      <Chapter n={5} title="Three dimensions, five practices" onEnter={setChapter}>
        <Framework />
      </Chapter>
      <Chapter n={6} title="What the study asks" onEnter={setChapter}>
        <Questions />
      </Chapter>
      <Chapter n={7} title="In progress, by design" onEnter={setChapter}>
        <Status />
      </Chapter>
      <Chapter n={8} title="Related work" onEnter={setChapter}>
        <Related />
      </Chapter>

      <Reveal className="mt-12 rounded-3xl border border-dashed border-tertiary/40 p-6 text-center">
        <p className="font-serif text-2xl italic text-tertiary">{C.closing}</p>
        <button
          type="button"
          onClick={onLetsWork}
          data-magnetic="0.2"
          className="fx-spotlight group mt-5 inline-flex items-center gap-2 rounded-full bg-tertiary px-5 py-2.5 font-mono text-xs font-medium tracking-[0.15em] text-base transition-colors hover:bg-cream active:bg-primary active:text-cream"
        >
          <RollText text="REQUEST A WRITING SAMPLE" />
          <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
        </button>
      </Reveal>
    </div>
  );
}
