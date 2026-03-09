import { NextResponse } from "next/server";
import { db, events, sessions, attendees } from "@/db";
import { eq, count, desc } from "drizzle-orm";

export async function GET() {
  try {
    const allEvents = await db
      .select()
      .from(events)
      .orderBy(desc(events.startsAt));

    // Enrich with attendee counts
    const enriched = await Promise.all(
      allEvents.map(async (event) => {
        const [result] = await db
          .select({ count: count() })
          .from(attendees)
          .where(eq(attendees.eventId, event.id));
        return { ...event, attendeeCount: result.count };
      })
    );

    return NextResponse.json({ events: enriched });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Genereer slug uit titel als niet opgegeven
    const slug = body.slug
      ? body.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);

    const [event] = await db.insert(events).values({
      title:        body.title,
      description:  body.description,
      location:     body.location,
      startsAt:     new Date(body.startsAt),
      endsAt:       new Date(body.endsAt),
      maxAttendees: body.maxAttendees,
      status:       "draft",
      slug,
      isPublic:     body.isPublic ?? false,
      tagline:      body.tagline ?? null,
    }).returning();

    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
