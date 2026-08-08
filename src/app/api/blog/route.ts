import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { auth } from "@/auth";
import { db, blogPosts } from "@/db";
import { eq, desc } from "drizzle-orm";
import { slugify, decideSlug } from "@/lib/publish-guard";
import { sanitizeBlogContent } from "@/lib/seo";

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
    const { title, content: contentRaw = "", excerpt, coverImage, status = "draft",
            metaTitle, metaDescription, tags = [], internalLinks = [],
            publishedAt: publishedAtRaw,
            slug: slugRaw, allowDuplicate = false } = body;

    if (!title?.trim()) return NextResponse.json({ error: "Titel is verplicht" }, { status: 422 });

    // Strip gelekte <article>/<header>/<title>/<meta>/<h1>-wrappers die de
    // content-automation soms meestuurt — zie sanitizeBlogContent().
    const content = sanitizeBlogContent(contentRaw);

    // Een bestaande slug betekent standaard "werk dat artikel bij". Vroeger werd
    // hier net zo lang opgehoogd tot de slug vrij was, waardoor een automation
    // die hetzelfde artikel opnieuw aanbood een "-2" aanmaakte in plaats van een
    // update. Zie src/lib/publish-guard.ts voor de achtergrond.
    const requestedSlug = slugify(slugRaw?.trim() || title);
    const decision = await decideSlug(
      requestedSlug,
      async s => (await db.select({ slug: blogPosts.slug }).from(blogPosts).where(eq(blogPosts.slug, s))).length > 0,
      Boolean(allowDuplicate),
    );

    if (decision.action === "reject") {
      return NextResponse.json({ error: decision.reason }, { status: 409 });
    }

    const slug = decision.slug;

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

    let post;
    if (decision.action === "update") {
      // Alleen meegestuurde velden overschrijven, zodat een gedeeltelijke
      // herpublicatie geen handmatig geredigeerde meta-velden wist.
      const patch: Record<string, unknown> = { title: title.trim(), content, readingTime, updatedAt: new Date() };
      if (excerpt !== undefined)         patch.excerpt = excerpt;
      if (coverImage !== undefined)      patch.coverImage = coverImageValue;
      if (metaTitle !== undefined)       patch.metaTitle = metaTitle;
      if (metaDescription !== undefined) patch.metaDescription = metaDescription;
      if (body.tags !== undefined)          patch.tags = tags;
      if (body.internalLinks !== undefined) patch.internalLinks = internalLinks;
      if (body.status !== undefined) {
        patch.status = status;
        if (publishedAt) patch.publishedAt = publishedAt;
      }
      [post] = await db.update(blogPosts).set(patch).where(eq(blogPosts.slug, slug)).returning();
    } else {
      [post] = await db.insert(blogPosts).values({
        slug, title: title.trim(), content, excerpt: excerpt ?? null,
        coverImage: coverImageValue, status, metaTitle: metaTitle ?? null,
        metaDescription: metaDescription ?? null, tags, internalLinks,
        readingTime, publishedAt,
      }).returning();
    }

    if (post.status === "published") {
      const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
      const fullUrl = `${siteUrl}/blog/${post.slug}`;
      const { pingIndexNow } = await import("@/lib/indexing");
      await pingIndexNow([fullUrl]);
    }

    return NextResponse.json(
      { post, action: decision.action },
      { status: decision.action === "update" ? 200 : 201 },
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
