import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, knowledgeBaseArticles } from "@/db";
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
      .select({ title: knowledgeBaseArticles.title, slug: knowledgeBaseArticles.slug })
      .from(knowledgeBaseArticles)
      .where(eq(knowledgeBaseArticles.status, "published"))
      .orderBy(desc(knowledgeBaseArticles.publishedAt))
      .limit(30);

    const relatedCandidates = allArticles
      .filter(a => a.slug !== currentSlug)
      .map(a => `- "${a.title}" → slug: ${a.slug}`)
      .join("\n");

    const model  = process.env.OPENROUTER_MODEL ?? "google/gemini-2.0-flash-001";
    const prompt = `Je bent een expert SEO-copywriter gespecialiseerd in kennisbank-artikelen voor Nederlandse welzijnsorganisaties.

Analyseer dit kennisbank-artikel en geef een volledige SEO-optimalisatie terug als JSON.

Artikeltitel: "${title}"
Categorie: "${categoryName}"
Artikeltekst (fragment): "${plainText}"

Bestaande kennisbank-artikelen voor gerelateerde links:
${relatedCandidates || "(geen andere artikelen beschikbaar)"}

Geef UITSLUITEND geldige JSON terug in dit exacte formaat:
{
  "metaTitle": "SEO-geoptimaliseerde paginatitel (max 60 tekens)",
  "metaDescription": "Aansprekende meta omschrijving (max 155 tekens, bevat call-to-action)",
  "excerpt": "Korte, pakkende intro voor het kennisbank-overzicht (2-3 zinnen, max 200 tekens)",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "relatedArticles": ["slug-van-artikel-1", "slug-van-artikel-2"],
  "focusKeyword": "het primaire zoekwoord",
  "readabilityTips": ["tip1", "tip2"]
}

Regels:
- Tags zijn Nederlandse trefwoorden relevant voor welzijn/evenementen/sociaal werk
- relatedArticles: maximaal 3 slugs uit de lijst hierboven die écht passen bij de inhoud
- Als er geen relevante gerelateerde artikelen zijn, geef een lege array
- Alle tekst is in het Nederlands
- De metaTitle moet het hoofdkeyword bevatten`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://bijeen.app",
        "X-Title": "Bijeen Kennisbank SEO",
      },
      body: JSON.stringify({
        model,
        max_tokens: 800,
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
