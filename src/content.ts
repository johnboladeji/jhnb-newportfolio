/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONTENT — edit everything here. No component changes needed.
 *  Search for "TODO" to find what still needs your details.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const site = {
  /** Logo text in the header (used as a fallback if the wordmark image is missing) */
  logo: "JHNB",
  /** Icon logo in the header (public/jhnb-icon.png, a 144px copy of "JHNB IDENTITY ICON wt BG.png") */
  logoSrc: "/jhnb-icon.png",
  /** Full wordmark the icon morphs into on hover (public/jhnb-wordmark.png) */
  wordmarkSrc: "/jhnb-wordmark.png",
  fullName: "John B. Oladeji",
  role: "Product Designer & Design Engineer",
};

export interface PortraitRig {
  head: [number, number, number, number];
  neck: [number, number];
  eyes: [number, number][];
  eyeR: number;
  hand: { centre: [number, number]; radii: [number, number]; wrist: [number, number] } | null;
}
export interface HeroImageSpec {
  src: string;
  rig: PortraitRig | null;
}

export const hero = {
  /**
   * Cut-out close-up photos (transparent WebP). They slide right → left in turn.
   * Made from public/hero/1791941132446.jpg.jpeg and public/hero/file_000000007e90823092fccefdafc9cc6e.png.
   * Any that fail to load are skipped; the hero hides if none load.
   *
   * `rig` drives the cursor-follow warp (all values in the image's own pixels, y down). If you replace a photo,
   * re-measure these or set `rig: null` to show it without the effect.
   *   head:  centre x/y and radii of the head oval;  neck: pivot the head turns around
   *   eyes:  iris centres;  eyeR: eye-opening radius
   *   hand:  centre x/y, radii and wrist pivot of a raised hand (optional)
   */
  images: [
    {
      src: "/hero-1.webp",
      rig: { head: [400, 165, 125, 165], neck: [400, 345], eyes: [[345, 190], [449, 187]], eyeR: 20, hand: null },
    },
    {
      src: "/hero-2.webp",
      rig: {
        head: [567, 230, 160, 210],
        neck: [575, 470],
        eyes: [[502, 234], [640, 246]],
        eyeR: 22,
        hand: { centre: [290, 590], radii: [230, 210], wrist: [205, 745] },
      },
    },
  ] as HeroImageSpec[],
  /** Seconds each photo stays before the next slides in */
  imageIntervalSec: 6,
  imageAlt: "John B. Oladeji",
  /** Outlined top line */
  headline: "DESIGN WITH",
  /** Rotating bottom line, changes every 4 seconds */
  rotatingWords: ["RHETORIC", "CULTURE", "CODE"],
  bio: "I’m John-B — a Nigerian-born product designer, design engineer and rhetorician. I design, write and code products that speak the language of the people they serve, shaped by six years leading brands across Nigeria and the UK and by my research into culturally attentive UX writing. One conviction drives it all: technology should adapt to culture, never the other way round.",
  /** Sign-off, always typed on its own line after the bio */
  bioSignoff: "— Just Hold No Bounds.",
  /** Small accent line under the headline (desktop) */
  tagline: "PRODUCT DESIGNER · DESIGN ENGINEER · RHETORIC SCHOLAR",
  /** Mobile link under the clamped bio; opens About Me */
  viewMoreLabel: "VIEW MORE",
  /** Button under the tagline; opens the Projects view */
  ctaLabel: "VIEW PROJECTS",
};

/** Header menu button caption */
export const menuButtonLabel = "VIEW ME";

/** Items in the menu drawer. `view` opens that panel; "home" just closes the menu. */
export const menu = [
  { view: "home", label: "Home" },
  { view: "projects", label: "Projects" },
  { view: "about", label: "About Me" },
  {
    label: "Writing",
    children: [
      { view: "contentDesign", label: "Content Design" },
      { view: "articles", label: "Articles" },
    ],
  },
  { view: "resume", label: "Resume" },
  { view: "contact", label: "Let's Work" },
] as const;

export const marquee = "JHNB - JUST HOLD NO BOUNDS // JHNB - JUST HOLD NO BOUNDS // ";

/** `meta` is the small label on the right: your role, a year, or a status. */
export const projects = [
  { name: "Caira", type: "Eldercare coordination app for diaspora families", meta: "Founder", url: "https://cairacare.com" },
  { name: "Unelo", type: "AI translation and interpretation app", meta: "Founder", url: "#" }, // TODO: link
  { name: "NexusCore", type: "AI WhatsApp sales assistant for Nigerian small businesses", meta: "Founder", url: "#" }, // TODO: link
  { name: "CARF", type: "Culturally Attentive Rhetorical Framework for UX writing", meta: "M.A. thesis", url: "#" }, // TODO: link
  { name: "TokenForge", type: "Dev & Design bootcamp capstone", meta: "Capstone", url: "#" }, // TODO: link
];

/** Writing → Articles. TODO: replace with your real articles, or remove items. */
export const posts = [
  { title: "Decolonizing the interface: why UX writing needs rhetoric", date: "TODO", url: "#" },
  { title: "Designing fintech for Nigerian and American users", date: "TODO", url: "#" },
];

/** Writing → Content Design (UX writing / content design samples). TODO: add pieces; empty shows "coming soon". */
export const contentDesign: { title: string; meta: string; url: string }[] = [];

export const about = {
  paragraphs: [
    "I'm John B. Oladeji, a multidisciplinary product designer, design engineer, and founder. I spent six years leading brand and creative work across Nigeria and the UK, starting in brand identity and packaging.",
    "I now build full-stack products in React Native, Next.js, Node.js, and PostgreSQL, and I'm finishing an M.A. in Linguistics, Rhetoric, and Composition at New Mexico Highlands University, where I also teach first-year writing.",
    "My work focuses on products for underserved African and diaspora markets, and on interface language that respects the culture of the people reading it.",
  ],
  availability: "Live limitless — Just Hold No Bounds.",
};

export const resume = {
  /** CV at public/resume.pdf. Set to "" to hide the download button. */
  pdfUrl: "/resume.pdf",
  /** File name visitors get when they download the CV */
  pdfFileName: "John-B-Oladeji-CV.pdf",
  /** TODO: fill in the years marked YEAR. */
  roles: [
    { period: "2026 — now", role: "Instructor, First-Year Rhetoric & Composition", org: "New Mexico Highlands University" },
    { period: "YEAR — now", role: "Graduate Assistant, Writing Center & New Mexico Review", org: "New Mexico Highlands University" },
    { period: "YEAR — now", role: "Lead Instructor", org: "OYNA Youth Software Development Programme" },
    { period: "YEAR — YEAR", role: "Creative Lead", org: "GRAMEF Digital Agency" },
  ],
};

/** Header (top-left) and About links. `icon` picks the glyph. TODO: add your real profile URLs. */
export const socials = [
  { label: "GitHub", icon: "github", url: "https://github.com/" },
  { label: "LinkedIn", icon: "linkedin", url: "https://linkedin.com/in/" },
  { label: "X", icon: "x", url: "https://x.com/" },
  { label: "Instagram", icon: "instagram", url: "https://instagram.com/" },
  { label: "Google Scholar", icon: "scholar", url: "https://scholar.google.com/" },
] as const;

export const contact = {
  /** Enquiries go here when no form endpoint is set (opens the visitor's email app). */
  email: "johnboladeji@gmail.com",
  /** Optional form service endpoint, set in .env as VITE_FORM_ENDPOINT (see .env.example). */
  formEndpoint: import.meta.env.VITE_FORM_ENDPOINT as string | undefined,
  /** TODO: match these to your rate card service lines. */
  projectTypes: ["Brand identity", "Packaging", "Product / UX design", "Design systems", "Social content", "Something else"],
  budgets: ["Under $1k", "$1k – $5k", "$5k – $15k", "$15k+", "Not sure yet"],
  replyTime: "I reply to every enquiry within two working days.",
};
