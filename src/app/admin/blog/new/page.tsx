"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BlogEditor } from "@/components/blog/blog-editor";
import { CoverPicker } from "@/components/blog/cover-picker";
import {
  ArrowLeft, Save, Globe, FileText, Sparkles, Tag, X,
  AlertCircle, CheckCircle2, Loader2, Clock, Link as LinkIcon, Calendar,
} from "lucide-react";

interface SeoResult {
  metaTitle?: string;
  metaDescription?: string;
  excerpt?: string;
  tags?: string[];
  internalLinks?: { text: string; href: string }[];
  focusKeyword?: string;
  readabilityTips?: string[];
}

function slugify(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}
function calcReadingTime(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default function NewBlogPage() {
  const router = useRouter();

  const [saving,     setSaving]     = useState(false);
  const [aiLoading,  setAiLoading]  = useState(false);
  const [toast,      setToast]      = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [seoPanel,   setSeoPanel]   = useState(false);
  const [tagInput,   setTagInput]   = useState("");

  const [title,           setTitle]           = useState("");
  const [slug,            setSlug]            = useState("");
  const [slugManual,      setSlugManual]       = useState(false);
  const [content,         setContent]         = useState("");
  const [excerpt,         setExcerpt]         = useState("");
  const [coverImage,      setCoverImage]       = useState("");
  const [publishedAt,     setPublishedAt]     = useState("");
  const [status,          setStatus]          = useState<"draft" | "published">("draft");
  const [metaTitle,       setMetaTitle]       = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [tags,            setTags]            = useState<string[]>([]);
  const [internalLinks,   setInternalLinks]   = useState<{ text: string; href: string }[]>([]);
  const [seoResult,       setSeoResult]       = useState<SeoResult | null>(null);

  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual) setSlug(slugify(val));
  };

  const readingTime = calcReadingTime(content);

  async function save(overrideStatus?: "draft" | "published") {
    if (!title.trim()) { showToast("Titel is verplicht", "err"); return; }
    setSaving(true);
    const payload = {
      title, slug, content, excerpt: excerpt || null,
      coverImage: coverImage || null, status: overrideStatus ?? status,
      metaTitle: metaTitle || null, metaDescription: metaDescription || null,
      tags, internalLinks, publishedAt: publishedAt || null,
    };
    const res = await fetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) { showToast("Opslaan mislukt", "err"); return; }
    const { post } = await res.json();
    showToast(overrideStatus === "published" ? "Gepubliceerd!" : "Concept opgeslagen", "ok");
    router.replace(`/admin/blog/${post.id}`);
  }

  async function runAiSeo() {
    if (!title && !content) { showToast("Voeg eerst een titel en inhoud toe", "err"); return; }
    setAiLoading(true);
    setSeoPanel(true);
    const res = await fetch("/api/blog/ai-seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    setAiLoading(false);
    if (!res.ok) { showToast("AI analyse mislukt", "err"); return; }
    const { seo }: { seo: SeoResult } = await res.json();
    setSeoResult(seo);
    if (seo.metaTitle)        setMetaTitle(seo.metaTitle);
    if (seo.metaDescription)  setMetaDescription(seo.metaDescription);
    if (seo.excerpt)          setExcerpt(seo.excerpt);
    if (seo.tags?.length)     setTags(prev => Array.from(new Set([...prev, ...seo.tags!])));
    if (seo.internalLinks?.length) setInternalLinks(seo.internalLinks);
    showToast("SEO geoptimaliseerd!", "ok");
  }

  function addTag(val: string) {
    const t = val.trim().toLowerCase().replace(/^#/, "");
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
  }

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

      {/* Top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-4 px-5 py-3 bg-white/95 backdrop-blur-sm border-b border-[#E8E4DE]">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/blog"
            className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-[#F0EDE8] text-[#6B5E54] transition-colors shrink-0">
            <ArrowLeft size={17} />
          </Link>
          <div>
            <p className="text-[11px] text-[#9E9890] font-medium">Admin / Blog</p>
            <p className="text-sm font-bold text-[#1C1814]">{title || "Nieuw artikel"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => save("draft")} disabled={saving}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#6B5E54] hover:text-[#1C1814] px-3 py-2 rounded-xl hover:bg-[#F0EDE8] transition-colors disabled:opacity-50">
            <Save size={15} /><span className="hidden sm:inline">Concept</span>
          </button>
          <button type="button" onClick={() => save("published")} disabled={saving}
            className="flex items-center gap-1.5 text-sm font-semibold bg-[#C8522A] hover:bg-[#B04420] text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
            Publiceren
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-6 p-5 md:p-8 max-w-7xl mx-auto">
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          <div className="bg-white rounded-2xl border border-[#E8E4DE] px-6 py-5">
            <input type="text" value={title} onChange={e => handleTitleChange(e.target.value)}
              placeholder="Artikeltitel..."
              className="w-full text-2xl font-black text-[#1C1814] placeholder:text-[#C8C0B8] bg-transparent border-none outline-none leading-tight" />
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-[#9E9890] shrink-0">/blog/</span>
              <input type="text" value={slug}
                onChange={e => { setSlug(e.target.value); setSlugManual(true); }}
                placeholder="url-slug"
                className="flex-1 text-xs text-[#6B5E54] bg-[#F5F4F0] rounded-lg px-2 py-1 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors font-mono" />
              <span className="flex items-center gap-1 text-[11px] text-[#9E9890]">
                <Clock size={11} /> {readingTime} min
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E4DE] px-6 py-4">
            <p className="text-xs font-bold text-[#6B5E54] mb-3 uppercase tracking-wide">Header</p>
            <CoverPicker value={coverImage} onChange={setCoverImage} />
          </div>

          <BlogEditor value={content} onChange={setContent}
            placeholder="Begin hier met schrijven..."
            className="min-h-[600px]" />
        </div>

        {/* Sidebar */}
        <div className="w-[300px] shrink-0 flex flex-col gap-4">

          <div className="bg-white rounded-2xl border border-[#E8E4DE] p-4">
            <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-wide mb-3">Status</p>
            <div className="flex gap-2 mb-3">
              {(["draft", "published"] as const).map(s => (
                <button key={s} type="button" onClick={() => {
                  setStatus(s);
                  if (s === "published" && !publishedAt) setPublishedAt(new Date().toISOString().slice(0, 16));
                }}
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
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-semibold text-[#9E9890] mb-1.5">
                <Calendar size={11} /> Publicatiedatum
              </label>
              <input type="datetime-local" value={publishedAt} onChange={e => setPublishedAt(e.target.value)}
                className="w-full text-xs bg-[#F5F4F0] rounded-xl px-3 py-2 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors" />
            </div>
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
              placeholder="Korte omschrijving voor de bloglijst..." maxLength={220} rows={3}
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
                  <p className="text-[11px] text-green-700 truncate">bijeen.app/blog/{slug}</p>
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

          {internalLinks.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E8E4DE] p-4">
              <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-wide mb-2 flex items-center gap-1.5"><LinkIcon size={12} /> Interne links (AI)</p>
              {internalLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <span className="flex-1 text-[11px] text-blue-600 truncate">{link.text}</span>
                  <button type="button" onClick={() => setInternalLinks(l => l.filter((_,j) => j !== i))}
                    className="text-[#C8C0B8] hover:text-red-500 opacity-0 group-hover:opacity-100"><X size={11} /></button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => save("published")} disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-[#C8522A] hover:bg-[#B04420] text-white text-sm font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Globe size={15} />}
              Publiceren
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
