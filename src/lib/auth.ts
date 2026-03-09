import { auth } from "@clerk/nextjs/server";
import { db, organizations, subscriptions } from "@/db";
import { eq, desc } from "drizzle-orm";

export async function getCurrentOrg() {
  const { userId } = await auth();
  if (!userId) return null;

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.clerkUserId, userId));

  return org ?? null;
}

export async function getCurrentSubscription(organizationId: string) {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, organizationId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  return sub ?? null;
}

export function isSubscriptionActive(sub: { status: string | null; expiresAt: Date | null } | null): boolean {
  if (!sub) return false;
  if (sub.status !== "active") return false;
  if (sub.expiresAt && new Date(sub.expiresAt) < new Date()) return false;
  return true;
}
