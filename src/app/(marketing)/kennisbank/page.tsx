import { db, knowledgeBaseCategories, knowledgeBaseArticles } from "@/db";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Kennisbank — Bijeen",
  description: "Alles wat je nodig hebt om je evenementen te organiseren met Bijeen. Handleidingen, tutorials en antwoorden op veelgestelde vragen.",
};

export default async function KennisbankPage() {
  const cats = await db
    .select()
    .from(knowledgeBaseCategories)
    .orderBy(knowledgeBaseCategories.sortOrder, knowledgeBaseCategories.name);

  const articleCounts = await db
    .select({
      categoryId: knowledgeBaseArticles.categoryId,
      count: count(),
    })
    .from(knowledgeBaseArticles)
    .where(eq(knowledgeBaseArticles.status, "published"))
    .groupBy(knowledgeBaseArticles.categoryId);

  const countMap = Object.fromEntries(articleCounts.map(r => [r.categoryId, r.count]));

  const topLevel = cats.filter(c => !c.parentId);

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      {/* Hero */}
      <section className="bg-[#1C1814] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#C8522A] text-xs font-bold uppercase tracking-widest mb-4">Kennisbank</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Hoe kunnen we je helpen?
          </h1>
          <p className="mt-4 text-[#C8C0B8] text-lg max-w-2xl mx-auto">
            Handleidingen, tutorials en antwoorden op veelgestelde vragen over het gebruik van Bijeen.
          </p>
          {/* Search hint */}
          <div className="mt-8 max-w-lg mx-auto">
            <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-5 py-3.5">
              <Search size={18} className="text-white/40 shrink-0" />
              <span className="text-white/40 text-sm">Zoek in de kennisbank... (gebruik Ctrl+F)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories grid */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        {topLevel.length === 0 && (
          <div className="text-center py-20 text-[#9E9890]">
            <p className="text-lg font-semibold">De kennisbank wordt binnenkort gevuld.</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {topLevel.map(cat => {
            const n = countMap[cat.id] ?? 0;
            return (
              <Link
                key={cat.id}
                href={`/kennisbank/${cat.slug}`}
                className="group bg-white rounded-2xl border border-[#E8E4DE] p-6 hover:border-[#C8522A]/40 hover:shadow-md transition-all flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{cat.icon}</span>
                  {n > 0 && (
                    <span className="text-[11px] font-bold text-[#9E9890] bg-[#F0EDE8] px-2 py-0.5 rounded-full">
                      {n} artikel{n !== 1 ? "en" : ""}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="font-black text-[#1C1814] group-hover:text-[#C8522A] transition-colors">
                    {cat.name}
                  </h2>
                  {cat.description && (
                    <p className="text-sm text-[#9E9890] mt-1 line-clamp-2">{cat.description}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-[#1C1814] rounded-3xl p-8 text-center text-white">
          <h2 className="text-xl font-black mb-2">Geen antwoord gevonden?</h2>
          <p className="text-[#C8C0B8] text-sm mb-5">
            Ons team helpt je graag verder via e-mail.
          </p>
          <a href="mailto:hallo@bijeen.app"
            className="inline-flex items-center gap-2 bg-[#C8522A] hover:bg-[#B04420] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            Stuur een bericht
          </a>
        </div>
      </div>
    </main>
  );
}
