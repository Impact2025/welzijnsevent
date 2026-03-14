import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, events, sessions, attendees } from "@/db";
import { eq, count, and } from "drizzle-orm";
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

    // Verify ownership before deleting
    const [existing] = await db.select({ id: events.id }).from(events).where(
      and(eq(events.id, params.id), eq(events.organizationId, org.id))
    );
    if (!existing) return NextResponse.json({ error: "Niet gevonden of geen toegang" }, { status: 403 });

    await db.delete(events).where(eq(events.id, params.id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
