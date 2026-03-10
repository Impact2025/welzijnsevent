import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, organizations, subscriptions, events, attendees, adminAuditLog } from "@/db";
import { eq, desc, count, inArray } from "drizzle-orm";

function isAdmin(email: string | null | undefined) {
  const adminEmail = process.env.ADMIN_EMAIL;
  return adminEmail && email === adminEmail;
}

export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const allOrgs = await db.select().from(organizations).orderBy(desc(organizations.createdAt));
  const orgIds = allOrgs.map(o => o.id);

  if (orgIds.length === 0) return NextResponse.json([]);

  const [allSubs, allEventsList] = await Promise.all([
    db.select().from(subscriptions).where(inArray(subscriptions.organizationId, orgIds)).orderBy(desc(subscriptions.createdAt)),
    db.select({ id: events.id, organizationId: events.organizationId }).from(events).where(inArray(events.organizationId, orgIds)),
  ]);

  // Latest sub per org
  const latestSubMap = new Map<string, typeof allSubs[0]>();
  for (const sub of allSubs) {
    if (!latestSubMap.has(sub.organizationId)) {
      latestSubMap.set(sub.organizationId, sub);
    }
  }

  // Event counts per org
  const eventCountsByOrg = new Map<string, number>();
  for (const ev of allEventsList) {
    if (ev.organizationId) {
      eventCountsByOrg.set(ev.organizationId, (eventCountsByOrg.get(ev.organizationId) ?? 0) + 1);
    }
  }

  // Attendee counts via events
  const eventIds = allEventsList.map(e => e.id);
  const eventToOrg = new Map(allEventsList.map(e => [e.id, e.organizationId]));

  const attendeeCounts = eventIds.length > 0
    ? await db.select({ eventId: attendees.eventId, count: count() })
        .from(attendees)
        .where(inArray(attendees.eventId, eventIds))
        .groupBy(attendees.eventId)
    : [];

  const attendeeCountsByOrg = new Map<string, number>();
  for (const r of attendeeCounts) {
    const orgId = eventToOrg.get(r.eventId!);
    if (orgId) {
      attendeeCountsByOrg.set(orgId, (attendeeCountsByOrg.get(orgId) ?? 0) + r.count);
    }
  }

  const result = allOrgs.map(org => ({
    ...org,
    subscription: latestSubMap.get(org.id) ?? null,
    eventCount: eventCountsByOrg.get(org.id) ?? 0,
    attendeeCount: attendeeCountsByOrg.get(org.id) ?? 0,
  }));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { organizationId, plan, status, expiresAt, amountPaid } = body;

  if (!organizationId || !plan) {
    return NextResponse.json({ error: "organizationId en plan zijn verplicht" }, { status: 400 });
  }

  const validPlans = ["trial", "starter", "groei", "organisatie"];
  if (!validPlans.includes(plan)) {
    return NextResponse.json({ error: "Ongeldig plan" }, { status: 400 });
  }

  const org = await db.select({ name: organizations.name })
    .from(organizations).where(eq(organizations.id, organizationId)).limit(1);

  const [newSub] = await db.insert(subscriptions).values({
    organizationId,
    plan,
    status: status ?? "active",
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    amountPaid: amountPaid ?? null,
    startsAt: new Date(),
  }).returning();

  // Audit log
  await db.insert(adminAuditLog).values({
    adminEmail: session!.user!.email!,
    action: "subscription_create",
    targetOrgId: organizationId,
    targetOrgName: org[0]?.name ?? organizationId,
    newValue: { plan, status: status ?? "active", expiresAt, amountPaid },
  });

  return NextResponse.json({ success: true, subscription: newSub });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { subscriptionId, plan, status, expiresAt } = body;

  if (!subscriptionId) {
    return NextResponse.json({ error: "subscriptionId required" }, { status: 400 });
  }

  const validPlans = ["trial", "starter", "groei", "organisatie"];
  const validStatuses = ["active", "expired", "cancelled", "pending_payment"];

  if (plan && !validPlans.includes(plan)) {
    return NextResponse.json({ error: "Ongeldig plan" }, { status: 400 });
  }
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Ongeldige status" }, { status: 400 });
  }

  // Fetch current state for audit log
  const [current] = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId)).limit(1);
  if (!current) {
    return NextResponse.json({ error: "Subscriptie niet gevonden" }, { status: 404 });
  }

  // Fetch org name
  const [org] = await db.select({ name: organizations.name, id: organizations.id })
    .from(organizations).where(eq(organizations.id, current.organizationId)).limit(1);

  await db.update(subscriptions)
    .set({
      ...(plan   && { plan }),
      ...(status && { status }),
      ...(expiresAt !== undefined && {
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subscriptionId));

  // Audit log
  await db.insert(adminAuditLog).values({
    adminEmail: session!.user!.email!,
    action: "subscription_update",
    targetOrgId: org?.id,
    targetOrgName: org?.name ?? current.organizationId,
    previousValue: { plan: current.plan, status: current.status, expiresAt: current.expiresAt },
    newValue: { plan: plan ?? current.plan, status: status ?? current.status, expiresAt: expiresAt ?? current.expiresAt },
  });

  return NextResponse.json({ success: true });
}
