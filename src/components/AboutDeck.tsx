import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Compass,
  Hammer,
  Layers,
  Scale,
  Send,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { about, socials } from "../content";
import RollText from "./RollText";

const ICONS: Record<(typeof about.pages)[number]["icon"], LucideIcon> = {
  compass: Compass,
  layers: Layers,
  hammer: Hammer,
  scale: Scale,
  zap: Zap,
};

type Page =
  | { kind: "story"; kicker: string; title: string; lead?: string; body: readonly string[]; Icon: LucideIcon }
  | { kind: "highlights"; kicker: string; title: string; Icon: LucideIcon }
  | { kind: "closing"; kicker: string; title: string; Icon: LucideIcon };

const PAGES: Page[] = [
  ...about.pages.map((p) => ({
    kind: "story" as const,
    kicker: p.kicker,
    title: p.title,
    lead: "lead" in p ? p.lead : undefined,
    body: p.body,
    Icon: ICONS[p.icon],
  })),
  { kind: "highlights", kicker: "At a glance", title: about.highlightsTitle, Icon: BarChart3 },
  { kind: "closing", kicker: "What's next", title: about.closing.title, Icon: Send },
];

const WHEEL_STEP = 40; // px of wheel travel that turns one page
const WHEEL_LOCK_MS = 650; // ignore the rest of the same gesture while the page glides

/**
 * The About Me overview as a sideways deck of unfilled pages. Every page is `position: sticky; left: 0` inside
 * the scroller, so the next page slides in from the right over the current one, which drifts back (scales down)
 * and fades out as it's covered — so text never sits on text even without a page fill.
 *
 * Colour roles: amber kicker + icon, peach page title, cream body, coral accents. Input: swipe/trackpad (native
 * snap), mouse wheel (one notch = one page), arrow / Page / Home / End keys, prev/next buttons.
 * Reduced motion: no depth/fade effect, instant jumps.
 */
export default function AboutDeck({ onLetsWork }: { onLetsWork: () => void }) {
  const deckRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const reduceMotion = useReducedMotion();
  const total = PAGES.length;

  const goTo = useCallback(
    (i: number) => {
      const deck = deckRef.current;
      if (!deck) return;
      const target = Math.max(0, Math.min(total - 1, i));
      deck.scrollTo({ left: target * deck.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
    },
    [total, reduceMotion],
  );

  // Scroll → current page, progress, and the drift-back + fade on covered pages
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    deck.scrollLeft = 0; // always open on page 1
    let raf = 0;
    const update = () => {
      raf = 0;
      const w = deck.clientWidth || 1;
      const pos = deck.scrollLeft / w;
      setIndex(Math.round(pos));
      setProgress(total > 1 ? pos / (total - 1) : 1);
      if (reduceMotion) return;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const covered = Math.max(0, Math.min(1, pos - i)); // 0 = in view, 1 = fully covered
        card.style.transform = covered > 0 ? `scale(${1 - covered * 0.1}) translateX(${-covered * 6}%)` : "";
        card.style.opacity = covered > 0 ? String(Math.max(0, 1 - covered * 1.8)) : "";
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    deck.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      deck.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduceMotion, total]);

  // Vertical mouse wheel → one page sideways. At either end the wheel falls through to the segment's own scroll.
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    let acc = 0;
    let lockedUntil = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // horizontal trackpad swipes scroll natively
      const w = deck.clientWidth || 1;
      const current = Math.round(deck.scrollLeft / w);
      const dir = e.deltaY > 0 ? 1 : -1;
      if ((dir > 0 && current >= total - 1) || (dir < 0 && current <= 0)) return;
      e.preventDefault();
      const now = performance.now();
      if (now < lockedUntil) return;
      acc += e.deltaY;
      if (Math.abs(acc) < WHEEL_STEP) return;
      acc = 0;
      lockedUntil = now + WHEEL_LOCK_MS;
      goTo(current + dir);
    };
    deck.addEventListener("wheel", onWheel, { passive: false });
    return () => deck.removeEventListener("wheel", onWheel);
  }, [goTo, total]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, number> = { ArrowRight: 1, PageDown: 1, ArrowLeft: -1, PageUp: -1 };
    if (e.key in map) {
      e.preventDefault();
      goTo(index + map[e.key]);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(total - 1);
    }
  };

  const pad = (n: number) => String(n).padStart(2, "0");
  const navBtn =
    "flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream transition-colors hover:border-tertiary hover:bg-tertiary hover:text-base active:border-primary active:bg-primary active:text-cream disabled:pointer-events-none disabled:opacity-30";

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Overview, in pages">
      <div
        ref={deckRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label="Use the arrow keys to turn pages"
        className="fx-deck relative flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain focus-visible:outline-offset-4"
      >
        {/* Snap points live on static, invisible markers: the pages themselves are sticky, which would give the
            browser ambiguous snap positions */}
        {PAGES.map((page, i) => (
          <span
            key={`snap-${page.title}`}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-px snap-start"
            style={{ left: `${i * 100}%` }}
          />
        ))}
        {PAGES.map((page, i) => {
          const active = i === index;
          return (
            <article
              key={page.title}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${total}: ${page.title}`}
              aria-hidden={!active}
              className="sticky left-0 w-full shrink-0"
              style={{ zIndex: i + 1 }}
            >
              <div
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="flex h-full min-h-[22rem] origin-left flex-col py-2 pr-1"
              >
                {/* Kicker: amber number + icon + label; the icon pops in each time its page becomes current */}
                <p className="flex items-center gap-2.5 font-mono text-xs tracking-[0.2em] text-amber">
                  <motion.span
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-amber/40"
                    animate={active && !reduceMotion ? { rotate: [0, -12, 8, 0], scale: [0.8, 1.12, 1] } : { rotate: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <page.Icon size={15} aria-hidden="true" />
                  </motion.span>
                  {pad(i + 1)} <span className="text-cream/30">—</span> {page.kicker.toUpperCase()}
                </p>
                <h3 className="mt-4 font-display text-4xl uppercase leading-[0.95] text-tertiary sm:text-5xl">{page.title}</h3>

                {page.kind === "story" && page.lead && (
                  // Opening statement: bold, larger, set off by an amber rule
                  <p className="mt-5 border-l-2 border-amber pl-4 font-sans text-xl font-bold leading-snug text-cream sm:text-2xl">
                    {page.lead}
                  </p>
                )}
                {page.kind === "story" && (
                  <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-cream/85 sm:text-[16px]">
                    {page.body.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                )}

                {page.kind === "highlights" && (
                  <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-7">
                    {about.highlights.map((h, k) => (
                      <motion.li
                        key={h.label}
                        initial={false}
                        animate={active && !reduceMotion ? { opacity: [0, 1], y: [12, 0] } : { opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: k * 0.08 }}
                      >
                        <span className="block font-display text-5xl uppercase leading-none text-primary-soft">{h.value}</span>
                        <span className="mt-2 block text-sm leading-snug text-cream/75">{h.label}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}

                {page.kind === "closing" && (
                  <div className="mt-5 flex flex-1 flex-col">
                    <p className="text-[15px] leading-relaxed text-cream/85 sm:text-[16px]">{about.closing.body}</p>
                    <p className="mt-4 font-semibold tracking-wide text-primary-soft">{about.availability}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-3 pt-6">
                      <button
                        type="button"
                        onClick={onLetsWork}
                        tabIndex={active ? 0 : -1}
                        data-magnetic="0.2"
                        className="fx-spotlight group inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 font-mono text-xs font-medium tracking-[0.15em] text-base transition-colors hover:bg-tertiary active:bg-primary active:text-cream"
                      >
                        <RollText text={about.closing.cta} />
                        <ArrowRight size={14} aria-hidden="true" />
                      </button>
                      <ul className="flex flex-wrap gap-x-1 gap-y-1">
                        {socials.slice(0, 3).map((s) => (
                          <li key={s.label}>
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              tabIndex={active ? 0 : -1}
                              className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-mono text-xs tracking-[0.15em] text-cream transition-colors hover:bg-tertiary hover:text-base active:bg-primary active:text-cream"
                            >
                              {s.label.toUpperCase()}
                              <ArrowUpRight size={14} aria-hidden="true" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Controls: progress, counter, prev / next */}
      <div className="mt-6 flex items-center gap-4">
        <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-cream/10" aria-hidden="true">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber to-primary-soft transition-[width] duration-200"
            style={{ width: `${Math.max(1 / total, progress) * 100}%` }}
          />
        </div>
        <p className="font-mono text-xs tracking-[0.2em] text-cream/60" aria-live="polite">
          <span className="text-amber">{pad(index + 1)}</span> / {pad(total)}
          <span className="sr-only">: {PAGES[index]?.title}</span>
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous page" data-magnetic="0.3" className={navBtn}>
            <ArrowLeft size={16} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => goTo(index + 1)} disabled={index === total - 1} aria-label="Next page" data-magnetic="0.3" className={navBtn}>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <p className="mt-3 font-mono text-[11px] tracking-[0.15em] text-cream/45" aria-hidden="true">
        SCROLL, SWIPE OR USE ← → TO TURN THE PAGE
      </p>
    </div>
  );
}
