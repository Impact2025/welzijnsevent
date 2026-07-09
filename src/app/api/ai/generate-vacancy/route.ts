import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";

const Schema = z.object({
  title:          z.string().min(1),
  category:       z.string().default("overig"),
  eventTitle:     z.string().default(""),
  spotsAvailable: z.number().default(1),
  shiftStart:     z.string().optional(),
  shiftEnd:       z.string().optional(),
  location:       z.string().optional(),
});

const CATEGORY_LABELS: Record<string, string> = {
  begeleiding:  "begeleiding van deelnemers",
  registratie:  "registratie en ontvangst",
  catering:     "catering en hospitality",
  techniek:     "technische ondersteuning",
  veiligheid:   "veiligheid en toezicht",
  communicatie: "communicatie en PR",
  decoratie:    "decoratie en opbouw",
  vervoer:      "vervoer en logistiek",
  kinderhoek:   "kinderopvang en begeleiding",
  overig:       "ondersteuning",
};

function buildPrompt(data: z.infer<typeof Schema>): string {
  const cat    = CATEGORY_LABELS[data.category] ?? data.category;
  const shift  = data.shiftStart && data.shiftEnd
    ? `De dienst is van ${data.shiftStart} tot ${data.shiftEnd}.`
    : "";
  const spots  = data.spotsAvailable === 1 ? "1 vrijwilliger" : `${data.spotsAvailable} vrijwilligers`;
  const locStr = data.location ? `Locatie: ${data.location}.` : "";

  return `Schrijf een uitnodigende vacaturebeschrijving in het Nederlands voor een vrijwilligersvacature bij een evenement. Gebruik HTML-opmaak.

Vacaturetitel: "${data.title}"
Type taak: ${cat}
Wij zoeken: ${spots}
Evenement: "${data.eventTitle || "ons evenement"}"
${shift}
${locStr}

Schrijf de beschrijving in deze HTML-structuur (gebruik ALLEEN deze tags: p, h3, ul, li, strong):

<p>[Warme, uitnodigende introductiezin die de rol omschrijft]</p>

<h3>Wat ga je doen?</h3>
<ul>
<li>[Concrete taak 1]</li>
<li>[Concrete taak 2]</li>
<li>[Concrete taak 3]</li>
<li>[Concrete taak 4]</li>
</ul>

<h3>Wat breng jij mee?</h3>
<ul>
<li>[Kwaliteit of vereiste 1]</li>
<li>[Kwaliteit of vereiste 2]</li>
<li>[Kwaliteit of vereiste 3]</li>
</ul>

<p>[Enthousiaste afsluitende zin met oproep]</p>

Toon: warm, persoonlijk, energiek. Schrijf vanuit de organisatie die vrijwilligers werft.
Geef ALLEEN de HTML terug, geen uitleg, geen markdown-codeblok.`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return new Response("Invalid input", { status: 422 });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return new Response("AI niet geconfigureerd", { status: 500 });

  const model  = process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash";
  const prompt = buildPrompt(parsed.data);

  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://bijeen.app",
      "X-Title":      "Bijeen Vacature Generator",
    },
    body: JSON.stringify({
      model,
      stream:     true,
      max_tokens: 700,
      temperature: 0.75,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("AI aanroep mislukt", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type":    "text/event-stream",
      "Cache-Control":   "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
