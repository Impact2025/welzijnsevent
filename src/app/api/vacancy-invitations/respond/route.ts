import { NextResponse } from "next/server";
import { db, vacancyInvitations, vacancyApplications, volunteerProfiles, volunteerVacancies, organizations, authUsers, events } from "@/db";
import { eq, and } from "drizzle-orm";
import { sendInvitationAcceptedConfirmation, sendInvitationResponseNotification } from "@/lib/email";
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

  // Fetch vacancy for email context (needed for both accept and decline notifications)
  const [vacancy] = await db
    .select()
    .from(volunteerVacancies)
    .where(eq(volunteerVacancies.id, inv.vacancyId));

  if (action === "accept") {
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

  // Send emails non-blocking
  if (vacancy) {
    const volunteerName = inv.invitedName ?? inv.invitedEmail.split("@")[0];

    // Fetch event title + org owner email in parallel
    Promise.all([
      vacancy.eventId
        ? db.select({ title: events.title }).from(events).where(eq(events.id, vacancy.eventId)).limit(1)
        : Promise.resolve([]),
      db.select({ ownerEmail: authUsers.email })
        .from(organizations)
        .innerJoin(authUsers, eq(organizations.userId, authUsers.id))
        .where(eq(organizations.id, vacancy.organizationId))
        .limit(1),
    ]).then(([eventRows, ownerRows]) => {
      const eventTitle = (eventRows[0] as { title: string } | undefined)?.title ?? vacancy.title;
      const ownerEmail = ownerRows[0]?.ownerEmail;

      // 1. Confirmation to volunteer on acceptance
      if (action === "accept") {
        sendInvitationAcceptedConfirmation({
          to:           inv.invitedEmail,
          name:         volunteerName,
          vacancyTitle: vacancy.title,
          eventTitle,
          shiftDate:    vacancy.shiftDate?.toISOString() ?? null,
          shiftStart:   vacancy.shiftStart,
          shiftEnd:     vacancy.shiftEnd,
          location:     vacancy.location,
        }).catch(() => {});
      }

      // 2. Notify org owner on accept or decline
      if (ownerEmail) {
        sendInvitationResponseNotification({
          to:             ownerEmail,
          volunteerName,
          volunteerEmail: inv.invitedEmail,
          vacancyTitle:   vacancy.title,
          eventTitle,
          action:         action === "accept" ? "accepted" : "declined",
          dashboardUrl:   `https://bijeen.app/dashboard/vrijwilligers/${encodeURIComponent(inv.invitedEmail)}`,
        }).catch(() => {});
      }
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, status: newStatus });
}
