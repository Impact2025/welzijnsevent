import { MetadataRoute } from "next";
import {
  db,
  events,
  blogPosts,
  knowledgeBaseArticles,
  knowledgeBaseCategories,
  volunteerVacancies,
} from "@/db";
import { eq, and, gte, desc } from "drizzle-orm";

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app").replace(/\/$/, "");

function isImageUrl(v: string | null | undefined): v is string {
  return !!v && !v.startsWith("color:");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Statische marketing pagina's ──────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                                 lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/ontdek`,                     lastModified: now, changeFrequency: "daily",   priority: 0.9 },
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
      .select({
        slug:        blogPosts.slug,
        publishedAt: blogPosts.publishedAt,
        updatedAt:   blogPosts.updatedAt,
        coverImage:  blogPosts.coverImage,
      })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .orderBy(desc(blogPosts.publishedAt));

    blogPages = posts.map(p => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: p.updatedAt ?? p.publishedAt ?? now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
      ...(isImageUrl(p.coverImage) ? { images: [p.coverImage] } : {}),
    }));
  } catch { /* sitemap werkt ook zonder DB tijdens build */ }

  // ── Kennisbank: categorieën + artikelen ───────────────────────────────────
  let kbPages: MetadataRoute.Sitemap = [];
  try {
    const cats = await db
      .select({ slug: knowledgeBaseCategories.slug, updatedAt: knowledgeBaseCategories.updatedAt })
      .from(knowledgeBaseCategories);

    const catPages: MetadataRoute.Sitemap = cats.map(c => ({
      url: `${BASE}/kennisbank/${c.slug}`,
      lastModified: c.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const articles = await db
      .select({
        articleSlug:  knowledgeBaseArticles.slug,
        updatedAt:    knowledgeBaseArticles.updatedAt,
        publishedAt:  knowledgeBaseArticles.publishedAt,
        categorySlug: knowledgeBaseCategories.slug,
        coverImage:   knowledgeBaseArticles.coverImage,
      })
      .from(knowledgeBaseArticles)
      .leftJoin(knowledgeBaseCategories, eq(knowledgeBaseArticles.categoryId, knowledgeBaseCategories.id))
      .where(eq(knowledgeBaseArticles.status, "published"))
      .orderBy(desc(knowledgeBaseArticles.publishedAt));

    const articlePages: MetadataRoute.Sitemap = articles
      .filter(a => a.categorySlug)
      .map(a => ({
        url: `${BASE}/kennisbank/${a.categorySlug}/${a.articleSlug}`,
        lastModified: a.updatedAt ?? a.publishedAt ?? now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
        ...(isImageUrl(a.coverImage) ? { images: [a.coverImage] } : {}),
      }));

    kbPages = [...catPages, ...articlePages];
  } catch { /* sitemap werkt ook zonder DB tijdens build */ }

  // ── Publieke evenementen + vrijwilligersvacatures ─────────────────────────
  let eventPages: MetadataRoute.Sitemap = [];
  let vacancyPages: MetadataRoute.Sitemap = [];
  try {
    const [publicEvents, openVacancies] = await Promise.all([
      db
        .select({
          id:         events.id,
          slug:       events.slug,
          updatedAt:  events.updatedAt,
          coverImage: events.coverImage,
        })
        .from(events)
        .where(and(eq(events.isPublic, true), gte(events.endsAt, now))),
      // Open vacatures voor publieke aankomende events
      db
        .select({
          id:        volunteerVacancies.id,
          eventSlug: events.slug,
          updatedAt: volunteerVacancies.updatedAt,
        })
        .from(volunteerVacancies)
        .innerJoin(events, eq(volunteerVacancies.eventId, events.id))
        .where(and(
          eq(volunteerVacancies.status, "open"),
          eq(events.isPublic, true),
          gte(events.endsAt, now),
        )),
    ]);

    // Alleen /vacatures-subpagina opnemen als er ook echt vacatures zijn
    const slugsWithVacancies = new Set(
      openVacancies.map(v => v.eventSlug).filter(Boolean) as string[]
    );

    eventPages = publicEvents
      .filter(e => e.slug)
      .flatMap(e => [
        {
          url: `${BASE}/e/${e.slug}`,
          lastModified: e.updatedAt ?? now,
          changeFrequency: "daily" as const,
          priority: 0.8,
          ...(isImageUrl(e.coverImage) ? { images: [e.coverImage] } : {}),
        },
        ...(slugsWithVacancies.has(e.slug!) ? [{
          url: `${BASE}/e/${e.slug}/vacatures`,
          lastModified: e.updatedAt ?? now,
          changeFrequency: "weekly" as const,
          priority: 0.65,
        }] : []),
      ]);

    vacancyPages = openVacancies
      .filter(v => v.eventSlug)
      .map(v => ({
        url: `${BASE}/e/${v.eventSlug}/vacatures/${v.id}`,
        lastModified: v.updatedAt ?? now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch { /* sitemap werkt ook zonder DB tijdens build */ }

  return [...staticPages, ...blogPages, ...kbPages, ...eventPages, ...vacancyPages];
}
