import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, blogPosts } from "@/db";
import { eq, desc, sql } from "drizzle-orm";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function calcReadingTime(html: string): number {
  const text  = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminEmail = process.env.ADMIN_EMAIL;
    if (session.user.email !== adminEmail) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const posts = await db
      .select({
        id:          blogPosts.id,
        slug:        blogPosts.slug,
        title:       blogPosts.title,
        excerpt:     blogPosts.excerpt,
        status:      blogPosts.status,
        tags:        blogPosts.tags,
        coverImage:  blogPosts.coverImage,
        readingTime: blogPosts.readingTime,
        publishedAt: blogPosts.publishedAt,
        createdAt:   blogPosts.createdAt,
        updatedAt:   blogPosts.updatedAt,
      })
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt));

    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminEmail = process.env.ADMIN_EMAIL;
    if (session.user.email !== adminEmail) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { title, content = "", excerpt, coverImage, status = "draft",
            metaTitle, metaDescription, tags = [], internalLinks = [],
            publishedAt: publishedAtRaw } = body;

    if (!title?.trim()) return NextResponse.json({ error: "Titel is verplicht" }, { status: 422 });

    const baseSlug  = slugify(title);
    const existing  = await db.select({ slug: blogPosts.slug }).from(blogPosts)
      .where(sql`${blogPosts.slug} LIKE ${baseSlug + "%"}`);
    const usedSlugs = new Set(existing.map(r => r.slug));
    let   slug      = baseSlug;
    let   counter   = 2;
    while (usedSlugs.has(slug)) slug = `${baseSlug}-${counter++}`;

    const readingTime = calcReadingTime(content);
    const publishedAt = status === "published"
      ? (publishedAtRaw ? new Date(publishedAtRaw) : new Date())
      : null;

    const [post] = await db.insert(blogPosts).values({
      slug, title: title.trim(), content, excerpt: excerpt ?? null,
      coverImage: coverImage ?? null, status, metaTitle: metaTitle ?? null,
      metaDescription: metaDescription ?? null, tags, internalLinks,
      readingTime, publishedAt,
    }).returning();

    if (status === "published") {
      const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
      const fullUrl = `${siteUrl}/blog/${post.slug}`;
      const { pingIndexNow, pingGoogleIndexingAPI } = await import("@/lib/indexing");
      await Promise.allSettled([pingIndexNow([fullUrl]), pingGoogleIndexingAPI(fullUrl)]);
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
