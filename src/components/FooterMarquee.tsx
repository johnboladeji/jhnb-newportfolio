import { contact, marquee, site } from "../content";

const PHRASE = marquee.endsWith(" ") ? marquee : `${marquee} `;
const YEAR = new Date().getFullYear();

export default function FooterMarquee() {
  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-30 overflow-hidden pb-[env(safe-area-inset-bottom)]">
      <h2 className="sr-only">{`${site.fullName}, ${site.role}`}</h2>
      <div aria-hidden="true" className="flex w-max animate-marquee">
        {[0, 1].map((n) => (
          <span
            key={n}
            className="text-stroke-faint whitespace-nowrap pr-[0.3em] font-display text-[72px] leading-none sm:text-[120px] lg:text-[180px]"
          >
            {PHRASE}
          </span>
        ))}
      </div>

      {/* Copyright and contact line, laid over the bottom of the marquee */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-0.5 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] font-mono text-[10px] tracking-[0.12em] text-cream/70 [text-shadow:0_1px_8px_rgba(21,6,0,0.95)] sm:flex-row sm:justify-between sm:px-8 sm:text-[11px] lg:px-12">
        <p>
          © {YEAR} {site.fullName}
        </p>
        <a
          href={`mailto:${contact.email}`}
          data-magnetic="0.15"
          className="pointer-events-auto decoration-2 underline-offset-4 transition-colors duration-300 hover:text-tertiary hover:underline"
        >
          {contact.email}
        </a>
      </div>
    </footer>
  );
}
