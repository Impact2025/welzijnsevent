import { NextResponse } from "next/server";
import { db, events, sessions, ticketTypes, attendees, waitlist } from "@/db";
import { eq, asc, count } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.slug, params.slug));

  if (!event || !event.isPublic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const eventSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.eventId, event.id))
    .orderBy(asc(sessions.sortOrder));

  const tickets = await db
    .select()
    .from(ticketTypes)
    .where(eq(ticketTypes.eventId, event.id))
    .orderBy(asc(ticketTypes.sortOrder));

  const [{ value: attendeeCount }] = await db
    .select({ value: count() })
    .from(attendees)
    .where(eq(attendees.eventId, event.id));

  const [{ value: waitlistCount }] = await db
    .select({ value: count() })
    .from(waitlist)
    .where(eq(waitlist.eventId, event.id));

  return NextResponse.json({
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description,
    tagline: event.tagline,
    location: event.location,
    address: event.address,
    coverImage: event.coverImage,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    websiteColor: event.websiteColor,
    sessions: eventSessions,
    ticketTypes: tickets.filter(t => t.isActive),
    maxAttendees: event.maxAttendees,
    waitlistEnabled: event.waitlistEnabled,
    attendeeCount,
    waitlistCount,
    isFull: event.maxAttendees ? attendeeCount >= event.maxAttendees : false,
  });
}
