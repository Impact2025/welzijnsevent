import { loadEnv } from "../src/db/load-env.js";
loadEnv();

(async () => {
  const { db } = await import("../src/db/index.js");
  const { blogPosts } = await import("../src/db/schema.js");
  const { eq } = await import("drizzle-orm");

  const slug = "sociale-cohesie-versterken-met-een-evenement-6-aanpakken-die-werken";
  const rows = await db
    .select({
      id: blogPosts.id, slug: blogPosts.slug, status: blogPosts.status,
      title: blogPosts.title, content: blogPosts.content,
      metaTitle: blogPosts.metaTitle, metaDescription: blogPosts.metaDescription,
    })
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug));

  if (!rows.length) { console.log("POST NOT FOUND"); return; }
  const r = rows[0];
  const c = (r.content || "") as string;
  console.log("=== id:", r.id, "status:", r.status);
  console.log("=== title:", r.title);
  console.log("=== metaTitle:", r.metaTitle);
  console.log("=== content length:", c.length);
  console.log("=== has **Metadata**:", c.includes("**Metadata**"));
  console.log("=== has 'Focus keyword':", c.includes("Focus keyword"));
  console.log("=== has Veelgestelde vragen:", /veelgestelde vragen/i.test(c));
  console.log("=== has <a href in body:", /<a\s/.test(c));
  console.log("=== tail (last 700 chars) ===");
  console.log(c.slice(-700));
})().catch((e) => { console.error(e); process.exit(1); });
