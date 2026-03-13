import { NextRequest, NextResponse } from "next/server";
import { db, orgMembers, orgInvites, authUsers, organizations } from "@/db";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/auth";
import { randomUUID } from "crypto";
import { sendTeamInviteEmail } from "@/lib/email";

// GET — lijst teamleden + openstaande uitnodigingen
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const members = await db
    .select({
      id:        orgMembers.id,
      userId:    orgMembers.userId,
      role:      orgMembers.role,
      createdAt: orgMembers.createdAt,
      name:      authUsers.name,
      email:     authUsers.email,
    })
    .from(orgMembers)
    .innerJoin(authUsers, eq(authUsers.id, orgMembers.userId))
    .where(eq(orgMembers.organizationId, org.id));

  const invites = await db
    .select()
    .from(orgInvites)
    .where(
      and(
        eq(orgInvites.organizationId, org.id),
        eq(orgInvites.acceptedAt, null as unknown as Date)
      )
    );

  // Filter verlopen invites
  const pendingInvites = invites.filter(i => i.expiresAt > new Date());

  return NextResponse.json({ members, invites: pendingInvites });
}

// POST — stuur uitnodiging
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const { email, role = "member" } = body ?? {};

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Geldig e-mailadres vereist" }, { status: 422 });
  }

  // Controleer of deze persoon al lid is
  const [existingUser] = await db.select().from(authUsers).where(eq(authUsers.email, email.toLowerCase()));
  if (existingUser) {
    const [existing] = await db
      .select()
      .from(orgMembers)
      .where(and(eq(orgMembers.organizationId, org.id), eq(orgMembers.userId, existingUser.id)));
    if (existing) {
      return NextResponse.json({ error: "Persoon is al lid van je team" }, { status: 409 });
    }
  }

  const token     = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dagen
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";

  const [invite] = await db.insert(orgInvites).values({
    organizationId: org.id,
    email:          email.toLowerCase(),
    role,
    token,
    invitedBy:      session.user.email ?? "",
    expiresAt,
  }).returning();

  // Stuur uitnodigingsmail
  const inviteUrl = `${appUrl}/invite/${token}`;
  sendTeamInviteEmail({
    to:       email,
    orgName:  org.name,
    inviteUrl,
    invitedBy: session.user.name ?? session.user.email ?? "Een collega",
  }).catch(err => console.error("[invite email]", err));

  return NextResponse.json({ invite }, { status: 201 });
}

// DELETE — verwijder teamlid of trek uitnodiging in
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const { memberId, inviteId } = await req.json().catch(() => ({}));

  if (memberId) {
    await db.delete(orgMembers).where(
      and(eq(orgMembers.id, memberId), eq(orgMembers.organizationId, org.id))
    );
  } else if (inviteId) {
    await db.delete(orgInvites).where(
      and(eq(orgInvites.id, inviteId), eq(orgInvites.organizationId, org.id))
    );
  } else {
    return NextResponse.json({ error: "memberId of inviteId vereist" }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
