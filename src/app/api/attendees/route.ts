import { NextResponse } from "next/server";
import { db, attendees, events, waitlist } from "@/db";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { sendRegistrationConfirmation } from "@/lib/email";
import { formatDateTime } from "@/lib/utils";
import { AttendeeSchema, validationError } from "@/lib/validation";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

    const list = await db
      .select()
      .from(attendees)
      .where(eq(attendees.eventId, eventId));

    return NextResponse.json({ attendees: list });
  } catch (err) {
    console.error("[attendees GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Rate limit: max 10 registraties per IP per 10 minuten
  const ip = getClientIp(req);
  const rl = rateLimit(`attendees:${ip}`, 10, 10 * 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const parsed = AttendeeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error), { status: 422 });
    }

    const data = parsed.data;
    const waitlistToken = body.waitlistToken as string | undefined;

    const [attendee] = await db
      .insert(attendees)
      .values({
        eventId:      data.eventId,
        name:         data.name,
        email:        data.email,
        organization: data.organization,
        role:         data.role,
        interests:    data.interests,
        status:       "aangemeld",
        qrCode:       randomUUID(),
      })
      .returning();

    // Markeer wachtlijst-entry als ingevuld (als aangemeld via magic link)
    if (waitlistToken) {
      db.update(waitlist)
        .set({ status: "promoted" })
        .where(and(eq(waitlist.token, waitlistToken), eq(waitlist.eventId, data.eventId)))
        .catch(err => console.error("[waitlist] Token markering mislukt:", err));
    }

    // Stuur bevestigingsmail (non-blocking — laat registratie niet mislukken als mail faalt)
    if (attendee.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      db.select()
        .from(events)
        .where(eq(events.id, data.eventId))
        .then(([event]) => {
          if (!event) return;
          sendRegistrationConfirmation({
            to: attendee.email,
            name: attendee.name,
            eventTitle: event.title,
            eventDate: formatDateTime(event.startsAt),
            eventLocation: event.location,
            qrCode: attendee.qrCode!,
            appUrl,
          }).catch((err) => console.error("[email] Bevestigingsmail mislukt:", err));
        })
        .catch((err) => console.error("[email] Event ophalen mislukt:", err));
    }

    return NextResponse.json({ attendee }, { status: 201 });
  } catch (err) {
    console.error("[attendees POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
