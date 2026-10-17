import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Share2, X } from "lucide-react";
import { menuButtonLabel, site, socials } from "../content";
import SocialIcon from "./SocialIcon";

interface HeaderProps {
  onMenu: () => void;
}

export default function Header({ onMenu }: HeaderProps) {
  return (
    <header className="relative z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 lg:px-12">
      <div className="justify-self-start">
        {/* md and up: the full row. Below md: one button that drops the list down vertically. */}
        <nav aria-label="Social profiles" className="hidden md:block">
          <ul className="flex items-center gap-1 lg:gap-1.5">
            {socials.map((s) => (
              <li key={s.label}>
                <SocialLink {...s} />
              </li>
            ))}
          </ul>
        </nav>
        <SocialDropdown />
      </div>

      <LogoMorph />

      <div className="justify-self-end">
        <MenuButton onClick={onMenu} />
      </div>
    </header>
  );
}

/** Icon link with a filled hover chip: peach fill, base-colour glyph (13:1). */
function SocialLink({ label, icon, url }: (typeof socials)[number]) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      data-magnetic="0.4"
      className="flex h-8 w-8 items-center justify-center rounded-full text-cream/80 transition-colors duration-200 hover:bg-tertiary hover:text-base focus-visible:bg-tertiary focus-visible:text-base lg:h-9 lg:w-9"
    >
      <SocialIcon name={icon} className="h-4 w-4 lg:h-[19px] lg:w-[19px]" />
    </a>
  );
}

/** Mobile: a single share button; hover (mouse) or tap opens a vertical list of the profiles. */
function SocialDropdown() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hoverOpenedAt = useRef(0);
  const listId = useId();

  // Close on outside tap or Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative md:hidden"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse" || open) return;
        hoverOpenedAt.current = performance.now();
        setOpen(true);
      }}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={open ? "Hide social profiles" : "Show social profiles"}
        data-magnetic="0.35"
        // A mouse click that lands right after hover opened the list shouldn't immediately close it again
        onClick={() => {
          if (performance.now() - hoverOpenedAt.current < 400) return;
          setOpen((o) => !o);
        }}
        className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-200 ${
          open ? "border-tertiary bg-tertiary text-base" : "border-cream/20 text-cream hover:border-tertiary hover:bg-tertiary hover:text-base"
        }`}
      >
        {open ? <X size={16} aria-hidden="true" /> : <Share2 size={16} aria-hidden="true" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            aria-label="Social profiles"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 top-full mt-2 flex flex-col gap-1 rounded-full border border-cream/10 bg-secondary/95 p-0.5 shadow-lg shadow-black/40 backdrop-blur-md"
          >
            {socials.map((s, i) => (
              <motion.li
                key={s.label}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 + i * 0.04, duration: 0.2 }}
              >
                <SocialLink {...s} />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Icon logo that spins away and unveils the full wordmark (letters at the icon's "J." size) on hover or keyboard focus. */
function LogoMorph() {
  const [iconFailed, setIconFailed] = useState(false);

  return (
    <a
      href="/"
      aria-label={`${site.fullName} — home`}
      data-magnetic="0.3"
      className="group relative flex h-9 w-9 items-center justify-center sm:h-10 sm:w-10 lg:h-12 lg:w-12"
    >
      {site.logoSrc && !iconFailed ? (
        <img
          src={site.logoSrc}
          alt=""
          width={48}
          height={48}
          onError={() => setIconFailed(true)}
          draggable={false}
          className="h-full w-full select-none transition duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:-rotate-90 group-hover:scale-50 group-hover:opacity-0 group-focus-visible:-rotate-90 group-focus-visible:scale-50 group-focus-visible:opacity-0"
        />
      ) : (
        <span className="font-display text-xl uppercase tracking-widest text-cream">{site.logo}</span>
      )}
      {site.wordmarkSrc && (
        <img
          src={site.wordmarkSrc}
          alt=""
          draggable={false}
          // 60% of the icon's height: the icon's "J." ink is 54% of its tile and the wordmark's J is 91% of its
          // image, so at 60% the two J's match and the morph reads as the same mark growing its letters.
          className="pointer-events-none absolute left-1/2 top-1/2 h-[60%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none opacity-0 transition-[clip-path,opacity] delay-100 duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] [clip-path:inset(0_50%_0_50%)] group-hover:opacity-100 group-hover:[clip-path:inset(0_0_0_0)] group-focus-visible:opacity-100 group-focus-visible:[clip-path:inset(0_0_0_0)]"
        />
      )}
    </a>
  );
}

/** Pill with a rolling "View Me" caption and a hamburger whose lines shift; hover fills the pill peach. */
function MenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label={`${menuButtonLabel} — open menu`}
      data-magnetic="0.25"
      className="fx-spotlight group flex items-center gap-2.5 rounded-full border border-cream/20 py-1 pl-3.5 pr-1 transition-colors duration-300 hover:border-tertiary hover:bg-tertiary focus-visible:border-tertiary focus-visible:bg-tertiary sm:gap-3 sm:py-1.5 sm:pl-5 sm:pr-1.5"
    >
      {/* The caption rolls forward (left → right): a second copy enters as the first leaves */}
      <span
        aria-hidden="true"
        className="relative block overflow-hidden font-mono text-[10px] font-medium tracking-[0.2em] text-cream transition-colors duration-300 group-hover:text-base group-focus-visible:text-base sm:text-xs"
      >
        <span className="invisible block whitespace-nowrap">{menuButtonLabel}</span>
        <span className="view-me-roll absolute inset-0">
          <span className="absolute inset-0 whitespace-nowrap">{menuButtonLabel}</span>
          <span className="absolute inset-0 -translate-x-full whitespace-nowrap text-tertiary group-hover:text-base group-focus-visible:text-base">
            {menuButtonLabel}
          </span>
        </span>
      </span>

      <span
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10"
      >
        <span className="flex w-4 flex-col items-end gap-[4px]">
          <span className="h-[1.5px] w-4 rounded-full bg-cream transition-transform duration-300 ease-out group-hover:translate-x-[3px]" />
          <span className="h-[1.5px] w-2.5 rounded-full bg-cream transition-[width] duration-300 ease-out group-hover:w-4" />
          <span className="h-[1.5px] w-4 rounded-full bg-cream transition-transform delay-75 duration-300 ease-out group-hover:-translate-x-[3px]" />
        </span>
      </span>
    </button>
  );
}
