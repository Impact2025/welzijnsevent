"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { BlogEditor } from "@/components/blog/blog-editor";
import {
  ArrowLeft, Save, Globe, FileText, Sparkles, Tag, X,
  AlertCircle, CheckCircle2, Loader2, Clock, Eye,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface SeoResult {
  metaTitle?: string;
  metaDescription?: string;
  excerpt?: string;
  tags?: string[];
  relatedArticles?: string[];
  focusKeyword?: string;
  readabilityTips?: string[];
}

interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  status: string | null;
  categoryId: string | null;
  tags: string[] | null;
  relatedArticles: string[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  readingTime: number | null;
}

function slugify(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}
function calcReadingTime(html: string) {
  return Math.max(1, Math.round(html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length / 200));
}

export default function EditKennisbankPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [aiLoading,  setAiLoading]  = useState(false);
  const [toast,      setToast]      = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [seoPanel,   setSeoPanel]   = useState(false);
  const [tagInput,   setTagInput]   = useState("");
  const [relInput,   setRelInput]   = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [seoResult,  setSeoResult]  = useState<SeoResult | null>(null);

  const [title,           setTitle]           = useState("");
  const [slug,            setSlug]            = useState("");
  const [slugManual,      setSlugManual]       = useState(false);
  const [content,         setContent]         = useState("");
  const [excerpt,         setExcerpt]         = useState("");
  const [status,          setStatus]          = useState<"draft" | "published">("draft");
  const [categoryId,      setCategoryId]      = useState("");
  const [tags,            setTags]            = useState<string[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<string[]>([]);
  const [metaTitle,       setMetaTitle]       = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  useEffect(() => {
    fetch("/api/kennisbank/categorieen").then(r => r.json()).then(d => setCategories(d.categories ?? []));
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/kennisbank/${params.id}`);
      if (!res.ok) { router.push("/admin/kennisbank"); return; }
      const { article }: { article: Article } = await res.json();
      setTitle(article.title);
      setSlug(article.slug);
      setSlugManual(true);
      setContent(article.content);
      setExcerpt(article.excerpt ?? "");
      setStatus((article.status as "draft" | "published") ?? "draft");
      setCategoryId(article.categoryId ?? "");
      setTags(article.tags ?? []);
      setRelatedArticles(article.relatedArticles ?? []);
      setMetaTitle(article.metaTitle ?? "");
      setMetaDescription(article.metaDescription ?? "");
      setLoading(false);
    })();
  }, [params.id, router]);

  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const readingTime  = calcReadingTime(content);
  const selectedCat  = categories.find(c => c.id === categoryId);

  const buildPayload = useCallback(() => ({
    title, slug, content, excerpt: excerpt || null,
    status, categoryId: categoryId || null,
    tags, relatedArticles,
    metaTitle: metaTitle || null,
    metaDescription: metaDescription || null,
  }), [title, slug, content, excerpt, status, categoryId, tags, relatedArticles, metaTitle, metaDescription]);

  async function save(overrideStatus?: "draft" | "published") {
    if (!title.trim()) { showToast("Titel is verplicht", "err"); return; }
    setSaving(true);
    const payload = { ...buildPayload(), status: overrideStatus ?? status };
    const res = await fetch(`/api/kennisbank/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) { showToast("Opslaan mislukt", "err"); return; }
    const { article } = await res.json();
    showToast(overrideStatus === "published" ? "Gepubliceerd!" : "Opgeslagen", "ok");
    setStatus(article.status ?? "draft");
  }

  async function runAiSeo() {
    if (!title && !content) { showToast("Voeg eerst een titel en inhoud toe", "err"); return; }
    setAiLoading(true);
    setSeoPanel(true);
    const res = await fetch("/api/kennisbank/ai-seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, currentSlug: slug, categoryName: selectedCat?.name ?? "" }),
    });
    setAiLoading(false);
    if (!res.ok) { showToast("AI analyse mislukt", "err"); return; }
    const { seo }: { seo: SeoResult } = await res.json();
    setSeoResult(seo);
    if (seo.metaTitle)         setMetaTitle(seo.metaTitle);
    if (seo.metaDescription)   setMetaDescription(seo.metaDescription);
    if (seo.excerpt)           setExcerpt(seo.excerpt);
    if (seo.tags?.length)      setTags(prev => Array.from(new Set([...prev, ...seo.tags!])));
    if (seo.relatedArticles?.length) setRelatedArticles(prev => Array.from(new Set([...prev, ...seo.relatedArticles!])));
    showToast("SEO geoptimaliseerd!", "ok");
  }

  function addTag(val: string) {
    const t = val.trim().toLowerCase().replace(/^#/, "");
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
  }
  function addRelated(val: string) {
    const s = val.trim().toLowerCase();
    if (s && !relatedArticles.includes(s)) setRelatedArticles(prev => [...prev, s]);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen text-[#9E9890]">
      <Loader2 size={24} className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F4F0]">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${
          toast.type === "ok" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "ok" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="sticky top-0 z-40 flex items-center justify-between gap-4 px-5 py-3 bg-white/95 backdrop-blur-sm border-b border-[#E8E4DE]">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/kennisbank"
            className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-[#F0EDE8] text-[#6B5E54] transition-colors shrink-0">
            <ArrowLeft size={17} />
          </Link>
          <div className="min-w-0">
            <p className="text-[11px] text-[#9E9890] font-medium">Admin / Kennisbank</p>
            <p className="text-sm font-bold text-[#1C1814] truncate max-w-[300px]">{title || "Artikel bewerken"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {status === "published" && selectedCat && (
            <a href={`/kennisbank/${selectedCat.slug}/${slug}`} target="_blank" rel="noopener"
              className="hidden sm:flex items-center gap-1.5 text-xs text-[#9E9890] hover:text-[#1C1814] transition-colors px-3 py-2 rounded-xl hover:bg-[#F0EDE8]">
              <Eye size={13} /> Bekijk live
            </a>
          )}
          <button type="button" onClick={() => save("draft")} disabled={saving}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#6B5E54] hover:text-[#1C1814] px-3 py-2 rounded-xl hover:bg-[#F0EDE8] transition-colors disabled:opacity-50">
            <Save size={15} /><span className="hidden sm:inline">Concept</span>
          </button>
          <button type="button" onClick={() => save("published")} disabled={saving}
            className="flex items-center gap-1.5 text-sm font-semibold bg-[#C8522A] hover:bg-[#B04420] text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
            {status === "published" ? "Bijwerken" : "Publiceren"}
          </button>
        </div>
      </div>

      <div className="flex gap-6 p-5 md:p-8 max-w-7xl mx-auto">
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-[#E8E4DE] px-6 py-5">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Artikeltitel..."
              className="w-full text-2xl font-black text-[#1C1814] placeholder:text-[#C8C0B8] bg-transparent border-none outline-none leading-tight" />
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-[#9E9890] shrink-0">/kennisbank/{selectedCat?.slug ?? "[categorie]"}/</span>
              <input type="text" value={slug}
                onChange={e => { setSlug(e.target.value); setSlugManual(true); }}
                placeholder="url-slug"
                className="flex-1 text-xs text-[#6B5E54] bg-[#F5F4F0] rounded-lg px-2 py-1 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors font-mono" />
              <span className="flex items-center gap-1 text-[11px] text-[#9E9890] shrink-0">
                <Clock size={11} /> {readingTime} min
              </span>
            </div>
          </div>

          <BlogEditor value={content} onChange={setContent}
            placeholder="Begin hier met schrijven..."
            className="min-h-[600px]" />
        </div>

        <div className="w-[300px] shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#E8E4DE] p-4">
            <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-wide mb-3">Status</p>
            <div className="flex gap-2">
              {(["draft", "published"] as const).map(s => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl border transition-colors ${
                    status === s
                      ? s === "published" ? "bg-green-100 border-green-300 text-green-700" : "bg-[#F0EDE8] border-[#C8C0B8] text-[#6B5E54]"
                      : "border-[#E8E4DE] text-[#9E9890] hover:bg-[#F5F4F0]"
                  }`}>
                  {s === "published" ? <Globe size={12} /> : <FileText size={12} />}
                  {s === "published" ? "Publiceren" : "Concept"}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E4DE] p-4">
            <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-wide mb-2">Categorie</p>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className="w-full text-sm bg-[#F5F4F0] rounded-xl px-3 py-2 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors">
              <option value="">— Geen categorie —</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E4DE] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-wide">AI SEO Assistent</p>
              <button type="button" onClick={() => setSeoPanel(v => !v)} className="text-[10px] text-[#9E9890]">
                {seoPanel ? "Inklappen" : "Uitklappen"}
              </button>
            </div>
            <button type="button" onClick={runAiSeo} disabled={aiLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-60">
              {aiLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {aiLoading ? "Analyseren..." : "Analyseer & Optimaliseer"}
            </button>
            {seoPanel && seoResult && (
              <div className="mt-4 flex flex-col gap-3">
                {seoResult.focusKeyword && (
                  <div className="flex items-center gap-2 bg-purple-50 rounded-xl px-3 py-2">
                    <span className="text-[10px] font-bold text-purple-600 uppercase">Focus keyword:</span>
                    <span className="text-xs font-semibold text-purple-800">{seoResult.focusKeyword}</span>
                  </div>
                )}
                {seoResult.readabilityTips?.map((tip, i) => (
                  <p key={i} className="text-[11px] text-amber-800 bg-amber-50 rounded-lg px-3 py-1.5">• {tip}</p>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E4DE] p-4">
            <label className="block text-xs font-bold text-[#6B5E54] uppercase tracking-wide mb-2">Samenvatting</label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)}
              placeholder="Korte omschrijving voor de kennisbank-lijst..." maxLength={220} rows={3}
              className="w-full text-sm bg-[#F5F4F0] rounded-xl px-3 py-2 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors resize-none placeholder:text-[#C8C0B8]" />
            <p className="text-[10px] text-[#9E9890] mt-1 text-right">{excerpt.length}/220</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E4DE] p-4">
            <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-wide mb-3">SEO Meta</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-[#9E9890] mb-1">
                  Meta titel <span className={metaTitle.length > 60 ? "text-red-500" : ""}>{metaTitle.length}/60</span>
                </label>
                <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)}
                  placeholder="SEO-titel (max 60 tekens)" maxLength={70}
                  className="w-full text-sm bg-[#F5F4F0] rounded-xl px-3 py-2 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#9E9890] mb-1">
                  Meta beschrijving <span className={metaDescription.length > 155 ? "text-red-500" : ""}>{metaDescription.length}/155</span>
                </label>
                <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)}
                  placeholder="Beschrijving voor zoekmachines..." maxLength={165} rows={3}
                  className="w-full text-sm bg-[#F5F4F0] rounded-xl px-3 py-2 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors resize-none" />
              </div>
              {(metaTitle || title) && (
                <div className="bg-[#F5F4F0] rounded-xl p-3 border border-[#E8E4DE]">
                  <p className="text-[9px] font-bold text-[#9E9890] uppercase tracking-wide mb-1.5">SERP preview</p>
                  <p className="text-sm font-medium text-blue-700 truncate">{metaTitle || title}</p>
                  <p className="text-[11px] text-green-700 truncate">bijeen.app/kennisbank/{selectedCat?.slug ?? "..."}/{slug}</p>
                  <p className="text-xs text-[#6B5E54] mt-0.5 line-clamp-2">{metaDescription || excerpt || "Geen beschrijving"}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E4DE] p-4">
            <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-wide mb-2 flex items-center gap-1.5"><Tag size={12} /> Tags</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 bg-[#F0EDE8] text-[#6B5E54] text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  #{tag}
                  <button type="button" onClick={() => setTags(t => t.filter(x => x !== tag))} className="text-[#9E9890] hover:text-red-500"><X size={10} /></button>
                </span>
              ))}
            </div>
            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (["Enter",","," "].includes(e.key)) { e.preventDefault(); addTag(tagInput); setTagInput(""); } }}
              placeholder="Tag toevoegen + Enter"
              className="w-full text-xs bg-[#F5F4F0] rounded-xl px-3 py-2 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors" />
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E4DE] p-4">
            <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-wide mb-2">Gerelateerde artikelen</p>
            <div className="flex flex-col gap-1.5 mb-2">
              {relatedArticles.map(s => (
                <div key={s} className="flex items-center gap-2 group">
                  <span className="flex-1 text-[11px] text-[#6B5E54] font-mono truncate">{s}</span>
                  <button type="button" onClick={() => setRelatedArticles(r => r.filter(x => x !== s))}
                    className="text-[#C8C0B8] hover:text-red-500 opacity-0 group-hover:opacity-100"><X size={10} /></button>
                </div>
              ))}
            </div>
            <input type="text" value={relInput} onChange={e => setRelInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addRelated(relInput); setRelInput(""); } }}
              placeholder="slug-van-artikel + Enter"
              className="w-full text-xs bg-[#F5F4F0] rounded-xl px-3 py-2 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors font-mono" />
          </div>

          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => save("published")} disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-[#C8522A] hover:bg-[#B04420] text-white text-sm font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Globe size={15} />}
              {status === "published" ? "Bijwerken & publiceren" : "Publiceren"}
            </button>
            <button type="button" onClick={() => save("draft")} disabled={saving}
              className="w-full flex items-center justify-center gap-2 border border-[#E8E4DE] text-[#6B5E54] hover:bg-[#F0EDE8] text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50">
              <Save size={14} /> Opslaan als concept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
