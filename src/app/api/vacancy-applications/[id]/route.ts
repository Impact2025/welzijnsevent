import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, vacancyApplications, volunteerProfiles, volunteerVacancies, organizations, orgMembers } from "@/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

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

  const [updated] = await db
    .update(vacancyApplications)
    .set({
      status:        parsed.data.status,
      internalNotes: parsed.data.internalNotes ?? null,
      reviewedBy:    session.user.id,
      reviewedAt:    new Date(),
    })
    .where(eq(vacancyApplications.id, params.id))
    .returning();

  return NextResponse.json({ application: updated });
}
