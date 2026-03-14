import { NextRequest, NextResponse } from "next/server";
import { db, crmActivities, contactProfiles } from "@/db";
import { eq, and } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import { auth } from "@/auth";
import { z } from "zod";

const NoteSchema = z.object({ note: z.string().min(1).max(2000) });

export async function POST(
  req: NextRequest,
  { params }: { params: { email: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const email = decodeURIComponent(params.email);
  const body = await req.json().catch(() => null);
  const parsed = NoteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 422 });

  // Ensure profile exists
  const [existing] = await db.select().from(contactProfiles)
    .where(and(eq(contactProfiles.organizationId, org.id), eq(contactProfiles.email, email)));
  if (!existing) {
    await db.insert(contactProfiles).values({ organizationId: org.id, email });
  }

  const [activity] = await db.insert(crmActivities).values({
    organizationId: org.id,
    contactEmail: email,
    type: "note",
    description: parsed.data.note,
    createdBy: session.user.email ?? session.user.id,
  }).returning();

  return NextResponse.json({ activity });
}
