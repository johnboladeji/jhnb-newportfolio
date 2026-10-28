import { intro } from "../content";
import { chime, useSound } from "../lib/sound";

/** Sound on/off, with four little equaliser bars that dance while it's on. */
export default function SoundToggle({ className = "" }: { className?: string }) {
  const [on, setOn] = useSound();
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Sound on. Turn sound off" : "Sound off. Turn sound on"}
      onClick={() => {
        setOn(!on);
        if (!on) chime();
      }}
      data-magnetic="0.2"
      className={`pointer-events-auto inline-flex items-center gap-2 rounded-full border border-cream/20 bg-base/40 px-2.5 py-1 font-mono text-[10px] tracking-[0.15em] text-cream/80 backdrop-blur-sm transition-colors duration-300 hover:border-tertiary hover:text-tertiary ${className}`}
    >
      <span aria-hidden="true" className={`sound-bars ${on ? "is-on" : ""}`}>
        {[0, 1, 2, 3].map((i) => (
          <i key={i} style={{ animationDelay: `${i * -0.23}s` }} />
        ))}
      </span>
      {on ? intro.soundOn : intro.soundOff}
    </button>
  );
}
