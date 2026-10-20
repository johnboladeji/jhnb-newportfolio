import { useCallback, useEffect, useState } from "react";
import ParticleBackground from "./components/ParticleBackground";
import Header from "./components/Header";
import HeroContent from "./components/HeroContent";
import HeroImage from "./components/HeroImage";
import SafeBoundary from "./components/SafeBoundary";
import FooterMarquee from "./components/FooterMarquee";
import InfoDrawer, { type DrawerView } from "./components/InfoDrawer";
import InteractionFX from "./components/InteractionFX";
import { projects } from "./content";
import { hashToRoute, routeTitle, routeToHash, type Route } from "./routes";

export default function App() {
  // The drawer's state lives in the URL hash too (see routes.ts), so every panel has a shareable address
  const [route, setRoute] = useState<Route | null>(() => hashToRoute(window.location.hash));
  const [lastSlug, setLastSlug] = useState(() => route?.slug ?? projects[0].slug);

  // Move to a route and record it in the address bar (a new history entry, so Back steps between panels)
  const go = useCallback((next: Route | null) => {
    setRoute(next);
    if (next?.slug) setLastSlug(next.slug);
    const url = next ? routeToHash(next) : window.location.pathname + window.location.search;
    const current = window.location.hash ? window.location.hash : window.location.pathname + window.location.search;
    if (url !== current) window.history.pushState(null, "", url);
  }, []);

  // Back / forward and hand-edited addresses
  useEffect(() => {
    const sync = () => {
      const next = hashToRoute(window.location.hash);
      setRoute(next);
      if (next?.slug) setLastSlug(next.slug);
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  useEffect(() => {
    document.title = routeTitle(route);
  }, [route]);

  const openDrawer = useCallback((view: DrawerView) => go({ view }), [go]);
  const navigate = useCallback((view: DrawerView) => go(view === "caseStudy" ? { view, slug: lastSlug } : { view }), [go, lastSlug]);
  const openCase = useCallback((slug: string) => go({ view: "caseStudy", slug }), [go]);
  const closeDrawer = useCallback(() => go(null), [go]);

  // Exactly one viewport tall: 100vh, refined to 100dvh where supported so mobile browser bars never push content off-screen
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-base text-cream supports-[height:100dvh]:h-dvh">
      <SafeBoundary><ParticleBackground /></SafeBoundary>   {/* z-0  */}
      <SafeBoundary><HeroImage /></SafeBoundary>            {/* z-10 */}
      <Header onMenu={() => openDrawer("menu")} menuOpen={!!route} />          {/* z-30 */}
      <HeroContent onViewProjects={() => openDrawer("projects")} onViewAbout={() => openDrawer("about")} /> {/* z-20 */}
      <FooterMarquee />                   {/* z-30 */}
      <InfoDrawer                         /* z-50 */
        open={!!route}
        view={route?.view ?? "menu"}
        caseSlug={route?.slug ?? lastSlug}
        onNavigate={navigate}
        onOpenCase={openCase}
        onClose={closeDrawer}
      />
      <InteractionFX />                   {/* z-70: cursor follower, magnetic, bursts */}
    </div>
  );
}
