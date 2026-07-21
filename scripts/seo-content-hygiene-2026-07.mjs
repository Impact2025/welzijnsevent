// SEO content hygiene pass — 2026-07-21.
// Fixes found during a GSC audit: cross-contaminated posts from other agentos
// client projects, a leaked internal planning doc, and a truncated meta on an
// already page-1-ranking post.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
function loadEnv(p) {
  try {
    const t = readFileSync(p, "utf8");
    for (const l of t.split("\n")) {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}
loadEnv(join(root, ".env.local"));
loadEnv(join(root, ".env"));

const { neon } = await import("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

// 1. Unpublish off-topic / leaked content. Not deleted — set to draft so it
//    stays recoverable, just no longer live/indexable.
const toUnpublish = [
  "one-pager-optimaliseren-zo-val-je-op-als-interimmer", // wrong client (interim-professional content, not welzijn)
  "levensverhaal-vastleggen-voor-kleinkinderen-7-praktische-manieren-om-jouw-herinn", // wrong client (bewaardvoorjou.nl content)
  "plan-directe-antwoorden-toevoegen-aan-alle-28-paginas-bijeen", // leaked internal SEO planning note
];

for (const slug of toUnpublish) {
  const res = await sql`UPDATE blog_posts SET status = 'draft' WHERE slug = ${slug} RETURNING slug`;
  console.log(res.length ? `draft: ${slug}` : `NOT FOUND: ${slug}`);
}

// 2. Fix the truncated meta on organisatiebijdrage-meten: already ranks
//    position ~1.8 for its query but 0% CTR — the old meta_title was cut off
//    mid-word ("...& sli") and the description trailed off unfinished.
const fixedMeta = await sql`
  UPDATE blog_posts
  SET meta_title = 'Organisatiebijdrage meten: data & slimme KPI''s',
      meta_description = 'Meet de organisatiebijdrage van je welzijnsevenement met data en KPI''s, van aanmelding tot impactrapportage. Praktische aanpak plus gratis sjabloon.'
  WHERE slug = 'organisatiebijdrage-meten-zo-doe-je-dat-met-data-seo-amp-slimme-kpis'
  RETURNING slug`;
console.log(fixedMeta.length ? "meta fixed: organisatiebijdrage-meten..." : "NOT FOUND: organisatiebijdrage-meten...");

console.log("\nDone.");
