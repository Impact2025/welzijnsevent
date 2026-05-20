import { db, blogPosts } from "@/db";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Clock, Tag } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog — Bijeen",
  description: "Inzichten, tips en inspiratie voor welzijnsorganisaties die betere bijeenkomsten willen organiseren.",
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
      {/* Hero */}
      <section className="bg-[#1C1814] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#C8522A] text-xs font-bold uppercase tracking-widest mb-4">Blog</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Inzichten voor welzijnsorganisaties
          </h1>
          <p className="mt-4 text-[#C8C0B8] text-lg max-w-2xl mx-auto">
            Tips, trends en inspiratie voor het organiseren van betere bijeenkomsten en het verbinden van mensen.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {posts.length === 0 && (
          <div className="text-center py-20 text-[#9E9890]">
            <p className="text-lg font-semibold">Binnenkort verschijnen hier de eerste artikelen.</p>
          </div>
        )}

        {/* Featured post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`}
            className="group block bg-white rounded-3xl border border-[#E8E4DE] overflow-hidden hover:border-[#C8522A]/40 hover:shadow-lg transition-all mb-10">
            <div className="flex flex-col md:flex-row">
              {featured.coverImage ? (
                <div className="md:w-2/5 shrink-0">
                  <img src={featured.coverImage} alt={featured.title}
                    className="w-full h-56 md:h-full object-cover" />
                </div>
              ) : (
                <div className="md:w-2/5 shrink-0 bg-gradient-to-br from-[#C8522A]/10 to-[#1C1814]/5 flex items-center justify-center h-56 md:h-auto">
                  <span className="text-6xl opacity-20">✍️</span>
                </div>
              )}
              <div className="flex-1 p-8 flex flex-col justify-center">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {featured.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[11px] font-semibold text-[#C8522A] bg-[#C8522A]/10 px-2.5 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl font-black text-[#1C1814] group-hover:text-[#C8522A] transition-colors leading-tight">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-[#6B5E54] mt-2 line-clamp-3">{featured.excerpt}</p>
                )}
                <div className="flex items-center gap-4 mt-4 text-xs text-[#9E9890]">
                  {featured.publishedAt && (
                    <span>{format(new Date(featured.publishedAt), "d MMMM yyyy", { locale: nl })}</span>
                  )}
                  {featured.readingTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {featured.readingTime} min leestijd
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-[#E8E4DE] overflow-hidden hover:border-[#C8522A]/40 hover:shadow-md transition-all flex flex-col">
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title}
                    className="w-full h-44 object-cover" />
                ) : (
                  <div className="h-44 bg-gradient-to-br from-[#F0EDE8] to-[#E8E4DE] flex items-center justify-center">
                    <span className="text-4xl opacity-30">✍️</span>
                  </div>
                )}
                <div className="flex-1 p-5 flex flex-col">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] font-semibold text-[#C8522A] bg-[#C8522A]/10 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-bold text-[#1C1814] group-hover:text-[#C8522A] transition-colors leading-snug line-clamp-2 flex-1">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-xs text-[#9E9890] mt-2 line-clamp-2">{post.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-[11px] text-[#9E9890]">
                    {post.publishedAt && (
                      <span>{format(new Date(post.publishedAt), "d MMM yyyy", { locale: nl })}</span>
                    )}
                    {post.readingTime && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {post.readingTime} min
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
