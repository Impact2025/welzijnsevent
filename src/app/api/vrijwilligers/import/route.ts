import { NextResponse } from "next/server";
import { db, volunteerProfiles } from "@/db";
import { eq } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import { z } from "zod";

const RowSchema = z.object({
  name:         z.string().min(1).max(200),
  email:        z.string().email().max(320),
  phone:        z.string().max(40).optional(),
  skills:       z.array(z.string().max(80)).max(20).optional(),
  availability: z.string().max(300).optional(),
});

const ImportSchema = z.object({
  rows: z.array(RowSchema).min(1).max(1000),
});

export async function POST(req: Request) {
  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = ImportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige invoer" }, { status: 422 });
  }

  const { rows } = parsed.data;

  // Fetch existing emails for this org to skip duplicates
  const existingRows = await db
    .select({ email: volunteerProfiles.email })
    .from(volunteerProfiles)
    .where(eq(volunteerProfiles.organizationId, org.id));
  const existingEmails = new Set(existingRows.map((r) => r.email.toLowerCase()));

  const toInsert = rows.filter((r) => !existingEmails.has(r.email.toLowerCase()));

  if (toInsert.length > 0) {
    await db.insert(volunteerProfiles).values(
      toInsert.map((r) => ({
        organizationId: org.id,
        name:           r.name,
        email:          r.email,
        phone:          r.phone ?? null,
        skills:         r.skills ?? [],
        availability:   r.availability ?? null,
        status:         "actief" as const,
      }))
    );
  }

  return NextResponse.json({
    created: toInsert.length,
    skipped: rows.length - toInsert.length,
  });
}
