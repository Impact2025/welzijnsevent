import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { auth } from "@/auth";
import { db, blogPosts } from "@/db";
import { eq, desc, sql } from "drizzle-orm";

// Machine-auth voor volautomatische publicatie (Agent OS → live), naast de
// admin-sessie. Auth: Authorization: Bearer <BLOG_PUBLISH_API_KEY>.
function hasValidPublishKey(req: Request): boolean {
  const key = process.env.BLOG_PUBLISH_API_KEY;
  const authHeader = req.headers.get("authorization");
  if (!key || !authHeader?.startsWith("Bearer ")) return false;
  // Vergelijk hashes: timing-safe én ongevoelig voor lengteverschil
  const a = createHash("sha256").update(authHeader.slice(7)).digest();
  const b = createHash("sha256").update(key).digest();
  return timingSafeEqual(a, b);
}

async function isAdminSession(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  return session.user.email === process.env.ADMIN_EMAIL;
}

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
    if (!hasValidPublishKey(req) && !(await isAdminSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Agent OS-posted artikelen sturen (nog) geen coverImage mee → geef ze een
    // huisstijl-kleur (warm Bijeen-palet) zodat ze geen lege ✍️-placeholder
    // tonen maar een gekleurd blok, net als handmatig aangemaakte kleur-posts.
    // Blijft deterministisch per slug zodat dezelfde post altijd dezelfde kleur houdt.
    const COVER_COLORS = ["#C8522A", "#E08A3C", "#B5651D", "#A23E48", "#C2410C"];
    const coverImageValue = (coverImage && String(coverImage).trim())
      ? coverImage
      : `color:${COVER_COLORS[slug.length % COVER_COLORS.length]}`;

    const readingTime = calcReadingTime(content);
    const publishedAt = status === "published"
      ? (publishedAtRaw ? new Date(publishedAtRaw) : new Date())
      : null;

    const [post] = await db.insert(blogPosts).values({
      slug, title: title.trim(), content, excerpt: excerpt ?? null,
      coverImage: coverImageValue, status, metaTitle: metaTitle ?? null,
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
