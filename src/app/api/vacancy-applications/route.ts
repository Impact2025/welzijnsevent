import { NextResponse } from "next/server";
import { db, vacancyApplications, volunteerProfiles, volunteerVacancies, events } from "@/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { sendVacancyApplicationConfirmation } from "@/lib/email";

const CreateSchema = z.object({
  vacancyId:  z.string().uuid(),
  name:       z.string().min(1).max(200),
  email:      z.string().email(),
  phone:      z.string().max(40).optional().nullable(),
  motivation: z.string().max(2000).optional().nullable(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vacancyId = searchParams.get("vacancyId");
  if (!vacancyId) return NextResponse.json({ error: "vacancyId vereist" }, { status: 400 });

  const rows = await db
    .select({
      application: vacancyApplications,
      profile:     volunteerProfiles,
    })
    .from(vacancyApplications)
    .leftJoin(volunteerProfiles, eq(vacancyApplications.volunteerProfileId, volunteerProfiles.id))
    .where(eq(vacancyApplications.vacancyId, vacancyId));

  return NextResponse.json({ applications: rows });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 422 });

  const { vacancyId, name, email, phone, motivation } = parsed.data;

  // Load vacancy + event for context
  const [vacancy] = await db
    .select({ v: volunteerVacancies, eventId: volunteerVacancies.eventId, orgId: volunteerVacancies.organizationId })
    .from(volunteerVacancies)
    .where(and(eq(volunteerVacancies.id, vacancyId), eq(volunteerVacancies.status, "open")));

  if (!vacancy) return NextResponse.json({ error: "Vacature niet gevonden of gesloten" }, { status: 404 });

  const [event] = await db
    .select({ title: events.title, slug: events.slug })
    .from(events)
    .where(eq(events.id, vacancy.eventId));

  // Upsert volunteer profile
  const existing = await db
    .select()
    .from(volunteerProfiles)
    .where(and(eq(volunteerProfiles.email, email), eq(volunteerProfiles.eventId, vacancy.eventId)))
    .limit(1);

  let profileId: string;
  if (existing.length > 0) {
    profileId = existing[0].id;
    await db
      .update(volunteerProfiles)
      .set({ name, phone: phone ?? null, updatedAt: new Date() })
      .where(eq(volunteerProfiles.id, profileId));
  } else {
    const [profile] = await db
      .insert(volunteerProfiles)
      .values({
        eventId:        vacancy.eventId,
        organizationId: vacancy.orgId,
        name,
        email,
        phone:          phone ?? null,
      })
      .returning();
    profileId = profile.id;
  }

  // Check duplicate application
  const dupe = await db
    .select()
    .from(vacancyApplications)
    .where(and(
      eq(vacancyApplications.vacancyId, vacancyId),
      eq(vacancyApplications.volunteerProfileId, profileId)
    ))
    .limit(1);

  if (dupe.length > 0) {
    return NextResponse.json({ error: "Je hebt je al aangemeld voor deze vacature" }, { status: 409 });
  }

  const [application] = await db
    .insert(vacancyApplications)
    .values({ vacancyId, volunteerProfileId: profileId, motivation: motivation ?? null })
    .returning();

  // Send confirmation email (non-blocking)
  if (event) {
    sendVacancyApplicationConfirmation({
      to:           email,
      name,
      vacancyTitle: vacancy.v.title,
      eventTitle:   event.title,
      eventSlug:    event.slug ?? "",
    }).catch(() => {});
  }

  return NextResponse.json({ application }, { status: 201 });
}
