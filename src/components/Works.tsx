import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Cpu,
  GraduationCap,
  HeartHandshake,
  Languages,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { RefObject } from "react";
import { cairaStudy, carfStudy, nexusStudy, projects, tokenStudy, type Project } from "../content";
import CairaStudy, { CairaCover } from "./CairaStudy";
import NexusStudy, { NexusCover } from "./NexusStudy";
import TokenStudy, { TokenCover } from "./TokenStudy";
import CarfStudy, { CarfCover } from "./CarfStudy";
import RollText from "./RollText";
import { LiveRow } from "./StudyKit";

const ICONS: Record<Project["icon"], LucideIcon> = {
  "heart-handshake": HeartHandshake,
  cpu: Cpu,
  truck: Truck,
  languages: Languages,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
};

// Accent → glow colour (rgba) and text class, all from the brand palette
const ACCENTS: Record<Project["accent"], { glow: string; text: string }> = {
  coral: { glow: "240,147,122", text: "text-primary-soft" },
  amber: { glow: "242,166,90", text: "text-amber" },
  peach: { glow: "255,208,161", text: "text-tertiary" },
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Projects with a full case study; the rest show "Coming soon…" until theirs is written. */
const RICH_SLUGS = [cairaStudy.slug, nexusStudy.slug, tokenStudy.slug, carfStudy.slug];
export const hasCaseStudy = (slug: string) => RICH_SLUGS.includes(slug);

/**
 * Project cover. Uses `project.cover` when provided; otherwise generates an on-brand cover: dark warm field,
 * an accent glow that drifts on hover, a fine dot grid, the project glyph, and the name set huge in outlined Anton.
 */
export function ProjectCover({ project, index, large = false }: { project: Project; index: number; large?: boolean }) {
  const Icon = ICONS[project.icon];
  const accent = ACCENTS[project.accent];

  if (project.slug === cairaStudy.slug) return <CairaCover />;
  if (project.slug === nexusStudy.slug) return <NexusCover />;
  if (project.slug === tokenStudy.slug) return <TokenCover />;
  if (project.slug === carfStudy.slug) return <CarfCover />;

  if (project.cover) {
    return (
      <img
        src={project.cover}
        alt=""
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
    );
  }

  return (
    <div aria-hidden="true" className="relative h-full w-full overflow-hidden bg-[linear-gradient(150deg,#2a0d03_0%,#150600_70%)]">
      {/* Accent glow */}
      <div
        className="absolute -right-[15%] -top-[25%] h-[110%] w-[70%] rounded-full blur-3xl transition-transform duration-700 ease-out group-hover:-translate-x-[8%] group-hover:translate-y-[6%]"
        style={{ background: `radial-gradient(circle, rgba(${accent.glow},0.45), transparent 65%)` }}
      />
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#f1e6ce_1px,transparent_1px)] [background-size:18px_18px]" />
      {/* Glyph */}
      <div className={`absolute right-[7%] top-[12%] ${accent.text}`}>
        <Icon className={large ? "h-24 w-24 sm:h-32 sm:w-32" : "h-16 w-16 sm:h-20 sm:w-20"} strokeWidth={1.2} />
      </div>
      {/* Index + name */}
      <span className={`absolute left-[6%] top-[9%] font-mono text-xs tracking-[0.25em] ${accent.text}`}>{pad(index + 1)}</span>
      <span
        className={`text-stroke absolute bottom-[4%] left-[5%] font-display uppercase leading-[0.85] transition-transform duration-700 ease-out group-hover:-translate-y-1 ${
          large ? "text-[clamp(4rem,14vw,9rem)]" : "text-[clamp(3.25rem,11vw,6.5rem)]"
        }`}
      >
        {project.name}
      </span>
    </div>
  );
}

/** Selected Works: numbered rows with a rule that draws in on hover, the project's name and line, and a cover. */
export function WorksList({ onOpen, columns = 1 }: { onOpen: (slug: string) => void; columns?: 1 | 2 }) {
  const reduceMotion = useReducedMotion();
  return (
    <ol className={columns === 2 ? "grid grid-cols-2 gap-x-12 gap-y-14" : "space-y-12"}>
      {projects.map((p, i) => {
        const accent = ACCENTS[p.accent];
        const ready = hasCaseStudy(p.slug);
        return (
          <motion.li
            key={p.slug}
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <button type="button" onClick={() => onOpen(p.slug)} className="group block w-full text-left" aria-label={`${p.name}: ${p.type}. ${ready ? "Open case study" : "Case study coming soon"}`}>
              <span className="flex items-center gap-4">
                <span className={`font-display text-4xl leading-none ${accent.text}`}>{pad(i + 1)}</span>
                <span className="relative h-px flex-1 bg-cream/15">
                  <span className="absolute inset-0 origin-left scale-x-0 bg-tertiary transition-transform duration-500 ease-out group-hover:scale-x-100" />
                </span>
                <span className="text-right">
                  <span className="block font-sans text-xl font-bold text-cream transition-colors group-hover:text-tertiary sm:text-2xl">{p.name}</span>
                  <span className="block text-xs text-cream/60 sm:text-sm">{p.type}</span>
                </span>
              </span>

              <span className="relative mt-4 block aspect-[16/10] overflow-hidden rounded-2xl border border-cream/10 transition-[border-color,transform] duration-500 group-hover:border-tertiary/40 group-active:scale-[0.99]">
                <ProjectCover project={p} index={i} />
                {!ready && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-cream/20 bg-base/70 px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-tertiary backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tertiary" aria-hidden="true" />
                    COMING SOON
                  </span>
                )}
                <span className="absolute bottom-3 right-3 inline-flex translate-y-2 items-center gap-2 rounded-full bg-cream px-4 py-2 font-mono text-[11px] font-medium tracking-[0.15em] text-base opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  <RollText text={ready ? "VIEW CASE STUDY" : "COMING SOON..."} />
                  {ready && <ArrowRight size={13} aria-hidden="true" />}
                </span>
              </span>

              <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {p.year && <span className="font-mono text-[11px] tracking-[0.18em] text-amber">{p.year.toUpperCase()}</span>}
                <span className="text-xs text-cream/60">{p.role}</span>
              </span>
            </button>
          </motion.li>
        );
      })}
    </ol>
  );
}

/** A single case study: cover, facts, summary, what I did, focus areas, link, and next project. */
export function CaseStudy({
  slug,
  onOpen,
  onLetsWork,
  scrollRef,
}: {
  slug: string;
  onOpen: (slug: string) => void;
  onLetsWork: () => void;
  /** The drawer's scroller, for scroll-linked effects in rich case studies */
  scrollRef?: RefObject<HTMLElement | null>;
}) {
  const reduceMotion = useReducedMotion();
  const index = Math.max(0, projects.findIndex((p) => p.slug === slug));
  const p = projects[index];
  const next = projects[(index + 1) % projects.length];
  const accent = ACCENTS[p.accent];
  const rise = (d: number) =>
    reduceMotion ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: d, ease: [0.2, 0.8, 0.2, 1] as const } };

  // Caira, NexusCore, TokenForge, and CARF have their own, richer case studies
  const Rich = p.slug === cairaStudy.slug ? CairaStudy : p.slug === nexusStudy.slug ? NexusStudy : p.slug === tokenStudy.slug ? TokenStudy : p.slug === carfStudy.slug ? CarfStudy : null;
  if (Rich) {
    return (
      <article className="pb-4">
        <Rich scrollRef={scrollRef} onLetsWork={onLetsWork} />
        <NextProject next={next} onOpen={onOpen} />
      </article>
    );
  }

  return (
    <article className="pb-4">
      <motion.div {...rise(0)} className="group aspect-[16/9] overflow-hidden rounded-2xl border border-cream/10">
        <ProjectCover project={p} index={index} large />
      </motion.div>

      <motion.dl {...rise(0.08)} className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-b border-cream/10 pb-6 sm:grid-cols-3">
        <div>
          <dt className="font-mono text-[11px] tracking-[0.2em] text-amber">ROLE</dt>
          <dd className="mt-1 text-sm text-cream">{p.role}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] tracking-[0.2em] text-amber">WHEN</dt>
          <dd className="mt-1 text-sm text-cream">{p.year || "—"}</dd>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <dt className="font-mono text-[11px] tracking-[0.2em] text-amber">WHAT IT IS</dt>
          <dd className="mt-1 text-sm text-cream">{p.type}</dd>
        </div>
        {p.url && (
          <LiveRow
            label={p.name}
            value={p.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            url={p.url}
            accent={{ text: "text-tertiary", fill: "bg-tertiary", on: "text-base", tint: "bg-[radial-gradient(120%_160%_at_0%_0%,rgba(255,208,161,0.16),transparent_60%)]" }}
            framed
            className="mt-3"
          />
        )}
      </motion.dl>

      <motion.p {...rise(0.14)} className={`mt-6 border-l-2 border-amber pl-4 font-sans text-xl font-bold leading-snug sm:text-2xl ${accent.text}`}>
        {p.summary}
      </motion.p>

      {/* The full case study isn't written yet */}
      <motion.section {...rise(0.2)} aria-label="Case study coming soon" className="relative mt-10 overflow-hidden rounded-3xl border border-dashed border-tertiary/40 bg-base/30 px-6 py-10 text-center">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(240,147,122,0.18),transparent_70%)]" />
        <p className="relative font-mono text-[11px] tracking-[0.25em] text-amber">CASE STUDY</p>
        <p className="text-stroke relative mt-3 font-display text-6xl uppercase leading-none sm:text-7xl">
          Coming soon
          <span aria-hidden="true" className="inline-flex">
            {[0, 1, 2].map((d) => (
              <motion.span
                key={d}
                className="text-primary-soft [-webkit-text-stroke:0]"
                animate={reduceMotion ? undefined : { opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: d * 0.2 }}
              >
                .
              </motion.span>
            ))}
          </span>
        </p>
        <p className="relative mx-auto mt-4 max-w-[40ch] text-[15px] leading-relaxed text-cream/75">
          The full story of {p.name} is being written. In the meantime, I’m happy to walk you through it.
        </p>
        <button
          type="button"
          onClick={onLetsWork}
          data-magnetic="0.2"
          className="fx-spotlight group relative mt-6 inline-flex items-center gap-2 rounded-full border border-cream/25 px-5 py-2.5 font-mono text-xs font-medium tracking-[0.15em] text-cream transition-colors hover:border-tertiary hover:bg-tertiary hover:text-base active:border-primary active:bg-primary active:text-cream"
        >
          <RollText text="ASK ME ABOUT IT" />
        </button>
      </motion.section>

      <NextProject next={next} onOpen={onOpen} />
    </article>
  );
}

/** Big "next project" link at the foot of every case study. */
function NextProject({ next, onOpen }: { next: Project; onOpen: (slug: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(next.slug)}
      className="group mt-14 flex w-full items-center justify-between gap-4 border-t border-cream/10 pt-6 text-left"
    >
      <span>
        <span className="block font-mono text-[11px] tracking-[0.2em] text-amber">NEXT PROJECT</span>
        <span className="mt-1 block font-display text-4xl uppercase leading-none text-cream transition-colors group-hover:text-tertiary sm:text-5xl">
          {next.name}
        </span>
      </span>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cream/20 text-cream transition-all duration-300 group-hover:translate-x-1 group-hover:border-tertiary group-hover:bg-tertiary group-hover:text-base">
        <ArrowRight size={18} aria-hidden="true" />
      </span>
    </button>
  );
}
