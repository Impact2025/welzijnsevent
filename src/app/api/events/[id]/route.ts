import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, events, sessions, attendees } from "@/db";
import {
  sessionRegistrations, networkMatches, feedback, surveyResponses,
  qaMessages, polls, socialWallPosts, waitlist, orders, customFormFields,
  crmActivities, volunteerMessages, volunteerProfiles, ticketTypes,
} from "@/db";
import { eq, count, and, inArray } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const org = await getCurrentOrg();
    if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

    const [event] = await db.select().from(events).where(
      and(eq(events.id, params.id), eq(events.organizationId, org.id))
    );
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const eventSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.eventId, params.id));

    const [{ count: attendeeCount }] = await db
      .select({ count: count() })
      .from(attendees)
      .where(eq(attendees.eventId, params.id));

    return NextResponse.json({ event: { ...event, sessions: eventSessions, attendeeCount } });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const org = await getCurrentOrg();
    if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

    // Verify ownership
    const [existing] = await db.select({ id: events.id }).from(events).where(
      and(eq(events.id, params.id), eq(events.organizationId, org.id))
    );
    if (!existing) return NextResponse.json({ error: "Niet gevonden of geen toegang" }, { status: 403 });

    const body = await req.json();

    // Whitelist updatable fields — never allow organizationId to be changed
    const {
      title, description, tagline, location, address, startsAt, endsAt,
      isPublic, status, slug, maxAttendees, waitlistEnabled, coverImage,
      websiteColor, websiteFont, surveyEnabled, reminderSentAt, thankYouSentAt,
    } = body;

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (title            !== undefined) patch.title            = title;
    if (description      !== undefined) patch.description      = description;
    if (tagline          !== undefined) patch.tagline          = tagline;
    if (location         !== undefined) patch.location         = location;
    if (address          !== undefined) patch.address          = address;
    if (startsAt         !== undefined) patch.startsAt         = new Date(startsAt);
    if (endsAt           !== undefined) patch.endsAt           = new Date(endsAt);
    if (isPublic         !== undefined) patch.isPublic         = isPublic;
    if (status           !== undefined) patch.status           = status;
    if (slug             !== undefined) patch.slug             = slug;
    if (maxAttendees     !== undefined) patch.maxAttendees     = maxAttendees;
    if (waitlistEnabled  !== undefined) patch.waitlistEnabled  = waitlistEnabled;
    if (coverImage       !== undefined) patch.coverImage       = coverImage;
    if (websiteColor     !== undefined) patch.websiteColor     = websiteColor;
    if (websiteFont      !== undefined) patch.websiteFont      = websiteFont;
    if (surveyEnabled    !== undefined) patch.surveyEnabled    = surveyEnabled;
    if (reminderSentAt   !== undefined) patch.reminderSentAt   = reminderSentAt ? new Date(reminderSentAt) : null;
    if (thankYouSentAt   !== undefined) patch.thankYouSentAt   = thankYouSentAt ? new Date(thankYouSentAt) : null;

    const [updated] = await db
      .update(events)
      .set(patch)
      .where(eq(events.id, params.id))
      .returning();

    return NextResponse.json({ event: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const org = await getCurrentOrg();
    if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

    // Verify ownership
    const [existing] = await db.select({ id: events.id }).from(events).where(
      and(eq(events.id, params.id), eq(events.organizationId, org.id))
    );
    if (!existing) return NextResponse.json({ error: "Niet gevonden of geen toegang" }, { status: 403 });

    const { id } = params;

    // Collect child IDs needed for cascaded manual deletes
    const [eventSessions, eventAttendees] = await Promise.all([
      db.select({ id: sessions.id }).from(sessions).where(eq(sessions.eventId, id)),
      db.select({ id: attendees.id }).from(attendees).where(eq(attendees.eventId, id)),
    ]);
    const sessionIds  = eventSessions.map(s => s.id);
    const attendeeIds = eventAttendees.map(a => a.id);

    // 1. Session registrations (refs sessions — no cascade)
    if (sessionIds.length > 0) {
      await db.delete(sessionRegistrations).where(inArray(sessionRegistrations.sessionId, sessionIds));
    }

    // 2. Network matches (refs event — no cascade)
    await db.delete(networkMatches).where(eq(networkMatches.eventId, id));

    // 3. Feedback (refs event — no cascade)
    await db.delete(feedback).where(eq(feedback.eventId, id));

    // 4. Survey responses (refs event — no cascade)
    await db.delete(surveyResponses).where(eq(surveyResponses.eventId, id));

    // 5. Q&A messages (refs event — no cascade)
    await db.delete(qaMessages).where(eq(qaMessages.eventId, id));

    // 6. Polls (refs event — no cascade)
    await db.delete(polls).where(eq(polls.eventId, id));

    // 7. Social wall posts (refs event — no cascade)
    await db.delete(socialWallPosts).where(eq(socialWallPosts.eventId, id));

    // 8. Waitlist (refs event — no cascade)
    await db.delete(waitlist).where(eq(waitlist.eventId, id));

    // 9. Orders (refs event — no cascade)
    await db.delete(orders).where(eq(orders.eventId, id));

    // 10. Custom form fields (refs event — no cascade)
    await db.delete(customFormFields).where(eq(customFormFields.eventId, id));

    // 11. CRM activities — nullify eventId to preserve contact history
    await db.update(crmActivities).set({ eventId: null }).where(eq(crmActivities.eventId, id));

    // 12. Volunteer messages — nullify eventId to preserve message history
    await db.update(volunteerMessages).set({ eventId: null }).where(eq(volunteerMessages.eventId, id));

    // 13. Volunteer profiles — nullify attendeeId (profiles belong to org, not event)
    if (attendeeIds.length > 0) {
      await db.update(volunteerProfiles)
        .set({ attendeeId: null })
        .where(inArray(volunteerProfiles.attendeeId, attendeeIds));
    }

    // 14. Ticket types (refs event — no cascade)
    await db.delete(ticketTypes).where(eq(ticketTypes.eventId, id));

    // 15. Sessions (refs event — no cascade; sessionRegistrations already cleaned)
    await db.delete(sessions).where(eq(sessions.eventId, id));

    // 16. Attendees (refs event — no cascade; children already cleaned)
    await db.delete(attendees).where(eq(attendees.eventId, id));

    // 17. Delete the event — DB cascades remaining children:
    //     speakers, sponsors, pushSubscriptions, volunteerVacancies,
    //     attendeePoints, attendeeBadges (all have onDelete: cascade)
    await db.delete(events).where(eq(events.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/events/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
