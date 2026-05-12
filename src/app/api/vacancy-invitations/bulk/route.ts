import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, vacancyInvitations, volunteerVacancies, organizations, orgMembers, events } from "@/db";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";
import { sendVacancyInvitation } from "@/lib/email";

const BulkSchema = z.object({
  vacancyId:       z.string().uuid(),
  volunteers:      z.array(z.object({ email: z.string().email(), name: z.string() })).min(1).max(500),
  personalMessage: z.string().max(1000).optional().nullable(),
});

async function getOrgForUser(userId: string) {
  const [org] = await db.select({ id: organizations.id }).from(organizations).where(eq(organizations.userId, userId)).limit(1);
  if (org) return org.id;
  const [m] = await db.select({ organizationId: orgMembers.organizationId }).from(orgMembers).where(eq(orgMembers.userId, userId)).limit(1);
  return m?.organizationId ?? null;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json().catch(() => null);
  const parsed = BulkSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 422 });

  const orgId = await getOrgForUser(session.user.id);
  if (!orgId) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const [vacancy] = await db
    .select({ v: volunteerVacancies, eventId: volunteerVacancies.eventId })
    .from(volunteerVacancies)
    .where(and(eq(volunteerVacancies.id, parsed.data.vacancyId), eq(volunteerVacancies.organizationId, orgId)));

  if (!vacancy) return NextResponse.json({ error: "Vacature niet gevonden" }, { status: 404 });

  const [event] = await db
    .select({ title: events.title, slug: events.slug })
    .from(events)
    .where(eq(events.id, vacancy.eventId));

  // Find already-invited emails for this vacancy
  const emails = parsed.data.volunteers.map((v) => v.email.toLowerCase());
  const existing = await db
    .select({ invitedEmail: vacancyInvitations.invitedEmail })
    .from(vacancyInvitations)
    .where(and(
      eq(vacancyInvitations.vacancyId, parsed.data.vacancyId),
      inArray(vacancyInvitations.invitedEmail, emails),
    ));
  const alreadyInvited = new Set(existing.map((r) => r.invitedEmail.toLowerCase()));

  const toInvite = parsed.data.volunteers.filter((v) => !alreadyInvited.has(v.email.toLowerCase()));
  if (toInvite.length === 0) {
    return NextResponse.json({ sent: 0, skipped: parsed.data.volunteers.length });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Insert all invitation records
  const records = toInvite.map((v) => ({
    vacancyId:       parsed.data.vacancyId,
    invitedEmail:    v.email.toLowerCase(),
    invitedName:     v.name,
    invitedBy:       userId,
    personalMessage: parsed.data.personalMessage ?? null,
    token:           crypto.randomUUID(),
    expiresAt,
  }));

  const inserted = await db.insert(vacancyInvitations).values(records).returning();

  // Send emails non-blocking
  if (event) {
    for (const inv of inserted) {
      const respondUrl = `${appUrl}/vrijwilliger/uitnodiging/${inv.token}`;
      sendVacancyInvitation({
        to:              inv.invitedEmail,
        name:            inv.invitedName ?? inv.invitedEmail.split("@")[0],
        vacancyTitle:    vacancy.v.title,
        eventTitle:      event.title,
        personalMessage: inv.personalMessage ?? null,
        respondUrl,
        expiresAt,
      }).catch(() => {});
    }
  }

  return NextResponse.json({ sent: inserted.length, skipped: alreadyInvited.size });
}
