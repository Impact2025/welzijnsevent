import { NextResponse } from "next/server";
import { db, volunteerProfiles } from "@/db";
import { eq, and } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import { z } from "zod";

const UpdateSchema = z.object({
  name:         z.string().min(1).max(200).optional(),
  email:        z.string().email().max(320).optional(),
  phone:        z.string().max(40).optional().nullable(),
  skills:       z.array(z.string().max(80)).max(20).optional(),
  availability: z.string().max(300).optional().nullable(),
  bio:          z.string().max(1000).optional().nullable(),
  status:       z.enum(["actief", "inactief"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige invoer", details: parsed.error.flatten() }, { status: 422 });
  }

  // Verify ownership
  const [existing] = await db
    .select({ id: volunteerProfiles.id, email: volunteerProfiles.email })
    .from(volunteerProfiles)
    .where(and(
      eq(volunteerProfiles.id, params.id),
      eq(volunteerProfiles.organizationId, org.id),
    ))
    .limit(1);

  if (!existing) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  // If email changes, check for duplicate within this org
  if (parsed.data.email && parsed.data.email.toLowerCase() !== existing.email.toLowerCase()) {
    const [dup] = await db
      .select({ id: volunteerProfiles.id })
      .from(volunteerProfiles)
      .where(and(
        eq(volunteerProfiles.organizationId, org.id),
        eq(volunteerProfiles.email, parsed.data.email),
      ))
      .limit(1);
    if (dup) {
      return NextResponse.json({ error: "Er bestaat al een vrijwilliger met dit e-mailadres." }, { status: 409 });
    }
  }

  const [updated] = await db
    .update(volunteerProfiles)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(and(
      eq(volunteerProfiles.id, params.id),
      eq(volunteerProfiles.organizationId, org.id),
    ))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [deleted] = await db
    .delete(volunteerProfiles)
    .where(and(
      eq(volunteerProfiles.id, params.id),
      eq(volunteerProfiles.organizationId, org.id),
    ))
    .returning({ id: volunteerProfiles.id });

  if (!deleted) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
