import { NextRequest } from "next/server";
import { getCurrentOrg } from "@/lib/auth";
import { db, events, attendees, sessions } from "@/db";
import { eq, count, desc } from "drizzle-orm";

async function buildContext(orgId: string, orgName: string): Promise<string> {
  const now = new Date();

  const allEvents = await db
    .select()
    .from(events)
    .where(eq(events.organizationId, orgId))
    .orderBy(desc(events.startsAt))
    .limit(20);

  const enriched = await Promise.all(
    allEvents.map(async (ev) => {
      const [{ count: ac }] = await db
        .select({ count: count() })
        .from(attendees)
        .where(eq(attendees.eventId, ev.id));
      const [{ count: sc }] = await db
        .select({ count: count() })
        .from(sessions)
        .where(eq(sessions.eventId, ev.id));
      return { ...ev, attendeeCount: Number(ac), sessionCount: Number(sc) };
    })
  );

  const lines = enriched.slice(0, 12).map((ev) => {
    const daysUntil = Math.ceil(
      (new Date(ev.startsAt).getTime() - now.getTime()) / 86400000
    );
    const timing =
      daysUntil > 0
        ? `over ${daysUntil} dagen`
        : daysUntil === 0
        ? "vandaag"
        : `${Math.abs(daysUntil)} dagen geleden`;
    const fill =
      ev.maxAttendees
        ? `${Math.round((ev.attendeeCount / ev.maxAttendees) * 100)}% vol (${ev.attendeeCount}/${ev.maxAttendees})`
        : `${ev.attendeeCount} deelnemers`;
    const flags = [
      !ev.reminderSentAt && ev.status === "published" ? "geen herinnering" : null,
      !ev.thankYouSentAt && ev.status === "ended" ? "geen bedankmail" : null,
      !ev.description ? "geen beschrijving" : null,
    ]
      .filter(Boolean)
      .join(", ");

    return `• "${ev.title}" | ${ev.status} | ${timing} | ${fill} | ${ev.sessionCount} sessies${flags ? ` | LET OP: ${flags}` : ""}`;
  });

  const live = enriched.filter((ev) => ev.status === "live").length;
  const drafts = enriched.filter((ev) => ev.status === "draft").length;
  const upcoming = enriched.filter(
    (ev) => ev.status !== "ended" && new Date(ev.startsAt) > now
  ).length;

  return `Organisatie: ${orgName}
Vandaag: ${now.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
Live: ${live} | Aankomend: ${upcoming} | Concepts: ${drafts} | Totaal: ${enriched.length}

Evenementen:
${lines.join("\n") || "Nog geen evenementen"}`;
}

function buildSystemPrompt(context: string): string {
  return `Je bent de persoonlijke AI assistent van een eventorganisator op het WelzijnsEvent platform (bijeen.app). Je beschikt over live data van hun organisatie en helpt proactief, concreet en to-the-point.

## Live organisatiedata
${context}

## Wat je doet
- Geef concrete, actionable adviezen op basis van de bovenstaande data
- Schrijf teksten volledig uit als daarom gevraagd wordt (uitnodigingen, herinneringen, bedankmails, beschrijvingen)
- Signaleer urgente acties proactief: ontbrekende herinneringen, lage bezetting, concept-events
- Beantwoord vragen over events, deelnemers en planning direct en bondig
- Gebruik bullets en kopjes voor leesbaarheid bij langere antwoorden

## Instructies
- Antwoord ALTIJD in het Nederlands
- Wees direct en concreet — geen uitgebreide inleidingen
- Als je een mail/beschrijving schrijft: geef meteen de volledige tekst, geen uitleg eromheen
- Verwijs bij acties naar het dashboard: /dashboard/events/[id]
- Als iets onduidelijk is: stel één gerichte vervolgvraag`;
}

export async function POST(req: NextRequest) {
  const org = await getCurrentOrg();
  if (!org) {
    return new Response("Unauthorized", { status: 401 });
  }

  let messages: { role: string; content: string }[];
  try {
    ({ messages } = await req.json());
    if (!Array.isArray(messages) || messages.length === 0) throw new Error();
  } catch {
    return new Response("Ongeldige invoer", { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response("Configuratiefout", { status: 500 });
  }

  const context = await buildContext(org.id, org.name);

  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://bijeen.app",
      "X-Title": "Bijeen Dashboard Assistent",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      stream: true,
      max_tokens: 900,
      temperature: 0.55,
      messages: [
        { role: "system", content: buildSystemPrompt(context) },
        ...messages.slice(-12),
      ],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Fout bij ophalen van antwoord", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
