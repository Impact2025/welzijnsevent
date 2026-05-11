import { NextResponse } from "next/server";
import { db, vacancyInvitations, volunteerVacancies, events } from "@/db";
import { eq } from "drizzle-orm";

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const [inv] = await db
    .select()
    .from(vacancyInvitations)
    .where(eq(vacancyInvitations.token, params.token));

  if (!inv) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const [vacancy] = await db
    .select()
    .from(volunteerVacancies)
    .where(eq(volunteerVacancies.id, inv.vacancyId));

  const [event] = vacancy
    ? await db.select({ title: events.title, slug: events.slug }).from(events).where(eq(events.id, vacancy.eventId))
    : [null];

  return NextResponse.json({
    invitation: {
      vacancyTitle:    vacancy?.title ?? "",
      eventTitle:      event?.title   ?? "",
      category:        vacancy?.category ?? null,
      location:        vacancy?.location ?? null,
      shiftStart:      vacancy?.shiftStart ?? null,
      shiftEnd:        vacancy?.shiftEnd   ?? null,
      spotsAvailable:  vacancy?.spotsAvailable ?? null,
      personalMessage: inv.personalMessage,
      invitedName:     inv.invitedName,
      expiresAt:       inv.expiresAt.toISOString(),
      status:          inv.status,
    },
  });
}
