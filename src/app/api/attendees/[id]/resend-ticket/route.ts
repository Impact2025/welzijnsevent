import { NextRequest, NextResponse } from "next/server";
import { db, attendees, events, organizations } from "@/db";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/auth";
import { sendRegistrationConfirmation } from "@/lib/email";
import { formatDateTime } from "@/lib/utils";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const [attendee] = await db.select().from(attendees).where(eq(attendees.id, params.id));
  if (!attendee) return NextResponse.json({ error: "Deelnemer niet gevonden" }, { status: 404 });

  const [event] = await db.select().from(events).where(eq(events.id, attendee.eventId));
  if (!event || event.organizationId !== org.id) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  if (!attendee.qrCode) {
    return NextResponse.json({ error: "Geen QR-code beschikbaar" }, { status: 400 });
  }

  const [eventOrg] = await db.select().from(organizations).where(eq(organizations.id, event.organizationId!));
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";
  await sendRegistrationConfirmation({
    to:            attendee.email,
    name:          attendee.name,
    eventTitle:    event.title,
    eventDate:     formatDateTime(event.startsAt),
    eventLocation: event.location,
    qrCode:        attendee.qrCode,
    appUrl,
    orgName:  eventOrg?.name,
    orgLogo:  eventOrg?.logo,
    orgColor: eventOrg?.primaryColor,
  });

  return NextResponse.json({ sent: true });
}
