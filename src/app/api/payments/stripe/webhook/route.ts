import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db, orders, attendees, ticketTypes, events, subscriptions, organizations, authUsers } from "@/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { sendPaymentConfirmationEmail, sendRegistrationConfirmation } from "@/lib/email";
import { formatDateTime } from "@/lib/utils";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Webhook secret niet geconfigureerd" }, { status: 500 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[stripe/webhook] Handtekening verificatie mislukt:", msg);
    return NextResponse.json({ error: `Webhook verificatie mislukt: ${msg}` }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ ok: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata ?? {};

  if (metadata.type === "subscription") {
    const { subscriptionId, plan } = metadata;
    if (!subscriptionId) return NextResponse.json({ error: "Missing subscriptionId" }, { status: 400 });

    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId));
    if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    await db
      .update(subscriptions)
      .set({ status: "active", expiresAt, updatedAt: new Date() })
      .where(eq(subscriptions.id, sub.id));

    const [org] = await db.select().from(organizations).where(eq(organizations.id, sub.organizationId));
    if (org?.userId) {
      const [user] = await db.select().from(authUsers).where(eq(authUsers.id, org.userId));
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";
      if (user?.email) {
        sendPaymentConfirmationEmail({
          to: user.email,
          firstName: user.name?.split(" ")[0] ?? org.name.split(" ")[0],
          orgName: org.name,
          plan: plan ?? "starter",
          amountCents: sub.amountPaid ?? 0,
          expiresAt,
          dashboardUrl: `${baseUrl}/dashboard`,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ ok: true });
  }

  if (metadata.type === "ticket") {
    const { orderId, slug } = metadata;
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    await db.update(orders).set({ status: "paid", updatedAt: new Date() }).where(eq(orders.id, orderId));

    if (!order.attendeeId) {
      const qrCode = randomUUID();

      const [attendee] = await db
        .insert(attendees)
        .values({
          eventId: order.eventId,
          name: order.customerName,
          email: order.customerEmail,
          status: "aangemeld",
          qrCode,
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

      const [eventRow] = await db.select().from(events).where(eq(events.id, order.eventId));
      if (eventRow) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";
        sendRegistrationConfirmation({
          to: order.customerEmail,
          name: order.customerName,
          eventTitle: eventRow.title,
          eventDate: formatDateTime(eventRow.startsAt),
          eventLocation: eventRow.location,
          qrCode,
          appUrl,
        }).catch(console.error);
      }
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
