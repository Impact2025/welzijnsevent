import { NextResponse } from "next/server";
import { db, orders, attendees } from "@/db";
import { eq } from "drizzle-orm";

// Public endpoint: lets the success page poll order status after MSP redirect
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const [order] = await db.select().from(orders).where(eq(orders.id, params.id));
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only expose safe fields
  const result: Record<string, unknown> = {
    id:     order.id,
    status: order.status,
  };

  // If paid and attendee linked, return the qrCode token
  if (order.attendeeId) {
    const [attendee] = await db
      .select({ qrCode: attendees.qrCode })
      .from(attendees)
      .where(eq(attendees.id, order.attendeeId));
    if (attendee?.qrCode) {
      result.token = attendee.qrCode;
    }
  }

  return NextResponse.json(result);
}
