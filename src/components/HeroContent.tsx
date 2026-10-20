import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import ScrambleText from "./ScrambleText";
import TypewriterBio from "./TypewriterBio";
import RollText from "./RollText";
import { hero } from "../content";

const WORDS = hero.rotatingWords;
const ROTATE_MS = 4000;
// One stable sentence for screen readers, search engines and link previews, e.g. "Design with rhetoric, culture, and code"
const lower = (w: string) => w.toLowerCase();
const HEADLINE_TEXT = `${hero.headline.charAt(0)}${lower(hero.headline.slice(1))} ${WORDS.slice(0, -1).map(lower).join(", ")}, and ${lower(WORDS[WORDS.length - 1])}`;
// With reduced motion the word holds still on this one
const STILL_WORD = Math.max(0, WORDS.findIndex((w) => lower(w) === "culture"));

interface HeroContentProps {
  onViewProjects: () => void;
  onViewAbout: () => void;
}

export default function HeroContent({ onViewProjects, onViewAbout }: HeroContentProps) {
  const reduceMotion = useReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  // Mobile "View more" stays hidden until the bio's sign-off has finished typing
  const [bioTyped, setBioTyped] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      setWordIndex(STILL_WORD);
      return;
    }
    const id = window.setInterval(() => setWordIndex((i) => (i + 1) % WORDS.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  // Below lg the photo starts where the text ends. Publish the bio's bottom edge as a CSS variable
  // (--hero-text-bottom) that HeroImage sizes against, and keep it current as the layout changes.
  const mainRef = useRef<HTMLElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const main = mainRef.current;
    const bio = bioRef.current;
    if (!main || !bio) return;
    const root = document.documentElement;
    const update = () => {
      const stage = main.offsetParent as HTMLElement | null;
      const top = stage ? stage.getBoundingClientRect().top : 0;
      root.style.setProperty("--hero-text-bottom", `${Math.ceil(bio.getBoundingClientRect().bottom - top)}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(main);
    ro.observe(bio);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      root.style.removeProperty("--hero-text-bottom");
    };
  }, []);

  return (
    // Below lg: headline and bio stacked and centred above the photo.
    // From lg: headline, tagline and button at left-centre; bio at bottom-right; photo between.
    // lg:pb clears the 180px footer marquee so the bio never sits on its outlines.
    <main
      ref={mainRef}
      className="pointer-events-none relative z-20 flex flex-1 flex-col items-center px-5 pt-[5vh] sm:pt-[7vh] lg:flex-row lg:items-stretch lg:justify-between lg:px-12 lg:pb-[12.5rem] lg:pt-0">
      <div className="flex flex-col items-center lg:items-start lg:self-center lg:pb-[4vh]">
        {/* Optical alignment: -ml-[0.03em] cancels Anton's left side-bearing so both lines' ink starts on the same edge
            as the tagline and button; -mr-[0.08em] cancels the outline line's trailing letter-spacing so it centres truly. */}
        <h1 className="pointer-events-auto flex flex-col items-center text-center font-display uppercase leading-[0.9] lg:items-start lg:text-left">
          <span className="sr-only">{HEADLINE_TEXT}</span>
          {/* The visual headline (outline line + scrambling word) is decoration over the sentence above */}
          <span aria-hidden="true" className="contents">
          <span className="text-stroke -ml-[0.03em] -mr-[0.08em] text-[21px] tracking-[0.08em] sm:text-[36px] md:text-[52px] lg:text-[47px] xl:text-[66px] 2xl:text-[78px]">
            {hero.headline}
          </span>
          <ScrambleText
            text={WORDS[wordIndex]}
            className="-ml-[0.03em] block text-[60px] text-primary sm:text-[104px] md:text-[144px] lg:text-[104px] xl:text-[160px] 2xl:text-[190px]"
          />
          </span>
        </h1>

        {/* Always one line. Its size scales with the viewport (10.5px at 1024 → 15px from ~1430) so it never
            reaches the photo's face; a dark halo keeps it legible where it crosses the raised hand in photo 2. */}
        <p className="mt-8 hidden whitespace-nowrap font-mono text-[clamp(10.5px,1.05vw,15px)] font-medium uppercase leading-relaxed tracking-[0.04em] text-tertiary [text-shadow:0_1px_10px_rgba(21,6,0,0.95)] lg:block">
          {hero.tagline}
        </p>

        <button
          type="button"
          onClick={onViewProjects}
          data-magnetic="0.25"
          className="fx-spotlight group pointer-events-auto mt-5 hidden items-center gap-2 rounded-full bg-cream px-5 py-2.5 font-mono text-xs font-medium tracking-[0.15em] text-base transition-colors duration-300 hover:bg-primary hover:text-cream lg:inline-flex"
        >
          <RollText text={hero.ctaLabel} />
          <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      <div ref={bioRef} data-hero-bio className="pointer-events-auto mt-4 sm:mt-6 lg:mt-0 lg:w-[19rem] lg:self-end xl:w-[22rem]">
        <TypewriterBio onTyped={() => setBioTyped(true)} />
        {/* Below md the bio is clamped; this opens the full story in the About Me panel. It keeps its space
            (visibility, not display) so the photo below doesn't jump, and fades up once the sign-off is typed. */}
        <div className="mt-3 flex justify-center md:hidden">
          <motion.button
            initial={false}
            animate={bioTyped ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ visibility: bioTyped ? "visible" : "hidden" }}
            type="button"
            onClick={onViewAbout}
            aria-haspopup="dialog"
            data-magnetic="0.25"
            className="fx-spotlight group inline-flex items-center gap-1.5 rounded-full border border-cream/25 px-3.5 py-1.5 font-mono text-[11px] font-medium tracking-[0.15em] text-cream transition-colors duration-200 hover:border-tertiary hover:bg-tertiary hover:text-base"
          >
            <RollText text={hero.viewMoreLabel} />
            <ArrowRight size={12} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </motion.button>
        </div>
      </div>
    </main>
  );
}
