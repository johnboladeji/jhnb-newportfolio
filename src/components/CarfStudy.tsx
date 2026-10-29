import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Circle, Loader } from "lucide-react";
import { carfStudy as C } from "../content";
import CarfReader from "./CarfReader";
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
const CHAPTERS = ["The question", "The argument", "The corpus", "Method", "The framework", "Try it", "Research questions", "Where it stands", "Related work"];

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

/**
 * The CARF cover: a radiant scene that tells the study at a glance. Two phones, Lagos and Chicago, show the same
 * identity check in opposite registers; a reading lens hovers over the Lagos copy, magnifying the word that does
 * the damage ("restrict"); a flight arc links the two cities; slow rays radiate behind it all. Hover warms the
 * title and moves the lens. Drawn in code (no remote images); the rays and arc pause under reduced motion.
 */
export function CarfCover() {
  const reduce = useReducedMotion();
  const MONO = "IBM Plex Mono, monospace";
  const SANS = "Space Grotesk, sans-serif";
  const SERIF = "Newsreader, Georgia, serif";
  const rays = Array.from({ length: 28 }, (_, i) => i);
  return (
    <svg viewBox="0 0 640 400" className="h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="carf-bg" cx="0.66" cy="0.42" r="0.75">
          <stop offset="0" stopColor="#4a1708" />
          <stop offset="0.55" stopColor="#220902" />
          <stop offset="1" stopColor="#150600" />
        </radialGradient>
        <radialGradient id="carf-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd0a1" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#f2a65a" stopOpacity="0.18" />
          <stop offset="1" stopColor="#f2a65a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="carf-title" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffd0a1" />
          <stop offset="0.5" stopColor="#f2a65a" />
          <stop offset="1" stopColor="#f0937a" />
        </linearGradient>
        <clipPath id="carf-lens-clip">
          <circle cx="0" cy="0" r="30" />
        </clipPath>
      </defs>

      <rect width="640" height="400" fill="url(#carf-bg)" />

      {/* Radiant rays, slowly turning */}
      <g transform="translate(420 170)">
        <g className="carf-rays">
          {rays.map((i) => {
            const a = (i / rays.length) * Math.PI * 2;
            const b = a + Math.PI / rays.length;
            const R = 420;
            return (
              <path
                key={i}
                d={`M0 0 L${(Math.cos(a) * R).toFixed(1)} ${(Math.sin(a) * R).toFixed(1)} L${(Math.cos(b) * R).toFixed(1)} ${(Math.sin(b) * R).toFixed(1)} Z`}
                fill="#f2a65a"
                opacity={i % 2 ? 0.035 : 0.075}
              />
            );
          })}
        </g>
        <circle r="190" fill="url(#carf-sun)" />
      </g>

      {/* Flight arc: Lagos ⇄ Chicago */}
      <path id="carf-arc" d="M318 92 C 370 18, 470 18, 520 96" fill="none" stroke="#ffd0a1" strokeOpacity="0.55" strokeWidth="1.4" strokeDasharray="4 6" />
      {!reduce && (
        <circle r="3.5" fill="#ffd0a1">
          <animateMotion dur="4s" repeatCount="indefinite" path="M318 92 C 370 18, 470 18, 520 96" />
        </circle>
      )}

      {/* Lagos phone: the document to be checked */}
      <g transform="rotate(-7 335 205)" className="transition-transform duration-700 ease-out group-hover:-translate-y-1">
        <rect x="262" y="96" width="146" height="236" rx="20" fill="#0b0402" />
        <rect x="268" y="102" width="134" height="224" rx="15" fill="#f1e6ce" />
        <rect x="278" y="114" width="58" height="14" rx="7" fill="#983a28" />
        <text x="307" y="124" textAnchor="middle" fontFamily={MONO} fontSize="8" fill="#f1e6ce">LAGOS · NG</text>
        <text x="280" y="148" fontFamily={SANS} fontWeight="700" fontSize="11" fill="#150600">Verify your identity</text>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x="280" y={160 + i * 12} width={[108, 96, 104, 70][i]} height="5" rx="2.5" fill="#150600" fillOpacity="0.28" />
        ))}
        {/* the loaded word, highlighted */}
        <rect x="278" y="208" width="58" height="13" rx="3" fill="#f0937a" fillOpacity="0.55" />
        <text x="281" y="218" fontFamily={SANS} fontWeight="700" fontSize="9.5" fill="#150600">restrict</text>
        <rect x="340" y="212" width="48" height="5" rx="2.5" fill="#150600" fillOpacity="0.28" />
        <rect x="280" y="290" width="110" height="24" rx="8" fill="#150600" />
        <text x="335" y="306" textAnchor="middle" fontFamily={MONO} fontSize="8" fill="#f1e6ce">SUBMIT DOCUMENTS</text>
      </g>

      {/* Chicago phone: the customer to be helped */}
      <g transform="rotate(7 515 215)" className="transition-transform duration-700 ease-out group-hover:-translate-y-2">
        <rect x="444" y="108" width="146" height="236" rx="20" fill="#0b0402" />
        <rect x="450" y="114" width="134" height="224" rx="15" fill="#ffd0a1" />
        <rect x="460" y="126" width="72" height="14" rx="7" fill="#150600" />
        <text x="496" y="136" textAnchor="middle" fontFamily={MONO} fontSize="8" fill="#ffd0a1">CHICAGO · US</text>
        <text x="462" y="160" fontFamily={SANS} fontWeight="700" fontSize="11" fill="#150600">Let&apos;s confirm it&apos;s you</text>
        {[0, 1, 2].map((i) => (
          <rect key={i} x="462" y={172 + i * 12} width={[104, 92, 64][i]} height="5" rx="2.5" fill="#150600" fillOpacity="0.25" />
        ))}
        <rect x="460" y="218" width="112" height="26" rx="13" fill="#150600" fillOpacity="0.9" />
        <circle cx="474" cy="231" r="7" fill="#f2a65a" />
        <path d="M470.5 231 l2.5 2.5 l4.5 -5" fill="none" stroke="#150600" strokeWidth="1.8" strokeLinecap="round" />
        <text x="486" y="234.5" fontFamily={SANS} fontSize="9" fill="#ffd0a1">Just a moment</text>
        <rect x="462" y="302" width="110" height="24" rx="12" fill="#983a28" />
        <text x="517" y="318" textAnchor="middle" fontFamily={MONO} fontSize="8" fill="#f1e6ce">CONTINUE</text>
      </g>

      {/* The reading lens over "restrict" */}
      <g className="transition-transform duration-700 ease-out group-hover:translate-x-[6px] group-hover:-translate-y-[4px]">
        <g className="carf-lens">
        <g transform="translate(318 222)">
          <circle r="31" fill="#150600" fillOpacity="0.15" />
          <g clipPath="url(#carf-lens-clip)">
            <circle r="30" fill="#f1e6ce" />
            <text x="0" y="7" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="20" fill="#983a28">restrict</text>
          </g>
          <circle r="30" fill="none" stroke="#ffd0a1" strokeWidth="4" />
          <circle r="30" fill="none" stroke="#150600" strokeOpacity="0.4" strokeWidth="1" />
          <path d="M21 21 L44 44" stroke="#ffd0a1" strokeWidth="9" strokeLinecap="round" />
          <path d="M21 21 L44 44" stroke="#983a28" strokeWidth="5" strokeLinecap="round" />
        </g>
        </g>
      </g>

      {/* Title block */}
      <text x="28" y="40" fontFamily={MONO} fontSize="12" letterSpacing="3" fill="#f2a65a">04</text>
      <text x="28" y="262" fontFamily={MONO} fontSize="10" letterSpacing="2.5" fill="#ffd0a1" fillOpacity="0.85">RESEARCH · M.A. THESIS</text>
      <text
        x="24"
        y="356"
        fontFamily="Anton, Impact, sans-serif"
        fontSize="104"
        letterSpacing="2"
        className="fill-transparent transition-[fill] duration-700 group-hover:fill-[url(#carf-title)]"
        stroke="#f1e6ce"
        strokeWidth="1.6"
      >
        CARF
      </text>
      <text x="28" y="382" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill="#ffd0a1">Culturally Attentive Rhetorical Framework</text>
    </svg>
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
      <Chapter n={6} title={C.reader.title} onEnter={setChapter}>
        <p className="mb-6 max-w-[60ch] text-[16px] leading-relaxed text-cream/80">{C.reader.lead}</p>
        <CarfReader />
      </Chapter>
      <Chapter n={7} title="What the study asks" onEnter={setChapter}>
        <Questions />
      </Chapter>
      <Chapter n={8} title="In progress, by design" onEnter={setChapter}>
        <Status />
      </Chapter>
      <Chapter n={9} title="Related work" onEnter={setChapter}>
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
