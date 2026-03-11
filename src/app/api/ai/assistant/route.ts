import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `Je bent de Bijeen Assistent — vriendelijk, behulpzaam en beknopt. Bijeen is het eerste eventplatform specifiek gebouwd voor de Nederlandse welzijnssector.

## Over Bijeen
Bijeen helpt welzijnsorganisaties bij het organiseren van evenementen — van vrijwilligersdagen tot buurtfestivals en congressen. Het combineert eventbeheer, slimme AI-netwerkkoppeling en automatische impactmeting.

## Functies
- Slimme registratie: maatwerk inschrijfformulieren, sessiekeuze, wachtlijst, automatische herinneringen
- QR check-in: deelnemers scannen bij binnenkomst, realtime aanwezigheidsoverzicht
- AI netwerkkoppeling: koppelt deelnemers automatisch op rol, organisatie en interessegebied
- Live interactie: polls, live Q&A en sociale wall tijdens het event
- Impactrapportage: automatisch PDF-rapport na elk event (opkomst, tevredenheid, matches) — ideaal voor subsidieaanvragen
- White-label: jouw naam, kleuren en domein — deelnemers zien jouw organisatie

## Prijzen
- Basis: €79 per event, max 150 deelnemers — eventpagina, inschrijving, QR check-in, deelnemersexport
- Welzijn Pro: €249 per event, max 600 deelnemers — alles uit Basis + AI koppeling, polls/Q&A, impactrapportage PDF, white-label
- Congres: €699 per event, onbeperkt deelnemers — alles uit Welzijn Pro + parallelle sessies, hybrid/streaming, dedicated support
- Gratis proefperiode: eerste event gratis, geen creditcard nodig, platform klaar in 10 minuten

## Doelgroep
Welzijnsorganisaties, zorginstellingen, buurtorganisaties, vrijwilligersorganisaties in Nederland. Vertrouwd door 120+ organisaties.

## Antwoordinstructies
- Antwoord ALTIJD in het Nederlands
- Wees vriendelijk, helder en beknopt (max 3-4 zinnen tenzij meer gevraagd)
- Verwijs bij interesse naar "Start gratis proefperiode" — link is /sign-up
- Gebruik geen technisch jargon tenzij de gebruiker dat zelf doet
- Geef concrete voorbeelden uit de welzijnssector
- Als je iets niet weet over Bijeen, zeg dat eerlijk en verwijs naar contact via hello@bijeen.app`;

// Simple in-memory rate limiter — resets on cold start
const rateLimiter = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimiter.get(ip);
  if (!entry || entry.reset < now) {
    rateLimiter.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return new Response("Te veel verzoeken. Probeer het over een minuut opnieuw.", {
      status: 429,
    });
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

  const upstream = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://bijeen.app",
        "X-Title": "Bijeen Assistent",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        stream: true,
        max_tokens: 400,
        temperature: 0.7,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-8), // keep context manageable
        ],
      }),
    }
  );

  if (!upstream.ok || !upstream.body) {
    return new Response("Fout bij ophalen van antwoord", { status: 502 });
  }

  // Pipe the upstream SSE stream directly to the client
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
