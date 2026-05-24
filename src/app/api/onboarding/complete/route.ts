import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { db, organizations, subscriptions, authUsers } from "@/db";
import { eq, desc } from "drizzle-orm";
import { PLAN_PRICES_CENTS, FREE_PLANS } from "@/lib/plans";
import { sendWelcomeTrialEmail, sendWelcomeCommunityEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PLAN_LABELS: Record<string, string> = {
  welzijn: "Bijeen Welzijn",
  netwerk: "Bijeen Netwerk",
  organisatie: "Bijeen Organisatie",
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const body = await req.json();
  const { name, logo, plan, phone, orgType, eventsPerYear, contactRole } = body;

  if (!name?.trim() || !plan) {
    return NextResponse.json({ error: "Naam en plan zijn verplicht" }, { status: 400 });
  }

  const qualificationData = {
    phone: phone?.trim() || null,
    orgType: orgType || null,
    eventsPerYear: eventsPerYear || null,
    contactRole: contactRole || null,
  };

  const [existing] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.userId, userId));

  let org = existing;

  if (existing) {
    const [existingSub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, existing.id))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    if (existingSub && existingSub.status === "active") {
      return NextResponse.json({ redirect: "/dashboard" });
    }

    await db.delete(subscriptions).where(eq(subscriptions.organizationId, existing.id));
    const [updated] = await db
      .update(organizations)
      .set({ name: name.trim(), logo: logo ?? null, ...qualificationData })
      .where(eq(organizations.id, existing.id))
      .returning();
    org = updated;
  } else {
    const slug =
      name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
      "-" + Date.now().toString(36);

    const [created] = await db
      .insert(organizations)
      .values({ name: name.trim(), logo: logo ?? null, slug, userId, ...qualificationData })
      .returning();
    org = created;
  }

  const [user] = await db.select().from(authUsers).where(eq(authUsers.id, userId));
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";
  const firstName = user?.name?.split(" ")[0] ?? name.trim().split(" ")[0];

  if (FREE_PLANS.has(plan)) {
    const expiresAt = plan === "trial" ? new Date(Date.now() + 14 * 86_400_000) : null;

    await db.insert(subscriptions).values({
      organizationId: org.id,
      plan,
      status: "active",
      expiresAt,
    });

    if (user?.email) {
      if (plan === "trial" && expiresAt) {
        sendWelcomeTrialEmail({
          to: user.email,
          firstName,
          orgName: name.trim(),
          trialEndsAt: expiresAt,
          dashboardUrl: `${baseUrl}/dashboard`,
        }).catch(() => {});
      } else if (plan === "community") {
        sendWelcomeCommunityEmail({
          to: user.email,
          firstName,
          orgName: name.trim(),
          eventsPerYear: qualificationData.eventsPerYear,
          dashboardUrl: `${baseUrl}/dashboard`,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ redirect: "/dashboard" });
  }

  // Betaald plan: maak subscription aan + Stripe Checkout Session
  const amountCents = PLAN_PRICES_CENTS[plan];
  if (!amountCents) {
    return NextResponse.json({ error: "Ongeldig plan" }, { status: 400 });
  }

  const [sub] = await db
    .insert(subscriptions)
    .values({
      organizationId: org.id,
      plan,
      status: "pending_payment",
      amountPaid: amountCents,
    })
    .returning();

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "ideal"],
    customer_email: user?.email ?? undefined,
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
    cancel_url: `${baseUrl}/onboarding`,
    locale: "nl",
  });

  await db
    .update(subscriptions)
    .set({ paymentId: stripeSession.id })
    .where(eq(subscriptions.id, sub.id));

  return NextResponse.json({ paymentUrl: stripeSession.url });
}
