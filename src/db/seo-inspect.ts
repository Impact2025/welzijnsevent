/**
 * Toont titel, meta en kopstructuur van één artikel (kennisbank of blog),
 * plus of bepaalde zoektermen überhaupt in de tekst voorkomen.
 *
 *   npx tsx src/db/seo-inspect.ts <slug> [term...]
 */
import { loadEnv } from "./load-env.js";

loadEnv();

async function main() {
  const [slug, ...terms] = process.argv.slice(2);
  if (!slug) { console.error("Geef een slug op."); process.exit(1); }

  const { db } = await import("./index.js");
  const { blogPosts, knowledgeBaseArticles } = await import("./schema.js");
  const { eq } = await import("drizzle-orm");

  const [kb] = await db.select().from(knowledgeBaseArticles).where(eq(knowledgeBaseArticles.slug, slug));
  const [bp] = kb ? [] : await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
  const a = kb ?? bp;
  if (!a) { console.error(`Niet gevonden: ${slug}`); process.exit(1); }

  console.log(`bron        : ${kb ? "kennisbank" : "blog"}`);
  console.log(`status      : ${a.status}`);
  console.log(`title       : ${a.title}`);
  console.log(`metaTitle   : ${a.metaTitle ?? "-"}`);
  console.log(`metaDesc    : ${a.metaDescription ?? "-"}`);
  console.log(`excerpt     : ${a.excerpt ?? "-"}`);

  const html = a.content ?? "";
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  console.log(`woorden     : ${text.trim().split(/\s+/).filter(Boolean).length}`);

  console.log("\nkoppen:");
  for (const m of Array.from(html.matchAll(/<(h[1-4])[^>]*>([\s\S]*?)<\/\1>/gi))) {
    console.log(`  ${m[1]}  ${m[2].replace(/<[^>]+>/g, "").trim()}`);
  }

  if (terms.length) {
    console.log("\ntermdekking (titel + meta + body):");
    const haystack = `${a.title} ${a.metaTitle ?? ""} ${a.metaDescription ?? ""} ${a.excerpt ?? ""} ${text}`.toLowerCase();
    for (const t of terms) {
      const n = haystack.split(t.toLowerCase()).length - 1;
      console.log(`  ${n > 0 ? "✓" : "✗"} ${n.toString().padStart(3)}x  ${t}`);
    }
  }

  if (a.internalLinks?.length) {
    console.log("\ninterne links:");
    for (const l of a.internalLinks) console.log(`  ${l.href}  —  ${l.text}`);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
