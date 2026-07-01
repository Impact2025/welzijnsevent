import { db, blogPosts } from "@/db";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Clock, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";

export const metadata: Metadata = {
  title: "Blog",
  description: "Inzichten, tips en inspiratie voor welzijnsorganisaties die betere bijeenkomsten willen organiseren.",
  keywords: ["welzijnsevenement organiseren", "sociaal domein blog", "WMO impact", "vrijwilligersbeheer", "event software nonprofit"],
  authors: [{ name: "Vincent van Munster", url: "https://weareimpact.nl" }],
  openGraph: {
    title: "Blog — Bijeen",
    description: "Inzichten, tips en inspiratie voor welzijnsorganisaties die betere bijeenkomsten willen organiseren.",
    url: `${siteUrl}/blog`,
    type: "website",
    siteName: "Bijeen",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Bijeen",
    description: "Inzichten, tips en inspiratie voor welzijnsorganisaties die betere bijeenkomsten willen organiseren.",
  },
  alternates: { canonical: `${siteUrl}/blog` },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Bijeen Blog",
  url: `${siteUrl}/blog`,
  description: "Inzichten, tips en inspiratie voor welzijnsorganisaties die betere bijeenkomsten willen organiseren.",
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
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
  ],
};

export default async function BlogPage() {
  const posts = await db
    .select({
      id:          blogPosts.id,
      slug:        blogPosts.slug,
      title:       blogPosts.title,
      excerpt:     blogPosts.excerpt,
      coverImage:  blogPosts.coverImage,
      tags:        blogPosts.tags,
      readingTime: blogPosts.readingTime,
      publishedAt: blogPosts.publishedAt,
    })
    .from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.publishedAt));

  const [featured, ...rest] = posts;

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative bg-[#1C1814] text-white py-24 px-6 overflow-hidden">
        {/* Glow blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-[#C8522A]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#C8522A]/10 blur-3xl" />
        {/* Subtle grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(200,82,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(200,82,42,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C8522A]/20 border border-[#C8522A]/40 text-[#FF8C66] text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8522A] animate-pulse" />
            Blog
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
            Inzichten voor<br />
            <span className="text-[#C8522A]">welzijnsorganisaties</span>
          </h1>
          <p className="mt-6 text-[#C8C0B8] text-lg max-w-2xl mx-auto leading-relaxed">
            Tips, trends en inspiratie voor betere bijeenkomsten en het verbinden van mensen in het sociaal domein.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {posts.length === 0 && (
          <div className="text-center py-20 text-[#9E9890]">
            <p className="text-lg font-semibold">Binnenkort verschijnen hier de eerste artikelen.</p>
          </div>
        )}

        {/* ── Featured post ─────────────────────────────────────── */}
        {featured && (
          <Link href={`/blog/${featured.slug}`}
            className="group block bg-white rounded-3xl border border-[#E8E4DE] overflow-hidden hover:border-[#C8522A]/50 hover:shadow-xl transition-all duration-300 mb-12">
            <div className="flex flex-col md:flex-row">
              {featured.coverImage ? (
                <div className="relative md:w-2/5 shrink-0 h-64 md:h-auto">
                  {featured.coverImage.startsWith("color:") ? (
                    <div className="w-full h-64 md:h-full" style={{ backgroundColor: featured.coverImage.slice(6) }} />
                  ) : (
                    <Image src={featured.coverImage} alt={featured.title} fill priority
                      sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
                  )}
                </div>
              ) : (
                <div className="md:w-2/5 shrink-0 bg-gradient-to-br from-[#C8522A]/15 via-[#C8522A]/5 to-[#1C1814]/10 flex items-center justify-center h-64 md:h-auto">
                  <span className="text-7xl opacity-20">✍️</span>
                </div>
              )}
              <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
                <div className="flex flex-wrap gap-2 mb-4">
                  {featured.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[11px] font-bold text-[#C8522A] bg-[#C8522A]/10 px-3 py-1 rounded-full border border-[#C8522A]/20">
                      #{tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#1C1814] group-hover:text-[#C8522A] transition-colors leading-tight">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-[#6B5E54] mt-3 leading-relaxed line-clamp-3">{featured.excerpt}</p>
                )}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-4 text-xs text-[#9E9890]">
                    {featured.publishedAt && (
                      <span>{format(new Date(featured.publishedAt), "d MMMM yyyy", { locale: nl })}</span>
                    )}
                    {featured.readingTime && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {featured.readingTime} min leestijd
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#C8522A] opacity-0 group-hover:opacity-100 transition-opacity">
                    Lees meer <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ── Grid ──────────────────────────────────────────────── */}
        {rest.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-xs font-bold text-[#C8522A] uppercase tracking-widest">Alle artikelen</span>
              <div className="flex-1 h-px bg-[#E8E4DE]" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl border border-[#E8E4DE] overflow-hidden hover:border-[#C8522A]/50 hover:shadow-lg transition-all duration-300 flex flex-col">
                  {post.coverImage ? (
                    post.coverImage.startsWith("color:") ? (
                      <div className="w-full h-44" style={{ backgroundColor: post.coverImage.slice(6) }} />
                    ) : (
                      <div className="relative w-full h-44">
                        <Image src={post.coverImage} alt={post.title} fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover" />
                      </div>
                    )
                  ) : (
                    <div className="h-44 bg-gradient-to-br from-[#F5F2EE] to-[#EDE8E2] flex items-center justify-center">
                      <span className="text-4xl opacity-25">✍️</span>
                    </div>
                  )}
                  <div className="flex-1 p-5 flex flex-col">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-[#C8522A] bg-[#C8522A]/10 px-2.5 py-0.5 rounded-full border border-[#C8522A]/20">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-bold text-[#1C1814] group-hover:text-[#C8522A] transition-colors leading-snug line-clamp-2 flex-1 text-[15px]">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-xs text-[#9E9890] mt-2 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F0EDE8]">
                      <div className="flex items-center gap-3 text-[11px] text-[#9E9890]">
                        {post.publishedAt && (
                          <span>{format(new Date(post.publishedAt), "d MMM yyyy", { locale: nl })}</span>
                        )}
                        {post.readingTime && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {post.readingTime} min
                          </span>
                        )}
                      </div>
                      <ArrowRight size={13} className="text-[#C8522A] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
