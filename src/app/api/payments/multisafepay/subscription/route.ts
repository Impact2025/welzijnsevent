import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, subscriptions } from "@/db";

export const maxDuration = 30; // seconden (Vercel Pro: tot 300s, Hobby: genegeerd)
import { eq, and } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import { PLAN_PRICES_CENTS } from "@/lib/plans";

const MSP_API_BASE =
  process.env.MULTISAFEPAY_ENV === "live"
    ? "https://api.multisafepay.com/v1/json"
    : "https://testapi.multisafepay.com/v1/json";

export async function POST(req: Request) {
  try {
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
    if (!apiKey) return NextResponse.json({ error: "Betaalprovider niet geconfigureerd (geen API key)" }, { status: 500 });

    // Hergebruik bestaande pending subscription voor dit plan, maak anders een nieuwe aan
    const existing = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.organizationId, org.id), eq(subscriptions.status, "pending_payment"), eq(subscriptions.plan, plan)))
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

    const mspPayload = {
      type: "redirect",
      order_id: `sub_${sub.id}`,
      currency: "EUR",
      amount: amountCents,
      description: `Bijeen abonnement — ${plan}`,
      payment_options: {
        notification_url: `${baseUrl}/api/payments/multisafepay/webhook`,
        redirect_url: `${baseUrl}/onboarding/succes`,
        cancel_url: `${baseUrl}/dashboard/instellingen`,
      },
      customer: { locale: "nl_NL" },
    };

    console.log("[msp/subscription] ENV:", process.env.MULTISAFEPAY_ENV ?? "niet gezet → test API");
    console.log("[msp/subscription] Base:", MSP_API_BASE);
    console.log("[msp/subscription] Payload:", JSON.stringify(mspPayload));

    // 8 seconden timeout — onder Vercel's 10s execution limit
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    // URL-encode de API key zodat speciale tekens (+, /, =) correct worden doorgegeven
    const mspUrl = new URL(`${MSP_API_BASE}/orders`);
    mspUrl.searchParams.set("api_key", apiKey);

    let mspRes: Response;
    try {
      mspRes = await fetch(mspUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mspPayload),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      console.error("[msp/subscription] Fetch mislukt:", msg);
      return NextResponse.json({ error: `MSP API onbereikbaar: ${msg}` }, { status: 502 });
    }
    clearTimeout(timeout);

    const mspData = await mspRes.json().catch(() => null);
    console.log("[msp/subscription] MSP status:", mspRes.status, "response:", JSON.stringify(mspData));

    if (!mspRes.ok || !mspData?.data?.payment_url) {
      return NextResponse.json({
        error: "Betaallink aanmaken mislukt",
        details: {
          error_code: mspData?.error_code ?? mspRes.status,
          error_info: mspData?.error_info ?? mspData?.message ?? null,
          msp_response: mspData,
        },
      }, { status: 502 });
    }

    await db
      .update(subscriptions)
      .set({ paymentId: `sub_${sub.id}` })
      .where(eq(subscriptions.id, sub.id));

    return NextResponse.json({ paymentUrl: mspData.data.payment_url });
  } catch (err) {
    console.error("[msp/subscription] Onverwachte fout:", err);
    return NextResponse.json({ error: "Interne fout bij aanmaken betaallink" }, { status: 500 });
  }
}
