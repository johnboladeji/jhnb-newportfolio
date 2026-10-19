import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Reveal, RiseWords } from "./Reveal";

/**
 * Shared chrome for the rich case studies (CairaStudy, NexusStudy), so every study reads the same way:
 * a sticky chapter bar (scroll progress, current chapter, jump dots), numbered chapter headings, and
 * paragraphs whose words light up as you read. Each study passes its own `tone` (brand colours and type).
 */

export const pad = (n: number) => String(n).padStart(2, "0");

export interface StudyTone {
  /** Kicker text colour, e.g. "text-ochre" */
  kicker: string;
  /** Short rule beside the kicker, e.g. "bg-ochre/60" */
  rule: string;
  /** The current jump dot, e.g. "bg-ochre" */
  dot: string;
  /** Progress line fill, e.g. a gradient class */
  progress: string;
  /** Chapter title font/weight, e.g. "font-fraunces font-semibold" */
  title: string;
}

/** Scroll progress through a study, relative to the drawer's scroller. */
export function useStudyProgress(scrollRef: RefObject<HTMLElement | null> | undefined, rootRef: RefObject<HTMLElement>) {
  const { scrollYProgress } = useScroll({
    container: scrollRef as RefObject<HTMLElement> | undefined,
    target: rootRef,
    offset: ["start start", "end end"],
  });
  return useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
}

/** Sticky chapter bar: progress line, the current chapter, and dots to jump between chapters. */
export function StudyBar({
  id,
  label,
  chapters,
  chapter,
  progress,
  tone,
}: {
  id: string;
  label: string;
  chapters: string[];
  chapter: number;
  progress: MotionValue<number>;
  tone: StudyTone;
}) {
  const jump = (n: number) => document.getElementById(`${id}-ch-${n}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <div className="sticky top-0 z-20 -mx-6 mb-6 border-b border-cream/5 bg-secondary/85 px-6 py-3 backdrop-blur-md sm:-mx-10 sm:px-10">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 font-mono text-[11px] tracking-[0.2em]" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={chapter}
              className="block truncate"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {chapter === 0 ? (
                <span className={tone.kicker}>{label}</span>
              ) : (
                <>
                  <span className={tone.kicker}>
                    {pad(chapter)} / {pad(chapters.length)}
                  </span>
                  <span className="text-cream/80"> · {chapters[chapter - 1].toUpperCase()}</span>
                </>
              )}
            </motion.span>
          </AnimatePresence>
        </div>
        <nav aria-label="Case study chapters" className="hidden shrink-0 items-center gap-1.5 @md:flex">
          {chapters.map((c, i) => (
            <button
              key={c}
              type="button"
              onClick={() => jump(i + 1)}
              aria-label={`Go to ${c}`}
              aria-current={chapter === i + 1 ? "step" : undefined}
              title={c}
              className="group flex h-6 items-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  chapter === i + 1 ? `w-5 ${tone.dot}` : i + 1 < chapter ? "w-1.5 bg-cream/60 group-hover:bg-tertiary" : "w-1.5 bg-cream/25 group-hover:bg-tertiary"
                }`}
              />
            </button>
          ))}
        </nav>
      </div>
      <motion.span aria-hidden="true" style={{ scaleX: progress }} className={`absolute inset-x-0 bottom-0 h-0.5 origin-left ${tone.progress}`} />
    </div>
  );
}

/** A numbered chapter: anchor for the bar's jump dots; reports when it becomes the current chapter. */
export function StudyChapter({
  id,
  n,
  chapters,
  title,
  tone,
  onEnter,
  children,
}: {
  id: string;
  n: number;
  chapters: string[];
  title?: string;
  tone: StudyTone;
  onEnter: (n: number) => void;
  children: ReactNode;
}) {
  return (
    <motion.section
      id={`${id}-ch-${n}`}
      aria-labelledby={title ? `${id}-ch-${n}-title` : undefined}
      aria-label={title ? undefined : chapters[n - 1]}
      className="scroll-mt-20 pt-16 @xl:pt-20"
      onViewportEnter={() => onEnter(n)}
      viewport={{ margin: "-45% 0px -50% 0px" }}
    >
      <Reveal y={10} className={`flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] ${tone.kicker}`}>
        <span>{pad(n)}</span>
        <span className={`h-px w-10 ${tone.rule}`} />
        <span>{chapters[n - 1].toUpperCase()}</span>
      </Reveal>
      {title && (
        <h3 id={`${id}-ch-${n}-title`} className={`mt-4 max-w-[22ch] text-3xl leading-[1.08] text-cream @xl:text-4xl @3xl:text-5xl ${tone.title}`}>
          <RiseWords text={title} />
        </h3>
      )}
      {children}
    </motion.section>
  );
}

function LitWord({ p, range, children }: { p: MotionValue<number>; range: [number, number]; children: string }) {
  const opacity = useTransform(p, range, [0.16, 1]);
  return <motion.span style={{ opacity }}>{children} </motion.span>;
}

/**
 * Progress (0 → 1) of an element through a scroll container: 0 when its top reaches `start` (a fraction of the
 * container's height from its top), 1 when its bottom reaches `end`. Reads the container directly on scroll
 * and resize, so it works for nested scrollers (the drawer, the Writing reading pane) as well as the window.
 */
export function useScrollThrough(
  target: RefObject<HTMLElement>,
  container: RefObject<HTMLElement | null> | undefined,
  start = 0.9,
  end = 0.55,
) {
  const progress = useMotionValue(0);
  useEffect(() => {
    const el = target.current;
    const root = container?.current ?? null;
    if (!el) return;
    const measure = () => {
      const box = root ? root.getBoundingClientRect() : { top: 0, height: window.innerHeight };
      const r = el.getBoundingClientRect();
      const top = r.top - box.top;
      const from = start * box.height; // top line where it starts
      const to = end * box.height - r.height; // top position when its bottom hits the end line
      let p = from === to ? 1 : (from - top) / (from - to);
      // Near the end of the container there may be no room left to scroll it fully through: count it as read
      const atEnd = root ? root.scrollTop + root.clientHeight >= root.scrollHeight - 2 : window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (atEnd && r.top - box.top < box.height) p = 1;
      progress.set(Math.min(1, Math.max(0, p)));
    };
    measure();
    const scroller: HTMLElement | Window = root ?? window;
    scroller.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      scroller.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [target, container, start, end, progress]);
  return progress;
}

/** A paragraph whose words light up one by one as it scrolls through its container. */
export function LitWords({ text, scrollRef, className = "" }: { text: string; scrollRef?: RefObject<HTMLElement | null>; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const progress = useScrollThrough(ref, scrollRef);
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {reduce ? text : words.map((w, i) => <LitWord key={i} p={progress} range={[i / words.length, (i + 1) / words.length]}>{w}</LitWord>)}
    </p>
  );
}

export interface LiveAccent {
  /** LIVE label colour, e.g. "text-ochre" */
  text: string;
  /** Button fill and pulse dot, e.g. "bg-ochre" */
  fill: string;
  /** Text on the fill, e.g. "text-night" */
  on: string;
  /** Soft tint behind the row, e.g. a radial-gradient class */
  tint: string;
}

/**
 * The "live" row at the foot of a case study's facts table. Deliberately unlike the other facts: a pulsing
 * LIVE badge, the study's accent tint, and the address as a filled button whose arrow turns on hover.
 * Must sit inside a <dl> (it renders dt/dd).
 */
export function LiveRow({
  label,
  value,
  url,
  note,
  accent,
  framed = false,
  className = "",
}: {
  label: string;
  value: string;
  url: string;
  note?: string;
  accent: LiveAccent;
  framed?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative col-span-full overflow-hidden bg-secondary p-5 ${framed ? "rounded-2xl border border-cream/10" : ""} ${className}`}>
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${accent.tint}`} />
      <dt className={`relative flex items-center gap-2.5 font-mono text-[10px] tracking-[0.2em] ${accent.text}`}>
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${accent.fill}`} />
          <span className={`relative inline-flex h-2 w-2 rounded-full ${accent.fill}`} />
        </span>
        {/* "Live" / "Live demo" labels already say it; anything else gets a LIVE prefix */}
        {/live/i.test(label) ? label.toUpperCase() : `LIVE · ${label.toUpperCase()}`}
      </dt>
      <dd className="relative mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${value} (opens in a new tab)`}
          data-magnetic="0.15"
          className={`fx-spotlight group/live inline-flex items-center gap-3 rounded-full py-1.5 pl-5 pr-1.5 font-mono text-[13px] font-medium tracking-[0.04em] shadow-[0_14px_30px_-16px_rgba(0,0,0,0.8)] transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0 sm:text-sm ${accent.fill} ${accent.on}`}
        >
          {value}
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15 transition-transform duration-300 group-hover/live:rotate-45">
            <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        </a>
        {note && <span className="font-sans text-[13px] leading-snug text-cream/65">{note}</span>}
      </dd>
    </div>
  );
}
