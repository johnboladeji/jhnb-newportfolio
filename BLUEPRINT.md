# Update Blueprint: JHNB Portfolio — John B. Oladeji

Act as an award-winning UI/UX designer and elite frontend web developer. Update the existing portfolio web application for **John B. Oladeji (JHNB)**, product designer, design engineer, and founder.

## 0. HOW TO USE THIS BLUEPRINT (read first)

*   **This project already exists.** Do not scaffold a new app, reinstall from scratch, or delete files. Read `AGENTS.md`, then compare the current code against this blueprint and change only what differs.
*   **All visible text lives in `src/content.ts`.** Components must read from it. Never hard-code names, copy, or links inside components.
*   **Colours live as tokens in `@theme` in `src/index.css`** (`base`, `primary`, `secondary`, `tertiary`, `cream`). Use the token classes (`bg-primary`, `text-cream`, etc.) rather than raw hex values in components.
*   **Never reintroduce any "Eathan" content** or the template's hero photo URL.
*   Run `npm run build` after changes. Ask before adding any new dependency.
*   When finished, list every file you changed and why.

================================================================================
1. DESIGN SYSTEM & AESTHETICS
================================================================================

### Color Palette (JHNB brand)
*   **Background (Dark Mode)** — token `base`: `#150600`
*   **Drawer Background (Secondary)** — token `secondary`: `#4E1D09`
*   **Highlight / Accent (Primary)** — token `primary`: `#983A28`
*   **Tertiary (focus, fine accents, small hover text)** — token `tertiary`: `#FFD0A1`
*   **Primary Text (Semantic)** — token `cream`: `#F1E6CE`
*   **Secondary Text / Meta**: `cream/70` (on `#150600`) and `cream/70` (in the drawer)
*   **Line / Energy Elements**: `#FFD0A1` (opacity 0.2)

### Contrast rules (measured, WCAG)
*   Primary `#983A28` as text fails: 2.81:1 on `#150600`, 1.98:1 on `#4E1D09`. Use primary only as a **fill** (buttons, logo mark, selection, particle glow) and for the large rotating headline word (owner's choice).
*   Small accent text, hovers, focus outlines, and active field borders use **tertiary** (13.98:1 on background, 9.84:1 in drawer).
*   Text placed on primary fills is **cream** (5.71:1). Never black (2.97:1).
*   Meta text at `cream/50` fails AA (4.49:1 on background, 3.93:1 in drawer), so use `cream/70`.

### Typography
Define the following CSS custom properties via Tailwind `@theme`:
*   **Display Font (`font-display`)**: `"Anton", "Impact", "Arial Black", sans-serif`
*   **Sans Font (`font-sans`)**: `"Space Grotesk", "Inter", system-ui, sans-serif`
*   **Mono Font (`font-mono`)**: `"IBM Plex Mono", "SFMono-Regular", Consolas, monospace`

**Selection Style**: 
Background: `#983A28`, Text: `#F1E6CE`.

**Focus Style**: `outline: 2px solid #FFD0A1; outline-offset: 3px` on `:focus-visible`.

================================================================================
2. LAYOUT & HIERARCHY
================================================================================

The application relies on a single-view React `App.tsx` utilizing a layered z-index strategy. The root wrapper is exactly one viewport tall: `h-screen` (100vh) refined to `h-dvh` where supported, with no min-height, plus `overflow-hidden`, `flex-col` and `bg-base`. `html`/`body` are `overflow: hidden`, so the landing page never scrolls; the drawer scrolls internally.

### Z-Index Layers:
*   `z-0`: `ParticleBackground` (Three.js WebGL canvas).
*   `z-10`: `HeroImage` (Large, absolute-positioned cut-out portrait of John at the bottom).
*   `z-20`: `HeroContent` (Typography and bio text, centered and responsive).
*   `z-30`: `Header` and `FooterMarquee` (Sticky overlays).
*   `z-50`: `InfoDrawer` (Sliding side panel).

================================================================================
3. COMPONENT SPECIFICATIONS
================================================================================

### 3.1. ParticleBackground (Three.js WebGL)
*   **Setup**: Full-screen fixed canvas (`z-0`), `pointer-events-none`. Scene background `0x150600`.
*   **Particles**: `15,000` points using `PointsMaterial`. Additive blending, size `0.5`, opacity `0.35`. Resting colour is secondary × 0.34 (dimmer than the original secondary × 0.2, owner's request) so the field sits quietly in the base colour.
*   **Lines**: `530` energy lines moving forward in Z-space, using `LineMaterial` with `LineSegments2`, color `0xa8603f` (deep warm brown), opacity `0.06`, dashed `true`. Dimmed twice by the owner so the lines are a faint haze on the base colour. Linewidth is **1px** (current `LineMaterial` measures in pixels; the legacy `0.005` value renders invisible).
*   **Post-processing**: `EffectComposer` with `RenderPass`, `UnrealBloomPass` (threshold 1.0, strength 0.8, radius 0.1), and `OutputPass`.
*   **Interaction**: On mouse move, calculate 3D pointer intersection. 
    *   **Effect**: The pointer is eased (`0.18` per frame) so the field trails the mouse smoothly. Particles within `32` units are repulsed (force `0.06`) and swirled around the cursor (tangential force `0.035`). Their colour flares toward primary × 2.6 (bright enough to catch the bloom), at a max mix of `1`, rising fast and fading slowly so the cursor leaves a glowing wake.
    *   Spring force returns them to original positions.
*   **Reduced motion**: render one static frame when `prefers-reduced-motion: reduce`.

### 3.2. Header
*   **Layout**: three-column grid. Social icons at left, logo in the centre, menu button at right.
*   **Social icons** (top-left): GitHub, LinkedIn, X, Instagram, Google Scholar, as 32px (36px from `lg`) round chips with 16px (19px from `lg`) solid glyphs in `cream/80`. Hover/focus fills the chip `tertiary` with a `base` glyph. From `md` they show as a row. Below `md` they collapse into one share button: a mouse hover or a tap opens a vertical pill list (staggered drop-in), the button turns into a peach ✕, and an outside tap or Escape closes it.
*   **Logo** (centre): "J." icon image (`/jhnb-icon.png`, a 144px copy of `JHNB IDENTITY ICON wt BG.png`, shown at 36px / 40px from `sm` / 48px from `lg`), falling back to "JHNB" text (`font-display`, uppercase, tracking-widest) if the image is missing. No ✦ circle (removed by the owner). On hover or keyboard focus, the icon spins and shrinks away while the full wordmark (`/jhnb-wordmark.png`, at 60% of the icon's height so its J matches the icon's "J." exactly) wipes open from the centre (clip-path). Link label: "John B. Oladeji — home".
*   **Menu button** (top-right): a pill with a "VIEW ME" caption (`menuButtonLabel`) and a `bg-primary` circle holding a three-line hamburger. The caption rolls forward (left → right) on a loop, faster on hover, and stops under reduced motion. On hover the hamburger lines shift and the short middle line extends. Opens the drawer on the menu view. Hover/focus fills the whole pill `tertiary` and turns the caption `base`.

### 3.3. Hero Content (Typography & Bio)
*   **Position**: Flex-1 container, relative `z-20`. Below `lg`: headline and bio stacked and centred above the photo. From `lg`: headline, a "PRODUCT DESIGNER · DESIGN ENGINEER · RHETORIC SCHOLAR" tagline (`hero.tagline`; uppercase, no icon; `tertiary` medium-weight mono; always a single line (`whitespace-nowrap`), sized `clamp(10.5px, 1.05vw, 15px)` so it never reaches the face, with a dark text halo where it crosses photo 2's raised hand) and a cream "VIEW PROJECTS →" pill (opens Projects) sit at left-centre. The bio (right-aligned) sits at bottom-right, above the footer marquee. There is no footnote under it. The photo sits between them. No text may cover the face.
*   **Mammoth Headline** (`<h1>`): left-aligned from `lg`. Optical alignment: both lines carry `-ml-[0.03em]` to cancel Anton\'s left side-bearing, so their ink starts on the same edge as the tagline and button. The outlined line also carries `-mr-[0.08em]` to cancel its trailing letter-spacing, so it centres truly on mobile.
    *   Top line: "DESIGN WITH" - Transparent text with a cream stroke (`-webkit-text-stroke: 1px #F1E6CE`, 1.5px from `md`, 2px from `xl`). Sizes `21px` → `36px` (sm), `52px` (md), `47px` (lg), `66px` (xl), `78px` (2xl).
    *   Bottom line: Rotates between "RHETORIC", "CULTURE", "CODE" every 4 seconds. Solid `#983A28` text. Sizes `60px` → `104px` (sm), `144px` (md), `104px` (lg), `160px` (xl), `190px` (2xl). Uses a custom React `ScrambleText` effect cycling random uppercase characters before settling on the target word. Include the real word in `sr-only` text for screen readers.
*   **Typewriter Bio**: 
    *   Text: `hero.bio` in `content.ts` (a short bio beginning "I’m John-B — a Nigerian-born product designer…"), then `hero.bioSignoff` ("— Just Hold No Bounds.") always on its own line, semibold `tertiary`.
    *   Animation: Framer Motion staggering effect (`delay: index * min(0.02, 6 / length)`, `duration: 0.05` per character, so a long bio finishes typing in about 6s). The entire bio remounts and re-animates once typing has finished plus an 8s hold, via a shifting React `key`. Under reduced motion it shows as plain static text. Group characters by word so lines only break at spaces. Full text in `aria-label`.
    *   Style: full-strength `cream` (15:1 on `base`), medium weight, `13px` → `14px` from `sm`, with a soft dark text-shadow halo for legibility over particles and photo edges. No background container. Centred below `lg`; right-aligned in a `19rem` (lg) / `22rem` (xl) column from `lg`. Below `md` the body is clamped to three lines (`line-clamp-3`), with the sign-off still shown and a "VIEW MORE →" pill (`hero.viewMoreLabel`) underneath that opens the About Me panel. The pill stays hidden (keeping its space, so the photo doesn't jump) until the sign-off finishes typing the first time, then fades up; it stays visible through later replays. The full text stays in `aria-label`.

### 3.4. Hero Image (Subject Cut-out Slider)
*   **Assets**: `/hero-1.webp` and `/hero-2.webp` in `public/`: transparent close-up cut-outs of John, uniform top to bottom (no faded base). The owner preferred these crisp-edged cut-outs over a feathered/edge-darkened version, which was tried and reverted.
*   **Transition**: Every `hero.imageIntervalSec` (6s) the next photo slides in from the right while the current one slides out to the left (Framer Motion, `x: 60% → 0 → -60%` with opacity, 1.2s). The mouse wheel drives it too: scroll down = next (right → left), scroll up = previous (left → right). A swipe must travel 40px, then input pauses 900ms so one gesture moves one photo. Wheel events inside the drawer are ignored. Any change restarts the timer. Under reduced motion: crossfade only.
*   **Position**: Absolute bottom, centred horizontally (`left-1/2 -translate-x-1/2`); from `xl` shifted to `left-[56%]` to give the larger headline room. `z-10`.
*   **Sizing**: The photo always runs off the bottom of the page, so the base is cropped by the page edge rather than faded. Below `lg`: the top starts under the text (`--hero-text-bottom`, published by `HeroContent` via ResizeObserver), with height `1.2×` the space left and `bottom` at `-0.2×`. `lg`: `80%` height, flush bottom. `xl`: `103.5%` height, `bottom: -13.5%` (15% larger, same head position).
*   **Rendering & motion** (`WarpPortrait.tsx`): each photo is drawn in WebGL (Three.js) through a deformation shader. The head, eyes and the raised hand (photo 2) turn toward the cursor without slicing the image: each fragment samples a displaced coordinate (inverse mapping) with soft elliptical falloffs, so there are no seams. The head rolls up to ~3.4° about a neck pivot and shifts a few px toward the cursor. Irises glide within the eye opening (≤32% of eye radius). The hand swings about the wrist. Spring rates make the eyes lead (16/s), the head follow (5/s) and the hand lag (3.5/s). When the pointer is idle (2.5s) or on touch screens, the eyes make random saccades every 1–3s. The figure blinks (140ms, every 3–7s) and has a barely-visible breathing sway. Per-photo rig data (head oval, neck pivot, iris centres, eye radius, hand oval + wrist) lives in `hero.images[].rig` in image pixels. The black-and-white + `#e2a77f` multiply tone (raw sRGB), brightness .9 and contrast 1.25 are applied in the shader. Hover lens: with a mouse over the photo, a soft circle (radius 20% of the image width, feathered from 55%) follows the cursor with a slight glide; inside it the warm tone drops to pure black & white. It eases in on hover and out on leave, and is measured in on-screen pixels so it stays exactly under the cursor while the figure moves. Reduced motion: one static un-warped frame. No WebGL: an `<img>` with CSS grayscale + masked multiply overlay. No drop shadow.
*   **Animation**: Subtle scale up (`scale-[1.04]`) with a 700ms ease-out transition on hover, origin bottom center.

### 3.5. Footer Marquee
*   **Content**: "JHNB - JUST HOLD NO BOUNDS // JHNB - JUST HOLD NO BOUNDS //"
*   **Footer line**: laid over the bottom of the marquee: "© {current year} John B. Oladeji" at left and a `mailto:` link to `contact.email` at right (`cream/70` 11px mono, hover `tertiary`). Stacked and centred below `sm`.
*   **Style**: Ultra-large transparent text with a thin cream stroke (`-webkit-text-stroke: 1px rgba(241,230,206,0.15)`). Positioned absolutely at the bottom edge. Infinite CSS translate keyframe animation, paused under reduced motion. Include an `sr-only` `<h2>`: "John B. Oladeji, Product Designer & Design Engineer".

### 3.6. InfoDrawer (Side Menu)
*   **Animation**: Slides in from the right using Framer Motion (`x: '100%'` to `0`, spring physics). Backdrop `bg-base/75`, click to close.
*   **Design**: Width `sm:max-w-xl md:max-w-2xl`. Background `bg-secondary`. Border left `border-cream/5`.
*   **Portraits** (`DrawerPortraits.tsx`): the full studio photos (backgrounds kept) `/menu-1.webp` and `/menu-2.webp` (`drawerImages`) in a fill container on the panel's right side.
    *   **Frame:** it runs the panel's full height, from behind the top bar to the bottom edge. The top bar has no fill at all; it sits outside the drawer's scroller, so content scrolls below it, never under it. Its width is `min(58%, 0.78 × 100dvh)` (68% on phones). The photos are ~0.8 wide-to-tall, so `object-cover` only ever trims the sides, and the whole figure, head to feet, is always visible.
    *   **Motion:** the photos take turns sliding right → left inside the frame every 6s (crossfade under reduced motion).
    *   **Toning:** grayscale, `brightness-115`, `contrast-[0.85]` and `mix-blend-luminosity`, so the panel's brown supplies the colour. The left half fades out; top and bottom run to the panel edges.
    *   **Opacity:** set on the image itself (the wrapper must not create a stacking context, or the blend breaks): 95% on the menu (55% on phones), 32% behind other views (22% on phones). Menu items carry a soft dark text halo.
*   **Accessibility**: `role="dialog"`, `aria-modal`, focus moves to close button on open, focus trapped while open, Escape closes, focus returns to the trigger.
*   **Structure**: 
    *   Top bar (no fill, a hairline bottom border, fixed above the scrolling content) with a close button, a full-screen toggle on content views, and a dynamic back/menu button.
    *   Main menu (from `menu` in `content.ts`): "Home", "Projects", "About Me", "Writing" (expands to "Content Design" and "Articles"), "Resume", "Let's Work". Large bold Space Grotesk (`text-[2.5rem]`, `sm:text-6xl`), cream, items stagger in. Three distinct states: **hover** = peach `tertiary` text + slide right + letter roll; **current/selected** (Home = current page, Writing when open) = coral `primary-soft` text (`#F0937A`, a light tint of primary; 6.1:1 on the drawer) plus a thick `primary` bar under the label and a `primary` rule-and-dot marker; **pressed** = cream text, the `primary` bar flashes in, slight scale-down. Drawer buttons follow the same split: hover fills `tertiary`, pressed fills `primary` (submit: pressed fills `cream`).
    *   **SELECTED WORKS** (`Works.tsx`, data in `projects` in `content.ts`):
        *   **Header:** like About Me, an outlined Anton "SELECTED WORKS" title with a coral headline typed continuously underneath (`TypeLoop`, text in `worksHeadline`): "Architecting ideas. Building experiences. Delivering impact." It centres in full screen. The page uses About Me's structure: the header is pinned, an "ALL WORK · 06 PROJECTS" rule sits under it (like About's tab bar), and only the list scrolls in its own segment. In full screen it spans the full width (no max-width), with the list in two columns on large displays.
        *   **List:** numbered rows (Caira, NexusCore, MOVA, CARF, Unelo, TokenForge). Each row has a big accent-coloured number, a rule that draws in on hover, the name and one-liner, and a 16:10 cover with a "VIEW CASE STUDY" pill on hover. Rows rise in on scroll.
        *   **Covers:** `project.cover` when set; otherwise a generated on-brand cover (warm dark field, a drifting accent glow, a dot grid, the project glyph, and the name in huge outlined Anton).
        *   **Case study** (`caseStudy` view, Back returns to the list): cover, Role / When / What-it-is facts (amber labels), the summary in the project accent with an amber rule, WHAT I DID (amber checks), optional OUTCOME, FOCUS tags, VISIT and START SOMETHING SIMILAR (opens Let's Work), and a NEXT PROJECT link.
        *   **Caira** has its own rich case study (`CairaStudy.tsx`, content in `cairaStudy`), in Caira's palette (Deep Night Sky, Terracotta, Ochre, Sage, Cream; Fraunces + Figtree). A sticky chapter bar shows scroll progress, the current chapter (09 in all) and jump dots. Hero: logo, status pill, rising headline "Far from home. Close to Mum.", an orbiting care circle that follows the cursor, and live "your time / Mum's time in Lagos" clocks. Then: the origin story (words light up as you scroll; set `origin` to null to hide it), facts, the challenge (a family group chat that plays out, then the Caira update; Replay), who it's for (animated routes US/UK/Canada → Nigeria, four role cards), four key decisions as stacked sticky cards with live visuals (RLS policy, 64px Reach My Family, 72-hour vote ring, voice-consent wave), the product (interactive four-tab bar, auto-playing onboarding phone, a tappable Elder Mode demo, a snap-scrolling setup-flow strip, a live 24-hour strip with quiet hours for the escalation engine), visual language (expanding swatches that copy their hex, type specimens, "Emergency" struck out for "Reach My Family"), The thinking (rhetoric and engineering; collapsed by default), where it stands (stage track, shipped / next), lessons with a Care. Together. marquee, and the CTAs. The Selected Works card uses a matching Caira cover with phones. Everything is static under reduced motion.
        *   **Copy:** facts from the CV only; unknowns are TODOs in `content.ts`.
    *   **CONTENT DESIGN**: `contentDesign` from `content.ts` ("on the way" message while empty).
    *   **ARTICLES**: `posts` from `content.ts`.
    *   **ABOUT** (`AboutSection.tsx` + `AboutDeck.tsx` + `ExperienceList.tsx`): fills exactly the height under the drawer bar; the outer drawer doesn't scroll, only the two segments do, each independently.
        *   **Header (never moves):** the "ABOUT ME" title as outlined cream (`.text-stroke`), then `about.headline` ("Design is rhetoric you can touch. The interface makes an argument about who belongs.") in coral `primary-soft`, typed continuously by `TypeLoop` (holds the full line 7s before erasing; 28px in the drawer, 41.6px centred in full screen). The title always sits top-left; in full screen only the headline is centred.
        *   **Segments:** Overview and Experience. In the drawer they are tabs (amber labels with icons; the selected tab is coral with a `primary` bar that glides between tabs; arrow keys switch). Full screen on a ≥1024px display: side by side, two columns.
        *   **Overview:** a sideways deck of 7 unfilled pages: the 5 `about.pages`, an "At a glance" highlights grid and a closing page with the sign-off, LET'S WORK and socials. The copy continues the hero bio rather than repeating it. Page 1 opens with the lead line "I build software that takes culture seriously." (bold cream, larger, amber rule), right after the hero bio and the About headline.
            *   Each page is sticky at left 0, so the next page slides over and the covered page drifts back and fades out completely (no text-on-text without a fill).
            *   Kickers have an icon that pops each time its page becomes current; highlight values count in with a stagger. Snap points sit on static markers.
            *   Input: wheel (one notch = one page), swipe, arrows/Page/Home/End and prev/next buttons. The progress bar runs amber → coral.
        *   **Experience** (`experience` in `content.ts`): a vertical timeline. The spine draws itself in. Each role has an icon node (amber; it fills amber on hover) and a coral live-pulse when current. Dates are amber mono, roles peach bold, organisations dimmed cream. Rows rise into view as their own scroller reaches them.
        *   **Colour roles (all distinct):** title outlined cream · headline coral `primary-soft` · labels/kickers/dates amber (`--color-amber: #F2A65A`, 6.9:1 on secondary) · page and role titles peach `tertiary` · body cream · highlight values coral.
        *   **Scrollbars:** segments use slim amber scrollbars (`.fx-scroll`). Reduced motion: no depth/fade, no pops, static headline.
    *   **Full screen:** content views (not the menu) get an expand/collapse button next to Close (hidden on phones, where the drawer is already full width). It animates the panel's max-width to 100vw. Other views centre in `max-w-5xl`. It resets when the drawer closes.
    *   **RESUME**: roles from `content.ts` (NMHU instructor and graduate assistant, OYNA lead instructor, GRAMEF creative lead) plus a "DOWNLOAD RESUME (PDF)" button linking to `/resume.pdf` (hidden if `pdfUrl` is empty).
    *   **Contact Form ("LET'S WORK")**:
        *   Fields: Name, Email, Project type, Budget, About the project. All labelled.
        *   Input fields and textareas have transparent backgrounds, bottom `cream/40` borders, and focus states that change border to `#FFD0A1`.
        *   Custom Select element with options having `bg-secondary`.
        *   Solid `#983A28` submit button with `#F1E6CE` text.
        *   Submits to `VITE_FORM_ENDPOINT` (Formspree) if set; otherwise opens a prefilled email to `johnboladeji@gmail.com`. Sending, sent, and error states, plus a hidden honeypot field.
        *   **Skill capsules** (`SkillCapsules.tsx`, `skills` in `content.ts`, uses `matter-js`): under the form, a "WHAT I CAN HELP WITH" pit.
            *   The skills rain in as brand-coloured pill bodies (staggered 140ms, random x and tilt) and pile up with real physics: bounce, friction, rotation.
            *   Grab and fling any capsule (spring constraint). DROP AGAIN re-runs the rain.
            *   The simulation starts when the pit scrolls into view, pauses off-screen or in hidden tabs, keeps its walls on resize, and is torn down on unmount.
            *   The capsules are a real list for screen readers. Under reduced motion they become a static wrapped list.

### 3.8. Hover states (all interactive elements)
*   Hover changes must be clearly visible, using only palette colours with strong contrast:
    *   Icon chips, outline buttons and the menu pill fill `tertiary` with `base` text/glyph (≈14:1).
    *   The cream "VIEW PROJECTS" pill flips to `primary` with `cream` text (5.71:1).
    *   The primary submit button flips to `tertiary` with `base` text.
    *   Text links turn `tertiary` and gain a 2px underline. Drawer menu items turn `tertiary` and slide right.

### 3.9. Interaction FX (`InteractionFX.tsx`, `RollText.tsx`, styles in `index.css`)
*   Mouse/trackpad only (`pointer: fine`), all disabled under reduced motion; one set of delegated listeners for the whole page.
*   **Cursor follower**: a 6px peach dot plus a 34px ring that trails it (eased). Over any link, button or field the ring swells to 64px with a faint peach fill, and it shrinks while pressed. The system cursor stays visible.
*   **Magnetic**: elements with `data-magnetic="<strength>"` lean toward the pointer (CSS `translate`) and spring back. Used on the social chips, share toggle, logo, View Me, View Projects, View More, footer email, drawer close, resume download and submit.
*   **Spotlight**: `.fx-spotlight` buttons show a soft light that follows the pointer inside them.
*   **Click burst**: a peach ring expands from the click point on links and buttons.
*   **Letter roll** (`RollText`): on hover each letter slides up and a copy rolls in from below, staggered 18ms. Used on drawer menu items and sub-items, View Projects, View More, Download Resume and Send Enquiry. Screen readers get the plain text once.

================================================================================
4. TECHNICAL & ARCHITECTURE REQUIREMENTS
================================================================================

*   **Dependencies**: `react`, `framer-motion`, `lucide-react`, `three`, `tailwindcss` (v4 with `@tailwindcss/vite`), `vite` 6.4.4 or later.
*   **Responsiveness**: 100% fluid scaling across mobile, tablet, and desktop breakpoints. Rely on Tailwind's arbitrary values and percentage heights for absolute scaling without scrollbars.
*   **Performance**: Avoid memory leaks in Three.js by properly disposing of geometry, materials, composer, and renderer in the component cleanup function (`useEffect` return).
*   **Accessibility**: Ensure button elements have proper roles, images contain descriptive `alt` tags (`alt="John B. Oladeji"`), and the color contrast on text meets WCAG AA (high-opacity cream `#F1E6CE` against the `#150600` backdrop; follow the contrast rules in section 1).
*   **SEO**: Maintain semantic HTML (proper `<main>`, `<h1>`, `<h2>` tag hierarchies). Page title: "John B. Oladeji (JHNB) — Product Designer & Design Engineer". `theme-color`: `#150600`.
