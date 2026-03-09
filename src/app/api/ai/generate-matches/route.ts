import { NextResponse } from "next/server";
import { db, attendees, networkMatches, events } from "@/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const INTEREST_LABELS: Record<string, string> = {
  interest_networking: "netwerken",
  interest_workshops: "workshops",
  interest_keynotes: "keynotes",
  interest_innovation: "innovatie",
  interest_policy: "beleid",
  interest_practice: "praktijkervaring",
};

interface AIMatch {
  attendeeAIndex: number;
  attendeeBIndex: number;
  score: number;
  reason: string;
  starter: string;
}

export async function POST(req: Request) {
  try {
    const { eventId } = await req.json();
    if (!eventId) {
      return NextResponse.json({ error: "eventId is verplicht" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is niet geconfigureerd" },
        { status: 500 }
      );
    }

    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    if (!event) {
      return NextResponse.json({ error: "Evenement niet gevonden" }, { status: 404 });
    }

    const allAttendees = await db
      .select()
      .from(attendees)
      .where(eq(attendees.eventId, eventId));

    if (allAttendees.length < 2) {
      return NextResponse.json(
        { error: "Minimaal 2 deelnemers nodig voor AI-matching" },
        { status: 400 }
      );
    }

    // Prioriteer deelnemers met ingevuld profiel (meer data = betere matches)
    const sorted = allAttendees
      .map((a) => ({
        ...a,
        completeness:
          (a.organization ? 1 : 0) +
          (a.role ? 1 : 0) +
          ((a.interests as string[]).length > 0 ? 2 : 0),
      }))
      .sort((a, b) => b.completeness - a.completeness)
      .slice(0, 40);

    const profileText = sorted
      .map((a, i) => {
        const interests = (a.interests as string[])
          .map((k) => INTEREST_LABELS[k] ?? k)
          .join(", ");
        return `[${i}] ${a.name} | ${a.organization ?? "organisatie onbekend"} | Rol: ${a.role ?? "onbekend"} | Interesses: ${interests || "niet opgegeven"}`;
      })
      .join("\n");

    const maxMatches = Math.min(25, Math.floor(sorted.length * 1.2));
    const model = process.env.OPENROUTER_MODEL ?? "google/gemini-2.0-flash-001";

    const prompt = `Je bent een expert netwerk-matcher voor de Nederlandse welzijnssector. Je taak is zinvolle verbindingen te leggen tussen deelnemers.

Evenement: "${event.title}"
Deelnemers:
${profileText}

Genereer de ${maxMatches} meest waardevolle matches. Een sterke match:
- Deelt thematische interesses of werkt aan vergelijkbare vraagstukken
- Heeft complementaire expertise (bijv. beleid + praktijk, groot + klein, ervaren + nieuw)
- Kan concreet iets van elkaar leren of samenwerken
- Komt uit verschillende organisaties (kruisbestuiving is waardevol)

Retourneer ALLEEN valide JSON, geen uitleg of markdown:
{
  "matches": [
    {
      "attendeeAIndex": 0,
      "attendeeBIndex": 3,
      "score": 87,
      "reason": "Twee specifieke zinnen waarom deze personen elkaar moeten ontmoeten. Verwijs naar hun organisatie, rol of interesses. In het Nederlands.",
      "starter": "Een concrete, persoonlijke gespreksstarter gebaseerd op hun profiel. In het Nederlands."
    }
  ]
}

Regels:
- score is een geheel getal van 0 t/m 100
- Elke combinatie maximaal 1x (niet A→B én B→A)
- Verwijs specifiek naar de gegevens van de deelnemers
- reason en starter altijd in het Nederlands
- Geen matches met dezelfde persoon`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.nl",
        "X-Title": "Bijeen — Welzijnsplatform",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", response.status, errText);
      return NextResponse.json(
        { error: "AI-service tijdelijk niet beschikbaar. Probeer het opnieuw." },
        { status: 502 }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "Geen response ontvangen van AI" }, { status: 500 });
    }

    let parsed: { matches: AIMatch[] };
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("JSON parse failed:", content);
      return NextResponse.json(
        { error: "AI response kon niet worden verwerkt" },
        { status: 500 }
      );
    }

    if (!parsed.matches || !Array.isArray(parsed.matches)) {
      return NextResponse.json({ error: "Ongeldige AI response structuur" }, { status: 500 });
    }

    // Verwijder bestaande matches voor dit event
    await db.delete(networkMatches).where(eq(networkMatches.eventId, eventId));

    // Sla nieuwe matches op
    const seen = new Set<string>();
    const toInsert = parsed.matches
      .filter((m) => {
        if (
          typeof m.attendeeAIndex !== "number" ||
          typeof m.attendeeBIndex !== "number"
        )
          return false;
        if (m.attendeeAIndex === m.attendeeBIndex) return false;
        if (!sorted[m.attendeeAIndex] || !sorted[m.attendeeBIndex]) return false;
        const key = [
          Math.min(m.attendeeAIndex, m.attendeeBIndex),
          Math.max(m.attendeeAIndex, m.attendeeBIndex),
        ].join("-");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((m) => ({
        id: randomUUID(),
        eventId,
        attendeeAId: sorted[m.attendeeAIndex].id,
        attendeeBId: sorted[m.attendeeBIndex].id,
        score: Math.min(1, Math.max(0, (m.score ?? 70) / 100)),
        reason: JSON.stringify({
          reason: m.reason ?? "",
          starter: m.starter ?? "",
        }),
        status: "suggested" as const,
        createdAt: new Date(),
      }));

    if (toInsert.length > 0) {
      await db.insert(networkMatches).values(toInsert);
    }

    return NextResponse.json({
      generated: toInsert.length,
      attendeesAnalyzed: sorted.length,
      model,
    });
  } catch (err) {
    console.error("generate-matches fout:", err);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}
