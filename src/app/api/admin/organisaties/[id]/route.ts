import { NextRequest, NextResponse } from "next/server";
import { db, organizations, events, attendees, subscriptions, adminAuditLog } from "@/db";
import { eq, count, desc } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!session?.user?.id || !adminEmail || session.user.email !== adminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [org] = await db.select().from(organizations).where(eq(organizations.id, params.id));
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [orgEvents, allSubs, auditEntries] = await Promise.all([
    db.select().from(events).where(eq(events.organizationId, org.id)).orderBy(desc(events.startsAt)),
    db.select().from(subscriptions).where(eq(subscriptions.organizationId, org.id)).orderBy(desc(subscriptions.createdAt)),
    db.select().from(adminAuditLog).where(eq(adminAuditLog.targetOrgId, org.id)).orderBy(desc(adminAuditLog.createdAt)).limit(20),
  ]);

  const eventIds = orgEvents.map(e => e.id);
  const attendeeCounts = eventIds.length > 0
    ? await db.select({ eventId: attendees.eventId, count: count() })
        .from(attendees)
        .where(eq(attendees.eventId, eventIds[0])) // fallback, we do per-event below
        .groupBy(attendees.eventId)
    : [];

  // Per-event attendee counts
  let perEventCounts: Record<string, number> = {};
  if (eventIds.length > 0) {
    const rows = await Promise.all(
      eventIds.map(eid =>
        db.select({ c: count() }).from(attendees).where(eq(attendees.eventId, eid))
      )
    );
    eventIds.forEach((eid, i) => { perEventCounts[eid] = Number(rows[i][0]?.c ?? 0); });
  }

  const totalAttendees = Object.values(perEventCounts).reduce((a, b) => a + b, 0);
  const latestSub = allSubs[0] ?? null;

  const eventsWithCounts = orgEvents.map(e => ({
    ...e,
    attendeeCount: perEventCounts[e.id] ?? 0,
  }));

  return NextResponse.json({
    org,
    subscription: latestSub,
    subscriptionHistory: allSubs,
    events: eventsWithCounts,
    totalAttendees,
    auditLog: auditEntries,
  });
}
