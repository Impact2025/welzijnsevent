"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import {
  PenLine, Plus, Trash2, Eye, Clock, Tag,
  FileText, Globe,
} from "lucide-react";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: string | null;
  tags: string[] | null;
  coverImage: string | null;
  readingTime: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBlogPage() {
  const [posts,   setPosts]   = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/blog");
    if (res.ok) { const d = await res.json(); setPosts(d.posts); }
    setLoading(false);
  }

  async function deletePost(id: string, title: string) {
    if (!confirm(`"${title}" verwijderen? Dit kan niet ongedaan worden gemaakt.`)) return;
    setDeleting(id);
    await fetch(`/api/blog/${id}`, { method: "DELETE" });
    setPosts(p => p.filter(x => x.id !== id));
    setDeleting(null);
  }

  const published = posts.filter(p => p.status === "published");
  const drafts    = posts.filter(p => p.status !== "published");

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#1C1814] tracking-tight">Blog</h1>
          <p className="text-sm text-[#9E9890] mt-0.5">
            {published.length} gepubliceerd · {drafts.length} concept{drafts.length !== 1 ? "en" : ""}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 bg-[#C8522A] hover:bg-[#B04420] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={15} />
          Nieuw artikel
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40 text-[#9E9890] text-sm">Laden...</div>
      )}

      {!loading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <FileText size={40} className="text-[#C8C0B8] mb-3" />
          <p className="text-[#6B5E54] font-semibold">Nog geen artikelen</p>
          <p className="text-sm text-[#9E9890] mt-1">Maak je eerste blogartikel aan</p>
          <Link href="/admin/blog/new"
            className="mt-4 text-sm font-semibold text-[#C8522A] hover:underline">
            + Nieuw artikel schrijven
          </Link>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="flex flex-col gap-3">
          {posts.map(post => (
            <div key={post.id}
              className="flex items-start gap-4 bg-white rounded-2xl border border-[#E8E4DE] p-5 hover:border-[#C8522A]/30 transition-colors group">

              {/* Cover thumb */}
              {post.coverImage ? (
                <img src={post.coverImage} alt=""
                  className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#F0EDE8]" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[#F0EDE8] shrink-0 flex items-center justify-center">
                  <FileText size={22} className="text-[#C8C0B8]" />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <h2 className="text-sm font-bold text-[#1C1814] leading-tight truncate flex-1">
                    {post.title}
                  </h2>
                  <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    post.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-[#F0EDE8] text-[#9E9890]"
                  }`}>
                    {post.status === "published" ? <Globe size={9} /> : <FileText size={9} />}
                    {post.status === "published" ? "Gepubliceerd" : "Concept"}
                  </span>
                </div>

                {post.excerpt && (
                  <p className="text-xs text-[#9E9890] mt-1 line-clamp-2">{post.excerpt}</p>
                )}

                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {post.readingTime && (
                    <span className="flex items-center gap-1 text-[11px] text-[#9E9890]">
                      <Clock size={11} /> {post.readingTime} min leestijd
                    </span>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-[#9E9890]">
                      <Tag size={11} />
                      {post.tags.slice(0, 3).join(", ")}
                      {post.tags.length > 3 && ` +${post.tags.length - 3}`}
                    </span>
                  )}
                  <span className="text-[11px] text-[#9E9890]">
                    {post.publishedAt
                      ? format(new Date(post.publishedAt), "d MMM yyyy", { locale: nl })
                      : `aangemaakt ${format(new Date(post.createdAt), "d MMM yyyy", { locale: nl })}`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {post.status === "published" && (
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noopener"
                    title="Bekijk live"
                    className="flex items-center justify-center w-8 h-8 rounded-xl text-[#9E9890] hover:text-[#1C1814] hover:bg-[#F0EDE8] transition-colors">
                    <Eye size={15} />
                  </a>
                )}
                <Link href={`/admin/blog/${post.id}`} title="Bewerken"
                  className="flex items-center justify-center w-8 h-8 rounded-xl text-[#9E9890] hover:text-[#C8522A] hover:bg-[#C8522A]/10 transition-colors">
                  <PenLine size={15} />
                </Link>
                <button type="button" title="Verwijderen"
                  disabled={deleting === post.id}
                  onClick={() => deletePost(post.id, post.title)}
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
