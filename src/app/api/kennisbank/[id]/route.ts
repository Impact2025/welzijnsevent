import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, knowledgeBaseArticles, knowledgeBaseCategories } from "@/db";
import { eq } from "drizzle-orm";

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

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [article] = await db.select().from(knowledgeBaseArticles)
      .where(eq(knowledgeBaseArticles.id, params.id));
    if (!article) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

    return NextResponse.json({ article });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [existing] = await db.select({
      id: knowledgeBaseArticles.id, status: knowledgeBaseArticles.status,
      slug: knowledgeBaseArticles.slug, categoryId: knowledgeBaseArticles.categoryId,
    }).from(knowledgeBaseArticles).where(eq(knowledgeBaseArticles.id, params.id));
    if (!existing) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

    const body = await req.json();
    const patch: Record<string, unknown> = { updatedAt: new Date() };

    if (body.title           !== undefined) patch.title           = body.title;
    if (body.content         !== undefined) { patch.content = body.content; patch.readingTime = calcReadingTime(body.content); }
    if (body.excerpt         !== undefined) patch.excerpt         = body.excerpt;
    if (body.coverImage      !== undefined) patch.coverImage      = body.coverImage;
    if (body.categoryId      !== undefined) patch.categoryId      = body.categoryId;
    if (body.tags            !== undefined) patch.tags            = body.tags;
    if (body.relatedArticles !== undefined) patch.relatedArticles = body.relatedArticles;
    if (body.metaTitle       !== undefined) patch.metaTitle       = body.metaTitle;
    if (body.metaDescription !== undefined) patch.metaDescription = body.metaDescription;

    const wasPublished = existing.status === "published";
    if (body.status !== undefined) {
      patch.status = body.status;
      if (body.status === "published") {
        patch.publishedAt = body.publishedAt ? new Date(body.publishedAt) : (wasPublished ? undefined : new Date());
      }
      if (body.status === "draft" && wasPublished) patch.publishedAt = null;
    }

    const [updated] = await db.update(knowledgeBaseArticles)
      .set(patch).where(eq(knowledgeBaseArticles.id, params.id)).returning();

    if (body.status === "published" && !wasPublished) {
      const catId = (patch.categoryId ?? existing.categoryId) as string | null;
      const cat = catId
        ? await db.select({ slug: knowledgeBaseCategories.slug }).from(knowledgeBaseCategories).where(eq(knowledgeBaseCategories.id, catId))
        : null;
      const catSlug = cat?.[0]?.slug ?? "algemeen";
      const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
      const fullUrl = `${siteUrl}/kennisbank/${catSlug}/${updated.slug}`;
      const { pingIndexNow, pingGoogleIndexingAPI } = await import("@/lib/indexing");
      await Promise.allSettled([pingIndexNow([fullUrl]), pingGoogleIndexingAPI(fullUrl)]);
    }

    return NextResponse.json({ article: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await db.delete(knowledgeBaseArticles).where(eq(knowledgeBaseArticles.id, params.id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
