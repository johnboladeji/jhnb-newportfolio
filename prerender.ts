import type { Plugin } from "vite";
import { about, articles, contact, hero, projects, site } from "./src/content";

/**
 * Build-time content for crawlers and link previews.
 *
 * The site renders with JavaScript, so a crawler fetching the bare HTML used to see only the title. This plugin
 * writes the real text (headline, bio, projects, articles, contact) into <div id="root"> as plain HTML, plus
 * share-preview meta tags. React replaces the root's contents when it mounts, so visitors never see it; it is
 * also visually hidden in case JavaScript is slow. Everything comes from src/content.ts, so it stays in sync.
 */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function headlineSentence() {
  const words = hero.rotatingWords.map((w) => w.toLowerCase());
  const lead = hero.headline.charAt(0) + hero.headline.slice(1).toLowerCase();
  return `${lead} ${words.slice(0, -1).join(", ")}, and ${words[words.length - 1]}`;
}

function bodyHtml() {
  const projectItems = projects
    .map((p) => `<li><a href="#/work/${esc(p.slug)}">${esc(p.name)}</a>: ${esc(p.type)}. ${esc(p.summary)}</li>`)
    .join("");
  const articleItems = articles.items
    .map((a) => `<li><a href="${esc(a.url)}">${esc(a.title)}</a> (${esc(a.date)}, ${esc(a.read)})</li>`)
    .join("");
  return `<div id="prerender" style="position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);border:0">
<header><p>${esc(site.fullName)} (JHNB). ${esc(hero.tagline.toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase()))}</p></header>
<main>
<h1>${esc(headlineSentence())}</h1>
<p>${esc(hero.bio)} ${esc(hero.bioSignoff)}</p>
<nav aria-label="Sections"><a href="#/work">Selected works</a> <a href="#/about">About me</a> <a href="#/writing/content-design">Content design</a> <a href="#/writing/articles">Articles</a> <a href="#/resume">Resume</a> <a href="#/contact">Let's work</a></nav>
<section><h2>About me</h2><p>${esc(about.headline)}</p></section>
<section><h2>Selected works</h2><ul>${projectItems}</ul></section>
<section><h2>Articles</h2><ul>${articleItems}</ul></section>
<section><h2>Let's work</h2><p><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></p></section>
</main>
</div>`;
}

function metaHtml() {
  const title = `${site.fullName} (JHNB) — ${site.role}`;
  const image = `${site.url}/og-image.png`;
  return [
    `<link rel="canonical" href="${esc(site.url)}/" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="JHNB" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(site.description)}" />`,
    `<meta property="og:url" content="${esc(site.url)}/" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(`${site.fullName}: ${headlineSentence()}`)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(site.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
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
