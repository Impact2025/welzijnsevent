import { MetadataRoute } from "next";
import { db, events, blogPosts, knowledgeBaseArticles, knowledgeBaseCategories } from "@/db";
import { eq, and, gte, desc } from "drizzle-orm";

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Statische marketing pagina's ──────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                                 lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/functies`,                   lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/prijzen`,                    lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/over-ons`,                   lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/faq`,                        lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/demo`,                       lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/gratis-impactrapport`,       lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/blog`,                       lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/kennisbank`,                 lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/privacyverklaring`,          lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/verwerkersovereenkomst`,     lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  // ── Blog posts ────────────────────────────────────────────────────────────
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await db
      .select({ slug: blogPosts.slug, publishedAt: blogPosts.publishedAt, updatedAt: blogPosts.updatedAt })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .orderBy(desc(blogPosts.publishedAt));

    blogPages = posts.map(p => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: p.updatedAt ?? now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }));
  } catch { /* sitemap werkt ook zonder DB tijdens build */ }

  // ── Kennisbank: categorieën + artikelen ────────────────────────────────────
  let kbPages: MetadataRoute.Sitemap = [];
  try {
    // Categoriepagina's
    const cats = await db
      .select({ slug: knowledgeBaseCategories.slug, updatedAt: knowledgeBaseCategories.updatedAt })
      .from(knowledgeBaseCategories);

    const catPages: MetadataRoute.Sitemap = cats.map(c => ({
      url: `${BASE}/kennisbank/${c.slug}`,
      lastModified: c.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Artikelen met categorieslug via join
    const articles = await db
      .select({
        articleSlug:  knowledgeBaseArticles.slug,
        updatedAt:    knowledgeBaseArticles.updatedAt,
        publishedAt:  knowledgeBaseArticles.publishedAt,
        categorySlug: knowledgeBaseCategories.slug,
      })
      .from(knowledgeBaseArticles)
      .leftJoin(knowledgeBaseCategories, eq(knowledgeBaseArticles.categoryId, knowledgeBaseCategories.id))
      .where(eq(knowledgeBaseArticles.status, "published"))
      .orderBy(desc(knowledgeBaseArticles.publishedAt));

    const articlePages: MetadataRoute.Sitemap = articles
      .filter(a => a.categorySlug)
      .map(a => ({
        url: `${BASE}/kennisbank/${a.categorySlug}/${a.articleSlug}`,
        lastModified: a.updatedAt ?? now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));

    kbPages = [...catPages, ...articlePages];
  } catch { /* sitemap werkt ook zonder DB tijdens build */ }

  // ── Publieke evenementen ──────────────────────────────────────────────────
  let eventPages: MetadataRoute.Sitemap = [];
  try {
    const publicEvents = await db
      .select({ slug: events.slug, updatedAt: events.updatedAt })
      .from(events)
      .where(and(eq(events.isPublic, true), gte(events.endsAt, now)));

    eventPages = publicEvents
      .filter(e => e.slug)
      .map(e => ({
        url: `${BASE}/e/${e.slug}`,
        lastModified: e.updatedAt ?? now,
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));
  } catch { /* sitemap werkt ook zonder DB tijdens build */ }

  return [...staticPages, ...blogPages, ...kbPages, ...eventPages];
}
