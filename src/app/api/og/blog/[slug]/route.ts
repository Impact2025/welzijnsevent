import { db, blogPosts } from "@/db";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { buildCoverSvg } from "@/lib/blog-cover";

export const runtime = "nodejs";
export const revalidate = 60;

// Levert een echte PNG-cover (1200x630) voor social sharing.
// LinkedIn/FB ondersteunen geen SVG in og:image → daarom converteren we de
// gebrand-merkte SVG naar PNG met sharp (geen externe font-loader, werkt
// zowel lokaal als op Vercel).
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

  const svg = buildCoverSvg({ title, tags, seed: params.slug, w: 1200, h: 630 });

  try {
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    return new Response(png, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch {
    // Sharp niet beschikbaar → lever de SVG (WhatsApp/Telegram/Slack/Discord
    // tonen die alsnog).
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  }
}
