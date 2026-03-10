import { NextRequest, NextResponse } from "next/server";
import { db, events, attendees } from "@/db";
import { eq, and, not } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/auth";
import { sendEventReminderEmail } from "@/lib/email";
import { formatDateTime } from "@/lib/utils";

// POST — stuur herinnering naar alle geregistreerde deelnemers
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const [event] = await db.select().from(events).where(eq(events.id, params.id));
  if (!event || event.organizationId !== org.id) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";

  // Haal alle aangemelde deelnemers op (niet afwezigen)
  const eventAttendees = await db
    .select()
    .from(attendees)
    .where(
      and(
        eq(attendees.eventId, params.id),
        not(eq(attendees.status, "afwezig")),
        not(attendees.emailOptOut)
      )
    );

  // Stuur emails parallel (max 50 per keer)
  const batch = eventAttendees.slice(0, 50);
  await Promise.allSettled(
    batch.map(attendee =>
      sendEventReminderEmail({
        to: attendee.email,
        name: attendee.name,
        eventTitle: event.title,
        eventDate: formatDateTime(event.startsAt),
        eventLocation: event.location,
        qrCode: attendee.qrCode!,
        appUrl,
      })
    )
  );

  // Markeer reminder als verzonden
  await db
    .update(events)
    .set({ reminderSentAt: new Date() })
    .where(eq(events.id, params.id));

  return NextResponse.json({ sent: batch.length });
}
