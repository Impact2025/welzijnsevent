import { db, blogPosts } from "@/db";
import { eq, desc, ne, and } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Clock, Tag, ArrowLeft, ArrowRight, ExternalLink, Linkedin, MessageCircle, Zap } from "lucide-react";
import type { Metadata } from "next";
import { truncateMetaTitle, truncateMetaDescription } from "@/lib/seo";

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [post] = await db
    .select({ title: blogPosts.title, metaTitle: blogPosts.metaTitle, metaDescription: blogPosts.metaDescription, excerpt: blogPosts.excerpt, coverImage: blogPosts.coverImage })
    .from(blogPosts)
    .where(eq(blogPosts.slug, params.slug));

  if (!post) return { title: "Artikel niet gevonden" };

  const title       = truncateMetaTitle(post.metaTitle || post.title);
  const description = truncateMetaDescription(post.metaDescription || post.excerpt || "");
  const siteUrl     = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";
  const ogImage     = post.coverImage && !post.coverImage.startsWith("color:") ? post.coverImage : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/blog/${params.slug}`,
      type: "article",
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    alternates: { canonical: `${siteUrl}/blog/${params.slug}` },
  };
}

function extractToc(html: string) {
  const headings: { level: number; id: string; text: string }[] = [];
  const re = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]+>/g, "");
    const id   = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, "-");
    headings.push({ level: parseInt(match[1]), id, text });
  }
  return headings;
}

function injectHeadingIds(html: string): string {
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h[23]>/gi, (_m, level, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, "");
    const id   = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, "-");
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
}

function extractFaq(html: string): { question: string; answer: string }[] {
  const items: { question: string; answer: string }[] = [];
  const faqMatch = html.match(/<h2[^>]*>[^<]*(?:veelgestelde|faq)[^<]*<\/h2>([\s\S]*?)(?=<h2|$)/i);
  if (!faqMatch) return items;
  const section = faqMatch[1];
  const re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*(?:<p[^>]*>([\s\S]*?)<\/p>)?/gi;
  let m;
  while ((m = re.exec(section)) !== null) {
    const q = m[1].replace(/<[^>]+>/g, "").trim();
    const a = m[2] ? m[2].replace(/<[^>]+>/g, "").trim() : "";
    if (q && a) items.push({ question: q, answer: a });
  }
  return items;
}

export default async function BlogPostPage({ params }: Props) {
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, params.slug));

  if (!post || post.status !== "published") notFound();

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";
  const blogUrl = `${siteUrl}/blog/${params.slug}`;
  const shareText = encodeURIComponent(`${post.title} — Bijeen`);
  const shareUrl = encodeURIComponent(blogUrl);

  const contentWithIds = injectHeadingIds(post.content || "");
  const toc = extractToc(post.content || "");
  const faqItems = extractFaq(post.content || "");

  // Related posts — geef voorrang aan posts met overlappende tags, vul aan met de nieuwste
  const otherPosts = await db.select({
      slug: blogPosts.slug, title: blogPosts.title, excerpt: blogPosts.excerpt,
      readingTime: blogPosts.readingTime, publishedAt: blogPosts.publishedAt,
      coverImage: blogPosts.coverImage, tags: blogPosts.tags,
    })
    .from(blogPosts)
    .where(and(ne(blogPosts.slug, params.slug), eq(blogPosts.status, "published")))
    .orderBy(desc(blogPosts.publishedAt));

  const postTags = new Set(post.tags ?? []);
  const relatedPosts = otherPosts
    .map(p => ({ ...p, sharedTags: (p.tags ?? []).filter(t => postTags.has(t)).length }))
    .sort((a, b) => b.sharedTags - a.sharedTags)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      {/* Structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        datePublished: post.publishedAt?.toISOString(),
        dateModified: post.updatedAt?.toISOString(),
        image: post.coverImage && !post.coverImage.startsWith("color:") ? post.coverImage : undefined,
        url: `${siteUrl}/blog/${post.slug}`,
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
          logo: { "@type": "ImageObject", url: `${siteUrl}/Bijeen-logo.png` },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/blog/${post.slug}` },
        keywords: post.tags?.join(", "),
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: `${siteUrl}/blog/${post.slug}` },
        ],
      }) }} />
      {faqItems.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map(item => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }) }} />
      )}

      {/* Cover image of kleur-header */}
      {post.coverImage && (
        post.coverImage.startsWith("color:") ? (
          <div className="w-full h-52 md:h-72" style={{ backgroundColor: post.coverImage.slice(6) }} />
        ) : (
          <div className="relative w-full h-[280px] md:h-[420px] overflow-hidden">
            <Image src={post.coverImage} alt={post.title} fill priority sizes="100vw" className="object-cover" />
          </div>
        )
      )}

      {/* Article header */}
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-2">
        <Link href="/blog"
          className="inline-flex items-center gap-1.5 text-xs text-[#9E9890] hover:text-[#C8522A] transition-colors mb-6">
          <ArrowLeft size={13} /> Alle artikelen
        </Link>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs font-semibold text-[#C8522A] bg-[#C8522A]/10 px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-black text-[#1C1814] leading-tight">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-4 text-lg text-[#6B5E54] leading-relaxed">{post.excerpt}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 mt-5 pb-6 border-b border-[#E8E4DE] text-sm text-[#9E9890]">
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#6B5E54]">
            <span className="w-6 h-6 rounded-full bg-[#C8522A] text-white flex items-center justify-center font-black text-[10px]">V</span>
            Vincent van Munster
          </span>
          {post.publishedAt && (
            <span>{format(new Date(post.publishedAt), "d MMMM yyyy", { locale: nl })}</span>
          )}
          {post.readingTime && (
            <span className="flex items-center gap-1.5">
              <Clock size={14} /> {post.readingTime} min leestijd
            </span>
          )}
        </div>
      </div>

      {/* Article body */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Table of Contents */}
        {toc.length > 2 && (
          <div className="mb-10 bg-[#F5F4F0] rounded-2xl border border-[#E8E4DE] p-5">
            <p className="text-[10px] font-bold text-[#9E9890] uppercase tracking-widest mb-3">Inhoudsopgave</p>
            <nav className="space-y-1.5">
              {toc.map((h, i) => (
                <a key={i} href={`#${h.id}`}
                  className={`block text-sm leading-snug transition-colors hover:text-[#C8522A] ${
                    h.level === 2 ? "font-semibold text-[#1C1814]" : "text-[#6B5E54] ml-4"
                  }`}>
                  {h.text}
                </a>
              ))}
            </nav>
          </div>
        )}

        <div
          className="tiptap-content prose prose-slate prose-lg max-w-none
            prose-headings:font-black prose-headings:scroll-mt-28
            prose-h1:text-3xl prose-h1:text-[#1C1814]
            prose-h2:text-2xl prose-h2:text-[#C8522A] prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:text-[#1C1814] prose-h3:border-l-[3px] prose-h3:border-[#C8522A] prose-h3:pl-4
            prose-p:text-[#3D3330] prose-p:leading-relaxed
            prose-a:text-[#C8522A] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-[#1C1814]
            prose-blockquote:border-l-[#C8522A] prose-blockquote:bg-[#F5F4F0] prose-blockquote:rounded-r-xl prose-blockquote:py-3 prose-blockquote:px-5
            prose-code:bg-[#F0EDE8] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[#C8522A] prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-[#1C1814] prose-pre:text-[#FAF9F7] prose-pre:rounded-2xl
            prose-img:rounded-2xl prose-img:border prose-img:border-[#E8E4DE]
            prose-hr:border-[#E8E4DE]"
          dangerouslySetInnerHTML={{ __html: contentWithIds }}
        />

        {/* Internal links block */}
        {post.internalLinks && post.internalLinks.length > 0 && (
          <div className="mt-12 bg-[#F5F4F0] rounded-2xl border border-[#E8E4DE] p-6">
            <p className="text-xs font-bold text-[#9E9890] uppercase tracking-widest mb-4">Gerelateerde artikelen</p>
            <div className="flex flex-col gap-3">
              {post.internalLinks.map((link, i) => (
                <Link key={i} href={link.href}
                  className="flex items-center justify-between group text-sm font-semibold text-[#1C1814] hover:text-[#C8522A] transition-colors">
                  {link.text}
                  <ExternalLink size={14} className="text-[#9E9890] group-hover:text-[#C8522A] transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Kennisbank crosslink */}
        <div className="mt-12 bg-[#FDF1EC] rounded-2xl border border-[#C8522A]/15 p-6">
          <p className="text-xs font-bold text-[#C8522A] uppercase tracking-widest mb-3">Kennisbank</p>
          <h3 className="font-black text-[#1C1814] mb-1">Praktische gidsen voor je evenement</h3>
          <p className="text-sm text-[#6B5E54] mb-4">
          Van checklist tot GDPR: de Bijeen kennisbank bevat 24 gratis artikelen voor welzijnsorganisaties.
          </p>
          <Link href="/kennisbank"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#C8522A] hover:underline">
            Ga naar de kennisbank <ArrowRight size={13} />
          </Link>
        </div>

        {/* Social share */}
        <div className="mt-10 pt-6 border-t border-[#E8E4DE]">
          <p className="text-xs font-bold text-[#9E9890] uppercase tracking-widest mb-4 text-center">Dit artikel delen</p>
          <div className="flex items-center justify-center gap-3">
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors">
              <Linkedin size={14} /> LinkedIn
            </a>
            <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors">
              <MessageCircle size={14} /> WhatsApp
            </a>
            <a href={`https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1C1814] hover:bg-[#3D3330] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X
            </a>
          </div>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold text-[#C8522A] uppercase tracking-widest">Verder lezen</span>
              <div className="flex-1 h-px bg-[#E8E4DE]" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedPosts.map(rp => (
                <Link key={rp.slug} href={`/blog/${rp.slug}`}
                  className="group bg-white rounded-2xl border border-[#E8E4DE] p-4 hover:border-[#C8522A]/30 hover:shadow-md transition-all">
                  <h3 className="font-bold text-[#1C1814] group-hover:text-[#C8522A] transition-colors text-xs leading-snug line-clamp-2">{rp.title}</h3>
                  {rp.excerpt && <p className="text-[11px] text-[#9E9890] mt-1.5 line-clamp-2">{rp.excerpt}</p>}
                  <div className="flex items-center gap-2 mt-3 text-[10px] text-[#9E9890]">
                    {rp.readingTime && <span>{rp.readingTime} min</span>}
                    {rp.publishedAt && <span>{format(new Date(rp.publishedAt), "d MMM yyyy", { locale: nl })}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Strong CTA */}
        <div className="mt-12 bg-[#1C1814] rounded-3xl p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#C8522A]/10 rounded-full -translate-y-16 translate-x-16 pointer-events-none" />
          <div className="relative">
            <p className="text-[#C8522A] text-xs font-bold uppercase tracking-widest mb-2">Gratis proberen</p>
            <h3 className="text-xl font-black mb-2">Klaar om het anders te doen?</h3>
            <p className="text-white/60 text-xs mb-6 max-w-md mx-auto leading-relaxed">
              Plan een gratis demo van 30 minuten en ontdek hoe Bijeen je 4 uur per evenement bespaart. ANBI organisaties ontvangen 15% Sociaal Tarief korting.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/demo-aanvragen"
                className="inline-flex items-center gap-2 bg-[#C8522A] hover:bg-[#B04420] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                <Zap size={14} className="fill-white" /> Gratis demo plannen
              </Link>
              <Link href="/gratis-impactrapport"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">
                Gratis WMO impactrapport
              </Link>
            </div>
          </div>
        </div>

        {/* Back to blog */}
        <div className="mt-8 text-center">
          <Link href="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B5E54] hover:text-[#C8522A] transition-colors">
            <ArrowLeft size={13} /> Terug naar alle artikelen
          </Link>
        </div>
      </div>
    </main>
  );
}
