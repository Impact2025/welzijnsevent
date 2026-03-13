import { NextResponse } from "next/server";
import { db, speakers } from "@/db";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

const CreateSchema = z.object({
  eventId:     z.string().uuid(),
  name:        z.string().min(1).max(100),
  bio:         z.string().max(500).optional(),
  photoUrl:    z.string().url().optional().or(z.literal("")),
  company:     z.string().max(100).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  sortOrder:   z.number().int().default(0),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const rows = await db
    .select()
    .from(speakers)
    .where(eq(speakers.eventId, eventId))
    .orderBy(asc(speakers.sortOrder), asc(speakers.createdAt));

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { photoUrl, linkedinUrl, ...rest } = parsed.data;

  const [speaker] = await db
    .insert(speakers)
    .values({
      ...rest,
      photoUrl:    photoUrl    || null,
      linkedinUrl: linkedinUrl || null,
    })
    .returning();

  return NextResponse.json(speaker, { status: 201 });
}
