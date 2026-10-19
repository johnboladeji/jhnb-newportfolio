import { projects } from "./content";
import type { DrawerView } from "./components/InfoDrawer";

/**
 * Shareable addresses for the drawer's panels, kept in the URL hash so a link opens the right panel, the back
 * button steps between panels, and refreshing keeps your place:
 *
 *   #/menu  #/work  #/work/<project>  #/about  #/writing/content-design  #/writing/articles  #/resume  #/contact
 *
 * No hash means the drawer is closed (the landing page).
 */

export interface Route {
  view: DrawerView;
  /** The project, when view is "caseStudy" */
  slug?: string;
}

const SIMPLE: Partial<Record<DrawerView, string>> = {
  menu: "menu",
  projects: "work",
  about: "about",
  contentDesign: "writing/content-design",
  articles: "writing/articles",
  resume: "resume",
  contact: "contact",
};

export function routeToHash({ view, slug }: Route): string {
  if (view === "caseStudy") return `#/work/${slug ?? projects[0].slug}`;
  return `#/${SIMPLE[view] ?? "menu"}`;
}

export function hashToRoute(hash: string): Route | null {
  const path = hash.replace(/^#\/?/, "").replace(/\/+$/, "").toLowerCase();
  if (!path) return null;
  const [first, second] = path.split("/");
  if (first === "work") {
    if (!second) return { view: "projects" };
    return projects.some((p) => p.slug === second) ? { view: "caseStudy", slug: second } : { view: "projects" };
  }
  if (first === "writing") return { view: second === "articles" ? "articles" : "contentDesign" };
  const match = (Object.entries(SIMPLE) as [DrawerView, string][]).find(([, h]) => h === first);
  return match ? { view: match[0] } : null;
}

const SITE_TITLE = "John B. Oladeji (JHNB) — Product Designer & Design Engineer";
const VIEW_TITLES: Record<DrawerView, string> = {
  menu: "Menu",
  projects: "Selected Works",
  caseStudy: "Case Study",
  about: "About Me",
  contentDesign: "Content Design",
  articles: "Articles",
  resume: "Resume",
  contact: "Let’s Work",
};

/** Browser-tab title for a route (or the landing page when null). */
export function routeTitle(route: Route | null): string {
  if (!route) return SITE_TITLE;
  const label = route.view === "caseStudy" ? (projects.find((p) => p.slug === route.slug)?.name ?? "Case Study") : VIEW_TITLES[route.view];
  return `${label} · John B. Oladeji (JHNB)`;
}
