import type { RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Cpu,
  GraduationCap,
  HeartHandshake,
  Megaphone,
  Package,
  PenTool,
  Printer,
  Sparkles,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { experience } from "../content";

const ICONS: Record<(typeof experience)[number]["icon"], LucideIcon> = {
  "heart-handshake": HeartHandshake,
  cpu: Cpu,
  truck: Truck,
  "graduation-cap": GraduationCap,
  sparkles: Sparkles,
  package: Package,
  "pen-tool": PenTool,
  megaphone: Megaphone,
  printer: Printer,
};

/**
 * Experience as a vertical timeline: amber dates, peach roles, dimmed organisations, an icon per role and a live
 * pulse on current roles. The spine draws itself in, and each row rises into view as its own scroll container
 * (`scrollRoot`) brings it on screen.
 */
export default function ExperienceList({ scrollRoot }: { scrollRoot: RefObject<HTMLElement | null> }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative">
      {/* Timeline spine */}
      <motion.span
        aria-hidden="true"
        className="absolute bottom-2 left-[1.15rem] top-2 w-px origin-top bg-gradient-to-b from-amber/70 via-cream/15 to-transparent"
        initial={reduceMotion ? false : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
      />
      <ol className="space-y-1">
        {experience.map((item, i) => {
          const Icon = ICONS[item.icon];
          return (
            <motion.li
              key={`${item.role}-${item.org}`}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ root: scrollRoot, once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: Math.min(i, 4) * 0.06, ease: "easeOut" }}
              className="group relative grid grid-cols-[2.3rem_1fr] gap-x-4 rounded-xl py-4 pr-2 transition-colors hover:bg-cream/[0.04]"
            >
              {/* Icon node on the spine */}
              <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-amber/40 bg-secondary text-amber transition-colors group-hover:border-amber group-hover:bg-amber group-hover:text-base">
                <Icon size={16} aria-hidden="true" />
                {item.current && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-soft opacity-70" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-soft" />
                  </span>
                )}
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[11px] tracking-[0.18em] text-amber">
                  {item.period.toUpperCase()}
                  {item.current && <span className="sr-only"> (current)</span>}
                </p>
                <p className="mt-1.5 font-sans text-lg font-bold leading-snug text-tertiary sm:text-xl">{item.role}</p>
                <p className="mt-0.5 text-sm text-cream/65">{item.org}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
