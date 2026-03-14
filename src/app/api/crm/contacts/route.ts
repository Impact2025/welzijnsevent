import { NextRequest, NextResponse } from "next/server";
import { db, attendees, events, contactProfiles, crmActivities, feedback, sessionRegistrations, surveyResponses } from "@/db";
import { eq, inArray, sql, desc, and } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const lifecycle = searchParams.get("lifecycle") ?? "";
  const tag = searchParams.get("tag") ?? "";
  const sort = searchParams.get("sort") ?? "last_seen";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const PAGE_SIZE = 30;

  // Get all event IDs for this org
  const orgEvents = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.organizationId, org.id));

  if (orgEvents.length === 0) {
    return NextResponse.json({ contacts: [], total: 0, pages: 0 });
  }

  const eventIds = orgEvents.map(e => e.id);

  // Aggregate attendees by email
  const contactStats = await db
    .select({
      email: attendees.email,
      name: sql<string>`max(${attendees.name})`,
      organization: sql<string>`max(${attendees.organization})`,
      role: sql<string>`max(${attendees.role})`,
      eventsCount: sql<number>`count(distinct ${attendees.eventId})`,
      checkins: sql<number>`sum(case when ${attendees.status} = 'ingecheckt' then 1 else 0 end)`,
      firstSeen: sql<string>`min(${attendees.registeredAt})`,
      lastSeen: sql<string>`max(${attendees.registeredAt})`,
    })
    .from(attendees)
    .where(inArray(attendees.eventId, eventIds))
    .groupBy(attendees.email);

  // Get CRM profiles for this org
  const profiles = await db
    .select()
    .from(contactProfiles)
    .where(eq(contactProfiles.organizationId, org.id));

  const profileMap = Object.fromEntries(profiles.map(p => [p.email.toLowerCase(), p]));

  // Compute engagement scores and merge
  let contacts = contactStats.map(c => {
    const profile = profileMap[c.email.toLowerCase()];
    const score = (Number(c.eventsCount) * 10) + (Number(c.checkins) * 5);
    return {
      email: c.email,
      name: c.name,
      organization: c.organization,
      role: c.role,
      eventsCount: Number(c.eventsCount),
      checkins: Number(c.checkins),
      firstSeen: c.firstSeen,
      lastSeen: c.lastSeen,
      engagementScore: score,
      lifecycleStage: profile?.lifecycleStage ?? "contact",
      tags: profile?.tags ?? [],
      crmNotes: profile?.crmNotes ?? null,
      profileId: profile?.id ?? null,
    };
  });

  // Filter
  if (q) {
    const lower = q.toLowerCase();
    contacts = contacts.filter(c =>
      c.name?.toLowerCase().includes(lower) ||
      c.email.toLowerCase().includes(lower) ||
      c.organization?.toLowerCase().includes(lower)
    );
  }
  if (lifecycle) contacts = contacts.filter(c => c.lifecycleStage === lifecycle);
  if (tag) contacts = contacts.filter(c => (c.tags as string[]).includes(tag));

  // Sort
  if (sort === "name") contacts.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  else if (sort === "events") contacts.sort((a, b) => b.eventsCount - a.eventsCount);
  else if (sort === "score") contacts.sort((a, b) => b.engagementScore - a.engagementScore);
  else contacts.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

  const total = contacts.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  const paginated = contacts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return NextResponse.json({ contacts: paginated, total, pages });
}
