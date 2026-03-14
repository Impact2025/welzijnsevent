import { MetadataRoute } from "next";
import { db, events } from "@/db";
import { eq, and, gte } from "drizzle-orm";

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

  return [...staticPages, ...eventPages];
}
