// Eenmalig: repareer het kapotte 'organisatiebijdrage-meten'-artikel in de
// Bijeen-DB. De AI had de echte HTML in een ```html ... ``` code-fence
// gewikkeld (toonde als code-block) + een "interne link suggesties"-sectie
// met verzonnen pagina-paden. We: (1) fence eraf, (2) link-suggesties-
// sectie eruit, (3) meta_title/description herstellen uit H1 + intro.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
function loadEnv(p) {
  try {
    const txt = readFileSync(p, "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}
loadEnv(join(root, ".env.local"));
loadEnv(join(root, ".env"));

const { neon } = await import("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

const slug = "organisatiebijdrage-meten-zo-doe-je-dat-met-data-seo-amp-slimme-kpis";
const rows = await sql`SELECT id, slug, content, meta_title, meta_description
  FROM blog_posts WHERE slug = ${slug}`;
const r = rows[0];
if (!r) { console.log("NIET GEVONDEN"); process.exit(0); }

let content = r.content || "";

// 1) Haal de ```html ... ``` (of ``` ... ```) code-fence eraf
content = content.replace(/^```[a-z]*\s*\n/i, "").replace(/\n```\s*$/, "").trim();

// 2) Verwijder de "interne link suggesties"-sectie (verzonnen pagina's)
//    <section id="link-suggesties"> ... </section>
content = content.replace(
  /<section[^>]*id=["']?link-suggesties["']?[^>]*>[\s\S]*?<\/section>/i,
  ""
).trim();

// 3) meta_title uit <h1>, meta_description uit eerste <p class="intro"> of <p>
const h1 = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
const title = h1 ? h1[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim() : (r.meta_title || "");
const introP = content.match(/<p[^>]*class=["']?intro["']?[^>]*>([\s\S]*?)<\/p>/i)
  || content.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
let desc = introP ? introP[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").replace(/&amp;/g, "&").trim() : "";
if (desc.length > 157) desc = desc.slice(0, 157).replace(/\s+\S*$/, "") + "…";

await sql`
  UPDATE blog_posts
  SET content = ${content},
      meta_title = ${title.slice(0, 60)},
      meta_description = ${desc}
  WHERE id = ${r.id}
`;

console.log("Gerepareerd:", r.slug);
console.log("  meta_title   :", title.slice(0, 60));
console.log("  meta_desc   :", desc.slice(0, 80) + "…");
console.log("  content len :", content.length, "(fence + link-suggesties verwijderd)");
console.log("  bevat nog '```':", content.includes("```"));
console.log("  bevat 'link-suggesties' sectie:", /id=["']?link-suggesties/i.test(content));
