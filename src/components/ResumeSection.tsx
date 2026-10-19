import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Download } from "lucide-react";
import { resume } from "../content";
import RollText from "./RollText";
import TypeLoop from "./TypeLoop";
import { Reveal } from "./Reveal";

/**
 * Resume: About's structure (pinned outlined title + continuously typed headline, a rule row, and a segment
 * that scrolls on its own). No job list: a download card, the numbers, the arc by discipline, expertise,
 * research, education, and ventures. Work history lives in the PDF.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;
const label = "font-mono text-[11px] tracking-[0.25em] text-amber";

function Buttons() {
  if (!resume.pdfUrl) return null;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={resume.pdfUrl}
        download={resume.pdfFileName}
        data-magnetic="0.2"
        className="fx-spotlight group inline-flex items-center gap-3 rounded-full bg-tertiary py-1.5 pl-5 pr-1.5 font-mono text-xs font-medium tracking-[0.15em] text-base shadow-[0_14px_30px_-16px_rgba(0,0,0,0.8)] transition-transform duration-300 hover:-translate-y-0.5 active:bg-primary active:text-cream"
      >
        <RollText text="DOWNLOAD CV (PDF)" />
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15 transition-transform duration-300 group-hover:translate-y-0.5">
          <Download size={15} aria-hidden="true" />
        </span>
      </a>
      <a
        href={resume.pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-magnetic="0.2"
        className="fx-spotlight group inline-flex items-center gap-2 rounded-full border border-cream/25 px-5 py-2.5 font-mono text-xs font-medium tracking-[0.15em] text-cream transition-colors hover:border-tertiary hover:bg-tertiary hover:text-base active:border-primary active:bg-primary active:text-cream"
      >
        <RollText text="OPEN IN BROWSER" />
        <ArrowUpRight size={14} aria-hidden="true" />
      </a>
    </div>
  );
}

function Pages() {
  // Three fanned CV pages, drawn in code; they spread on hover
  return (
    <div aria-hidden="true" className="group relative mx-auto h-48 w-36">
      {[2, 1, 0].map((i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-md bg-cream p-3 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.9)] transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${(i - 1) * 7}deg) translateX(${(i - 1) * 10}px)` }}
        >
          {i === 1 && (
            <>
              <p className="font-display text-[15px] leading-none text-base">JOHN B. OLADEJI</p>
              <p className="mt-1 font-mono text-[7px] tracking-[0.2em] text-primary">CURRICULUM VITAE</p>
            </>
          )}
          {[90, 70, 85, 60, 80, 74, 66].map((w, k) => (
            <span key={k} className="mt-2 block h-1 rounded bg-base/20" style={{ width: `${w}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Count({ n, suffix }: { n: number; suffix: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className="block font-display text-5xl leading-none text-primary-soft"
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {n}
      {suffix}
    </motion.span>
  );
}

export default function ResumeSection({ full, onOpenCase, onLetsWork }: { full: boolean; onOpenCase: (slug: string) => void; onLetsWork: () => void }) {
  const reduce = useReducedMotion();
  const [area, setArea] = useState(0);
  const R = resume.research;
  return (
    <section aria-labelledby="drawer-title" className="flex h-full min-h-0 flex-col">
      <header className="shrink-0">
        <h2 id="drawer-title" className="text-stroke font-display text-5xl uppercase leading-none sm:text-6xl">
          Resume
        </h2>
        <TypeLoop
          text={resume.headline}
          className={`mt-3 font-sans font-bold leading-snug tracking-tight text-primary-soft ${
            full ? "mx-auto max-w-[52rem] text-center text-2xl sm:text-3xl lg:text-[2.6rem] lg:leading-[1.15]" : "max-w-[38rem] text-[1.4rem] sm:text-[1.75rem]"
          }`}
        />
      </header>
      <div className="mt-5 flex shrink-0 items-center justify-between border-b border-cream/10 pb-3 font-mono text-xs tracking-[0.25em]">
        <span className="text-primary-soft">THE CV</span>
        <span className="text-cream/60">{resume.pages} PAGES · PDF</span>
      </div>

      <div className="@container fx-scroll mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6 pr-3">
        {/* Download card */}
        <Reveal>
          <div className="grid items-center gap-6 rounded-3xl border border-cream/10 bg-[linear-gradient(135deg,rgba(152,58,40,0.35),rgba(21,6,0,0.45))] p-6 @xl:grid-cols-[10rem_minmax(0,1fr)] @xl:p-8">
            <Pages />
            <div className="min-w-0">
              <p className="max-w-[56ch] text-[16px] leading-relaxed text-cream/85">{resume.intro}</p>
              <div className="mt-5">
                <Buttons />
              </div>
            </div>
          </div>
        </Reveal>

        {/* Numbers */}
        <dl className="mt-10 grid grid-cols-2 gap-x-4 gap-y-6 @xl:grid-cols-5">
          {resume.stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <Count n={s.n} suffix={s.suffix} />
                <span className="mt-1 block font-mono text-[10px] uppercase leading-snug tracking-[0.12em] text-cream/70">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>

        {/* Arc */}
        <h3 className={`mt-14 ${label}`}>THE ARC</h3>
        <ol className="relative mt-5 grid gap-3 @3xl:grid-cols-7 @3xl:gap-2">
          <span aria-hidden="true" className="absolute bottom-3 left-[0.45rem] top-3 w-px bg-tertiary/25 @3xl:inset-x-2 @3xl:bottom-auto @3xl:left-2 @3xl:top-[0.45rem] @3xl:h-px @3xl:w-auto" />
          {resume.arc.map((a, i) => (
            <motion.li
              key={a.year}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: EASE }}
              className="relative grid grid-cols-[1rem_1fr] gap-3 @3xl:grid-cols-1 @3xl:gap-2"
            >
              <span className="relative z-10 mt-0.5 h-3.5 w-3.5 rounded-full border-2 border-tertiary bg-secondary" />
              <span>
                <span className="block font-mono text-[11px] text-amber">{a.year}</span>
                <span className="block font-sans text-[15px] font-bold text-cream">{a.label}</span>
                <span className="block text-[13px] leading-snug text-cream/65">{a.text}</span>
              </span>
            </motion.li>
          ))}
        </ol>

        {/* Expertise */}
        <h3 className={`mt-14 ${label}`}>EXPERTISE</h3>
        <div role="tablist" aria-label="Expertise" className="mt-4 flex flex-wrap gap-2">
          {resume.expertise.map((e, i) => (
            <button
              key={e.area}
              type="button"
              role="tab"
              aria-selected={area === i}
              onClick={() => setArea(i)}
              className={`relative rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.15em] transition-colors ${area === i ? "text-cream" : "border border-cream/15 text-cream/65 hover:text-tertiary"}`}
            >
              {area === i && <motion.span layoutId="cv-area" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
              <span className="relative">{e.area.toUpperCase()}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.ul key={area} className="mt-4 flex flex-wrap gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {resume.expertise[area].items.map((it, k) => (
              <motion.li
                key={it}
                initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: k * 0.03 }}
                className="rounded-full border border-tertiary/30 px-3 py-1.5 text-[14px] text-cream/90"
              >
                {it}
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>

        {/* Research */}
        <h3 className={`mt-14 ${label}`}>RESEARCH</h3>
        <Reveal className="mt-4">
          <figure className="border-l-[3px] border-primary-soft pl-5">
            <figcaption className="font-mono text-[10px] tracking-[0.2em] text-cream/55">M.A. THESIS</figcaption>
            <p className="mt-2 font-serif text-2xl italic leading-snug text-tertiary">&ldquo;{R.thesis}&rdquo;</p>
            <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-cream/80">{R.framework}</p>
          </figure>
        </Reveal>
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {R.interests.map((t) => (
            <li key={t} className="rounded-full bg-base/40 px-3 py-1 font-mono text-[10px] tracking-[0.08em] text-cream/80">{t}</li>
          ))}
        </ul>
        <div className="mt-6 grid gap-6 @3xl:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-cream/55">CONFERENCE PAPERS</p>
            <ul className="mt-3 space-y-3">
              {R.talks.map((t) => (
                <Reveal key={t.title} y={10}>
                  <li className="flex gap-3">
                    <span className="h-fit rounded-full bg-amber px-2 py-0.5 font-mono text-[10px] text-base">{t.year}</span>
                    <span className="text-[14px] leading-snug text-cream/85">
                      {t.title}
                      <span className="mt-0.5 block font-mono text-[10px] tracking-[0.1em] text-cream/55">{t.venue}</span>
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-cream/55">MANUSCRIPTS IN PREPARATION</p>
            <ol className="mt-3 space-y-2.5">
              {R.manuscripts.map((m, i) => (
                <Reveal key={m} y={10} delay={i * 0.05}>
                  <li className="flex gap-3 text-[14px] leading-snug text-cream/85">
                    <span className="font-display text-xl leading-none text-primary-soft">{i + 1}</span>
                    {m}
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>

        {/* Education */}
        <h3 className={`mt-14 ${label}`}>EDUCATION</h3>
        <ol className="mt-4 divide-y divide-cream/10 border-y border-cream/10">
          {resume.education.map((e, i) => (
            <Reveal key={e.what} y={10} delay={i * 0.04}>
              <li className="grid gap-1 py-3.5 @xl:grid-cols-[5.5rem_1fr] @xl:gap-4">
                <span className="font-mono text-[11px] text-amber">{e.year}</span>
                <span>
                  <span className="block font-sans text-[15px] font-bold text-cream">{e.what}</span>
                  <span className="block text-[13px] text-cream/65">
                    {e.where}
                    {"note" in e && e.note ? ` · ${e.note}` : ""}
                  </span>
                </span>
              </li>
            </Reveal>
          ))}
        </ol>

        {/* Recognition */}
        <h3 className={`mt-14 ${label}`}>RECOGNITION</h3>
        <ul className="mt-4 space-y-2">
          {resume.recognition.map((r) => (
            <Reveal key={r.what} y={10}>
              <li className="flex items-center gap-3 rounded-2xl border border-cream/10 bg-base/30 p-4">
                <span className="rounded-full bg-amber px-2.5 py-0.5 font-mono text-[11px] text-base">{r.year}</span>
                <span className="font-sans text-[15px] font-bold text-cream">{r.what}</span>
              </li>
            </Reveal>
          ))}
        </ul>

        {/* Ventures */}
        <h3 className={`mt-14 ${label}`}>VENTURES</h3>
        <ul className="mt-4 grid gap-2 @xl:grid-cols-2">
          {resume.ventures.map((v) => (
            <li key={v.name}>
              {v.slug ? (
                <button
                  type="button"
                  onClick={() => onOpenCase(v.slug)}
                  className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-cream/10 bg-base/30 p-4 text-left transition-colors hover:border-tertiary/50"
                >
                  <span>
                    <span className="block font-sans text-lg font-bold text-cream transition-colors group-hover:text-tertiary">{v.name}</span>
                    <span className="block text-[13px] text-cream/65">{v.line}</span>
                  </span>
                  <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-cream/60 transition-transform group-hover:translate-x-1 group-hover:text-tertiary" />
                </button>
              ) : (
                <div className="rounded-2xl border border-cream/10 bg-base/30 p-4">
                  <span className="block font-sans text-lg font-bold text-cream">{v.name}</span>
                  <span className="block text-[13px] text-cream/65">{v.line}</span>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Close */}
        <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-cream/10 pt-6">
          <Buttons />
          <button
            type="button"
            onClick={onLetsWork}
            data-magnetic="0.2"
            className="fx-spotlight group inline-flex items-center gap-2 rounded-full border border-cream/25 px-5 py-2.5 font-mono text-xs font-medium tracking-[0.15em] text-cream transition-colors hover:border-tertiary hover:bg-tertiary hover:text-base active:border-primary active:bg-primary active:text-cream"
          >
            <RollText text="LET'S WORK" />
          </button>
        </div>
      </div>
    </section>
  );
}
