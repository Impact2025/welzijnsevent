import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, subscriptions } from "@/db";
import { eq } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import { PLAN_PRICES_CENTS } from "@/lib/plans";

const MSP_API_BASE =
  process.env.MULTISAFEPAY_ENV === "live"
    ? "https://api.multisafepay.com/v1/json"
    : "https://testapi.multisafepay.com/v1/json";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Organisatie niet gevonden" }, { status: 404 });

  const { SubscriptionSchema, validationError } = await import("@/lib/validation");
  const rawBody = await req.json().catch(() => null);
  const parsed = SubscriptionSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(validationError(parsed.error), { status: 422 });
  }

  const { plan } = parsed.data;
  const amountCents = PLAN_PRICES_CENTS[plan];
  if (!amountCents) return NextResponse.json({ error: "Ongeldig plan" }, { status: 400 });

  const apiKey = process.env.MULTISAFEPAY_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Betaalprovider niet geconfigureerd" }, { status: 500 });

  // Create or update subscription record
  const [sub] = await db
    .insert(subscriptions)
    .values({
      organizationId: org.id,
      plan,
      status: "pending_payment",
      amountPaid: amountCents,
    })
    .returning();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get("host")}`;

  const mspPayload = {
    type: "redirect",
    order_id: `sub_${sub.id}`,
    currency: "EUR",
    amount: amountCents,
    description: `Bijeen abonnement verlenging — ${plan}`,
    payment_options: {
      notification_url: `${baseUrl}/api/payments/multisafepay/webhook`,
      redirect_url: `${baseUrl}/onboarding/succes`,
      cancel_url: `${baseUrl}/dashboard/instellingen`,
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
    .set({ paymentId: `sub_${sub.id}` })
    .where(eq(subscriptions.id, sub.id));

  return NextResponse.json({ paymentUrl: mspData.data.payment_url });
}
