/**
 * Letter-roll label: on hover of the nearest `.group`, each letter slides up and an identical copy rolls in
 * from below, staggered left → right.
 *
 * The visible letters are drawn by CSS (`::before` and `::after` read `data-ch`), so the only real text in the page
 * is the label itself: page text, crawlers, copy-paste and screen readers all get it once, from the hidden copy.
 */
export default function RollText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`fx-roll ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex">
        {Array.from(text).map((ch, i) => {
          const c = ch === " " ? " " : ch;
          return (
            <span key={i} className="fx-roll-char" style={{ "--i": i } as React.CSSProperties}>
              <span data-ch={c} />
            </span>
          );
        })}
      </span>
    </span>
  );
}
