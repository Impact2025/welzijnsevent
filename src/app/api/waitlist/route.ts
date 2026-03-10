import { NextResponse } from "next/server";
import { db, waitlist, events, attendees } from "@/db";
import { eq, count, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { sendWaitlistConfirmation } from "@/lib/email";
import { WaitlistSchema, validationError } from "@/lib/validation";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

// GET ?eventId= — wachtlijst ophalen (voor organizer dashboard)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

    const list = await db
      .select()
      .from(waitlist)
      .where(eq(waitlist.eventId, eventId))
      .orderBy(waitlist.position);

    return NextResponse.json({ waitlist: list });
  } catch (err) {
    console.error("[waitlist GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — aanmelden op wachtlijst (publiek)
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`waitlist:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const parsed = WaitlistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error), { status: 422 });
    }

    const data = parsed.data;

    // Controleer of event bestaat en wachtlijst aan staat
    const [event] = await db.select().from(events).where(eq(events.id, data.eventId));
    if (!event) return NextResponse.json({ error: "Event niet gevonden" }, { status: 404 });
    if (!event.waitlistEnabled) {
      return NextResponse.json({ error: "Wachtlijst is niet actief voor dit event" }, { status: 400 });
    }

    // Controleer of event echt vol is
    const [{ value: attendeeCount }] = await db
      .select({ value: count() })
      .from(attendees)
      .where(eq(attendees.eventId, data.eventId));

    if (event.maxAttendees && attendeeCount < event.maxAttendees) {
      return NextResponse.json({ error: "Er zijn nog plekken beschikbaar — meld je gewoon aan" }, { status: 400 });
    }

    // Bepaal positie (huidige wachtlijstlengte + 1)
    const [{ value: currentLength }] = await db
      .select({ value: count() })
      .from(waitlist)
      .where(and(eq(waitlist.eventId, data.eventId), eq(waitlist.status, "waiting")));

    const position = Number(currentLength) + 1;
    const token = randomUUID();

    const [entry] = await db
      .insert(waitlist)
      .values({
        eventId:      data.eventId,
        name:         data.name,
        email:        data.email,
        organization: data.organization,
        role:         data.role,
        interests:    data.interests,
        position,
        status:       "waiting",
        token,
      })
      .returning();

    // Bevestigingsmail (non-blocking)
    sendWaitlistConfirmation({
      to: entry.email,
      name: entry.name,
      eventTitle: event.title,
      position,
    }).catch(err => console.error("[email] Wachtlijstbevestiging mislukt:", err));

    return NextResponse.json({ entry, position }, { status: 201 });
  } catch (err) {
    console.error("[waitlist POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
