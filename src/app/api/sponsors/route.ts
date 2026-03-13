import { NextResponse } from "next/server";
import { db, sponsors } from "@/db";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

const TIERS = ["gold", "silver", "bronze"] as const;

const CreateSchema = z.object({
  eventId:    z.string().uuid(),
  name:       z.string().min(1).max(100),
  logoUrl:    z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  tier:       z.enum(TIERS).default("silver"),
  sortOrder:  z.number().int().default(0),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const rows = await db
    .select()
    .from(sponsors)
    .where(eq(sponsors.eventId, eventId))
    .orderBy(asc(sponsors.sortOrder), asc(sponsors.createdAt));

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { logoUrl, websiteUrl, ...rest } = parsed.data;

  const [sponsor] = await db
    .insert(sponsors)
    .values({
      ...rest,
      logoUrl:    logoUrl    || null,
      websiteUrl: websiteUrl || null,
    })
    .returning();

  return NextResponse.json(sponsor, { status: 201 });
}
