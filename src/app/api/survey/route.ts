import { NextRequest, NextResponse } from "next/server";
import { db, events, surveyResponses, attendees } from "@/db";
import { eq, and } from "drizzle-orm";

// GET — haal survey info op voor een event (publiek, via slug)
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const eventId = req.nextUrl.searchParams.get("eventId");

  let event;
  if (slug) {
    [event] = await db.select().from(events).where(eq(events.slug, slug));
  } else if (eventId) {
    [event] = await db.select().from(events).where(eq(events.id, eventId));
  } else {
    return NextResponse.json({ error: "slug of eventId vereist" }, { status: 400 });
  }

  if (!event) return NextResponse.json({ error: "Evenement niet gevonden" }, { status: 404 });
  if (!event.surveyEnabled) {
    return NextResponse.json({ error: "Tevredenheidsonderzoek niet actief" }, { status: 404 });
  }

  return NextResponse.json({
    eventId: event.id,
    eventTitle: event.title,
    surveyQuestions: event.surveyQuestions ?? [],
  });
}

// POST — sla survey antwoord op (publiek, na event)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    eventId,
    attendeeId,
    overallRating,
    npsScore,
    highlights,
    improvements,
    wouldRecommend,
    customAnswers,
  } = body;

  if (!eventId) return NextResponse.json({ error: "eventId vereist" }, { status: 400 });
  if (overallRating !== undefined && (overallRating < 1 || overallRating > 5)) {
    return NextResponse.json({ error: "Beoordeling moet tussen 1 en 5 zijn" }, { status: 400 });
  }
  if (npsScore !== undefined && (npsScore < 0 || npsScore > 10)) {
    return NextResponse.json({ error: "NPS score moet tussen 0 en 10 zijn" }, { status: 400 });
  }

  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event || !event.surveyEnabled) {
    return NextResponse.json({ error: "Tevredenheidsonderzoek niet actief" }, { status: 404 });
  }

  // Controleer of attendee al ingevuld heeft (voorkomt dubbele responses)
  if (attendeeId) {
    const [existing] = await db
      .select()
      .from(surveyResponses)
      .where(and(eq(surveyResponses.eventId, eventId), eq(surveyResponses.attendeeId, attendeeId)));
    if (existing) {
      return NextResponse.json({ error: "Je hebt al een enquête ingevuld" }, { status: 409 });
    }
  }

  const [response] = await db
    .insert(surveyResponses)
    .values({
      eventId,
      attendeeId: attendeeId ?? null,
      overallRating: overallRating ?? null,
      npsScore: npsScore ?? null,
      highlights: highlights?.trim() ?? null,
      improvements: improvements?.trim() ?? null,
      wouldRecommend: wouldRecommend ?? null,
      customAnswers: customAnswers ?? {},
    })
    .returning();

  return NextResponse.json(response, { status: 201 });
}
