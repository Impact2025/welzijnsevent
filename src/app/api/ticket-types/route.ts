import { NextResponse } from "next/server";
import { db, ticketTypes } from "@/db";
import { eq, asc } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const rows = await db
    .select()
    .from(ticketTypes)
    .where(eq(ticketTypes.eventId, eventId))
    .orderBy(asc(ticketTypes.sortOrder));

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { eventId, name, description, price, currency, maxQuantity, sortOrder } = body;

  if (!eventId || !name) {
    return NextResponse.json({ error: "eventId and name required" }, { status: 400 });
  }

  const [ticket] = await db
    .insert(ticketTypes)
    .values({
      eventId,
      name,
      description: description ?? null,
      price: price ?? 0,
      currency: currency ?? "EUR",
      maxQuantity: maxQuantity ?? null,
      sortOrder: sortOrder ?? 0,
    })
    .returning();

  return NextResponse.json(ticket, { status: 201 });
}
