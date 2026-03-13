import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, orders, events } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  // Verify event belongs to org
  const [event] = await db.select({ id: events.id }).from(events).where(
    and(eq(events.id, eventId), eq(events.organizationId, org.id))
  );
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const list = await db
    .select()
    .from(orders)
    .where(eq(orders.eventId, eventId))
    .orderBy(desc(orders.createdAt));

  return NextResponse.json(list);
}
