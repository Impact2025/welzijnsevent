import { db, blogPosts } from "@/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Clock, Tag, ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [post] = await db
    .select({ title: blogPosts.title, metaTitle: blogPosts.metaTitle, metaDescription: blogPosts.metaDescription, excerpt: blogPosts.excerpt, coverImage: blogPosts.coverImage })
    .from(blogPosts)
    .where(eq(blogPosts.slug, params.slug));

  if (!post) return { title: "Artikel niet gevonden" };

  const title       = post.metaTitle       || post.title;
  const description = post.metaDescription || post.excerpt || "";
  const siteUrl     = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/blog/${params.slug}`,
      type: "article",
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.coverImage ? [post.coverImage] : [],
    },
    alternates: { canonical: `${siteUrl}/blog/${params.slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, params.slug));

  if (!post || post.status !== "published") notFound();

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        datePublished: post.publishedAt?.toISOString(),
        dateModified: post.updatedAt?.toISOString(),
        image: post.coverImage ?? undefined,
        url: `${siteUrl}/blog/${post.slug}`,
        publisher: { "@type": "Organization", name: "Bijeen", url: siteUrl },
        keywords: post.tags?.join(", "),
      }) }} />

      {/* Cover image of kleur-header */}
      {post.coverImage && (
        post.coverImage.startsWith("color:") ? (
          <div className="w-full h-52 md:h-72" style={{ backgroundColor: post.coverImage.slice(6) }} />
        ) : (
          <div className="w-full max-h-[420px] overflow-hidden">
            <img src={post.coverImage} alt={post.title} className="w-full object-cover max-h-[420px]" />
          </div>
        )
      )}

      {/* Article header */}
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-2">
        <Link href="/blog"
          className="inline-flex items-center gap-1.5 text-xs text-[#9E9890] hover:text-[#C8522A] transition-colors mb-6">
          <ArrowLeft size={13} /> Alle artikelen
        </Link>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs font-semibold text-[#C8522A] bg-[#C8522A]/10 px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-black text-[#1C1814] leading-tight">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-4 text-lg text-[#6B5E54] leading-relaxed">{post.excerpt}</p>
        )}

        <div className="flex items-center gap-5 mt-5 pb-6 border-b border-[#E8E4DE] text-sm text-[#9E9890]">
          {post.publishedAt && (
            <span>{format(new Date(post.publishedAt), "d MMMM yyyy", { locale: nl })}</span>
          )}
          {post.readingTime && (
            <span className="flex items-center gap-1.5">
              <Clock size={14} /> {post.readingTime} min leestijd
            </span>
          )}
        </div>
      </div>

      {/* Article body */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div
          className="tiptap-content prose prose-slate prose-lg max-w-none
            prose-headings:font-black prose-headings:text-[#1C1814]
            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
            prose-p:text-[#3D3330] prose-p:leading-relaxed
            prose-a:text-[#C8522A] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-[#1C1814]
            prose-blockquote:border-l-[#C8522A] prose-blockquote:bg-[#F5F4F0] prose-blockquote:rounded-r-xl prose-blockquote:py-3 prose-blockquote:px-5
            prose-code:bg-[#F0EDE8] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[#C8522A] prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-[#1C1814] prose-pre:text-[#FAF9F7] prose-pre:rounded-2xl
            prose-img:rounded-2xl prose-img:border prose-img:border-[#E8E4DE]
            prose-hr:border-[#E8E4DE]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Internal links block */}
        {post.internalLinks && post.internalLinks.length > 0 && (
          <div className="mt-12 bg-[#F5F4F0] rounded-2xl border border-[#E8E4DE] p-6">
            <p className="text-xs font-bold text-[#9E9890] uppercase tracking-widest mb-4">Gerelateerde artikelen</p>
            <div className="flex flex-col gap-3">
              {post.internalLinks.map((link, i) => (
                <Link key={i} href={link.href}
                  className="flex items-center justify-between group text-sm font-semibold text-[#1C1814] hover:text-[#C8522A] transition-colors">
                  {link.text}
                  <ExternalLink size={14} className="text-[#9E9890] group-hover:text-[#C8522A] transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to blog */}
        <div className="mt-12 pt-8 border-t border-[#E8E4DE] text-center">
          <Link href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B5E54] hover:text-[#C8522A] transition-colors">
            <ArrowLeft size={15} /> Terug naar alle artikelen
          </Link>
        </div>
      </div>
    </main>
  );
}
