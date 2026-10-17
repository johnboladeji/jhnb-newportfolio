import { useCallback, useState } from "react";
import ParticleBackground from "./components/ParticleBackground";
import Header from "./components/Header";
import HeroContent from "./components/HeroContent";
import HeroImage from "./components/HeroImage";
import FooterMarquee from "./components/FooterMarquee";
import InfoDrawer, { type DrawerView } from "./components/InfoDrawer";
import InteractionFX from "./components/InteractionFX";

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<DrawerView>("menu");

  const openDrawer = useCallback((view: DrawerView) => {
    setDrawerView(view);
    setDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Exactly one viewport tall: 100vh, refined to 100dvh where supported so mobile browser bars never push content off-screen
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-base text-cream supports-[height:100dvh]:h-dvh">
      <ParticleBackground />              {/* z-0  */}
      <HeroImage />                       {/* z-10 */}
      <Header onMenu={() => openDrawer("menu")} />          {/* z-30 */}
      <HeroContent onViewProjects={() => openDrawer("projects")} onViewAbout={() => openDrawer("about")} /> {/* z-20 */}
      <FooterMarquee />                   {/* z-30 */}
      <InfoDrawer                         /* z-50 */
        open={drawerOpen}
        view={drawerView}
        onNavigate={setDrawerView}
        onClose={closeDrawer}
      />
      <InteractionFX />                   {/* z-70: cursor follower, magnetic, bursts */}
    </div>
  );
}
