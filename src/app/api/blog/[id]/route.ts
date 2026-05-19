import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, blogPosts } from "@/db";
import { eq } from "drizzle-orm";

function calcReadingTime(html: string): number {
  const text  = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminEmail = process.env.ADMIN_EMAIL;
    if (session.user.email !== adminEmail) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, params.id));
    if (!post) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminEmail = process.env.ADMIN_EMAIL;
    if (session.user.email !== adminEmail) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [existing] = await db.select({ id: blogPosts.id, status: blogPosts.status, slug: blogPosts.slug })
      .from(blogPosts).where(eq(blogPosts.id, params.id));
    if (!existing) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

    const body = await req.json();
    const {
      title, content, excerpt, coverImage, status,
      metaTitle, metaDescription, tags, internalLinks,
    } = body;

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (title           !== undefined) patch.title           = title;
    if (content         !== undefined) {
      patch.content     = content;
      patch.readingTime = calcReadingTime(content);
    }
    if (excerpt         !== undefined) patch.excerpt         = excerpt;
    if (coverImage      !== undefined) patch.coverImage      = coverImage;
    if (metaTitle       !== undefined) patch.metaTitle       = metaTitle;
    if (metaDescription !== undefined) patch.metaDescription = metaDescription;
    if (tags            !== undefined) patch.tags            = tags;
    if (internalLinks   !== undefined) patch.internalLinks   = internalLinks;

    const wasPublished = existing.status === "published";
    if (status !== undefined) {
      patch.status = status;
      if (status === "published" && !wasPublished) patch.publishedAt = new Date();
      if (status === "draft"     && wasPublished)  patch.publishedAt = null;
    }

    const [updated] = await db
      .update(blogPosts)
      .set(patch)
      .where(eq(blogPosts.id, params.id))
      .returning();

    if (status === "published" && !wasPublished) {
      const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
      const fullUrl = `${siteUrl}/blog/${updated.slug}`;
      const { pingIndexNow, pingGoogleIndexingAPI } = await import("@/lib/indexing");
      await Promise.allSettled([pingIndexNow([fullUrl]), pingGoogleIndexingAPI(fullUrl)]);
    }

    return NextResponse.json({ post: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminEmail = process.env.ADMIN_EMAIL;
    if (session.user.email !== adminEmail) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await db.delete(blogPosts).where(eq(blogPosts.id, params.id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
