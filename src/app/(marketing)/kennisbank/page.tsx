import { db, knowledgeBaseCategories, knowledgeBaseArticles } from "@/db";
import { eq, count, desc, sql } from "drizzle-orm";
import Link from "next/link";
import { Clock, ArrowRight, BookOpen, Users, Award, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { truncateMetaDescription } from "@/lib/seo";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";

export const metadata: Metadata = {
  title: "Kennisbank voor welzijnsorganisaties",
  description: truncateMetaDescription("Praktische gidsen, checklists en vergelijkingen voor welzijnsorganisaties die evenementen organiseren. Geschreven door Vincent van Munster, oprichter van Bijeen en voormalig directeur van Stichting de Baan."),
  keywords: ["welzijnsevenement organiseren", "event software nonprofit", "deelnemersbeheer evenement", "WMO impactrapportage", "GDPR evenementen"],
  authors: [{ name: "Vincent van Munster", url: "https://weareimpact.nl" }],
  openGraph: {
    title: "Kennisbank voor welzijnsorganisaties | Bijeen",
    description: "Praktische gidsen en checklists voor welzijnsorganisaties die evenementen organiseren.",
    url: `${siteUrl}/kennisbank`,
    type: "website",
    siteName: "Bijeen",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kennisbank voor welzijnsorganisaties | Bijeen",
    description: "Praktische gidsen en checklists voor welzijnsorganisaties die evenementen organiseren.",
  },
  alternates: { canonical: `${siteUrl}/kennisbank` },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Bijeen Kennisbank",
  url: `${siteUrl}/kennisbank`,
  description: "Praktische gidsen voor welzijnsorganisaties die evenementen organiseren",
  author: {
    "@type": "Person",
    name: "Vincent van Munster",
    url: "https://weareimpact.nl",
    jobTitle: "Sociaal ondernemer en oprichter Bijeen",
  },
  publisher: {
    "@type": "Organization",
    name: "Bijeen",
    url: siteUrl,
    logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
  },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/kennisbank?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Kennisbank", item: `${siteUrl}/kennisbank` },
  ],
};

// Category accent colors
const catColors: Record<string, { bg: string; text: string; border: string }> = {
  "evenementen-organiseren": { bg: "bg-[#FDF1EC]", text: "text-[#C8522A]", border: "border-[#C8522A]/20" },
  "deelnemersbeheer":        { bg: "bg-[#EDF5EF]", text: "text-[#2D5A3D]", border: "border-[#2D5A3D]/20" },
  "impact-en-rapportage":    { bg: "bg-[#EBF2FA]", text: "text-[#1C4E80]", border: "border-[#1C4E80]/20" },
  "digitale-tools":          { bg: "bg-[#F1EFF8]", text: "text-[#5B4F8B]", border: "border-[#5B4F8B]/20" },
  "gdpr-en-privacy":         { bg: "bg-[#F3F1EF]", text: "text-[#6B5E54]", border: "border-[#6B5E54]/20" },
  "vrijwilligers":           { bg: "bg-[#FDF5EC]", text: "text-[#C87B2A]", border: "border-[#C87B2A]/20" },
};

export default async function KennisbankPage() {
  const cats = await db
    .select()
    .from(knowledgeBaseCategories)
    .orderBy(knowledgeBaseCategories.sortOrder, knowledgeBaseCategories.name);

  const articleCounts = await db
    .select({ categoryId: knowledgeBaseArticles.categoryId, count: count() })
    .from(knowledgeBaseArticles)
    .where(eq(knowledgeBaseArticles.status, "published"))
    .groupBy(knowledgeBaseArticles.categoryId);

  const countMap = Object.fromEntries(articleCounts.map(r => [r.categoryId, r.count]));
  const totalArticles = articleCounts.reduce((sum, r) => sum + r.count, 0);

  const topLevel = cats.filter(c => !c.parentId);

  // 4 meest recente artikelen voor het "uitgelicht" blok
  const recentRaw = await db
    .select({
      slug:        knowledgeBaseArticles.slug,
      title:       knowledgeBaseArticles.title,
      excerpt:     knowledgeBaseArticles.excerpt,
      readingTime: knowledgeBaseArticles.readingTime,
      publishedAt: knowledgeBaseArticles.publishedAt,
      tags:        knowledgeBaseArticles.tags,
      categoryId:  knowledgeBaseArticles.categoryId,
    })
    .from(knowledgeBaseArticles)
    .where(eq(knowledgeBaseArticles.status, "published"))
    .orderBy(desc(knowledgeBaseArticles.publishedAt))
    .limit(4);

  // Map categoryId → slug voor de recente artikelen
  const catSlugMap = Object.fromEntries(cats.map(c => [c.id, c.slug]));
  const recent = recentRaw.map(a => ({ ...a, categorySlug: a.categoryId ? catSlugMap[a.categoryId] : "" }));

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      {/* Structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="bg-[#1C1814] text-white overflow-hidden relative">
        {/* subtle grain texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-white/30 mb-8">
            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
            <ChevronRight size={11} />
            <span className="text-white/50 font-medium">Kennisbank</span>
          </nav>

          <div className="max-w-3xl">
            <p className="text-[#C8522A] text-xs font-bold uppercase tracking-widest mb-4">Kennisbank</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
              Alles over evenementen<br className="hidden md:block" /> in de welzijnssector
            </h1>
            <p className="mt-5 text-[#C8C0B8] text-lg leading-relaxed max-w-2xl">
              Praktische gidsen, checklists en eerlijke vergelijkingen. Geschreven door Vincent van Munster
              — sociaal ondernemer, bouwer van Bijeen en voormalig directeur van Stichting de Baan.
            </p>
          </div>

          {/* Stats bar */}
          <div className="mt-10 flex flex-wrap gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <BookOpen size={15} className="text-[#C8522A]" />
              </div>
              <div>
                <p className="text-xl font-black leading-none">{totalArticles}</p>
                <p className="text-[11px] text-white/40 mt-0.5">artikelen</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Users size={15} className="text-[#C8522A]" />
              </div>
              <div>
                <p className="text-xl font-black leading-none">{topLevel.length}</p>
                <p className="text-[11px] text-white/40 mt-0.5">categorieën</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Award size={15} className="text-[#C8522A]" />
              </div>
              <div>
                <p className="text-xl font-black leading-none">700+</p>
                <p className="text-[11px] text-white/40 mt-0.5">deelnemers ervaring</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIE GRID ────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-8">
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="text-xl font-black text-[#1C1814]">Alle categorieën</h2>
          <span className="text-xs text-[#9E9890]">{topLevel.length} categorieën</span>
        </div>

        {topLevel.length === 0 ? (
          <div className="text-center py-24 text-[#9E9890]">
            <BookOpen size={32} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold">De kennisbank wordt geladen.</p>
            <p className="text-sm mt-1">Ververs de pagina over een moment.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topLevel.map(cat => {
              const n = countMap[cat.id] ?? 0;
              const colors = catColors[cat.slug] ?? { bg: "bg-[#F5F4F0]", text: "text-[#6B5E54]", border: "border-[#E8E4DE]" };
              return (
                <Link
                  key={cat.id}
                  href={`/kennisbank/${cat.slug}`}
                  className="group bg-white rounded-2xl border border-[#E8E4DE] p-6 hover:border-[#C8522A]/30 hover:shadow-lg transition-all duration-200 flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between">
                    <span className={`w-11 h-11 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center text-xl`}>
                      {cat.icon}
                    </span>
                    {n > 0 && (
                      <span className={`text-[11px] font-bold ${colors.text} ${colors.bg} px-2.5 py-1 rounded-full border ${colors.border}`}>
                        {n} {n === 1 ? "artikel" : "artikelen"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-[#1C1814] group-hover:text-[#C8522A] transition-colors text-[15px] leading-snug">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-xs text-[#9E9890] mt-1.5 leading-relaxed line-clamp-2">{cat.description}</p>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    Bekijk artikelen <ArrowRight size={12} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── UITGELICHTE ARTIKELEN ─────────────────────────────────── */}
      {recent.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-black text-[#1C1814]">Nieuwste artikelen</h2>
            <span className="text-xs text-[#9E9890]">Meest recent gepubliceerd</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {recent.map(a => (
              <Link
                key={a.slug}
                href={`/kennisbank/${a.categorySlug}/${a.slug}`}
                className="group bg-white rounded-2xl border border-[#E8E4DE] p-5 hover:border-[#C8522A]/30 hover:shadow-md transition-all"
              >
                <h3 className="font-bold text-[#1C1814] group-hover:text-[#C8522A] transition-colors leading-snug text-sm">
                  {a.title}
                </h3>
                {a.excerpt && (
                  <p className="text-xs text-[#9E9890] mt-1.5 line-clamp-2 leading-relaxed">{a.excerpt}</p>
                )}
                <div className="flex items-center gap-3 mt-3 text-[11px] text-[#9E9890]">
                  {a.readingTime && (
                    <span className="flex items-center gap-1"><Clock size={11} /> {a.readingTime} min</span>
                  )}
                  {a.tags && a.tags[0] && (
                    <span className="bg-[#F0EDE8] text-[#6B5E54] px-2 py-0.5 rounded-full font-medium">
                      #{a.tags[0]}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── OVER DE AUTEUR ────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl border border-[#E8E4DE] p-8 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-14 h-14 rounded-2xl bg-[#C8522A] flex items-center justify-center shrink-0 text-white font-black text-xl">
            V
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-[#9E9890] uppercase tracking-widest mb-2">Over de auteur</p>
            <h3 className="font-black text-[#1C1814] text-lg mb-2">Vincent van Munster</h3>
            <p className="text-sm text-[#6B5E54] leading-relaxed">
              Sociaal ondernemer, oprichter van Bijeen.app en WeAreImpact.nl, voormalig directeur van
              Stichting de Baan (tot oktober 2025). Ik schrijf over wat ik zelf heb meegemaakt: honderden
              welzijnsevenementen, 700 deelnemers, 180 vrijwilligers en de administratieve chaos die daarbij
              hoort — en hoe je die slimmer aanpakt.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link href="/kennisbank/evenementen-organiseren/checklist-welzijnsevenement"
                className="text-xs font-semibold text-[#C8522A] hover:underline flex items-center gap-1">
                Begin met de checklist <ArrowRight size={12} />
              </Link>
              <a href="https://weareimpact.nl" target="_blank" rel="noopener noreferrer"
                className="text-xs font-semibold text-[#9E9890] hover:text-[#C8522A] transition-colors flex items-center gap-1">
                WeAreImpact.nl <ArrowRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTIE (SEO rich snippets) ───────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-xl font-black text-[#1C1814] mb-6">Veelgestelde vragen over de kennisbank</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              q: "Voor wie is deze kennisbank bedoeld?",
              a: "Voor iedereen die welzijnsevenementen organiseert: stichtingen, gemeentelijke welzijnsorganisaties, WMO uitvoerders en coordinatoren in de zorg en welzijnssector in Nederland.",
            },
            {
              q: "Zijn de artikelen gratis?",
              a: "Ja, alle kennisbank artikelen zijn volledig gratis en zonder registratie toegankelijk. We geloven dat kennis over goed evenementenmanagement beschikbaar moet zijn voor de hele sector.",
            },
            {
              q: "Wat is het verschil tussen de kennisbank en de blog?",
              a: "De kennisbank bevat tijdloze praktische gidsen, checklists en vergelijkingen. De blog bevat actuele updates, nieuws en persoonlijke observaties over de welzijnssector.",
            },
            {
              q: "Hoe kan ik een gratis demo aanvragen van Bijeen?",
              a: "Via bijeen.app kun je een gratis demo van 30 minuten plannen. ANBI gecertificeerde organisaties ontvangen automatisch 15% Sociaal Tarief korting op elk abonnement.",
            },
          ].map(item => (
            <div key={item.q} className="bg-white rounded-2xl border border-[#E8E4DE] p-5">
              <h3 className="font-bold text-[#1C1814] text-sm mb-2">{item.q}</h3>
              <p className="text-sm text-[#6B5E54] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-8 pb-16">
        <div className="bg-[#1C1814] rounded-3xl p-10 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8522A]/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="relative">
            <p className="text-[#C8522A] text-xs font-bold uppercase tracking-widest mb-3">Gratis proberen</p>
            <h2 className="text-2xl md:text-3xl font-black mb-3 leading-tight">
              Klaar om je evenementen slimmer te organiseren?
            </h2>
            <p className="text-[#C8C0B8] text-sm mb-8 max-w-lg mx-auto">
              Plan een gratis demo van 30 minuten en zie hoe Bijeen je 4 uur per evenement bespaart.
              ANBI organisaties ontvangen 15% Sociaal Tarief korting.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/demo-aanvragen"
                className="inline-flex items-center gap-2 bg-[#C8522A] hover:bg-[#B04420] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
              >
                Gratis demo plannen <ArrowRight size={15} />
              </Link>
              <Link
                href="/gratis-impactrapport"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm"
              >
                Gratis WMO impactrapport
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
