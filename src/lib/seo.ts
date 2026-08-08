/**
 * De root layout (src/app/layout.tsx) hangt via `title.template` automatisch
 * " — Bijeen" achter elke pagina-title. Reken dat mee in Google's ~60-tekens
 * budget en voeg zelf GEEN merk-suffix meer toe — dat leidde eerder tot dubbele
 * branding in de rendered <title>, bijvoorbeeld "X | Bijeen — Bijeen".
 */
const TEMPLATE_SUFFIX_LENGTH = " — Bijeen".length;

export function truncateMetaTitle(title: string, maxLength = 60): string {
  // Strip een eventuele handmatige merk-suffix uit bestaande content/AI-output.
  const base = title.replace(/\s*[|—-]\s*Bijeen(\s+Kennisbank)?\s*$/i, "").trim();
  const budget = maxLength - TEMPLATE_SUFFIX_LENGTH;
  if (base.length <= budget) return base;
  return base.slice(0, budget).replace(/\s+\S*$/, "").replace(/[:,;.\-—]+$/, "").trim();
}

/**
 * Google knipt meta descriptions af rond ~155-160 tekens.
 */
export function truncateMetaDescription(description: string, maxLength = 155): string {
  if (description.length <= maxLength) return description;
  const cut = description.slice(0, maxLength - 1).replace(/\s+\S*$/, "").trim();
  return `${cut}…`;
}

/**
 * Keyword-kannibalisatie: meerdere blogartikelen die op dezelfde zoekintentie
 * mikken splitsen hun ranking-signalen. De duplicaten worden sinds augustus 2026
 * met een 301 naar het overgebleven artikel gestuurd (zie next.config.js, dat
 * dezelfde map inleest). De rel=canonical hieronder blijft als vangnet staan
 * voor het geval een URL de redirect omzeilt, bijvoorbeeld uit een oude cache.
 *
 * De map zelf staat in ./blog-canonical-map.js — bewust CommonJS, zodat
 * next.config.js hem óók kan inlezen.
 */
export {
  BLOG_CANONICAL_OVERRIDES,
  BLOG_TO_KENNISBANK_REDIRECTS,
  OFF_TOPIC_BLOG_SLUGS,
} from "./blog-canonical-map.js";

import {
  BLOG_CANONICAL_OVERRIDES as OVERRIDES,
  BLOG_TO_KENNISBANK_REDIRECTS as KB_REDIRECTS,
} from "./blog-canonical-map.js";

/** Slugs die naar een ander artikel wijzen; niet zelfstandig in sitemap/listing/RSS opnemen. */
export const canonicalizedAwayBlogSlugs = new Set([
  ...Object.keys(OVERRIDES),
  ...Object.keys(KB_REDIRECTS),
]);

/**
 * De content-automation levert af en toe een heel HTML-document af (met eigen
 * <article>/<header>/<title>/<meta>/<h1>) in plaats van een kale body-fragment.
 * De post-template rendert al zijn eigen <h1> (uit post.title) en zijn eigen
 * <title>/<meta name="description"> (uit generateMetadata) — een gelekte kopie
 * daarvan in de body geeft dubbele H1's en dubbele meta-tags op de live pagina.
 * Ontsmet daarom bij het opslaan, niet pas achteraf met een cleanup-script.
 */
export function sanitizeBlogContent(html: string): string {
  let out = html;
  out = out.replace(/<div class="meta-information"[^>]*>[\s\S]*?<\/div>\s*/i, "");
  out = out.replace(/<!--\s*Meta-(titel|description)[\s\S]*?-->\s*/gi, "");
  out = out.replace(/<title[^>]*>[\s\S]*?<\/title>\s*/gi, "");
  out = out.replace(/<meta[^>]*name=["'](title|description)["'][^>]*>\s*/gi, "");
  out = out.replace(/<h1[^>]*>[\s\S]*?<\/h1>\s*/i, "");
  out = out.replace(/<\/?article>\s*/gi, "");
  out = out.replace(/<header>\s*/gi, "").replace(/<\/header>\s*/gi, "");
  out = out.replace(/<\/?section>\s*/gi, "");
  return out.trim();
}
