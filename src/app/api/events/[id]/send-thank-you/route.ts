import { NextRequest, NextResponse } from "next/server";
import { db, events, attendees } from "@/db";
import { eq, and, not } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/auth";
import { sendThankYouWithSurveyEmail } from "@/lib/email";

// POST — stuur bedankmail + survey-link naar ingecheckte deelnemers
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

  if (!event.slug) {
    return NextResponse.json({ error: "Event heeft geen slug" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";

  // Stuur alleen naar ingecheckte deelnemers (die er ook echt waren)
  const checkedIn = await db
    .select()
    .from(attendees)
    .where(
      and(
        eq(attendees.eventId, params.id),
        eq(attendees.status, "ingecheckt"),
        not(attendees.emailOptOut)
      )
    );

  await Promise.allSettled(
    checkedIn.map(attendee =>
      sendThankYouWithSurveyEmail({
        to: attendee.email,
        name: attendee.name,
        eventTitle: event.title,
        eventSlug: event.slug!,
        attendeeId: attendee.id,
        appUrl,
      })
    )
  );

  await db
    .update(events)
    .set({ thankYouSentAt: new Date() })
    .where(eq(events.id, params.id));

  return NextResponse.json({ sent: checkedIn.length });
}
