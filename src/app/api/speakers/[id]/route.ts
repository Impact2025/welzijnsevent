import { NextResponse } from "next/server";
import { db, speakers } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const PatchSchema = z.object({
  name:        z.string().min(1).max(100).optional(),
  bio:         z.string().max(500).nullable().optional(),
  photoUrl:    z.string().url().nullable().optional().or(z.literal("")),
  company:     z.string().max(100).nullable().optional(),
  linkedinUrl: z.string().url().nullable().optional().or(z.literal("")),
  sortOrder:   z.number().int().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const data = parsed.data;
  if ("photoUrl"    in data && data.photoUrl    === "") data.photoUrl    = null;
  if ("linkedinUrl" in data && data.linkedinUrl === "") data.linkedinUrl = null;

  const [updated] = await db
    .update(speakers)
    .set(data)
    .where(eq(speakers.id, params.id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await db.delete(speakers).where(eq(speakers.id, params.id));
  return new NextResponse(null, { status: 204 });
}
