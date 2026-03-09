import { NextResponse } from "next/server";
import { db, attendees, events } from "@/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { sendRegistrationConfirmation } from "@/lib/email";
import { formatDateTime } from "@/lib/utils";

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
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const [attendee] = await db
      .insert(attendees)
      .values({
        eventId: body.eventId,
        name: body.name,
        email: body.email,
        organization: body.organization,
        role: body.role,
        interests: body.interests ?? [],
        status: "aangemeld",
        qrCode: randomUUID(),
      })
      .returning();

    // Stuur bevestigingsmail (non-blocking — laat registratie niet mislukken als mail faalt)
    if (attendee.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      // Fetch event voor datum en locatie
      db.select()
        .from(events)
        .where(eq(events.id, body.eventId))
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
          }).catch((err) => console.error("Bevestigingsmail mislukt:", err));
        })
        .catch((err) => console.error("Event ophalen voor mail mislukt:", err));
    }

    return NextResponse.json({ attendee }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
