import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, organizations, subscriptions, events, attendees } from "@/db";
import { desc, count, inArray } from "drizzle-orm";

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

  if (orgIds.length === 0) {
    return new Response("Naam,Slug,Plan,Status,Aangemeld,Verloopt,Betaald,Events,Deelnemers\n", {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="bijeen-organisaties-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });
  }

  const [allSubs, allEventsList] = await Promise.all([
    db.select().from(subscriptions).where(inArray(subscriptions.organizationId, orgIds)).orderBy(desc(subscriptions.createdAt)),
    db.select({ id: events.id, organizationId: events.organizationId }).from(events).where(inArray(events.organizationId, orgIds)),
  ]);

  const latestSubMap = new Map<string, typeof allSubs[0]>();
  for (const sub of allSubs) {
    if (!latestSubMap.has(sub.organizationId)) {
      latestSubMap.set(sub.organizationId, sub);
    }
  }

  const eventCountsByOrg = new Map<string, number>();
  for (const ev of allEventsList) {
    if (ev.organizationId) {
      eventCountsByOrg.set(ev.organizationId, (eventCountsByOrg.get(ev.organizationId) ?? 0) + 1);
    }
  }

  const eventIds = allEventsList.map(e => e.id);
  const eventToOrg = new Map(allEventsList.map(e => [e.id, e.organizationId]));
  const attendeeCounts = eventIds.length > 0
    ? await db.select({ eventId: attendees.eventId, count: count() })
        .from(attendees).where(inArray(attendees.eventId, eventIds)).groupBy(attendees.eventId)
    : [];

  const attendeeCountsByOrg = new Map<string, number>();
  for (const r of attendeeCounts) {
    const orgId = eventToOrg.get(r.eventId!);
    if (orgId) attendeeCountsByOrg.set(orgId, (attendeeCountsByOrg.get(orgId) ?? 0) + r.count);
  }

  function escape(v: string | null | undefined) {
    if (!v) return "";
    return `"${v.replace(/"/g, '""')}"`;
  }

  const rows = allOrgs.map(org => {
    const sub = latestSubMap.get(org.id);
    const isExpired = sub?.expiresAt && new Date(sub.expiresAt) < new Date();
    const status = !sub ? "geen" : (isExpired ? "verlopen" : sub.status ?? "actief");
    return [
      escape(org.name),
      escape(org.slug),
      escape(sub?.plan ?? "geen"),
      escape(status),
      org.createdAt ? new Date(org.createdAt).toISOString().slice(0, 10) : "",
      sub?.expiresAt ? new Date(sub.expiresAt).toISOString().slice(0, 10) : "",
      sub?.amountPaid ? (sub.amountPaid / 100).toFixed(2) : "0",
      String(eventCountsByOrg.get(org.id) ?? 0),
      String(attendeeCountsByOrg.get(org.id) ?? 0),
    ].join(",");
  });

  const csv = ["Naam,Slug,Plan,Status,Aangemeld,Verloopt,Betaald (EUR),Events,Deelnemers", ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bijeen-organisaties-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  });
}
