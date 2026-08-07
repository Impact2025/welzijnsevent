import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, knowledgeBaseArticles, knowledgeBaseCategories } from "@/db";
import { eq, desc } from "drizzle-orm";
import { slugify, decideSlug } from "@/lib/publish-guard";

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
      title, content = "", excerpt, coverImage, status = "draft",
      publishedAt: publishedAtRaw,
      categoryId, tags = [], relatedArticles = [], internalLinks = [],
      metaTitle, metaDescription,
      slug: slugRaw, allowDuplicate = false,
    } = body;

    if (!title?.trim()) return NextResponse.json({ error: "Titel is verplicht" }, { status: 422 });

    // Zelfde guard als bij de blog: een bestaande slug is een update, geen
    // nieuwe "-2". Zie src/lib/publish-guard.ts.
    const requestedSlug = slugify(slugRaw?.trim() || title);
    const decision = await decideSlug(
      requestedSlug,
      async s => (await db.select({ slug: knowledgeBaseArticles.slug })
        .from(knowledgeBaseArticles).where(eq(knowledgeBaseArticles.slug, s))).length > 0,
      Boolean(allowDuplicate),
    );

    if (decision.action === "reject") {
      return NextResponse.json({ error: decision.reason }, { status: 409 });
    }

    const slug = decision.slug;
    const readingTime = calcReadingTime(content);
    const publishedAt = status === "published"
      ? (publishedAtRaw ? new Date(publishedAtRaw) : new Date())
      : null;

    let article;
    if (decision.action === "update") {
      const patch: Record<string, unknown> = { title: title.trim(), content, readingTime, updatedAt: new Date() };
      if (excerpt !== undefined)              patch.excerpt = excerpt;
      if (coverImage !== undefined)           patch.coverImage = coverImage;
      if (categoryId !== undefined)           patch.categoryId = categoryId;
      if (metaTitle !== undefined)            patch.metaTitle = metaTitle;
      if (metaDescription !== undefined)      patch.metaDescription = metaDescription;
      if (body.tags !== undefined)            patch.tags = tags;
      if (body.relatedArticles !== undefined) patch.relatedArticles = relatedArticles;
      if (body.internalLinks !== undefined)   patch.internalLinks = internalLinks;
      if (body.status !== undefined) {
        patch.status = status;
        if (publishedAt) patch.publishedAt = publishedAt;
      }
      [article] = await db.update(knowledgeBaseArticles).set(patch)
        .where(eq(knowledgeBaseArticles.slug, slug)).returning();
    } else {
      [article] = await db.insert(knowledgeBaseArticles).values({
        slug, title: title.trim(), content, excerpt: excerpt ?? null,
        coverImage: coverImage ?? null,
        status, categoryId: categoryId ?? null,
        tags, relatedArticles, internalLinks,
        metaTitle: metaTitle ?? null, metaDescription: metaDescription ?? null,
        readingTime, publishedAt,
      }).returning();
    }

    if (article.status === "published") {
      // Lees de categorie van het opgeslagen artikel, niet uit de body: bij een
      // update stuurt de aanroeper categoryId lang niet altijd mee.
      const cat = article.categoryId
        ? await db.select({ slug: knowledgeBaseCategories.slug }).from(knowledgeBaseCategories).where(eq(knowledgeBaseCategories.id, article.categoryId))
        : null;
      const catSlug = cat?.[0]?.slug ?? "algemeen";
      const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
      const fullUrl = `${siteUrl}/kennisbank/${catSlug}/${article.slug}`;
      const { pingIndexNow } = await import("@/lib/indexing");
      await pingIndexNow([fullUrl]);
    }

    return NextResponse.json(
      { article, action: decision.action },
      { status: decision.action === "update" ? 200 : 201 },
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
