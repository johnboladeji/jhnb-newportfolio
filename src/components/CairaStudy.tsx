import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Check,
  ChevronDown,
  ClipboardList,
  Crown,
  Heart,
  Home,
  MapPin,
  Mic,
  Moon,
  RotateCcw,
  Sun,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cairaStudy as C } from "../content";
import RollText from "./RollText";
import { Reveal, RiseWords } from "./Reveal";
import { LitWords, LiveRow, StudyBar, StudyChapter, useStudyProgress, type LiveAccent, type StudyTone } from "./StudyKit";

/**
 * Caira case study. Lives inside the drawer's case-study view and switches into Caira's own world:
 * Deep Night Sky panels, terracotta / ochre / sage accents, Fraunces + Figtree.
 *
 * Layout responds to the drawer's width (container queries), not the window: single column on phones,
 * side-by-side phones in the regular drawer (@xl), two-column chapters in full screen (@3xl).
 *
 * Motion: a sticky chapter bar with scroll progress, the mark drawing itself, an orbiting care circle,
 * live "your time / Lagos time" clocks, a group chat that plays out, scroll-revealed words, stacked decision
 * cards with live visuals, an auto-playing onboarding phone, a tappable Elder Mode, a draggable flow strip.
 * Everything is static under reduced motion.
 */

const pad = (n: number) => String(n).padStart(2, "0");
const EASE = [0.2, 0.8, 0.2, 1] as const;
const LAGOS = "Africa/Lagos";

const CHAPTERS = [
  "Overview",
  "The challenge",
  "Who it's for",
  "Key decisions",
  "The product",
  "Visual language",
  "The thinking",
  "Where it stands",
  "Lessons",
];

const ROLE_ICONS: Record<string, LucideIcon> = { crown: Crown, users: Users, heart: Heart, "map-pin": MapPin };
const TAB_ICONS: Record<string, LucideIcon> = { home: Home, clipboard: ClipboardList, activity: Activity, users: Users };

/* ------------------------------------------------------------------------------------------------ */
/* Small building blocks                                                                              */
/* ------------------------------------------------------------------------------------------------ */

// The Caira mark (heart into infinity), traced from the logo. Outer shape + three holes, even-odd fill.
const MARK_PATH =
  "M17.0 7.5 15.7 9.3 13.9 12.8 13.1 14.9 12.3 18.9 12.3 23.4 13.1 27.5 13.9 29.7 16.3 34.1 10.5 36.7 8.2 38.2 5.0 41.2 2.7 44.4 1.5 46.9 0.2 51.6 0.2 57.4 1.4 61.8 2.7 64.7 4.4 67.3 8.1 70.9 12.2 73.5 17.0 75.2 19.3 75.5 22.8 75.5 28.2 74.6 32.4 73.1 38.8 69.4 45.1 64.7 50.1 60.0 55.7 65.1 62.3 70.0 67.6 72.9 70.9 74.3 74.3 75.2 80.2 75.5 82.8 75.2 85.7 74.4 89.6 72.6 91.5 71.4 95.3 67.7 98.0 63.3 99.5 58.8 99.8 56.9 99.8 52.1 98.6 47.3 97.3 44.4 94.5 40.6 92.2 38.5 88.9 36.2 83.6 34.1 85.5 30.4 86.6 27.5 87.5 23.1 87.5 19.8 86.6 14.6 85.8 12.6 83.3 8.1 80.1 4.7 76.9 2.6 71.8 0.6 68.3 0.0 63.8 0.2 59.8 1.2 55.6 3.2 52.8 5.3 49.9 8.2 46.3 4.6 43.8 2.9 41.4 1.7 37.0 0.3 31.8 0.0 27.4 0.8 23.7 2.1 20.2 4.4Z M55.9 54.3 57.4 52.8 63.2 48.2 69.7 44.1 71.8 43.1 75.3 41.9 77.0 41.6 80.2 41.6 83.4 42.3 84.9 43.1 87.4 44.9 88.9 46.6 90.3 48.7 91.2 51.0 91.6 53.0 91.6 56.3 91.2 58.4 90.0 61.2 88.1 63.6 85.5 65.8 82.5 67.1 80.2 67.6 77.0 67.6 72.8 66.5 67.7 63.9 62.1 59.8Z M8.4 55.1 8.8 50.8 9.3 49.5 11.0 46.6 13.1 44.4 14.6 43.4 17.8 42.0 20.2 41.6 23.4 41.6 25.4 41.9 27.9 42.6 31.1 44.1 33.9 45.8 38.2 48.9 44.3 54.2 37.9 60.1 33.0 63.6 27.4 66.5 23.0 67.6 19.6 67.6 17.4 67.1 14.9 66.1 12.6 64.4 10.8 62.3 9.7 60.4 8.8 58.0Z M20.5 18.7 21.3 15.8 23.4 12.5 26.3 10.0 30.3 8.4 32.1 8.1 34.9 8.2 37.1 8.8 39.3 9.9 42.8 12.5 44.9 14.6 48.2 18.9 49.0 19.5 50.4 19.6 51.9 18.6 55.6 13.7 58.9 10.5 60.6 9.4 62.9 8.5 65.3 8.1 67.7 8.1 71.8 9.1 74.3 10.5 76.1 12.2 77.5 14.0 78.8 17.0 79.3 19.0 79.5 22.4 79.1 24.7 78.1 27.9 76.4 30.7 75.0 32.3 73.2 33.6 65.8 37.1 60.9 40.2 56.3 43.4 50.1 48.6 42.5 42.0 38.8 39.4 32.1 35.8 26.6 33.6 23.9 31.2 22.2 28.9 20.9 25.7 20.4 23.1Z";

/** The mark. With `draw`, its outline traces itself in, then the terracotta fill floods in. */
export function CairaMark({ draw = false, className = "" }: { draw?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  if (!draw || reduce) {
    return (
      <svg viewBox="0 0 100 75.6" aria-hidden="true" className={className}>
        <path d={MARK_PATH} fill="#c05a44" fillRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg viewBox="-1 -1 102 77.6" aria-hidden="true" className={className}>
      <motion.path
        d={MARK_PATH}
        fillRule="evenodd"
        stroke="#d4a373"
        strokeWidth={0.6}
        initial={{ pathLength: 0, fill: "rgba(192,90,68,0)" }}
        whileInView={{ pathLength: 1, fill: "rgba(192,90,68,1)" }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ pathLength: { duration: 1.8, ease: "easeInOut" }, fill: { duration: 0.8, delay: 1.5 } }}
      />
    </svg>
  );
}

const CAIRA_TONE: StudyTone = {
  kicker: "text-ochre",
  rule: "bg-ochre/60",
  dot: "bg-ochre",
  progress: "bg-[linear-gradient(90deg,#c05a44,#d4a373)]",
  title: "font-fraunces font-semibold",
};

const CAIRA_LIVE: LiveAccent = {
  text: "text-ochre",
  fill: "bg-ochre",
  on: "text-night",
  tint: "bg-[radial-gradient(120%_160%_at_0%_0%,rgba(212,163,115,0.22),transparent_60%)]",
};

/** Chapter wrapper (shared StudyChapter, in Caira's tone). */
function Chapter(props: { n: number; title?: string; onEnter: (n: number) => void; children: ReactNode }) {
  return <StudyChapter id="caira" chapters={CHAPTERS} tone={CAIRA_TONE} {...props} />;
}

/** A phone frame. Screens are cropped portrait screenshots, pinned to the top. */
function Phone({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative aspect-[9/19] w-full overflow-hidden rounded-[2rem] border-[6px] border-[#0b1020] bg-night shadow-[0_30px_60px_-28px_rgba(0,0,0,0.85)] ${className}`}
    >
      {children}
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-black/50" />
    </div>
  );
}

/** Current time, refreshed every 20s. */
function useNow(ms = 20000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

function timeParts(d: Date, zone: string) {
  const o: Record<string, string> = {};
  new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", minute: "2-digit", hour12: true })
    .formatToParts(d)
    .forEach((p) => (o[p.type] = p.value));
  return o;
}
function hourIn(d: Date, zone: string) {
  const o: Record<string, string> = {};
  new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", minute: "numeric", hourCycle: "h23" })
    .formatToParts(d)
    .forEach((p) => (o[p.type] = p.value));
  return (Number(o.hour) % 24) + Number(o.minute) / 60;
}
function offsetMin(d: Date, zone: string) {
  const p: Record<string, string> = {};
  new Intl.DateTimeFormat("en-US", { timeZone: zone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
    .formatToParts(d)
    .forEach((x) => (p[x.type] = x.value));
  return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute) - d.getTime()) / 60000;
}
function momentIn(h: number) {
  if (h >= 5 && h < 8) return ["Early morning in Lagos.", "Mum's day is just starting."];
  if (h >= 8 && h < 12) return ["Morning in Lagos.", "A good time for her first check-in."];
  if (h >= 12 && h < 16) return ["Afternoon in Lagos.", "Lunch, medicine, and a short rest."];
  if (h >= 16 && h < 20) return ["Evening in Lagos.", "A good time to call home."];
  if (h >= 20 && h < 23) return ["Night in Lagos.", "The house is winding down."];
  return ["It's late in Lagos.", "Mum is probably asleep, and you'll still see her morning check-in."];
}

/* ------------------------------------------------------------------------------------------------ */
/* Cover (used in the Selected Works list)                                                            */
/* ------------------------------------------------------------------------------------------------ */

export function CairaCover() {
  return (
    <div aria-hidden="true" className="relative h-full w-full overflow-hidden bg-[radial-gradient(110%_110%_at_85%_0%,#2a3559_0%,#1a2238_50%,#0f1526_100%)]">
      <div className="absolute -bottom-1/3 left-1/4 h-full w-2/3 rounded-full bg-[radial-gradient(circle,rgba(192,90,68,0.45),transparent_65%)] blur-2xl transition-transform duration-700 ease-out group-hover:-translate-y-[8%]" />
      {/* Care-circle rings */}
      <div className="absolute left-[8%] top-1/2 aspect-square w-[42%] -translate-y-1/2">
        <div className="absolute inset-0 rounded-full border border-ochre/30" />
        <div className="absolute inset-[14%] rounded-full border border-ochre/20" />
        <div className="absolute inset-[30%] rounded-full border border-paper/10" />
        <CairaMark className="absolute left-1/2 top-1/2 w-[34%] -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 ease-out group-hover:scale-110" />
      </div>
      <img src={C.logo} alt="" className="absolute bottom-[8%] left-[6%] w-[24%] opacity-90" />
      <span className="absolute left-[6%] top-[9%] font-mono text-xs tracking-[0.25em] text-ochre">01</span>
      {/* Phones */}
      <div className="absolute -bottom-[18%] right-[22%] w-[21%] rotate-[-8deg] transition-transform duration-700 ease-out group-hover:-translate-y-[6%] group-hover:rotate-[-5deg]">
        <Phone>
          <img src={C.product.flow[0].src} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
        </Phone>
      </div>
      <div className="absolute -bottom-[6%] right-[4%] w-[21%] rotate-[6deg] transition-transform duration-700 ease-out group-hover:-translate-y-[10%] group-hover:rotate-[3deg]">
        <Phone>
          <img src={C.product.onboarding[0].src} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
        </Phone>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* Hero                                                                                               */
/* ------------------------------------------------------------------------------------------------ */

function CareCircle({ mx, my }: { mx: MotionValue<number>; my: MotionValue<number> }) {
  const x = useTransform(mx, (v) => v * 14);
  const y = useTransform(my, (v) => v * 14);
  const nodes = [
    { label: "You, abroad", pos: "left-1/2 top-[5%]" },
    { label: "Siblings", pos: "left-[95%] top-1/2" },
    { label: "Caregiver", pos: "left-1/2 top-[95%]" },
    { label: "Local contact", pos: "left-[5%] top-1/2" },
  ];
  return (
    <motion.div style={{ x, y }} className="relative mx-auto aspect-square w-[min(300px,78%)]" aria-hidden="true">
      <div className="absolute inset-0 rounded-full border-[1.5px] border-ochre/30" />
      <div className="absolute inset-[14%] rounded-full border-[1.5px] border-ochre/20" />
      <div className="absolute inset-[31%] rounded-full border border-paper/10" />
      <div className="caira-orbit absolute inset-0">
        {nodes.map((n) => (
          <div key={n.label} className={`absolute -translate-x-1/2 -translate-y-1/2 ${n.pos}`}>
            <div className="caira-orbit-chip whitespace-nowrap rounded-full bg-paper px-3 py-1.5 font-figtree text-[11px] font-bold text-night shadow-[0_12px_26px_-12px_rgba(0,0,0,0.7)]">
              {n.label}
            </div>
          </div>
        ))}
      </div>
      <div className="absolute left-1/2 top-1/2 flex h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full bg-[radial-gradient(circle_at_32%_28%,#d4a373,#c05a44)] text-paper shadow-[0_22px_44px_-16px_rgba(192,90,68,0.75)]">
        <Heart size={22} fill="currentColor" aria-hidden="true" />
        <b className="font-figtree text-xs">Mum &amp; Dad</b>
        <span className="font-figtree text-[10px] opacity-90">at home</span>
      </div>
    </motion.div>
  );
}

function TimeBar() {
  const now = useNow();
  const zone = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  })();
  const same = zone === LAGOS;
  const city = same ? "" : zone.split("/").pop()!.replace(/_/g, " ").toUpperCase();
  const home = timeParts(now, zone);
  const lagos = timeParts(now, LAGOS);
  const lh = hourIn(now, LAGOS);
  const hh = hourIn(now, zone);
  const diff = Math.round((offsetMin(now, LAGOS) - offsetMin(now, zone)) / 60);
  const gap = same || diff === 0 ? "Same time" : `${Math.abs(diff)} ${Math.abs(diff) === 1 ? "hr" : "hrs"} ${diff > 0 ? "ahead" : "behind"}`;
  const [m1, m2] = momentIn(lh);
  const Icon = (h: number) => (h >= 6 && h < 18 ? <Sun size={13} aria-hidden="true" /> : <Moon size={13} aria-hidden="true" />);

  const Clock = ({ p, accent }: { p: Record<string, string>; accent?: boolean }) => (
    <span className={`font-fraunces text-[clamp(1.75rem,7cqw,2.75rem)] font-semibold leading-none tabular-nums ${accent ? "text-ochre" : "text-paper"}`}>
      {p.hour}
      <span className="caira-colon">:</span>
      {p.minute}
      <small className="ml-1 font-figtree text-[0.34em] font-bold tracking-wider opacity-80">{p.dayPeriod}</small>
    </span>
  );

  return (
    <div role="group" aria-label="Your time and Lagos time" className="rounded-2xl border border-paper/15 bg-night-deep/60 px-4 pb-3 pt-4 backdrop-blur-md @xl:px-6">
      <div className="grid grid-cols-[auto_1fr_auto] items-end gap-x-4 @xl:gap-x-6">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 font-figtree text-[11px] font-bold tracking-wider text-paper/75">
            {Icon(hh)}
            {city ? `YOU, ${city}` : "YOU"}
          </span>
          <Clock p={home} />
        </div>
        <div className="flex flex-col items-center gap-2 self-center pt-2" aria-hidden="true">
          <span className="whitespace-nowrap rounded-full bg-ochre px-2.5 py-0.5 font-figtree text-[11px] font-extrabold text-night">{gap}</span>
          <span className="relative h-0.5 w-full bg-[repeating-linear-gradient(90deg,rgba(212,163,115,0.7)_0_8px,transparent_8px_14px)]">
            <i className="caira-travel absolute -top-1 left-0 h-2.5 w-2.5 rounded-full bg-terra shadow-[0_0_0_4px_rgba(192,90,68,0.3)]" />
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="flex items-center gap-1.5 font-figtree text-[11px] font-bold tracking-wider text-paper/75">
            {Icon(Math.floor(lh))}
            MUM, LAGOS
          </span>
          <Clock p={lagos} accent />
        </div>
      </div>
      <p className="mt-3 border-t border-paper/10 pt-2.5 font-figtree text-sm text-paper/80">
        <b className="text-paper">{m1}</b> {m2}
      </p>
    </div>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const mx = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 });
  const my = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 });
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="relative isolate overflow-hidden rounded-3xl bg-[radial-gradient(110%_110%_at_85%_0%,#2a3559_0%,#1a2238_50%,#0f1526_100%)] p-5 text-paper @xl:p-8"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_80%,rgba(192,90,68,0.28),transparent_50%),radial-gradient(circle_at_60%_10%,rgba(212,163,115,0.16),transparent_45%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(#fdf5e6_1px,transparent_1px)] [background-size:18px_18px]" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <motion.img
          src={C.logo}
          alt="Caira"
          className="h-7 w-auto @xl:h-8"
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        />
        <span className="flex items-center gap-2 rounded-full border border-paper/15 bg-night-deep/50 px-3 py-1.5 font-figtree text-xs font-semibold text-paper/85">
          <span className="caira-ping h-2 w-2 rounded-full bg-[#a9b37e]" aria-hidden="true" />
          {C.status}
        </span>
      </div>

      <div className="mt-8 grid items-center gap-8 @3xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="flex items-center gap-2 font-figtree text-sm font-bold text-ochre">
            <span className="h-0.5 w-5 rounded bg-ochre" aria-hidden="true" />
            {C.tagline}
          </p>
          <h3 className="mt-3 font-fraunces text-[clamp(2.4rem,9cqw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.015em]">
            <RiseWords text={C.headline.split(". ")[0] + "."} className="block" />
            <RiseWords text={C.headline.split(". ")[1]} className="block text-ochre" delay={0.25} />
          </h3>
          <Reveal delay={0.4} y={12}>
            <p className="mt-5 max-w-[46ch] font-figtree text-[16px] leading-relaxed text-paper/85">{C.intro}</p>
          </Reveal>
        </div>
        <Reveal delay={0.3}>
          <CareCircle mx={mx} my={my} />
        </Reveal>
      </div>

      <Reveal delay={0.5} className="mt-8">
        <TimeBar />
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* Origin: words light up as you scroll                                                                */
/* ------------------------------------------------------------------------------------------------ */

function Origin({ scrollRef }: { scrollRef?: RefObject<HTMLElement | null> }) {
  if (!C.origin) return null;
  return (
    <section aria-label={C.origin.kicker} className="relative mt-16">
      <Reveal y={10} className="flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-ochre">
        <Heart size={13} aria-hidden="true" />
        {C.origin.kicker.toUpperCase()}
      </Reveal>
      <span aria-hidden="true" className="pointer-events-none absolute -left-2 top-6 select-none font-fraunces text-[7rem] leading-none text-terra/25">
        &ldquo;
      </span>
      <LitWords
        text={C.origin.text}
        scrollRef={scrollRef}
        className="relative mt-5 font-fraunces text-2xl font-medium leading-snug text-cream @xl:text-3xl @3xl:text-[2.4rem]"
      />
    </section>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* Challenge: the group chat plays out, then Caira answers it                                         */
/* ------------------------------------------------------------------------------------------------ */

function ChatDemo() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // Without IntersectionObserver the conversation simply shows in full, never blank
  const inView = useInView(ref, { once: true, amount: 0.4 }) || typeof IntersectionObserver === "undefined";
  const msgs = C.challenge.chat;
  const total = msgs.length + 2; // messages, divider, Caira card
  const [shown, setShown] = useState(reduce ? total : 0);
  const [typing, setTyping] = useState(false);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    const timers: number[] = [];
    let t = 300;
    setShown(0);
    for (let k = 0; k < total; k++) {
      const them = k < msgs.length && !msgs[k].me;
      if (them) {
        timers.push(window.setTimeout(() => setTyping(true), t));
        t += 750;
      }
      timers.push(
        window.setTimeout(() => {
          setTyping(false);
          setShown(k + 1);
        }, t),
      );
      t += k === msgs.length ? 600 : 700;
    }
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [inView, run, reduce, total, msgs]);

  const pop = { initial: { opacity: 0, y: 10, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.4, ease: EASE } };

  return (
    <div
      ref={ref}
      className="relative w-full rounded-3xl border border-[#e8dcc4] bg-paper p-4 font-figtree text-night shadow-[0_22px_48px_-26px_rgba(0,0,0,0.6)] @xl:p-5"
      aria-label="Example: siblings in Houston, Lagos and London aren't sure whether their mother has been called or taken her medicine. A Caira update answers both questions."
      role="img"
    >
      <div className="mb-4 flex items-center justify-between border-b border-[#e8dcc4] pb-3 text-sm text-[#5e5a52]">
        <b className="text-night">Family</b>
        <span className="rounded-full bg-terra px-2 py-0.5 text-xs font-bold text-white">47 unread</span>
      </div>
      <div className="min-h-[21rem] space-y-2" aria-hidden="true">
        {msgs.map(
          (m, k) =>
            k < shown && (
              <motion.div
                key={`${run}-${k}`}
                {...(reduce ? {} : pop)}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[15px] leading-snug ${
                  m.me ? "ml-auto rounded-br-md bg-[#e3e9d3]" : "rounded-bl-md border border-[#e8dcc4] bg-white"
                }`}
              >
                <small className="block text-[11px] font-bold text-[#5e5a52]">{m.who}</small>
                {m.text}
              </motion.div>
            ),
        )}
        {typing && (
          <div className="flex w-14 gap-1 rounded-2xl border border-[#e8dcc4] bg-white px-3.5 py-3">
            <i className="caira-dot h-1.5 w-1.5 rounded-full bg-[#5e5a52]" />
            <i className="caira-dot h-1.5 w-1.5 rounded-full bg-[#5e5a52] [animation-delay:0.15s]" />
            <i className="caira-dot h-1.5 w-1.5 rounded-full bg-[#5e5a52] [animation-delay:0.3s]" />
          </div>
        )}
        {shown > msgs.length && (
          <motion.div key={`${run}-div`} {...(reduce ? {} : pop)} className="flex items-center gap-3 py-2 text-xs font-bold text-[#a2462f]">
            <span className="h-px flex-1 bg-[#e8dcc4]" />
            With Caira, everyone sees this instead
            <span className="h-px flex-1 bg-[#e8dcc4]" />
          </motion.div>
        )}
        {shown > msgs.length + 1 && (
          <motion.div
            key={`${run}-card`}
            {...(reduce ? {} : { initial: { opacity: 0, y: 16, scale: 0.94 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { type: "spring", stiffness: 260, damping: 22 } })}
            className="rounded-2xl border border-[#e8dcc4] bg-[#e6eadb] px-4 py-3"
          >
            <div className="mb-1 flex items-center gap-2 text-xs text-[#5e5a52]">
              <CairaMark className="h-3.5 w-auto" />
              <b className="text-sm text-night">Caira</b>
              <span>{C.challenge.update.time}</span>
            </div>
            <p className="text-[15px]">
              <b>{C.challenge.update.title}</b> {C.challenge.update.quote}
            </p>
            {C.challenge.update.rows.map((r) => (
              <p key={r} className="mt-1 flex items-center gap-2 text-sm text-[#5e5a52]">
                <Check size={14} strokeWidth={3} className="shrink-0 text-[#6f7a50]" aria-hidden="true" />
                {r}
              </p>
            ))}
          </motion.div>
        )}
      </div>
      {!reduce && shown >= total && (
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          className="absolute -bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-night px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] text-paper transition-colors hover:bg-ochre hover:text-night"
        >
          <RotateCcw size={11} aria-hidden="true" />
          REPLAY
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* Audience: three countries, one home                                                                 */
/* ------------------------------------------------------------------------------------------------ */

function Routes() {
  const reduce = useReducedMotion();
  const ys = [22, 60, 98];
  const paths = ys.map((y) => `M58 ${y} C 150 ${y}, 170 60, 258 60`);
  return (
    <figure className="mt-8">
      <svg viewBox="0 0 320 120" className="w-full" role="img" aria-label={`Families in the ${C.audience.from.join(", ")} caring for a parent in ${C.audience.to}`}>
        {paths.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke="rgba(212,163,115,0.55)"
            strokeWidth={1.2}
            strokeDasharray="4 5"
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
        {!reduce &&
          paths.map((d, i) => (
            <circle key={`dot-${i}`} r={3} fill="#c05a44">
              <animateMotion dur={`${3 + i * 0.5}s`} begin={`${i * 0.6}s`} repeatCount="indefinite" path={d} />
            </circle>
          ))}
        {C.audience.from.map((c, i) => (
          <g key={c}>
            <rect x={4} y={ys[i] - 11} width={54} height={22} rx={11} fill="#fdf5e6" />
            <text x={31} y={ys[i] + 4} textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight={700} fontSize={11} fill="#1a2238">
              {c}
            </text>
          </g>
        ))}
        <circle cx={278} cy={60} r={20} fill="#c05a44" />
        <circle cx={278} cy={60} r={27} fill="none" stroke="rgba(192,90,68,0.4)" />
        <text x={278} y={64} textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight={800} fontSize={10} fill="#fdf5e6">
          NG
        </text>
        <text x={278} y={104} textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight={700} fontSize={10} fill="#d4a373">
          {C.audience.to}
        </text>
      </svg>
    </figure>
  );
}

function Roles() {
  const reduce = useReducedMotion();
  return (
    <ul className="mt-8 grid gap-3 @md:grid-cols-2">
      {C.audience.roles.map((r, i) => {
        const Icon = ROLE_ICONS[r.icon] ?? Users;
        return (
          <motion.li
            key={r.name}
            initial={reduce ? false : { opacity: 0, y: 24, rotate: i % 2 ? 1.5 : -1.5 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
            className="group relative overflow-hidden rounded-2xl border border-cream/10 bg-night/70 p-5 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-ochre/50"
          >
            <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full border border-ochre/15 transition-transform duration-500 group-hover:scale-150" aria-hidden="true" />
            <span className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ochre text-night transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-105">
                <Icon size={20} aria-hidden="true" />
              </span>
              <span className="font-mono text-[10px] tracking-[0.2em] text-cream/50">ROLE {pad(i + 1)}</span>
            </span>
            <h4 className="mt-4 font-fraunces text-xl font-semibold text-cream">{r.name}</h4>
            <p className="mt-1 font-figtree text-[15px] leading-relaxed text-cream/75">{r.text}</p>
          </motion.li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* Key decisions: stacked sticky cards, each with a live visual                                       */
/* ------------------------------------------------------------------------------------------------ */

function RlsVisual() {
  const reduce = useReducedMotion();
  const k = "text-ochre";
  const s = "text-[#a9b37e]";
  const lines: [string, string][][] = [
    [["create policy ", k], ["circle_members_only", "text-paper"]],
    [["  on ", k], ["updates ", "text-paper"], ["for select", k]],
    [["  using ", k], ["(circle_id ", "text-paper"], ["in ", k], ["(", "text-paper"]],
    [["    select ", k], ["circle_id ", "text-paper"], ["from ", k], ["members", "text-paper"]],
    [["    where ", k], ["user_id = ", "text-paper"], ["current_user_id()", s]],
    [["  ));", "text-paper"]],
  ];
  return (
    <div className="rounded-xl border border-paper/10 bg-night-deep p-4 font-mono text-[11px] leading-6 @xl:text-xs">
      <div className="mb-2 flex gap-1.5" aria-hidden="true">
        <i className="h-2 w-2 rounded-full bg-terra" />
        <i className="h-2 w-2 rounded-full bg-ochre" />
        <i className="h-2 w-2 rounded-full bg-sage" />
      </div>
      <pre className="overflow-x-auto whitespace-pre">
        {lines.map((segs, i) => (
          <motion.span
            key={i}
            className="block"
            initial={reduce ? false : { opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.2 + i * 0.12 }}
          >
            {segs.map(([t, c], j) => (
              <span key={j} className={c}>
                {t}
              </span>
            ))}
          </motion.span>
        ))}
      </pre>
      <p className="mt-2 font-figtree text-[11px] text-paper/55">Illustrative policy</p>
    </div>
  );
}

function ElderVisual() {
  return (
    <div className="flex items-center justify-center gap-4 rounded-xl border border-paper/10 bg-night-deep p-6">
      <div className="relative w-full max-w-[15rem]">
        <span className="caira-ripple absolute inset-0 rounded-2xl bg-ochre/40" aria-hidden="true" />
        <span className="relative flex h-16 items-center justify-center gap-2 rounded-2xl bg-ochre font-figtree text-lg font-bold text-night">
          <Heart size={20} fill="currentColor" aria-hidden="true" />
          Reach My Family
        </span>
      </div>
      {/* Dimension marker: the 64px target */}
      <span className="flex h-16 flex-col items-center justify-between text-ochre" aria-label="64 pixels tall">
        <span className="h-px w-3 bg-ochre" />
        <span className="font-mono text-[10px]">64</span>
        <span className="h-px w-3 bg-ochre" />
      </span>
    </div>
  );
}

function VoteVisual() {
  const reduce = useReducedMotion();
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-6 rounded-xl border border-paper/10 bg-night-deep p-5">
      <div className="relative h-24 w-24 shrink-0">
        <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx={40} cy={40} r={r} fill="none" stroke="rgba(253,245,230,0.12)" strokeWidth={6} />
          <motion.circle
            cx={40}
            cy={40}
            r={r}
            fill="none"
            stroke="#d4a373"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={reduce ? false : { strokeDashoffset: 0 }}
            whileInView={{ strokeDashoffset: c * 0.38 }}
            viewport={{ once: true }}
            transition={{ duration: 2.4, ease: "easeInOut" }}
          />
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <b className="font-fraunces text-2xl leading-none text-paper">72h</b>
          <span className="font-figtree text-[10px] text-paper/60">window</span>
        </span>
      </div>
      <div className="font-figtree">
        <p className="text-sm font-bold text-paper">Change coordinator?</p>
        <ul className="mt-2 flex gap-2" aria-label="Two of three votes in">
          {[true, true, false].map((v, i) => (
            <motion.li
              key={i}
              initial={reduce ? false : { scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.6 + i * 0.35 }}
              className={`flex h-8 w-8 items-center justify-center rounded-full ${v ? "bg-sage text-night" : "border border-dashed border-paper/40 text-paper/50"}`}
            >
              {v ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : <span className="caira-dot h-1.5 w-1.5 rounded-full bg-paper/60" />}
            </motion.li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-paper/60">2 of 3 votes · deadlock safeguards</p>
      </div>
    </div>
  );
}

function ConsentVisual() {
  const bars = [0.4, 0.7, 1, 0.6, 0.85, 0.5, 0.95, 0.65, 0.8, 0.45, 0.9, 0.55, 0.75, 0.4];
  return (
    <div className="rounded-xl border border-paper/10 bg-night-deep p-5">
      <div className="flex items-center gap-4">
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-terra text-paper">
          <span className="caira-ripple absolute inset-0 rounded-full bg-terra/50" aria-hidden="true" />
          <Mic size={20} className="relative" aria-hidden="true" />
        </span>
        <div className="flex h-10 flex-1 items-center gap-[3px]" aria-hidden="true">
          {bars.map((b, i) => (
            <span key={i} className="caira-wave w-full rounded-full bg-ochre" style={{ height: `${b * 100}%`, animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 font-figtree text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sage px-3 py-1 font-bold text-night">
          <Check size={12} strokeWidth={3} aria-hidden="true" />
          Voice consent
        </span>
        <span className="rounded-full border border-paper/25 px-3 py-1 text-paper/80">or logged family attestation</span>
        <span className="rounded-full border border-paper/25 px-3 py-1 text-paper/80">NDPR · GDPR</span>
      </div>
    </div>
  );
}

const VISUALS: Record<string, () => JSX.Element> = { rls: RlsVisual, elder: ElderVisual, vote: VoteVisual, consent: ConsentVisual };

function Decisions() {
  return (
    <ol className="mt-10 space-y-5">
      {C.decisions.map((d, i) => {
        const Visual = VISUALS[d.visual];
        return (
          <li key={d.title} className="sticky" style={{ top: `calc(4.25rem + ${i * 0.85}rem)` }}>
            <Reveal y={40}>
              <article className="grid gap-5 rounded-3xl border border-paper/10 bg-night p-5 shadow-[0_-18px_40px_-24px_rgba(0,0,0,0.8)] @xl:p-7 @3xl:grid-cols-[1fr_1fr] @3xl:items-center">
                <div>
                  <span className="font-fraunces text-5xl font-semibold leading-none text-terra">{pad(i + 1)}</span>
                  <h4 className="mt-3 font-fraunces text-2xl font-semibold leading-tight text-paper">{d.title}</h4>
                  <p className="mt-2 font-figtree text-[15px] leading-relaxed text-paper/80">{d.text}</p>
                </div>
                {Visual && <Visual />}
              </article>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* The product                                                                                        */
/* ------------------------------------------------------------------------------------------------ */

function TabsDemo() {
  const [active, setActive] = useState(0);
  const tab = C.product.tabs[active];
  return (
    <div className="mt-8 rounded-3xl border border-cream/10 bg-night/70 p-4 @xl:p-5">
      <div className="min-h-[5.5rem]" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div key={tab.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <p className="font-mono text-[10px] tracking-[0.2em] text-ochre">TAB {pad(active + 1)} / 04</p>
            <p className="mt-1 font-fraunces text-2xl font-semibold text-paper">{tab.name}</p>
            <p className="mt-1 font-figtree text-[15px] text-paper/80">{tab.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Bottom navigation, like the app's */}
      <div role="tablist" aria-label="Caira's four tabs" className="relative mt-4 grid grid-cols-4 gap-1 rounded-2xl bg-night-deep p-1.5">
        {C.product.tabs.map((t, i) => {
          const Icon = TAB_ICONS[t.icon] ?? Home;
          const on = i === active;
          return (
            <button
              key={t.name}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(i)}
              className={`relative flex flex-col items-center gap-1 rounded-xl py-2.5 font-figtree text-[11px] font-bold transition-colors ${
                on ? "text-night" : "text-paper/70 hover:text-ochre"
              }`}
            >
              {on && <motion.span layoutId="caira-tab" className="absolute inset-0 rounded-xl bg-ochre" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
              <Icon size={18} className="relative" aria-hidden="true" />
              <span className="relative">{t.name}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 flex items-center gap-2 font-figtree text-xs text-paper/60">
        <span className="rounded-full border border-dashed border-paper/30 px-2 py-0.5 line-through decoration-terra decoration-2">Tab 5</span>
        Cut from five to four: fewer places to look.
      </p>
    </div>
  );
}

function OnboardingPhone() {
  const reduce = useReducedMotion();
  const screens = C.product.onboarding;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);

  useEffect(() => {
    if (reduce || hold || !inView) return;
    const id = window.setTimeout(() => setI((n) => (n + 1) % screens.length), 3400);
    return () => window.clearTimeout(id);
  }, [i, hold, inView, reduce, screens.length]);

  return (
    <figure ref={ref} onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} className="mx-auto w-full max-w-[15.5rem]">
      <Phone>
        <AnimatePresence initial={false}>
          <motion.img
            key={i}
            src={screens[i].src}
            alt={screens[i].alt}
            className="absolute inset-0 h-full w-full object-cover object-top"
            initial={reduce ? false : { opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          />
        </AnimatePresence>
      </Phone>
      <div className="mt-4 flex items-center justify-center gap-2">
        {screens.map((s, k) => (
          <button
            key={s.src}
            type="button"
            onClick={() => setI(k)}
            aria-label={`Show onboarding screen ${k + 1}`}
            aria-pressed={k === i}
            className={`h-2 rounded-full transition-all duration-300 ${k === i ? "w-7 bg-ochre" : "w-2 bg-terra hover:bg-ochre/70"}`}
          />
        ))}
      </div>
      <figcaption className="mt-2 text-center font-mono text-[10px] tracking-[0.2em] text-cream/60">ONBOARDING</figcaption>
    </figure>
  );
}

function ElderDemo() {
  const reduce = useReducedMotion();
  const e = C.product.elder;
  const [picked, setPicked] = useState<number | null>(null); // 0/1 = check-in choices, 2 = Reach My Family
  const reply = picked === null ? "" : picked === 2 ? e.reach.reply : e.choices[picked].reply;
  const circle = ["Tunde", "Kemi", "You"];
  const tones: Record<string, string> = { ok: "bg-[#5e6a3f]", meh: "bg-[#8a5a22]" };

  return (
    <figure className="mx-auto w-full max-w-[15.5rem]">
      <Phone className="!bg-[#fffbf3]">
        <div className="flex h-full flex-col px-4 pb-4 pt-7 font-figtree text-night">
          <p className="text-center text-[10px] font-semibold text-[#7a746a]">Elder Mode · try it</p>
          <p className="mt-3 font-fraunces text-[1.35rem] leading-tight">{e.greeting}</p>
          <p className="mt-1 text-[13px] text-[#5e5a52]">{e.ask}</p>
          <div className="mt-3 space-y-2">
            {e.choices.map((ch, i) => (
              <button
                key={ch.label}
                type="button"
                aria-pressed={picked === i}
                onClick={() => setPicked(i)}
                className={`block min-h-11 w-full rounded-2xl px-3.5 text-left text-[15px] font-bold text-white transition-transform active:scale-[0.98] ${tones[ch.tone]} ${
                  picked === i ? "shadow-[0_0_0_3px_#fffbf3,0_0_0_5px_#d4a373]" : ""
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
          <div className="relative mt-auto">
            {picked === 2 && !reduce && (
              <>
                <span className="caira-ripple absolute inset-0 rounded-2xl bg-ochre/50" aria-hidden="true" />
                <span className="caira-ripple absolute inset-0 rounded-2xl bg-ochre/40 [animation-delay:0.6s]" aria-hidden="true" />
              </>
            )}
            <button
              type="button"
              aria-pressed={picked === 2}
              onClick={() => setPicked(2)}
              className="relative flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-ochre text-[17px] font-bold text-night transition-transform active:scale-[0.98]"
            >
              <Heart size={18} fill="currentColor" aria-hidden="true" />
              {e.reach.label}
            </button>
          </div>
          <p className="mt-2 min-h-[3.2rem] text-[12px] leading-snug text-[#3f3b35]" aria-live="polite">
            {reply}
          </p>
          <div className="flex h-7 items-center gap-1.5" aria-hidden="true">
            {picked === 2 &&
              circle.map((name, i) => (
                <motion.span
                  key={name}
                  initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.35, type: "spring", stiffness: 300, damping: 18 }}
                  className="inline-flex items-center gap-1 rounded-full bg-[#e6eadb] px-2 py-0.5 text-[10px] font-bold"
                >
                  <Check size={10} strokeWidth={3} className="text-[#5e6a3f]" />
                  {name}
                </motion.span>
              ))}
          </div>
        </div>
      </Phone>
      <figcaption className="mt-4 text-center font-mono text-[10px] tracking-[0.2em] text-cream/60">ELDER MODE · TAP A BUTTON</figcaption>
    </figure>
  );
}

function FlowStrip() {
  const reduce = useReducedMotion();
  return (
    <div className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <h4 className="font-fraunces text-xl font-semibold text-cream">Starting a circle</h4>
        <span className="font-mono text-[10px] tracking-[0.2em] text-cream/50" aria-hidden="true">
          SCROLL →
        </span>
      </div>
      <ol className="fx-deck -mx-6 mt-4 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-4 sm:-mx-10 sm:scroll-px-10 sm:px-10" aria-label="The flow for starting a care circle">
        {C.product.flow.map((s, i) => (
          <motion.li
            key={s.src}
            className="w-[44%] shrink-0 snap-start @xl:w-[30%] @3xl:w-[22%]"
            initial={reduce ? false : { opacity: 0, y: 40, rotate: 4 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
          >
            <figure className="group">
              <div className="transition-transform duration-500 ease-out group-hover:-translate-y-2">
                <Phone>
                  <img src={s.src} alt={s.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
                </Phone>
              </div>
              <figcaption className="mt-3 flex gap-2 font-figtree text-[13px] leading-snug text-cream/80">
                <span className="font-mono text-[11px] text-ochre">{pad(i + 1)}</span>
                {s.caption}
              </figcaption>
            </figure>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

/** "Designed next": a live 24-hour strip in Mum's time, with quiet hours shaded. */
function DayStrip() {
  const now = useNow();
  const h = hourIn(now, LAGOS);
  const quiet = [22, 7]; // illustrative quiet hours
  const pct = (x: number) => `${(x / 24) * 100}%`;
  return (
    <div className="mt-10 rounded-3xl border border-dashed border-ochre/40 p-5">
      <p className="font-mono text-[10px] tracking-[0.2em] text-ochre">DESIGNED NEXT</p>
      <p className="mt-2 font-figtree text-[15px] leading-relaxed text-cream/85">{C.product.next}</p>
      <div className="relative mt-6 h-10" role="img" aria-label="A day in Lagos time, with quiet hours from 10 PM to 7 AM shaded and a marker for the current time">
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-cream/10" />
        <div className="absolute top-1/2 h-2 -translate-y-1/2 rounded-l-full bg-night" style={{ left: 0, width: pct(quiet[1]) }} />
        <div className="absolute top-1/2 h-2 -translate-y-1/2 rounded-r-full bg-night" style={{ left: pct(quiet[0]), right: 0 }} />
        <span className="absolute -top-1 flex -translate-x-1/2 flex-col items-center" style={{ left: pct(9) }}>
          <span className="font-figtree text-[10px] font-bold text-sage">check-in</span>
        </span>
        <span className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sage bg-secondary" style={{ left: pct(9) }} />
        <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: pct(h) }}>
          <span className="caira-ripple absolute inset-0 rounded-full bg-terra/60" />
          <span className="relative block h-3.5 w-3.5 rounded-full bg-terra" />
        </span>
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-cream/50">
        <span>12 AM</span>
        <span className="flex items-center gap-1">
          <Moon size={10} aria-hidden="true" /> quiet hours shaded
        </span>
        <span>12 AM</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* Visual language                                                                                    */
/* ------------------------------------------------------------------------------------------------ */

function Swatches() {
  const [open, setOpen] = useState(0);
  const [copied, setCopied] = useState("");
  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      window.setTimeout(() => setCopied(""), 1500);
    } catch {
      /* clipboard unavailable: nothing to do */
    }
  };
  return (
    <div className="mt-8">
      <ul className="flex h-56 gap-2 @xl:h-64" aria-label="Caira colour palette">
        {C.visual.colours.map((c, i) => {
          const light = c.hex === "#FDF5E6" || c.hex === "#D4A373";
          return (
            <li
              key={c.hex}
              className="min-w-0 transition-[flex-grow] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
              style={{ flexGrow: open === i ? 4 : 1, flexBasis: 0 }}
            >
              <button
                type="button"
                onMouseEnter={() => setOpen(i)}
                onFocus={() => setOpen(i)}
                onClick={() => copy(c.hex)}
                aria-label={`${c.name}, ${c.hex}. Copy hex`}
                className={`flex h-full w-full flex-col justify-end overflow-hidden rounded-2xl border border-cream/10 p-3 text-left ${light ? "text-night" : "text-paper"}`}
                style={{ background: c.hex }}
              >
                <span className={`whitespace-nowrap font-figtree text-sm font-bold transition-opacity duration-300 ${open === i ? "opacity-100" : "opacity-0"}`}>{c.name}</span>
                <span className={`whitespace-nowrap font-mono text-[11px] transition-opacity duration-300 ${open === i ? "opacity-80" : "opacity-0"}`}>
                  {copied === c.hex ? "Copied" : c.hex}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="sr-only" aria-live="polite">
        {copied ? `Copied ${copied}` : ""}
      </p>
    </div>
  );
}

function TypeAndTone() {
  return (
    <div className="mt-6 grid gap-3 @xl:grid-cols-2">
      {C.visual.type.map((t, i) => (
        <Reveal key={t.family} delay={i * 0.1}>
          <div className="group h-full rounded-2xl bg-paper p-5 text-night">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#7a746a]">{t.role.toUpperCase()}</span>
              <span className={`text-4xl transition-transform duration-500 group-hover:scale-110 ${t.family === "Fraunces" ? "font-fraunces font-semibold" : "font-figtree font-bold"}`}>Aa</span>
            </div>
            <p className={`mt-4 text-2xl leading-tight ${t.family === "Fraunces" ? "font-fraunces font-semibold" : "font-figtree font-medium"}`}>{t.sample}</p>
            <p className="mt-3 font-figtree text-sm font-bold text-terra">{t.family}</p>
          </div>
        </Reveal>
      ))}
      <Reveal delay={0.2} className="@xl:col-span-2">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-cream/10 bg-night/70 p-5">
          <span className="font-mono text-[10px] tracking-[0.2em] text-ochre">TONE</span>
          <span className="relative rounded-full bg-[#d32f2f]/80 px-3 py-1 font-figtree text-sm font-extrabold tracking-wide text-white">
            EMERGENCY
            <motion.span
              aria-hidden="true"
              className="absolute left-1 right-1 top-1/2 h-0.5 origin-left bg-paper"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            />
          </span>
          <span className="text-cream/50" aria-hidden="true">
            →
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ochre px-3 py-1 font-figtree text-sm font-bold text-night">
            <Heart size={14} fill="currentColor" aria-hidden="true" />
            Reach My Family
          </span>
          <span className="w-full font-fraunces text-lg text-cream @xl:ml-auto @xl:w-auto">{C.visual.tone}</span>
        </div>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* The thinking (collapsed by default)                                                                */
/* ------------------------------------------------------------------------------------------------ */

function Thinking() {
  const [open, setOpen] = useState(false);
  const t = C.thinking;
  return (
    <div className="mt-6">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="caira-thinking"
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-cream/15 px-5 py-4 text-left transition-colors hover:border-ochre/60"
      >
        <span>
          <span className="block font-fraunces text-xl font-semibold text-cream">Rhetoric &amp; engineering</span>
          <span className="block font-figtree text-sm text-cream/65">The academic layer: CARF, and how it's built.</span>
        </span>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream/20 text-cream transition-all duration-300 group-hover:border-ochre group-hover:bg-ochre group-hover:text-night ${open ? "rotate-180" : ""}`}>
          <ChevronDown size={18} aria-hidden="true" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="caira-thinking"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
            className="overflow-hidden"
          >
            <div className="grid gap-8 pt-8 @3xl:grid-cols-2">
              <div>
                <h4 className="font-mono text-[11px] tracking-[0.25em] text-ochre">{t.rhetoric.title.toUpperCase()}</h4>
                <ol className="mt-4 space-y-4">
                  {t.rhetoric.points.map((p, i) => (
                    <motion.li
                      key={p}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.08 }}
                      className="flex gap-4 font-figtree text-[15px] leading-relaxed text-cream/85"
                    >
                      <span className="font-fraunces text-xl font-semibold leading-none text-terra">{i + 1}</span>
                      {p}
                    </motion.li>
                  ))}
                </ol>
              </div>
              <div>
                <h4 className="font-mono text-[11px] tracking-[0.25em] text-ochre">{t.engineering.title.toUpperCase()}</h4>
                <ul className="mt-4 space-y-2" aria-label="Stack, by layer">
                  {t.engineering.stack.map((l, i) => (
                    <motion.li
                      key={l.layer}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.07 }}
                      className="grid grid-cols-[4.5rem_1fr] items-center gap-3 rounded-xl bg-night/70 px-3 py-2.5"
                    >
                      <span className="font-mono text-[10px] tracking-[0.2em] text-ochre">{l.layer.toUpperCase()}</span>
                      <span className="flex flex-wrap gap-1.5">
                        {l.items.map((it) => (
                          <span key={it} className="rounded-full border border-paper/15 px-2.5 py-0.5 font-figtree text-xs text-paper/85">
                            {it}
                          </span>
                        ))}
                      </span>
                    </motion.li>
                  ))}
                </ul>
                <ul className="mt-5 space-y-2.5">
                  {t.engineering.points.map((p) => (
                    <li key={p} className="flex gap-3 font-figtree text-[15px] leading-relaxed text-cream/85">
                      <Check size={16} className="mt-1 shrink-0 text-sage" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* Status, lessons                                                                                    */
/* ------------------------------------------------------------------------------------------------ */

function Status() {
  const reduce = useReducedMotion();
  const stages = ["Idea", "Build", "Pre-launch", "Pilot", "Launch"];
  const current = 2;
  return (
    <>
      <div className="mt-8" role="img" aria-label={`Stage: ${stages[current]}, of ${stages.join(", ")}`}>
        <div className="relative h-1.5 rounded-full bg-cream/10">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#8b9467,#d4a373)]"
            initial={reduce ? false : { width: 0 }}
            whileInView={{ width: `${(current / (stages.length - 1)) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: EASE }}
          />
          {stages.map((s, i) => (
            <span
              key={s}
              className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
                i < current ? "border-sage bg-sage" : i === current ? "caira-ping border-ochre bg-ochre" : "border-cream/30 bg-secondary"
              }`}
              style={{ left: `${(i / (stages.length - 1)) * 100}%` }}
            />
          ))}
        </div>
        <div className="mt-3 flex justify-between font-figtree text-[11px] font-bold">
          {stages.map((s, i) => (
            <span key={s} className={i === current ? "text-ochre" : i < current ? "text-cream/80" : "text-cream/45"}>
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-8 @3xl:grid-cols-2">
        <div>
          <h4 className="font-mono text-[11px] tracking-[0.25em] text-sage">SHIPPED</h4>
          <ul className="mt-4 space-y-3">
            {C.shipped.map((s, i) => (
              <Reveal key={s} delay={i * 0.06} y={12}>
                <li className="flex gap-3 font-figtree text-[15px] leading-relaxed text-cream/90">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage text-night">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden="true">
                      <motion.path
                        d="M5 12.5l4.5 4.5L19 7.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={reduce ? false : { pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
                      />
                    </svg>
                  </span>
                  {s}
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-[11px] tracking-[0.25em] text-ochre">NEXT</h4>
          <ul className="mt-4 space-y-3">
            {C.next.map((s, i) => (
              <Reveal key={s} delay={i * 0.06} y={12}>
                <li className="flex gap-3 font-figtree text-[15px] leading-relaxed text-cream/90">
                  <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-dashed border-ochre" aria-hidden="true" />
                  {s}
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
        {C.milestones.length > 0 && (
          <div className="@3xl:col-span-2">
            <h4 className="font-mono text-[11px] tracking-[0.25em] text-ochre">MILESTONES</h4>
            <ul className="mt-4 space-y-3">
              {C.milestones.map((s, i) => (
                <Reveal key={s} delay={i * 0.06} y={12}>
                  <li className="flex gap-3 font-figtree text-[15px] leading-relaxed text-cream/90">
                    <span className="mt-1.5 h-3 w-3 shrink-0 rotate-45 bg-ochre" aria-hidden="true" />
                    {s}
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

function Lessons() {
  return (
    <>
      <ol className="mt-8 divide-y divide-cream/10 border-y border-cream/10">
        {C.lessons.map((l, i) => (
          <Reveal key={l.title} delay={i * 0.08}>
            <li className="group grid grid-cols-[3.5rem_1fr] gap-4 py-6 @xl:grid-cols-[5rem_1fr]">
              <span className="caira-outline font-fraunces text-5xl font-semibold leading-none transition-colors duration-500 group-hover:text-terra @xl:text-6xl">
                {i + 1}
              </span>
              <span>
                <span className="block font-fraunces text-2xl font-semibold leading-tight text-cream transition-colors group-hover:text-ochre">{l.title}</span>
                <span className="mt-1 block font-figtree text-[15px] leading-relaxed text-cream/75">{l.text}</span>
              </span>
            </li>
          </Reveal>
        ))}
      </ol>
      <div className="-mx-6 mt-12 overflow-hidden sm:-mx-10" aria-hidden="true">
        <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap font-fraunces text-5xl font-semibold text-terra/80 @xl:text-6xl">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="flex items-center gap-8">
              {C.tagline}
              <CairaMark className="h-8 w-auto opacity-80" />
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* The study                                                                                          */
/* ------------------------------------------------------------------------------------------------ */

export default function CairaStudy({
  scrollRef,
  onLetsWork,
}: {
  scrollRef?: RefObject<HTMLElement | null>;
  onLetsWork: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);
  const progress = useStudyProgress(scrollRef, rootRef);
  const live = C.facts.find((f) => "url" in f && f.url);
  const facts = C.facts.filter((f) => f !== live);


  return (
    <div ref={rootRef} className="@container">
      <StudyBar id="caira" label="CAIRA · CASE STUDY" chapters={CHAPTERS} chapter={chapter} progress={progress} tone={CAIRA_TONE} />

      <Hero />
      <Origin scrollRef={scrollRef} />

      <Chapter n={1} onEnter={setChapter}>
        <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-cream/10 bg-cream/10 @md:grid-cols-2 @3xl:grid-cols-3">
          {facts.map((f, i) => (
            // The last fact stretches to close the row (5 facts in 2 or 3 columns)
            <Reveal key={f.label} delay={i * 0.05} y={14} className={`bg-secondary p-5 ${i === facts.length - 1 ? "@md:col-span-2" : ""}`}>
              <dt className="font-mono text-[10px] tracking-[0.2em] text-ochre">{f.label.toUpperCase()}</dt>
              <dd className="mt-1.5 font-figtree text-[15px] font-medium leading-snug text-cream">{f.value}</dd>
            </Reveal>
          ))}
          {live && "url" in live && live.url && <LiveRow label={live.label} value={live.value} url={live.url} accent={CAIRA_LIVE} />}
        </dl>
      </Chapter>

      <Chapter n={2} title={C.challenge.title} onEnter={setChapter}>
        <div className="mt-8 grid items-start gap-10 @3xl:grid-cols-2">
          <div>
            <Reveal>
              <p className="font-figtree text-[16px] leading-relaxed text-cream/85">{C.challenge.body}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <blockquote className="mt-6 border-l-4 border-terra pl-5 font-fraunces text-2xl font-medium leading-snug text-ochre @xl:text-[1.7rem]">
                {C.challenge.insight}
              </blockquote>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <ChatDemo />
          </Reveal>
        </div>
      </Chapter>

      <Chapter n={3} title={C.audience.title} onEnter={setChapter}>
        <Reveal>
          <p className="mt-6 max-w-[56ch] font-figtree text-[16px] leading-relaxed text-cream/85">{C.audience.body}</p>
        </Reveal>
        <Routes />
        <Roles />
      </Chapter>

      <Chapter n={4} title="Four calls that shaped everything" onEnter={setChapter}>
        <Decisions />
      </Chapter>

      <Chapter n={5} title={C.product.title} onEnter={setChapter}>
        <Reveal>
          <p className="mt-6 max-w-[56ch] font-figtree text-[16px] leading-relaxed text-cream/85">{C.product.body}</p>
        </Reveal>
        <div className="mt-8 grid items-start gap-x-5 gap-y-10 @md:grid-cols-2 @3xl:grid-cols-[1fr_15.5rem_15.5rem]">
          <div className="@md:col-span-2 @3xl:col-span-1">
            <TabsDemo />
          </div>
          <Reveal>
            <OnboardingPhone />
          </Reveal>
          <Reveal delay={0.1}>
            <ElderDemo />
          </Reveal>
        </div>
        <FlowStrip />
        <DayStrip />
      </Chapter>

      <Chapter n={6} title={C.visual.title} onEnter={setChapter}>
        <div className="mt-6 grid items-center gap-6 @xl:grid-cols-[1fr_auto]">
          <Reveal>
            <p className="max-w-[52ch] font-figtree text-[16px] leading-relaxed text-cream/85">{C.visual.body}</p>
          </Reveal>
          <div className="flex items-center justify-center rounded-3xl bg-night p-6">
            <CairaMark draw className="w-28" />
          </div>
        </div>
        <Swatches />
        <TypeAndTone />
      </Chapter>

      <Chapter n={7} title="The thinking" onEnter={setChapter}>
        <Thinking />
      </Chapter>

      <Chapter n={8} title="Pre-launch, and moving" onEnter={setChapter}>
        <Status />
      </Chapter>

      <Chapter n={9} title="What it taught me" onEnter={setChapter}>
        <Lessons />
      </Chapter>

      <Reveal className="mt-12 flex flex-wrap items-center gap-3">
        <a
          href="https://cairacare.com"
          target="_blank"
          rel="noopener noreferrer"
          data-magnetic="0.2"
          className="fx-spotlight group inline-flex items-center gap-2 rounded-full bg-ochre px-5 py-2.5 font-mono text-xs font-medium tracking-[0.15em] text-night transition-colors hover:bg-tertiary active:bg-primary active:text-cream"
        >
          <RollText text="VISIT CAIRACARE.COM" />
          <ArrowUpRight size={14} aria-hidden="true" />
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
