"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import {
  Plus, Trash2, Eye, Clock, Tag, Globe, FileText,
  LibraryBig, ThumbsUp, ThumbsDown, FolderOpen,
} from "lucide-react";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: string | null;
  tags: string[] | null;
  readingTime: number | null;
  helpfulCount: number | null;
  notHelpfulCount: number | null;
  publishedAt: string | null;
  createdAt: string;
  categoryName: string | null;
  categorySlug: string | null;
}

export default function AdminKennisbankPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/kennisbank");
    if (res.ok) { const d = await res.json(); setArticles(d.articles); }
    setLoading(false);
  }

  async function deleteArticle(id: string, title: string) {
    if (!confirm(`"${title}" verwijderen? Dit kan niet ongedaan worden gemaakt.`)) return;
    setDeleting(id);
    await fetch(`/api/kennisbank/${id}`, { method: "DELETE" });
    setArticles(a => a.filter(x => x.id !== id));
    setDeleting(null);
  }

  const published = articles.filter(a => a.status === "published");
  const drafts    = articles.filter(a => a.status !== "published");

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#1C1814] tracking-tight">Kennisbank</h1>
          <p className="text-sm text-[#9E9890] mt-0.5">
            {published.length} gepubliceerd · {drafts.length} concept{drafts.length !== 1 ? "en" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/kennisbank/categorieen"
            className="inline-flex items-center gap-2 border border-[#E8E4DE] text-[#6B5E54] hover:bg-[#F0EDE8] text-sm font-semibold px-3 py-2.5 rounded-xl transition-colors"
          >
            <FolderOpen size={15} />
            Categorieën
          </Link>
          <Link
            href="/admin/kennisbank/new"
            className="inline-flex items-center gap-2 bg-[#C8522A] hover:bg-[#B04420] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={15} />
            Nieuw artikel
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40 text-[#9E9890] text-sm">Laden...</div>
      )}

      {!loading && articles.length === 0 && (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <LibraryBig size={40} className="text-[#C8C0B8] mb-3" />
          <p className="text-[#6B5E54] font-semibold">Nog geen kennisbank-artikelen</p>
          <p className="text-sm text-[#9E9890] mt-1">Maak je eerste artikel aan</p>
          <Link href="/admin/kennisbank/new"
            className="mt-4 text-sm font-semibold text-[#C8522A] hover:underline">
            + Nieuw artikel schrijven
          </Link>
        </div>
      )}

      {!loading && articles.length > 0 && (
        <div className="flex flex-col gap-3">
          {articles.map(article => (
            <div key={article.id}
              className="flex items-start gap-4 bg-white rounded-2xl border border-[#E8E4DE] p-5 hover:border-[#C8522A]/30 transition-colors group">

              <div className="w-12 h-12 rounded-xl bg-[#F0EDE8] shrink-0 flex items-center justify-center">
                <LibraryBig size={20} className="text-[#C8C0B8]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <h2 className="text-sm font-bold text-[#1C1814] leading-tight truncate flex-1">
                    {article.title}
                  </h2>
                  <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    article.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-[#F0EDE8] text-[#9E9890]"
                  }`}>
                    {article.status === "published" ? <Globe size={9} /> : <FileText size={9} />}
                    {article.status === "published" ? "Gepubliceerd" : "Concept"}
                  </span>
                </div>

                {article.categoryName && (
                  <span className="inline-block text-[10px] font-semibold text-[#C8522A] bg-[#C8522A]/10 px-2 py-0.5 rounded-full mt-1">
                    {article.categoryName}
                  </span>
                )}

                {article.excerpt && (
                  <p className="text-xs text-[#9E9890] mt-1 line-clamp-1">{article.excerpt}</p>
                )}

                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {article.readingTime && (
                    <span className="flex items-center gap-1 text-[11px] text-[#9E9890]">
                      <Clock size={11} /> {article.readingTime} min
                    </span>
                  )}
                  {article.tags && article.tags.length > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-[#9E9890]">
                      <Tag size={11} />
                      {article.tags.slice(0, 3).join(", ")}
                    </span>
                  )}
                  {(article.helpfulCount ?? 0) + (article.notHelpfulCount ?? 0) > 0 && (
                    <span className="flex items-center gap-2 text-[11px] text-[#9E9890]">
                      <span className="flex items-center gap-0.5 text-green-600"><ThumbsUp size={10} /> {article.helpfulCount ?? 0}</span>
                      <span className="flex items-center gap-0.5 text-red-400"><ThumbsDown size={10} /> {article.notHelpfulCount ?? 0}</span>
                    </span>
                  )}
                  <span className="text-[11px] text-[#9E9890]">
                    {article.publishedAt
                      ? format(new Date(article.publishedAt), "d MMM yyyy", { locale: nl })
                      : `aangemaakt ${format(new Date(article.createdAt), "d MMM yyyy", { locale: nl })}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {article.status === "published" && article.categorySlug && (
                  <a href={`/kennisbank/${article.categorySlug}/${article.slug}`} target="_blank" rel="noopener"
                    title="Bekijk live"
                    className="flex items-center justify-center w-8 h-8 rounded-xl text-[#9E9890] hover:text-[#1C1814] hover:bg-[#F0EDE8] transition-colors">
                    <Eye size={15} />
                  </a>
                )}
                <Link href={`/admin/kennisbank/${article.id}`} title="Bewerken"
                  className="flex items-center justify-center w-8 h-8 rounded-xl text-[#9E9890] hover:text-[#C8522A] hover:bg-[#C8522A]/10 transition-colors">
                  <FileText size={15} />
                </Link>
                <button type="button" title="Verwijderen"
                  disabled={deleting === article.id}
                  onClick={() => deleteArticle(article.id, article.title)}
                  className="flex items-center justify-center w-8 h-8 rounded-xl text-[#9E9890] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
