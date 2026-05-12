import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, vacancyApplications, volunteerProfiles, volunteerVacancies, organizations, orgMembers, events } from "@/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { sendVacancyApplicationAccepted, sendVacancyApplicationRejected } from "@/lib/email";

const PatchSchema = z.object({
  status:        z.enum(["pending", "accepted", "rejected", "withdrawn"]),
  internalNotes: z.string().max(1000).optional().nullable(),
});

async function getOrgForUser(userId: string) {
  const [org] = await db.select({ id: organizations.id }).from(organizations).where(eq(organizations.userId, userId)).limit(1);
  if (org) return org.id;
  const [m] = await db.select({ organizationId: orgMembers.organizationId }).from(orgMembers).where(eq(orgMembers.userId, userId)).limit(1);
  return m?.organizationId ?? null;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 422 });

  const orgId = await getOrgForUser(session.user.id);
  if (!orgId) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  // Verify the application belongs to this org via vacancy
  const [row] = await db
    .select({ application: vacancyApplications, vacancy: volunteerVacancies })
    .from(vacancyApplications)
    .innerJoin(volunteerVacancies, eq(vacancyApplications.vacancyId, volunteerVacancies.id))
    .where(and(eq(vacancyApplications.id, params.id), eq(volunteerVacancies.organizationId, orgId)));

  if (!row) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const previousStatus = row.application.status;
  const newStatus = parsed.data.status;

  const [updated] = await db
    .update(vacancyApplications)
    .set({
      status:        newStatus,
      internalNotes: parsed.data.internalNotes ?? null,
      reviewedBy:    session.user.id,
      reviewedAt:    new Date(),
    })
    .where(eq(vacancyApplications.id, params.id))
    .returning();

  // Send status-change email only when transitioning into accepted/rejected
  if (previousStatus !== newStatus && (newStatus === "accepted" || newStatus === "rejected")) {
    const profileId = row.application.volunteerProfileId;
    if (profileId) {
      const [profile] = await db
        .select({ name: volunteerProfiles.name, email: volunteerProfiles.email })
        .from(volunteerProfiles)
        .where(eq(volunteerProfiles.id, profileId))
        .limit(1);

      const [event] = await db
        .select({ title: events.title, slug: events.slug })
        .from(events)
        .where(eq(events.id, row.vacancy.eventId))
        .limit(1);

      if (profile && event) {
        if (newStatus === "accepted") {
          sendVacancyApplicationAccepted({
            to:           profile.email,
            name:         profile.name,
            vacancyTitle: row.vacancy.title,
            eventTitle:   event.title,
            eventSlug:    event.slug ?? "",
            shiftStart:   row.vacancy.shiftStart ?? null,
            shiftEnd:     row.vacancy.shiftEnd ?? null,
            location:     row.vacancy.location ?? null,
          }).catch(() => {});
        } else {
          sendVacancyApplicationRejected({
            to:           profile.email,
            name:         profile.name,
            vacancyTitle: row.vacancy.title,
            eventTitle:   event.title,
          }).catch(() => {});
        }
      }
    }
  }

  return NextResponse.json({ application: updated });
}
