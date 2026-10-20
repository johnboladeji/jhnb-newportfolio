import type { Plugin } from "vite";
import { about, articles, contact, hero, projects, researchTeaching, resume, site, socials, worksHeadline, writing } from "./src/content";

/**
 * Build-time content for crawlers, link previews, and reader tools.
 *
 * The site renders with JavaScript, so a client that fetches the bare HTML (a link unfurler, a reader view, a search
 * engine's first pass) would see only the title. This plugin writes the site's real text into <div id="root"> as a
 * complete, visible, semantic page: headline, bio, About Me, Selected Works, Research & Teaching, Writing, Resume, and
 * contact, plus share-preview meta tags and schema.org Person data. Everything comes from src/content.ts.
 *
 * React replaces the root's contents when it mounts. So that visitors with JavaScript never see a flash of it, an
 * inline script marks the page `js`, which holds the static page invisible for a few seconds; if the app never
 * mounts (no JavaScript, or it failed), the static page then appears and is fully usable.
 */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Content markup (**bold**, *italic*, {variable}) as plain text
const plain = (s: string) => esc(s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/[{}]/g, ""));

function headlineSentence() {
  const words = hero.rotatingWords.map((w) => w.toLowerCase());
  const lead = hero.headline.charAt(0) + hero.headline.slice(1).toLowerCase();
  return `${lead} ${words.slice(0, -1).join(", ")}, and ${words[words.length - 1]}`;
}

const ext = (url: string, text: string) => `<a href="${esc(url)}" rel="noopener">${text}</a>`;

function bodyHtml() {
  const nav = [
    ["#/work", "Selected Works"],
    ["#/about", "About Me"],
    ["#/writing/content-design", "Content Design"],
    ["#/writing/articles", "Articles"],
    ["#/resume", "Resume"],
    ["#/contact", "Let’s Work"],
  ]
    .map(([href, label]) => `<a href="${href}">${label}</a>`)
    .join(" · ");

  const aboutPages = about.pages
    .map((p) => {
      const lead = "lead" in p && p.lead ? `<p><strong>${plain(p.lead)}</strong></p>` : "";
      return `<h3>${plain(p.title)}</h3>${lead}${p.body.map((b) => `<p>${plain(b)}</p>`).join("")}`;
    })
    .join("\n");
  const highlights = about.highlights.map((h) => `<li><strong>${plain(h.value)}</strong> ${plain(h.label)}</li>`).join("");

  const works = projects
    .map((p) => {
      const meta = [p.role, p.year].filter(Boolean).map(plain).join(", ");
      const live = p.url ? ` ${ext(p.url, `Visit ${plain(p.name)}`)}.` : "";
      return `<li><h3><a href="#/work/${esc(p.slug)}">${plain(p.name)}</a></h3><p><em>${plain(p.type)}</em>${meta ? ` (${meta})` : ""}. ${plain(p.summary)}${live}</p></li>`;
    })
    .join("\n");

  const roles = (items: { period: string; role: string; org: string; text: string }[]) =>
    items.map((t) => `<li><strong>${plain(t.role)}</strong>, ${plain(t.org)} (${plain(t.period)}). ${plain(t.text)}</li>`).join("");
  const talks = researchTeaching.presentations
    .map((t) => `<li>“${plain(t.title)}.” ${plain(t.venue)}, ${plain(t.year)}.</li>`)
    .join("");

  const samples = writing.samples
    .map((s) => `<li><a href="#/writing/content-design"><strong>${plain(s.title)}</strong></a> (${plain(s.kicker)}, ${plain(s.topic)}). ${plain(s.summary)}.</li>`)
    .join("");
  const articleItems = articles.items
    .map((a) => `<li>${ext(a.url, `<strong>${plain(a.title)}</strong>`)} (${plain(a.date)}, ${plain(a.read)}). ${plain(a.summary)}</li>`)
    .join("");

  const education = resume.education
    .map((e) => `<li>${plain(e.what)}, ${plain(e.where)} (${plain("note" in e && e.note ? e.note : e.year)})</li>`)
    .join("");
  const profiles = socials.map((s) => `<li>${ext(s.url, s.label)}</li>`).join("");

  return `<div id="prerender">
<header><p><a href="/"><strong>${esc(site.fullName)} (JHNB)</strong></a>. ${esc(site.role)}.</p><nav aria-label="Sections">${nav}</nav></header>
<main>
<h1>${esc(headlineSentence())}</h1>
<p>${plain(hero.bio)} <strong>${plain(hero.bioSignoff)}</strong></p>

<section><h2>About Me</h2>
<p><em>${plain(about.headline)}</em></p>
${aboutPages}
<h3>${plain(about.highlightsTitle)}</h3><ul>${highlights}</ul>
</section>

<section><h2>Selected Works</h2>
<p><em>${plain(worksHeadline)}</em></p>
<ul>${works}</ul>
</section>

<section><h2>${plain(researchTeaching.title)}</h2>
<p>${plain(researchTeaching.statement)}</p>
<h3>Teaching</h3><ul>${roles(researchTeaching.teaching)}</ul>
<h3>Research and editorial</h3><ul>${roles(researchTeaching.research)}</ul>
<h3>Presentations</h3><ul>${talks}</ul>
<p>M.A. thesis: <em>${plain(resume.research.thesis)}</em>. ${plain(resume.research.framework)}</p>
</section>

<section><h2>Writing</h2>
<h3>Content Design</h3>
<p><em>${plain(writing.headline)}</em></p>
${writing.intro.map((p) => `<p>${plain(p)}</p>`).join("")}
<ul>${samples}</ul>
<h3>Articles</h3>
<p>${plain(articles.intro)}</p>
<ul>${articleItems}</ul>
</section>

<section><h2>Resume</h2>
<p>${plain(resume.intro)}${resume.pdfUrl ? ` <a href="${esc(resume.pdfUrl)}">Download the CV (PDF)</a>.` : ""}</p>
<h3>Education</h3><ul>${education}</ul>
</section>

<section><h2>Let’s Work</h2>
<p>Email <a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>. ${plain(contact.replyTime)}</p>
<ul>${profiles}</ul>
</section>
</main>
<footer><p>© ${new Date().getFullYear()} ${esc(site.fullName)}. Just Hold No Bounds.</p></footer>
</div>`;
}

// The static page's own look (it shows only without JavaScript), and the hold that hides it while the app loads
const STYLE = `<style>
      #prerender{position:fixed;inset:0;overflow-y:auto;padding:2.5rem max(1.25rem,calc(50vw - 22rem)) 4rem;color:#f1e6ce;background:#150600;font:16px/1.65 "Space Grotesk",system-ui,sans-serif}
      #prerender h1{font:400 clamp(2.4rem,7vw,4rem)/1 Anton,Impact,sans-serif;text-transform:uppercase;margin:2rem 0 1rem;color:#f1e6ce}
      #prerender h2{font:400 2rem/1.1 Anton,Impact,sans-serif;text-transform:uppercase;margin:3rem 0 .75rem;color:#ffd0a1}
      #prerender h3{font-size:1.1rem;margin:1.5rem 0 .4rem}
      #prerender a{color:#ffd0a1}
      #prerender ul{padding-left:1.2rem}
      #prerender li{margin:.4rem 0}
      #prerender nav{font:13px/1.8 "IBM Plex Mono",monospace;margin-top:.5rem}
      .js #prerender{animation:jhnb-static 0s 4s both}
      @keyframes jhnb-static{from{visibility:hidden}to{visibility:visible}}
    </style>
    <script>document.documentElement.classList.add("js")</script>`;

function personJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.fullName,
    alternateName: "JHNB",
    url: `${site.url}/`,
    image: `${site.url}/og-image.png`,
    jobTitle: site.role,
    description: site.description,
    email: `mailto:${contact.email}`,
    sameAs: [...socials.map((s) => s.url), articles.profile.url],
    alumniOf: [{ "@type": "CollegeOrUniversity", name: "Ekiti State University" }],
    affiliation: { "@type": "CollegeOrUniversity", name: "New Mexico Highlands University" },
    knowsAbout: ["Product design", "Design engineering", "UX writing", "Content design", "Design systems", "Digital rhetoric"],
  };
  // Escape "<" so the JSON can't close the script element
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}

function metaHtml() {
  const title = `${site.fullName} (JHNB) — ${site.role}`;
  const image = `${site.url}/og-image.png`;
  return [
    `<link rel="canonical" href="${esc(site.url)}/" />`,
    `<meta name="robots" content="index, follow" />`,
    `<meta name="author" content="${esc(site.fullName)}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:site_name" content="JHNB" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(site.description)}" />`,
    `<meta property="og:url" content="${esc(site.url)}/" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(`${site.fullName}: ${headlineSentence()}`)}" />`,
    `<meta property="profile:first_name" content="John" />`,
    `<meta property="profile:last_name" content="Oladeji" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(site.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    personJsonLd(),
    STYLE,
  ].join("\n    ");
}

export default function prerenderContent(): Plugin {
  return {
    name: "jhnb-prerender-content",
    transformIndexHtml(html) {
      return html
        .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(site.description)}" />\n    ${metaHtml()}`)
        .replace('<div id="root"></div>', `<div id="root">${bodyHtml()}</div>`);
    },
  };
}
