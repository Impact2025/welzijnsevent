import { db, knowledgeBaseCategories, knowledgeBaseArticles } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ChevronRight, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { truncateMetaTitle, truncateMetaDescription } from "@/lib/seo";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";

interface Props { params: { categorySlug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [cat] = await db.select().from(knowledgeBaseCategories)
    .where(eq(knowledgeBaseCategories.slug, params.categorySlug));
  if (!cat) return { title: "Categorie niet gevonden" };

  const title       = truncateMetaTitle(`${cat.name} — Kennisbank | Bijeen`);
  const description = truncateMetaDescription(cat.description
    ? `${cat.description} Praktische gidsen geschreven door Vincent van Munster, oprichter van Bijeen.`
    : `Alle artikelen over ${cat.name} voor welzijnsorganisaties. Praktische gidsen van Bijeen.`);

  return {
    title,
    description,
    authors: [{ name: "Vincent van Munster", url: "https://weareimpact.nl" }],
    openGraph: {
      title, description,
      url: `${siteUrl}/kennisbank/${params.categorySlug}`,
      type: "website",
      images: [{ url: `${siteUrl}/opengraph-image` }],
    },
    twitter: {
      card: "summary_large_image",
      title, description,
      images: [`${siteUrl}/opengraph-image`],
    },
    alternates: { canonical: `${siteUrl}/kennisbank/${params.categorySlug}` },
  };
}

const PILLAR_SLUGS: Record<string, string> = {
  "evenementen-organiseren": "checklist-welzijnsevenement",
  "deelnemersbeheer": "deelnemersbeheer-grote-evenementen",
  "impact-en-rapportage": "impact-meten-welzijnsevenement",
  "digitale-tools": "event-software-nonprofits",
  "gdpr-en-privacy": "gdpr-evenementen-welzijnsorganisatie",
  "vrijwilligers": "vrijwilligers-werven-evenementen",
};

export default async function KennisbankCategoryPage({ params }: Props) {
  const [cat] = await db.select().from(knowledgeBaseCategories)
    .where(eq(knowledgeBaseCategories.slug, params.categorySlug));
  if (!cat) notFound();

  const pillarSlug = PILLAR_SLUGS[params.categorySlug];

  const allArticles = await db.select({
    id:          knowledgeBaseArticles.id,
    slug:        knowledgeBaseArticles.slug,
    title:       knowledgeBaseArticles.title,
    excerpt:     knowledgeBaseArticles.excerpt,
    readingTime: knowledgeBaseArticles.readingTime,
    publishedAt: knowledgeBaseArticles.publishedAt,
    tags:        knowledgeBaseArticles.tags,
    coverImage:  knowledgeBaseArticles.coverImage,
  })
  .from(knowledgeBaseArticles)
  .where(and(
    eq(knowledgeBaseArticles.categoryId, cat.id),
    eq(knowledgeBaseArticles.status, "published"),
  ))
  .orderBy(desc(knowledgeBaseArticles.publishedAt));

  // Split: pillar first, then rest sorted by date
  const pillar = allArticles.find(a => a.slug === pillarSlug);
  const rest = allArticles.filter(a => a.slug !== pillarSlug);
  const articles = pillar ? [pillar, ...rest] : allArticles;

  // Alle andere categorieën voor de navigatiebalk onderaan
  const allCats = await db.select({
    id: knowledgeBaseCategories.id,
    name: knowledgeBaseCategories.name,
    slug: knowledgeBaseCategories.slug,
    icon: knowledgeBaseCategories.icon,
  }).from(knowledgeBaseCategories).orderBy(knowledgeBaseCategories.sortOrder);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Kennisbank", item: `${siteUrl}/kennisbank` },
      { "@type": "ListItem", position: 3, name: cat.name, item: `${siteUrl}/kennisbank/${params.categorySlug}` },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat.name,
    description: cat.description,
    url: `${siteUrl}/kennisbank/${params.categorySlug}`,
    author: {
      "@type": "Person",
      name: "Vincent van Munster",
      url: "https://weareimpact.nl",
    },
    publisher: { "@type": "Organization", name: "Bijeen", url: siteUrl },
    hasPart: articles.map(a => ({
      "@type": "Article",
      name: a.title,
      description: a.excerpt,
      url: `${siteUrl}/kennisbank/${params.categorySlug}/${a.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <section className="bg-[#1C1814] text-white py-14 px-6">
        <div className="max-w-4xl mx-auto">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-white/30 mb-6">
            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
            <ChevronRight size={11} />
            <Link href="/kennisbank" className="hover:text-white/60 transition-colors">Kennisbank</Link>
            <ChevronRight size={11} />
            <span className="text-white/60 font-medium">{cat.name}</span>
          </nav>
          <div className="flex items-start gap-5">
            <span className="text-4xl mt-1 shrink-0">{cat.icon}</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">{cat.name}</h1>
              {cat.description && (
                <p className="text-[#C8C0B8] mt-2 max-w-2xl leading-relaxed">{cat.description}</p>
              )}
              <p className="mt-3 text-[11px] text-white/30 font-medium uppercase tracking-widest">
                {articles.length} {articles.length === 1 ? "artikel" : "artikelen"} · door Vincent van Munster
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ARTIKEL LIJST ────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link href="/kennisbank"
          className="inline-flex items-center gap-1.5 text-xs text-[#9E9890] hover:text-[#C8522A] transition-colors mb-8">
          <ArrowLeft size={13} /> Alle categorieën
        </Link>

        {articles.length === 0 ? (
          <div className="text-center py-24 text-[#9E9890]">
            <BookOpen size={32} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold">Nog geen gepubliceerde artikelen in deze categorie.</p>
            <Link href="/kennisbank" className="mt-4 inline-flex items-center gap-1 text-sm text-[#C8522A] hover:underline">
              Bekijk alle categorieën <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {articles.map((article, i) => {
              const isPillar = pillar && i === 0 && article.slug === pillar.slug;
              return (
              <Link
                key={article.id}
                href={`/kennisbank/${params.categorySlug}/${article.slug}`}
                className={`group flex items-start justify-between gap-4 rounded-2xl border p-5 md:p-6 transition-all ${
                  isPillar
                    ? "bg-[#FDF1EC] border-[#C8522A]/30 hover:border-[#C8522A]/60 hover:shadow-md"
                    : "bg-white border-[#E8E4DE] hover:border-[#C8522A]/40 hover:shadow-md"
                }`}
              >
                <div className="flex gap-4 items-start flex-1 min-w-0">
                  {isPillar ? (
                    <span className="w-10 h-10 rounded-xl bg-[#C8522A] text-white flex items-center justify-center shrink-0 text-sm">
                      ⭐
                    </span>
                  ) : (
                    <span className="text-lg text-[#C8C0B8] font-black tabular-nums mt-0.5 shrink-0 w-6 text-right">
                      {String(i).padStart(2, "0")}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className={`font-bold group-hover:text-[#C8522A] transition-colors leading-snug ${
                        isPillar ? "text-lg text-[#1C1814]" : ""
                      }`}>
                        {article.title}
                      </h2>
                      {isPillar && (
                        <span className="text-[10px] font-bold text-[#C8522A] bg-[#C8522A]/10 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                          Gids
                        </span>
                      )}
                    </div>
                    {isPillar && (
                      <p className="text-[11px] text-[#C8522A] font-semibold mt-1">
                        Start hier — dit is het complete overzichtsartikel in deze categorie
                      </p>
                    )}
                    {article.excerpt && (
                      <p className={`text-sm text-[#9E9890] mt-1.5 line-clamp-2 leading-relaxed ${isPillar ? "md:pr-12" : ""}`}>
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-[#9E9890]">
                      {article.readingTime && (
                        <span className="flex items-center gap-1"><Clock size={11} /> {article.readingTime} min leestijd</span>
                      )}
                      {!isPillar && article.tags && article.tags.slice(0, 2).map(t => (
                        <span key={t} className="bg-[#F0EDE8] text-[#6B5E54] px-2 py-0.5 rounded-full font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className={`transition-colors mt-1 shrink-0 ${
                  isPillar ? "text-[#C8522A] group-hover:text-[#B04420]" : "text-[#C8C0B8] group-hover:text-[#C8522A]"
                }`} />
              </Link>
            )})}
          </div>
        )}

        {/* ── ANDERE CATEGORIEËN ──────────────────────────────────── */}
        {allCats.filter(c => c.slug !== params.categorySlug).length > 0 && (
          <div className="mt-14 pt-10 border-t border-[#E8E4DE]">
            <p className="text-xs font-bold text-[#9E9890] uppercase tracking-widest mb-4">
              Andere categorieën
            </p>
            <div className="flex flex-wrap gap-2">
              {allCats
                .filter(c => c.slug !== params.categorySlug)
                .map(c => (
                  <Link
                    key={c.id}
                    href={`/kennisbank/${c.slug}`}
                    className="flex items-center gap-1.5 text-sm font-medium text-[#6B5E54] bg-white border border-[#E8E4DE] hover:border-[#C8522A]/30 hover:text-[#C8522A] px-3.5 py-2 rounded-xl transition-all"
                  >
                    <span>{c.icon}</span> {c.name}
                  </Link>
                ))}
            </div>
          </div>
        )}

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <div className="mt-12 bg-[#1C1814] rounded-3xl p-8 text-center text-white">
          <p className="text-[#C8522A] text-xs font-bold uppercase tracking-widest mb-3">Bijeen.app</p>
          <h2 className="text-xl font-black mb-2">Klaar om het in de praktijk te brengen?</h2>
          <p className="text-[#C8C0B8] text-sm mb-6 max-w-md mx-auto">
            Plan een gratis demo van 30 minuten. ANBI organisaties ontvangen 15% Sociaal Tarief korting.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/demo-aanvragen"
              className="inline-flex items-center gap-2 bg-[#C8522A] hover:bg-[#B04420] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
              Gratis demo plannen <ArrowRight size={14} />
            </Link>
            <Link href="/kennisbank"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">
              <ArrowLeft size={14} /> Terug naar kennisbank
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
