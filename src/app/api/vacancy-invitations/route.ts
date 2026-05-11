import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, vacancyInvitations, volunteerVacancies, organizations, orgMembers, events } from "@/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { sendVacancyInvitation } from "@/lib/email";

const InviteSchema = z.object({
  vacancyId:       z.string().uuid(),
  invitedEmail:    z.string().email(),
  invitedName:     z.string().max(200).optional().nullable(),
  personalMessage: z.string().max(1000).optional().nullable(),
});

async function getOrgForUser(userId: string) {
  const [org] = await db.select({ id: organizations.id }).from(organizations).where(eq(organizations.userId, userId)).limit(1);
  if (org) return org.id;
  const [m] = await db.select({ organizationId: orgMembers.organizationId }).from(orgMembers).where(eq(orgMembers.userId, userId)).limit(1);
  return m?.organizationId ?? null;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const vacancyId = searchParams.get("vacancyId");
  if (!vacancyId) return NextResponse.json({ error: "vacancyId vereist" }, { status: 400 });

  const rows = await db
    .select()
    .from(vacancyInvitations)
    .where(eq(vacancyInvitations.vacancyId, vacancyId));

  return NextResponse.json({ invitations: rows });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = InviteSchema.safeParse(body);
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

  const token     = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [invitation] = await db
    .insert(vacancyInvitations)
    .values({
      vacancyId:       parsed.data.vacancyId,
      invitedEmail:    parsed.data.invitedEmail,
      invitedName:     parsed.data.invitedName ?? null,
      invitedBy:       session.user.id,
      personalMessage: parsed.data.personalMessage ?? null,
      token,
      expiresAt,
    })
    .returning();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";
  const respondUrl = `${appUrl}/vrijwilliger/uitnodiging/${token}`;

  if (event) {
    sendVacancyInvitation({
      to:              parsed.data.invitedEmail,
      name:            parsed.data.invitedName ?? parsed.data.invitedEmail.split("@")[0],
      vacancyTitle:    vacancy.v.title,
      eventTitle:      event.title,
      personalMessage: parsed.data.personalMessage ?? null,
      respondUrl,
      expiresAt,
    }).catch(() => {});
  }

  return NextResponse.json({ invitation }, { status: 201 });
}
