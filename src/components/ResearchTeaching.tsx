import type { ReactNode, RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Award, BookOpen, GraduationCap, Mic, PenLine, ScrollText } from "lucide-react";
import { researchTeaching as R } from "../content";

/**
 * About Me → Experience: the "Research & Teaching" group, shown above the industry timeline. Same visual language
 * as ExperienceList (amber dates, peach roles, dimmed places), grouped under small mono headings. Rows rise in as
 * the segment's own scroller (`scrollRoot`) brings them on screen. The thesis row opens the CARF case study.
 */
export default function ResearchTeaching({ scrollRoot, onOpenCase }: { scrollRoot: RefObject<HTMLElement | null>; onOpenCase: (slug: string) => void }) {
  const reduce = useReducedMotion();
  const rise = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { root: scrollRoot, once: true, amount: 0.4 },
    transition: { duration: 0.45, delay: Math.min(i, 4) * 0.05, ease: "easeOut" as const },
  });

  const Group = ({ icon: Icon, title, children }: { icon: typeof BookOpen; title: string; children: ReactNode }) => (
    <section className="mt-8 first:mt-0">
      <h4 className="mb-3 flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-amber">
        <Icon size={13} aria-hidden="true" />
        {title}
      </h4>
      {children}
    </section>
  );

  return (
    <div>
      <motion.header {...rise(0)} className="mb-8 border-b border-cream/10 pb-6">
        <h3 className="font-mono text-xs tracking-[0.25em] text-primary-soft">{R.title.toUpperCase()}</h3>
        <p className="mt-3 font-serif text-xl italic leading-snug text-tertiary sm:text-2xl">{R.statement}</p>
      </motion.header>

      <Group icon={GraduationCap} title="TEACHING">
        <ol className="space-y-4">
          {R.teaching.map((t, i) => (
            <motion.li key={t.role} {...rise(i)}>
              <p className="font-mono text-[11px] tracking-[0.18em] text-amber">{t.period.toUpperCase()}</p>
              <p className="mt-1 font-sans text-lg font-bold leading-snug text-tertiary">{t.role}</p>
              <p className="text-sm text-cream/65">{t.org}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-cream/80">{t.text}</p>
            </motion.li>
          ))}
        </ol>
      </Group>

      <Group icon={ScrollText} title="RESEARCH & EDITORIAL">
        <ol className="space-y-4">
          {R.research.map((t, i) => (
            <motion.li key={t.role} {...rise(i)}>
              <p className="font-mono text-[11px] tracking-[0.18em] text-amber">{t.period.toUpperCase()}</p>
              {t.slug ? (
                <button
                  type="button"
                  onClick={() => onOpenCase(t.slug)}
                  className="group mt-1 inline-flex items-center gap-2 text-left font-sans text-lg font-bold leading-snug text-tertiary underline decoration-tertiary/40 underline-offset-4 transition-colors hover:text-cream"
                >
                  {t.role}
                  <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                </button>
              ) : (
                <p className="mt-1 font-sans text-lg font-bold leading-snug text-tertiary">{t.role}</p>
              )}
              <p className="text-sm italic text-cream/65">{t.org}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-cream/80">{t.text}</p>
            </motion.li>
          ))}
        </ol>
      </Group>

      <Group icon={Mic} title="PRESENTATIONS">
        <ul className="space-y-3">
          {R.presentations.map((p, i) => (
            <motion.li key={p.title} {...rise(i)} className="flex gap-3">
              <span className="h-fit rounded-full bg-amber px-2 py-0.5 font-mono text-[10px] text-base">{p.year}</span>
              <span className="text-[14px] leading-snug text-cream/85">
                Oladeji, J. B. ({p.year}). <em className="font-serif text-[1.05em] text-tertiary">{p.title}.</em> {p.venue}.
              </span>
            </motion.li>
          ))}
        </ul>
      </Group>

      <Group icon={PenLine} title="MANUSCRIPTS IN PREPARATION">
        <ol className="space-y-2.5">
          {R.manuscripts.map((m, i) => (
            <motion.li key={m} {...rise(i)} className="flex gap-3 text-[14px] leading-snug text-cream/85">
              <span className="font-display text-lg leading-none text-primary-soft">{i + 1}</span>
              <em className="font-serif text-[1.05em]">{m}.</em>
            </motion.li>
          ))}
        </ol>
      </Group>

      <Group icon={Award} title="RECOGNITION">
        <ul className="space-y-2">
          {R.recognition.map((r, i) => (
            <motion.li key={r.what} {...rise(i)} className="flex items-center gap-3">
              <span className="rounded-full bg-amber px-2 py-0.5 font-mono text-[10px] text-base">{r.year}</span>
              <span className="font-sans text-[15px] font-bold text-cream">{r.what}</span>
            </motion.li>
          ))}
        </ul>
      </Group>

      <Group icon={BookOpen} title="EDUCATION">
        <ul className="space-y-3">
          {R.education.map((e, i) => (
            <motion.li key={e.what} {...rise(i)}>
              <p className="font-mono text-[11px] tracking-[0.18em] text-amber">{e.year.toUpperCase()}</p>
              <p className="mt-1 font-sans text-[16px] font-bold text-tertiary">{e.what}</p>
              <p className="text-sm text-cream/65">{e.where}</p>
            </motion.li>
          ))}
        </ul>
      </Group>

      <h3 className="mb-2 mt-12 border-t border-cream/10 pt-6 font-mono text-xs tracking-[0.25em] text-primary-soft">INDUSTRY</h3>
    </div>
  );
}
