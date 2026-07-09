import { NextRequest } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const Schema = z.object({
  evenementNaam:    z.string().min(1).max(200),
  organisatieNaam:  z.string().min(1).max(200),
  gemeente:         z.string().min(1).max(100),
  datum:            z.string().min(1),
  aantalDeelnemers: z.number().int().min(1).max(10000),
  doelgroepen:      z.array(z.string()).min(1).max(10),
  themas:           z.array(z.string()).min(1).max(10),
  aantalSessies:    z.number().int().min(1).max(50),
  tevredenheid:     z.number().min(1).max(10),
  subsidiegever:    z.string().max(200).optional(),
});

function buildPrompt(data: z.infer<typeof Schema>): string {
  let datumFormatted = data.datum;
  try {
    datumFormatted = new Date(data.datum).toLocaleDateString("nl-NL", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch { /* keep raw if parse fails */ }

  const tevredenheidLabel =
    data.tevredenheid >= 9 ? "uitstekend" :
    data.tevredenheid >= 7 ? "goed" : "voldoende";

  const subsidieRegel = data.subsidiegever
    ? `Subsidiegever: ${data.subsidiegever}`
    : "Subsidiegever: gemeente/fonds (niet nader gespecificeerd)";

  return `Schrijf een volledig, professioneel WMO-impactrapport in het Nederlands. \
Dit rapport moet direct bruikbaar zijn als bijlage bij een subsidieaanvraag of verantwoording aan een gemeente.

Gegevens:
- Evenement: "${data.evenementNaam}"
- Organisatie: ${data.organisatieNaam}
- Datum: ${datumFormatted}
- Gemeente/regio: ${data.gemeente}
- Aantal deelnemers: ${data.aantalDeelnemers}
- Doelgroepen: ${data.doelgroepen.join(", ")}
- Thema's: ${data.themas.join(", ")}
- Aantal sessies/workshops: ${data.aantalSessies}
- Gemiddelde tevredenheid: ${data.tevredenheid}/10 (${tevredenheidLabel})
- ${subsidieRegel}

Schrijf het rapport uitsluitend in HTML. Gebruik ALLEEN deze tags: h2, h3, p, ul, li, strong, em.
Geen uitleg. Geen markdown-codeblokken. Alleen de HTML-inhoud.

Gebruik PRECIES deze h2-secties, in deze volgorde:

<h2>Samenvatting</h2>
Drie krachtige zinnen: wat was het evenement, hoeveel mensen zijn bereikt, wat is het kernresultaat. \
Schrijf in de derde persoon over ${data.organisatieNaam}.

<h2>Bereik en deelname</h2>
Kwantificeer precies. Bereken: totaal contactmomenten (deelnemers × sessies = ${data.aantalDeelnemers * data.aantalSessies}), \
gemiddelde sessiegrootte, bereikpercentage als % van de gemeente/regio. \
Gebruik harde getallen en concrete percentages.

<h2>Doelgroepanalyse</h2>
Behandel elke doelgroep apart. Beschrijf per groep: \
het geschatte aandeel in de totale deelnemersgroep, \
de specifieke relevantie voor WMO-prestatievelden, \
en de concrete meerwaarde voor die groep.

<h2>Programma en methodiek</h2>
Beschrijf de aanpak en methodieken die passen bij de opgegeven thema's. \
Benoem: sessie-opzet, didactische vormen (ervarend leren, peer-to-peer, workshopvorm etc.), \
hoe de thema's operationeel zijn gemaakt.

<h2>Resultaten en maatschappelijke impact</h2>
Dit is de kernparagraaf. Kwantificeer de impact per thema: \
hoeveel mensen zijn bereikt per thema, \
welk effect is bereikt op zelfredzaamheid/participatie/sociale cohesie. \
Gebruik WMO-terminologie consequent. \
Waar relevant: bereken kostenbesparing of voorkomen van zwaardere zorg.

<h2>WMO-verantwoording</h2>
Koppel expliciet aan WMO 2015, artikel 2.2.3 lid 1 \
(bevordering zelfredzaamheid en participatie) en andere van toepassing zijnde artikelen. \
Schrijf deze paragraaf als tekst die direct in een subsidieaanvraag of verantwoordingsdocument past. \
Noem de beleidsdoelen van de gemeente concreet.

<h2>Conclusie en aanbevelingen</h2>
Slotbeoordeling in twee zinnen. \
Daarna drie concrete, uitvoerbare aanbevelingen voor continuering en uitbreiding.

Toon: formeel, zakelijk, gezaghebbend. Schrijf in de derde persoon over ${data.organisatieNaam}.
Gebruik specifieke getallen — bereken ze op basis van de invoer. Geen vage formuleringen.
Geef ALLEEN de HTML terug.`;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`rapport-gen:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({ error: "Limiet bereikt. Probeer het over een uur opnieuw." }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return new Response("Invalid JSON", { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Ongeldige invoer" }),
      { status: 422, headers: { "Content-Type": "application/json" } },
    );
  }

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
      "X-Title":      "Bijeen Impactrapport Generator",
    },
    body: JSON.stringify({
      model,
      stream:      true,
      max_tokens:  2000,
      temperature: 0.45,
      messages:    [{ role: "user", content: prompt }],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("AI aanroep mislukt", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type":      "text/event-stream",
      "Cache-Control":     "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
