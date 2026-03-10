import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, organizations, subscriptions, events, attendees, networkMatches, surveyResponses } from "@/db";
import { count, desc, gte, inArray } from "drizzle-orm";

function isAdmin(email: string | null | undefined) {
  const adminEmail = process.env.ADMIN_EMAIL;
  return adminEmail && email === adminEmail;
}

export async function POST() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY niet ingesteld" }, { status: 500 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Gather platform data
  const [allOrgs, allSubs, allEventsList] = await Promise.all([
    db.select().from(organizations),
    db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt)),
    db.select().from(events),
  ]);

  // Latest sub per org (first = latest due to desc order)
  const latestSubMap = new Map<string, typeof allSubs[0]>();
  for (const sub of allSubs) {
    if (!latestSubMap.has(sub.organizationId)) {
      latestSubMap.set(sub.organizationId, sub);
    }
  }

  // Events per org
  const eventsPerOrg = new Map<string, number>();
  for (const ev of allEventsList) {
    if (ev.organizationId) {
      eventsPerOrg.set(ev.organizationId, (eventsPerOrg.get(ev.organizationId) ?? 0) + 1);
    }
  }

  // Recent activity per org (events last 30 days)
  const recentEventsPerOrg = new Map<string, number>();
  for (const ev of allEventsList) {
    if (ev.organizationId && ev.createdAt && new Date(ev.createdAt) >= thirtyDaysAgo) {
      recentEventsPerOrg.set(ev.organizationId, (recentEventsPerOrg.get(ev.organizationId) ?? 0) + 1);
    }
  }

  // Platform metrics
  const planCounts = { trial: 0, starter: 0, groei: 0, organisatie: 0 };
  let arr = 0;
  for (const sub of Array.from(latestSubMap.values())) {
    const key = sub.plan as keyof typeof planCounts;
    if (key in planCounts) planCounts[key]++;
    if (sub.amountPaid && sub.plan !== "trial" && sub.status === "active") {
      arr += sub.amountPaid;
    }
  }

  // Org snapshots
  const orgSnapshots = allOrgs.map(org => {
    const sub = latestSubMap.get(org.id);
    const isExpired = sub?.expiresAt && new Date(sub.expiresAt) < now;
    const daysToExpiry = sub?.expiresAt
      ? Math.ceil((new Date(sub.expiresAt).getTime() - now.getTime()) / 86400000)
      : null;
    const eventCount = eventsPerOrg.get(org.id) ?? 0;
    const recentEvents = recentEventsPerOrg.get(org.id) ?? 0;
    const daysOld = Math.floor((now.getTime() - new Date(org.createdAt!).getTime()) / 86400000);

    return {
      naam: org.name,
      plan: sub?.plan ?? "geen",
      status: sub?.status ?? "geen",
      verlooptOver: daysToExpiry,
      verlopen: !!isExpired,
      aantalEvents: eventCount,
      eventsLaatste30Dagen: recentEvents,
      aangemeldDagenGeleden: daysOld,
      planLimiet: sub?.plan === "starter" ? 6 : sub?.plan === "groei" ? 20 : sub?.plan === "trial" ? 1 : 9999,
    };
  });

  const platformData = {
    datum: now.toLocaleDateString("nl-NL"),
    totalOrganisaties: allOrgs.length,
    planVerdeling: planCounts,
    arrCents: arr,
    arrEuros: Math.round(arr / 100),
    mrrEuros: Math.round(arr / 1200),
    totalEvents: allEventsList.length,
    eventsLaatste30Dagen: allEventsList.filter(
      e => e.createdAt && new Date(e.createdAt) >= thirtyDaysAgo
    ).length,
    organisaties: orgSnapshots,
  };

  const prompt = `Je bent een senior SaaS business analyst voor Bijeen, een evenementenplatform voor de Nederlandse welzijnssector (gemeenten, zorginstellingen, maatschappelijke organisaties).

Platform data:
${JSON.stringify(platformData, null, 2)}

Planprijzen: Starter €590/jr, Groei €1.490/jr, Organisatie €3.490/jr
Trialduur: 14 dagen gratis

Analyseer dit platform grondig en geef een JSON response met EXACT deze structuur. Wees specifiek, gebruik echte namen uit de data:

{
  "platformGezondheid": {
    "score": <getal 1-10>,
    "status": "gezond" | "aandacht_nodig" | "kritiek",
    "samenvatting": "<2-3 zinnen over health: ARR, groei, risico's>",
    "sterktes": ["<sterkte 1>", "<sterkte 2>"],
    "zwaktes": ["<zwakte 1>", "<zwakte 2>"]
  },
  "churnRisicos": [
    {
      "orgNaam": "<naam uit data>",
      "reden": "<specifieke reden waarom risico>",
      "urgentie": "hoog" | "gemiddeld" | "laag",
      "actie": "<concrete aanbevolen actie binnen 48u>"
    }
  ],
  "groeikansen": [
    {
      "orgNaam": "<naam uit data>",
      "kans": "<specifieke kans>",
      "upgradeWaarde": <euros per jaar als zij upgraden>,
      "actie": "<concrete salles actie>"
    }
  ],
  "featureAdoptie": {
    "samenvatting": "<observatie over feature gebruik op basis van event/attendee data>",
    "aanbevolen": ["<feature om te promoten 1>", "<feature om te promoten 2>"]
  },
  "aanbevelingen": [
    {
      "prioriteit": "hoog" | "gemiddeld" | "laag",
      "categorie": "product" | "sales" | "support" | "marketing",
      "titel": "<korte titel>",
      "aanbeveling": "<concrete actie>",
      "verwachtImpact": "<meetbaar verwacht effect>"
    }
  ]
}

Max 5 churnRisicos, max 5 groeikansen, max 4 aanbevelingen. Antwoord ALLEEN met valid JSON.`;

  const model = process.env.OPENROUTER_MODEL ?? "google/gemini-2.0-flash-001";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://bijeen.app",
      "X-Title": "Bijeen Admin AI Insights",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.25,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: `AI request mislukt: ${err}` }, { status: 500 });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  try {
    const insights = JSON.parse(content);
    return NextResponse.json(insights);
  } catch {
    return NextResponse.json({ error: "AI response kon niet worden geparsed", raw: content }, { status: 500 });
  }
}
