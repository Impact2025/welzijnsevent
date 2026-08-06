/**
 * SEO-audit: inventariseer gepubliceerde blogposts + hun meta-velden.
 * Read-only. Draai met: npx tsx src/scripts/seo-audit.ts
 */
import { loadEnv } from "./load-env.js";

loadEnv();

async function main() {
  const { db } = await import("./index.js");
  const { blogPosts } = await import("./schema.js");
  const { desc } = await import("drizzle-orm");

  const posts = await db
    .select({
      slug: blogPosts.slug,
      title: blogPosts.title,
      status: blogPosts.status,
      metaTitle: blogPosts.metaTitle,
      metaDescription: blogPosts.metaDescription,
      excerpt: blogPosts.excerpt,
      publishedAt: blogPosts.publishedAt,
    })
    .from(blogPosts)
    .orderBy(desc(blogPosts.publishedAt));

  console.log(`Totaal: ${posts.length} posts\n`);
  for (const p of posts) {
    const mt = p.metaTitle ?? "(geen)";
    const md = p.metaDescription ?? p.excerpt ?? "(geen)";
    console.log(`[${p.status}] ${p.slug}`);
    console.log(`    title : ${p.title}`);
    console.log(`    mTitle: ${mt} (${mt.length})`);
    console.log(`    mDesc : ${md.slice(0, 170)} (${md.length})`);
    console.log("");
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
