import { useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronsLeftRight, Download, RotateCcw } from "lucide-react";
import { writing, type WritingBlock, type WritingSample } from "../content";
import RollText from "./RollText";
import ReadingShell, { PaneContext, type ShellTab } from "./ReadingShell";
import { Reveal, RiseWords } from "./Reveal";
import { LitWords } from "./StudyKit";

/**
 * Writing → Content Design. Same shell as About Me and Selected Works: an outlined title with a continuously
 * typed headline (here with the struck-out first draft above it), a tab row, and a reading pane that scrolls on
 * its own. In full screen on a large display the samples list sits beside the reading pane, like About's split.
 *
 * Each sample is built from typed blocks (see `WritingBlock` in content.ts), and each block is an editor-like
 * instrument: draft ⇄ final toggles, a redline, a market switch, a replayable chat, a before/after slider,
 * character counts, survey dots, readability meters, and pull quotes that light up as you read.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;
type Tab = "overview" | string;



/** "Case study 01" → "01", "Quick sample A" → "A" */
const indexOf = (s: WritingSample) => s.kicker.split(" ").pop() ?? "";

/** Inline markup: **bold**, *italic*, {variable} */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\{[a-z_]+\})/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**")) return <strong key={i} className="font-semibold text-cream">{p.slice(2, -2)}</strong>;
        if (p.startsWith("*")) return <em key={i} className="font-serif text-[1.08em] italic text-tertiary">{p.slice(1, -1)}</em>;
        if (p.startsWith("{"))
          return (
            <code key={i} className="whitespace-nowrap rounded-md bg-primary/35 px-1.5 py-0.5 font-mono text-[0.82em] text-amber">
              {p}
            </code>
          );
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

/** Counts up to a number when it scrolls into view. */
function CountUp({ to, decimals = 0, className = "" }: { to: number; decimals?: number; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce || !inView) return;
    const c = animate(0, to, { duration: 1.4, ease: EASE, onUpdate: setV });
    return () => c.stop();
  }, [inView, to, reduce]);
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {v.toFixed(decimals)}
    </span>
  );
}

/** A small segmented control with a sliding pill. */
function Toggle({ options, value, onChange, label }: { options: string[]; value: number; onChange: (i: number) => void; label: string }) {
  const id = useId();
  return (
    <div role="group" aria-label={label} className="inline-flex shrink-0 rounded-full border border-cream/15 bg-base/40 p-1">
      {options.map((o, i) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === i}
          onClick={() => onChange(i)}
          className={`relative rounded-full px-3.5 py-1.5 font-mono text-[10px] tracking-[0.18em] transition-colors sm:text-[11px] ${
            value === i ? "text-cream" : "text-cream/60 hover:text-tertiary"
          }`}
        >
          {value === i && <motion.span layoutId={`${id}-pill`} className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
          <span className="relative">{o.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}

/** Ink wipe: text revealed left → right, like it's being written in. */
function Ink({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={`block ${className}`}
      initial={reduce ? false : { clipPath: "inset(0 100% 0 0)", opacity: 0.4 }}
      animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.65, 0, 0.35, 1] }}
    >
      {children}
    </motion.span>
  );
}

/** Struck-out text whose strike draws in as it scrolls into view. */
function Struck({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={`line-through decoration-2 ${className}`}
      initial={reduce ? false : { textDecorationColor: "rgba(240,147,122,0)" }}
      whileInView={{ textDecorationColor: "rgba(240,147,122,0.9)" }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={reduce ? { textDecorationColor: "rgba(240,147,122,0.9)" } : undefined}
    >
      {children}
    </motion.span>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-cream/10 bg-base/35 backdrop-blur-sm ${className}`}>{children}</div>;
}

function Caption({ children }: { children: ReactNode }) {
  return <p className="mt-3 font-serif text-[15px] italic leading-snug text-cream/65">{children}</p>;
}

/* ------------------------------------------------------------------------------------------------ */
/* Blocks                                                                                             */
/* ------------------------------------------------------------------------------------------------ */

function Versions({ b }: { b: Extract<WritingBlock, { kind: "versions" }> }) {
  const [v, setV] = useState(0);
  const cur = b.versions[v];
  const isDraft = v === 0;
  return (
    <Card className="my-8 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream/10 px-4 py-3 sm:px-5">
        <span className="font-mono text-[10px] tracking-[0.25em] text-amber">THE STRINGS · {cur.rows.length}</span>
        <Toggle label="Show version" options={b.versions.map((x) => x.label)} value={v} onChange={setV} />
      </div>
      <div className="relative">
        {isDraft && (
          <span aria-hidden="true" className="pointer-events-none absolute right-4 top-3 rotate-[-8deg] rounded border-2 border-primary-soft/50 px-2 py-0.5 font-mono text-[11px] tracking-[0.2em] text-primary-soft/70">
            DRAFT
          </span>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.ol key={cur.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="divide-y divide-cream/5">
            {cur.rows.map((r, i) => (
              <li key={i} className="grid gap-1 px-4 py-3 sm:grid-cols-[8.5rem_1fr_auto] sm:gap-4 sm:px-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-cream/50 sm:pt-1">{r.label}</span>
                <Ink delay={i * 0.06} className={`text-[15px] leading-relaxed ${isDraft ? "text-cream/60" : "text-cream"}`}>
                  <Rich text={r.text} />
                </Ink>
                {r.count ? (
                  <span className="self-start justify-self-start whitespace-nowrap rounded-full border border-amber/40 px-2 py-0.5 font-mono text-[10px] text-amber sm:mt-1 sm:justify-self-end">
                    {r.count} ch
                  </span>
                ) : (
                  <span className="hidden sm:block" />
                )}
              </li>
            ))}
          </motion.ol>
        </AnimatePresence>
      </div>
    </Card>
  );
}

function Redline({ b }: { b: Extract<WritingBlock, { kind: "redline" }> }) {
  const [mode, setMode] = useState(1); // 0 before, 1 redline, 2 after
  return (
    <Card className="my-8 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream/10 px-4 py-3 sm:px-5">
        <span className="font-mono text-[10px] tracking-[0.25em] text-amber">SCREEN BY SCREEN</span>
        <Toggle label="Show" options={[b.beforeLabel, "Redline", "After"]} value={mode} onChange={setMode} />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.ol key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="divide-y divide-cream/5">
          {b.rows.map((r, i) => (
            <li key={r.label} className="grid gap-1.5 px-4 py-3.5 sm:grid-cols-[8.5rem_1fr] sm:gap-4 sm:px-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-cream/50 sm:pt-1">{r.label}</span>
              <div className="space-y-1.5 text-[15px] leading-relaxed">
                {mode !== 2 && (
                  <p className={mode === 1 ? "text-cream/50" : "text-cream/80"}>
                    {mode === 1 ? (
                      <>
                        <span aria-hidden="true" className="mr-2 font-mono text-primary-soft">−</span>
                        <Struck>
                          <Rich text={r.before} />
                        </Struck>
                      </>
                    ) : (
                      <Rich text={r.before} />
                    )}
                  </p>
                )}
                {mode !== 0 && (
                  <Ink delay={0.1 + i * 0.05} className="text-cream">
                    {mode === 1 && <span aria-hidden="true" className="mr-2 font-mono text-tertiary">+</span>}
                    <Rich text={r.after} />
                  </Ink>
                )}
              </div>
            </li>
          ))}
        </motion.ol>
      </AnimatePresence>
      <p className="border-t border-cream/10 px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] text-cream/50 sm:px-5">
        {b.afterLabel.toUpperCase()}
      </p>
    </Card>
  );
}

function Markets({ b }: { b: Extract<WritingBlock, { kind: "markets" }> }) {
  const [m, setM] = useState(0);
  const cur = b.markets[m];
  const symbol = cur.code === "NG" ? "₦" : "$";
  const row = (label: string) => cur.rows.find((r) => r.label === label)?.text ?? "";
  const buttons = row("Buttons").split(", ");
  return (
    <div className="my-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] tracking-[0.25em] text-amber">SAME ERROR · TWO READERS</span>
        <Toggle label="Market" options={b.markets.map((x) => `${x.code} · ${x.name}`)} value={m} onChange={setM} />
      </div>
      <div className="relative overflow-hidden rounded-3xl border border-cream/10 bg-[linear-gradient(160deg,rgba(152,58,40,0.35),rgba(21,6,0,0.55))] p-5 sm:p-7">
        <AnimatePresence mode="wait">
          <motion.span
            key={symbol}
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-10 select-none font-display text-[12rem] leading-none text-cream/[0.06]"
            initial={{ opacity: 0, rotate: -20, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 20, scale: 0.8 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {symbol}
          </motion.span>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div key={cur.code} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="relative space-y-4">
            <Annot label="Headline">
              <p className="font-sans text-xl font-bold leading-snug text-cream sm:text-2xl">{row("Headline")}</p>
            </Annot>
            <Annot label="First line">
              <Ink delay={0.15}>
                <p className="text-[16px] leading-relaxed text-cream/90">
                  <Rich text={row("First line")} />
                </p>
              </Ink>
            </Annot>
            <Annot label="Guidance">
              <Ink delay={0.3}>
                <p className="text-[16px] leading-relaxed text-tertiary">{row("Guidance")}</p>
              </Ink>
            </Annot>
            <Annot label="Buttons">
              <div className="flex flex-wrap gap-2 pt-1">
                {buttons.map((t, i) => (
                  <span
                    key={t}
                    className={`rounded-full px-4 py-2 font-sans text-sm font-bold ${i === 0 ? "bg-cream text-base" : "border border-cream/30 text-cream"}`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Annot>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Annot({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 @xl:grid-cols-[6.5rem_1fr] @xl:gap-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber/80 @xl:pt-1.5">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function Chat({ b }: { b: Extract<WritingBlock, { kind: "chat" }> }) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  const [run, setRun] = useState(0);
  const msgs = b.versions[v].messages;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [shown, setShown] = useState(reduce ? 99 : 0);
  const [typing, setTyping] = useState<null | "bot" | "buyer">(null);

  useEffect(() => {
    if (reduce) {
      setShown(99);
      return;
    }
    if (!inView) return;
    setShown(0);
    const timers: number[] = [];
    let t = 250;
    msgs.forEach((m, k) => {
      const from = m.from;
      timers.push(window.setTimeout(() => setTyping(from), t));
      t += m.from === "bot" ? 900 : 600;
      timers.push(
        window.setTimeout(() => {
          setTyping(null);
          setShown(k + 1);
        }, t),
      );
      t += 450;
    });
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [inView, v, run, reduce, msgs]);

  return (
    <div ref={ref} className="my-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[10px] tracking-[0.25em] text-amber">WHATSAPP · ADAEZE FABRICS</span>
        <div className="flex items-center gap-2">
          <Toggle label="Show version" options={b.versions.map((x) => x.label)} value={v} onChange={setV} />
          {!reduce && (
            <button
              type="button"
              onClick={() => setRun((r) => r + 1)}
              aria-label="Replay the chat"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-cream/20 text-cream transition-colors hover:border-tertiary hover:bg-tertiary hover:text-base"
            >
              <RotateCcw size={13} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <div className="rounded-3xl border border-cream/10 bg-[radial-gradient(#f1e6ce10_1px,transparent_1px)] bg-base/50 [background-size:16px_16px] p-3 sm:p-4">
        <ol className="flex min-h-[14rem] flex-col gap-2.5" aria-label={`${b.versions[v].label} chat`}>
          {msgs.slice(0, shown).map((m, k) => (
            <motion.li
              key={`${v}-${run}-${k}`}
              initial={reduce ? false : { opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: EASE }}
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-snug ${
                m.from === "bot" ? "self-start rounded-bl-md border border-cream/10 bg-secondary text-cream" : "self-end rounded-br-md bg-primary text-cream"
              }`}
            >
              <span className="mb-0.5 block font-mono text-[9px] uppercase tracking-[0.18em] text-cream/55">{m.from === "bot" ? "Shop assistant" : "Buyer"}</span>
              {m.text}
            </motion.li>
          ))}
          {typing && (
            <li aria-hidden="true" className={`flex w-14 gap-1 rounded-2xl px-3.5 py-3 ${typing === "bot" ? "self-start border border-cream/10 bg-secondary" : "self-end bg-primary/70"}`}>
              <i className="caira-dot h-1.5 w-1.5 rounded-full bg-cream/70" />
              <i className="caira-dot h-1.5 w-1.5 rounded-full bg-cream/70 [animation-delay:0.15s]" />
              <i className="caira-dot h-1.5 w-1.5 rounded-full bg-cream/70 [animation-delay:0.3s]" />
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}

function Specimen({ b }: { b: Extract<WritingBlock, { kind: "specimen" }> }) {
  const reduce = useReducedMotion();
  // Split the text around marked phrases so they can be underlined
  const marks = b.marks ?? [];
  const parts: { t: string; mark: boolean }[] = [];
  let rest = b.text;
  marks.forEach((m) => {
    const i = rest.indexOf(m);
    if (i < 0) return;
    parts.push({ t: rest.slice(0, i), mark: false }, { t: m, mark: true });
    rest = rest.slice(i + m.length);
  });
  parts.push({ t: rest, mark: false });
  return (
    <figure className="relative my-8 rounded-2xl border border-dashed border-primary-soft/40 bg-base/40 p-5 pt-7 sm:p-6 sm:pt-8">
      <figcaption className="absolute -top-3 left-4 rounded-full bg-secondary px-3 font-mono text-[10px] tracking-[0.2em] text-primary-soft">{b.label.toUpperCase()}</figcaption>
      <span aria-hidden="true" className="absolute right-4 top-4 rotate-[6deg] rounded border-2 border-primary-soft/50 px-2 font-mono text-[10px] tracking-[0.2em] text-primary-soft/70">
        AS SHIPPED
      </span>
      <blockquote className="pr-16 font-mono text-[14px] leading-relaxed text-cream/85 sm:text-[15px]">
        {parts.map((p, i) =>
          p.mark ? (
            <motion.span
              key={i}
              className="underline decoration-wavy decoration-2 underline-offset-4"
              initial={reduce ? false : { textDecorationColor: "rgba(240,147,122,0)" }}
              whileInView={{ textDecorationColor: "rgba(240,147,122,1)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.2 }}
              style={reduce ? { textDecorationColor: "rgba(240,147,122,1)" } : undefined}
            >
              {p.t}
            </motion.span>
          ) : (
            <Rich key={i} text={p.t} />
          ),
        )}
      </blockquote>
    </figure>
  );
}

function Terms({ b }: { b: Extract<WritingBlock, { kind: "terms" }> }) {
  const reduce = useReducedMotion();
  return (
    <ul className="my-6 divide-y divide-cream/10 border-y border-cream/10">
      {b.rows.map((r, i) => (
        <motion.li
          key={r.use}
          initial={reduce ? false : { opacity: 0, x: -14 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
          className="group grid gap-2 py-4 @xl:grid-cols-[10rem_1fr] @xl:items-baseline @xl:gap-6"
        >
          <span className="font-sans text-xl font-bold text-tertiary transition-transform duration-300 group-hover:translate-x-1">{r.use}</span>
          <span>
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[10px] tracking-[0.15em] text-cream/45">NOT</span>
              {r.instead.map((w) => (
                <span key={w} className="rounded-full border border-cream/15 px-2.5 py-0.5 text-sm text-cream/55">
                  <Struck>{w}</Struck>
                </span>
              ))}
            </span>
            <span className="mt-1.5 block text-[15px] text-cream/80">{r.why}</span>
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

function Decisions({ b }: { b: Extract<WritingBlock, { kind: "decisions" }> }) {
  return (
    <div className="my-6">
      <div className="mb-2 hidden grid-cols-[3rem_1fr_1.2fr] gap-4 px-1 font-mono text-[10px] tracking-[0.2em] text-cream/45 @xl:grid">
        <span />
        <span>{b.head[0].toUpperCase()}</span>
        <span>{b.head[1].toUpperCase()}</span>
      </div>
      <ol className="space-y-2">
        {b.rows.map((r, i) => (
          <Reveal key={r.title} delay={i * 0.06} y={14}>
            <li className="group grid gap-2 rounded-2xl border border-cream/10 bg-base/30 p-4 transition-colors hover:border-tertiary/40 @xl:grid-cols-[3rem_1fr_1.2fr] @xl:gap-4">
              <span className="text-stroke font-display text-3xl leading-none transition-colors group-hover:text-primary-soft">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-sans text-[16px] font-bold leading-snug text-cream">{r.title}</span>
              <span className="text-[15px] leading-relaxed text-cream/75">
                <Rich text={r.text} />
              </span>
            </li>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

function Compare({ b }: { b: Extract<WritingBlock, { kind: "compare" }> }) {
  const reduce = useReducedMotion();
  const pos = useMotionValue(50);
  const [val, setVal] = useState(50);
  const clip = useTransform(pos, (p) => `inset(0 ${100 - p}% 0 0)`);
  const left = useTransform(pos, (p) => `${p}%`);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => pos.on("change", (p) => setVal(Math.round(p))), [pos]);
  // A first sweep shows it's draggable
  useEffect(() => {
    if (reduce || !inView) return;
    const c = animate(pos, [50, 82, 18, 50], { duration: 2.4, ease: "easeInOut", delay: 0.3 });
    return () => c.stop();
  }, [inView, reduce, pos]);

  return (
    <figure className="my-8">
      <div className="mx-auto mb-2 flex max-w-[20rem] items-center justify-between font-mono text-[10px] tracking-[0.15em]">
        <span className="flex items-center gap-1.5 text-cream/70">
          <span aria-hidden="true">←</span>
          {b.before.label.toUpperCase()}
        </span>
        <span className="flex items-center gap-1.5 text-amber">
          {b.after.label.toUpperCase()}
          <span aria-hidden="true">→</span>
        </span>
      </div>
      <div ref={ref} className="relative mx-auto w-full max-w-[20rem] select-none overflow-hidden rounded-[1.6rem] border border-cream/15 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]">
        <img src={b.after.src} alt={b.after.alt} className="block w-full" loading="lazy" draggable={false} />
        <motion.img
          src={b.before.src}
          alt={b.before.alt}
          style={{ clipPath: clip }}
          className="absolute inset-0 block h-full w-full"
          loading="lazy"
          draggable={false}
        />
        <motion.span aria-hidden="true" style={{ left }} className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-cream">
          <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-base shadow-lg">
            <ChevronsLeftRight size={18} />
          </span>
        </motion.span>
        <input
          type="range"
          min={0}
          max={100}
          value={val}
          onChange={(e) => pos.set(Number(e.target.value))}
          aria-label={`Compare ${b.before.label} and ${b.after.label}`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="mx-auto max-w-[28rem] text-center">
        <Caption>{b.caption}</Caption>
      </figcaption>
    </figure>
  );
}

function Shots({ b }: { b: Extract<WritingBlock, { kind: "shots" }> }) {
  const reduce = useReducedMotion();
  const three = b.items.length >= 3;
  return (
    <figure className="my-8">
      <div className={`fx-deck -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 @xl:grid @xl:overflow-visible ${three ? "@xl:grid-cols-3" : "@xl:max-w-[34rem] @xl:grid-cols-2"}`}>
        {b.items.map((s, i) => (
          <motion.div
            key={s.src}
            initial={reduce ? false : { opacity: 0, y: 30, rotate: i % 2 ? 2 : -2 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
            className="group w-[62%] shrink-0 snap-start @xl:w-auto"
          >
            <img src={s.src} alt={s.alt} loading="lazy" className="w-full rounded-2xl border border-cream/10 shadow-[0_24px_50px_-28px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:-translate-y-1.5" />
            <span
              className={`mt-3 inline-block rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.15em] ${
                s.final || s.label.toLowerCase().includes("after") ? "bg-amber text-base" : "border border-cream/20 text-cream/75"
              }`}
            >
              {s.label.toUpperCase()}
            </span>
          </motion.div>
        ))}
      </div>
      <Caption>{b.caption}</Caption>
    </figure>
  );
}

function Chars({ b }: { b: Extract<WritingBlock, { kind: "chars" }> }) {
  const reduce = useReducedMotion();
  return (
    <Card className="my-6 p-4 sm:p-5">
      <div className="space-y-4">
        {b.items.map((it, row) => (
          <div key={it.text}>
            <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-cream/50">
              <span>{it.lang.toUpperCase()}</span>
              <span className="text-amber">
                <CountUp to={it.text.length} /> CH
              </span>
            </div>
            <div className="flex flex-wrap gap-[3px]" aria-label={it.text}>
              {it.text.split("").map((c, i) => (
                <motion.span
                  key={i}
                  aria-hidden="true"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: row * 0.25 + i * 0.03 }}
                  className="flex h-8 w-[1.35rem] items-center justify-center rounded-md border border-cream/15 bg-secondary font-mono text-sm text-cream sm:w-6"
                >
                  {c === " " ? "·" : c}
                </motion.span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 font-serif text-[15px] italic text-tertiary">{b.note}</p>
    </Card>
  );
}

function Dots({ b }: { b: Extract<WritingBlock, { kind: "dots" }> }) {
  const reduce = useReducedMotion();
  return (
    <Card className="my-8 p-4 sm:p-5">
      <p className="font-mono text-[10px] tracking-[0.25em] text-amber">{b.note.toUpperCase()}</p>
      <ul className="mt-4 space-y-5">
        {b.items.map((it, row) => (
          <li key={it.label} className="grid gap-3 @xl:grid-cols-[auto_1fr] @xl:items-center @xl:gap-5">
            <div className="flex items-center gap-3">
              <span className="font-display text-4xl leading-none text-primary-soft">
                {it.n}
                <span className="text-cream/40">/{b.total}</span>
              </span>
              <span className="flex gap-1.5" aria-hidden="true">
                {Array.from({ length: b.total }, (_, i) => (
                  <motion.span
                    key={i}
                    initial={reduce ? false : { scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 400, damping: 18, delay: row * 0.2 + i * 0.07 }}
                    className={`h-3.5 w-3.5 rounded-full ${i < it.n ? "bg-amber" : "border border-cream/30"}`}
                  />
                ))}
              </span>
            </div>
            <p className="text-[15px] leading-snug text-cream/85">{it.label}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Readability({ b }: { b: Extract<WritingBlock, { kind: "readability" }> }) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(1);
  return (
    <div className="my-8 space-y-5">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream/10 px-4 py-3 sm:px-5">
          <span className="font-mono text-[10px] tracking-[0.25em] text-amber">THE POLICY</span>
          <Toggle label="Show version" options={["Before", "After"]} value={v} onChange={setV} />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={v} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="p-4 sm:p-5">
            {v === 0 ? (
              <p className="font-serif text-[16px] leading-relaxed text-cream/70">
                <strong className="font-sans font-semibold text-cream/85">{b.before.title}</strong> {b.before.text}
              </p>
            ) : (
              <div className="space-y-4">
                {b.after.map((a, i) => (
                  <div key={a.title}>
                    <p className="font-sans text-[16px] font-bold text-tertiary">{a.title}</p>
                    <Ink delay={0.1 + i * 0.12} className="text-[15px] leading-relaxed text-cream">
                      {a.text}
                    </Ink>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Card>

      <ul className="space-y-4">
        {b.measures.map((m) => {
          const decimals = Number.isInteger(m.before) && Number.isInteger(m.after) ? 0 : 1;
          const diff = m.after - m.before;
          return (
            <li key={m.label}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-sm text-cream/80">{m.label}</span>
                {m.better !== "none" && (
                  <span className="rounded-full bg-amber/15 px-2 py-0.5 font-mono text-[10px] text-amber">
                    {diff > 0 ? "↑" : "↓"} {Math.abs(diff).toFixed(decimals)}
                  </span>
                )}
              </div>
              {(["before", "after"] as const).map((k) => (
                <div key={k} className="mb-1 grid grid-cols-[3.5rem_1fr_3rem] items-center gap-3">
                  <span className="font-mono text-[10px] tracking-[0.15em] text-cream/50">{k.toUpperCase()}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-cream/10">
                    <motion.span
                      className={`block h-full rounded-full ${k === "after" ? "bg-[linear-gradient(90deg,#983a28,#f0937a)]" : "bg-cream/35"}`}
                      initial={reduce ? false : { width: 0 }}
                      whileInView={{ width: `${(m[k] / m.max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: k === "after" ? 0.25 : 0, ease: EASE }}
                    />
                  </span>
                  <CountUp to={m[k]} decimals={decimals} className={`text-right font-mono text-sm ${k === "after" ? "text-primary-soft" : "text-cream/60"}`} />
                </div>
              ))}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Quote({ b }: { b: Extract<WritingBlock, { kind: "quote" }> }) {
  const pane = useContext(PaneContext);
  return (
    <figure className="relative my-12 border-l-[3px] border-primary-soft pl-5 sm:pl-7">
      <figcaption className="font-mono text-[10px] tracking-[0.25em] text-amber">WHAT I LEARNED</figcaption>
      <span aria-hidden="true" className="pointer-events-none absolute -top-6 right-0 select-none font-serif text-[7rem] leading-none text-primary-soft/15">
        &rdquo;
      </span>
      <LitWords text={b.text} scrollRef={pane ?? undefined} className="mt-3 font-serif text-2xl italic leading-snug text-tertiary @xl:text-[1.85rem]" />
    </figure>
  );
}

function Block({ b }: { b: WritingBlock }) {
  switch (b.kind) {
    case "p":
      return (
        <Reveal y={12}>
          <p className="my-4 max-w-[68ch] text-[16px] leading-relaxed text-cream/85">
            <Rich text={b.text} />
          </p>
        </Reveal>
      );
    case "h":
      return (
        <h4 className="mb-2 mt-10 flex items-center gap-3 font-sans text-xl font-bold text-cream">
          <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-primary-soft" />
          <RiseWords text={b.text} />
        </h4>
      );
    case "versions":
      return <Versions b={b} />;
    case "redline":
      return <Redline b={b} />;
    case "markets":
      return <Markets b={b} />;
    case "chat":
      return <Chat b={b} />;
    case "specimen":
      return <Specimen b={b} />;
    case "terms":
      return <Terms b={b} />;
    case "decisions":
      return <Decisions b={b} />;
    case "compare":
      return <Compare b={b} />;
    case "shots":
      return <Shots b={b} />;
    case "chars":
      return <Chars b={b} />;
    case "dots":
      return <Dots b={b} />;
    case "readability":
      return <Readability b={b} />;
    case "quote":
      return <Quote b={b} />;
  }
}

/* ------------------------------------------------------------------------------------------------ */
/* Panels                                                                                             */
/* ------------------------------------------------------------------------------------------------ */

function StatusChip({ s }: { s: WritingSample["status"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] tracking-[0.15em] ${
        s === "Shipped" ? "bg-amber text-base" : "border border-cream/20 text-cream/70"
      }`}
    >
      {s.toUpperCase()}
    </span>
  );
}

function Overview({ onOpen }: { onOpen: (id: string) => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="pb-6">
      <div className="grid gap-8 @3xl:grid-cols-[1fr_15rem]">
        <div className="space-y-4">
          {writing.intro.map((p, i) => (
            <Reveal key={i} delay={i * 0.08} y={14}>
              <p
                className={`max-w-[68ch] text-[16px] leading-relaxed text-cream/85 ${
                  i === 0
                    ? "first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-[4.2rem] first-letter:leading-[0.8] first-letter:text-primary-soft"
                    : ""
                }`}
              >
                {p}
              </p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <aside aria-label="At a glance" className="grid grid-cols-3 gap-3 rounded-2xl border border-cream/10 bg-base/35 p-4 @3xl:sticky @3xl:top-0 @3xl:grid-cols-1 @3xl:gap-0 @3xl:p-5">
            <p className="col-span-3 font-mono text-[10px] tracking-[0.25em] text-amber @3xl:col-span-1 @3xl:mb-2">AT A GLANCE</p>
            {writing.glance.map((g) => (
              <div key={g.label} className="flex flex-col gap-1 @3xl:flex-row @3xl:items-baseline @3xl:gap-4 @3xl:border-t @3xl:border-cream/10 @3xl:py-3 @3xl:first-of-type:border-t-0">
                <CountUp to={g.n} className="font-display text-4xl leading-none text-primary-soft" />
                <span className="font-mono text-[10px] uppercase leading-snug tracking-[0.12em] text-cream/70">{g.label}</span>
              </div>
            ))}
          </aside>
        </Reveal>
      </div>

      <div className="mt-12 flex items-center justify-between border-b border-cream/10 pb-3 font-mono text-[11px] tracking-[0.25em]">
        <span className="text-amber">THE SAMPLES</span>
        <span className="text-cream/55">FIVE PIECES</span>
      </div>
      <ul className="mt-6 grid gap-4 @xl:grid-cols-2">
        {writing.samples.map((s, i) => (
          <motion.li
            key={s.id}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: (i % 2) * 0.08, ease: EASE }}
          >
            <button
              type="button"
              onClick={() => onOpen(s.id)}
              className="group relative flex h-full w-full flex-col gap-2 overflow-hidden rounded-2xl border border-cream/10 bg-base/35 p-5 text-left transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-tertiary/50 active:scale-[0.99]"
            >
              <span aria-hidden="true" className="text-stroke-faint pointer-events-none absolute -bottom-6 -right-2 font-display text-[7rem] leading-none transition-transform duration-500 group-hover:-translate-x-2 group-hover:-translate-y-2">
                {indexOf(s)}
              </span>
              <span className="flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] tracking-[0.2em] text-amber">{s.kicker.toUpperCase()}</span>
                <StatusChip s={s.status} />
              </span>
              <span className="mt-1 font-sans text-xl font-bold leading-snug text-cream transition-colors group-hover:text-tertiary">{s.title}</span>
              <span className="text-[15px] leading-relaxed text-cream/70">{s.summary}</span>
              <span className="mt-auto flex items-center gap-2 pt-3 font-mono text-[11px] tracking-[0.18em] text-primary-soft">
                <RollText text="READ" />
                <ArrowRight size={13} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </motion.li>
        ))}
        <motion.li
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
        >
          <a
            href={writing.pdf}
            download
            className="group fx-spotlight flex h-full flex-col gap-2 rounded-2xl bg-primary p-5 text-cream transition-transform duration-300 hover:-translate-y-1"
          >
            <span className="font-mono text-[10px] tracking-[0.2em] text-cream/75">PREFER A FILE?</span>
            <span className="mt-1 font-sans text-xl font-bold">Download the PDF</span>
            <span className="text-[15px] leading-relaxed text-cream/85">All five samples in one document, for applications that only take uploads.</span>
            <span className="mt-auto flex items-center gap-2 pt-3 font-mono text-[11px] tracking-[0.18em] text-tertiary">
              <RollText text="DOWNLOAD" />
              <Download size={13} aria-hidden="true" className="transition-transform group-hover:translate-y-0.5" />
            </span>
          </a>
        </motion.li>
      </ul>

      <section aria-labelledby="cd-how" className="mt-14">
        <div className="flex items-center justify-between border-b border-cream/10 pb-3 font-mono text-[11px] tracking-[0.25em]">
          <span className="text-amber">APPROACH</span>
          <span className="text-cream/55">PRINCIPLES</span>
        </div>
        <h3 id="cd-how" className="mt-6 font-sans text-3xl font-bold text-cream">
          <RiseWords text={writing.howIWork.title} />
        </h3>
        <ol className="mt-6 grid gap-x-8 gap-y-5 @xl:grid-cols-2">
          {writing.howIWork.habits.map((h, i) => (
            <Reveal key={h.title} delay={i * 0.07} y={14}>
              <li className="flex gap-4">
                <span className="font-display text-3xl leading-none text-primary-soft">{i + 1}</span>
                <span>
                  <span className="block font-sans text-[16px] font-bold leading-snug text-tertiary">{h.title}</span>
                  <span className="mt-1 block text-[15px] leading-relaxed text-cream/75">{h.text}</span>
                </span>
              </li>
            </Reveal>
          ))}
        </ol>
        <Reveal>
          <p className="mt-8 max-w-[68ch] font-serif text-lg italic leading-relaxed text-cream/80">{writing.howIWork.feedback}</p>
        </Reveal>
      </section>
    </div>
  );
}

function SampleView({ s, onOpen }: { s: WritingSample; onOpen: (t: Tab) => void }) {
  const i = writing.samples.findIndex((x) => x.id === s.id);
  const next = writing.samples[i + 1];
  return (
    <article className="pb-6">
      <Reveal y={10} className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] tracking-[0.22em]">
        <span className="text-amber">{s.kicker.toUpperCase()}</span>
        <span className="h-px w-8 bg-amber/50" />
        <span className="text-cream/60">{s.topic.toUpperCase()}</span>
        <StatusChip s={s.status} />
      </Reveal>
      <h3 className="mt-4 max-w-[24ch] font-sans text-3xl font-bold leading-[1.1] tracking-tight text-cream @xl:text-4xl @3xl:text-5xl">
        <RiseWords text={s.title} />
      </h3>
      <Reveal delay={0.2} y={10}>
        <p className="mt-4 max-w-[60ch] font-serif text-lg italic leading-snug text-amber/90">{s.snapshot}</p>
      </Reveal>
      <div className="mt-6 max-w-3xl">
        {s.blocks.map((b, k) => (
          <Block key={k} b={b} />
        ))}
      </div>

      <div className="mt-14 grid gap-3 border-t border-cream/10 pt-6 @xl:grid-cols-[auto_1fr]">
        <button
          type="button"
          onClick={() => onOpen("overview")}
          className="group inline-flex items-center gap-2 self-start font-mono text-[11px] tracking-[0.2em] text-cream/75 transition-colors hover:text-tertiary"
        >
          <ArrowLeft size={14} aria-hidden="true" className="transition-transform group-hover:-translate-x-1" />
          ALL SAMPLES
        </button>
        <button type="button" onClick={() => onOpen(next ? next.id : "overview")} className="group flex items-center justify-between gap-4 text-left @xl:justify-end">
          <span className="@xl:text-right">
            <span className="block font-mono text-[11px] tracking-[0.2em] text-amber">{next ? "NEXT SAMPLE" : "BACK TO THE START"}</span>
            <span className="mt-1 block font-display text-3xl uppercase leading-none text-cream transition-colors group-hover:text-tertiary sm:text-4xl">
              {next ? next.title : "Overview"}
            </span>
          </span>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cream/20 text-cream transition-all duration-300 group-hover:translate-x-1 group-hover:border-tertiary group-hover:bg-tertiary group-hover:text-base">
            <ArrowRight size={18} aria-hidden="true" />
          </span>
        </button>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* Section                                                                                            */
/* ------------------------------------------------------------------------------------------------ */

export default function ContentDesignSection({ full }: { full: boolean }) {
  const tabs: ShellTab[] = [
    { key: "overview", index: "", label: "Overview", title: "Overview", meta: "INTRO · HOW I WORK" },
    ...writing.samples.map((s) => ({ key: s.id, index: indexOf(s), label: s.short, title: s.title, meta: s.topic.toUpperCase(), dot: s.status === "Shipped" })),
  ];
  return (
    <ReadingShell
      title="Content design"
      draft={writing.draft}
      headline={writing.headline}
      full={full}
      navLabel="Content design samples"
      listTitle="THE SAMPLES"
      tabs={tabs}
      render={(tab, open) => {
        const sample = writing.samples.find((s) => s.id === tab);
        return sample ? <SampleView s={sample} onOpen={open} /> : <Overview onOpen={open} />;
      }}
    />
  );
}
