import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { db, subscriptions } from "@/db";
import { eq, and } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import { PLAN_PRICES_CENTS } from "@/lib/plans";
import { SubscriptionSchema, validationError } from "@/lib/validation";

export const maxDuration = 30;

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

const PLAN_LABELS: Record<string, string> = {
  welzijn: "Bijeen Welzijn",
  netwerk: "Bijeen Netwerk",
  organisatie: "Bijeen Organisatie",
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const org = await getCurrentOrg();
    if (!org) return NextResponse.json({ error: "Organisatie niet gevonden" }, { status: 404 });

    const rawBody = await req.json().catch(() => null);
    const parsed = SubscriptionSchema.safeParse(rawBody);
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 422 });

    const { plan } = parsed.data;
    const amountCents = PLAN_PRICES_CENTS[plan];
    if (!amountCents) return NextResponse.json({ error: "Ongeldig plan" }, { status: 400 });

    // Hergebruik bestaande pending subscription voor dit plan
    const existing = await db
      .select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.organizationId, org.id),
        eq(subscriptions.status, "pending_payment"),
        eq(subscriptions.plan, plan),
      ))
      .limit(1);

    let sub = existing[0];
    if (!sub) {
      const [inserted] = await db
        .insert(subscriptions)
        .values({ organizationId: org.id, plan, status: "pending_payment", amountPaid: amountCents })
        .returning();
      sub = inserted;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get("host")}`;

    const stripe = getStripe();
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "ideal"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: {
              name: `${PLAN_LABELS[plan] ?? plan} — jaarabonnement`,
              description: "Geldig voor 1 jaar na betaling",
            },
          },
        },
      ],
      metadata: {
        type: "subscription",
        subscriptionId: sub.id,
        plan,
      },
      success_url: `${baseUrl}/onboarding/succes`,
      cancel_url: `${baseUrl}/dashboard/instellingen`,
      locale: "nl",
    });

    await db.update(subscriptions).set({ paymentId: stripeSession.id }).where(eq(subscriptions.id, sub.id));

    return NextResponse.json({ paymentUrl: stripeSession.url });
  } catch (err) {
    console.error("[stripe/subscription] Fout:", err);
    return NextResponse.json({ error: "Interne fout bij aanmaken betaallink" }, { status: 500 });
  }
}
