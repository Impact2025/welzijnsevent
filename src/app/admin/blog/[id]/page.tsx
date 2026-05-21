"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { BlogEditor, type BlogEditorHandle } from "@/components/blog/blog-editor";
import { CoverPicker } from "@/components/blog/cover-picker";
import {
  ArrowLeft, Save, Globe, FileText, Sparkles, Tag, X,
  ExternalLink, AlertCircle, CheckCircle2, Loader2, Clock,
  Link as LinkIcon, Eye, Calendar,
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

interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  status: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  tags: string[] | null;
  internalLinks: { text: string; href: string }[] | null;
  readingTime: number | null;
  publishedAt: string | null;
}

function slugify(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

function calcReadingTime(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default function BlogEditorPage() {
  const params     = useParams<{ id: string }>();
  const router     = useRouter();
  const isNew      = params.id === "new";
  const editorRef  = useRef<BlogEditorHandle>(null);

  const [loading,    setLoading]    = useState(!isNew);
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
  const [status,          setStatus]          = useState<"draft" | "published">("draft");
  const [metaTitle,       setMetaTitle]       = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [tags,            setTags]            = useState<string[]>([]);
  const [internalLinks,   setInternalLinks]   = useState<{ text: string; href: string }[]>([]);
  const [seoResult,       setSeoResult]       = useState<SeoResult | null>(null);
  const [publishedAt,     setPublishedAt]     = useState("");

  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const res = await fetch(`/api/blog/${params.id}`);
      if (!res.ok) { router.push("/admin/blog"); return; }
      const { post }: { post: Post } = await res.json();
      setTitle(post.title);
      setSlug(post.slug);
      setSlugManual(true);
      setContent(post.content);
      setExcerpt(post.excerpt ?? "");
      setCoverImage(post.coverImage ?? "");
      setStatus((post.status as "draft" | "published") ?? "draft");
      setMetaTitle(post.metaTitle ?? "");
      setMetaDescription(post.metaDescription ?? "");
      setTags(post.tags ?? []);
      setInternalLinks(post.internalLinks ?? []);
      if (post.publishedAt) {
        const d = new Date(post.publishedAt);
        setPublishedAt(d.toISOString().slice(0, 16));
      }
      setLoading(false);
    })();
  }, [isNew, params.id, router]);

  useEffect(() => {
    if (!slugManual && title) setSlug(slugify(title));
  }, [title, slugManual]);

  const readingTime = calcReadingTime(content);

  const buildPayload = useCallback(() => ({
    title, slug, content, excerpt: excerpt || null,
    coverImage: coverImage || null, status, metaTitle: metaTitle || null,
    metaDescription: metaDescription || null, tags, internalLinks,
    publishedAt: publishedAt || null,
  }), [title, slug, content, excerpt, coverImage, status, metaTitle, metaDescription, tags, internalLinks, publishedAt]);

  async function save(overrideStatus?: "draft" | "published") {
    if (!title.trim()) { showToast("Titel is verplicht", "err"); return; }
    setSaving(true);
    const payload = { ...buildPayload(), status: overrideStatus ?? status };

    const res = isNew
      ? await fetch("/api/blog",             { method: "POST",  headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch(`/api/blog/${params.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    setSaving(false);
    if (!res.ok) { showToast("Opslaan mislukt", "err"); return; }
    const { post } = await res.json();
    showToast(overrideStatus === "published" ? "Gepubliceerd!" : "Concept opgeslagen", "ok");
    if (isNew) router.replace(`/admin/blog/${post.id}`);
    else setStatus(post.status ?? "draft");
  }

  async function runAiSeo() {
    if (!title && !content) { showToast("Voeg eerst een titel en inhoud toe", "err"); return; }
    setAiLoading(true);
    setSeoPanel(true);
    const res = await fetch("/api/blog/ai-seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, currentSlug: slug }),
    });
    setAiLoading(false);
    if (!res.ok) { showToast("AI analyse mislukt", "err"); return; }
    const { seo }: { seo: SeoResult } = await res.json();
    setSeoResult(seo);
    if (seo.metaTitle)       setMetaTitle(seo.metaTitle);
    if (seo.metaDescription) setMetaDescription(seo.metaDescription);
    if (seo.excerpt)         setExcerpt(seo.excerpt);
    if (seo.tags?.length)    setTags(prev => Array.from(new Set([...prev, ...seo.tags!])));
    if (seo.internalLinks?.length) setInternalLinks(seo.internalLinks);
    showToast("SEO geoptimaliseerd!", "ok");
  }

  function addTag(val: string) {
    const t = val.trim().toLowerCase().replace(/^#/, "");
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen text-[#9E9890]">
      <Loader2 size={24} className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F4F0]">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
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
          <div className="min-w-0">
            <p className="text-[11px] text-[#9E9890] font-medium">Admin / Blog</p>
            <p className="text-sm font-bold text-[#1C1814] truncate max-w-[300px]">
              {title || (isNew ? "Nieuw artikel" : "Artikel bewerken")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {status === "published" && !isNew && (
            <a href={`/blog/${slug}`} target="_blank" rel="noopener"
              className="hidden sm:flex items-center gap-1.5 text-xs text-[#9E9890] hover:text-[#1C1814] transition-colors px-3 py-2 rounded-xl hover:bg-[#F0EDE8]">
              <Eye size={13} /> Bekijk live
            </a>
          )}
          <button type="button" onClick={() => save("draft")} disabled={saving}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#6B5E54] hover:text-[#1C1814] px-3 py-2 rounded-xl hover:bg-[#F0EDE8] transition-colors disabled:opacity-50">
            <Save size={15} />
            <span className="hidden sm:inline">Concept</span>
          </button>
          <button type="button" onClick={() => save("published")} disabled={saving}
            className="flex items-center gap-1.5 text-sm font-semibold bg-[#C8522A] hover:bg-[#B04420] text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
            {status === "published" ? "Bijwerken" : "Publiceren"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-6 p-5 md:p-8 max-w-7xl mx-auto">

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Title */}
          <div className="bg-white rounded-2xl border border-[#E8E4DE] px-6 py-5">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Artikeltitel..."
              className="w-full text-2xl font-black text-[#1C1814] placeholder:text-[#C8C0B8] bg-transparent border-none outline-none leading-tight"
            />
            {/* Slug */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-[#9E9890] shrink-0">/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={e => { setSlug(e.target.value); setSlugManual(true); }}
                placeholder="url-slug"
                className="flex-1 text-xs text-[#6B5E54] bg-[#F5F4F0] rounded-lg px-2 py-1 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors font-mono"
              />
              <span className="flex items-center gap-1 text-[11px] text-[#9E9890]">
                <Clock size={11} /> {readingTime} min
              </span>
            </div>
          </div>

          {/* Cover */}
          <div className="bg-white rounded-2xl border border-[#E8E4DE] px-6 py-4">
            <p className="text-xs font-bold text-[#6B5E54] mb-3 uppercase tracking-wide">Header</p>
            <CoverPicker value={coverImage} onChange={setCoverImage} />
          </div>

          {/* Tiptap Pro Editor */}
          <BlogEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
            placeholder="Begin hier met schrijven... Gebruik de toolbar voor opmaak, links en afbeeldingen."
            className="min-h-[600px]"
          />
        </div>

        {/* Right sidebar */}
        <div className="w-[300px] shrink-0 flex flex-col gap-4">

          {/* Status + publicatiedatum */}
          <div className="bg-white rounded-2xl border border-[#E8E4DE] p-4">
            <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-wide mb-3">Status</p>
            <div className="flex gap-2 mb-3">
              {(["draft", "published"] as const).map(s => (
                <button key={s} type="button" onClick={() => {
                  setStatus(s);
                  if (s === "published" && !publishedAt) {
                    const now = new Date();
                    setPublishedAt(now.toISOString().slice(0, 16));
                  }
                }}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl border transition-colors ${
                    status === s
                      ? s === "published"
                        ? "bg-green-100 border-green-300 text-green-700"
                        : "bg-[#F0EDE8] border-[#C8C0B8] text-[#6B5E54]"
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
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={e => setPublishedAt(e.target.value)}
                className="w-full text-xs bg-[#F5F4F0] rounded-xl px-3 py-2 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors"
              />
            </div>
          </div>

          {/* AI SEO card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DE] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-wide">AI SEO Assistent</p>
              <button type="button" onClick={() => setSeoPanel(v => !v)}
                className="text-[10px] text-[#9E9890] hover:text-[#6B5E54]">
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
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wide">Focus keyword:</span>
                    <span className="text-xs font-semibold text-purple-800">{seoResult.focusKeyword}</span>
                  </div>
                )}
                {seoResult.readabilityTips && seoResult.readabilityTips.length > 0 && (
                  <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-1.5">Leesbaarheid tips:</p>
                    <ul className="flex flex-col gap-1">
                      {seoResult.readabilityTips.map((tip, i) => (
                        <li key={i} className="text-[11px] text-amber-800 flex gap-1.5">
                          <span className="shrink-0 mt-0.5">•</span>{tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-2xl border border-[#E8E4DE] p-4">
            <label className="block text-xs font-bold text-[#6B5E54] uppercase tracking-wide mb-2">Samenvatting / excerpt</label>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="Korte omschrijving voor de bloglijst (max 200 tekens)..."
              maxLength={220}
              rows={3}
              className="w-full text-sm text-[#1C1814] bg-[#F5F4F0] rounded-xl px-3 py-2 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors resize-none placeholder:text-[#C8C0B8]"
            />
            <p className="text-[10px] text-[#9E9890] mt-1 text-right">{excerpt.length}/220</p>
          </div>

          {/* Meta */}
          <div className="bg-white rounded-2xl border border-[#E8E4DE] p-4">
            <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-wide mb-3">SEO Meta</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-[#9E9890] mb-1">
                  Meta titel <span className={`${metaTitle.length > 60 ? "text-red-500" : ""}`}>{metaTitle.length}/60</span>
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={e => setMetaTitle(e.target.value)}
                  placeholder="SEO-titel (max 60 tekens)"
                  maxLength={70}
                  className="w-full text-sm bg-[#F5F4F0] rounded-xl px-3 py-2 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#9E9890] mb-1">
                  Meta beschrijving <span className={`${metaDescription.length > 155 ? "text-red-500" : ""}`}>{metaDescription.length}/155</span>
                </label>
                <textarea
                  value={metaDescription}
                  onChange={e => setMetaDescription(e.target.value)}
                  placeholder="Korte beschrijving voor zoekmachines..."
                  maxLength={165}
                  rows={3}
                  className="w-full text-sm bg-[#F5F4F0] rounded-xl px-3 py-2 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors resize-none"
                />
              </div>

              {/* SERP preview */}
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

          {/* Tags */}
          <div className="bg-white rounded-2xl border border-[#E8E4DE] p-4">
            <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Tag size={12} /> Tags / Hashtags
            </p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(tag => (
                <span key={tag}
                  className="inline-flex items-center gap-1 bg-[#F0EDE8] text-[#6B5E54] text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  #{tag}
                  <button type="button" onClick={() => setTags(t => t.filter(x => x !== tag))}
                    className="text-[#9E9890] hover:text-red-500 transition-colors">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (["Enter", ",", " "].includes(e.key)) {
                  e.preventDefault();
                  addTag(tagInput);
                  setTagInput("");
                }
              }}
              placeholder="Tag toevoegen + Enter"
              className="w-full text-xs bg-[#F5F4F0] rounded-xl px-3 py-2 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors"
            />
          </div>

          {/* Interne links */}
          {internalLinks.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E8E4DE] p-4">
              <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <LinkIcon size={12} /> Interne links (AI)
              </p>
              <div className="flex flex-col gap-2">
                {internalLinks.map((link, i) => (
                  <div key={i} className="flex items-start gap-2 group">
                    <div className="flex-1 min-w-0">
                      <a href={link.href} target="_blank" rel="noopener"
                        className="block text-[11px] text-blue-600 hover:underline truncate">
                        {link.text}
                      </a>
                      <span className="text-[10px] text-[#9E9890] font-mono truncate block">{link.href}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="Invoegen in tekst"
                        onClick={() => {
                          const found = editorRef.current?.insertLink(link.text, link.href);
                          if (found === false) showToast("Tekst niet gevonden — link ingevoegd op cursorpositie", "ok");
                        }}
                        className="text-[10px] font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-lg transition-colors whitespace-nowrap">
                        + Invoegen
                      </button>
                      <button type="button" onClick={() => setInternalLinks(l => l.filter((_, j) => j !== i))}
                        className="text-[#C8C0B8] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <X size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save actions bottom */}
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
