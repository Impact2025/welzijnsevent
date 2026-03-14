import { NextRequest, NextResponse } from "next/server";
import { db, attendees, events, contactProfiles, crmActivities, feedback, sessionRegistrations, surveyResponses } from "@/db";
import { eq, inArray, and } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import { auth } from "@/auth";
import { z } from "zod";

const PatchSchema = z.object({
  lifecycleStage: z.enum(["contact", "betrokken", "actief", "vip", "inactief"]).optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
  crmNotes: z.string().max(5000).nullable().optional(),
});

async function getOrgAndContact(emailParam: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", status: 401 as const };
  const org = await getCurrentOrg();
  if (!org) return { error: "Geen organisatie", status: 403 as const };
  const email = decodeURIComponent(emailParam);
  return { org, email };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { email: string } }
) {
  const result = await getOrgAndContact(params.email);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  const { org, email } = result;

  // Get org's event IDs
  const orgEvents = await db.select({ id: events.id, title: events.title, startsAt: events.startsAt, location: events.location })
    .from(events).where(eq(events.organizationId, org.id));
  const eventIds = orgEvents.map(e => e.id);
  const eventMap = Object.fromEntries(orgEvents.map(e => [e.id, e]));

  if (eventIds.length === 0) return NextResponse.json({ contact: null });

  // Get all attendee records for this email
  const attendeeRecords = await db.select().from(attendees)
    .where(and(inArray(attendees.eventId, eventIds), eq(attendees.email, email)));

  if (attendeeRecords.length === 0) return NextResponse.json({ contact: null });

  const attendeeIds = attendeeRecords.map(a => a.id);

  // Feedback & session regs
  const feedbackList = attendeeIds.length > 0
    ? await db.select().from(feedback).where(inArray(feedback.attendeeId, attendeeIds))
    : [];
  const sessionRegs = attendeeIds.length > 0
    ? await db.select().from(sessionRegistrations).where(inArray(sessionRegistrations.attendeeId, attendeeIds))
    : [];
  const surveys = attendeeIds.length > 0
    ? await db.select().from(surveyResponses).where(inArray(surveyResponses.attendeeId, attendeeIds))
    : [];

  // CRM profile
  const [profile] = await db.select().from(contactProfiles)
    .where(and(eq(contactProfiles.organizationId, org.id), eq(contactProfiles.email, email)));

  // CRM activities
  const activities = await db.select().from(crmActivities)
    .where(and(eq(crmActivities.organizationId, org.id), eq(crmActivities.contactEmail, email)));

  // Compute engagement score
  const eventsAttended = attendeeRecords.filter(a => a.status === "ingecheckt").length;
  const engagementScore =
    attendeeRecords.length * 10 +
    eventsAttended * 5 +
    sessionRegs.length * 3 +
    feedbackList.length * 5 +
    surveys.length * 10;

  // Most recent info
  const sorted = [...attendeeRecords].sort(
    (a, b) => new Date(b.registeredAt!).getTime() - new Date(a.registeredAt!).getTime()
  );
  const latest = sorted[0];

  const contact = {
    email,
    name: latest.name,
    organization: latest.organization,
    role: latest.role,
    firstSeen: sorted[sorted.length - 1].registeredAt,
    lastSeen: latest.registeredAt,
    eventsCount: attendeeRecords.length,
    checkins: eventsAttended,
    sessionsRegistered: sessionRegs.length,
    feedbackGiven: feedbackList.length,
    surveysCompleted: surveys.length,
    engagementScore,
    lifecycleStage: profile?.lifecycleStage ?? "contact",
    tags: profile?.tags ?? [],
    crmNotes: profile?.crmNotes ?? null,
    profileId: profile?.id ?? null,
    attendeeRecords: attendeeRecords.map(a => ({
      ...a,
      event: eventMap[a.eventId],
    })),
    activities: activities.sort((a, b) =>
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    ),
    feedbackList,
  };

  return NextResponse.json({ contact });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { email: string } }
) {
  const result = await getOrgAndContact(params.email);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  const { org, email } = result;

  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 422 });

  // Upsert contact profile
  const [existing] = await db.select().from(contactProfiles)
    .where(and(eq(contactProfiles.organizationId, org.id), eq(contactProfiles.email, email)));

  let profile;
  if (existing) {
    [profile] = await db.update(contactProfiles)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(contactProfiles.id, existing.id))
      .returning();
  } else {
    [profile] = await db.insert(contactProfiles)
      .values({ organizationId: org.id, email, ...parsed.data })
      .returning();
  }

  return NextResponse.json({ profile });
}
