import { db, blogPosts } from "@/db";
import { eq } from "drizzle-orm";
import { buildCoverSvg, svgToDataUri } from "@/lib/blog-cover";

export const runtime = "nodejs";
export const revalidate = 60;

// OG-image route. Levert een gebrand-merkte SVG (1200x630) als data-URI.
// Werkt zonder externe image-libs en zonder extra build-stappen. Social
// scrapers (LinkedIn/FB) accepteren SVG in og:image niet altijd, dus we
// zetten de juiste content-type en laten de browser/edge cachen.
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  let title = "Bijeen — Inzichten voor welzijnsorganisaties";
  let tags: string[] = [];
  try {
    const [post] = await db
      .select({ title: blogPosts.title, tags: blogPosts.tags })
      .from(blogPosts)
      .where(eq(blogPosts.slug, params.slug));
    if (post) {
      title = post.title;
      tags = post.tags ?? [];
    }
  } catch {
    // DB niet beschikbaar — ga door met fallback waarden
  }

  const svg = buildCoverSvg({
    title,
    tags,
    seed: params.slug,
    w: 1200,
    h: 630,
  });

  return new Response(svgToDataUri(svg), {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
