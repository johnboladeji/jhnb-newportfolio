import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { drawerImages } from "../content";

/**
 * Studio portraits (backgrounds kept) in a fill container on the drawer's right side: each photo covers the whole
 * frame (`object-cover`, framed on the face) and the frames take turns sliding right → left inside it.
 * They're toned into the panel with `mix-blend-luminosity` (the panel's brown supplies the colour, the photo its
 * light and shade), slightly brightened with softened contrast so the studio blacks sit near the panel's brown,
 * and the frame's left edge fades out over half its width so it melts into the panel behind the menu text.
 * `dim` drops them back behind long-form content (About, Resume…) so text stays readable.
 *
 * Blend note: the wrapper must NOT create a stacking context (no z-index, no opacity), or the image would blend
 * with an empty isolated group instead of the panel. So opacity lives on the image itself.
 */
export default function DrawerPortraits({ dim }: { dim: boolean }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const reduceMotion = useReducedMotion();
  const [small, setSmall] = useState(() => window.matchMedia("(max-width: 639px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const on = () => setSmall(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  // Strong on the menu (a little lighter on phones, where the menu text runs over the photo); softer but still
  // clearly visible behind long-form views
  const level = dim ? (small ? 0.22 : 0.32) : small ? 0.55 : 0.95;
  const images = drawerImages.filter((src) => !failed.includes(src));

  useEffect(() => {
    if (images.length < 2) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % images.length), 6000);
    return () => window.clearTimeout(id);
  }, [index, images.length]);

  if (images.length === 0) return null;
  const src = images[index % images.length];

  return (
    <div
      aria-hidden="true"
      // Frame runs the panel's full height, from behind the (right-transparent) top bar to the bottom edge, and is
      // never wider than 0.78 × its height: the photos are ~0.8 wide-to-tall, so object-cover only ever trims the
      // sides and the whole figure, head to feet, always shows.
      className="pointer-events-none absolute inset-y-0 right-0 w-[min(68%,calc(100dvh*0.78))] overflow-hidden sm:w-[min(58%,calc(100dvh*0.78))]"
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={src}
          src={src}
          alt=""
          draggable={false}
          onError={() => setFailed((f) => [...f, src])}
          initial={reduceMotion ? { opacity: 0 } : { x: "40%", opacity: 0 }}
          animate={{ x: 0, opacity: level }}
          exit={reduceMotion ? { opacity: 0 } : { x: "-40%", opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1], opacity: { duration: 0.5 } }}
          className="absolute inset-0 h-full w-full select-none object-cover object-center brightness-115 contrast-[0.85] grayscale mix-blend-luminosity [mask-image:linear-gradient(to_left,#000_50%,transparent)] [-webkit-mask-image:linear-gradient(to_left,#000_50%,transparent)]"
        />
      </AnimatePresence>
    </div>
  );
}
