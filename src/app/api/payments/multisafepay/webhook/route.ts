import { NextResponse } from "next/server";
import { db, orders, attendees, ticketTypes } from "@/db";
import { eq } from "drizzle-orm";

const MSP_API_BASE =
  process.env.MULTISAFEPAY_ENV === "live"
    ? "https://api.multisafepay.com/v1/json"
    : "https://testapi.multisafepay.com/v1/json";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  // MultiSafePay sends: { transactionid, timestamp }
  const orderId: string | undefined = body?.transactionid;
  if (!orderId) {
    return NextResponse.json({ error: "Missing transactionid" }, { status: 400 });
  }

  const apiKey = process.env.MULTISAFEPAY_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  // Verify status with MultiSafePay
  const mspRes = await fetch(`${MSP_API_BASE}/orders/${orderId}?api_key=${apiKey}`);
  const mspData = await mspRes.json();
  const mspStatus: string = mspData.data?.status ?? "unknown";

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const newStatus =
    mspStatus === "completed" ? "paid"
    : mspStatus === "cancelled" || mspStatus === "void" ? "cancelled"
    : mspStatus === "declined" ? "failed"
    : null;

  if (!newStatus) {
    return NextResponse.json({ ok: true, status: mspStatus });
  }

  await db.update(orders).set({ status: newStatus, updatedAt: new Date() }).where(eq(orders.id, orderId));

  // On successful payment: create attendee and update soldCount
  if (newStatus === "paid" && !order.attendeeId) {
    const [attendee] = await db
      .insert(attendees)
      .values({
        eventId: order.eventId,
        name: order.customerName,
        email: order.customerEmail,
        status: "aangemeld",
      })
      .returning();

    await db.update(orders).set({ attendeeId: attendee.id }).where(eq(orders.id, orderId));

    if (order.ticketTypeId) {
      const [ticket] = await db.select().from(ticketTypes).where(eq(ticketTypes.id, order.ticketTypeId));
      if (ticket) {
        await db
          .update(ticketTypes)
          .set({ soldCount: (ticket.soldCount ?? 0) + 1 })
          .where(eq(ticketTypes.id, ticket.id));
      }
    }
  }

  return NextResponse.json({ ok: true });
}

// MultiSafePay may also send GET for status check
export async function GET() {
  return NextResponse.json({ ok: true });
}
