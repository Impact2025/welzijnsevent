import { db, knowledgeBaseCategories, knowledgeBaseArticles } from "@/db";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ChevronRight, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 60;

interface Props { params: { categorySlug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [cat] = await db.select().from(knowledgeBaseCategories)
    .where(eq(knowledgeBaseCategories.slug, params.categorySlug));
  if (!cat) return { title: "Categorie niet gevonden" };
  return {
    title: `${cat.name} — Kennisbank Bijeen`,
    description: cat.description ?? `Alle artikelen over ${cat.name} in de Bijeen kennisbank.`,
  };
}

export default async function KennisbankCategoryPage({ params }: Props) {
  const [cat] = await db.select().from(knowledgeBaseCategories)
    .where(eq(knowledgeBaseCategories.slug, params.categorySlug));

  if (!cat) notFound();

  const articles = await db.select({
    id:          knowledgeBaseArticles.id,
    slug:        knowledgeBaseArticles.slug,
    title:       knowledgeBaseArticles.title,
    excerpt:     knowledgeBaseArticles.excerpt,
    readingTime: knowledgeBaseArticles.readingTime,
    updatedAt:   knowledgeBaseArticles.updatedAt,
    tags:        knowledgeBaseArticles.tags,
  })
  .from(knowledgeBaseArticles)
  .where(and(
    eq(knowledgeBaseArticles.categoryId, cat.id),
    eq(knowledgeBaseArticles.status, "published"),
  ))
  .orderBy(knowledgeBaseArticles.updatedAt);

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <section className="bg-[#1C1814] text-white py-14 px-6">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-[11px] text-white/40 mb-5">
            <Link href="/kennisbank" className="hover:text-white/70 transition-colors">Kennisbank</Link>
            <ChevronRight size={12} />
            <span className="text-white/60">{cat.name}</span>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{cat.icon}</span>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{cat.name}</h1>
              {cat.description && (
                <p className="text-[#C8C0B8] mt-1">{cat.description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/kennisbank"
          className="inline-flex items-center gap-1.5 text-xs text-[#9E9890] hover:text-[#C8522A] transition-colors mb-8">
          <ArrowLeft size={13} /> Alle categorieën
        </Link>

        {articles.length === 0 && (
          <div className="text-center py-20 text-[#9E9890]">
            <p className="font-semibold">Geen artikelen in deze categorie.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {articles.map(article => (
            <Link
              key={article.id}
              href={`/kennisbank/${params.categorySlug}/${article.slug}`}
              className="group flex items-start justify-between gap-4 bg-white rounded-2xl border border-[#E8E4DE] p-5 hover:border-[#C8522A]/40 hover:shadow-sm transition-all"
            >
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-[#1C1814] group-hover:text-[#C8522A] transition-colors leading-snug">
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="text-sm text-[#9E9890] mt-1 line-clamp-2">{article.excerpt}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-[11px] text-[#9E9890]">
                  {article.readingTime && (
                    <span className="flex items-center gap-1"><Clock size={11} /> {article.readingTime} min leestijd</span>
                  )}
                  {article.tags && article.tags.length > 0 && (
                    <span>{article.tags.slice(0, 3).map(t => `#${t}`).join(" ")}</span>
                  )}
                </div>
              </div>
              <ChevronRight size={16} className="text-[#C8C0B8] group-hover:text-[#C8522A] transition-colors mt-1 shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
