import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, organizations, subscriptions, authUsers } from "@/db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { PLAN_PRICES_CENTS, FREE_PLANS } from "@/lib/plans";
import { sendWelcomeTrialEmail } from "@/lib/email";

const MSP_API_BASE =
  process.env.MULTISAFEPAY_ENV === "live"
    ? "https://api.multisafepay.com/v1/json"
    : "https://testapi.multisafepay.com/v1/json";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const body = await req.json();
  const { name, logo, plan } = body;

  if (!name?.trim() || !plan) {
    return NextResponse.json({ error: "Naam en plan zijn verplicht" }, { status: 400 });
  }

  // Check for existing organisation
  const [existing] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.userId, userId));

  let org = existing;

  if (existing) {
    // If org exists, check if it has an active/trial subscription
    const [existingSub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, existing.id))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    if (existingSub && existingSub.status === "active") {
      // Already fully onboarded — redirect to dashboard
      return NextResponse.json({ redirect: "/dashboard" });
    }

    // Pending/failed payment: clean up old subscriptions and retry
    await db.delete(subscriptions).where(eq(subscriptions.organizationId, existing.id));
    // Update org name/logo in case they changed it
    const [updated] = await db
      .update(organizations)
      .set({ name: name.trim(), logo: logo ?? null })
      .where(eq(organizations.id, existing.id))
      .returning();
    org = updated;
  } else {
    const slug =
      name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
      "-" + Date.now().toString(36);

    const [created] = await db
      .insert(organizations)
      .values({ name: name.trim(), logo: logo ?? null, slug, userId })
      .returning();
    org = created;
  }

  if (FREE_PLANS.has(plan)) {
    const expiresAt = plan === "trial" ? new Date(Date.now() + 14 * 86_400_000) : null;

    await db.insert(subscriptions).values({
      organizationId: org.id,
      plan,
      status: "active",
      expiresAt,
    });

    // Stuur welkomstmail
    const [user] = await db.select().from(authUsers).where(eq(authUsers.id, userId));
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";
    if (user?.email && expiresAt) {
      sendWelcomeTrialEmail({
        to: user.email,
        firstName: user.name?.split(" ")[0] ?? name.trim().split(" ")[0],
        orgName: name.trim(),
        trialEndsAt: expiresAt,
        dashboardUrl: `${baseUrl}/dashboard`,
      }).catch(() => {});
    }

    return NextResponse.json({ redirect: "/dashboard" });
  }

  // Paid plan: create pending subscription + MultiSafePay payment
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

  const apiKey = process.env.MULTISAFEPAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Betaalprovider niet geconfigureerd" }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get("host")}`;

  const orderId = `sub_${randomUUID()}`;

  const mspPayload = {
    type: "redirect",
    order_id: orderId,
    currency: "EUR",
    amount: amountCents,
    description: `Bijeen abonnement — ${plan}`,
    payment_options: {
      notification_url: `${baseUrl}/api/payments/multisafepay/webhook`,
      redirect_url: `${baseUrl}/onboarding/succes`,
      cancel_url: `${baseUrl}/onboarding`,
    },
    customer: { locale: "nl_NL" },
  };

  const mspRes = await fetch(`${MSP_API_BASE}/orders?api_key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mspPayload),
  });

  const mspData = await mspRes.json();
  if (!mspRes.ok || !mspData.data?.payment_url) {
    return NextResponse.json({ error: "Betaallink aanmaken mislukt", details: mspData }, { status: 502 });
  }

  await db
    .update(subscriptions)
    .set({ paymentId: orderId })
    .where(eq(subscriptions.id, sub.id));

  return NextResponse.json({ paymentUrl: mspData.data.payment_url });
}
