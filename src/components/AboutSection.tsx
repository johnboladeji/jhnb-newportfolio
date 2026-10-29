import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Briefcase } from "lucide-react";
import { about } from "../content";
import AboutDeck from "./AboutDeck";
import CityDemo from "./CityDemo";
import ExperienceList from "./ExperienceList";
import ResearchTeaching from "./ResearchTeaching";
import TypeLoop from "./TypeLoop";

type Segment = "overview" | "experience";

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

/**
 * About Me: a pinned header (outlined title + coral, continuously-typed headline) above two segments that each
 * scroll on their own: Overview (the sideways page deck) and Experience (timeline).
 *   - In the drawer: the segments are tabs.
 *   - Full screen on a large display: they sit side by side.
 * The whole section is exactly the drawer's remaining height, so only the segments scroll; the header never moves.
 */
export default function AboutSection({ full, onLetsWork, onOpenCase }: { full: boolean; onLetsWork: () => void; onOpenCase: (slug: string) => void }) {
  const wide = useMedia("(min-width: 1024px)");
  const split = full && wide;
  const [segment, setSegment] = useState<Segment>("overview");
  const overviewRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const tabs: { key: Segment; label: string; Icon: typeof BookOpen }[] = [
    { key: "overview", label: "Overview", Icon: BookOpen },
    { key: "experience", label: "Experience", Icon: Briefcase },
  ];

  // The two-cities card first: the shortest proof of the argument, before the longer story
  const overview = (
    <>
      <CityDemo />
      <AboutDeck onLetsWork={onLetsWork} />
    </>
  );
  // Research & Teaching first (the scholar before the designer), then the industry timeline
  const experienceList = (
    <>
      <ResearchTeaching scrollRoot={experienceRef} onOpenCase={onOpenCase} />
      <ExperienceList scrollRoot={experienceRef} />
    </>
  );

  const segmentScroll = "fx-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6 pr-3";

  return (
    <section aria-labelledby="drawer-title" className="flex h-full min-h-0 flex-col">
      {/* Pinned header */}
      {/* Title always top-left; in full screen only the headline centres over both segments */}
      <header className="shrink-0">
        <h2 id="drawer-title" className="text-stroke font-display text-5xl uppercase leading-none sm:text-6xl group-data-[full=true]/drawer:lg:text-7xl">
          About Me
        </h2>
        <TypeLoop
          text={about.headline}
          className={`mt-3 font-sans font-bold leading-snug tracking-tight text-primary-soft ${
            full
              ? "max-w-[56rem] text-2xl sm:text-3xl lg:text-[2.6rem] lg:leading-[1.15]"
              : "max-w-[38rem] text-[1.4rem] sm:text-[1.75rem]"
          }`}
        />
      </header>

      {split ? (
        <div className="mt-6 grid min-h-0 flex-1 grid-cols-2 gap-12">
          {(
            [
              ["overview", overviewRef, overview],
              ["experience", experienceRef, experienceList],
            ] as const
          ).map(([key, ref, node]) => {
            const t = tabs.find((x) => x.key === key)!;
            return (
              <div key={key} className="flex min-h-0 flex-col">
                <h3 className="mb-4 flex shrink-0 items-center gap-2 border-b border-cream/10 pb-3 font-mono text-xs tracking-[0.25em] text-amber">
                  <t.Icon size={14} aria-hidden="true" />
                  {t.label.toUpperCase()}
                </h3>
                <div ref={ref} className={segmentScroll}>
                  {node}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div role="tablist" aria-label="About me sections" className="mt-5 flex shrink-0 gap-6 border-b border-cream/10">
            {tabs.map(({ key, label, Icon }) => {
              const selected = segment === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${key}`}
                  aria-selected={selected}
                  aria-controls={`${id}-panel-${key}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setSegment(key)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                      e.preventDefault();
                      const next = segment === "overview" ? "experience" : "overview";
                      setSegment(next);
                      document.getElementById(`${id}-tab-${next}`)?.focus();
                    }
                  }}
                  className={`relative flex items-center gap-2 pb-3 font-mono text-xs tracking-[0.25em] transition-colors ${
                    selected ? "text-primary-soft" : "text-cream/60 hover:text-tertiary"
                  }`}
                >
                  <Icon size={14} aria-hidden="true" />
                  {label.toUpperCase()}
                  {selected && (
                    <motion.span layoutId={`${id}-tab-bar`} className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
          <div
            ref={segment === "overview" ? overviewRef : experienceRef}
            role="tabpanel"
            id={`${id}-panel-${segment}`}
            aria-labelledby={`${id}-tab-${segment}`}
            className={`mt-5 ${segmentScroll}`}
          >
            <motion.div key={segment} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              {segment === "overview" ? overview : experienceList}
            </motion.div>
          </div>
        </>
      )}
    </section>
  );
}
