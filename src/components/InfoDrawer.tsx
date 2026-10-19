import { lazy, Suspense, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ChevronDown, Download, LayoutGrid, Maximize2, Menu, Minimize2, X } from "lucide-react";
import { contact, menu, projects, resume, worksHeadline } from "../content";
import RollText from "./RollText";
import DrawerPortraits from "./DrawerPortraits";
import AboutSection from "./AboutSection";
import TypeLoop from "./TypeLoop";
import ContentDesignSection from "./ContentDesign";
import ArticlesSection from "./Articles";
// Physics capsules (matter-js) load only when Let's Work opens, keeping the engine out of the first page load
const SkillCapsules = lazy(() => import("./SkillCapsules"));
import { CaseStudy, WorksList } from "./Works";

export type DrawerView = "menu" | "projects" | "caseStudy" | "about" | "contentDesign" | "articles" | "resume" | "contact";

interface InfoDrawerProps {
  open: boolean;
  view: DrawerView;
  onNavigate: (view: DrawerView) => void;
  onClose: () => void;
}

const TITLES: Record<DrawerView, string> = {
  menu: "Menu",
  projects: "Selected works",
  caseStudy: "Case study",
  about: "About me",
  contentDesign: "Content design",
  articles: "Articles",
  resume: "Resume",
  contact: "Let's work",
};

// -----------------------------------------------------------------------------

export default function InfoDrawer({ open, view, onNavigate, onClose }: InfoDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  // Which project the case-study view shows
  const [caseSlug, setCaseSlug] = useState(projects[0].slug);
  const openCase = (slug: string) => {
    setCaseSlug(slug);
    onNavigate("caseStudy");
  };
  // Full-screen reading mode for content views (not the menu); resets whenever the drawer closes
  const [full, setFull] = useState(false);
  useEffect(() => {
    if (!open) setFull(false);
  }, [open]);
  const canExpand = view !== "menu";
  const isFull = full && canExpand;
  // About and Projects share a layout: pinned header, own inner scroller, full width (no max-width) in full screen
  const pinned = view === "about" || view === "projects" || view === "contentDesign" || view === "articles";
  const [wide, setWide] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setWide(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Focus management, Escape to close, and a simple focus trap
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  // Publish the sticky bar's height so pinned content (the About header) can sit right under it
  useEffect(() => {
    if (!open) return;
    const head = headRef.current;
    const panel = panelRef.current;
    if (!head || !panel) return;
    const set = () => panel.style.setProperty("--drawer-head", `${head.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(head);
    return () => ro.disconnect();
  }, [open]);

  // Reset scroll when switching views (or moving to the next case study)
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [view, caseSlug]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-base/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-cream/5 bg-secondary transition-[max-width] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] sm:max-w-xl md:max-w-2xl"
            style={isFull ? { maxWidth: "100vw" } : undefined}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
          >
            {/* Portraits sit behind everything at the panel's right edge; full strength on the menu, dimmed elsewhere */}
            <DrawerPortraits dim={view !== "menu"} />
          {/* Top bar: no fill (the portrait shows through it). It sits outside the scroller, so content scrolls
              below it rather than under it. */}
          <div ref={headRef} className="relative z-30 flex shrink-0 items-center justify-between border-b border-cream/5 px-6 py-5 sm:px-10 pt-[max(1.25rem,env(safe-area-inset-top))]">
              {view === "menu" ? (
                <span className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-cream/70">
                  <Menu size={16} aria-hidden="true" />
                  MENU
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate(view === "caseStudy" ? "projects" : "menu")}
                  className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-cream/80 transition-colors hover:text-tertiary underline-offset-[6px] decoration-2 hover:underline active:text-cream active:decoration-primary"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  BACK
                </button>
              )}
              <div className="flex items-center gap-2">
              {canExpand && (
                <button
                  type="button"
                  onClick={() => setFull((f) => !f)}
                  aria-pressed={isFull}
                  aria-label={isFull ? "Exit full screen" : "Open in full screen"}
                  title={isFull ? "Exit full screen" : "Open in full screen"}
                  data-magnetic="0.35"
                  className="hidden h-10 w-10 items-center justify-center rounded-full border border-cream/15 text-cream transition-colors hover:border-tertiary hover:bg-tertiary hover:text-base active:border-primary active:bg-primary active:text-cream sm:flex"
                >
                  {isFull ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
                </button>
              )}
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                data-magnetic="0.35"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 text-cream transition-colors hover:border-tertiary hover:bg-tertiary hover:text-base active:border-primary active:bg-primary active:text-cream"
              >
                <X size={18} aria-hidden="true" />
              </button>
              </div>
            </div>

            {/* About and Projects lay themselves out to fit exactly and scroll inside their own segments, so the outer scroller is locked */}
            <div ref={scrollRef} className={`fx-scroll relative z-10 flex-1 ${pinned ? "overflow-hidden" : "overflow-y-auto"}`}>
              {/* About / Projects fill exactly the height under the bar so only their segments scroll */}
              <div
                className={
                  pinned
                    ? "flex h-[calc(100dvh-var(--drawer-head,5rem))] flex-col px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 sm:px-10"
                    : `px-6 pb-[max(3rem,env(safe-area-inset-bottom))] pt-8 sm:px-10 ${isFull ? "mx-auto max-w-5xl" : ""}`
                }
              >
                {/* About renders its own pinned title + typing headline */}
                {/* Projects matches About Me: outlined title + coral, continuously-typed headline */}
                {view === "projects" && (
                  <header className="shrink-0">
                    <h2 id="drawer-title" className="text-stroke font-display text-5xl uppercase leading-none sm:text-6xl">
                      {TITLES.projects}
                    </h2>
                    <TypeLoop
                      text={worksHeadline}
                      className={`mt-3 font-sans font-bold leading-snug tracking-tight text-primary-soft ${
                        isFull
                          ? "mx-auto max-w-[52rem] text-center text-2xl sm:text-3xl lg:text-[2.6rem] lg:leading-[1.15]"
                          : "max-w-[38rem] text-[1.4rem] sm:text-[1.75rem]"
                      }`}
                    />
                  </header>
                )}
                {view !== "about" && view !== "projects" && view !== "contentDesign" && view !== "articles" && (
                  <h2
                    id="drawer-title"
                    className={view === "menu" ? "sr-only" : "mb-8 font-display text-5xl uppercase text-cream sm:text-6xl"}
                  >
                    {view === "caseStudy" ? (projects.find((p) => p.slug === caseSlug)?.name ?? TITLES.caseStudy) : TITLES[view]}
                  </h2>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={view === "caseStudy" ? `case-${caseSlug}` : view}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.2 }}
                    className={pinned ? "flex min-h-0 flex-1 flex-col" : undefined}
                  >
                    {view === "menu" && <MenuView onNavigate={onNavigate} onClose={onClose} />}
                    {view === "projects" && (
                      <>
                        {/* Same rule + label row as About's tab bar */}
                        <div className="mt-5 flex shrink-0 items-center justify-between border-b border-cream/10 pb-3 font-mono text-xs tracking-[0.25em]">
                          <span className="flex items-center gap-2 text-primary-soft">
                            <LayoutGrid size={14} aria-hidden="true" />
                            ALL WORK
                          </span>
                          <span className="text-cream/60">{String(projects.length).padStart(2, "0")} PROJECTS</span>
                        </div>
                        <div className="fx-scroll mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6 pr-3">
                          <WorksList onOpen={openCase} columns={isFull && wide ? 2 : 1} />
                        </div>
                      </>
                    )}
                    {view === "caseStudy" && (
                      <CaseStudy slug={caseSlug} onOpen={setCaseSlug} onLetsWork={() => onNavigate("contact")} scrollRef={scrollRef} />
                    )}
                    {view === "contentDesign" && <ContentDesignSection full={isFull} />}
                    {view === "articles" && <ArticlesSection full={isFull} />}
                    {view === "about" && <AboutSection full={isFull} onLetsWork={() => onNavigate("contact")} />}
                    {view === "resume" && <ResumeView />}
                    {view === "contact" && (
                      <>
                        <ContactView />
                        <Suspense fallback={null}>
                          <SkillCapsules />
                        </Suspense>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ---- Views ------------------------------------------------------------------

const menuItemClass =
  "group relative flex items-center gap-3 py-1 pl-5 text-left font-sans text-[2.5rem] font-bold leading-[1.15] tracking-tight [text-shadow:0_2px_18px_rgba(21,6,0,0.75)] transition-[color,transform] duration-300 hover:translate-x-2 hover:text-tertiary active:scale-[0.98] active:text-cream sm:text-6xl";
// Current / selected item: coral text (primary-soft, a light tint of the brand red) plus a thick brand-red bar
// under the label (see <MenuLabel>), clearly different from the peach hover and the cream default. The bar is
// an element, not text-decoration, because the letter-roll spans would hide an underline.
const menuItemCurrent = "text-primary-soft";

function MenuLabel({ text, current = false, thin = false }: { text: string; current?: boolean; thin?: boolean }) {
  return (
    <span className="relative">
      <RollText text={text} />
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 rounded-full bg-primary transition-opacity duration-150 group-active:opacity-100 ${
          thin ? "-bottom-0.5 h-[3px]" : "-bottom-1 h-[5px]"
        } ${current ? "opacity-100" : "opacity-0"}`}
      />
    </span>
  );
}

/** Large stacked menu. "Home" is the current page; "Writing" expands to its sub-pages. */
function MenuView({ onNavigate, onClose }: { onNavigate: (v: DrawerView) => void; onClose: () => void }) {
  const [writingOpen, setWritingOpen] = useState(false);

  return (
    <nav aria-label="Main">
      <ul className="flex flex-col gap-1 sm:gap-2">
        {menu.map((item, i) => (
          <motion.li
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 + i * 0.05, duration: 0.35, ease: "easeOut" }}
          >
            {"children" in item ? (
              <>
                <button
                  type="button"
                  aria-expanded={writingOpen}
                  aria-controls="menu-writing"
                  onClick={() => setWritingOpen((o) => !o)}
                  className={`${menuItemClass} ${writingOpen ? menuItemCurrent : "text-cream"}`}
                >
                  <MenuLabel text={item.label} current={writingOpen} />
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-7 w-7 transition-transform duration-300 sm:h-9 sm:w-9 ${writingOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {writingOpen && (
                    <motion.ul
                      id="menu-writing"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="ml-9 overflow-hidden border-l border-cream/20 pl-6 sm:ml-10"
                    >
                      {item.children.map((child) => (
                        <li key={child.view}>
                          <button
                            type="button"
                            onClick={() => onNavigate(child.view)}
                            className="group py-1.5 text-left font-sans text-2xl font-bold text-cream transition-[color,transform] duration-300 hover:translate-x-1.5 hover:text-tertiary active:text-cream sm:text-3xl"
                          >
                            <MenuLabel text={child.label} thin />
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </>
            ) : item.view === "home" ? (
              <button type="button" onClick={onClose} aria-current="page" className={`${menuItemClass} ${menuItemCurrent}`}>
                {/* Current-page marker: a thin rule with a dot */}
                <span aria-hidden="true" className="absolute left-0 top-1/2 h-[70%] w-[3px] -translate-y-1/2 rounded-full bg-primary">
                  <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
                </span>
                <MenuLabel text={item.label} current />
              </button>
            ) : (
              <button type="button" onClick={() => onNavigate(item.view)} className={`${menuItemClass} text-cream`}>
                <MenuLabel text={item.label} />
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-7 w-7 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:h-9 sm:w-9"
                />
              </button>
            )}
          </motion.li>
        ))}
      </ul>
    </nav>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <li className="border-b border-cream/10 py-5">{children}</li>;
}

function ResumeView() {
  return (
    <div>
      <ul>
        {resume.roles.map((r) => (
          <Row key={r.period}>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <span>
                <span className="block text-xl font-medium text-cream">{r.role}</span>
                <span className="block text-sm text-cream/70">{r.org}</span>
              </span>
              <span className="font-mono text-xs text-cream/70">{r.period}</span>
            </div>
          </Row>
        ))}
      </ul>
      {resume.pdfUrl && (
        <a
          href={resume.pdfUrl}
          download={resume.pdfFileName}
          data-magnetic="0.2"
          className="fx-spotlight group mt-8 inline-flex items-center gap-2 border border-cream/30 px-6 py-3 font-mono text-xs tracking-[0.2em] text-cream transition-colors hover:border-tertiary hover:bg-tertiary hover:text-base active:border-primary active:bg-primary active:text-cream"
        >
          <Download size={16} aria-hidden="true" />
          <RollText text="DOWNLOAD RESUME (PDF)" />
        </a>
      )}
    </div>
  );
}

const fieldClass =
  "w-full border-0 border-b border-cream/40 bg-transparent px-0 py-3 text-[16px] text-cream placeholder:text-cream/70 transition-colors focus:border-tertiary focus:outline-none focus:ring-0";
const labelClass = "mb-1 block font-mono text-xs tracking-[0.15em] text-cream/70";

type Status = "idle" | "sending" | "sent" | "error";

function ContactView() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    // Honeypot: real people never fill this hidden field
    if (data.company_website) {
      setStatus("sent");
      return;
    }
    delete data.company_website;

    // No form service configured → open the visitor's email app, prefilled
    if (!contact.formEndpoint) {
      const subject = `Project enquiry: ${data.type} — ${data.name}`;
      const body = `Name: ${data.name}\nEmail: ${data.email}\nProject type: ${data.type}\nBudget: ${data.budget}\n\n${data.message}`;
      window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus("sent");
      return;
    }

    setStatus("sending");
    setError("");
    try {
      const res = await fetch(contact.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
      setError(`Your enquiry didn't send. Check your connection and try again, or email ${contact.email}.`);
    }
  };

  if (status === "sent") {
    return (
      <div role="status" className="space-y-3">
        <p className="font-display text-4xl uppercase text-tertiary">Enquiry sent</p>
        <p className="text-cream/80">Thanks — {contact.replyTime.charAt(0).toLowerCase() + contact.replyTime.slice(1)}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="pt-2 font-mono text-xs tracking-[0.15em] text-cream/70 underline decoration-2 underline-offset-4 hover:text-tertiary active:text-cream active:decoration-primary"
        >
          SEND ANOTHER
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>NAME</label>
          <input id="name" name="name" type="text" required autoComplete="name" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>EMAIL</label>
          <input id="email" name="email" type="email" required autoComplete="email" className={fieldClass} />
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <SelectField id="type" label="PROJECT TYPE" options={contact.projectTypes} />
        <SelectField id="budget" label="BUDGET" options={contact.budgets} />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>ABOUT THE PROJECT</label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Goals, timeline, anything I should know"
          className={`${fieldClass} resize-none`}
        />
      </div>

      {/* Honeypot (hidden from people and screen readers) */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="company_website">Leave this empty</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status === "error" && (
        <p role="alert" className="border-l-2 border-tertiary pl-4 text-sm text-cream">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        data-magnetic="0.15"
        className="fx-spotlight group w-full bg-primary py-4 font-mono text-sm font-medium tracking-[0.2em] text-cream transition-colors hover:bg-tertiary hover:text-base active:bg-cream active:text-base disabled:opacity-60 sm:w-auto sm:px-12"
      >
        {status === "sending" ? "SENDING…" : <RollText text="SEND ENQUIRY" />}
      </button>
    </form>
  );
}

function SelectField({ id, label, options }: { id: string; label: string; options: string[] }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className="relative">
        <select id={id} name={id} required defaultValue="" className={`${fieldClass} appearance-none pr-8`}>
          <option value="" disabled className="bg-secondary text-cream/70">
            Choose one
          </option>
          {options.map((o) => (
            <option key={o} value={o} className="bg-secondary text-cream">
              {o}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-cream/70"
        />
      </div>
    </div>
  );
}
