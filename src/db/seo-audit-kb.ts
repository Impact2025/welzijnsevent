/**
 * SEO-audit kennisbank: categorieën + artikelen met hun meta-velden.
 * Read-only. Draai met: npx tsx src/scripts/seo-audit-kb.ts
 */
import { loadEnv } from "./load-env.js";

loadEnv();

async function main() {
  const { db } = await import("./index.js");
  const { knowledgeBaseArticles, knowledgeBaseCategories } = await import("./schema.js");
  const { eq } = await import("drizzle-orm");

  const rows = await db
    .select({
      slug: knowledgeBaseArticles.slug,
      title: knowledgeBaseArticles.title,
      status: knowledgeBaseArticles.status,
      metaTitle: knowledgeBaseArticles.metaTitle,
      metaDescription: knowledgeBaseArticles.metaDescription,
      category: knowledgeBaseCategories.slug,
    })
    .from(knowledgeBaseArticles)
    .leftJoin(knowledgeBaseCategories, eq(knowledgeBaseArticles.categoryId, knowledgeBaseCategories.id));

  console.log(`Totaal: ${rows.length} kennisbank-artikelen\n`);
  for (const r of rows) {
    const mt = r.metaTitle ?? "(geen)";
    const md = r.metaDescription ?? "(geen)";
    console.log(`[${r.status}] ${r.category}/${r.slug}`);
    console.log(`    title : ${r.title}`);
    console.log(`    mTitle: ${mt} (${mt.length})`);
    console.log(`    mDesc : ${md.slice(0, 170)} (${md.length})`);
    console.log("");
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
