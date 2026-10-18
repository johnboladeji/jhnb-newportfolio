import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  Check,
  CheckCheck,
  Clock,
  CreditCard,
  LayoutDashboard,
  Link2,
  Mic,
  Moon,
  RotateCcw,
  Sun,
  User,
  X,
} from "lucide-react";
import { nexusStudy as N } from "../content";
import RollText from "./RollText";
import { Reveal, RiseWords } from "./Reveal";
import { LitWords, LiveRow, StudyBar, StudyChapter, pad, useStudyProgress, type LiveAccent, type StudyTone } from "./StudyKit";

/**
 * NexusCore case study. Same structure and rhythm as the Caira study (shared StudyKit: sticky chapter bar,
 * numbered chapters, words that light up), in NexusCore's own world: ink and indigo panels, lime accents,
 * DM Sans + Fira Code.
 *
 * Motion: a "night shift" that runs 11 PM → 7 AM and lands a morning notification, an inbox that keeps
 * filling with the same four questions, a seller-voice chat that ends in a payment link, a WhatsApp command
 * typed and applied, stacked decision cards with live visuals, a message packet travelling the stack, a
 * ten-phase track, and refused defaults struck through. Everything is static under reduced motion.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;
const NX_TONE: StudyTone = {
  kicker: "text-nx-lime",
  rule: "bg-nx-lime/60",
  dot: "bg-nx-lime",
  progress: "bg-[linear-gradient(90deg,#8b7fd1,#bad532)]",
  title: "font-dmsans font-bold tracking-tight",
};
const NX_LIVE: LiveAccent = {
  text: "text-nx-lime",
  fill: "bg-nx-lime",
  on: "text-nx-indigo",
  tint: "bg-[radial-gradient(120%_160%_at_0%_0%,rgba(186,213,50,0.2),transparent_60%)]",
};
const CHAPTERS = ["Overview", "The problem", "The product", "Design decisions", "Architecture", "What it taught me", "Where it stands", "What it's really about"];

const naira = (n: number) => `₦${Math.round(n).toLocaleString("en-NG")}`;

function Chapter(props: { n: number; title?: string; onEnter: (n: number) => void; children: ReactNode }) {
  return <StudyChapter id="nexus" chapters={CHAPTERS} tone={NX_TONE} {...props} />;
}

/** "Nexus" + lime "Core", as on the product's own site. */
function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-dmsans font-bold tracking-tight text-nx-lilac ${className}`}>
      Nexus<span className="text-nx-lime">Core</span>
    </span>
  );
}

/** Counts up to a number when it scrolls into view. */
function CountUp({ to, format = (n: number) => String(Math.round(n)), className = "" }: { to: number; format?: (n: number) => string; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce || !inView) return;
    const c = animate(0, to, { duration: 1.4, ease: EASE, onUpdate: setV });
    return () => c.stop();
  }, [inView, to, reduce]);
  return <span ref={ref} className={`tabular-nums ${className}`}>{format(v)}</span>;
}

/** A WhatsApp-style phone: header with the chat name, dark patterned chat area. */
function ChatPhone({ title, sub, avatar, children, className = "" }: { title: string; sub: string; avatar: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex aspect-[9/18] w-full flex-col overflow-hidden rounded-[2rem] border-[6px] border-[#05030f] bg-nx-ink shadow-[0_30px_60px_-28px_rgba(0,0,0,0.9)] ${className}`}>
      <div className="flex items-center gap-2.5 bg-nx-indigo px-3.5 pb-2.5 pt-5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nx-lime font-dmsans text-xs font-bold text-nx-indigo">{avatar}</span>
        <span className="min-w-0">
          <span className="block truncate font-dmsans text-[13px] font-bold text-nx-lilac">{title}</span>
          <span className="block font-dmsans text-[10px] text-nx-mist">{sub}</span>
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden bg-[radial-gradient(#ede9fa0d_1px,transparent_1px)] [background-size:14px_14px] p-3">{children}</div>
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1.5 h-1.5 w-12 -translate-x-1/2 rounded-full bg-black/60" />
    </div>
  );
}

function Bubble({ from, children, delay = 0 }: { from: "bot" | "buyer" | "seller"; children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  const out = from !== "buyer";
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay, ease: EASE }}
      className={`max-w-[86%] shrink-0 rounded-2xl px-3 py-2 font-dmsans text-[12.5px] leading-snug ${
        out ? "self-end rounded-br-md bg-nx-indigo text-nx-lilac" : "self-start rounded-bl-md bg-nx-plum text-nx-lilac"
      }`}
    >
      {from === "bot" && <span className="mb-0.5 flex items-center gap-1 font-fira text-[9px] text-nx-lime"><Bot size={10} aria-hidden="true" /> AI · SHOP ASSISTANT</span>}
      {children}
      {out && <CheckCheck size={12} className="ml-auto mt-0.5 block text-nx-lime" aria-hidden="true" />}
    </motion.div>
  );
}

function Typing({ side = "start" }: { side?: "start" | "end" }) {
  return (
    <div aria-hidden="true" className={`flex w-12 gap-1 rounded-2xl px-3 py-2.5 ${side === "start" ? "self-start bg-nx-plum" : "self-end bg-nx-indigo"}`}>
      <i className="caira-dot h-1.5 w-1.5 rounded-full bg-nx-lilac/70" />
      <i className="caira-dot h-1.5 w-1.5 rounded-full bg-nx-lilac/70 [animation-delay:0.15s]" />
      <i className="caira-dot h-1.5 w-1.5 rounded-full bg-nx-lilac/70 [animation-delay:0.3s]" />
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* Cover (Selected Works list)                                                                        */
/* ------------------------------------------------------------------------------------------------ */

export function NexusCover() {
  return (
    <div aria-hidden="true" className="relative h-full w-full overflow-hidden bg-[radial-gradient(120%_120%_at_10%_0%,#2a1a66_0%,#1d0e44_40%,#0c0720_100%)]">
      <div className="absolute -bottom-1/3 right-0 h-full w-2/3 rounded-full bg-[radial-gradient(circle,rgba(186,213,50,0.3),transparent_65%)] blur-2xl transition-transform duration-700 ease-out group-hover:-translate-y-[8%]" />
      <div className="absolute inset-0 opacity-[0.1] [background-image:radial-gradient(#ede9fa_1px,transparent_1px)] [background-size:18px_18px]" />
      <span className="absolute left-[6%] top-[9%] font-mono text-xs tracking-[0.25em] text-nx-lime">02</span>
      <div className="absolute left-[6%] top-1/2 -translate-y-1/2">
        <Wordmark className="block text-[clamp(1.6rem,6vw,3rem)] leading-none" />
        <span className="mt-2 block font-fira text-[clamp(0.55rem,1.6vw,0.75rem)] tracking-[0.15em] text-nx-mist">AI SALES · WHATSAPP · NAIJA</span>
      </div>
      {/* A slice of the inbox */}
      <div className="absolute -bottom-[4%] right-[6%] flex w-[38%] flex-col gap-[0.5em] text-[clamp(0.5rem,1.4vw,0.72rem)] transition-transform duration-700 ease-out group-hover:-translate-y-[6%]">
        <span className="self-start rounded-xl rounded-bl-sm bg-nx-plum px-[0.9em] py-[0.6em] font-dmsans text-nx-lilac">Abeg how much na?</span>
        <span className="self-end rounded-xl rounded-br-sm bg-nx-indigo px-[0.9em] py-[0.6em] font-dmsans text-nx-lilac ring-1 ring-nx-lilac/10">The blue Ankara is ₦18,500. We have 4 left.</span>
        <span className="flex items-center gap-[0.5em] self-end rounded-full bg-nx-lime px-[0.9em] py-[0.5em] font-dmsans font-bold text-nx-indigo">
          <Link2 className="h-[1.1em] w-[1.1em]" /> Pay ₦21,500
        </span>
        <span className="mb-[2.2em] mt-[0.4em] self-start rounded-lg border border-nx-lime/40 bg-nx-ink/80 px-[0.9em] py-[0.5em] font-fira text-nx-lime">6 orders · ₦143,000 overnight</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* Hero: the night shift                                                                              */
/* ------------------------------------------------------------------------------------------------ */

function NightShift() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [t, setT] = useState(reduce ? 1 : 0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    setT(0);
    const c = animate(0, 1, { duration: 7, ease: "linear", onUpdate: setT, delay: 0.4 });
    return () => c.stop();
  }, [inView, run, reduce]);

  const mins = 23 * 60 + Math.round(t * 8 * 60);
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const am = h24 < 12;
  const orders = Math.min(N.night.orders, Math.floor(t * (N.night.orders + 0.6)));
  const revenue = t >= 1 ? N.night.revenue : Math.round((orders / N.night.orders) * N.night.revenue * 0.98 / 100) * 100;
  const escalated = t > 0.82 ? 2 : t > 0.43 ? 1 : 0;
  const done = t >= 1;

  const stats = [
    { label: "Orders closed", value: String(orders) },
    { label: "Sales", value: naira(revenue) },
    { label: "Sent to her", value: String(escalated) },
  ];

  return (
    <div ref={ref} className="relative overflow-hidden rounded-2xl border border-nx-lilac/15 bg-nx-ink/70 p-4 backdrop-blur-md @xl:p-5">
      {/* Dawn creeps in as the night runs */}
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(186,213,50,0.0),rgba(186,213,50,0.18))] transition-opacity" style={{ opacity: t * t }} />
      <div className="relative flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 font-fira text-[10px] tracking-[0.15em] text-nx-mist">
            {am && t > 0.75 ? <Sun size={12} aria-hidden="true" /> : <Moon size={12} aria-hidden="true" />}
            HER PHONE, OVERNIGHT
          </p>
          <p className="mt-1 font-fira text-[clamp(2rem,8cqw,3rem)] font-medium leading-none tabular-nums text-nx-lilac" aria-hidden="true">
            {h12}:{pad(m)}
            <small className="ml-1 text-[0.4em] text-nx-mist">{am ? "AM" : "PM"}</small>
          </p>
        </div>
        <p className="rounded-full border border-nx-lilac/15 px-3 py-1 font-fira text-[11px] text-nx-mist">
          <span className="text-nx-lime">{N.night.unread}</span> unread at 11 PM
        </p>
      </div>

      <div className="relative mt-4 h-1.5 rounded-full bg-nx-lilac/10" aria-hidden="true">
        <div className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#8b7fd1,#bad532)]" style={{ width: `${t * 100}%` }} />
        {[0.2, 0.37, 0.52, 0.66, 0.79, 0.93].map((p, i) => (
          <span key={i} className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors ${t >= p ? "bg-nx-lime" : "bg-nx-plum"}`} style={{ left: `${p * 100}%` }} />
        ))}
      </div>
      <div className="relative mt-1.5 flex justify-between font-fira text-[10px] text-nx-mist" aria-hidden="true">
        <span>11 PM</span>
        <span>3 AM</span>
        <span>7 AM</span>
      </div>

      <dl className="relative mt-4 grid grid-cols-[1fr_1.35fr_1fr] gap-2">
        {stats.map((s) => (
          <div key={s.label} className="min-w-0 rounded-xl bg-nx-indigo/70 px-2.5 py-2.5 @xl:px-3">
            <dt className="font-fira text-[9px] uppercase tracking-[0.12em] text-nx-mist">{s.label}</dt>
            <dd className="mt-1 whitespace-nowrap font-dmsans text-[15px] font-bold tabular-nums text-nx-lilac @md:text-lg @xl:text-xl">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="relative mt-3 min-h-[4.5rem]" aria-live="polite">
        <AnimatePresence>
          {done && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="flex gap-3 rounded-2xl bg-nx-lilac p-3 text-nx-indigo shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-nx-indigo font-dmsans text-sm font-bold text-nx-lime">N</span>
              <span className="min-w-0">
                <span className="flex items-center justify-between font-dmsans text-[11px] font-bold">
                  NexusCore <span className="font-normal opacity-60">7:00 AM</span>
                </span>
                <span className="block font-dmsans text-[13px] leading-snug">{N.night.morning}</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {!reduce && done && (
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          className="relative mt-2 inline-flex items-center gap-1.5 font-fira text-[10px] tracking-[0.15em] text-nx-mist transition-colors hover:text-nx-lime"
        >
          <RotateCcw size={11} aria-hidden="true" /> RUN THE NIGHT AGAIN
        </button>
      )}
      <p className="sr-only">
        At 11 PM she has {N.night.unread} unread messages. By 7 AM the bot has closed {N.night.orders} orders worth {naira(N.night.revenue)} and sent her {N.night.escalated} complaints.
      </p>
    </div>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const [lead, tail] = (() => {
    const i = N.headline.indexOf("the Nigerian");
    return i > 0 ? [N.headline.slice(0, i).trim(), N.headline.slice(i)] : [N.headline, ""];
  })();
  return (
    <div className="relative isolate overflow-hidden rounded-3xl bg-[radial-gradient(120%_120%_at_10%_0%,#2a1a66_0%,#1d0e44_40%,#0c0720_100%)] p-5 text-nx-lilac @xl:p-8">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_88%_85%,rgba(186,213,50,0.22),transparent_50%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(#ede9fa_1px,transparent_1px)] [background-size:18px_18px]" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <motion.span initial={reduce ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          <Wordmark className="text-2xl" />
        </motion.span>
        <span className="flex items-center gap-2 rounded-full border border-nx-lilac/15 bg-nx-ink/50 px-3 py-1.5 font-dmsans text-xs font-medium text-nx-lilac/85">
          <span className="caira-ping h-2 w-2 rounded-full bg-nx-lime" aria-hidden="true" />
          {N.statusPill}
        </span>
      </div>

      <div className="mt-8 grid items-start gap-8 @3xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="flex items-center gap-2 font-fira text-[11px] tracking-[0.15em] text-nx-lime">
            <span className="h-0.5 w-5 rounded bg-nx-lime" aria-hidden="true" />
            {N.kicker.toUpperCase()}
          </p>
          <h3 className="mt-3 font-dmsans text-[clamp(2.1rem,8cqw,4rem)] font-bold leading-[1.03] tracking-[-0.02em]">
            <RiseWords text={lead} />
            {tail && <RiseWords text={tail} className="text-nx-lime" delay={0.35} />}
          </h3>
          <Reveal delay={0.4} y={12}>
            <p className="mt-5 max-w-[50ch] font-dmsans text-[16px] leading-relaxed text-nx-lilac/85">{N.oneLine}</p>
          </Reveal>
        </div>
        <Reveal delay={0.3}>
          <NightShift />
        </Reveal>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* The problem                                                                                        */
/* ------------------------------------------------------------------------------------------------ */

function Inbox() {
  const reduce = useReducedMotion();
  const pool = [...N.problem.questions, "Abeg how much na?"];
  const [tick, setTick] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  useEffect(() => {
    if (reduce || !inView) return;
    const id = window.setInterval(() => setTick((n) => n + 1), 1100);
    return () => window.clearInterval(id);
  }, [reduce, inView]);
  const rows = Array.from({ length: 6 }, (_, i) => {
    const k = tick + 5 - i; // newest first
    return { k, text: pool[((k % pool.length) + pool.length) % pool.length], mins: i * 2 + 1 };
  });
  return (
    <div ref={ref} className="rounded-3xl border border-nx-lilac/10 bg-nx-ink p-3 @xl:p-4" role="img" aria-label={`An inbox filling with the same questions: ${N.problem.questions.join(", ")}`}>
      <div className="mb-2 flex items-center justify-between px-1 font-dmsans">
        <span className="text-sm font-bold text-nx-lilac">Chats</span>
        <span className="rounded-full bg-nx-lime px-2 py-0.5 font-fira text-[10px] font-medium text-nx-indigo">
          {Math.min(N.night.unread, 174 + tick)} unread
        </span>
      </div>
      <ul className="space-y-1.5 overflow-hidden" aria-hidden="true">
        <AnimatePresence initial={false}>
          {rows.map((r) => (
            <motion.li
              key={r.k}
              layout
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex items-center gap-3 rounded-xl bg-nx-plum/70 px-3 py-2"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nx-indigo text-nx-mist">
                <User size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex justify-between font-dmsans text-[12px] font-bold text-nx-lilac">
                  Customer <span className="font-fira text-[10px] font-normal text-nx-lime">11:{pad(58 - r.mins)} PM</span>
                </span>
                <span className="block truncate font-dmsans text-[13px] text-nx-mist">{r.text}</span>
              </span>
              <span className="h-2 w-2 shrink-0 rounded-full bg-nx-lime" />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* The product                                                                                        */
/* ------------------------------------------------------------------------------------------------ */

function Flow() {
  const reduce = useReducedMotion();
  return (
    <ol className="relative mt-8 grid gap-3 @3xl:grid-cols-7 @3xl:gap-2">
      {/* the rail and its travelling pulse (vertical on narrow, horizontal when wide) */}
      <span aria-hidden="true" className="absolute bottom-4 left-[1.05rem] top-4 w-px bg-nx-lime/25 @3xl:inset-x-4 @3xl:bottom-auto @3xl:left-4 @3xl:top-[1.05rem] @3xl:h-px @3xl:w-auto" />
      {N.product.flow.map((f, i) => (
        <motion.li
          key={f.step}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
          className="relative grid grid-cols-[2.1rem_1fr] gap-3 @3xl:grid-cols-1 @3xl:gap-2"
        >
          <span className="relative z-10 flex h-[2.1rem] w-[2.1rem] items-center justify-center rounded-full border border-nx-lime/50 bg-secondary font-fira text-xs text-nx-lime">
            {i + 1}
          </span>
          <span>
            <span className="block font-dmsans text-[15px] font-bold leading-snug text-cream">{f.step}</span>
            <span className="mt-0.5 block font-dmsans text-[13.5px] leading-snug text-cream/70">{f.text}</span>
          </span>
        </motion.li>
      ))}
    </ol>
  );
}

function CustomerChat() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const msgs = N.product.chat;
  const [shown, setShown] = useState(reduce ? msgs.length + 1 : 0);
  const [typing, setTyping] = useState<null | "bot" | "buyer">(null);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    setShown(0);
    const timers: number[] = [];
    let t = 300;
    msgs.forEach((m, k) => {
      timers.push(window.setTimeout(() => setTyping(m.from), t));
      t += m.from === "bot" ? 1000 : 650;
      timers.push(window.setTimeout(() => { setTyping(null); setShown(k + 1); }, t));
      t += 400;
    });
    timers.push(window.setTimeout(() => setShown(msgs.length + 1), t + 300));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [inView, run, reduce, msgs]);

  return (
    <figure ref={ref} className="mx-auto w-full max-w-[16rem]">
      <ChatPhone title="Adaeze Fabrics" sub="Business account · replies in seconds" avatar="AF">
        {msgs.slice(0, shown).map((m, k) => (
          <Bubble key={`${run}-${k}`} from={m.from}>{m.text}</Bubble>
        ))}
        {typing && <Typing side={typing === "buyer" ? "start" : "end"} />}
        {shown > msgs.length && (
          <motion.span
            initial={reduce ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="flex items-center gap-2 self-end rounded-full bg-nx-lime px-3.5 py-2 font-dmsans text-[13px] font-bold text-nx-indigo"
          >
            <CreditCard size={14} aria-hidden="true" />
            {N.product.payment.label}
            <span className="font-fira text-[9px] font-normal opacity-70">{N.product.payment.via}</span>
          </motion.span>
        )}
      </ChatPhone>
      <figcaption className="mt-3 flex items-center justify-between font-fira text-[10px] tracking-[0.15em] text-cream/60">
        THE CUSTOMER'S CHAT
        {!reduce && (
          <button type="button" onClick={() => setRun((r) => r + 1)} aria-label="Replay the customer chat" className="flex items-center gap-1 text-cream/60 transition-colors hover:text-nx-lime">
            <RotateCcw size={11} aria-hidden="true" /> REPLAY
          </button>
        )}
      </figcaption>
    </figure>
  );
}

/** Types a seller command into her own bot and shows it applied. */
function useTypedCommand(text: string) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [n, setN] = useState(reduce ? text.length : 0);
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (reduce || !inView) return;
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, 70);
    return () => window.clearInterval(id);
  }, [inView, run, reduce, text]);
  return { ref, typed: text.slice(0, n), done: n >= text.length, replay: () => setRun((r) => r + 1) };
}

function SellerCommands() {
  const reduce = useReducedMotion();
  const c = N.product.commands;
  const { ref, typed, done, replay } = useTypedCommand(c.example);
  return (
    <figure className="mx-auto w-full max-w-[16rem]">
      <div ref={ref}>
        <ChatPhone title="My NexusCore bot" sub="Only you can command it" avatar={<Bot size={16} />}>
          <motion.div className="max-w-[86%] self-end rounded-2xl rounded-br-md bg-nx-indigo px-3 py-2 font-fira text-[12px] text-nx-lilac">
            {typed}
            {!done && <span className="fx-caret" />}
          </motion.div>
          {done && (
            <Bubble from="seller" delay={reduce ? 0 : 0.5}>
              <span className="flex items-start gap-1.5 self-start">
                <Check size={13} className="mt-0.5 shrink-0 text-nx-lime" aria-hidden="true" />
                <span>{c.reply}</span>
              </span>
            </Bubble>
          )}
          {done && (
            <motion.span
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-1 self-center rounded-full bg-nx-plum px-2.5 py-1 font-fira text-[10px] text-nx-lime"
            >
              <Clock size={10} aria-hidden="true" /> under a second
            </motion.span>
          )}
        </ChatPhone>
      </div>
      <figcaption className="mt-3 flex items-center justify-between font-fira text-[10px] tracking-[0.15em] text-cream/60">
        THE SELLER'S COMMANDS
        {!reduce && (
          <button type="button" onClick={replay} aria-label="Replay the command" className="flex items-center gap-1 text-cream/60 transition-colors hover:text-nx-lime">
            <RotateCcw size={11} aria-hidden="true" /> REPLAY
          </button>
        )}
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* Design decisions: stacked sticky cards with live visuals                                           */
/* ------------------------------------------------------------------------------------------------ */

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-nx-lilac/10 bg-nx-ink p-4 @xl:p-5 ${className}`}>{children}</div>;
}

function CommandVisual() {
  const { ref, typed, done } = useTypedCommand(N.product.commands.example);
  return (
    <div ref={ref}>
      <Panel>
        <div className="flex items-center gap-2 font-fira text-[10px] text-nx-mist">
          <span className="flex items-center gap-1 rounded-md px-2 py-1 line-through decoration-nx-mist/60 opacity-60">
            <LayoutDashboard size={11} aria-hidden="true" /> dashboard tab
          </span>
          <span className="text-nx-lime">→</span>
          <span className="rounded-md bg-nx-plum px-2 py-1 text-nx-lime">WhatsApp</span>
        </div>
        <p className="mt-4 rounded-xl bg-nx-indigo px-3 py-2.5 font-fira text-sm text-nx-lilac">
          <span className="text-nx-lime">›</span> {typed}
          {!done && <span className="fx-caret" />}
        </p>
        <p className={`mt-2 flex items-center gap-2 font-fira text-xs transition-opacity duration-500 ${done ? "opacity-100" : "opacity-0"}`}>
          <Check size={14} className="text-nx-lime" aria-hidden="true" />
          <span className="text-nx-lilac">catalog updated</span>
          <span className="ml-auto rounded-full bg-nx-lime px-2 py-0.5 text-[10px] text-nx-indigo">&lt; 1s</span>
        </p>
      </Panel>
    </div>
  );
}

function VoiceVisual() {
  const [on, setOn] = useState(0);
  return (
    <Panel>
      <div className="flex flex-wrap gap-2">
        {["Abeg how much na?", "wetin dey"].map((q, i) => (
          <Reveal key={q} delay={i * 0.15} y={8}>
            <span className="inline-block rounded-2xl rounded-bl-md bg-nx-plum px-3 py-1.5 font-dmsans text-[13px] text-nx-lilac">{q}</span>
          </Reveal>
        ))}
      </div>
      <p className="mt-4 font-fira text-[10px] tracking-[0.15em] text-nx-mist">BOT VOICE</p>
      <div role="group" aria-label="Bot voice settings" className="mt-2 flex flex-wrap gap-1.5">
        {N.voices.map((v, i) => (
          <button
            key={v.id}
            type="button"
            aria-pressed={on === i}
            onClick={() => setOn(i)}
            className={`relative rounded-full px-3 py-1.5 font-fira text-[11px] transition-colors ${on === i ? "text-nx-indigo" : "text-nx-lilac/75 hover:text-nx-lime"}`}
          >
            {on === i && <motion.span layoutId="nx-voice" className="absolute inset-0 rounded-full bg-nx-lime" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
            <span className="relative">{v.id}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 font-dmsans text-xs text-nx-mist" aria-live="polite">
        {N.voices[on].note === "Default" ? "The default: how her customers actually write." : "For sellers who serve different markets."}
      </p>
    </Panel>
  );
}

function KoboVisual() {
  const reduce = useReducedMotion();
  const lines: { code: string; out: string; bad: boolean }[] = [
    { code: "0.1 + 0.2", out: "0.30000000000000004", bad: true },
    { code: "10n + 20n", out: "30n kobo", bad: false },
  ];
  return (
    <Panel className="font-fira text-[12px] @xl:text-[13px]">
      {lines.map((l, i) => (
        <motion.div
          key={l.code}
          initial={reduce ? false : { opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 + i * 0.5 }}
          className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-nx-lilac/5 py-2.5 last:border-b-0"
        >
          <span className="w-14 shrink-0 text-[10px] tracking-[0.15em] text-nx-mist">{l.bad ? "FLOAT" : "BIGINT"}</span>
          <span className="text-nx-lilac">{l.code}</span>
          <span className="text-nx-mist">→</span>
          <span className={l.bad ? "text-[#ff9b8a] line-through decoration-[#ff9b8a]/70" : "text-nx-lime"}>{l.out}</span>
          {l.bad ? <X size={14} className="ml-auto text-[#ff9b8a]" aria-label="wrong" /> : <Check size={14} className="ml-auto text-nx-lime" aria-label="exact" />}
        </motion.div>
      ))}
      <p className="mt-2 font-dmsans text-xs text-nx-mist">₦1 = 100 kobo. Exact to the kobo, everywhere.</p>
    </Panel>
  );
}

function CatalogVisual() {
  const reduce = useReducedMotion();
  return (
    <Panel>
      <p className="font-fira text-[10px] tracking-[0.15em] text-nx-mist">CATALOG</p>
      <div className="mt-2 flex items-center justify-between rounded-lg bg-nx-plum px-3 py-2 font-dmsans text-sm text-nx-lilac">
        <span>Blue Ankara · 6 yards</span>
        <span className="font-fira text-nx-lime">₦18,500</span>
      </div>
      <p className="mt-4 font-fira text-[10px] tracking-[0.15em] text-nx-mist">REPLY, AFTER SIGNAL PARSING</p>
      <div className="mt-2 space-y-2 font-dmsans text-sm">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between rounded-lg border border-nx-lime/40 px-3 py-2 text-nx-lilac"
        >
          <span>…is ₦18,500.</span>
          <span className="flex items-center gap-1 font-fira text-[10px] text-nx-lime"><Check size={12} aria-hidden="true" /> matches</span>
        </motion.div>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-between rounded-lg border border-dashed border-nx-lilac/20 px-3 py-2 text-nx-mist"
        >
          <span className="line-through decoration-[#ff9b8a]">…₦5,000 off for you!</span>
          <span className="flex items-center gap-1 font-fira text-[10px] text-[#ff9b8a]"><X size={12} aria-hidden="true" /> blocked</span>
        </motion.div>
      </div>
    </Panel>
  );
}

function EscalateVisual() {
  const reduce = useReducedMotion();
  return (
    <Panel>
      <div className="flex flex-wrap gap-1.5">
        {N.escalateWhen.map((w, i) => (
          <motion.span
            key={w}
            initial={reduce ? false : { opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-full border border-nx-lilac/15 px-2.5 py-1 font-fira text-[10px] text-nx-lilac/80"
          >
            {w}
          </motion.span>
        ))}
      </div>
      <div className="mt-4 grid gap-2 @xl:grid-cols-2">
        <div className="rounded-xl bg-nx-plum p-3">
          <p className="font-fira text-[9px] tracking-[0.15em] text-nx-mist">TO THE BUYER</p>
          <p className="mt-1 font-dmsans text-[13px] text-nx-lilac">&ldquo;I'm connecting you with the team.&rdquo;</p>
        </div>
        <div className="rounded-xl bg-nx-lime p-3 text-nx-indigo">
          <p className="font-fira text-[9px] tracking-[0.15em] opacity-70">TO HER OWN WHATSAPP</p>
          <p className="mt-1 flex items-center gap-1.5 font-dmsans text-[13px] font-bold">
            Summary + <Link2 size={13} aria-hidden="true" /> wa.me link
          </p>
        </div>
      </div>
    </Panel>
  );
}

function WizardVisual() {
  const reduce = useReducedMotion();
  const r = 30;
  const c = 2 * Math.PI * r;
  const checks = [`${N.wizardChecks.catalog} catalog completeness checks`, `${N.wizardChecks.questions} simulated customer questions`, `Diagnostic on WhatsApp within ${N.wizardChecks.diagnosticSeconds}s`];
  return (
    <Panel className="flex flex-wrap items-center gap-5">
      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 70 70" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx={35} cy={35} r={r} fill="none" stroke="rgba(237,233,250,0.1)" strokeWidth={6} />
          <motion.circle
            cx={35}
            cy={35}
            r={r}
            fill="none"
            stroke="#bad532"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={reduce ? false : { strokeDashoffset: c }}
            whileInView={{ strokeDashoffset: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <b className="font-dmsans text-xl leading-none text-nx-lilac">20</b>
          <span className="font-fira text-[9px] text-nx-mist">min</span>
        </span>
      </div>
      <ul className="min-w-[12rem] flex-1 space-y-1.5">
        {checks.map((t, i) => (
          <motion.li
            key={t}
            initial={reduce ? false : { opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 + i * 0.35 }}
            className="flex items-center gap-2 font-dmsans text-[13px] text-nx-lilac"
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-nx-lime text-nx-indigo">
              <Check size={10} strokeWidth={3} aria-hidden="true" />
            </span>
            {t}
          </motion.li>
        ))}
      </ul>
    </Panel>
  );
}

const VISUALS: Record<string, () => JSX.Element> = {
  command: CommandVisual,
  voice: VoiceVisual,
  kobo: KoboVisual,
  catalog: CatalogVisual,
  escalate: EscalateVisual,
  wizard: WizardVisual,
};

function Decisions() {
  return (
    <ol className="mt-10 space-y-5">
      {N.decisions.map((d, i) => {
        const Visual = VISUALS[d.visual];
        return (
          <li key={d.title} className="sticky" style={{ top: `calc(4.25rem + ${i * 0.85}rem)` }}>
            <Reveal y={40}>
              <article className="grid gap-5 rounded-3xl border border-nx-lilac/10 bg-nx-indigo p-5 shadow-[0_-18px_40px_-24px_rgba(0,0,0,0.8)] @xl:p-7 @3xl:grid-cols-[1fr_1fr] @3xl:items-center">
                <div>
                  <span className="font-fira text-4xl font-medium leading-none text-nx-lime">{pad(i + 1)}</span>
                  <h4 className="mt-3 font-dmsans text-2xl font-bold leading-tight tracking-tight text-nx-lilac">{d.title}</h4>
                  <p className="mt-2 font-dmsans text-[15px] leading-relaxed text-nx-lilac/80">{d.text}</p>
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
/* Architecture                                                                                       */
/* ------------------------------------------------------------------------------------------------ */

function Journey() {
  const reduce = useReducedMotion();
  const steps = N.architecture.journey;
  const [at, setAt] = useState(reduce ? steps.length - 1 : 0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  useEffect(() => {
    if (reduce || !inView) return;
    const id = window.setInterval(() => setAt((n) => (n + 1) % (steps.length + 2)), 700);
    return () => window.clearInterval(id);
  }, [reduce, inView, steps.length]);
  return (
    <div ref={ref} className="mt-8 rounded-3xl border border-nx-lilac/10 bg-nx-ink p-4 @xl:p-6">
      <p className="font-fira text-[10px] tracking-[0.2em] text-nx-mist">ONE CUSTOMER MESSAGE, END TO END</p>
      <ol className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-2" aria-label={`The path a message takes: ${steps.join(", then ")}`}>
        {steps.map((s, i) => {
          const lit = i <= at;
          return (
            <li key={s} className="flex items-center gap-1.5">
              <span
                className={`rounded-full border px-3 py-1.5 font-dmsans text-[12.5px] font-medium transition-all duration-300 ${
                  i === at ? "scale-105 border-nx-lime bg-nx-lime text-nx-indigo" : lit ? "border-nx-lime/50 text-nx-lilac" : "border-nx-lilac/15 text-nx-mist"
                }`}
              >
                {s}
              </span>
              {i < steps.length - 1 && <span aria-hidden="true" className={`h-px w-4 transition-colors ${i < at ? "bg-nx-lime" : "bg-nx-lilac/20"}`} />}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 font-dmsans text-xs text-nx-mist">Gemini 2.0 Flash takes over automatically if DeepSeek doesn't answer within 30 seconds.</p>
    </div>
  );
}

function Tools() {
  const [i, setI] = useState(0);
  const tool = N.architecture.tools[i];
  return (
    <div className="mt-6 grid gap-4 @3xl:grid-cols-[1fr_1.1fr]">
      <div role="tablist" aria-label="The stack" className="grid grid-cols-1 gap-1.5 @md:grid-cols-2 @3xl:grid-cols-1">
        {N.architecture.tools.map((t, k) => {
          const on = k === i;
          return (
            <button
              key={t.name}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setI(k)}
              className={`group relative flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors ${on ? "text-nx-indigo" : "bg-nx-ink/60 text-cream hover:bg-nx-ink"}`}
            >
              {on && <motion.span layoutId="nx-tool" className="absolute inset-0 rounded-xl bg-nx-lime" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative font-dmsans text-[14px] font-bold">{t.name}</span>
              <span className={`relative font-fira text-[10px] tracking-[0.1em] ${on ? "text-nx-indigo/70" : "text-nx-mist group-hover:text-nx-lime"}`}>{t.tag.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
      <div className="rounded-3xl border border-nx-lilac/10 bg-nx-indigo p-5 @xl:p-7" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div key={tool.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            <p className="font-fira text-[10px] tracking-[0.2em] text-nx-lime">{tool.tag.toUpperCase()} · {pad(i + 1)} / {pad(N.architecture.tools.length)}</p>
            <p className="mt-2 font-dmsans text-2xl font-bold tracking-tight text-nx-lilac">{tool.name}</p>
            <p className="mt-3 font-dmsans text-[15px] leading-relaxed text-nx-lilac/85">{tool.why}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */
/* Lessons, status, closing                                                                           */
/* ------------------------------------------------------------------------------------------------ */

function Lessons() {
  return (
    <ol className="mt-8 divide-y divide-cream/10 border-y border-cream/10">
      {N.lessons.map((l, i) => (
        <Reveal key={l.title} delay={i * 0.06}>
          <li className="group grid grid-cols-[3.5rem_1fr] gap-4 py-6 @xl:grid-cols-[5rem_1fr]">
            <span className="font-fira text-5xl font-medium leading-none text-transparent transition-colors duration-500 [-webkit-text-stroke:1px_rgba(186,213,50,0.6)] group-hover:text-nx-lime @xl:text-6xl">
              {i + 1}
            </span>
            <span>
              <span className="block font-dmsans text-2xl font-bold leading-tight tracking-tight text-cream transition-colors group-hover:text-nx-lime">{l.title}</span>
              <span className="mt-1 block font-dmsans text-[15px] leading-relaxed text-cream/75">{l.text}</span>
            </span>
          </li>
        </Reveal>
      ))}
    </ol>
  );
}

function Status() {
  const reduce = useReducedMotion();
  const S = N.status;
  return (
    <>
      {/* Ten phases */}
      <div className="mt-8" role="img" aria-label={`Phase ${S.phase} of ${S.phases}`}>
        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: S.phases }, (_, i) => (
            <motion.span
              key={i}
              initial={reduce ? false : { scaleY: 0.2, opacity: 0.3 }}
              whileInView={{ scaleY: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className={`h-8 origin-bottom rounded-md ${i < S.phase - 1 ? "bg-nx-lime" : i === S.phase - 1 ? "caira-ping bg-nx-lime/80" : "bg-cream/10"}`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between font-fira text-[10px] text-cream/55">
          <span>PHASE 1</span>
          <span className="text-nx-lime">PHASE {S.phase} · NOW</span>
        </div>
      </div>

      <div className="mt-10 grid gap-8 @3xl:grid-cols-2">
        <div>
          <h4 className="font-fira text-[11px] tracking-[0.25em] text-nx-lime">LIVE</h4>
          <ul className="mt-4 flex flex-wrap gap-2">
            {S.live.map((l, i) => (
              <motion.li
                key={l}
                initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-1.5 rounded-full bg-nx-indigo px-3 py-1.5 font-dmsans text-[13px] text-nx-lilac"
              >
                <Check size={12} className="text-nx-lime" aria-hidden="true" />
                {l}
              </motion.li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-fira text-[11px] tracking-[0.25em] text-amber">BEFORE GO-LIVE</h4>
          <ul className="mt-4 space-y-2.5">
            {S.remaining.map((s) => (
              <li key={s} className="flex items-center gap-3 font-dmsans text-[15px] text-cream/90">
                <span className="h-4 w-4 shrink-0 rounded-full border-2 border-dashed border-amber" aria-hidden="true" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Proven end to end */}
      <div className="mt-10 rounded-3xl border border-nx-lilac/10 bg-nx-ink p-5 @xl:p-6">
        <p className="font-fira text-[10px] tracking-[0.2em] text-nx-mist">PROVEN END TO END · FLUTTERWAVE TEST MODE</p>
        <ol className="mt-4 grid gap-2 @xl:grid-cols-3 @3xl:grid-cols-6">
          {S.proof.map((p, i) => (
            <motion.li
              key={p}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ delay: i * 0.12, ease: EASE }}
              className="flex gap-2.5 rounded-xl bg-nx-plum/70 p-3 @3xl:flex-col"
            >
              <span className="font-fira text-xs text-nx-lime">{pad(i + 1)}</span>
              <span className="font-dmsans text-[13px] leading-snug text-nx-lilac">{p}</span>
            </motion.li>
          ))}
        </ol>
      </div>

      <Reveal className="mt-6">
        <div className="flex flex-wrap items-center gap-5 rounded-3xl bg-nx-lime p-5 text-nx-indigo @xl:p-6">
          <CountUp to={S.target.n} className="font-dmsans text-7xl font-bold leading-none tracking-tighter" />
          <p className="max-w-[28ch] font-dmsans text-lg font-bold leading-snug">
            <span className="block font-fira text-[10px] font-normal tracking-[0.2em] opacity-70">THE TARGET</span>
            {S.target.text}
          </p>
        </div>
      </Reveal>
    </>
  );
}

function Closing({ scrollRef }: { scrollRef?: RefObject<HTMLElement | null> }) {
  const reduce = useReducedMotion();
  const A = N.about;
  return (
    <>
      <LitWords text={A.text} scrollRef={scrollRef} className="mt-6 font-dmsans text-2xl font-medium leading-snug tracking-tight text-cream @xl:text-3xl" />
      <p className="mt-10 font-fira text-[11px] tracking-[0.2em] text-cream/55">DEFAULTS REFUSED</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {A.refused.map((r, i) => (
          <li key={r} className="relative rounded-full border border-cream/15 px-3.5 py-1.5 font-dmsans text-[14px] text-cream/60">
            {r}
            <motion.span
              aria-hidden="true"
              className="absolute left-2.5 right-2.5 top-1/2 h-[2px] origin-left rounded-full bg-nx-lime"
              initial={reduce ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.2 + i * 0.15 }}
            />
          </li>
        ))}
      </ul>
      <Reveal className="mt-10">
        <blockquote className="border-l-4 border-nx-lime pl-5 font-dmsans text-2xl font-bold leading-snug tracking-tight text-nx-lime @xl:text-[1.9rem]">{A.thesis}</blockquote>
      </Reveal>
      <div className="-mx-6 mt-12 overflow-hidden sm:-mx-10" aria-hidden="true">
        <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap font-dmsans text-5xl font-bold tracking-tight text-nx-lime/80 @xl:text-6xl">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="flex items-center gap-8">
              Abeg how much na?
              <span className="h-3 w-3 rounded-full bg-nx-lilac/40" />
              Built to this reality
              <span className="h-3 w-3 rounded-full bg-nx-lilac/40" />
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

export default function NexusStudy({ scrollRef, onLetsWork }: { scrollRef?: RefObject<HTMLElement | null>; onLetsWork: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);
  const progress = useStudyProgress(scrollRef, rootRef);
  const P = N.problem;
  const live = N.facts.find((f) => "url" in f && f.url);
  const facts = N.facts.filter((f) => f !== live);

  return (
    <div ref={rootRef} className="@container">
      <StudyBar id="nexus" label="NEXUSCORE · CASE STUDY" chapters={CHAPTERS} chapter={chapter} progress={progress} tone={NX_TONE} />

      <Hero />

      <Chapter n={1} onEnter={setChapter}>
        <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-cream/10 bg-cream/10 @md:grid-cols-2">
          {facts.map((f, i) => (
            // The last fact stretches to close the row when the count is odd
            <Reveal key={f.label} delay={i * 0.05} y={14} className={`bg-secondary p-5 ${i === facts.length - 1 && facts.length % 2 ? "@md:col-span-2" : ""}`}>
              <dt className="font-fira text-[10px] tracking-[0.2em] text-nx-lime">{f.label.toUpperCase()}</dt>
              <dd className="mt-1.5 font-dmsans text-[15px] font-medium leading-snug text-cream">{f.value}</dd>
            </Reveal>
          ))}
          {live && "url" in live && live.url && (
            <LiveRow label={live.label} value={live.value} url={live.url} note={"note" in live ? live.note : undefined} accent={NX_LIVE} />
          )}
        </dl>
        <Reveal className="mt-6">
          <p className="font-fira text-[10px] tracking-[0.2em] text-cream/55">STACK</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {N.stack.map((s) => (
              <li key={s} className="rounded-full border border-nx-lime/30 px-3 py-1 font-fira text-[11px] text-cream/85 transition-colors hover:border-nx-lime hover:text-nx-lime">
                {s}
              </li>
            ))}
          </ul>
        </Reveal>
      </Chapter>

      <Chapter n={2} title={P.title} onEnter={setChapter}>
        <div className="mt-8 grid items-start gap-10 @3xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <LitWords text={P.story} scrollRef={scrollRef} className="font-dmsans text-xl font-medium leading-snug text-cream @xl:text-2xl" />
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="The four questions">
              {P.questions.map((q, i) => (
                <Reveal key={q} delay={i * 0.08} y={8}>
                  <li className="rounded-2xl rounded-bl-md bg-nx-plum px-3.5 py-2 font-dmsans text-[14px] text-nx-lilac">{q}</li>
                </Reveal>
              ))}
            </ul>
          </div>
          <Reveal delay={0.1}>
            <Inbox />
          </Reveal>
        </div>

        <p className="mt-12 font-fira text-[11px] tracking-[0.2em] text-cream/55">WHAT SHE'D CONSIDERED</p>
        <ul className="mt-3 grid gap-3 @xl:grid-cols-3">
          {P.tried.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08} y={16}>
              <li className="h-full rounded-2xl border border-cream/10 bg-base/30 p-4">
                <span className="flex items-center gap-2 font-dmsans text-[15px] font-bold text-cream">
                  <X size={15} className="shrink-0 text-[#ff9b8a]" aria-hidden="true" />
                  {t.name}
                </span>
                <span className="mt-1 block font-dmsans text-[14px] leading-snug text-cream/70">{t.why}</span>
              </li>
            </Reveal>
          ))}
        </ul>
        <Reveal className="mt-6">
          <p className="max-w-[60ch] font-dmsans text-[16px] leading-relaxed text-cream/85">{P.voice}</p>
        </Reveal>
        <Reveal className="mt-8">
          <blockquote className="border-l-4 border-nx-lime pl-5 font-dmsans text-xl font-medium leading-snug text-cream @xl:text-2xl">
            {P.insight}
            <span className="mt-3 block font-bold text-nx-lime">{P.answer}</span>
          </blockquote>
        </Reveal>
      </Chapter>

      <Chapter n={3} title={N.product.title} onEnter={setChapter}>
        <Flow />
        <div className="mt-12 grid items-start gap-x-5 gap-y-10 @md:grid-cols-2 @3xl:grid-cols-[1fr_16rem_16rem]">
          <Reveal className="@md:col-span-2 @3xl:col-span-1">
            <div className="rounded-3xl border border-nx-lilac/10 bg-nx-indigo p-5 @xl:p-6">
              <p className="font-fira text-[10px] tracking-[0.2em] text-nx-lime">RUN FROM WHATSAPP</p>
              <p className="mt-2 font-dmsans text-[15px] leading-relaxed text-nx-lilac/85">{N.product.commands.note}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {N.product.commands.intents.map((c) => (
                  <li key={c} className="rounded-full bg-nx-ink px-3 py-1 font-fira text-[11px] text-nx-lilac/85">{c}</li>
                ))}
                <li className="rounded-full border border-dashed border-nx-lilac/25 px-3 py-1 font-fira text-[11px] text-nx-mist">+ 8 more</li>
              </ul>
              <p className="mt-4 flex items-center gap-2 font-dmsans text-xs text-nx-mist">
                <Mic size={12} aria-hidden="true" /> Demo copy from my content-design sample; the shop and prices are made up.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <CustomerChat />
          </Reveal>
          <Reveal delay={0.1}>
            <SellerCommands />
          </Reveal>
        </div>
      </Chapter>

      <Chapter n={4} title="Six calls that shaped everything" onEnter={setChapter}>
        <Decisions />
      </Chapter>

      <Chapter n={5} title={N.architecture.title} onEnter={setChapter}>
        <Journey />
        <Tools />
      </Chapter>

      <Chapter n={6} title="What building it taught me" onEnter={setChapter}>
        <Lessons />
      </Chapter>

      <Chapter n={7} title={N.status.title} onEnter={setChapter}>
        <Status />
      </Chapter>

      <Chapter n={8} title={N.about.title} onEnter={setChapter}>
        <Closing scrollRef={scrollRef} />
      </Chapter>

      <Reveal className="mt-12 flex flex-wrap items-center gap-3">
        <a
          href={N.url}
          target="_blank"
          rel="noopener noreferrer"
          data-magnetic="0.2"
          className="fx-spotlight group inline-flex items-center gap-2 rounded-full bg-nx-lime px-5 py-2.5 font-mono text-xs font-medium tracking-[0.15em] text-nx-indigo transition-colors hover:bg-tertiary active:bg-primary active:text-cream"
        >
          <RollText text="SEE THE LIVE DEMO" />
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

