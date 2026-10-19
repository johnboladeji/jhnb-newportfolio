import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Bot, FileText, User } from "lucide-react";
import { articles } from "../content";
import RollText from "./RollText";
import ReadingShell, { PaneContext, type ShellTab } from "./ReadingShell";
import { Reveal, RiseWords } from "./Reveal";
import { LitWords, LiveRow } from "./StudyKit";

/**
 * Writing → Articles. Same shell as Content Design (pinned header, tabs, reading pane; split list in full
 * screen). The overview shows each article as an editorial card with a cover drawn in code; each article page
 * gives the gist, then an interactive explainer of its ideas, and sends readers to the full text on Medium.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;
type Article = (typeof articles.items)[number];
const A1 = articles.items[0];
const A2 = articles.items[1];
const MEDIUM_ACCENT = {
  text: "text-tertiary",
  fill: "bg-tertiary",
  on: "text-base",
  tint: "bg-[radial-gradient(120%_160%_at_0%_0%,rgba(255,208,161,0.16),transparent_60%)]",
};
const minutes = (a: Article) => parseInt(a.read, 10) || 0;

/** Runs `step` every `ms` while the element is on screen and the reader hasn't taken over. */
function useIdleLoop(step: () => void, ms: number, paused: boolean) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const stepRef = useRef(step);
  stepRef.current = step;
  useEffect(() => {
    if (reduce || paused || !inView) return;
    const id = window.setInterval(() => stepRef.current(), ms);
    return () => window.clearInterval(id);
  }, [reduce, paused, inView, ms]);
  return ref;
}

function Pill({ on, children, onClick }: { on: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] transition-colors sm:text-[11px] ${
        on ? "bg-primary text-cream" : "border border-cream/15 text-cream/65 hover:border-tertiary hover:text-tertiary"
      }`}
    >
      {children}
    </button>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[10px] tracking-[0.25em] text-amber">{children}</p>;
}

/** Medium link as a LiveRow (dl wrapper keeps the dt/dd valid). */
function MediumRow({ a, className = "" }: { a: Article; className?: string }) {
  return (
    <dl className={className}>
      <LiveRow label="Full article on Medium" value={`Read on Medium · ${a.read}`} url={a.url} accent={MEDIUM_ACCENT} framed />
    </dl>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* Covers, drawn in code                                                                              */
/* ------------------------------------------------------------------------------------------------ */

/** Shared backdrop for the covers: warm field, accent glow, dot grid, hatch for padding. */
function CoverDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#2a0d03" />
        <stop offset="0.7" stopColor="#150600" />
      </linearGradient>
      <radialGradient id={`${id}-glow`} cx="0.85" cy="0.1" r="0.7">
        <stop offset="0" stopColor="#f0937a" stopOpacity="0.32" />
        <stop offset="1" stopColor="#f0937a" stopOpacity="0" />
      </radialGradient>
      <pattern id={`${id}-dots`} width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="1" fill="#f1e6ce" fillOpacity="0.09" />
      </pattern>
      <pattern id={`${id}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="2" height="6" fill="#f0937a" fillOpacity="0.35" />
      </pattern>
    </defs>
  );
}

const MONO = "IBM Plex Mono, monospace";
const COVER_EASE = "transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]";

/**
 * 01 · Auto Layout: a Figma-style canvas. A selected "Profile card" frame (handles, hatched padding, a spacing
 * marker, a hugging button and a filling field) beside its Auto Layout properties. Hover opens up the spacing.
 */
function AutoLayoutCover() {
  const reduce = useReducedMotion();
  const props: [string, string][] = [
    ["Gap", "16"],
    ["Padding", "20"],
    ["Width", "Hug"],
    ["Field", "Fill"],
  ];
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <CoverDefs id="al" />
      <rect width="640" height="360" fill="url(#al-bg)" />
      <rect width="640" height="360" fill="url(#al-glow)" />
      <rect width="640" height="360" fill="url(#al-dots)" />

      <text x="28" y="40" fontFamily={MONO} fontSize="12" letterSpacing="3" fill="#ffd0a1">01</text>

      {/* Title */}
      <g fontFamily="Anton, Impact, sans-serif" fontSize="62" fill="none" stroke="#f1e6ce" strokeWidth="1.4" letterSpacing="1">
        <text x="26" y="236">AUTO</text>
        <text x="26" y="300">LAYOUT</text>
      </g>
      <text x="28" y="326" fontFamily={MONO} fontSize="11" letterSpacing="3" fill="#ffd0a1">FOUR MENTAL MODELS</text>

      {/* Selected frame */}
      <text x="244" y="50" fontFamily={MONO} fontSize="10.5" fill="#ffd0a1">⧉ Profile card</text>
      <rect x="244" y="58" width="228" height="262" rx="10" fill="#1d0902" stroke="#ffd0a1" strokeWidth="1.5" />
      <rect x="245" y="59" width="226" height="18" fill="url(#al-hatch)" />
      <rect x="245" y="59" width="18" height="260" fill="url(#al-hatch)" />
      {[
        [244, 58],
        [472, 58],
        [244, 320],
        [472, 320],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 4} y={y - 4} width="8" height="8" fill="#f1e6ce" stroke="#ffd0a1" />
      ))}

      {/* Row: avatar + name (a nested horizontal frame) */}
      <rect x="264" y="78" width="188" height="56" rx="8" fill="none" stroke="#f0937a" strokeDasharray="4 4" strokeOpacity="0.8" />
      <circle cx="292" cy="106" r="17" fill="#f0937a" />
      <rect x="318" y="96" width="104" height="8" rx="4" fill="#f1e6ce" fillOpacity="0.85" />
      <rect x="318" y="112" width="64" height="7" rx="3.5" fill="#f1e6ce" fillOpacity="0.4" />

      {/* Everything below shifts when the spacing opens up */}
      <g className={`${COVER_EASE} group-hover:translate-y-[12px]`}>
        <line x1="358" y1="136" x2="358" y2="150" stroke="#f0937a" strokeWidth="1.2" />
        <rect x="364" y="137" width="24" height="12" rx="6" fill="#f0937a" />
        <text x="376" y="146" textAnchor="middle" fontFamily={MONO} fontSize="8.5" fill="#150600">16</text>
        <rect x="264" y="152" width="188" height="7" rx="3.5" fill="#f1e6ce" fillOpacity="0.3" />
        <rect x="264" y="166" width="150" height="7" rx="3.5" fill="#f1e6ce" fillOpacity="0.3" />
        <rect x="264" y="180" width="170" height="7" rx="3.5" fill="#f1e6ce" fillOpacity="0.3" />
      </g>
      <g className={`${COVER_EASE} group-hover:translate-y-[22px]`}>
        {/* Fill: the field stretches to the frame */}
        <rect x="264" y="202" width="188" height="30" rx="8" fill="none" stroke="#f1e6ce" strokeOpacity="0.35" />
        <text x="276" y="221" fontFamily="Space Grotesk, sans-serif" fontSize="11" fill="#f1e6ce" fillOpacity="0.5">Your name</text>
        <text x="452" y="246" textAnchor="end" fontFamily={MONO} fontSize="8.5" fill="#ffd0a1">↔ FILL</text>
        {/* Hug: the button wraps its label */}
        <rect x="264" y="254" width="112" height="32" rx="16" fill="#983a28" />
        <text x="320" y="274" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="12" fill="#f1e6ce">Save Changes</text>
        <rect x="384" y="262" width="40" height="16" rx="8" fill="#ffd0a1" />
        <text x="404" y="273.5" textAnchor="middle" fontFamily={MONO} fontSize="8.5" fill="#150600">HUG</text>
      </g>

      {/* Properties panel */}
      <g fontFamily={MONO}>
        <rect x="490" y="58" width="128" height="262" rx="10" fill="#150600" fillOpacity="0.85" stroke="#f1e6ce" strokeOpacity="0.12" />
        <text x="502" y="80" fontSize="10" fill="#f1e6ce" fillOpacity="0.85">Auto layout</text>
        <rect x="502" y="92" width="48" height="24" rx="6" fill="#983a28" />
        <text x="526" y="108.5" textAnchor="middle" fontSize="12" fill="#f1e6ce">↓</text>
        <rect x="556" y="92" width="48" height="24" rx="6" fill="none" stroke="#f1e6ce" strokeOpacity="0.2" />
        <text x="580" y="108.5" textAnchor="middle" fontSize="12" fill="#f1e6ce" fillOpacity="0.5">→</text>
        {props.map(([k, v], i) => (
          <g key={k}>
            <text x="502" y={144 + i * 30} fontSize="9" fill="#f1e6ce" fillOpacity="0.5">{k.toUpperCase()}</text>
            <rect x="560" y={132 + i * 30} width="46" height="18" rx="5" fill="#f1e6ce" fillOpacity="0.06" stroke="#ffd0a1" strokeOpacity="0.35" />
            <text x="583" y={144.5 + i * 30} textAnchor="middle" fontSize="9.5" fill="#ffd0a1">{v}</text>
          </g>
        ))}
        <text x="502" y="296" fontSize="8.5" fill="#f1e6ce" fillOpacity="0.4">⌘ Y  OUTLINE MODE</text>
      </g>

      {/* A cursor drifting over to adjust the gap */}
      {!reduce && (
        <path d="M0 0 L0 15 L4 11 L7 18 L10 17 L7 10 L12 10 Z" fill="#f1e6ce" stroke="#150600" strokeWidth="1">
          <animateMotion dur="6s" repeatCount="indefinite" path="M600 330 C 560 250, 600 170, 588 140 C 580 120, 600 300, 600 330" />
        </path>
      )}
    </svg>
  );
}

/**
 * 02 · Vibe coding: a loose "vibe" squiggle runs into a PRD page (problem, users, success, acceptance), and the
 * page beams into an AI terminal writing code from the prompt. Hover lets the code run further.
 */
function PrdCover() {
  const reduce = useReducedMotion();
  const sections: [string, number][] = [
    ["PROBLEM", 92],
    ["USERS", 74],
    ["SUCCESS", 84],
  ];
  const code: [number, string, number][] = [
    [0, "#ffd0a1", 70],
    [12, "#f1e6ce", 120],
    [12, "#f0937a", 90],
    [24, "#f1e6ce", 104],
    [24, "#f1e6ce", 64],
    [12, "#f0937a", 82],
    [0, "#ffd0a1", 30],
  ];
  const beam = "M330 152 C 350 152, 360 140, 384 140";
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <CoverDefs id="prd" />
      <rect width="640" height="360" fill="url(#prd-bg)" />
      <rect width="640" height="360" fill="url(#prd-glow)" />
      <rect width="640" height="360" fill="url(#prd-dots)" />

      <text x="28" y="40" fontFamily={MONO} fontSize="12" letterSpacing="3" fill="#ffd0a1">02</text>

      {/* The vibe: loose and wandering */}
      <text x="28" y="86" fontFamily={MONO} fontSize="10" letterSpacing="3" fill="#f1e6ce" fillOpacity="0.5">THE VIBE</text>
      <path d="M28 120 C 48 92, 62 150, 82 118 S 116 84, 132 128 S 160 150, 176 122" fill="none" stroke="#ffd0a1" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 6">
        {!reduce && <animate attributeName="stroke-dashoffset" from="0" to="-44" dur="2.4s" repeatCount="indefinite" />}
      </path>

      {/* The PRD page */}
      <g className={`${COVER_EASE} group-hover:-translate-y-[4px]`}>
        <g transform="rotate(-4 250 150)">
          <rect x="178" y="52" width="150" height="196" rx="8" fill="#f1e6ce" />
          <text x="194" y="80" fontFamily="Anton, Impact, sans-serif" fontSize="20" fill="#150600">PRD</text>
          <rect x="236" y="69" width="70" height="7" rx="3.5" fill="#150600" fillOpacity="0.2" />
          {sections.map(([label, w], i) => (
            <g key={label}>
              <text x="194" y={104 + i * 30} fontFamily={MONO} fontSize="8" letterSpacing="1.5" fill="#983a28">{label}</text>
              {label === "USERS" && <rect x="192" y={109 + i * 30} width={w + 4} height="9" rx="2" fill="#f2a65a" fillOpacity="0.55" />}
              <rect x="194" y={111 + i * 30} width={w} height="5" rx="2.5" fill="#150600" fillOpacity="0.35" />
            </g>
          ))}
          <text x="194" y="194" fontFamily={MONO} fontSize="8" letterSpacing="1.5" fill="#983a28">ACCEPTANCE</text>
          {[86, 70, 96].map((w, i) => (
            <g key={i}>
              <rect x="194" y={202 + i * 13} width="8" height="8" rx="2" fill="#983a28" />
              <path d={`M196 ${206 + i * 13} l2 2 l3 -4`} fill="none" stroke="#f1e6ce" strokeWidth="1.3" strokeLinecap="round" />
              <rect x="208" y={203.5 + i * 13} width={w} height="5" rx="2.5" fill="#150600" fillOpacity="0.3" />
            </g>
          ))}
        </g>
      </g>

      {/* The beam: PRD → prompt */}
      <path d={beam} fill="none" stroke="#f0937a" strokeWidth="1.5" strokeOpacity="0.6" />
      {!reduce &&
        [0, 0.6, 1.2].map((d) => (
          <circle key={d} r="3" fill="#ffd0a1">
            <animateMotion dur="1.8s" begin={`${d}s`} repeatCount="indefinite" path={beam} />
          </circle>
        ))}

      {/* The AI terminal */}
      <g fontFamily={MONO}>
        <rect x="384" y="62" width="230" height="200" rx="10" fill="#150600" stroke="#f0937a" strokeOpacity="0.45" />
        {["#983a28", "#f2a65a", "#ffd0a1"].map((c, i) => (
          <circle key={c} cx={400 + i * 12} cy="78" r="3.5" fill={c} />
        ))}
        <rect x="560" y="70" width="40" height="16" rx="8" fill="#f0937a" />
        <text x="580" y="81.5" textAnchor="middle" fontSize="8.5" fill="#150600">AI</text>
        <text x="398" y="108" fontSize="10.5" fill="#ffd0a1">&gt; build checkout per PRD §3</text>
        <g className={`${COVER_EASE} [transform-box:fill-box] origin-left group-hover:scale-x-110`}>
          {code.map(([indent, c, w], i) => (
            <rect key={i} x={398 + indent} y={124 + i * 16} width={w} height="6" rx="3" fill={c} fillOpacity={c === "#f1e6ce" ? 0.45 : 0.85} />
          ))}
        </g>
        <rect x="432" y="230" width="7" height="13" fill="#ffd0a1">
          {!reduce && <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />}
        </rect>
      </g>

      {/* Title */}
      <g fontFamily="Anton, Impact, sans-serif" fontSize="54" fill="none" stroke="#f1e6ce" strokeWidth="1.4" letterSpacing="1">
        <text x="26" y="300">PRD =</text>
        <text x="26" y="352">PROMPT</text>
      </g>
      <text x="402" y="300" fontFamily={MONO} fontSize="11" letterSpacing="3" fill="#ffd0a1">DON’T LET THE VIBE</text>
      <text x="402" y="318" fontFamily={MONO} fontSize="11" letterSpacing="3" fill="#ffd0a1">BECOME A DRIFT</text>
    </svg>
  );
}

const COVERS: Record<string, () => JSX.Element> = { "auto-layout": AutoLayoutCover, "prd-prompt": PrdCover };

/* ------------------------------------------------------------------------------------------------ */
/* Auto Layout explainer: four live models                                                            */
/* ------------------------------------------------------------------------------------------------ */

function Frame({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-xl border border-dashed border-tertiary/50 ${className}`}>
      <span className="absolute -top-2.5 left-3 rounded bg-secondary px-1.5 font-mono text-[9px] tracking-[0.15em] text-tertiary">{label}</span>
      {children}
    </div>
  );
}

function Chip({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.span layout transition={{ type: "spring", stiffness: 300, damping: 28 }} className={`flex shrink-0 items-center justify-center rounded-lg bg-primary-soft/90 font-mono text-[11px] text-base ${className}`}>
      {children}
    </motion.span>
  );
}

function BeltDemo() {
  const [row, setRow] = useState(true);
  const [took, setTook] = useState(false);
  const ref = useIdleLoop(() => setRow((r) => !r), 2400, took);
  return (
    <div ref={ref}>
      <div className="mb-4 flex gap-2">
        <Pill on={row} onClick={() => { setTook(true); setRow(true); }}>HORIZONTAL →</Pill>
        <Pill on={!row} onClick={() => { setTook(true); setRow(false); }}>VERTICAL ↓</Pill>
      </div>
      <Frame label={row ? "FLOW · ROW" : "FLOW · COLUMN"} className="flex min-h-[11rem] items-center justify-center p-5">
        <motion.div layout className={`flex gap-3 ${row ? "flex-row" : "flex-col"}`}>
          {["A", "B", "C"].map((x) => (
            <Chip key={x} className="h-12 w-12">{x}</Chip>
          ))}
        </motion.div>
      </Frame>
    </div>
  );
}

function ContainerDemo() {
  const [gap, setGap] = useState(12);
  const [took, setTook] = useState(false);
  const ref = useIdleLoop(() => setGap((g) => (g >= 36 ? 8 : g + 8)), 1400, took);
  return (
    <div ref={ref}>
      <label className="mb-4 flex items-center gap-3 font-mono text-[11px] tracking-[0.12em] text-cream/70">
        PARENT SPACING
        <input
          type="range"
          min={4}
          max={40}
          step={4}
          value={gap}
          onChange={(e) => { setTook(true); setGap(Number(e.target.value)); }}
          className="flex-1 accent-[#f0937a]"
        />
        <span className="w-10 text-right text-tertiary">{gap}px</span>
      </label>
      <Frame label="PARENT · SETS THE RULES" className="flex min-h-[11rem] items-center p-5">
        <motion.div layout className="flex w-full flex-col" style={{ gap }}>
          {["Child", "Child", "Child"].map((x, i) => (
            <Chip key={i} className="h-8 w-full">{x}</Chip>
          ))}
        </motion.div>
      </Frame>
    </div>
  );
}

function DictatorDemo() {
  const modes = [
    { id: "fixed", name: "Fixed", metaphor: "Brick wall", boss: "You set the size" },
    { id: "hug", name: "Hug", metaphor: "Glove", boss: "The content sets the size" },
    { id: "fill", name: "Fill", metaphor: "Rubber band", boss: "The container sets the size" },
  ];
  const [m, setM] = useState(1);
  const [long, setLong] = useState(false);
  const [took, setTook] = useState(false);
  const ref = useIdleLoop(() => setLong((l) => !l), 1800, took);
  const mode = modes[m].id;
  return (
    <div ref={ref}>
      <div className="mb-4 flex flex-wrap gap-2">
        {modes.map((x, i) => (
          <Pill key={x.id} on={m === i} onClick={() => { setTook(true); setM(i); }}>
            {x.name.toUpperCase()}
          </Pill>
        ))}
        <Pill on={long} onClick={() => { setTook(true); setLong((l) => !l); }}>
          LABEL: {long ? "LONG" : "SHORT"}
        </Pill>
      </div>
      <Frame label="PARENT · 100%" className="flex min-h-[11rem] flex-col items-start justify-center gap-3 p-5">
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className={`flex h-11 items-center justify-center overflow-hidden rounded-full bg-primary px-4 font-sans text-sm font-bold text-cream ${
            mode === "fixed" ? "w-24 whitespace-nowrap" : mode === "fill" ? "w-full" : "w-auto whitespace-nowrap"
          }`}
        >
          {long ? "Save Changes" : "Save"}
        </motion.span>
        <span className="font-mono text-[11px] text-tertiary">
          {modes[m].metaphor.toUpperCase()} · <span className="text-cream/70">{modes[m].boss}</span>
        </span>
      </Frame>
    </div>
  );
}

function NestingDemo() {
  const [outline, setOutline] = useState(true);
  const [took, setTook] = useState(false);
  const ref = useIdleLoop(() => setOutline((o) => !o), 2600, took);
  const box = () =>
    outline ? "relative rounded-lg border border-dashed border-tertiary/60 p-2.5 pt-4" : "relative rounded-lg border border-transparent p-2.5 pt-4";
  const tag = (label: string) =>
    outline && <span className="absolute -top-2 left-2 rounded bg-secondary px-1 font-mono text-[8px] tracking-[0.15em] text-tertiary">{label}</span>;
  return (
    <div ref={ref}>
      <div className="mb-4 flex gap-2">
        <Pill on={outline} onClick={() => { setTook(true); setOutline((o) => !o); }}>
          OUTLINE MODE · CTRL/⌘ + Y
        </Pill>
      </div>
      <div className="flex min-h-[11rem] items-center justify-center rounded-xl bg-base/40 p-4">
        <div className={`${box()} w-full max-w-[17rem] bg-cream/[0.04] transition-colors`}>
          {tag("VERTICAL")}
          <div className={`${box()} flex items-center gap-3 transition-colors`}>
            {tag("HORIZONTAL")}
            <span className="h-10 w-10 shrink-0 rounded-full bg-primary-soft" />
            <div className={`${box()} flex flex-1 flex-col gap-1.5 transition-colors`}>
              {tag("VERTICAL")}
              <span className="h-2 w-4/5 rounded bg-cream/80" />
              <span className="h-2 w-1/2 rounded bg-cream/40" />
            </div>
          </div>
          <span className="mt-3 block h-2 w-full rounded bg-cream/25" />
          <span className="mt-1.5 block h-2 w-3/4 rounded bg-cream/25" />
        </div>
      </div>
    </div>
  );
}

const DEMOS: Record<string, () => JSX.Element> = { belt: BeltDemo, container: ContainerDemo, dictator: DictatorDemo, nesting: NestingDemo };

function MentalModels() {
  const [i, setI] = useState(0);
  const model = A1.models[i];
  const Demo = DEMOS[model.id];
  return (
    <div className="my-8">
      <Label>FOUR MENTAL MODELS · TRY THEM</Label>
      <div role="tablist" aria-label="Mental models" className="mt-3 grid grid-cols-2 gap-1.5 @xl:grid-cols-4">
        {A1.models.map((m, k) => {
          const on = k === i;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setI(k)}
              className={`relative rounded-xl px-3 py-2.5 text-left transition-colors ${on ? "text-cream" : "bg-base/30 text-cream/70 hover:text-tertiary"}`}
            >
              {on && <motion.span layoutId="al-model" className="absolute inset-0 rounded-xl bg-primary" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative block font-display text-xl leading-none">{k + 1}</span>
              <span className="relative mt-1 block font-sans text-[13px] font-bold leading-tight">{m.name.replace(/^The /, "")}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 grid gap-5 rounded-2xl border border-cream/10 bg-base/30 p-4 @xl:p-5 @3xl:grid-cols-[1fr_1.1fr] @3xl:items-center">
        <AnimatePresence mode="wait">
          <motion.div key={model.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <p className="font-mono text-[10px] tracking-[0.2em] text-amber">{model.idea.toUpperCase()}</p>
            <p className="mt-1 font-sans text-2xl font-bold leading-tight text-cream">{model.name}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-cream/80">{model.text}</p>
          </motion.div>
        </AnimatePresence>
        <div className="pt-2">
          <Demo key={model.id} />
        </div>
      </div>
    </div>
  );
}

function RuleCard() {
  const parts = [
    { k: "Fixed", c: "bg-cream/15 text-cream" },
    { k: "Hug", c: "bg-tertiary text-base" },
    { k: "Fill", c: "bg-primary text-cream" },
  ];
  return (
    <Reveal className="my-8">
      <div className="rounded-2xl border border-cream/10 bg-[linear-gradient(135deg,rgba(152,58,40,0.35),rgba(21,6,0,0.4))] p-5">
        <Label>THE QUICK RULE</Label>
        <div className="mt-3 flex flex-wrap gap-2">
          {parts.map((p, i) => (
            <motion.span
              key={p.k}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 300, damping: 20 }}
              className={`rounded-full px-3 py-1 font-mono text-xs ${p.c}`}
            >
              {p.k}
            </motion.span>
          ))}
        </div>
        <p className="mt-3 font-serif text-xl italic leading-snug text-tertiary">{A1.rule}</p>
      </div>
    </Reveal>
  );
}

function Pitfalls() {
  return (
    <div className="my-8">
      <Label>COMMON PITFALLS</Label>
      <ol className="mt-3 grid gap-2 @xl:grid-cols-3">
        {A1.pitfalls.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08} y={14}>
            <li className="group h-full rounded-2xl border border-cream/10 bg-base/30 p-4 transition-colors hover:border-tertiary/40">
              <span className="text-stroke font-display text-3xl leading-none transition-colors group-hover:text-primary-soft">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-2 font-sans text-[15px] font-bold text-cream">{p.title}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-cream/75">{p.fix}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* PRD explainer                                                                                      */
/* ------------------------------------------------------------------------------------------------ */

function WhoDoesWhat() {
  const reduce = useReducedMotion();
  const code = ["export function Checkout() {", "  const cart = useCart();", "  return <Summary items={cart} />;", "}", "// …generated in seconds"];
  const prd = ["Who is this for?", "What problem is worth solving?", "What does success look like?", "What’s out of scope?"];
  return (
    <div className="my-8 grid gap-3 @xl:grid-cols-2">
      <div className="rounded-2xl border border-cream/10 bg-base/40 p-4">
        <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-cream/60">
          <Bot size={13} aria-hidden="true" /> AI · {A2.split.ai.toUpperCase()}
        </p>
        <pre className="mt-3 overflow-hidden font-mono text-[11.5px] leading-6 text-cream/80">
          {code.map((l, i) => (
            <motion.span
              key={i}
              className="block"
              initial={reduce ? false : { opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.12 }}
            >
              {l}
            </motion.span>
          ))}
        </pre>
      </div>
      <div className="rounded-2xl bg-primary p-4 text-cream">
        <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-cream/80">
          <User size={13} aria-hidden="true" /> YOU · {A2.split.human.toUpperCase()}
        </p>
        <ul className="mt-3 space-y-2">
          {prd.map((q, i) => (
            <motion.li
              key={q}
              initial={reduce ? false : { opacity: 0, x: 8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.12 }}
              className="flex items-center gap-2 font-sans text-[14px] font-medium"
            >
              <FileText size={13} className="shrink-0 text-tertiary" aria-hidden="true" />
              {q}
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Drift vs focus: without a PRD the AI's output scatters; with one it converges on the target. */
function DriftFocus() {
  const reduce = useReducedMotion();
  const [prd, setPrd] = useState(true);
  const [took, setTook] = useState(false);
  const ref = useIdleLoop(() => setPrd((p) => !p), 2800, took);
  const n = 9;
  return (
    <div ref={ref} className="my-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Label>DRIFT OR FOCUS</Label>
        <div className="flex gap-2">
          <Pill on={!prd} onClick={() => { setTook(true); setPrd(false); }}>NO PRD</Pill>
          <Pill on={prd} onClick={() => { setTook(true); setPrd(true); }}>WITH A PRD</Pill>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-cream/10 bg-base/40" role="img" aria-label={prd ? "With a PRD, every output points at the same target." : "Without a PRD, outputs scatter in every direction."}>
        <svg viewBox="0 0 320 150" className="w-full">
          <circle cx={262} cy={75} r={26} fill="none" stroke="rgba(255,208,161,0.25)" />
          <circle cx={262} cy={75} r={14} fill="none" stroke="rgba(255,208,161,0.45)" />
          <circle cx={262} cy={75} r={4} fill="#ffd0a1" />
          {Array.from({ length: n }, (_, i) => {
            const y = 20 + i * 13.5;
            // With a PRD every line points at the target; without one, each heads off at its own angle
            const scatter = ((((i * 47) % 140) - 70) * Math.PI) / 180;
            const angle = prd ? Math.atan2(75 - y, 262 - 40) : scatter;
            const len = prd ? Math.hypot(262 - 40, 75 - y) - 30 : 60 + ((i * 29) % 50);
            const t = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 70, damping: 13, delay: i * 0.03 };
            return (
              <g key={i}>
                <motion.line
                  x1={40}
                  y1={y}
                  initial={false}
                  animate={{ x2: 40 + Math.cos(angle) * len, y2: y + Math.sin(angle) * len }}
                  transition={t}
                  stroke={prd ? "#f0937a" : "rgba(241,230,206,0.4)"}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
                <circle cx={40} cy={y} r={2.5} fill="#f1e6ce" />
              </g>
            );
          })}
        </svg>
        <p className="absolute bottom-2 left-3 font-mono text-[10px] tracking-[0.15em] text-cream/55">{prd ? "EVERY VIBE, ONE DIRECTION" : "FAST, AND NOWHERE IN PARTICULAR"}</p>
      </div>
    </div>
  );
}

function Reasons() {
  return (
    <div className="my-8">
      <Label>WHY THE PRD MATTERS MORE NOW</Label>
      <ol className="mt-3 space-y-2">
        {A2.reasons.map((r, i) => (
          <Reveal key={r.title} delay={i * 0.06} y={14}>
            <li className="group grid gap-2 rounded-2xl border border-cream/10 bg-base/30 p-4 transition-colors hover:border-tertiary/40 @xl:grid-cols-[3rem_1fr_1.3fr] @xl:gap-4">
              <span className="text-stroke font-display text-3xl leading-none transition-colors group-hover:text-primary-soft">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-sans text-[16px] font-bold leading-snug text-cream">{r.title}</span>
              <span className="text-[15px] leading-relaxed text-cream/75">{r.text}</span>
            </li>
          </Reveal>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] tracking-[0.2em] text-cream/55">THE MODERN PRD</span>
        {A2.modern.map((m, i) => (
          <motion.span
            key={m}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="rounded-full bg-tertiary px-3 py-1 font-sans text-sm font-bold text-base"
          >
            {m}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* Panels                                                                                             */
/* ------------------------------------------------------------------------------------------------ */

function Takeaway({ text, cite }: { text: string; cite?: string }) {
  const pane = useContext(PaneContext);
  return (
    <figure className="relative my-12 border-l-[3px] border-primary-soft pl-5 sm:pl-7">
      <figcaption className="font-mono text-[10px] tracking-[0.25em] text-amber">{cite ? `FROM THE ARTICLE` : "THE TAKEAWAY"}</figcaption>
      <LitWords text={text} scrollRef={pane ?? undefined} className="mt-3 font-serif text-2xl italic leading-snug text-tertiary @xl:text-[1.85rem]" />
    </figure>
  );
}

function ArticleView({ a, onOpen }: { a: Article; onOpen: (t: string) => void }) {
  const i = articles.items.findIndex((x) => x.id === a.id);
  const next = articles.items[i + 1];
  return (
    <article className="pb-6">
      <Reveal y={10} className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] tracking-[0.22em]">
        <span className="text-amber">{a.kicker.toUpperCase()}</span>
        <span className="h-px w-8 bg-amber/50" />
        <span className="text-cream/60">{a.topic.toUpperCase()}</span>
      </Reveal>
      <h3 className="mt-4 max-w-[26ch] font-sans text-3xl font-bold leading-[1.1] tracking-tight text-cream @xl:text-4xl">
        <RiseWords text={a.title} />
      </h3>
      <Reveal delay={0.15} y={8}>
        <p className="mt-3 font-mono text-[11px] tracking-[0.15em] text-cream/55">
          {a.date.toUpperCase()} · {a.read.toUpperCase()} · MEDIUM
        </p>
      </Reveal>
      <Reveal delay={0.2} y={10}>
        <p className="mt-5 max-w-[60ch] font-serif text-xl italic leading-snug text-amber/90">{a.summary}</p>
      </Reveal>
      <Reveal delay={0.25} className="mt-5 flex flex-wrap gap-1.5">
        {a.tags.map((t) => (
          <span key={t} className="rounded-full border border-cream/20 px-3 py-1 font-mono text-[10px] tracking-[0.1em] text-tertiary">
            #{t.split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join("")}
          </span>
        ))}
      </Reveal>
      <MediumRow a={a} className="mt-6" />

      <div className="max-w-3xl">
        {a.id === A1.id ? (
          <>
            <MentalModels />
            <RuleCard />
            <Pitfalls />
            <Takeaway text={A1.takeaway} />
          </>
        ) : (
          <>
            <WhoDoesWhat />
            <DriftFocus />
            <Reasons />
            <Takeaway text={A2.takeaway} cite="article" />
          </>
        )}
      </div>

      <MediumRow a={a} />

      <div className="mt-14 grid gap-3 border-t border-cream/10 pt-6 @xl:grid-cols-[auto_1fr]">
        <button type="button" onClick={() => onOpen("overview")} className="group inline-flex items-center gap-2 self-start font-mono text-[11px] tracking-[0.2em] text-cream/75 transition-colors hover:text-tertiary">
          <ArrowLeft size={14} aria-hidden="true" className="transition-transform group-hover:-translate-x-1" />
          ALL ARTICLES
        </button>
        <button type="button" onClick={() => onOpen(next ? next.id : "overview")} className="group flex items-center justify-between gap-4 text-left @xl:justify-end">
          <span className="@xl:text-right">
            <span className="block font-mono text-[11px] tracking-[0.2em] text-amber">{next ? "NEXT ARTICLE" : "BACK TO THE START"}</span>
            <span className="mt-1 block font-display text-3xl uppercase leading-none text-cream transition-colors group-hover:text-tertiary sm:text-4xl">{next ? next.short : "Overview"}</span>
          </span>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cream/20 text-cream transition-all duration-300 group-hover:translate-x-1 group-hover:border-tertiary group-hover:bg-tertiary group-hover:text-base">
            <ArrowRight size={18} aria-hidden="true" />
          </span>
        </button>
      </div>
    </article>
  );
}

function Overview({ onOpen }: { onOpen: (t: string) => void }) {
  const reduce = useReducedMotion();
  const total = articles.items.reduce((n, a) => n + minutes(a), 0);
  const stats = [
    { n: String(articles.items.length).padStart(2, "0"), label: "Articles" },
    { n: String(total), label: "Minutes of reading" },
    { n: "M", label: "Published on Medium" },
  ];
  return (
    <div className="pb-6">
      <Reveal y={14}>
        <p className="max-w-[62ch] text-[16px] leading-relaxed text-cream/85 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-[4.2rem] first-letter:leading-[0.8] first-letter:text-primary-soft">
          {articles.intro}
        </p>
      </Reveal>
      <Reveal delay={0.1} className="mt-6">
        <dl className="grid grid-cols-3 gap-3 rounded-2xl border border-cream/10 bg-base/35 p-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block font-display text-4xl leading-none text-primary-soft">{s.n}</span>
                <span className="mt-1 block font-mono text-[10px] uppercase leading-snug tracking-[0.12em] text-cream/70">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <div className="mt-12 flex items-center justify-between border-b border-cream/10 pb-3 font-mono text-[11px] tracking-[0.25em]">
        <span className="text-amber">IN ORDER · 01 → {String(articles.items.length).padStart(2, "0")}</span>
        <span className="text-cream/55">{String(articles.items.length).padStart(2, "0")} ARTICLES</span>
      </div>
      <ol className="mt-6 grid gap-10 @3xl:grid-cols-2 @3xl:gap-8">
        {articles.items.map((a, i) => {
          const Cover = COVERS[a.id];
          return (
            <motion.li
              key={a.id}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: EASE }}
            >
              <button type="button" onClick={() => onOpen(a.id)} className="group block w-full text-left" aria-label={`${a.title}. Read the notes`}>
                <span className="relative block aspect-[16/9] overflow-hidden rounded-2xl border border-cream/10 transition-[border-color] duration-500 group-hover:border-tertiary/40">
                  {Cover && <Cover />}
                  <span className="absolute bottom-3 right-3 inline-flex translate-y-2 items-center gap-2 rounded-full bg-cream px-4 py-2 font-mono text-[11px] font-medium tracking-[0.15em] text-base opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                    <RollText text="READ THE NOTES" />
                    <ArrowRight size={13} aria-hidden="true" />
                  </span>
                </span>
                <span className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] tracking-[0.18em]">
                  <span className="text-amber">{a.date.toUpperCase()}</span>
                  <span className="text-cream/50">{a.read.toUpperCase()}</span>
                  <span className="text-cream/50">{a.topic.toUpperCase()}</span>
                </span>
                <span className="mt-2 block font-sans text-xl font-bold leading-snug text-cream transition-colors group-hover:text-tertiary sm:text-2xl">{a.title}</span>
                <span className="mt-2 block text-[15px] leading-relaxed text-cream/70">{a.summary}</span>
              </button>
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.18em] text-primary-soft transition-colors hover:text-tertiary"
                aria-label={`${a.title} on Medium (opens in a new tab)`}
              >
                <RollText text="ON MEDIUM" />
                <ArrowUpRight size={13} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </motion.li>
          );
        })}
      </ol>

      <dl className="mt-12">
        <LiveRow label="All my writing on Medium" value={articles.profile.label} url={articles.profile.url} accent={MEDIUM_ACCENT} framed />
      </dl>
    </div>
  );
}

export default function ArticlesSection({ full }: { full: boolean }) {
  const tabs: ShellTab[] = [
    { key: "overview", index: "", label: "All articles", title: "All articles", meta: "IN ORDER" },
    ...articles.items.map((a) => ({ key: a.id, index: a.kicker.split(" ").pop() ?? "", label: a.short, title: a.title, meta: `${a.date.toUpperCase()} · ${a.read.toUpperCase()}` })),
  ];
  return (
    <ReadingShell
      title="Articles"
      headline={articles.headline}
      full={full}
      navLabel="Articles"
      listTitle="THE ARTICLES"
      tabs={tabs}
      render={(tab, open) => {
        const a = articles.items.find((x) => x.id === tab);
        return a ? <ArticleView a={a} onOpen={open} /> : <Overview onOpen={open} />;
      }}
    />
  );
}
