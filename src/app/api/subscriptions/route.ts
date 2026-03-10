import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCurrentOrg, getCurrentSubscription, isSubscriptionActive } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
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
