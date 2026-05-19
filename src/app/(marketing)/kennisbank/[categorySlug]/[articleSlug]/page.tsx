import { db, knowledgeBaseArticles, knowledgeBaseCategories } from "@/db";
import { eq, and, inArray } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Clock, ChevronRight, ArrowLeft, Tag } from "lucide-react";
import { ArticleFeedback } from "@/components/kennisbank/article-feedback";
import type { Metadata } from "next";

export const revalidate = 60;

interface Props { params: { categorySlug: string; articleSlug: string } }

function extractToc(html: string) {
  const headings: { level: number; id: string; text: string }[] = [];
  const re = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]+>/g, "");
    const id   = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
    headings.push({ level: parseInt(match[1]), id, text });
  }
  return headings;
}

function injectHeadingIds(html: string): string {
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h[23]>/gi, (_m, level, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, "");
    const id   = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [article] = await db
    .select({ title: knowledgeBaseArticles.title, metaTitle: knowledgeBaseArticles.metaTitle, metaDescription: knowledgeBaseArticles.metaDescription, excerpt: knowledgeBaseArticles.excerpt })
    .from(knowledgeBaseArticles)
    .where(eq(knowledgeBaseArticles.slug, params.articleSlug));
  if (!article) return { title: "Artikel niet gevonden" };

  const title       = article.metaTitle       || article.title;
  const description = article.metaDescription || article.excerpt || "";
  const siteUrl     = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";

  return {
    title,
    description,
    openGraph: {
      title, description,
      url: `${siteUrl}/kennisbank/${params.categorySlug}/${params.articleSlug}`,
      type: "article",
    },
    alternates: { canonical: `${siteUrl}/kennisbank/${params.categorySlug}/${params.articleSlug}` },
  };
}

export default async function KennisbankArticlePage({ params }: Props) {
  const [cat] = await db.select()
    .from(knowledgeBaseCategories)
    .where(eq(knowledgeBaseCategories.slug, params.categorySlug));
  if (!cat) notFound();

  const [article] = await db.select()
    .from(knowledgeBaseArticles)
    .where(and(
      eq(knowledgeBaseArticles.slug, params.articleSlug),
      eq(knowledgeBaseArticles.status, "published"),
    ));
  if (!article) notFound();

  const contentWithIds = injectHeadingIds(article.content);
  const toc = extractToc(article.content);

  // Related articles
  const related = article.relatedArticles && article.relatedArticles.length > 0
    ? await db.select({
        slug:        knowledgeBaseArticles.slug,
        title:       knowledgeBaseArticles.title,
        excerpt:     knowledgeBaseArticles.excerpt,
        categoryId:  knowledgeBaseArticles.categoryId,
      })
      .from(knowledgeBaseArticles)
      .where(and(
        inArray(knowledgeBaseArticles.slug, article.relatedArticles),
        eq(knowledgeBaseArticles.status, "published"),
      ))
    : [];

  // Get category slugs for related articles
  const relatedCatIds = Array.from(new Set(related.map(r => r.categoryId).filter(Boolean))) as string[];
  const relatedCats = relatedCatIds.length > 0
    ? await db.select({ id: knowledgeBaseCategories.id, slug: knowledgeBaseCategories.slug })
      .from(knowledgeBaseCategories)
      .where(inArray(knowledgeBaseCategories.id, relatedCatIds))
    : [];
  const catSlugMap = Object.fromEntries(relatedCats.map(c => [c.id, c.slug]));

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.metaTitle || article.title,
        description: article.metaDescription || article.excerpt,
        datePublished: article.publishedAt?.toISOString(),
        dateModified: article.updatedAt?.toISOString(),
        url: `${siteUrl}/kennisbank/${params.categorySlug}/${article.slug}`,
        publisher: { "@type": "Organization", name: "Bijeen", url: siteUrl },
        keywords: article.tags?.join(", "),
      }) }} />

      {/* Cover image or color header */}
      {(article as any).coverImage && (
        (article as any).coverImage.startsWith("color:") ? (
          <div className="w-full h-52 md:h-64" style={{ backgroundColor: (article as any).coverImage.slice(6) }} />
        ) : (
          <div className="w-full max-h-[360px] overflow-hidden">
            <img src={(article as any).coverImage} alt={article.title} className="w-full object-cover max-h-[360px]" />
          </div>
        )
      )}

      {/* Breadcrumb bar */}
      <div className="bg-white border-b border-[#E8E4DE]">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <nav className="flex items-center gap-1.5 text-[11px] text-[#9E9890] flex-wrap">
            <Link href="/kennisbank" className="hover:text-[#C8522A] transition-colors font-medium">Kennisbank</Link>
            <ChevronRight size={11} />
            <Link href={`/kennisbank/${params.categorySlug}`} className="hover:text-[#C8522A] transition-colors">
              {cat.icon} {cat.name}
            </Link>
            <ChevronRight size={11} />
            <span className="text-[#1C1814] font-medium truncate max-w-[200px]">{article.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 flex gap-8">
        {/* TOC — sticky sidebar on desktop */}
        {toc.length > 0 && (
          <aside className="hidden lg:flex flex-col w-56 shrink-0">
            <div className="sticky top-24">
              <p className="text-[10px] font-bold text-[#9E9890] uppercase tracking-widest mb-3">Inhoud</p>
              <nav className="flex flex-col gap-1">
                {toc.map(h => (
                  <a key={h.id} href={`#${h.id}`}
                    className={`text-xs text-[#6B5E54] hover:text-[#C8522A] transition-colors leading-snug ${h.level === 3 ? "pl-3" : ""}`}>
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <Link href={`/kennisbank/${params.categorySlug}`}
            className="inline-flex items-center gap-1.5 text-xs text-[#9E9890] hover:text-[#C8522A] transition-colors mb-6">
            <ArrowLeft size={13} /> {cat.icon} {cat.name}
          </Link>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {article.tags.map(tag => (
                <span key={tag} className="text-[11px] font-semibold text-[#C8522A] bg-[#C8522A]/10 px-2.5 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-black text-[#1C1814] leading-tight">{article.title}</h1>

          {article.excerpt && (
            <p className="mt-4 text-lg text-[#6B5E54] leading-relaxed">{article.excerpt}</p>
          )}

          <div className="flex items-center gap-5 mt-5 pb-6 border-b border-[#E8E4DE] text-sm text-[#9E9890]">
            {article.readingTime && (
              <span className="flex items-center gap-1.5"><Clock size={14} /> {article.readingTime} min leestijd</span>
            )}
            {article.updatedAt && (
              <span>Bijgewerkt op {format(new Date(article.updatedAt), "d MMMM yyyy", { locale: nl })}</span>
            )}
          </div>

          {/* Article body */}
          <div
            className="tiptap-content prose prose-slate prose-lg max-w-none mt-8
              prose-headings:font-black prose-headings:text-[#1C1814] prose-headings:scroll-mt-24
              prose-h2:text-2xl prose-h3:text-xl
              prose-p:text-[#3D3330] prose-p:leading-relaxed
              prose-a:text-[#C8522A] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-[#1C1814]
              prose-blockquote:border-l-[#C8522A] prose-blockquote:bg-[#F5F4F0] prose-blockquote:rounded-r-xl prose-blockquote:py-3 prose-blockquote:px-5
              prose-code:bg-[#F0EDE8] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[#C8522A] prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-[#1C1814] prose-pre:text-[#FAF9F7] prose-pre:rounded-2xl
              prose-img:rounded-2xl prose-img:border prose-img:border-[#E8E4DE]
              prose-hr:border-[#E8E4DE]
              prose-ul:text-[#3D3330] prose-ol:text-[#3D3330]"
            dangerouslySetInnerHTML={{ __html: contentWithIds }}
          />

          {/* Was dit nuttig? */}
          <div className="mt-12 pt-8 border-t border-[#E8E4DE]">
            <ArticleFeedback articleId={article.id} />
          </div>

          {/* Related articles */}
          {related.length > 0 && (
            <div className="mt-8 bg-[#F5F4F0] rounded-2xl border border-[#E8E4DE] p-6">
              <p className="text-xs font-bold text-[#9E9890] uppercase tracking-widest mb-4">Gerelateerde artikelen</p>
              <div className="flex flex-col gap-3">
                {related.map(r => {
                  const cSlug = r.categoryId ? catSlugMap[r.categoryId] : params.categorySlug;
                  return (
                    <Link key={r.slug} href={`/kennisbank/${cSlug ?? params.categorySlug}/${r.slug}`}
                      className="flex items-start justify-between group">
                      <div>
                        <p className="text-sm font-semibold text-[#1C1814] group-hover:text-[#C8522A] transition-colors">
                          {r.title}
                        </p>
                        {r.excerpt && (
                          <p className="text-xs text-[#9E9890] mt-0.5 line-clamp-1">{r.excerpt}</p>
                        )}
                      </div>
                      <ChevronRight size={14} className="text-[#C8C0B8] group-hover:text-[#C8522A] transition-colors mt-1 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Back */}
          <div className="mt-10 pt-8 border-t border-[#E8E4DE]">
            <Link href={`/kennisbank/${params.categorySlug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B5E54] hover:text-[#C8522A] transition-colors">
              <ArrowLeft size={15} /> Terug naar {cat.name}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
