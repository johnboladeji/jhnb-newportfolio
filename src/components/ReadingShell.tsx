import { createContext, useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import TypeLoop from "./TypeLoop";
import TravellingPen from "./TravellingPen";

/**
 * The shared shell for the Writing pages (Content Design, Articles), built on About Me's structure:
 * a pinned header (outlined title, an optional struck-out first draft, a continuously typed headline), a tab
 * row, and a reading pane that scrolls on its own with a reading-progress line. In full screen on a large
 * display the tabs become a list beside the reading pane, like About's split.
 */

export interface ShellTab {
  key: string;
  /** Short index shown before the label, e.g. "01" or "A" ("" for the overview) */
  index: string;
  /** Tab-row label */
  label: string;
  /** Full title in the side list */
  title: string;
  /** Small caps line under the title in the side list */
  meta: string;
  /** Amber dot (e.g. shipped) */
  dot?: boolean;
}

/** The reading pane is the scroll root for scroll-linked effects inside it. */
export const PaneContext = createContext<RefObject<HTMLDivElement> | null>(null);

const useMedia = (query: string) => {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
};

export default function ReadingShell({
  title,
  draft,
  headline,
  full,
  navLabel,
  listTitle,
  tabs,
  render,
}: {
  title: string;
  draft?: string;
  headline: string;
  full: boolean;
  navLabel: string;
  listTitle: string;
  tabs: ShellTab[];
  render: (tab: string, open: (t: string) => void) => ReactNode;
}) {
  const reduce = useReducedMotion();
  const wide = useMedia("(min-width: 1024px)");
  const split = full && wide;
  const [tab, setTab] = useState(tabs[0].key);
  const paneRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const { scrollYProgress } = useScroll({ container: paneRef });
  // The travelling pen gets a right-hand gutter when the pane is wide enough to spare it (not on phones)
  const [penRoom, setPenRoom] = useState(false);
  useEffect(() => {
    const el = paneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setPenRoom(el.clientWidth >= 520));
    ro.observe(el);
    return () => ro.disconnect();
    // The pane element is re-created when the layout switches to the full-screen split
  }, [split]);

  const open = (t: string) => {
    setTab(t);
    paneRef.current?.scrollTo({ top: 0 });
    // Keep the chosen tab visible in the sideways-scrolling tab row
    requestAnimationFrame(() => document.getElementById(`${id}-tab-${t}`)?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" }));
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const fwd = split ? "ArrowDown" : "ArrowRight";
    const back = split ? "ArrowUp" : "ArrowLeft";
    if (e.key !== fwd && e.key !== back) return;
    e.preventDefault();
    const n = (i + (e.key === fwd ? 1 : -1) + tabs.length) % tabs.length;
    open(tabs[n].key);
    document.getElementById(`${id}-tab-${tabs[n].key}`)?.focus();
  };

  const tabProps = (t: ShellTab, i: number) => ({
    type: "button" as const,
    role: "tab",
    id: `${id}-tab-${t.key}`,
    "aria-selected": tab === t.key,
    "aria-controls": `${id}-panel`,
    tabIndex: tab === t.key ? 0 : -1,
    onClick: () => open(t.key),
    onKeyDown: (e: React.KeyboardEvent) => onKey(e, i),
  });

  const pane = (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Reading progress */}
      <motion.span aria-hidden="true" style={{ scaleX: scrollYProgress }} className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left bg-[linear-gradient(90deg,#983a28,#f0937a)]" />
      <div
        ref={paneRef}
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${tab}`}
        className={`@container fx-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6 pt-6 ${penRoom ? "pr-24" : "pr-3"}`}
      >
        <PaneContext.Provider value={paneRef}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={tab} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
              {render(tab, open)}
            </motion.div>
          </AnimatePresence>
        </PaneContext.Provider>
      </div>
      {penRoom && <TravellingPen progress={scrollYProgress} paneRef={paneRef} />}
    </div>
  );

  return (
    <section aria-labelledby="drawer-title" className="flex h-full min-h-0 flex-col">
      {/* Pinned header, like About Me and Selected Works */}
      <header className="shrink-0">
        <h2 id="drawer-title" className="text-stroke font-display text-5xl uppercase leading-none sm:text-6xl group-data-[full=true]/drawer:lg:text-7xl">
          {title}
        </h2>
        {draft && (
          <p aria-hidden="true" className={`mt-3 font-sans text-[16px] font-medium text-cream/45 sm:text-lg`}>
            <span className="relative inline-block">
              {draft}
              <motion.span
                className="absolute left-0 right-0 top-1/2 h-[3px] origin-left rounded-full bg-primary-soft"
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.65, 0, 0.35, 1] }}
              />
            </span>
          </p>
        )}
        <TypeLoop
          text={headline}
          className={`${draft ? "mt-1" : "mt-3"} font-sans font-bold leading-snug tracking-tight text-primary-soft ${
            full ? "max-w-[56rem] text-2xl sm:text-3xl lg:text-[2.6rem] lg:leading-[1.15]" : "max-w-[38rem] text-[1.4rem] sm:text-[1.75rem]"
          }`}
        />
      </header>

      {split ? (
        <div className="mt-6 grid min-h-0 flex-1 grid-cols-[17rem_1fr] gap-12">
          <nav className="flex min-h-0 flex-col">
            <h3 className="mb-4 flex shrink-0 items-center gap-2 border-b border-cream/10 pb-3 font-mono text-xs tracking-[0.25em] text-amber">
              <LayoutGrid size={14} aria-hidden="true" />
              {listTitle}
            </h3>
            <div role="tablist" aria-orientation="vertical" aria-label={navLabel} className="fx-scroll min-h-0 flex-1 space-y-1 overflow-y-auto pr-2">
              {tabs.map((t, i) => {
                const on = tab === t.key;
                return (
                  <button key={t.key} {...tabProps(t, i)} className={`group relative flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors ${on ? "bg-base/40" : "hover:bg-base/20"}`}>
                    {on && <motion.span layoutId={`${id}-side-bar`} className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-primary" />}
                    <span className={`w-7 shrink-0 font-display text-2xl leading-none ${on ? "text-primary-soft" : "text-cream/40 group-hover:text-tertiary"}`}>{t.index || "·"}</span>
                    <span className="min-w-0">
                      <span className={`block font-sans text-[15px] font-bold leading-snug ${on ? "text-primary-soft" : "text-cream group-hover:text-tertiary"}`}>{t.title}</span>
                      <span className="mt-1 flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] text-cream/50">
                        {t.meta}
                        {t.dot && <span className="h-1.5 w-1.5 rounded-full bg-amber" />}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
          {pane}
        </div>
      ) : (
        <>
          <div role="tablist" aria-label={navLabel} className="fx-deck mt-5 flex shrink-0 gap-5 overflow-x-auto border-b border-cream/10">
            {tabs.map((t, i) => {
              const on = tab === t.key;
              return (
                <button
                  key={t.key}
                  {...tabProps(t, i)}
                  className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap pb-3 font-mono text-xs tracking-[0.2em] transition-colors ${on ? "text-primary-soft" : "text-cream/60 hover:text-tertiary"}`}
                >
                  {t.index ? <span className="text-cream/40">{t.index}</span> : <LayoutGrid size={14} aria-hidden="true" />}
                  {t.label.toUpperCase()}
                  {t.dot && <span className="h-1.5 w-1.5 rounded-full bg-amber" />}
                  {on && <motion.span layoutId={`${id}-tab-bar`} className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
          {pane}
        </>
      )}
    </section>
  );
}
