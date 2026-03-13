import { NextResponse } from "next/server";
import { db, attendees, events } from "@/db";
import { eq, and } from "drizzle-orm";

// GET /api/attendees/by-token?token=[qrCode]&slug=[eventSlug]
// Public endpoint — token IS the secret. No other auth needed.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const slug  = searchParams.get("slug");

  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });

  const [attendee] = await db
    .select()
    .from(attendees)
    .where(eq(attendees.qrCode, token));

  if (!attendee) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If a slug is provided, validate attendee belongs to that event
  if (slug) {
    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.slug, slug), eq(events.id, attendee.eventId)));

    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ attendee, event });
  }

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, attendee.eventId));

  return NextResponse.json({ attendee, event });
}
