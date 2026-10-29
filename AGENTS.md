# Project notes for AI coding agents

Read this file first. It explains the project, how to run it, and what's left to do.

## What this is

Personal portfolio site for **John B. Oladeji (JHNB)**, product designer, design engineer, and founder.
A single-screen, high-contrast landing page with an animated Three.js background and a side drawer
for Projects, Blog, About, Resume, and a contact form.

Started from a design blueprint for a template portfolio ("Eathan"). All template content has been
replaced. Do not reintroduce any "Eathan" text or the template's hero photo.

## Stack

- Vite 6 + React 18 + TypeScript
- Tailwind CSS v4 (tokens in `@theme` inside `src/index.css`, no tailwind.config file)
- Framer Motion (drawer, typewriter bio)
- Three.js (particles, dashed energy lines, bloom post-processing)
- lucide-react icons
- Developer is on Windows, using PowerShell.

## Commands

```
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
```

Run `npm run build` after changes to confirm nothing broke.

## Deployment

Live at **https://jhnb-newportfolio.vercel.app**. Vercel project `jhnb-newportfolio` is connected to the GitHub repo
`johnboladeji/jhnb-newportfolio` (private): every push to `main` redeploys automatically (Vite preset: `npm run build`,
output `dist`). Only committed files go live, so anything git-ignored (`public/hero/`, `private/`, `.env*`) stays private.
`public/resume.pdf` is the redacted CV (2 pages, from `John_B_Oladeji_CV.pdf`, October 2026; phone number removed, city kept); the
original is in the git-ignored `private/` folder. Always strip phone numbers and street addresses before publishing a new CV.

## Links, crawlers, and share previews

- Every panel has an address in the URL hash (`src/routes.ts`): `#/menu`, `#/work`, `#/work/<slug>`, `#/about`,
  `#/writing/content-design`, `#/writing/articles`, `#/resume`, `#/contact`. App.tsx owns the drawer state and keeps
  it in sync with the hash; Back steps between panels; the tab title follows the panel.
- `prerender.ts` (a Vite plugin) writes a complete, visible, styled static page into `#root` at build time (headline,
  bio, About Me, Selected Works, Research & Teaching, Writing, Resume, contact, profiles; about 1,500 words), plus
  canonical, Open Graph / Twitter tags and schema.org `Person` JSON-LD, all from `content.ts`. React replaces it on
  mount; an inline script adds `html.js`, which keeps the static page invisible for 4 seconds so visitors never see a
  flash, and it appears only if the app never mounts. Never hide it with clipping or `display:none` (reader tools and
  unfurlers then drop it). `public/robots.txt` and `public/sitemap.xml` point crawlers at the site.
  `public/og-image.png` (1200×630) is the share image. Set `site.url` when moving to a custom domain.

## Where things live

- `src/content.ts` — ALL visible text, links, and settings. Edit content here, not in components.
- `src/index.css` — fonts, colour tokens, selection colour, outlined-text classes, marquee keyframes.
- `index.html` — page title, meta description, Google Fonts link, favicon.
- `public/` — static files: `hero-1.webp` / `hero-2.webp` (hero slider cut-outs), `resume.pdf`,
  `jhnb-icon.png` (header logo), `jhnb-wordmark.png` (not currently used),
  `favicon.png` (256px) and `apple-touch-icon.png` (180px), both from `JHNB IDENTITY ICON wt BG 2.png`. Brand source files (`JHNB IDENTITY *.png`) and raw photos (`hero/`) also live here.
- `src/lib/sound.ts` — the site's sound, synthesized with Web Audio (no files, no dependencies), Yoruba instruments:
  agogo double bell (FM, low and high bell a fifth apart) playing the West African 12/8 standard bell pattern;
  gángan talking drum (bending skin tone + resonant skin noise + stick slap) whose pitch follows Yoruba speech tones
  (low ≈ 120, mid ≈ 165, high ≈ 225 Hz); ṣẹ̀kẹ̀rẹ̀ swish; a short wooden-room reverb. Off until the visitor turns it on
  (`jhnb-sound` in localStorage); every call is a no-op while off. `playWelcome()` (≈2 s: one bar of bell, the drum
  saying "Ẹ káàbọ̀"), `tapDrum`, `openFlourish`, `menuNote` (bell), `pageTurn`, `chime`; `hush()` silences.
- `src/components/`
  - `Intro.tsx` — the welcome, once per visit (sessionStorage `jhnb-intro`), z-90, brand palette only (`BRAND`): the shut
    double door of John's studio, carved like a Yoruba palace door (oniko circles, diamond, zigzag reliefs, brass studs
    and pull bars), set in a terracotta stone wall (an SVG stone tile, `WALL`) under warm light, with a "JHNB · STUDIO"
    lintel and two breathing lanterns (`.lantern-glow`). A sign on the door types the first draft "Welcome to my
    portfolio.", strikes it through, and rewrites it: Ẹ káàbọ̀ → Bienvenido → Bienvenue → ようこそ → "Ẹ káàbọ̀. Welcome.",
    then "Let's begin where you are." (≈3.5 s; adopted from the owner's v2 HTML draft). The brass lever turns (`latch`
    sound), the doors swing open on their hinges, and because the doorway is a real hole in the wall (CSS mask, sized by
    `--dw`/`--dh`/`--dt`), the actual hero shows through and the scene scales up through the doorway. Clicking the door or
    handle opens it now; Skip or Escape leaves; the footer `SoundToggle` sits on the scene (welcome sound plays on opening
    if sound is on). Reduced motion: final words at once, then a fade. Copy: `intro` in content.ts.
  - `DrumPad.tsx` — taps on open space play the talking drum (pitched by height) and throw rings and shekere beads in the
    brand colours (`.drum-burst`); skips links, buttons, fields, dialogs, and anything marked `data-no-drum` (the h1, the bio).
    Fires `jhnb:drum` (hides the hint). Clicking the h1 turns the rotating word on a drum roll.
  - `SoundToggle.tsx` — sound on/off in the footer (`aria-pressed`, dancing `.sound-bars`).
  - `ParticleBackground.tsx` — Three.js scene (z-0). Disposes everything on unmount.
    Without WebGL it skips itself (try/catch around the renderer); App wraps it and HeroImage in `SafeBoundary.tsx`, so a
    crash in decoration never blanks the page. Test with WebGL off (e.g. stub `getContext` before the app loads).
  - `HeroImage.tsx` — cut-out photos sliding right → left (z-10). Skips any that fail to load.
  - `WarpPortrait.tsx` — WebGL portrait: head/eyes/hand follow the cursor (rig data in `hero.images[].rig`).
  - `InteractionFX.tsx`, `RollText.tsx` — cursor follower, magnetic buttons, spotlight, click burst, letter roll.
    RollText draws its letters in CSS (`data-ch` + `::before`/`::after`), so the DOM holds the label once (no doubled letters).
  - `HeroContent.tsx`, `ScrambleText.tsx`, `TypewriterBio.tsx` — headline and bio (z-20).
  - `Header.tsx` — social icons (left), morphing logo (centre), "View Me" menu button (right) (z-30).
  - `SocialIcon.tsx` — inline SVG brand glyphs used in the header.
  - `FooterMarquee.tsx` — outlined marquee plus the © / email footer line (z-30).
  - `InfoDrawer.tsx` — side drawer (z-50): menu (Home, Projects, About Me, Writing ▸ Content Design / Articles, Resume, Let's Work), sub-views, contact form.
    Sound (when on): `openFlourish` as it opens, `pageTurn` between panels, `menuNote(i)` on hovering or focusing a menu
    item. A woven `.aso-band` runs along the panel's top edge and sweeps in under each menu label on hover or focus.
    The Header's menu button pulses in the brand colours (`.menu-nudge`) after 9 seconds without interaction.
    The Writing pages (Content Design, Articles) open full screen by default, however they're reached (menu, link, or a
    shared `#/writing/...` address); the toggle still shrinks them. Other panels open at drawer width.
  - `DrawerPortraits.tsx` — studio portraits blended into the drawer's right edge, sliding right → left (`drawerImages`).
  - `TravellingPen.tsx` — the Writing pages' travelling fountain pen, drawn in code and never still: it flies in with a
    twirl, scribbles at rest (`.pen-scribble`), glints, travels down a right-hand gutter as you scroll while leaning into
    the motion, writes a looping cursive ink trail (how far you've read), and splashes + spins at each quarter.
    Shown only when the pane is ≥ 520px wide (ReadingShell then reserves `pr-24`); hidden under reduced motion.
  - `ReadingShell.tsx` — shared shell for the Writing pages: pinned header (outlined title, optional struck draft, typed headline), tab row / full-screen side list, reading pane with progress; `PaneContext` is the pane's scroll root.
  - `Articles.tsx` — Writing ▸ Articles on `ReadingShell`: overview with code-drawn covers, article pages with interactive explainers, links to Medium (`articles` in content.ts).
  - `ContentDesign.tsx` — Writing ▸ Content Design: pinned header + tabs + reading pane (About's structure); samples are typed blocks (`WritingBlock`) in `writing` in content.ts; screenshots in `public/writing/`.
  - `Reveal.tsx` — shared `Reveal` (fade-rise) and `RiseWords` (masked word rise) helpers.
  - `Works.tsx` — Selected Works list, generated project covers, case-study view (`projects` in content.ts).
  - `CairaStudy.tsx` — Caira's rich case study and list cover (content in `cairaStudy` in content.ts, images in
    `public/work/caira/`). Uses Caira's own tokens (`night`, `terra`, `ochre`, `sage`, `paper`; Fraunces + Figtree)
    only inside the study, and container queries (`@container`, `@md`/`@xl`/`@3xl`) so it adapts to the drawer width.
  - `NexusStudy.tsx` — NexusCore's rich case study and list cover (content in `nexusStudy`). NexusCore's own tokens
    (`nx-ink`, `nx-indigo`, `nx-plum`, `nx-lime`, `nx-lilac`, `nx-mist`; DM Sans + Fira Code), only inside the study.
  - `CarfStudy.tsx` — CARF research case study and list cover (content in `carfStudy`): the researched twin of Caira,
    on StudyKit, in the site palette with Newsreader italics.
  - `ResearchTeaching.tsx` — About Me → Experience: the Research & Teaching group above the industry timeline (`researchTeaching`).
  - `TokenStudy.tsx` — TokenForge's rich case study and list cover (content in `tokenStudy`, from the team's Behance
    case study and the live app). TokenForge's tokens (`tf-ink`, `tf-panel`, `tf-violet`, `tf-grey`, `tf-lav`; Inter), only inside the study.
  - `ResumeSection.tsx` — Resume: About's structure (pinned title + typed headline), download card with the shared pill
    buttons, numbers, the arc by discipline, expertise, research, education, ventures (`resume` in content.ts). No job list; work history stays in the PDF.
  - `StudyKit.tsx` — shared chrome for rich case studies: sticky chapter bar (`StudyBar`), numbered chapters
    (`StudyChapter`), `LitWords` (words light up on scroll, via `useScrollThrough`, which reads any scroll container directly; use it rather than framer `useScroll` for nested scrollers such as the Writing reading pane), `useStudyProgress`. Each study passes its own `tone`.
  - `SkillCapsules.tsx` — physics skill capsules under the Let's Work form (`skills`; uses matter-js).
  - `AboutSection.tsx` — About Me shell: pinned title + typed headline (`TypeLoop.tsx`), Overview/Experience segments (tabs, or side by side in full screen).
  - `AboutDeck.tsx` — Overview: sideways page deck. `ExperienceList.tsx` — Experience timeline (`experience` in content.ts).

## Design system (current) — JHNB brand palette

Tokens live in `@theme` in `src/index.css` and are used as Tailwind classes (`bg-primary`, `text-cream`, etc.).

| Token | Hex | Used for |
| --- | --- | --- |
| `base` | `#150600` | Page background, Three.js scene background, `theme-color` |
| `primary` | `#983A28` | Filled elements only: logo mark, buttons, COMMISSION hover, text selection, particle hover glow, rotating headline word |
| `secondary` | `#4E1D09` | Drawer panel, resting particle colour |
| `tertiary` | `#FFD0A1` | Small accent text, link hovers, focus outlines and field borders, energy lines |
| `cream` | `#F1E6CE` | All body text and outlined headings (replaces white) |

Contrast (WCAG): primary as text fails — 2.81:1 on `base`, 1.98:1 on `secondary`. Never use
`text-primary` for small text or anything inside the drawer; use `text-tertiary` instead.
Cream on primary is 5.71:1 (fine for button labels). The rotating headline word is `text-primary`
by the owner's choice; swap to `text-tertiary` in `HeroContent.tsx` if it needs to pass AA.

Fonts: Anton (display), Space Grotesk (body), IBM Plex Mono (labels, buttons), Newsreader italic (`font-serif`: editorial captions and pull quotes in Content Design).

Gotcha: `base` is a colour token here, so `text-base` means the dark page colour, not 16px. Use `text-[16px]` for the size.

## Remaining TODOs

Search `src/content.ts` for `TODO`:

1. ~~Hero photos~~ Done: `public/hero-1.webp`, `public/hero-2.webp` (OpenCV GrabCut cut-outs of
   `public/hero/1791941132446.jpg.jpeg` and `public/hero/file_000000007e90823092fccefdafc9cc6e.png`).
2. ~~CV~~ Done: `public/resume.pdf`.
3. Projects: links, outcomes, real cover images (`cover`), and Unelo / TokenForge details (see TODOs in `projects`).
4. ~~Missing years in resume roles~~ The Resume page no longer lists roles. TokenForge: name your part in the team (`role` TODO in `projects`).
5. ~~Social links~~ Done: LinkedIn, GitHub, X (@thejohnboladeji), and Instagram. Add Google Scholar to `socials` once
   that profile exists (its icon is still in `SocialIcon.tsx`).
9. To confirm (marked TODO in content.ts): OYNA years (2025 — 2026?), the exact M.A. title from the transcript,
   your role on TokenForge, and that the friend's-mother story in the Caira study is fine to keep public.
10. Before sharing with faculty: move to a custom domain (update `site.url`).
6. ~~Articles and content design samples~~ Done: `articles` (Medium) and `writing`. Add new Medium articles to `articles.items`.
7. Project types to match the JHNB rate card service lines.
8. Optional: set `VITE_FORM_ENDPOINT` in `.env` (see `.env.example`) so the form posts to
   Formspree instead of opening the visitor's email app.

## Rules for changes

- Keep content in `src/content.ts`; components should read from it.
- Copy style: US English (color, behavior, program; proper names such as "OYNA … Programme" keep their own spelling),
  serial (Oxford) comma, curly quotes and apostrophes (’ “ ”), en-dash ranges with no spaces ("2024–Present", "2025–2026"),
  spaced em dashes in prose (" — "), times as "11 p.m." in prose and "9:04 AM" in interface mock-ups.
- Keep accessibility intact: focus trap and Escape-to-close in the drawer, labelled form fields,
  `sr-only` text for animated headings (the hero h1 is one stable sentence; the scramble is `aria-hidden`), reduced-motion
  handling (the global CSS rule stops animations; JS demos must render their final state when motion is reduced).
- The hero bio (`TypewriterBio.tsx`) reveals word by word on every visit (blur → sharp rise, about 9 seconds; on phones the
  sign-off follows the three visible lines at about 4 seconds) and loops on its own 10 seconds after each run (`LOOP_MS`).
  The body is one colour (cream, regular weight); only the sign-off is bold `tertiary`. `hero.bioHighlights` phrases glow
  every 6.5 seconds (`bio-hi-glow` animates the registered `--hg`). A reading light (`--g`) warms words near the pointer or
  finger; hovering holds the loop and sends a ripple outward from the pointer (`.bio-rippling`, per-word `--d`); a tap while
  revealing shows it all. The full text is always in the page for screen readers; reduced motion shows it still.
- The hero photo keeps its place (centred at lg, 56% at xl). Where the bio overlaps it on narrower desktops, a soft
  radial scrim behind the bio (a `before:` layer in `HeroContent.tsx`) keeps the text legible; below lg the photo starts
  under the text (`--hero-text-bottom`).
- No remote images in production; put assets in `public/`.
- Keep the page free of scrollbars on mobile (root uses `h-dvh`).
- Don't add new dependencies without saying why.
