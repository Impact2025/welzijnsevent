import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, volunteerProfiles, organizations, orgMembers } from "@/db";
import { eq, and } from "drizzle-orm";

async function getOrgForUser(userId: string) {
  const [org] = await db.select({ id: organizations.id }).from(organizations).where(eq(organizations.userId, userId)).limit(1);
  if (org) return org.id;
  const [m] = await db.select({ organizationId: orgMembers.organizationId }).from(orgMembers).where(eq(orgMembers.userId, userId)).limit(1);
  return m?.organizationId ?? null;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  const orgId = await getOrgForUser(session.user.id);
  if (!orgId) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const conditions = [eq(volunteerProfiles.organizationId, orgId)];
  if (eventId) conditions.push(eq(volunteerProfiles.eventId, eventId));

  const profiles = await db
    .select()
    .from(volunteerProfiles)
    .where(and(...conditions));

  return NextResponse.json({ profiles });
}
