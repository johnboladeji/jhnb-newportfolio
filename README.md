# JHNB — John B. Oladeji Portfolio

React + Vite + TypeScript + Tailwind CSS v4 + Framer Motion + Three.js, built from the blueprint.

## Run it

```bash
npm install
npm run dev      # local dev server at http://localhost:5173
npm run build    # production build in dist/
```

## Edit your content: `src/content.ts`

Everything visitors read lives in one file: logo, name, headline, rotating words, bio,
menu items, marquee, projects, articles, content design samples, About text, socials, resume, and contact settings.
Change it there; no component edits needed.

## Files to drop into `public/`

| File | What it's for |
| --- | --- |
| `hero-1.webp`, `hero-2.webp` | Hero cut-out photos that slide right → left. Listed in `hero.images` in `content.ts`. Added. |
| `resume.pdf` | Resume download button. Added. Set `resume.pdfUrl` to `""` in `content.ts` to hide the button. |
| `jhnb-icon.png` | Header logo, a 144px copy of `JHNB IDENTITY ICON wt BG.png`. Added. |
| `jhnb-wordmark.png` | 600px-wide copy of the wordmark. Not currently used. |
| `favicon.png` | Browser tab and home-screen icon. Added. |
| `writing/`, `John-B-Oladeji-Content-Design-Writing-Samples.pdf` | Content Design screenshots and the downloadable samples PDF. Added. |
| `work/caira/` | Caira case-study screens (`screen-*.webp`, status bars cropped) and logos. Added. |


## Turn on the contact form

Without setup, **SEND ENQUIRY** opens the visitor's email app addressed to `contact.email`.

To receive enquiries directly instead:

1. Create a free form at https://formspree.io and copy its endpoint.
2. Copy `.env.example` to `.env` and set `VITE_FORM_ENDPOINT=https://formspree.io/f/yourid`.
3. Restart `npm run dev`. On your host (Vercel, Netlify), add the same variable in project settings.

The form has sending, sent, and error states, plus a hidden spam trap.

## Structure

```
src/
  App.tsx                      layered single view (z-0 → z-50)
  index.css                    @theme tokens, fonts, selection, stroke text, marquee keyframes
  components/
    ParticleBackground.tsx     15k points, 530 dashed energy lines, bloom, pointer repulsion (z-0)
    HeroImage.tsx              photo slider: timer + mouse wheel, right → left (z-10)
    WarpPortrait.tsx           WebGL portrait; head, eyes and hand follow the cursor, idle glances + blinks
    InteractionFX.tsx          cursor follower, magnetic buttons, spotlight, click burst (z-70)
    RollText.tsx               letter-roll hover labels
    HeroContent.tsx            outlined "DESIGN WITH" + rotating word, every 4s (z-20)
    ScrambleText.tsx           random-letter scramble before settling
    TypewriterBio.tsx          word-by-word bio reveal, loop, glow, hover ripple
    Header.tsx                 social icons, morphing logo, View Me menu button (z-30)
    SocialIcon.tsx             inline SVG brand glyphs
    FooterMarquee.tsx          outlined infinite marquee + © / email line (z-30)
    InfoDrawer.tsx             spring side panel: menu, projects, about, writing, resume, contact (z-50)
    Works.tsx                  Selected Works list, covers, case-study view
    ReadingShell.tsx           shared shell for the Writing pages
    Articles.tsx               Writing ▸ Articles, linked to Medium (content: `articles`)
    ContentDesign.tsx          Writing ▸ Content Design samples (content: `writing` in content.ts)
    NexusStudy.tsx             NexusCore's rich case study + cover (content: `nexusStudy`)
    StudyKit.tsx               shared case-study chrome (chapter bar, chapters, lit words)
    TokenStudy.tsx             TokenForge's rich case study + cover (content: `tokenStudy`)
    ResumeSection.tsx          Resume page (content: `resume`)
    CairaStudy.tsx             Caira's rich case study + cover (content: `cairaStudy` in content.ts)
```

## Notes on the spec

- **Line width:** the blueprint's `linewidth: 0.005` is the old viewport-fraction unit. Current
  `LineMaterial` uses pixels, so it's set to 1px (same look). Change `LINE_WIDTH_PX` to adjust.
- **Root height:** uses `h-dvh` instead of `min-h-screen` so mobile browsers never show a scrollbar.
- **Contrast:** secondary/meta text and form placeholders use `cream/70` (not `/50`) to pass WCAG AA on
  both `#150600` and the `#4E1D09` drawer. Primary `#983A28` is used only as a fill and for the large
  rotating headline word; small accent text and hovers use tertiary `#FFD0A1`.
- **Reduced motion:** particles render one static frame; marquee, scramble, and transitions pause.
- **Drawer:** Escape closes it, focus is trapped while open, and returns to the trigger on close.
  VIEW ME opens the menu; VIEW PROJECTS (desktop hero) opens Projects; BACK goes to the menu.
- **Still to fill:** search `content.ts` for `TODO` (photo, links, years, posts, socials).
- **Page title and description:** edit the `<title>` and meta description in `index.html`.
