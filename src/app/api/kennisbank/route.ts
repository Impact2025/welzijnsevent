import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, knowledgeBaseArticles, knowledgeBaseCategories } from "@/db";
import { eq, desc, sql } from "drizzle-orm";

function slugify(str: string): string {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

function calcReadingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.email !== process.env.ADMIN_EMAIL) return null;
  return session;
}

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const articles = await db
      .select({
        id:          knowledgeBaseArticles.id,
        slug:        knowledgeBaseArticles.slug,
        title:       knowledgeBaseArticles.title,
        excerpt:     knowledgeBaseArticles.excerpt,
        status:      knowledgeBaseArticles.status,
        tags:        knowledgeBaseArticles.tags,
        readingTime: knowledgeBaseArticles.readingTime,
        helpfulCount:    knowledgeBaseArticles.helpfulCount,
        notHelpfulCount: knowledgeBaseArticles.notHelpfulCount,
        publishedAt: knowledgeBaseArticles.publishedAt,
        createdAt:   knowledgeBaseArticles.createdAt,
        updatedAt:   knowledgeBaseArticles.updatedAt,
        categoryId:  knowledgeBaseArticles.categoryId,
        categoryName: knowledgeBaseCategories.name,
        categorySlug: knowledgeBaseCategories.slug,
      })
      .from(knowledgeBaseArticles)
      .leftJoin(knowledgeBaseCategories, eq(knowledgeBaseArticles.categoryId, knowledgeBaseCategories.id))
      .orderBy(desc(knowledgeBaseArticles.createdAt));

    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const {
      title, content = "", excerpt, status = "draft",
      categoryId, tags = [], relatedArticles = [],
      metaTitle, metaDescription,
    } = body;

    if (!title?.trim()) return NextResponse.json({ error: "Titel is verplicht" }, { status: 422 });

    const baseSlug  = slugify(title);
    const existing  = await db.select({ slug: knowledgeBaseArticles.slug })
      .from(knowledgeBaseArticles)
      .where(sql`${knowledgeBaseArticles.slug} LIKE ${baseSlug + "%"}`);
    const usedSlugs = new Set(existing.map(r => r.slug));
    let   slug      = baseSlug;
    let   counter   = 2;
    while (usedSlugs.has(slug)) slug = `${baseSlug}-${counter++}`;

    const readingTime = calcReadingTime(content);
    const publishedAt = status === "published" ? new Date() : null;

    const [article] = await db.insert(knowledgeBaseArticles).values({
      slug, title: title.trim(), content, excerpt: excerpt ?? null,
      status, categoryId: categoryId ?? null,
      tags, relatedArticles,
      metaTitle: metaTitle ?? null, metaDescription: metaDescription ?? null,
      readingTime, publishedAt,
    }).returning();

    if (status === "published") {
      const cat = categoryId
        ? await db.select({ slug: knowledgeBaseCategories.slug }).from(knowledgeBaseCategories).where(eq(knowledgeBaseCategories.id, categoryId))
        : null;
      const catSlug = cat?.[0]?.slug ?? "algemeen";
      const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
      const fullUrl = `${siteUrl}/kennisbank/${catSlug}/${article.slug}`;
      const { pingIndexNow, pingGoogleIndexingAPI } = await import("@/lib/indexing");
      await Promise.allSettled([pingIndexNow([fullUrl]), pingGoogleIndexingAPI(fullUrl)]);
    }

    return NextResponse.json({ article }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
