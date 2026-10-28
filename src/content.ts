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
  /** The live address, used for share previews and the canonical link. Update when a custom domain is set up. */
  url: "https://jhnb-newportfolio.vercel.app",
  /** Share-preview text (search results, LinkedIn, email) */
  description:
    "John B. Oladeji (JHNB): product designer, design engineer, and rhetoric scholar building culturally attentive products, from Caira and NexusCore to CARF, a research framework for UX writing.",
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
  bio: "I’m John-B — a Nigerian-born product designer, design engineer, and rhetorician. I design, write, and code products that speak the language of the people they serve, shaped by more than six years leading brands across Nigeria and the UK and by my research into culturally attentive UX writing. One conviction drives it all: technology should adapt to culture, never the other way around.",
  /** Phrases in the bio that reveal in the accent colour (must match the bio text exactly) */
  bioHighlights: [
    "product designer, design engineer, and rhetorician",
    "speak the language of the people they serve",
    "technology should adapt to culture",
  ],
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
 * The welcome (Intro.tsx), once per visit. In about two seconds it says who John is, in the site's own colours:
 * the J. mark, a Yoruba welcome, the name, "designs with rhetoric, culture, and code" (the hero's three words), and the
 * three roles. Then the visitor enters with sound or quietly (it enters by itself, quietly, after a few seconds).
 * The sound is synthesized in src/lib/sound.ts.
 */
export const intro = {
  greeting: "Ẹ káàbọ̀",
  greetingLang: "yo",
  greetingMeaning: "Welcome",
  /** Between the name and the hero's three words: "John B. Oladeji designs with rhetoric · culture · code" */
  lead: "designs with",
  enterWithSound: "ENTER WITH SOUND",
  enterQuietly: "Enter quietly",
  /** Followed by the seconds left, e.g. "Entering in 4" */
  autoEnter: "Entering in",
  /** Small hint on the landing page, gone after the first tap */
  playHint: "Tap anywhere to play the talking drum",
  soundOn: "SOUND ON",
  soundOff: "SOUND OFF",
  /** For screen readers: what the welcome dialog is */
  title: "Welcome to the portfolio of John B. Oladeji (JHNB)",
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
  { view: "contact", label: "Let’s Work" },
] as const;

export const marquee = "JHNB — JUST HOLD NO BOUNDS // JHNB — JUST HOLD NO BOUNDS // ";

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

/** Projects page: headline typed under the "Selected Works" title (same effect as About Me) */
export const worksHeadline = "Architecting ideas. Building experiences. Delivering impact.";

/** Selected Works, in display order. Each opens a case study in the drawer. */
export const projects: Project[] = [
  {
    slug: "caira",
    name: "Caira",
    type: "Eldercare coordination for families abroad",
    role: "Founder, sole designer & engineer",
    year: "2024–Present",
    url: "https://cairacare.com",
    icon: "heart-handshake",
    accent: "coral",
    tags: ["Brand", "Research plan", "PRD", "UX & UI", "Microcopy", "Full-stack build"],
    summary: "A private care circle that helps families abroad look after an aging parent back home.",
    did: [
      "Designed and built it end to end, alone: brand, product strategy, requirements, UX, UI, microcopy, the Android app, the backend, and the website.",
      "Designed the coordination model: role-based access, Elder Mode, coordinator voting, and consent before anything else.",
    ],
    // The full, rich case study lives in `cairaStudy` below (rendered by CairaStudy.tsx)
  },
  {
    slug: "nexuscore",
    name: "NexusCore",
    type: "AI sales assistant for the Nigerian WhatsApp inbox",
    role: "Founder, designer & full-stack build lead",
    year: "2025–Present",
    url: "https://nexuscorenew.vercel.app",
    icon: "cpu",
    accent: "amber",
    tags: ["Product design", "UX writing", "Systems engineering", "AI", "Payments"],
    summary: "A WhatsApp-native AI assistant that answers customers, closes sales, and sends payment links in the seller’s own voice.",
    did: [
      "Designed and built it end to end: product, UX writing, the bot engine, seller WhatsApp commands, billing, and payouts.",
    ],
    // The full, rich case study lives in `nexusStudy` below (rendered by NexusStudy.tsx)
  },
  {
    slug: "tokenforge",
    name: "TokenForge",
    type: "AI design-system token generator",
    role: "Co-creator, team of ten", // TODO: name your part in the team (e.g. research, UX, front-end)
    year: "2026",
    url: "https://token-forge-three.vercel.app",
    icon: "graduation-cap",
    accent: "peach",
    tags: ["Product design", "Design systems", "AI", "UX research", "SaaS"],
    summary: "An AI platform that turns a one-line brand description into production-ready design tokens in seconds.",
    did: ["Built in four weeks by a team of ten as the Dev & Design Academy capstone, from research to a shipped web app."],
    // The full, rich case study lives in `tokenStudy` below (rendered by TokenStudy.tsx)
  },
  {
    slug: "carf",
    name: "CARF",
    type: "Culturally Attentive Rhetorical Framework",
    role: "Researcher, M.A. thesis",
    year: "2025–2026",
    url: "",
    icon: "book-open",
    accent: "amber",
    tags: ["Research", "UX writing", "Fintech", "CTDA", "Value Sensitive Design"],
    summary: "A method for reading, and rewriting, the language inside financial apps.",
    did: [],
    // The full research case study lives in `carfStudy` below (rendered by CarfStudy.tsx)
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
    summary: "A coordinated fulfillment platform for last-mile delivery in Lagos.",
    did: ["Designing the platform that connects vendors, delivery riders, and customers in one coordinated flow."],
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
];

/**
 * Writing → Articles (rendered by Articles.tsx). Each article links to its full text on Medium; the page shows
 * a short summary and an interactive explainer of its ideas (summaries are paraphrased, not copied).
 */
export const articles = {
  headline: "Field notes from where design meets code.",
  intro: "Long-form notes on design systems, building with AI, and the craft in between. Each one is published on Medium; here you get the gist, and the ideas to play with.",
  profile: { label: "medium.com/@johnboladeji", url: "https://medium.com/@johnboladeji" },
  items: [
    {
      id: "auto-layout",
      short: "Auto Layout",
      kicker: "Article 01",
      topic: "Figma · Responsive design",
      title: "Auto Layout Mental Models: Mastering Responsive Design in Figma",
      date: "Dec 17, 2025",
      read: "7 min read",
      url: "https://medium.com/@johnboladeji/auto-layout-mental-models-mastering-responsive-design-in-figma-5d963121d6a6",
      summary:
        "Auto Layout isn’t unpredictable; we just bring the wrong mental model to it. Four simple models make its behavior predictable, and turn pixel-pushing into systems thinking.",
      tags: ["Figma", "Auto Layout", "Design systems", "Responsive design"],
      // Interactive explainer: the four models (each has a live demo in Articles.tsx)
      models: [
        { id: "belt", name: "The Conveyor Belt", idea: "Direction and flow", text: "A frame flows one way at a time: a row or a column. Pick the direction first; spacing, padding, and alignment all follow from it." },
        { id: "container", name: "The Smart Container", idea: "Parent vs. child", text: "The parent sets the rules (padding, alignment, spacing) and every child obeys at once. If you’re nudging gaps by hand, set them on the parent." },
        { id: "dictator", name: "The Content Dictator", idea: "Resizing behavior", text: "Fixed is a brick wall, Hug is a glove, Fill is a rubber band. Ask who’s the boss of the size: you, the content, or the container." },
        { id: "nesting", name: "Nested Alternation", idea: "Building 2D layouts", text: "Every time the direction changes, nest a new frame with the opposite flow, like stacking LEGO bricks. Outline mode (Ctrl/Cmd + Y) shows the structure." },
      ],
      rule: "Fixed when stability matters. Hug when the content should set the size. Fill when the container should.",
      pitfalls: [
        { title: "Inconsistent spacing", fix: "Define spacing once on the parent and trust it; nest a frame when one item needs different spacing." },
        { title: "Fill that won’t fill", fix: "A child can’t fill a parent that hugs. Give the parent a size, or let it fill its own container." },
        { title: "Lost in nested frames", fix: "Name your layers, use Outline mode, and debug from the innermost child outward." },
      ],
      takeaway: "Stop pushing pixels; define rules and relationships, and let the layout adapt itself.",
    },
    {
      id: "prd-prompt",
      short: "Vibe coding",
      kicker: "Article 02",
      topic: "AI · Product strategy",
      title: "The Vibe Coder’s Secret Weapon: Why Your PRD is Now Your Most Powerful Prompt",
      date: "Feb 3, 2026",
      read: "3 min read",
      url: "https://medium.com/@johnboladeji/the-vibe-coders-secret-weapon-why-your-prd-is-now-your-most-powerful-prompt-8f7169a529c9",
      summary:
        "Vibe coding makes the how almost instant, which makes the what and the why matter more. The PRD isn’t obsolete; it’s become the prompt that keeps human and machine pointed the same way.",
      tags: ["Vibe coding", "AI", "PRD", "Product strategy"],
      split: { ai: "The how", human: "The what, and the why" },
      reasons: [
        { title: "It prevents hallucination at scale", text: "Without constraints and user stories, AI can build perfectly working code for the wrong product." },
        { title: "It answers what AI can’t", text: "Which problem is worth solving, for whom, and how you’ll know it worked: that’s still human work." },
        { title: "It’s the foundation for good prompts", text: "Clear acceptance criteria and user flows are exactly the detail precise prompts need." },
        { title: "It keeps the team aligned", text: "When cycles shrink from weeks to hours, one source of truth keeps product, design, and leadership in step." },
      ],
      modern: ["Concise", "Outcome-oriented", "Strategic"],
      takeaway: "Don’t let the vibe become a drift.",
    },
  ] as const,
};

/* ---- Writing → Content Design (rendered by ContentDesign.tsx) ------------------------------------------- */
/* Inline markup in any text: **bold**, *italic*, {variable}. Images live in public/writing/. */

export type WritingBlock =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  /** Toggle between whole versions (e.g. first draft ⇄ final), each a list of labelled lines */
  | { kind: "versions"; versions: { label: string; rows: { label: string; text: string; count?: string }[] }[] }
  /** Row-by-row before → after, shown as a redline (or either side alone) */
  | { kind: "redline"; beforeLabel: string; afterLabel: string; rows: { label: string; before: string; after: string }[] }
  /** The same message for different markets, switchable */
  | { kind: "markets"; markets: { code: string; name: string; rows: { label: string; text: string }[] }[] }
  /** A chat transcript per version, replayed as messages arrive */
  | { kind: "chat"; versions: { label: string; messages: { from: "bot" | "buyer"; text: string }[] }[] }
  /** A quoted piece of copy, with phrases to mark up */
  | { kind: "specimen"; label: string; text: string; marks?: string[] }
  | { kind: "terms"; rows: { use: string; instead: string[]; why: string }[] }
  /** Numbered decisions or trade-offs */
  | { kind: "decisions"; head: [string, string]; rows: { title: string; text: string }[] }
  /** Before/after screenshots with a draggable divider (images must share a size) */
  | { kind: "compare"; before: { src: string; alt: string; label: string }; after: { src: string; alt: string; label: string }; caption: string }
  | { kind: "shots"; items: { src: string; alt: string; label: string; final?: boolean }[]; caption: string }
  /** Strings with their character counts, side by side */
  | { kind: "chars"; items: { lang: string; text: string }[]; note: string }
  /** Survey results as rows of dots */
  | { kind: "dots"; total: number; items: { n: number; label: string }[]; note: string }
  /** Policy text before/after with readability scores */
  | {
      kind: "readability";
      before: { title: string; text: string };
      after: { title: string; text: string }[];
      measures: { label: string; before: number; after: number; max: number; better: "lower" | "higher" | "none" }[];
    }
  /** "What I learned": a pull quote that lights up as you read */
  | { kind: "quote"; text: string };

export interface WritingSample {
  id: string;
  /** Tab label */
  short: string;
  kicker: string;
  topic: string;
  status: "Concept" | "Spec" | "Product" | "Shipped";
  title: string;
  /** One line for the index card */
  summary: string;
  /** Project, date, and context */
  snapshot: string;
  blocks: WritingBlock[];
}

export const writing = {
  /** The struck-out first draft above the typed headline */
  draft: "I write UX copy.",
  headline: "I write interface words for people the product wasn’t first built for.",
  intro: [
    "I’m a Nigerian. I spent more than six years as a brand and creative lead for companies in Nigeria and the UK, and I now live in New Mexico, in the United States. Working across those places made me notice how often a product assumes one kind of reader. “Try again” is good advice on a failed transfer in Chicago. In Lagos it can cost someone their money twice.",
    "I’m finishing an M.A. in English at New Mexico Highlands University in December 2026. My thesis is about UX writing in Nigerian and American fintech, and how the words on a screen carry cultural meaning. I also teach first-year writing and work in the university’s Writing Center, so most of my week goes to helping people say what they mean to a particular reader. And I build in Figma, React Native, and Next.js, so I know what happens to a string after it leaves the doc.",
    "Below are three case studies and two shorter pieces. Two come from products I’m building, Caira and NexusCore, and the Caira copy is now live in the app. The rest are concept projects I set for myself. I’ve kept my first draft in each one, because the changes are the interesting part.",
  ],
  glance: [
    { n: 3, label: "Case studies" },
    { n: 2, label: "Quick samples" },
    { n: 1, label: "Shipped in a live app" },
  ],
  pdf: "/John-B-Oladeji-Content-Design-Writing-Samples.pdf",
  howIWork: {
    title: "How I work",
    habits: [
      { title: "Start with the reader’s first question.", text: "Like “Where’s my money?” or “Why wasn’t my ad approved?”" },
      { title: "Use their words, not the system’s.", text: "That’s how “care recipient” became “Mummy” and “lifetime budget” became “total budget.”" },
      { title: "Don’t let copy promise what the product can’t back up.", text: "A variable sits where a real number should go until someone confirms it." },
      { title: "Keep the first drafts.", text: "Showing what I changed is more useful than pretending I got it right the first time." },
    ],
    feedback:
      "Feedback is a normal part of my week. Between the Writing Center and teaching first-year composition, I give and take critique on writing all the time, and I’m used to revising fast.",
  },
  samples: [
    {
      id: "ads",
      short: "Ads",
      kicker: "Case study 01",
      topic: "Ads and monetization",
      status: "Concept",
      title: "A first ad, without the ad jargon",
      summary: "Labels, buttons, helper text, and system messages for an ad flow, plus a terminology list",
      snapshot: "Concept project, September 2026. Loop is a short-video app I made up for this brief.",
      blocks: [
        { kind: "p", text: "On Loop, small-business owners can turn one of their videos into an ad. In my scenario, a lot of them quit at the budget step, and most ads that get turned down never come back. I rewrote the budget step and the three system messages around it, then wrote a terminology list to keep the words consistent." },
        { kind: "p", text: "The person I had in mind runs a bakery in Houston and sets up the ad between orders. She knows her customers well. She doesn’t know what “bid strategy” means, and she’s uneasy about spending money on something she doesn’t understand." },
        {
          kind: "versions",
          versions: [
            {
              label: "First draft",
              rows: [
                { label: "Label", text: "Budget type: Daily budget / Lifetime budget" },
                { label: "Helper text", text: "Select a budget optimization strategy for your campaign’s delivery." },
                { label: "Field", text: "Bid strategy: Lowest cost / Cost cap" },
                { label: "Button", text: "Submit" },
                { label: "After submitting", text: "Ad submitted. Status: Pending review." },
                { label: "Ad turned down", text: "Ad rejected. Violation of Advertising Policy 4.2." },
                { label: "Budget spent", text: "Campaign budget depleted. Delivery halted." },
              ],
            },
            {
              label: "Final",
              rows: [
                { label: "Label", text: "How do you want to spend?", count: "25" },
                { label: "Option", text: "**Daily budget.** Spend up to this amount each day.", count: "12 + 33" },
                { label: "Option", text: "**Total budget.** Spend this amount over the whole run of your ad.", count: "12 + 48" },
                { label: "Amount helper", text: "You can change or pause this anytime.", count: "37" },
                { label: "Bid strategy", text: "Moved under “Advanced settings (optional)”" },
                { label: "Button", text: "Submit for review", count: "17" },
                { label: "After submitting", text: "Your ad is in review. We’ll let you know when it’s approved.", count: "60" },
                { label: "Ad turned down", text: "**Your ad wasn’t approved.** The video uses a song that isn’t cleared for ads. Pick a sound from the ads music library and resubmit. The rest of your ad is saved. Buttons: Edit ad, See ad policies", count: "Title 23" },
                { label: "Budget spent", text: "**Today’s budget is used up.** Your ad will start showing again tomorrow. Buttons: Raise budget, OK", count: "25 + 42" },
              ],
            },
          ],
        },
        { kind: "h", text: "What bothered me" },
        { kind: "p", text: "“Lifetime budget” was the first thing to go. The lifetime of what? The ad, the account, the business? “Optimization strategy” and “bid strategy” are terms for people who run ads for a living, and she isn’t one of them." },
        { kind: "p", text: "“Submit” doesn’t tell her the ad goes to review before anyone sees it. “Rejected” with a policy number gives her a code instead of a reason, and nothing to do next. And “depleted” and “halted” sound like something broke, when spending the budget is the whole point." },
        { kind: "h", text: "Second pass" },
        { kind: "p", text: "I went back through every string with the terminology list open beside it and caught two words I’d stopped seeing: “pending” and “rejected.” I also checked the button in Spanish, since short interface text tends to grow in translation." },
        { kind: "chars", items: [{ lang: "English", text: "Submit for review" }, { lang: "Spanish", text: "Enviar a revisión" }], note: "Both 17 characters, so it fits as is." },
        {
          kind: "compare",
          before: { src: "/writing/ad-budget-draft.webp", alt: "Budget step, first draft: Budget type with Daily and Lifetime budget, a bid strategy menu, and a Submit button", label: "First draft" },
          after: { src: "/writing/ad-budget-final.webp", alt: "Budget step, final: How do you want to spend, with Daily and Total budget options that explain themselves, and Submit for review", label: "Final" },
          caption: "The budget step, first draft and final. Same layout, different words. Drag to compare.",
        },
        {
          kind: "shots",
          items: [
            { src: "/writing/ad-in-review.webp", alt: "Ads list with an In review status and the message: Your ad is in review. We will let you know when it is approved.", label: "In review" },
            { src: "/writing/ad-not-approved.webp", alt: "Ad details with a Not approved status and a message explaining the song is not cleared for ads, with Edit ad and See ad policies", label: "Not approved" },
            { src: "/writing/ad-budget-used.webp", alt: "Bottom sheet: Today’s budget is used up. Your ad will start showing again tomorrow. Raise budget or OK", label: "Budget used up" },
          ],
          caption: "The three system messages in the final version. Concept screens I designed for this sample.",
        },
        { kind: "p", text: "For screen readers, each option’s helper text is tied to its label, so “Daily budget: Spend up to this amount each day” is read as one item. When an ad isn’t approved, focus moves to the message title so it gets announced, and no status depends on color alone." },
        { kind: "h", text: "The terminology list" },
        {
          kind: "terms",
          rows: [
            { use: "ad", instead: ["creative", "promotion"], why: "One word for one thing, everywhere" },
            { use: "in review", instead: ["pending"], why: "Says what’s happening and who’s doing it" },
            { use: "not approved", instead: ["rejected", "violation"], why: "Describes the ad, not the person" },
            { use: "total budget", instead: ["lifetime budget"], why: "Plain, and it pairs with “daily budget”" },
            { use: "used up", instead: ["depleted", "exhausted"], why: "Neutral. The budget did its job" },
            { use: "paused", instead: ["stopped", "halted"], why: "Only when the advertiser chose to pause" },
          ],
        },
        { kind: "h", text: "What I’d need to agree with the team" },
        {
          kind: "decisions",
          head: ["Decision", "What it costs"],
          rows: [
            { title: "Hide bid strategy under “Advanced settings”", text: "Experts need one more tap, but beginners stop seeing a term they can’t use. PM and engineering would have to sign off." },
            { title: "Say exactly why an ad wasn’t approved", text: "Policy and engineering have to pass the real reason into the message instead of a code." },
            { title: "Don’t promise a review time", text: "I’d add a {review_time} variable only once the team commits to a real number." },
          ],
        },
        { kind: "h", text: "What I’d test" },
        { kind: "p", text: "I’d show ten small-business owners either the first draft or the final, five each, and ask them to explain “daily budget” and “total budget” in their own words. For the not-approved message I’d run a cloze test, blanking every sixth word and asking people to fill the gaps. An average of 60% or better usually means readers understand the text. I’d also just ask each person what they’d do next." },
        { kind: "quote", text: "The words I trusted least were the ones I’d written on autopilot. I only noticed “pending” because the terminology list made me look at it again." },
      ],
    },
    {
      id: "transfer",
      short: "Errors",
      kicker: "Case study 02",
      topic: "Error messages",
      status: "Spec",
      title: "When a transfer fails",
      summary: "One error message written two ways, for Nigeria and the US",
      snapshot: "Spec scenario based on my thesis research, September 2026.",
      blocks: [
        { kind: "p", text: "A money app works in Nigeria and the US. A bank transfer fails, and the team has shipped one error message for both markets. I wrote two, because the person reading it in Lagos is worried about something different from the person reading it in Chicago." },
        { kind: "p", text: "In Nigeria, many people have watched money leave their account on a failed transfer and then waited for a “reversal.” So their first question is whether the money is gone. For the US version I assumed the money hadn’t moved, which makes the question simpler: can I try again?" },
        {
          kind: "specimen",
          label: "The message that shipped",
          text: "**Transaction failed.** Error code 91: Issuer or switch inoperative. Please try again later.",
          marks: ["Error code 91: Issuer or switch inoperative.", "Please try again later."],
        },
        { kind: "h", text: "What’s wrong with it" },
        { kind: "p", text: "It never says where the money is, and that’s the first thing both readers want to know. “Issuer or switch inoperative” is a log message, not a sentence. “Try again” is risky too: if the first attempt was debited, a second one can take the money twice. And nobody is named, so the reader can’t tell whether the bank, the app, or they themselves made the mistake." },
        { kind: "h", text: "Two versions" },
        {
          kind: "markets",
          markets: [
            {
              code: "NG",
              name: "Nigeria",
              rows: [
                { label: "Headline", text: "Your transfer to Chidi Okafor didn’t go through" },
                { label: "First line", text: "If ₦25,000 left your account, it will come back automatically within {reversal_time}. You don’t need to do anything." },
                { label: "Guidance", text: "Please wait before sending again, so the money isn’t taken twice." },
                { label: "Buttons", text: "Check status, Talk to us" },
              ],
            },
            {
              code: "US",
              name: "United States",
              rows: [
                { label: "Headline", text: "Your transfer to Jordan Lee didn’t go through" },
                { label: "First line", text: "Your money hasn’t moved. $250.00 is still in your checking account." },
                { label: "Guidance", text: "You can try again now." },
                { label: "Buttons", text: "Try again, Get help" },
              ],
            },
          ],
        },
        { kind: "h", text: "Why they’re different" },
        { kind: "p", text: "The Nigerian version opens with the reversal, because that’s the fear, and it asks people to wait before sending again. The US version can be shorter. The money never moved, so it goes straight to the fix. Both name the recipient, since people are sending money to someone they know." },
        { kind: "p", text: "{reversal_time} is a variable on purpose. I don’t know the real window, and a number in an error message is a promise. Product and compliance would fill it in before this ships." },
        { kind: "h", text: "What I’d test" },
        { kind: "p", text: "Whether Nigerian users believe “You don’t need to do anything,” or call support anyway. Support tickets after this error are the number I’d watch." },
        { kind: "quote", text: "The same error can need opposite advice. “Try again” helps in one market and can cost someone money in the other." },
      ],
    },
    {
      id: "abeg",
      short: "Chat",
      kicker: "Case study 03",
      topic: "Conversation design",
      status: "Product",
      title: "A sales chat that understands “abeg”",
      summary: "Conversation design for a WhatsApp sales assistant",
      snapshot: "A product I’m building. Copy written for this portfolio, September 2026.",
      blocks: [
        { kind: "p", text: "NexusCore is an AI assistant I’m building that answers WhatsApp sales chats for small businesses in Nigeria. For this sample I used a made-up fabric shop in Aba called Adaeze Fabrics, with made-up prices." },
        { kind: "p", text: "The buyer is on their phone, has just seen a post, and wants a price. They might write in Nigerian English, Pidgin, or both in one message. They think they’re talking to a person, and they expect to haggle." },
        {
          kind: "chat",
          versions: [
            {
              label: "First draft",
              messages: [
                { from: "bot", text: "Hello! I am NexusCore AI Assistant. How may I assist you today? Please select an option: 1. Browse products 2. Check order status 3. Speak to agent" },
                { from: "buyer", text: "abeg how much for the blue ankara wey you post yesterday" },
                { from: "bot", text: "I’m sorry, I didn’t understand that. Please select an option from 1 to 3." },
              ],
            },
            {
              label: "Final",
              messages: [
                { from: "bot", text: "Hi, welcome to Adaeze Fabrics. I’m the shop’s assistant, and I’m an AI. Ask me about prices, sizes, or delivery. Adaeze can join the chat anytime." },
                { from: "buyer", text: "abeg how much for the blue ankara wey you post yesterday" },
                { from: "bot", text: "The blue Ankara (6 yards) is ₦18,500. We have 4 left. Should we deliver it, or will you pick it up in Aba?" },
                { from: "buyer", text: "deliver to Enugu" },
                { from: "bot", text: "Delivery to Enugu is ₦3,000, so your total is ₦21,500. Here’s your payment link: [link]. Once you pay, Adaeze will confirm your order right here." },
                { from: "buyer", text: "fit reduce am?" },
                { from: "bot", text: "I can’t change prices, but I’ll ask Adaeze for you now. She’ll reply in this chat." },
              ],
            },
          ],
        },
        { kind: "h", text: "What was wrong" },
        { kind: "p", text: "The buyer thinks they’re messaging Adaeze Fabrics, and the bot opens by introducing my software. Then it offers a numbered menu, which isn’t how anyone uses WhatsApp. When the buyer asked in Pidgin, the bot didn’t understand and told them to pick a number, so the failure landed on the buyer. And “speak to agent” is call-center language for a shop run by one woman." },
        { kind: "h", text: "The decisions behind it" },
        {
          kind: "decisions",
          head: ["Decision", "Why"],
          rows: [
            { title: "Say “I’m an AI” in the first message", text: "Buyers expect a person. Being upfront now protects the shop’s trust later." },
            { title: "Understand Pidgin, reply in plain Nigerian English", text: "A bot that copies Pidgin can come across as mocking. I’d test this rather than assume it." },
            { title: "Hand haggling to the owner", text: "Haggling is part of the sale. A flat “no” from a bot ends it." },
            { title: "One question per message", text: "Short turns suit a phone and a buyer who’s half paying attention." },
            { title: "Give the full total before the payment link", text: "Nobody likes a surprise at the payment step." },
          ],
        },
        { kind: "h", text: "What I’d test" },
        { kind: "p", text: "How many chats reach the payment link, and whether buyers who see “I’m an AI” leave sooner. With shop owners’ agreement, I’d also try a version that replies in Pidgin." },
        { kind: "quote", text: "Some problems aren’t about wording. Haggling needed a handoff to the owner, and no amount of polishing would have made the bot’s “no” work." },
      ],
    },
    {
      id: "onboarding",
      short: "Onboarding",
      kicker: "Quick sample A",
      topic: "Onboarding copy",
      status: "Shipped",
      title: "Onboarding that speaks like family",
      summary: "Real onboarding copy, shipped in the live app and shaped by a user survey",
      snapshot: "A product I’m building. Both the before and the after come from the live app. The new copy shipped in October 2026, informed by a small survey I ran in July 2026.",
      blocks: [
        { kind: "p", text: "Caira helps families coordinate care for someone they love. Its splash screens already had the voice I wanted (“Close to home, from anywhere”), so I left them alone. The trouble was in the first two setup screens: guidance hidden inside the fields, a label people could misread, and a lot of questions before the app had earned any trust." },
        { kind: "p", text: "In July I sent a short discovery survey to people helping care for a parent. Six people answered, and one early tester sent separate feedback. That’s a small group, so I read it as direction rather than proof." },
        {
          kind: "dots",
          total: 6,
          items: [
            { n: 5, label: "share care with siblings or other relatives, which is why the circle and its name matter so much" },
            { n: 4, label: "keep up mainly by phone or video call; one said they could only guess how their parent was doing from the sound of their voice" },
            { n: 6, label: "live in Nigeria, just in a different town or state from their parent" },
          ],
          note: "Six survey respondents, July 2026",
        },
        { kind: "p", text: "When I asked what would make them trust an app with this, the answers were words like integrity and legitimate. So the setup form had to feel careful, not nosy." },
        { kind: "p", text: "The survey also checked an assumption of mine. I’d been thinking of Caira as a product for families abroad, but all six respondents live in Nigeria. The splash line “across cities or oceans” already covers both groups, so it stayed." },
        {
          kind: "redline",
          beforeLabel: "Before",
          afterLabel: "After (shipped)",
          rows: [
            { label: "Choose a path", before: "No — Create a circle. Start a new care circle for your loved one. / Yes — I have an invite code. Join a circle you’ve been invited to. Emoji icons and a separate Continue button.", after: "Start a new circle. For someone you’re caring for. / Join with an invite code. If someone in your family invited you. Real icons, and tapping a card moves you on." },
            { label: "Form heading", before: "About the circle. Who is this care circle for?", after: "Who is this circle for?" },
            { label: "Their name", before: "A hint inside the field only: e.g. Mama Adeyemi", after: "Below the field: *Use what the family calls them, like Mama, Baba, or Aunty Funke.*" },
            { label: "Their email", before: "A hint inside the field only: If they’ll use the app", after: "Under “Add more details (optional),” with the hint below the field: *Only if they’ll use Caira themselves.*" },
            { label: "Family name", before: "Family name (e.g. Adeyemi Family)", after: "Name your circle. *This is how your circle will appear in the app.*" },
            { label: "Privacy", before: "Nothing", after: "*Only people you invite can see this circle.*" },
            { label: "Language", before: "English, next to a grayed-out “More coming soon” chip", after: "Removed until a second language ships" },
            { label: "Create circle", before: "Grayed out, with no reason given", after: "Grayed out, with *Add their name and your relationship to continue* underneath" },
          ],
        },
        {
          kind: "compare",
          before: { src: "/writing/caira-path-before.webp", alt: "Old Caira screen with No, create a circle and Yes, I have an invite code, using emoji", label: "Before" },
          after: { src: "/writing/caira-path-after.webp", alt: "Shipped Caira screen with Start a new circle and Join with an invite code, using icons", label: "After, shipped" },
          caption: "Choosing a path in the live Caira app. Drag to compare.",
        },
        {
          kind: "shots",
          items: [
            { src: "/writing/caira-form-before.webp", alt: "Old About the circle form with every hint inside its field and a language row", label: "Before" },
            { src: "/writing/caira-form-after.webp", alt: "Shipped Who is this circle for form with hints below the fields and a privacy note", label: "After, shipped", final: true },
          ],
          caption: "The create-circle form in the live Caira app.",
        },
        { kind: "p", text: "The biggest change is where the help lives. A hint inside a field disappears the moment you start typing, and screen readers don’t reliably announce it, so every hint moved below its field. “Family name” reads like a surname, so it became “Name your circle.” Email, phone, and location went behind an optional expander, which takes the form from six text fields down to three before anything is saved. And the “No —” and “Yes —” choices now lead with the action, so nobody has to translate yes or no into what happens next." },
        { kind: "p", text: "One line changed on the way to release. I’d drafted “Everyone you invite will see this” under the circle name, but I couldn’t confirm the app works exactly that way, so the shipped helper only says what’s certain. The privacy line went in the same way: only after checking that invited members really are the only people who can see a circle." },
        { kind: "p", text: "The splash screens are next. I want “Close to home, from anywhere” to open the carousel instead of closing it, and the Skip button needs a scrim behind it so it stays legible over the photos." },
      ],
    },
    {
      id: "policy",
      short: "Policy",
      kicker: "Quick sample B",
      topic: "Plain language",
      status: "Concept",
      title: "A policy page students will read",
      summary: "Plain language, with a measured readability change",
      snapshot: "Concept project, September 2026. Modeled on common writing-center policies, not my university’s actual one.",
      blocks: [
        { kind: "p", text: "A lot of booking policies open with the penalty. For a first-generation student who’s already nervous about their writing, that’s the first thing they read. I rewrote it to start with what happens in a session." },
        {
          kind: "readability",
          before: {
            title: "Appointment Policy.",
            text: "Students are required to schedule appointments a minimum of 24 hours in advance via the online scheduling system. Failure to appear for a scheduled appointment without prior cancellation will result in a no-show being recorded. Students accumulating three (3) no-shows within a single academic semester will have their scheduling privileges suspended for the remainder of said semester. Tutors are not responsible for proofreading or editing student work.",
          },
          after: [
            { title: "Book a session", text: "Sessions are free and last 45 minutes. Book at least a day ahead. Bring your assignment prompt and whatever you have, even just notes." },
            { title: "What we will do together", text: "We will work on your ideas, your structure, and the patterns in your writing. We won’t edit your paper for you. We will show you how to find and fix errors yourself." },
            { title: "If you can’t make it", text: "Cancel in the app, even at the last minute. It frees the slot for another student. If you miss 3 sessions in a semester without canceling, you can still come to drop-in hours for the rest of that semester." },
          ],
          measures: [
            { label: "Words", before: 69, after: 108, max: 120, better: "none" },
            { label: "Flesch-Kincaid grade", before: 13.9, after: 3.5, max: 16, better: "lower" },
            { label: "Flesch reading ease (higher is easier)", before: 26, after: 86, max: 100, better: "higher" },
          ],
        },
        { kind: "p", text: "I scored both versions with the textstat Python library, counting headings as sentences, so anyone can rerun the numbers. The new version is longer because it answers what the old one skipped: what to bring and what happens in the session. The line I’m happiest with is the last one. “Scheduling privileges suspended” became “you can still come to drop-in hours.” Same rule, but the student keeps a way back in." },
      ],
    },
  ] as WritingSample[],
};

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
        "My work sits where design, engineering, and language meet. It started in 2016 with brand and packaging design in Nigeria, grew into leading creative teams in the UK, and pulled me into code the day I wanted to ship the products I was designing.",
        "Today I’m finishing an M.A. at New Mexico Highlands University, studying how interfaces persuade, include, or quietly shut people out. Most people pick one lane. The problems I care about live where the lanes cross.",
      ],
    },
    {
      kicker: "What I bring",
      icon: "layers",
      title: "Blank page to shipped system",
      body: [
        "That range is the offer, not a footnote. I carry products from an empty page to a shipped system — strategy, brand, interface, and code — without losing the thread in the handoffs.",
        "For Caira, a platform for families coordinating eldercare across borders, I designed the brand, ran the research, built the app, and stood up the backend myself.",
      ],
    },
    {
      kicker: "What I’m building",
      icon: "hammer",
      title: "Products for the overlooked",
      body: [
        "NexusCore: an AI-powered sales and payments assistant for the Nigerian SMBs the formal economy overlooks. MOVA: a last-mile logistics marketplace for Lagos.",
        "And as volunteer lead facilitator for the OYNA youth software program’s first cohort, I wrote the curriculum and took students from their first commit to a deployed marketplace app — a real product, not a classroom demo.",
      ],
    },
    {
      kicker: "What I believe",
      icon: "scale",
      title: "Every interface takes a side",
      body: [
        "That conviction — technology should adapt to culture — is one I can defend in a seminar and prove in a repo. A fintech onboarding flow, a care app for loved ones an ocean away, a checkout built for a market its designers never imagined: each encodes assumptions about who its user is.",
        "The Culturally Attentive Rhetorical Framework (CARF), which I’m developing in my M.A. research, makes those assumptions deliberate instead of accidental: real people, real cultural contexts, not a flattened global default.",
      ],
    },
    {
      kicker: "How I work",
      icon: "zap",
      title: "Fast, without trading craft",
      body: [
        "AI tools like Claude and Antigravity are part of how I work, shrinking the distance between a decision and working software while I stay obsessed with the details — the interactions, the systems, the moment an interface finally feels right.",
        "From New Mexico, I build across American, Nigerian, and diaspora markets — for the users most product teams struggle to reach, with technical seriousness and cultural fluency at once.",
      ],
    },
  ] as const,
  /** At-a-glance page (all from the CV) */
  highlightsTitle: "The short version",
  highlights: [
    { value: "10 yrs", label: "Designing brands and products, since 2016" },
    { value: "3", label: "Ventures founded or led — Caira, NexusCore, MOVA" },
    { value: "M.A.", label: "English, NMHU (expected Dec 2026)" },
    { value: "2", label: "Conference papers — HACU 2025, SWPACA 2026" },
  ],
  /** Final page */
  closing: {
    title: "Let’s build what’s next",
    body: "Products that need clarity, research that needs a builder, and teams ready to ship something that means something.",
    cta: "LET’S WORK",
  },
  availability: "Live limitless — Just Hold No Bounds.",
};

/** About Me → Experience timeline (newest first). `icon` picks the glyph; `current` adds the live pulse. */
export const experience = [
  { period: "2024–Present", role: "Founder & Product Designer", org: "Caira", icon: "heart-handshake", current: true },
  { period: "2025–Present", role: "Full-Stack Product Lead", org: "NexusCore", icon: "cpu", current: true },
  { period: "2025–Present", role: "Design Engineer", org: "MOVA", icon: "truck", current: true },
  // TODO [confirm years]: volunteer role for the first cohort
  { period: "2025–2026", role: "Lead Facilitator & Trainer (volunteer), first cohort", org: "OYNA Youth Software Development Programme", icon: "graduation-cap", current: false },
  { period: "2023–2025", role: "Creative Lead", org: "GRAMEF Digital Agency", icon: "sparkles", current: false },
  { period: "2022–2023", role: "Group Brand & Packaging Designer", org: "SUMAL Foods", icon: "package", current: false },
  { period: "2020–2021", role: "Lead Brand Designer", org: "CHECKERS Africa", icon: "pen-tool", current: false },
  { period: "2018–2022", role: "Brand Strategist", org: "AFRIKRAFT Studios", icon: "megaphone", current: false },
  { period: "2016–2020", role: "Early design experience", org: "Print & graphic design roles", icon: "printer", current: false },
] as const;

/**
 * About Me → Experience: "Research & Teaching" sits above the industry timeline, so faculty readers see the
 * scholar before the designer. From the CV and the owner's notes; items marked TODO are still to confirm.
 */
export const researchTeaching = {
  title: "Research & Teaching",
  statement:
    "I study how interfaces persuade, include, or quietly shut people out, and I teach students to write for the screens they’ll spend their lives on.",
  teaching: [
    { period: "Aug 2026–Present", role: "Instructor, First-Year Rhetoric and Composition", org: "Department of English, New Mexico Highlands University", text: "I teach first-year rhetoric, writing, and composition, from drafting through revision." },
    { period: "Jan 2025–Present", role: "Writing Center Tutor", org: "New Mexico Highlands University", text: "One-on-one and workshop support for student writers across disciplines." },
    // TODO [confirm years]
    { period: "2025–2026", role: "Lead Facilitator & Trainer (volunteer), first cohort", org: "OYNA Youth Software Development Programme", text: "Designed the full curriculum (handbooks, prompt sheets, and slide decks) around a real product requirements document (PRD) that students build from." },
  ],
  research: [
    { period: "2025–Present", role: "M.A. thesis: CARF", org: "New Mexico Highlands University", text: "A framework for culturally attentive UX writing in Nigerian and American fintech.", slug: "carf" },
    { period: "Jan 2026–Present", role: "Digital Publishing and Editorial Development", org: "New Mexico Review, the university’s literary journal", text: "Designed and built the journal’s website from start to finish, including its digital editorial workflow.", slug: "" },
  ],
  presentations: [
    { year: "2026", title: "Trapped in the Algorithm: How Echo Chambers and Cognitive Biases Fuel Misinformation", venue: "Southwest Popular/American Culture Association, 47th Annual Conference" },
    { year: "2025", title: "Navigating Authenticity: Digital Code-Switching as Identity Construction on TikTok in Nigeria and the United States", venue: "Hispanic Association of Colleges and Universities, 39th Annual Conference" },
  ],
  manuscripts: [
    "The Rhetoric of Fintech: How Digital Platforms Shape Public Perception of Financial Services and Trust in Accounting Systems",
    "Navigating Authenticity: Digital Code-Switching and Multilingual Identity on TikTok in Nigeria and the United States",
    "Language, Ideology, and Satirical Resistance in Wole Soyinka’s The Lion and the Jewel: A Stylistic Reading of the Opening Sidi–Lakunle Dialogue",
    "Balancing Human Creativity and Artificial Intelligence Productivity: An Empirical Analysis of the Evolving Digital Economy",
  ],
  recognition: [{ year: "2026", what: "OYNA Intellectual Excellence Award" }],
  education: [
    // TODO [confirm]: exact degree title from the transcript
    { year: "Expected Dec 2026", what: "M.A. in English", where: "New Mexico Highlands University" },
    { year: "2015", what: "B.A. (Education) in English", where: "Ekiti State University, Nigeria" },
  ],
};

export const resume = {
  /** CV at public/resume.pdf. Set to "" to hide the download button. */
  pdfUrl: "/resume.pdf",
  /** File name visitors get when they download the CV */
  pdfFileName: "John-B-Oladeji-CV.pdf",
  pages: 2,
  /** Rendered by ResumeSection.tsx. Work history stays in the PDF; the page shows the shape of it. */
  headline: "Proven expertise. Relentless execution. Transformative results.",
  intro:
    "Ten years across language, design, and code: brand studios in Nigeria and the UK, products I’ve founded and built, and research into how interfaces carry culture. The full CV has the details.",
  stats: [
    { n: 10, suffix: "+", label: "Years designing" },
    { n: 3, suffix: "", label: "Countries worked across" },
    { n: 4, suffix: "", label: "Ventures & programs led" },
    { n: 2, suffix: "", label: "Conference papers" },
    { n: 4, suffix: "", label: "Manuscripts in preparation" },
  ],
  // The arc of the work, by discipline (no employer list)
  arc: [
    { year: "2015", label: "Language", text: "B.A. in English" },
    { year: "2016", label: "Visual design", text: "Print, layout, typography" },
    { year: "2018", label: "Brand strategy", text: "Audience and rhetorical research" },
    { year: "2023", label: "Creative leadership", text: "Leading designers, writers, and developers, UK" },
    { year: "2024", label: "Founder", text: "Caira, end to end" },
    { year: "2025", label: "Design engineering", text: "Full-stack products, AI, teaching code" },
    { year: "2026", label: "Rhetoric research", text: "Culturally attentive UX writing" },
  ],
  expertise: [
    {
      area: "Design & development",
      items: ["Figma", "UX/UI design", "Design systems", "Prototyping", "Photoshop & Illustrator", "React", "Next.js", "TypeScript", "React Native (Expo)", "Node.js / Fastify", "PostgreSQL", "Full-stack product development"],
    },
    {
      area: "Research methods",
      items: ["Critical Technocultural Discourse Analysis", "Value Sensitive Design", "Digital ethnography", "User research & usability", "Participatory & co-design", "Qualitative & content analysis", "Multimodal discourse analysis", "Rhetorical & stylistic critique"],
    },
    { area: "Writing", items: ["UX writing & microcopy", "Content strategy", "Technical writing", "Academic writing", "Editorial development"] },
    { area: "Teaching", items: ["Writing instruction", "Curriculum development", "Workshop facilitation", "One-on-one tutoring", "Technical writing"] },
  ],
  research: {
    thesis: "Decolonizing the Interface: A Rhetorical Framework for Culturally Attentive UX Writing in Nigerian and American Fintech Platforms",
    framework: "CARF, the Culturally Attentive Rhetorical Framework, combines Critical Technocultural Discourse Analysis and Value Sensitive Design to show how fintech interfaces encode cultural assumptions, and to move from that analysis toward more just, human-centered design.",
    interests: ["Rhetoric of digital interfaces", "Value-sensitive AI systems", "Decolonial interaction design", "Participatory design", "African & North American digital rhetorics", "Fintech, trust & user agency"],
    manuscripts: [
      "The Rhetoric of Fintech: How Digital Platforms Shape Public Perception of Financial Services and Trust in Accounting Systems",
      "Navigating Authenticity: Digital Code-Switching and Multilingual Identity on TikTok in Nigeria and the United States",
      "Language, Ideology, and Satirical Resistance in Wole Soyinka’s The Lion and the Jewel",
      "Balancing Human Creativity and Artificial Intelligence Productivity: An Empirical Analysis of the Evolving Digital Economy",
    ],
    talks: [
      { year: "2026", title: "Trapped in the Algorithm: How Echo Chambers and Cognitive Biases Fuel Misinformation", venue: "SWPACA 47th Annual Conference" },
      { year: "2025", title: "Navigating Authenticity: Digital Code-Switching as Identity Construction on TikTok in Nigeria and the United States", venue: "HACU 39th Annual Conference" },
    ],
  },
  education: [
    // TODO [confirm]: use the exact degree title from the transcript (the CV and thesis spell the concentration differently)
    { year: "2026", what: "M.A. in English", where: "New Mexico Highlands University", note: "Expected December 2026" },
    { year: "2025–26", what: "Professional Certificate: UI/UX Design, AI-Assisted MVP Development & Product Thinking", where: "Dev & Design Academy" },
    { year: "2021–22", what: "Professional Certificate: Digital Interface and Design", where: "SQI College of ICT, Nigeria" },
    { year: "2018", what: "Professional Certificate: Brand Communication and Advertising", where: "O2 Academy, Lagos" },
    { year: "2011–15", what: "B.A. (Education) in English", where: "Ekiti State University, Nigeria" },
  ],
  ventures: [
    { name: "Caira", slug: "caira", line: "Eldercare coordination for families abroad" },
    { name: "NexusCore", slug: "nexuscore", line: "AI sales assistant for the WhatsApp inbox" },
    { name: "MOVA", slug: "mova", line: "Last-mile logistics for Lagos" },
    { name: "OYNA", slug: "", line: "Volunteer lead facilitator, first cohort: I wrote the curriculum" },
  ],
  recognition: [{ year: "2026", what: "OYNA Intellectual Excellence Award" }],
};

/**
 * Header (top-left), About, and the crawler page. `icon` picks the glyph. Only real profiles go here: add Google Scholar
 * once there is a profile (its icon still exists in SocialIcon.tsx).
 */
export const socials: { label: string; icon: "github" | "linkedin" | "x" | "instagram" | "scholar"; url: string }[] = [
  { label: "LinkedIn", icon: "linkedin", url: "https://www.linkedin.com/in/johnboladeji-787b8b140/" },
  { label: "GitHub", icon: "github", url: "https://github.com/johnboladeji" },
  { label: "X", icon: "x", url: "https://x.com/thejohnboladeji" },
  { label: "Instagram", icon: "instagram", url: "https://www.instagram.com/johnboladeji/" },
];

/**
 * Caira: the full case study (rendered by CairaStudy.tsx instead of the plain case-study layout).
 * Screens and logos live in public/work/caira/. Caira's own palette is used inside the study.
 */
export const cairaStudy = {
  slug: "caira",
  tagline: "Care. Together.",
  headline: "Far from home. Close to Mum.",
  intro:
    "Caira helps families abroad coordinate care for an aging parent back home. I designed and built it end to end, alone: brand, product strategy, requirements, UX, UI, microcopy, the mobile app, the backend, and the website.",
  status: "Pre-launch · Android app live (testing)",
  logo: "/work/caira/logo-light.webp",
  // Optional framing: set `origin` to null to keep the story private
  origin: {
    kicker: "Why Caira exists",
    text: "A friend lost her mother. The care had fallen between time zones and group chats, and when the emergency came, it reached the family too late. Distance shouldn’t mean a loved one goes uncared for. Coordination — knowing, together, in time — can be designed.",
  } as { kicker: string; text: string } | null,
  facts: [
    { label: "Role", value: "Founder, sole product designer and full-stack engineer" },
    { label: "Type", value: "Mobile app (Android) and website, B2C" },
    { label: "Industry", value: "Eldercare, health tech" },
    { label: "Timeline", value: "2024–present" },
    { label: "Scope", value: "Brand, research plan, PRD, UX, UI, microcopy, full-stack build, deployment" },
    { label: "Live", value: "cairacare.com", url: "https://cairacare.com" },
  ],
  challenge: {
    title: "The family group chat was never built for this.",
    body: "Care for a parent back home runs on scattered WhatsApp threads and late-night calls. One sibling ends up carrying everything, and there’s no calm, shared place to see how Mum is really doing.",
    insight: "The real problem isn’t tracking. It’s trust, consent, and coordination among people who love the same person but live in different worlds.",
    // The group chat that plays out, then the Caira update that answers it
    chat: [
      { who: "Tunde, Houston", text: "Did anyone call Mummy today?", me: false },
      { who: "Kemi, Lagos", text: "I thought you did. I’ve been at work since 6.", me: false },
      { who: "You, London", text: "Has she taken her BP medicine?", me: true },
      { who: "Tunde, Houston", text: "Not sure. I’ll try her tonight.", me: false },
    ],
    update: {
      time: "9:04 AM in Lagos",
      title: "Mummy checked in:",
      quote: "“I’m okay today.”",
      rows: ["BP medicine taken at 8:30 AM", "Next: clinic visit, Thursday at 10:00 AM"],
    },
  },
  audience: {
    title: "Who it’s for",
    body: "Nigerians in the US, the UK, and Canada first. Positioned for any family abroad: Western markets primary, Africa secondary.",
    from: ["US", "UK", "Canada"],
    to: "Nigeria",
    roles: [
      { icon: "crown", name: "Care Coordinator", text: "Sets up the circle, invites the family, and approves who joins." },
      { icon: "users", name: "Family Members", text: "Follow updates, share tasks, and check in from wherever they live." },
      { icon: "heart", name: "Person Cared For", text: "Uses Elder Mode: a calm, simple view that needs no setup." },
      { icon: "map-pin", name: "Trusted Local Contact", text: "Someone nearby who can act on the ground when it matters." },
    ],
  },
  decisions: [
    {
      title: "Access matches the role",
      text: "Each person sees only what their role needs, enforced at the database with row-level security in Postgres, not just hidden in the UI.",
      visual: "rls",
    },
    {
      title: "Elder Mode, with no setup for the elder",
      text: "A simplified view with large targets and a single “Reach My Family” button. Dignity was the constraint: the elder never fills in a form or remembers a password.",
      visual: "elder",
    },
    {
      title: "No single point of failure",
      text: "Coordinators can be changed by a family vote with a 72-hour window and deadlock safeguards, so care never stalls on one person.",
      visual: "vote",
    },
    {
      title: "Consent comes first",
      text: "Voice-led consent from the elder, or a logged family attestation, before anything is shared. Built with NDPR and GDPR in mind.",
      visual: "consent",
    },
  ],
  product: {
    title: "The product",
    body: "Four tabs, cut down from five. One account can belong to several circles, and push notifications keep everyone in sync.",
    tabs: [
      { icon: "home", name: "Home", text: "Hero card, today’s summary, recent updates, and circle members." },
      { icon: "clipboard", name: "Care", text: "Tasks and medications." },
      { icon: "activity", name: "Updates", text: "A shared activity feed." },
      { icon: "users", name: "Circle", text: "Members, invitations, and requests to join that the coordinator approves." },
    ],
    onboarding: [
      { src: "/work/caira/screen-onboard-family.webp", alt: "Onboarding: Your whole family, one circle of care." },
      { src: "/work/caira/screen-onboard-moments.webp", alt: "Onboarding: Never miss a moment that matters." },
      { src: "/work/caira/screen-onboard-home.webp", alt: "Onboarding: Close to home, from anywhere." },
    ],
    flow: [
      { src: "/work/caira/screen-start.webp", alt: "Does your family already use Caira? Start a new circle, or join with an invite code.", caption: "Start or join a circle" },
      { src: "/work/caira/screen-about-circle.webp", alt: "About the circle: who it’s for, family name, and language.", caption: "About the circle" },
      { src: "/work/caira/screen-who.webp", alt: "Who is this circle for? Their name, your relationship, and the circle’s name.", caption: "Who it’s for, in the family’s words" },
      { src: "/work/caira/screen-details.webp", alt: "Optional details: where they live, their email, and phone.", caption: "Optional details, never required" },
    ],
    elder: {
      greeting: "Good morning, Mama.",
      ask: "How are you feeling today?",
      choices: [
        { label: "I’m okay", tone: "ok", reply: "Thank you, Mama. Your family will see that you’re okay today." },
        { label: "Not feeling great", tone: "meh", reply: "Thank you for telling us. Your family will check in with you today." },
      ],
      reach: { label: "Reach My Family", reply: "We’re letting your whole circle know now." },
    },
    next: "An escalation engine for missed check-ins, timed to the elder’s local time zone, with quiet hours.",
  },
  visual: {
    title: "Visual language",
    body: "Family, not hospital. A terracotta heart-to-infinity mark, the tagline “Care. Together.”, and a care-circle motif throughout.",
    colours: [
      { name: "Deep Night Sky", hex: "#1A2238" },
      { name: "Terracotta", hex: "#C05A44" },
      { name: "Ochre", hex: "#D4A373" },
      { name: "Sage", hex: "#8B9467" },
      { name: "Cream", hex: "#FDF5E6" },
    ],
    type: [
      { family: "Fraunces", role: "Headlines", sample: "Care. Together." },
      { family: "Figtree", role: "Interface & body", sample: "One private circle for the whole family." },
    ],
    tone: "Gentle amber, never alarm red.",
  },
  // Academic layer: collapsed by default
  thinking: {
    rhetoric: {
      title: "Rhetorical lens (CARF)",
      points: [
        "Consent in English and Nigerian Pidgin (the Pidgin copy is waiting on native-speaker review).",
        "Family hierarchy is respected, not flattened.",
        "“Reach My Family,” not “Emergency”: ochre and a heart icon instead of red and a siren.",
        "Time on the elder’s terms: everything is scheduled in their local time zone.",
      ],
    },
    engineering: {
      title: "Engineering",
      stack: [
        { layer: "App", items: ["React Native", "Expo SDK 54", "Android via EAS", "OTA updates"] },
        { layer: "API", items: ["Fastify", "Node.js 20", "Railway", "Zod contracts"] },
        { layer: "Data", items: ["Neon Postgres", "Row-level security"] },
        { layer: "Signals", items: ["Expo push", "FCM"] },
        { layer: "Web", items: ["Static site", "Vercel", "Early-access signup"] },
      ],
      points: [
        "A TypeScript monorepo with shared Zod contracts between app and API.",
        "OTA updates through EAS, with one-command rollback.",
        "I direct an AI coding agent, then review, type-check, and approve every change.",
      ],
    },
  },
  shipped: [
    "Android app, with over-the-air updates",
    "Website live at cairacare.com",
    "Research plan and early tester responses",
    "A hardened PRD: consent, escalation, offline",
  ],
  milestones: ["Applied to the Africa Health-Tech Accelerator 2026 (co-hosted by Africa CDC)"],
  next: [
    "Run research with diaspora families",
    "Recruit pilot families",
    "Build the escalation engine",
    "Get the Pidgin copy reviewed",
  ],
  lessons: [
    { title: "The hard parts live at the edges.", text: "Consent, escalation, offline, and who’s allowed to see what took more design than any screen." },
    { title: "Words are a feature.", text: "“Reach My Family” does work that “Emergency” never could." },
    { title: "Building alone needs a system.", text: "Shared contracts, type-checks, and a review habit kept one person shipping like a team." },
  ],
};

/**
 * NexusCore: the full case study (rendered by NexusStudy.tsx). Uses NexusCore's own palette inside the study
 * (ink #0C0720, indigo #1D0E44, lime #BAD532, lilac #EDE9FA; DM Sans + Fira Code).
 */
export const nexusStudy = {
  slug: "nexuscore",
  kicker: "AI sales assistant · WhatsApp",
  headline: "An AI sales assistant that lives inside the Nigerian WhatsApp inbox.",
  oneLine:
    "A WhatsApp-native AI assistant that answers customer messages, closes sales, and sends payment links in the voice of the seller — built from the ground up for the Nigerian commerce reality of Pidgin, late-night DMs, and bank transfers over Stripe.",
  statusPill: "v0.1 verified end to end · Phase 10 of 10",
  url: "https://nexuscorenew.vercel.app",
  // The hero case: one night on the seller's phone
  night: {
    unread: 180,
    orders: 6,
    revenue: 143000,
    escalated: 2,
    morning: "While you slept: 6 orders closed, ₦143,000 in sales, and 2 complaints sent to you. Your weekly summary is ready.",
  },
  facts: [
    { label: "Role", value: "Founder, product designer, design engineer, full-stack build lead" },
    { label: "Timeline", value: "Build in progress; v0.1 end-to-end subscription flow verified; deployed to production infrastructure on Vercel" },
    { label: "Discipline", value: "Product design, UX writing, systems engineering, culturally attentive rhetoric" },
    { label: "Live demo", value: "nexuscorenew.vercel.app", url: "https://nexuscorenew.vercel.app", note: "Sandbox-credentialed for review; production rollout underway" },
  ],
  stack: ["Next.js 16", "TypeScript", "Postgres (Neon)", "Prisma", "Upstash Redis", "WhatsApp Cloud API", "DeepSeek-V3", "Gemini 2.0 Flash", "Flutterwave", "Africa’s Talking", "Cloudflare R2", "Inngest", "Vercel"],
  problem: {
    title: "The problem, framed from the user’s actual day",
    story:
      "A woman in Lagos runs a growing fashion label through Instagram and WhatsApp. By 11 p.m. she has 180 unread customer messages. Half of them are variations of the same four questions. The other half are buying-intent messages she will answer too late — the customer will have already moved on to a competitor who replied in three minutes.",
    questions: ["Is this available?", "How much?", "Do you deliver to Lekki?", "Do you accept transfer?"],
    tried: [
      { name: "Intercom & Zendesk", why: "Cost more than her monthly rent, and weren’t built for WhatsApp." },
      { name: "Local broadcast tools", why: "Little more than bulk-message senders." },
      { name: "Twilio wrappers", why: "Priced in dollars." },
    ],
    voice: "None of them understand that her customers write “Abeg how much na?” and expect a reply that doesn’t sound like a bank.",
    insight: "This is not a messaging problem. It is an infrastructure gap — the operating layer for a specific kind of African small business does not exist, so sellers run the business from their thumbs, badly, until they burn out.",
    answer: "NexusCore is the attempt to build that layer.",
  },
  product: {
    title: "The product in one paragraph",
    flow: [
      { step: "Sign up", text: "With a phone number. No email." },
      { step: "20-minute wizard", text: "Products, prices, delivery zones, and FAQ answers." },
      { step: "Connect payouts", text: "A Flutterwave payout account." },
      { step: "Go live", text: "Every customer message answered within five seconds, in the seller’s voice." },
      { step: "“I’ll take it”", text: "A Flutterwave payment link, the moment the customer says it." },
      { step: "Step aside", text: "Escalates to the seller’s personal WhatsApp for complaints, high-value decisions, or low confidence." },
      { step: "Sunday summary", text: "A performance summary every Sunday morning." },
    ],
    // Copy from the NexusCore content-design sample (made-up shop and prices)
    chat: [
      { from: "buyer", text: "abeg how much for the blue ankara wey you post yesterday" },
      { from: "bot", text: "The blue Ankara (6 yards) is ₦18,500. We have 4 left. Should we deliver it, or will you pick it up in Aba?" },
      { from: "buyer", text: "deliver to Enugu" },
      { from: "bot", text: "Delivery to Enugu is ₦3,000, so your total is ₦21,500. Here’s your payment link. Once you pay, Adaeze will confirm your order right here." },
    ] as { from: "bot" | "buyer"; text: string }[],
    payment: { label: "Pay ₦21,500", via: "Flutterwave" },
    commands: {
      example: "Price Ankara maxi 15000",
      reply: "Catalog updated: Ankara maxi is now ₦15,000.",
      intents: ["Pause bot", "Update price", "Add product", "Mark sold out", "Confirm a credit sale", "Log a support ticket"],
      note: "Fourteen intents, parsed without the LLM, because LLM round-trips were too slow for operational commands.",
    },
  },
  decisions: [
    {
      title: "WhatsApp-native, not web-native",
      text: "The dashboard is a convenience, not the product. The seller’s hands are already on WhatsApp sixteen hours a day; making her open a browser tab to update a price is friction she will not accept. So every operational action had to be expressible as a natural-language WhatsApp command.",
      visual: "command",
    },
    {
      title: "Pidgin and Naija English as the default",
      text: "Not a localization layer. Customers write in Pidgin, code-switch mid-sentence, and write “wetin dey” without expecting condescension. If the bot replies in corporate English, trust evaporates in the first message. This is where CARF, my thesis framework, stops being academic: decolonizing an interface is defaulting to the register the user actually speaks.",
      visual: "voice",
    },
    {
      title: "Money as BigInt kobo, never float",
      text: "All amounts are stored as BigInt kobo (₦1 = 100 kobo). The seller never sees “₦29.99999” on an invoice, because floating-point rounding was ruled out at the schema layer. Every total, split, and weekly summary is correct to the kobo.",
      visual: "kobo",
    },
    {
      title: "The bot never invents prices",
      text: "The LLM is a reply generator, not a quote generator. Prices come strictly from the catalog table, enforced in the prompt and in the signal-parsing step after the LLM responds. A bot that occasionally hallucinates ₦5,000 off a dress destroys the seller’s margin and her trust at once.",
      visual: "catalog",
    },
    {
      title: "Escalation as a trust mechanism",
      text: "Not what happens when the bot fails — what happens when the system decides the human should be involved. The buyer hears “I’m connecting you with the team”; the seller gets a summary and a wa.me link and takes over from her own phone. The AI knew when to step aside.",
      visual: "escalate",
    },
    {
      title: "Self-serve or nothing",
      text: "No sales calls, no onboarding specialists. If a seller can’t get live in twenty minutes with no human help, we fix the wizard, not the funnel. At a ₦30,000 price point, every manual onboarding hour is a hole in the business model.",
      visual: "wizard",
    },
  ],
  voices: [
    { id: "friendly_naija", note: "Default" },
    { id: "professional", note: "Different markets" },
    { id: "concise", note: "Different markets" },
  ],
  escalateWhen: ["Complaints", "High-value buying intent", "Owner-name mentions", "Low-confidence replies"],
  wizardChecks: { catalog: 5, questions: 5, diagnosticSeconds: 60 },
  architecture: {
    title: "Every tool chosen for a constraint, not a trend",
    // The path one customer message takes
    journey: ["WhatsApp", "WhatsApp Cloud API", "Next.js on Vercel", "Redis context", "DeepSeek-V3", "Catalog check", "Payment link"],
    tools: [
      { name: "WhatsApp Cloud API", tag: "Messaging", why: "Direct, no BSP. Platform fees would compound against a ₦30,000 subscription. The trade-off: a 1–3 week Meta review, then zero markup forever." },
      { name: "DeepSeek-V3 + Gemini 2.0 Flash", tag: "LLM", why: "DeepSeek is 5–10× cheaper per token than GPT-4o-class models; Gemini is a warm fallback after 30 seconds, so an outage doesn’t take the bot offline. Behind LiteLLM, a provider swap is a config change. Data residency is disclosed at signup." },
      { name: "Postgres · Prisma · Neon", tag: "Data", why: "Nine relational models designed for the full product from day one. Serverless scales to zero pre-revenue; type-safe queries stop a class of bugs at compile time." },
      { name: "Upstash Redis", tag: "Context", why: "Conversation context, OTP storage, and rate limiting. Three jobs, one tool." },
      { name: "Flutterwave", tag: "Payments", why: "Subscriptions and buyer payments in one integration. Subaccounts pay sellers directly, not through escrow: the money is theirs the moment it arrives." },
      { name: "Africa’s Talking", tag: "SMS OTP", why: "Reliable OTP deliverability across every major Nigerian network." },
      { name: "Cloudflare R2", tag: "Media", why: "Zero egress fees, for voice notes and product images at scale." },
      { name: "Inngest", tag: "Jobs", why: "Weekly summaries, billing renewals, NDPR cleanup, webhook replays, and dunning, on durable execution instead of raw cron." },
      { name: "Next.js on Vercel", tag: "Platform", why: "API routes, marketing page, dashboard, and admin panel ship as one artifact that deploys on git push. One mental model, one bill." },
    ],
  },
  lessons: [
    { title: "The product-engineering boundary is a lie at this scale.", text: "Storing money as BigInt kobo is a product decision expressed in a schema. Defaulting the bot to Naija English is a rhetorical decision that lives in a system prompt. The work is one thing." },
    { title: "Scope discipline is the hardest craft skill.", text: "An AI coding agent over-built three times and twice shipped work I’d scoped out. Smaller tasks, tighter fences, verify by reading before committing." },
    { title: "Culturally attentive design has a cost structure.", text: "WhatsApp-native, Pidgin-first, no-email is right for the seller, and it rules out the standard SaaS acquisition playbook. I had to build acquisition from first principles." },
    { title: "Trust compounds through small details.", text: "A bot that defers when it should. A payment link in sixty seconds instead of a pasted account number. A system that runs its own setup diagnostics." },
    { title: "A live payment system is a different nervous system.", text: "Ninety-nine percent success on activation means one in a hundred sellers pays and gets nothing. Idempotency, retries, webhook replays, and reconciliation, because sellers lose faith on the first failure." },
  ],
  status: {
    title: "Phase 10 of 10, and live on Vercel",
    phase: 10,
    phases: 10,
    live: ["Marketing page", "Auth", "Onboarding wizard", "Dashboard (six tabs)", "Bot engine", "Seller WhatsApp commands", "Billing", "Admin panel", "Public storefronts", "Direct seller payouts"],
    proof: ["Trial seller clicks upgrade", "Pays with a test card", "Webhook fires", "Seller found from the transaction reference", "Subscription flips to active", "WhatsApp welcome message"],
    remaining: ["Live WhatsApp Business number", "Live Africa’s Talking account", "Live Flutterwave keys", "Custom domain nexuscore.africa"],
    target: { n: 10, text: "paying sellers retained past 30 days, within 90 days of public launch" },
  },
  about: {
    title: "What this project is really about",
    text: "NexusCore is a bet that the next wave of African software will not look like American software with a currency change. The seller does not want to be onboarded; she wants her evening back. She does not want a dashboard; she wants to type “pause bot” to her own number and have it work.",
    refused: ["Email verification", "English-first copy", "Dollar-denominated pricing", "High-touch onboarding", "Stripe-shaped payment flows"],
    thesis: "If this works for the first hundred sellers, there is a market for software built to this reality, not translated into it.",
  },
};

/**
 * TokenForge: the full case study (rendered by TokenStudy.tsx), from the team's Behance case study and the live app.
 * TokenForge's own palette inside the study: ink #0F0F12, violet #9F46E5, grey #9FA1A9, lavender #DEE4FE; Inter.
 */
export const tokenStudy = {
  slug: "tokenforge",
  kicker: "AI · Design systems · Dev & Design Academy capstone",
  headline: ["Describe your brand to generate", "a design system"],
  oneLine: "TokenForge helps designers, developers, and teams go from brand idea to production-ready design tokens in seconds.",
  statusPill: "Shipped · 2026 · Team of ten",
  url: "https://token-forge-three.vercel.app",
  behance: "https://www.behance.net/gallery/255008197/TOKENFORGE-AI-Powered-Design-System-Token-Generator",
  facts: [
    { label: "Industry", value: "Design tooling / AI automation" },
    { label: "Product", value: "Web app · SaaS platform · Design tool" },
    { label: "Timeline", value: "4 weeks, 2026" },
    { label: "Status", value: "Shipped" },
    { label: "Team", value: "Ten co-creators, Dev & Design Academy capstone" },
    { label: "Live", value: "token-forge-three.vercel.app", url: "https://token-forge-three.vercel.app" },
  ],
  problem:
    "Designers and developers spend hours building design systems from scratch: defining colors, typography, spacing, and other foundational decisions. The process is repetitive, hard to keep consistent, and it’s easy to overlook accessibility.",
  solution:
    "TokenForge uses AI to turn a simple brand description into a complete, production-ready design system in seconds. Users preview and refine their tokens visually, check accessibility, remix variations, and export straight to CSS, Tailwind, or JSON.",
  speed: { from: "6+ hours", to: "< 60 seconds", note: "Design-system setup, before and after" },
  audiences: [
    { name: "Designers", text: "Need to establish a visual language for a new project or client quickly, and want live previews they can tweak." },
    { name: "Developers", text: "Need a structured token file (CSS variables, a Tailwind config) they can drop into a codebase without reformatting." },
    { name: "Company founders", text: "Juggle several brands and need quick, accessible, varied design systems for pitches and new contracts." },
  ],
  process: [
    { phase: "Research & Discovery", steps: ["User research", "Idea generation", "Competitor analysis"] },
    { phase: "User Flow & Wireframing", steps: ["User flow", "Interaction planning"] },
    { phase: "High-Fidelity Design", steps: ["Design system", "UI components", "High-fidelity design", "Interactive prototype"] },
    { phase: "Testing & Iteration", steps: ["Usability testing", "AI output validation", "Accessibility testing", "Design refinement"] },
  ],
  competitors: [
    { name: "Specify", kind: "Design token engine", text: "Manages design tokens across flexible pipelines and integrations." },
    { name: "Supernova", kind: "Enterprise design system platform", text: "Helps established teams manage, document, and sync an existing system." },
    { name: "Figma", kind: "Design tool / industry standard", text: "Where designers create interfaces, prototypes, and components." },
    { name: "Locofy.ai", kind: "Design-to-code platform", text: "Converts Figma designs into front-end code." },
  ],
  gap: "Existing tools manage or implement design systems, but creating one is still largely manual. TokenForge uses AI to generate, refine, validate, and export a complete design system from a simple brand description.",
  swot: [
    { key: "S", name: "Strengths", points: ["Setup drops from 6+ hours to under 60 seconds", "A natural-language interface instead of complex panels", "WCAG accessibility checks built in, not bolted on", "Developer-first exports: CSS variables, Tailwind config, JSON"] },
    { key: "W", name: "Weaknesses", points: ["No Figma plugin at first: tokens are copied by hand", "A new brand next to Adobe, Figma, and Canva", "Output quality depends on prompting and the DeepSeek API", "No learning loop from user corrections in the MVP"] },
    { key: "O", name: "Opportunities", points: ["Most small businesses and freelancers can’t afford a design system", "Become the source-of-truth plugin for Figma, Webflow, and VS Code", "From generator to governor: AI that checks pull requests for design drift"] },
    { key: "T", name: "Threats", points: ["Figma or Canva could ship a native “Generate Styles” button", "Cheaper AI inference squeezes pricing", "Weak early outputs could hurt trust in the brand"] },
  ],
  personas: [
    {
      name: "Lily Williams",
      who: "28 · UI/UX designer",
      motivation: "Create polished, consistent design systems quickly, without spending hours defining foundational tokens before product design.",
      goals: ["Set up colors, type, spacing, and components fast", "Explore several visual directions for a brand", "Adjust without rebuilding from scratch"],
      pains: ["Manual token creation is repetitive", "Consistency across foundations is hard", "AI output still needs review before it’s trusted"],
      map: {
        says: ["I don’t want to spend hours setting up tokens", "I need to know if these colors are accessible"],
        thinks: ["There has to be a faster way", "I need control over what the AI generates"],
        feels: ["Overwhelmed starting from scratch", "Confident when she can preview and refine"],
        does: ["Defines colors, type, spacing, radii", "Reviews and adjusts generated tokens"],
      },
    },
    {
      name: "Alexander Smith",
      who: "25 · Developer",
      motivation: "Get a structured, consistent set of tokens he can implement directly, without translating design decisions by hand.",
      goals: ["Receive tokens that are ready for development", "Export in formats that fit his workflow", "Keep the product’s visual language consistent"],
      pains: ["Translating design to code is tedious and error-prone", "Inconsistent naming creates extra work", "He needs confidence the values are usable"],
      map: {
        says: ["I need tokens I can actually use in my codebase", "The naming needs to be consistent"],
        thinks: ["Will these translate cleanly into code?", "Which export format fits this project?"],
        feels: ["Relieved when tokens are ready to export", "Confident when output drops straight in"],
        does: ["Exports development-ready formats", "Integrates tokens into the codebase"],
      },
    },
  ],
  style: {
    font: "Inter",
    fontNote: "Designed for digital interfaces: clean, highly legible, precise, and flexible.",
    weights: ["Regular", "Medium", "SemiBold", "Bold"],
    colours: ["#9F46E5", "#9FA1A9", "#DEE4FE", "#FFFFFF"],
  },
  steps: [
    { name: "Describe your brand", text: "Type your vision, audience, and aesthetic; the AI reads the creative direction." },
    { name: "AI generation", text: "A full system: semantic color palettes, a harmonious type scale, and spacing foundations." },
    { name: "Refine & tweak", text: "A real-time visual editor, with every change shown in the live preview." },
    { name: "Export for production", text: "CSS variables, a Tailwind config, or pure JSON, ready for the codebase." },
  ],
  workstation: [
    { panel: "Editor", text: "Brand description, mood and industry, and manual token controls." },
    { panel: "Live preview", text: "Color roles and real components, like a sign-in form, update as you edit." },
    { panel: "Accessibility · Remix · Export", text: "Contrast checks, generated variations, and one-click export." },
  ],
  // The example prompts from the live app, used by the interactive demo
  prompts: [
    "A premium fintech app for young investors who want clean, trustworthy design with a hint of excitement.",
    "A fitness app that feels energetic and motivating.",
    "A healthcare platform that feels calming and professional.",
  ],
  team: ["Eseosa Francis Aduwa (lead product designer)", "Tobechukwu Onyia", "Ujunwa Okoye", "Victor Omolasoye", "Tijani Zaynab Oyenike", "Malachi Remilekun", "John B. Oladeji", "Enoch Ojukwu", "Precious Udeanioke", "Abioye Oluwabukola Esther"],
};

/**
 * CARF: the research case study (rendered by CarfStudy.tsx). Paired with Caira: one built, one researched.
 * From the owner's thesis notes and CV.
 */
export const carfStudy = {
  slug: "carf",
  name: "CARF",
  fullName: "Culturally Attentive Rhetorical Framework",
  line: "A method for reading, and rewriting, the language inside financial apps.",
  facts: [
    { label: "Role", value: "Researcher, M.A. thesis" },
    { label: "Status", value: "In progress, completion expected December 2026" },
    { label: "Field", value: "Digital rhetoric, UX writing, HCI" },
    { label: "Methods", value: "Critical Technocultural Discourse Analysis, Value Sensitive Design" },
  ],
  question: {
    // Paraphrased from the two onboarding flows the study compares
    lagos: { city: "Lagos", text: "Any information that cannot be matched against external databases may restrict your account.", reading: "A document to be checked" },
    chicago: { city: "Chicago", text: "We just need to confirm who’s signing up. It’ll only take a moment.", reading: "A customer to be helped" },
    contrast: "Same regulatory step. Very different relationship.",
    ask: "What does interface language assume about the people it addresses, and what does that cost the users it was never written for?",
  },
  argument: {
    lead: "Fintech microcopy is not neutral text. It carries the cultural, institutional, and economic assumptions of the place it was designed. When those assumptions travel unexamined, the interface quietly ranks some users’ norms as standard and others’ as exceptions.",
    parts: [
      { name: "Cultural", text: "Tone, register, trust signals, and who carries the blame for an error all encode assumptions about who the user is." },
      { name: "Structural", text: "When one market’s communication norms become the default, other markets are positioned as departures from it." },
      { name: "Material", text: "Consent and verification screens are where platforms collect user data. Reading them closely means reading who benefits, not only how they sound." },
    ],
  },
  corpus: {
    lead: "Six widely used platforms, chosen because they operate under different cultural, regulatory, and institutional conditions.",
    nigeria: [
      { name: "OPay", kind: "High-growth mobile wallet" },
      { name: "PalmPay", kind: "Mobile wallet with agent network" },
      { name: "GTBank", kind: "Established commercial bank, digitized" },
    ],
    us: [
      { name: "Chime", kind: "Branchless digital bank" },
      { name: "Cash App", kind: "Peer-to-peer payments and investing" },
      { name: "Venmo", kind: "Peer-to-peer payments with a social feed" },
    ],
    moments: ["Onboarding", "Identity verification", "Fee disclosure", "Error messages", "Consent"],
  },
  method: {
    ctda: { name: "Critical Technocultural Discourse Analysis", layers: ["What the system does", "What its language means in context", "Whose power it reinforces"] },
    vsd: { name: "Value Sensitive Design", text: "Asks which human values each screen supports or undermines, so every proposed rewrite rests on a named value, not on taste." },
    evidence: { n: 37460, text: "Nigerian banking-app reviews in a published study ground the analysis in how users actually describe these moments." },
    note: "The study is corpus-based by design. Interviews and testing with users are the next stage of the research.",
  },
  framework: {
    lead: "CARF turns the analysis into something UX writers can use: three dimensions to examine, and five practices to apply.",
    dimensions: [
      { name: "Epistemic", text: "Which forms of identity and which financial practices the flow treats as standard" },
      { name: "Linguistic", text: "Register, politeness, indirectness, and how trust and authority are voiced" },
      { name: "Economic", text: "Whether the language assumes a salaried income, and whether consent serves the user or the platform" },
    ],
    pathways: [
      { name: "Cultural Epistemic Mapping", text: "Surface a flow’s assumptions before writing a word" },
      { name: "Rhetorical Strategy Adaptation", text: "Adapt tone, address, and ordering to the community’s traditions" },
      { name: "Linguistic Decolonization", text: "Go past translation to local norms of formality and relational address" },
      { name: "Trust Architecture Design", text: "Calibrate trust signals to the audience instead of universalizing them" },
      { name: "Continuous Cultural Feedback", text: "Involve affected communities in every revision" },
    ],
  },
  questions: [
    "How do Nigerian and American fintech microcopy reflect different assumptions about financial identity, trust, and legitimate behavior?",
    "How does standardized interface language reproduce colonial hierarchies of knowledge, and through what mechanisms?",
    "How do users respond to culturally specific versus generic interface language at verification, consent, and error?",
    "What guidelines can help writers produce culturally responsive language without reducing culture to stereotype?",
  ],
  status: [
    { text: "Introduction and literature review drafted", state: "done" },
    { text: "Corpus analysis in progress", state: "now" },
    { text: "Thesis completion expected December 2026", state: "next" },
    { text: "Next: extend CARF to AI-generated interface language, and test its pathways with Nigerian and diaspora users", state: "next" },
  ] as { text: string; state: "done" | "now" | "next" }[],
  related: [
    { title: "Trapped in the Algorithm: How Echo Chambers and Cognitive Biases Fuel Misinformation", where: "Southwest Popular/American Culture Association, 47th Annual Conference, 2026" },
    { title: "Navigating Authenticity: Digital Code-Switching as Identity Construction on TikTok in Nigeria and the United States", where: "Hispanic Association of Colleges and Universities, 39th Annual Conference, 2025" },
    { title: "The Rhetoric of Fintech: How Digital Platforms Shape Public Perception of Financial Services and Trust in Accounting Systems", where: "Manuscript in preparation" },
  ],
  relatedNote: "Related work on digital rhetoric and identity, not CARF itself.",
  closing: "A writing sample from this project is available on request.",
};

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
  formEndpoint: (import.meta.env?.VITE_FORM_ENDPOINT as string | undefined) || undefined,
  /** TODO: match these to your rate card service lines. */
  projectTypes: ["Brand identity", "Packaging", "Product / UX design", "Design systems", "Social content", "Something else"],
  budgets: ["Under $1k", "$1k – $5k", "$5k – $15k", "$15k+", "Not sure yet"],
  replyTime: "I reply to every inquiry within two business days.",
};
