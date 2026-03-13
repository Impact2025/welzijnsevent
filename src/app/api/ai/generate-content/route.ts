import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

const Schema = z.object({
  type:    z.enum(["description", "tagline", "bio", "session", "email_subject"]),
  context: z.record(z.string()).default({}),
});

const PROMPTS: Record<string, (ctx: Record<string, string>) => string> = {
  description: ctx => `Schrijf een aansprekende evenementbeschrijving in het Nederlands voor een welzijnsorganisatie.
Evenementtitel: "${ctx.title ?? ""}"
Type: ${ctx.type ?? "bijeenkomst"}
Doelgroep: ${ctx.audience ?? "welzijnsprofessionals"}
Schrijf 2-3 alinea's die uitnodigen, inspireren en de meerwaarde duidelijk maken. Gebruik een warme, professionele toon.`,

  tagline: ctx => `Bedenk 3 pakkende taglines voor dit evenement. Elk max 10 woorden. Geef alleen de taglines terug, één per regel, zonder nummering.
Evenementtitel: "${ctx.title ?? ""}"
Type: ${ctx.type ?? "bijeenkomst"}`,

  bio: ctx => `Schrijf een professionele sprekersbio in het Nederlands (3-4 zinnen).
Naam: ${ctx.name ?? ""}
Functie/bedrijf: ${ctx.company ?? ""}
Expertise/onderwerpen: ${ctx.expertise ?? ""}
Maak het persoonlijk en inspirerend, geschikt voor een evenementpagina.`,

  session: ctx => `Schrijf een pakkende sessiebeschrijving in het Nederlands voor een evenementprogramma (2-3 zinnen).
Sessietitel: "${ctx.title ?? ""}"
Spreker: ${ctx.speaker ?? ""}
Schrijf wat deelnemers leren of ervaren. Gebruik actieve taal.`,

  email_subject: ctx => `Bedenk 3 pakkende e-mailonderwerpregels voor een evenementuitnodiging. Max 8 woorden elk. Geef alleen de onderwerpregels terug, één per regel.
Evenementtitel: "${ctx.title ?? ""}"`,
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = getClientIp(req);
  const rl = rateLimit(`ai-content:${session.user.id}`, 30, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 422 });

  const { type, context } = parsed.data;
  const prompt = PROMPTS[type](context);

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI niet geconfigureerd" }, { status: 500 });

  const model = process.env.OPENROUTER_MODEL ?? "google/gemini-2.0-flash-001";

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://bijeen.app",
      "X-Title": "Bijeen Content Generator",
    },
    body: JSON.stringify({
      model,
      max_tokens: 400,
      temperature: 0.8,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) return NextResponse.json({ error: "AI aanroep mislukt" }, { status: 502 });

  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";

  return NextResponse.json({ text: text.trim() });
}
