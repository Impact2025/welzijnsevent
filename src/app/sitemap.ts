import { MetadataRoute } from "next";
import { db, events, blogPosts, knowledgeBaseArticles, knowledgeBaseCategories } from "@/db";
import { eq, and, gte, desc } from "drizzle-orm";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.nl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Statische marketing pagina's
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/functies`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/over-ons`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/prijzen`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/kennisbank`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacyverklaring`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/verwerkersovereenkomst`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Blog posts
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await db
      .select({ slug: blogPosts.slug, publishedAt: blogPosts.publishedAt, updatedAt: blogPosts.updatedAt })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .orderBy(desc(blogPosts.publishedAt));

    blogPages = posts.map(p => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt ?? now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }));
  } catch {
    // Sitemap werkt ook zonder DB toegang tijdens build
  }

  // Kennisbank pagina's
  let kbPages: MetadataRoute.Sitemap = [];
  try {
    const articles = await db
      .select({
        slug:        knowledgeBaseArticles.slug,
        updatedAt:   knowledgeBaseArticles.updatedAt,
        categorySlug: knowledgeBaseCategories.slug,
      })
      .from(knowledgeBaseArticles)
      .leftJoin(knowledgeBaseCategories, eq(knowledgeBaseArticles.categoryId, knowledgeBaseCategories.id))
      .where(eq(knowledgeBaseArticles.status, "published"));

    kbPages = [
      { url: `${BASE_URL}/kennisbank`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
      ...articles
        .filter(a => a.categorySlug)
        .map(a => ({
          url: `${BASE_URL}/kennisbank/${a.categorySlug}/${a.slug}`,
          lastModified: a.updatedAt ?? now,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        })),
    ];
  } catch {
    // Sitemap werkt ook zonder DB toegang tijdens build
  }

  // Publieke evenementpagina's
  let eventPages: MetadataRoute.Sitemap = [];
  try {
    const publicEvents = await db
      .select({ slug: events.slug, endsAt: events.endsAt, updatedAt: events.updatedAt })
      .from(events)
      .where(and(eq(events.isPublic, true), gte(events.endsAt, now)));

    eventPages = publicEvents
      .filter((e) => e.slug)
      .map((e) => ({
        url: `${BASE_URL}/e/${e.slug}`,
        lastModified: e.updatedAt ?? now,
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));
  } catch {
    // Sitemap werkt ook zonder DB toegang tijdens build
  }

  return [...staticPages, ...blogPages, ...kbPages, ...eventPages];
}
