/**
 * Letter-roll label: on hover of the nearest `.group`, each letter slides up and an identical copy rolls in
 * from below, staggered left → right. Screen readers get the plain text once.
 */
export default function RollText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`fx-roll ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex">
        {Array.from(text).map((ch, i) => (
          <span key={i} className="fx-roll-char" style={{ "--i": i } as React.CSSProperties}>
            <span>{ch === " " ? " " : ch}</span>
            <span>{ch === " " ? " " : ch}</span>
          </span>
        ))}
      </span>
    </span>
  );
}
