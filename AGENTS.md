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

## Where things live

- `src/content.ts` — ALL visible text, links, and settings. Edit content here, not in components.
- `src/index.css` — fonts, colour tokens, selection colour, outlined-text classes, marquee keyframes.
- `index.html` — page title, meta description, Google Fonts link, favicon.
- `public/` — static files: `hero-1.webp` / `hero-2.webp` (hero slider cut-outs), `resume.pdf`,
  `jhnb-icon.png` (header logo), `jhnb-wordmark.png` (not currently used),
  `favicon.png`. Brand source files (`JHNB IDENTITY *.png`) and raw photos (`hero/`) also live here.
- `src/components/`
  - `ParticleBackground.tsx` — Three.js scene (z-0). Disposes everything on unmount.
  - `HeroImage.tsx` — cut-out photos sliding right → left (z-10). Skips any that fail to load.
  - `WarpPortrait.tsx` — WebGL portrait: head/eyes/hand follow the cursor (rig data in `hero.images[].rig`).
  - `InteractionFX.tsx`, `RollText.tsx` — cursor follower, magnetic buttons, spotlight, click burst, letter roll.
  - `HeroContent.tsx`, `ScrambleText.tsx`, `TypewriterBio.tsx` — headline and bio (z-20).
  - `Header.tsx` — social icons (left), morphing logo (centre), "View Me" menu button (right) (z-30).
  - `SocialIcon.tsx` — inline SVG brand glyphs used in the header.
  - `FooterMarquee.tsx` — outlined marquee plus the © / email footer line (z-30).
  - `InfoDrawer.tsx` — side drawer (z-50): menu (Home, Projects, About Me, Writing ▸ Content Design / Articles, Resume, Let's Work), sub-views, contact form.

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

Fonts: Anton (display), Space Grotesk (body), IBM Plex Mono (labels, buttons).

## Remaining TODOs

Search `src/content.ts` for `TODO`:

1. ~~Hero photos~~ Done: `public/hero-1.webp`, `public/hero-2.webp` (OpenCV GrabCut cut-outs of
   `public/hero/1791941132446.jpg.jpeg` and `public/hero/file_000000007e90823092fccefdafc9cc6e.png`).
2. ~~CV~~ Done: `public/resume.pdf`.
3. Links for Unelo, NexusCore, CARF, TokenForge (Caira already links to cairacare.com).
4. Missing years (`YEAR`) in resume roles.
5. Real GitHub, LinkedIn, X, Instagram and Google Scholar URLs (`socials`).
6. Real articles (`posts`) and content design samples (`contentDesign`).
7. Project types to match the JHNB rate card service lines.
8. Optional: set `VITE_FORM_ENDPOINT` in `.env` (see `.env.example`) so the form posts to
   Formspree instead of opening the visitor's email app.

## Rules for changes

- Keep content in `src/content.ts`; components should read from it.
- Keep accessibility intact: focus trap and Escape-to-close in the drawer, labelled form fields,
  `sr-only` text for animated headings, reduced-motion handling.
- No remote images in production; put assets in `public/`.
- Keep the page free of scrollbars on mobile (root uses `h-dvh`).
- Don't add new dependencies without saying why.
