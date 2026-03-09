import { NextResponse } from "next/server";
import { db, ticketTypes } from "@/db";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const [ticket] = await db.select().from(ticketTypes).where(eq(ticketTypes.id, params.id));
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(ticket);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const [updated] = await db
    .update(ticketTypes)
    .set(body)
    .where(eq(ticketTypes.id, params.id))
    .returning();
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await db.delete(ticketTypes).where(eq(ticketTypes.id, params.id));
  return NextResponse.json({ success: true });
}
