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

/**
 * Full-length studio portraits (backgrounds kept, feathered into the panel) at the menu drawer's right edge;
 * they slide right → left in turn.
 * Made from public/hero/1791941257668.jpg.jpeg and public/hero/file_0000000039b4820c872ad8c174095ff1.png.
 */
export const drawerImages = ["/menu-1.webp", "/menu-2.webp"];

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

export interface Project {
  slug: string;
  name: string;
  /** One-line description shown in the list */
  type: string;
  role: string;
  year: string;
  /** Live link, or "" when there isn't one yet */
  url: string;
  /** Optional real cover (e.g. "/work/caira.webp"); without it a branded cover is generated */
  cover?: string;
  /** Cover glyph and accent for the generated cover */
  icon: "heart-handshake" | "cpu" | "truck" | "languages" | "book-open" | "graduation-cap";
  accent: "coral" | "amber" | "peach";
  tags: string[];
  /** Case study (only facts from the CV / site; fill the TODOs with real details) */
  summary: string;
  did: string[];
  outcome?: string;
}

/** Selected Works, in display order. Each opens a case study in the drawer. */
export const projects: Project[] = [
  {
    slug: "caira",
    name: "Caira",
    type: "Eldercare coordination for diaspora families",
    role: "Founder & Product Lead",
    year: "2024 — Today",
    url: "https://cairacare.com",
    icon: "heart-handshake",
    accent: "coral",
    tags: ["Product strategy", "Brand identity", "User research", "Mobile app", "Backend"],
    summary: "A platform for families coordinating the care of ageing loved ones across borders.",
    did: [
      "Led the venture end to end: brand identity, user research, product design, and full-stack development of the mobile app and backend.",
      "Designed the coordination model: shared tasks, check-ins and cross-border care-support workflows for globally dispersed families.",
    ],
    // TODO: add an outcome (users, pilots, launches) and a real cover at public/work/caira.webp
  },
  {
    slug: "nexuscore",
    name: "NexusCore",
    type: "AI-powered sales & payments for Nigerian SMBs",
    role: "Full-Stack Product Lead",
    year: "2025 — Today",
    url: "", // TODO: link
    icon: "cpu",
    accent: "amber",
    tags: ["AI", "Fintech", "WhatsApp", "Payments"],
    summary: "An AI-powered financial platform for the Nigerian small businesses the formal economy overlooks.",
    did: [
      "Built a WhatsApp-based AI sales assistant integrated with automated payment routing, for merchants operating outside the formal banking economy.",
    ],
  },
  {
    slug: "mova",
    name: "MOVA",
    type: "Last-mile logistics marketplace for Lagos",
    role: "Design Engineer",
    year: "In development",
    url: "",
    icon: "truck",
    accent: "peach",
    tags: ["Logistics", "Marketplace", "Design engineering"],
    summary: "A coordinated fulfilment platform for last-mile delivery in Lagos.",
    did: ["Designing the platform that connects vendors, delivery riders and customers in one coordinated flow."],
  },
  {
    slug: "carf",
    name: "CARF",
    type: "Culturally Attentive Rhetorical Framework",
    role: "M.A. thesis · Researcher",
    year: "2025 — 2026",
    url: "", // TODO: link to the thesis or a write-up
    icon: "book-open",
    accent: "amber",
    tags: ["Research", "UX writing", "Fintech", "CTDA", "Value Sensitive Design"],
    summary:
      "Decolonizing the Interface: a rhetorical framework for culturally attentive UX writing in Nigerian and American fintech platforms.",
    did: [
      "Combines Critical Technocultural Discourse Analysis with Value Sensitive Design to examine how fintech interfaces encode cultural assumptions across national contexts.",
      "Moves from that analysis toward more just, human-centred design that teams can apply to interface language and microcopy.",
    ],
  },
  {
    slug: "unelo",
    name: "Unelo",
    type: "AI translation and interpretation app",
    role: "Founder",
    year: "", // TODO: year
    url: "", // TODO: link
    icon: "languages",
    accent: "coral",
    tags: ["AI", "Language", "Mobile app"],
    summary: "An AI translation and interpretation app.",
    did: [], // TODO: what you did on Unelo
  },
  {
    slug: "tokenforge",
    name: "TokenForge",
    type: "Dev & Design Academy capstone",
    role: "Capstone project",
    year: "2025 — 2026",
    url: "", // TODO: link
    icon: "graduation-cap",
    accent: "peach",
    tags: ["UI/UX", "AI-assisted MVP", "Product thinking"],
    summary: "Capstone for the Dev & Design Academy programme in UI/UX design, AI-assisted MVP development and product thinking.",
    did: [], // TODO: what TokenForge is and what you built
  },
];

/** Writing → Articles. TODO: replace with your real articles, or remove items. */
export const posts = [
  { title: "Decolonizing the interface: why UX writing needs rhetoric", date: "TODO", url: "#" },
  { title: "Designing fintech for Nigerian and American users", date: "TODO", url: "#" },
];

/** Writing → Content Design (UX writing / content design samples). TODO: add pieces; empty shows "coming soon". */
export const contentDesign: { title: string; meta: string; url: string }[] = [];

export const about = {
  /** Sticky headline under the "About Me" title, typed continuously */
  headline: "Design is rhetoric you can touch. The interface makes an argument about who belongs.",
  /**
   * The story, broken into pages that slide sideways and stack over each other.
   * `kicker` is the small label, `title` the page heading, `body` its paragraphs.
   */
  pages: [
    {
      kicker: "The longer story",
      icon: "compass",
      title: "Three crafts, one seam",
      /** Opening statement, set larger than the body */
      lead: "I build software that takes culture seriously.",
      body: [
        "My work sits where design, engineering and language meet. It started in 2016 with brand and packaging design in Nigeria, grew into leading creative teams in the UK, and pulled me into code the day I wanted to ship the products I was designing.",
        "Today I'm finishing an M.A. at New Mexico Highlands University, studying how interfaces persuade, include, or quietly shut people out. Most people pick one lane. The problems I care about live where the lanes cross.",
      ],
    },
    {
      kicker: "What I bring",
      icon: "layers",
      title: "Blank page to shipped system",
      body: [
        "That range is the offer, not a footnote. I carry products from an empty page to a shipped system — strategy, brand, interface and code — without losing the thread in the handoffs.",
        "For Caira, a platform for families coordinating eldercare across borders, I designed the brand, ran the research, built the app and stood up the backend myself.",
      ],
    },
    {
      kicker: "What I'm building",
      icon: "hammer",
      title: "Products for the overlooked",
      body: [
        "NexusCore: an AI-powered sales and payments assistant for the Nigerian SMBs the formal economy overlooks. MOVA: a last-mile logistics marketplace for Lagos.",
        "And through the OYNA youth software programme, I wrote the curriculum and take students from their first commit to a deployed marketplace app — real products, not classroom demos.",
      ],
    },
    {
      kicker: "What I believe",
      icon: "scale",
      title: "Every interface takes a side",
      body: [
        "That conviction — technology should adapt to culture — is one I can defend in a seminar and prove in a repo. A fintech onboarding flow, a care app for loved ones an ocean away, a checkout built for a market its designers never imagined: each encodes assumptions about who its user is.",
        "The Culturally Attentive Rhetorical Framework (CARF) I developed in my M.A. research makes those assumptions deliberate instead of accidental: real people, real cultural contexts, not a flattened global default.",
      ],
    },
    {
      kicker: "How I work",
      icon: "zap",
      title: "Fast, without trading craft",
      body: [
        "AI tools like Claude and Antigravity are part of how I work, shrinking the distance between a decision and working software while I stay obsessed with the details — the interactions, the systems, the moment an interface finally feels right.",
        "From New Mexico, I build across American, Nigerian and diaspora markets — for the users most product teams struggle to reach, with technical seriousness and cultural fluency at once.",
      ],
    },
  ] as const,
  /** At-a-glance page (all from the CV) */
  highlightsTitle: "The short version",
  highlights: [
    { value: "10 yrs", label: "Designing brands and products, since 2016" },
    { value: "3", label: "Ventures founded or led — Caira, NexusCore, MOVA" },
    { value: "M.A.", label: "Linguistics, Rhetoric & Composition, NMHU (Dec 2026)" },
    { value: "2", label: "Conference papers — HACU 2025, SWPACA 2026" },
  ],
  /** Final page */
  closing: {
    title: "Let's build what's next",
    body: "Products that need clarity, research that needs a builder, and teams ready to ship something that means something.",
    cta: "LET'S WORK",
  },
  availability: "Live limitless — Just Hold No Bounds.",
};

/** About Me → Experience timeline (newest first). `icon` picks the glyph; `current` adds the live pulse. */
export const experience = [
  { period: "2024 — Today", role: "Founder & Product Designer", org: "Caira", icon: "heart-handshake", current: true },
  { period: "2025 — Today", role: "Full-Stack Product Lead", org: "NexusCore", icon: "cpu", current: true },
  { period: "2025 — Today", role: "Design Engineer", org: "MOVA", icon: "truck", current: true },
  { period: "2025 — Today", role: "Lead Instructor", org: "OYNA Youth Software Development Programme", icon: "graduation-cap", current: true },
  { period: "2022 — 2024", role: "Creative Lead", org: "GRAMEF Digital Agency", icon: "sparkles", current: false },
  { period: "2022 — 2023", role: "Group Brand & Packaging Designer", org: "SUMAL Foods", icon: "package", current: false },
  { period: "2020 — 2021", role: "Lead Brand Designer", org: "CHECKERS Africa", icon: "pen-tool", current: false },
  { period: "2018 — 2022", role: "Brand Strategist", org: "AFRIKRAFT Studios", icon: "megaphone", current: false },
  { period: "2016 — 2020", role: "Early design experience", org: "Print & graphic design roles", icon: "printer", current: false },
] as const;

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

/** Let's Work → skill capsules that rain down and pile up (drag to fling). Order sets the drop order. */
export const skills = [
  "Product Design",
  "Design Engineering",
  "UX Writing",
  "Design Systems",
  "User Research",
  "Culturally Attentive UX",
  "Brand Identity",
  "React Native",
  "Next.js",
  "TypeScript",
  "Prototyping",
  "Content Strategy",
  "Fintech",
  "AI-Assisted Building",
  "Packaging Design",
  "Value Sensitive Design",
];

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
