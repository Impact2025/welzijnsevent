import { db, blogPosts } from "@/db";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app").replace(/\/$/, "");

export async function GET() {
  const posts = await db
    .select({
      slug:        blogPosts.slug,
      title:       blogPosts.title,
      excerpt:     blogPosts.excerpt,
      content:     blogPosts.content,
      tags:        blogPosts.tags,
      publishedAt: blogPosts.publishedAt,
      updatedAt:   blogPosts.updatedAt,
    })
    .from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(50);

  const items = posts.map(p => {
    const url = `${SITE_URL}/blog/${p.slug}`;
    const cleanBody = (p.content || "")
      .replace(/<[^>]+>/g, "")
      .substring(0, 500);
    return `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${cleanBody}...]]></description>
      <pubDate>${p.publishedAt ? new Date(p.publishedAt).toUTCString() : ""}</pubDate>
      <dc:creator><![CDATA[Vincent van Munster]]></dc:creator>
      ${(p.tags || []).map(t => `<category><![CDATA[${t}]]></category>`).join("\n      ")}
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[Bijeen Blog — Inzichten voor welzijnsorganisaties]]></title>
    <link>${SITE_URL}/blog</link>
    <description><![CDATA[Tips, trends en inspiratie voor betere bijeenkomsten en het verbinden van mensen in het sociaal domein.]]></description>
    <language>nl</language>
    <atom:link href="${SITE_URL}/blog/rss" rel="self" type="application/rss+xml"/>
    <ttl>60</ttl>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
