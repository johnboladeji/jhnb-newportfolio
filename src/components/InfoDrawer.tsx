import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ChevronDown, Download, Menu, X } from "lucide-react";
import { about, contact, contentDesign, menu, posts, projects, resume, socials } from "../content";
import RollText from "./RollText";

export type DrawerView = "menu" | "projects" | "about" | "contentDesign" | "articles" | "resume" | "contact";

interface InfoDrawerProps {
  open: boolean;
  view: DrawerView;
  onNavigate: (view: DrawerView) => void;
  onClose: () => void;
}

const TITLES: Record<DrawerView, string> = {
  menu: "Menu",
  projects: "Projects",
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

  // Reset scroll when switching views
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [view]);

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
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-cream/5 bg-secondary sm:max-w-xl md:max-w-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
          >
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              {/* Sticky header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cream/5 bg-secondary/90 px-6 py-5 backdrop-blur-md sm:px-10 pt-[max(1.25rem,env(safe-area-inset-top))]">
                {view === "menu" ? (
                  <span className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-cream/70">
                    <Menu size={16} aria-hidden="true" />
                    MENU
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate("menu")}
                    className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-cream/80 transition-colors hover:text-tertiary underline-offset-[6px] decoration-2 hover:underline"
                  >
                    <ArrowLeft size={16} aria-hidden="true" />
                    BACK
                  </button>
                )}
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                  data-magnetic="0.35"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 text-cream transition-colors hover:border-tertiary hover:bg-tertiary hover:text-base"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="px-6 pb-[max(3rem,env(safe-area-inset-bottom))] pt-8 sm:px-10">
                <h2
                  id="drawer-title"
                  className={view === "menu" ? "sr-only" : "mb-8 font-display text-5xl uppercase text-cream sm:text-6xl"}
                >
                  {TITLES[view]}
                </h2>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={view}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.2 }}
                  >
                    {view === "menu" && <MenuView onNavigate={onNavigate} onClose={onClose} />}
                    {view === "projects" && <ProjectsView />}
                    {view === "contentDesign" && <ContentDesignView />}
                    {view === "articles" && <ArticlesView />}
                    {view === "about" && <AboutView />}
                    {view === "resume" && <ResumeView />}
                    {view === "contact" && <ContactView />}
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
  "group relative flex items-center gap-3 py-1 pl-5 text-left font-sans text-[2.5rem] font-bold leading-[1.15] tracking-tight transition-[color,transform] duration-300 hover:translate-x-2 hover:text-tertiary sm:text-6xl";

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
                  className={`${menuItemClass} ${writingOpen ? "text-tertiary" : "text-cream"}`}
                >
                  <RollText text={item.label} />
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
                            className="group py-1.5 text-left font-sans text-2xl font-bold text-cream transition-[color,transform] duration-300 hover:translate-x-1.5 hover:text-tertiary sm:text-3xl"
                          >
                            <RollText text={child.label} />
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </>
            ) : item.view === "home" ? (
              <button type="button" onClick={onClose} aria-current="page" className={`${menuItemClass} text-tertiary`}>
                {/* Current-page marker: a thin rule with a dot */}
                <span aria-hidden="true" className="absolute left-0 top-1/2 h-[70%] w-[2px] -translate-y-1/2 rounded-full bg-tertiary">
                  <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tertiary" />
                </span>
                <RollText text={item.label} />
              </button>
            ) : (
              <button type="button" onClick={() => onNavigate(item.view)} className={`${menuItemClass} text-cream`}>
                <RollText text={item.label} />
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

/** External links open in a new tab; #anchors and site paths stay in place. */
function linkProps(url: string) {
  return /^https?:\/\//.test(url) ? { href: url, target: "_blank", rel: "noopener noreferrer" } : { href: url };
}

function ProjectsView() {
  return (
    <ul>
      {projects.map((p) => (
        <Row key={p.name}>
          <a {...linkProps(p.url)} className="group flex items-baseline justify-between gap-4">
            <span>
              <span className="block font-display text-3xl uppercase text-cream underline-offset-[6px] decoration-2 transition-colors group-hover:text-tertiary group-hover:underline">
                {p.name}
              </span>
              <span className="mt-1 block text-sm text-cream/70">{p.type}</span>
            </span>
            <span className="font-mono text-xs text-cream/70">{p.meta}</span>
          </a>
        </Row>
      ))}
    </ul>
  );
}

function ContentDesignView() {
  if (contentDesign.length === 0) {
    return <p className="max-w-prose text-base leading-relaxed text-cream/85">Content design samples are on the way.</p>;
  }
  return (
    <ul>
      {contentDesign.map((p) => (
        <Row key={p.title}>
          <a {...linkProps(p.url)} className="group block">
            <span className="block text-xl font-medium text-cream underline-offset-4 decoration-2 transition-colors group-hover:text-tertiary group-hover:underline">
              {p.title}
            </span>
            <span className="mt-1 block font-mono text-xs text-cream/70">{p.meta}</span>
          </a>
        </Row>
      ))}
    </ul>
  );
}

function ArticlesView() {
  return (
    <ul>
      {posts.map((p) => (
        <Row key={p.title}>
          <a {...linkProps(p.url)} className="group block">
            <span className="block text-xl font-medium text-cream underline-offset-4 decoration-2 transition-colors group-hover:text-tertiary group-hover:underline">
              {p.title}
            </span>
            <span className="mt-1 block font-mono text-xs text-cream/70">{p.date}</span>
          </a>
        </Row>
      ))}
    </ul>
  );
}

function AboutView() {
  return (
    <div className="max-w-prose space-y-5 text-base leading-relaxed text-cream/85">
      {about.paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <p className="text-cream/70">{about.availability}</p>
      {socials.length > 0 && (
        <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-4">
          {socials.map((s) => (
            <li key={s.label}>
              <a
                {...linkProps(s.url)}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-mono text-xs tracking-[0.15em] text-cream transition-colors hover:bg-tertiary hover:text-base"
              >
                {s.label.toUpperCase()}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
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
          className="fx-spotlight group mt-8 inline-flex items-center gap-2 border border-cream/30 px-6 py-3 font-mono text-xs tracking-[0.2em] text-cream transition-colors hover:border-tertiary hover:bg-tertiary hover:text-base"
        >
          <Download size={16} aria-hidden="true" />
          <RollText text="DOWNLOAD RESUME (PDF)" />
        </a>
      )}
    </div>
  );
}

const fieldClass =
  "w-full border-0 border-b border-cream/40 bg-transparent px-0 py-3 text-base text-cream placeholder:text-cream/70 transition-colors focus:border-tertiary focus:outline-none focus:ring-0";
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
          className="pt-2 font-mono text-xs tracking-[0.15em] text-cream/70 underline decoration-2 underline-offset-4 hover:text-tertiary"
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
        className="fx-spotlight group w-full bg-primary py-4 font-mono text-sm font-medium tracking-[0.2em] text-cream transition-colors hover:bg-tertiary hover:text-base disabled:opacity-60 sm:w-auto sm:px-12"
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
