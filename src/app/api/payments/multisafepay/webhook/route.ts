import { NextResponse } from "next/server";
import { db, orders, attendees, ticketTypes, subscriptions, organizations, authUsers } from "@/db";
import { eq } from "drizzle-orm";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { sendPaymentConfirmationEmail } from "@/lib/email";

const MSP_API_BASE =
  process.env.MULTISAFEPAY_ENV === "live"
    ? "https://api.multisafepay.com/v1/json"
    : "https://testapi.multisafepay.com/v1/json";

export async function POST(req: Request) {
  // Rate limit: max 60 webhook calls per IP per minuut
  const ip = getClientIp(req);
  const rl = rateLimit(`webhook:${ip}`, 60, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const body = await req.json().catch(() => null);

  // MultiSafePay sends: { transactionid, timestamp }
  // Verificatie: we halen de status op van MSP API zelf (server-to-server), dus spoofing is niet mogelijk.
  const rawId: string | undefined = body?.transactionid;
  if (!rawId) {
    return NextResponse.json({ error: "Missing transactionid" }, { status: 400 });
  }

  const apiKey = process.env.MULTISAFEPAY_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  // Verify status with MultiSafePay
  const mspRes = await fetch(`${MSP_API_BASE}/orders/${rawId}?api_key=${apiKey}`);
  const mspData = await mspRes.json();
  const mspStatus: string = mspData.data?.status ?? "unknown";

  // Handle subscription payment (order_id starts with "sub_")
  if (rawId.startsWith("sub_")) {
    const subId = rawId.replace("sub_", "");
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, subId));
    if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

    if (mspStatus === "completed") {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      await db
        .update(subscriptions)
        .set({ status: "active", expiresAt, updatedAt: new Date() })
        .where(eq(subscriptions.id, subId));

      // Stuur betalingsbevestiging
      const [org] = await db.select().from(organizations).where(eq(organizations.id, sub.organizationId));
      if (org?.userId) {
        const [user] = await db.select().from(authUsers).where(eq(authUsers.id, org.userId));
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";
        if (user?.email) {
          sendPaymentConfirmationEmail({
            to: user.email,
            firstName: user.name?.split(" ")[0] ?? org.name.split(" ")[0],
            orgName: org.name,
            plan: sub.plan ?? "starter",
            amountCents: sub.amountPaid ?? 0,
            expiresAt,
            dashboardUrl: `${baseUrl}/dashboard`,
          }).catch(() => {});
        }
      }
    } else if (mspStatus === "cancelled" || mspStatus === "void" || mspStatus === "declined") {
      await db
        .update(subscriptions)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(subscriptions.id, subId));
    }

    return NextResponse.json({ ok: true });
  }

  const orderId = rawId;
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
