import { NextResponse } from "next/server";
import { db, sponsors } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const TIERS = ["gold", "silver", "bronze"] as const;

const PatchSchema = z.object({
  name:       z.string().min(1).max(100).optional(),
  logoUrl:    z.string().url().nullable().optional().or(z.literal("")),
  websiteUrl: z.string().url().nullable().optional().or(z.literal("")),
  tier:       z.enum(TIERS).optional(),
  sortOrder:  z.number().int().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const data = parsed.data;
  if ("logoUrl"    in data && data.logoUrl    === "") data.logoUrl    = null;
  if ("websiteUrl" in data && data.websiteUrl === "") data.websiteUrl = null;

  const [updated] = await db
    .update(sponsors)
    .set(data)
    .where(eq(sponsors.id, params.id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await db.delete(sponsors).where(eq(sponsors.id, params.id));
  return new NextResponse(null, { status: 204 });
}
