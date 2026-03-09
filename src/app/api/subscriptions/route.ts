import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCurrentOrg, getCurrentSubscription, isSubscriptionActive } from "@/lib/auth";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getCurrentOrg();
  if (!org) {
    return NextResponse.json({ subscription: null, active: false });
  }

  const subscription = await getCurrentSubscription(org.id);
  const active = isSubscriptionActive(subscription);

  return NextResponse.json({ subscription, active });
}
