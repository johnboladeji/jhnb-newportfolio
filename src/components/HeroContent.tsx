import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import ScrambleText from "./ScrambleText";
import TypewriterBio from "./TypewriterBio";
import RollText from "./RollText";
import { hero } from "../content";

const WORDS = hero.rotatingWords;
const ROTATE_MS = 4000;

interface HeroContentProps {
  onViewProjects: () => void;
  onViewAbout: () => void;
}

export default function HeroContent({ onViewProjects, onViewAbout }: HeroContentProps) {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setWordIndex((i) => (i + 1) % WORDS.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

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
          <span className="text-stroke -ml-[0.03em] -mr-[0.08em] text-[21px] tracking-[0.08em] sm:text-[36px] md:text-[52px] lg:text-[47px] xl:text-[66px] 2xl:text-[78px]">
            {hero.headline}
          </span>
          <ScrambleText
            text={WORDS[wordIndex]}
            className="-ml-[0.03em] block text-[60px] text-primary sm:text-[104px] md:text-[144px] lg:text-[104px] xl:text-[160px] 2xl:text-[190px]"
          />
        </h1>

        {/* Wraps to two lines at lg so it stays clear of the centred photo; one line from xl */}
        <p className="mt-8 hidden max-w-[16rem] font-mono text-[11px] uppercase leading-relaxed tracking-[0.08em] text-tertiary lg:block xl:max-w-none">
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

      <div ref={bioRef} className="pointer-events-auto mt-4 sm:mt-6 lg:mt-0 lg:w-[19rem] lg:self-end xl:w-[22rem]">
        <TypewriterBio />
        {/* Below md the bio is clamped; this opens the full story in the About Me panel */}
        <div className="mt-3 flex justify-center md:hidden">
          <button
            type="button"
            onClick={onViewAbout}
            aria-haspopup="dialog"
            data-magnetic="0.25"
            className="fx-spotlight group inline-flex items-center gap-1.5 rounded-full border border-cream/25 px-3.5 py-1.5 font-mono text-[11px] font-medium tracking-[0.15em] text-cream transition-colors duration-200 hover:border-tertiary hover:bg-tertiary hover:text-base"
          >
            <RollText text={hero.viewMoreLabel} />
            <ArrowRight size={12} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </main>
  );
}
