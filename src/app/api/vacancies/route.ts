import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, volunteerVacancies, organizations, orgMembers } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const CreateSchema = z.object({
  eventId:        z.string().uuid(),
  title:          z.string().min(1).max(200),
  description:    z.string().optional().nullable(),
  category:       z.string().default("overig"),
  spotsAvailable: z.number().int().min(1).default(1),
  location:       z.string().optional().nullable(),
  shiftDate:      z.string().optional().nullable(),
  shiftStart:     z.string().optional().nullable(),
  shiftEnd:       z.string().optional().nullable(),
  requirements:   z.array(z.string()).default([]),
  status:         z.enum(["draft", "open", "closed", "cancelled"]).default("draft"),
});

async function getOrgForUser(userId: string) {
  const org = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.userId, userId))
    .limit(1);

  if (org.length) return org[0].id;

  const member = await db
    .select({ organizationId: orgMembers.organizationId })
    .from(orgMembers)
    .where(eq(orgMembers.userId, userId))
    .limit(1);

  return member[0]?.organizationId ?? null;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId vereist" }, { status: 400 });

  const orgId = await getOrgForUser(session.user.id);
  if (!orgId) return NextResponse.json({ error: "Geen organisatie gevonden" }, { status: 403 });

  const rows = await db
    .select()
    .from(volunteerVacancies)
    .where(and(
      eq(volunteerVacancies.eventId, eventId),
      eq(volunteerVacancies.organizationId, orgId)
    ))
    .orderBy(desc(volunteerVacancies.createdAt));

  return NextResponse.json({ vacancies: rows });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer", details: parsed.error.flatten() }, { status: 422 });

  const orgId = await getOrgForUser(session.user.id);
  if (!orgId) return NextResponse.json({ error: "Geen organisatie gevonden" }, { status: 403 });

  const { eventId, shiftDate, ...rest } = parsed.data;

  const [vacancy] = await db
    .insert(volunteerVacancies)
    .values({
      ...rest,
      eventId,
      organizationId: orgId,
      shiftDate:      shiftDate ? new Date(shiftDate) : null,
    })
    .returning();

  return NextResponse.json({ vacancy }, { status: 201 });
}
