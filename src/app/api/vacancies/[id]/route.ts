import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, volunteerVacancies, organizations, orgMembers } from "@/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const PatchSchema = z.object({
  title:          z.string().min(1).max(200).optional(),
  description:    z.string().nullable().optional(),
  category:       z.string().optional(),
  spotsAvailable: z.number().int().min(1).optional(),
  location:       z.string().nullable().optional(),
  shiftDate:      z.string().nullable().optional(),
  shiftStart:     z.string().nullable().optional(),
  shiftEnd:       z.string().nullable().optional(),
  requirements:   z.array(z.string()).optional(),
  status:         z.enum(["draft", "open", "closed", "cancelled"]).optional(),
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

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgForUser(session.user.id);
  if (!orgId) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const [vacancy] = await db
    .select()
    .from(volunteerVacancies)
    .where(and(eq(volunteerVacancies.id, params.id), eq(volunteerVacancies.organizationId, orgId)));

  if (!vacancy) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json({ vacancy });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 422 });

  const orgId = await getOrgForUser(session.user.id);
  if (!orgId) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const { shiftDate, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = {
    ...rest,
    updatedAt: new Date(),
  };
  if (shiftDate !== undefined) {
    updateData.shiftDate = shiftDate ? new Date(shiftDate) : null;
  }

  const [updated] = await db
    .update(volunteerVacancies)
    .set(updateData)
    .where(and(eq(volunteerVacancies.id, params.id), eq(volunteerVacancies.organizationId, orgId)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json({ vacancy: updated });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgForUser(session.user.id);
  if (!orgId) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  await db
    .delete(volunteerVacancies)
    .where(and(eq(volunteerVacancies.id, params.id), eq(volunteerVacancies.organizationId, orgId)));

  return NextResponse.json({ ok: true });
}
