import { NextResponse } from "next/server";
import { db, vacancyInvitations, vacancyApplications, volunteerProfiles, volunteerVacancies } from "@/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const Schema = z.object({
  token:      z.string().uuid(),
  action:     z.enum(["accept", "decline"]),
  motivation: z.string().max(2000).optional().nullable(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 422 });

  const { token, action, motivation } = parsed.data;
  const now = new Date();

  const [inv] = await db
    .select()
    .from(vacancyInvitations)
    .where(eq(vacancyInvitations.token, token));

  if (!inv) return NextResponse.json({ error: "Uitnodiging niet gevonden" }, { status: 404 });
  if (inv.status !== "pending") return NextResponse.json({ error: "Uitnodiging is al beantwoord" }, { status: 409 });
  if (inv.expiresAt < now) {
    await db.update(vacancyInvitations).set({ status: "expired" }).where(eq(vacancyInvitations.id, inv.id));
    return NextResponse.json({ error: "Uitnodiging verlopen" }, { status: 410 });
  }

  const newStatus = action === "accept" ? "accepted" : "declined";
  await db
    .update(vacancyInvitations)
    .set({ status: newStatus, respondedAt: now })
    .where(eq(vacancyInvitations.id, inv.id));

  if (action === "accept") {
    // Ensure volunteer profile exists
    const [vacancy] = await db
      .select()
      .from(volunteerVacancies)
      .where(eq(volunteerVacancies.id, inv.vacancyId));

    if (vacancy) {
      const existing = await db
        .select()
        .from(volunteerProfiles)
        .where(and(eq(volunteerProfiles.email, inv.invitedEmail), eq(volunteerProfiles.eventId, vacancy.eventId)))
        .limit(1);

      let profileId: string;
      if (existing.length > 0) {
        profileId = existing[0].id;
      } else {
        const [profile] = await db
          .insert(volunteerProfiles)
          .values({
            eventId:        vacancy.eventId,
            organizationId: vacancy.organizationId,
            name:           inv.invitedName ?? inv.invitedEmail.split("@")[0],
            email:          inv.invitedEmail,
          })
          .returning();
        profileId = profile.id;
      }

      // Create application (if not already exists)
      const dupeCheck = await db
        .select()
        .from(vacancyApplications)
        .where(and(eq(vacancyApplications.vacancyId, inv.vacancyId), eq(vacancyApplications.volunteerProfileId, profileId)))
        .limit(1);

      if (dupeCheck.length === 0) {
        await db.insert(vacancyApplications).values({
          vacancyId:          inv.vacancyId,
          volunteerProfileId: profileId,
          motivation:         motivation ?? null,
          status:             "pending",
        });
      }
    }
  }

  return NextResponse.json({ ok: true, status: newStatus });
}
