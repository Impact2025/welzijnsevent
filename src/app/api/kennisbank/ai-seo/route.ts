import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, knowledgeBaseArticles, knowledgeBaseCategories, blogPosts } from "@/db";
import { desc, eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.email !== process.env.ADMIN_EMAIL)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "AI niet geconfigureerd" }, { status: 500 });

    const body = await req.json();
    const { title = "", content = "", currentSlug, categoryName = "" } = body;

    const plainText = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 3000);

    const allArticles = await db
      .select({
        title: knowledgeBaseArticles.title,
        slug: knowledgeBaseArticles.slug,
        categorySlug: knowledgeBaseCategories.slug,
      })
      .from(knowledgeBaseArticles)
      .leftJoin(knowledgeBaseCategories, eq(knowledgeBaseArticles.categoryId, knowledgeBaseCategories.id))
      .where(eq(knowledgeBaseArticles.status, "published"))
      .orderBy(desc(knowledgeBaseArticles.publishedAt))
      .limit(30);

    const allBlogPosts = await db
      .select({ title: blogPosts.title, slug: blogPosts.slug })
      .from(blogPosts)
      .orderBy(desc(blogPosts.publishedAt))
      .limit(20);

    const kbCandidates = allArticles
      .filter(a => a.slug !== currentSlug && a.categorySlug)
      .map(a => `- "${a.title}" → /kennisbank/${a.categorySlug}/${a.slug}`)
      .join("\n");

    const blogCandidates = allBlogPosts
      .map(p => `- "${p.title}" → /blog/${p.slug}`)
      .join("\n");

    const allCandidates = [kbCandidates, blogCandidates].filter(Boolean).join("\n");

    const model  = process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash";
    const prompt = `Je bent een expert SEO-copywriter gespecialiseerd in kennisbank-artikelen voor Nederlandse welzijnsorganisaties.

Analyseer dit kennisbank-artikel en geef een volledige SEO-optimalisatie terug als JSON.

Artikeltitel: "${title}"
Categorie: "${categoryName}"
Artikeltekst (fragment): "${plainText}"

Beschikbare interne pagina's voor links (kennisbank + blog):
${allCandidates || "(geen andere pagina's beschikbaar)"}

Geef UITSLUITEND geldige JSON terug in dit exacte formaat:
{
  "metaTitle": "SEO-geoptimaliseerde paginatitel, bevat hoofdkeyword, MAXIMAAL 60 tekens TOTAAL inclusief de merknaam-suffix ' | Bijeen'",
  "metaDescription": "Aansprekende meta omschrijving met call-to-action, MAXIMAAL 155 tekens TOTAAL",
  "excerpt": "Korte, pakkende intro voor het kennisbank-overzicht (2-3 zinnen, max 200 tekens)",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "relatedArticles": ["slug-van-artikel-1", "slug-van-artikel-2"],
  "internalLinks": [
    { "text": "exact letterlijk fragment uit de artikeltekst hierboven", "href": "/kennisbank/categorie-slug/artikel-slug" }
  ],
  "focusKeyword": "het primaire zoekwoord",
  "readabilityTips": ["tip1", "tip2"]
}

Regels:
- Tags zijn Nederlandse trefwoorden relevant voor welzijn/evenementen/sociaal werk
- relatedArticles: maximaal 3 slugs uit de lijst hierboven die écht passen bij de inhoud
- internalLinks.text: kopieer een LETTERLIJK aaneengesloten fragment (3-8 woorden) dat EXACT zo in de artikeltekst hierboven staat — verzin NIETS nieuws
- internalLinks: maximaal 3 links uit de lijst hierboven; gebruik de exacte hrefs uit die lijst
- Als er geen relevante links zijn, geef een lege array
- Alle tekst is in het Nederlands
- De metaTitle moet het hoofdkeyword bevatten en eindigen op " | Bijeen" — tel deze 9 tekens MEE in de limiet van 60, dus de beschrijvende titel zelf is maximaal 51 tekens
- Tel tekens exact — een metaTitle of metaDescription die de limiet overschrijdt wordt afgekeurd`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://bijeen.app",
        "X-Title": "Bijeen Kennisbank SEO",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1200,
        temperature: 0.4,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) return NextResponse.json({ error: "AI aanroep mislukt" }, { status: 502 });

    const data = await res.json();
    const raw  = data.choices?.[0]?.message?.content ?? "{}";

    let seo: Record<string, unknown>;
    try { seo = JSON.parse(raw); } catch { seo = {}; }

    return NextResponse.json({ seo });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
