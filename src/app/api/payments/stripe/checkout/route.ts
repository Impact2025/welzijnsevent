import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db, events, ticketTypes, orders } from "@/db";
import { eq } from "drizzle-orm";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { PaymentSchema, validationError } from "@/lib/validation";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(req: Request) {
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
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  let amount = 0;
  let currency = "eur";
  let ticketName = "Ticket";

  if (ticketTypeId) {
    const [ticket] = await db.select().from(ticketTypes).where(eq(ticketTypes.id, ticketTypeId));
    if (!ticket) return NextResponse.json({ error: "Ticket type not found" }, { status: 404 });
    amount = ticket.price;
    currency = (ticket.currency ?? "EUR").toLowerCase();
    ticketName = ticket.name;
  }

  const [order] = await db
    .insert(orders)
    .values({
      eventId,
      ticketTypeId: ticketTypeId ?? null,
      customerName: name,
      customerEmail: email,
      amount,
      currency: currency.toUpperCase(),
      status: "pending",
    })
    .returning();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get("host")}`;

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "ideal"],
    customer_email: email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amount,
          product_data: {
            name: `${ticketName} — ${event.title}`,
          },
        },
      },
    ],
    metadata: {
      type: "ticket",
      orderId: order.id,
      slug: slug ?? "",
    },
    success_url: `${baseUrl}/e/${slug}/register/success?orderId=${order.id}`,
    cancel_url: `${baseUrl}/e/${slug}/register`,
    locale: "nl",
  });

  await db.update(orders).set({ paymentId: session.id }).where(eq(orders.id, order.id));

  return NextResponse.json({ paymentUrl: session.url, orderId: order.id });
}
