import { useEffect, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const FRAME_MS = 40;
const SCRAMBLE_FRAMES = 18;

interface ScrambleTextProps {
  text: string;
  className?: string;
}

/** Cycles random uppercase characters, revealing the target word left to right. */
export default function ScrambleText({ text, className }: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(text);
      return;
    }
    let frame = 0;
    const id = window.setInterval(() => {
      frame++;
      const revealed = Math.floor((frame / SCRAMBLE_FRAMES) * text.length);
      const next = text
        .split("")
        .map((ch, i) => (i < revealed ? ch : CHARS[Math.floor(Math.random() * CHARS.length)]))
        .join("");
      setDisplay(next);
      if (frame >= SCRAMBLE_FRAMES) {
        setDisplay(text);
        window.clearInterval(id);
      }
    }, FRAME_MS);
    return () => window.clearInterval(id);
  }, [text]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
