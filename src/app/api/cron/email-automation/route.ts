/**
 * Vercel Cron — draait elk uur
 * Schedule: "0 * * * *"
 *
 * Doet automatisch:
 * 1. Herinnering 24u vóór evenement (reminder)
 * 2. Bedankmail + survey 2u ná afloop (thank-you)
 */
import { NextResponse } from "next/server";
import { db, events, attendees, organizations } from "@/db";
import { eq, and, isNull, not, gte, lte } from "drizzle-orm";
import { sendEventReminderEmail, sendThankYouWithSurveyEmail } from "@/lib/email";
import { formatDateTime } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  // Vercel cron authenticatie
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";
  const results: string[] = [];

  // ── 1. Herinneringen: events die over 20-28u beginnen ────────────────────────
  const reminderWindowStart = new Date(now.getTime() + 20 * 60 * 60 * 1000); // +20h
  const reminderWindowEnd   = new Date(now.getTime() + 28 * 60 * 60 * 1000); // +28h

  const eventsForReminder = await db
    .select()
    .from(events)
    .where(
      and(
        isNull(events.reminderSentAt),
        gte(events.startsAt, reminderWindowStart),
        lte(events.startsAt, reminderWindowEnd),
        not(eq(events.status, "draft")),
        not(eq(events.status, "ended"))
      )
    );

  for (const event of eventsForReminder) {
    const [org] = event.organizationId
      ? await db.select().from(organizations).where(eq(organizations.id, event.organizationId))
      : [null];

    const eventAttendees = await db
      .select()
      .from(attendees)
      .where(
        and(
          eq(attendees.eventId, event.id),
          not(eq(attendees.status, "afwezig")),
          not(attendees.emailOptOut)
        )
      );

    let sent = 0;
    for (const attendee of eventAttendees) {
      try {
        await sendEventReminderEmail({
          to:            attendee.email,
          name:          attendee.name,
          eventTitle:    event.title,
          eventDate:     formatDateTime(event.startsAt),
          eventLocation: event.location,
          qrCode:        attendee.qrCode ?? "",
          appUrl,
          orgName:       org?.name,
          orgLogo:       org?.logo,
          orgColor:      org?.primaryColor,
        });
        sent++;
      } catch (err) {
        console.error(`[cron] Reminder mislukt voor ${attendee.email}:`, err);
      }
    }

    await db.update(events).set({ reminderSentAt: new Date() }).where(eq(events.id, event.id));
    results.push(`reminder:${event.title} → ${sent} emails`);
    console.log(`[cron] Reminder: ${event.title} → ${sent} deelnemers`);
  }

  // ── 2. Bedankmails: events die 1-3u geleden zijn afgelopen ───────────────────
  const thankYouWindowStart = new Date(now.getTime() - 3 * 60 * 60 * 1000); // -3h
  const thankYouWindowEnd   = new Date(now.getTime() - 1 * 60 * 60 * 1000); // -1h

  const eventsForThankYou = await db
    .select()
    .from(events)
    .where(
      and(
        isNull(events.thankYouSentAt),
        gte(events.endsAt, thankYouWindowStart),
        lte(events.endsAt, thankYouWindowEnd)
      )
    );

  for (const event of eventsForThankYou) {
    if (!event.slug) continue;

    const checkedIn = await db
      .select()
      .from(attendees)
      .where(
        and(
          eq(attendees.eventId, event.id),
          eq(attendees.status, "ingecheckt"),
          not(attendees.emailOptOut)
        )
      );

    let sent = 0;
    for (const attendee of checkedIn) {
      try {
        await sendThankYouWithSurveyEmail({
          to:         attendee.email,
          name:       attendee.name,
          eventTitle: event.title,
          eventSlug:  event.slug,
          attendeeId: attendee.id,
          appUrl,
        });
        sent++;
      } catch (err) {
        console.error(`[cron] Thank-you mislukt voor ${attendee.email}:`, err);
      }
    }

    // Auto-set status naar "ended"
    await db.update(events)
      .set({ thankYouSentAt: new Date(), status: "ended" })
      .where(eq(events.id, event.id));

    results.push(`thank-you:${event.title} → ${sent} emails`);
    console.log(`[cron] Thank-you: ${event.title} → ${sent} deelnemers`);
  }

  console.log(`[cron] email-automation klaar. ${results.length} acties.`);
  return NextResponse.json({
    ok: true,
    timestamp: now.toISOString(),
    actions: results,
  });
}
