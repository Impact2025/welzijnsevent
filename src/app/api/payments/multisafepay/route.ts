import { NextResponse } from "next/server";
import { db, events, ticketTypes, orders } from "@/db";
import { eq } from "drizzle-orm";

const MSP_API_BASE =
  process.env.MULTISAFEPAY_ENV === "live"
    ? "https://api.multisafepay.com/v1/json"
    : "https://testapi.multisafepay.com/v1/json";

export async function POST(req: Request) {
  const { PaymentSchema, validationError } = await import("@/lib/validation");
  const { rateLimit, getClientIp, rateLimitResponse } = await import("@/lib/rate-limit");

  // Rate limit: max 5 betalingen per IP per 5 minuten
  const ip = getClientIp(req);
  const rl = rateLimit(`payment:${ip}`, 5, 5 * 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const rawBody = await req.json().catch(() => null);
  const parsed = PaymentSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(validationError(parsed.error), { status: 422 });
  }

  const { eventId, ticketTypeId, name, email, organization, role, interests, slug } = parsed.data;

  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  let amount = 0;
  let currency = "EUR";

  if (ticketTypeId) {
    const [ticket] = await db.select().from(ticketTypes).where(eq(ticketTypes.id, ticketTypeId));
    if (!ticket) return NextResponse.json({ error: "Ticket type not found" }, { status: 404 });
    amount = ticket.price;
    currency = ticket.currency ?? "EUR";
  }

  // Create order record
  const [order] = await db
    .insert(orders)
    .values({
      eventId,
      ticketTypeId: ticketTypeId ?? null,
      customerName: name,
      customerEmail: email,
      amount,
      currency,
      status: "pending",
    })
    .returning();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `https://${req.headers.get("host")}`;
  const redirectUrl = `${baseUrl}/e/${slug}/register/success?orderId=${order.id}`;
  const webhookUrl = `${baseUrl}/api/payments/multisafepay/webhook`;

  const apiKey = process.env.MULTISAFEPAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Payment provider not configured" }, { status: 500 });
  }

  const mspPayload = {
    type: "redirect",
    order_id: order.id,
    currency,
    amount,
    description: `Ticket: ${event.title}`,
    payment_options: {
      notification_url: webhookUrl,
      redirect_url: redirectUrl,
      cancel_url: `${baseUrl}/e/${slug}/register`,
    },
    customer: {
      firstname: name.split(" ")[0],
      lastname: name.split(" ").slice(1).join(" ") || name,
      email,
      locale: "nl_NL",
    },
  };

  const mspRes = await fetch(`${MSP_API_BASE}/orders?api_key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mspPayload),
  });

  const mspData = await mspRes.json();

  if (!mspRes.ok || !mspData.data?.payment_url) {
    return NextResponse.json({ error: "Payment creation failed", details: mspData }, { status: 502 });
  }

  const paymentUrl: string = mspData.data.payment_url;
  const paymentId: string = mspData.data.transaction_id ?? order.id;

  await db
    .update(orders)
    .set({ paymentUrl, paymentId })
    .where(eq(orders.id, order.id));

  return NextResponse.json({ paymentUrl, orderId: order.id });
}
