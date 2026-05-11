import { NextResponse } from "next/server";
import { db, volunteerVacancies, events } from "@/db";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  const [vacancy] = await db
    .select()
    .from(volunteerVacancies)
    .where(eq(volunteerVacancies.id, params.id));

  if (!vacancy) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const [event] = await db
    .select({ title: events.title, slug: events.slug, websiteColor: events.websiteColor, isPublic: events.isPublic })
    .from(events)
    .where(eq(events.id, vacancy.eventId));

  if (!event || !event.isPublic) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  if (slug && event.slug !== slug)  return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  return NextResponse.json({
    vacancy: {
      ...vacancy,
      eventTitle:   event.title,
      eventSlug:    event.slug,
      primaryColor: event.websiteColor ?? "#C8522A",
    },
  });
}
