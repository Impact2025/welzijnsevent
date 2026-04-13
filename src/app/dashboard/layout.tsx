import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { getCurrentOrg, getCurrentSubscription, isSubscriptionActive } from "@/lib/auth";
import { ProductTour } from "@/components/onboarding/product-tour";
import { CommandPalette } from "@/components/ui/command-palette";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { db } from "@/db";
import { events, attendees } from "@/db";
import { eq, count } from "drizzle-orm";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const org = await getCurrentOrg();
  if (!org) redirect("/onboarding");

  const subscription = await getCurrentSubscription(org.id);
  const active = isSubscriptionActive(subscription);

  // CRM is shown once there are 50+ attendees across all events — earned complexity
  const orgEvents = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.organizationId, org.id));

  let totalAttendees = 0;
  if (orgEvents.length > 0) {
    const eventIds = orgEvents.map((e) => e.id);
    const { inArray } = await import("drizzle-orm");
    const [result] = await db
      .select({ total: count() })
      .from(attendees)
      .where(inArray(attendees.eventId, eventIds));
    totalAttendees = Number(result?.total ?? 0);
  }
  const showCrm = totalAttendees >= 50;

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar
        orgName={org.name}
        orgLogo={org.logo ?? null}
        plan={subscription?.plan ?? null}
        subscriptionActive={active}
        showCrm={showCrm}
      />
      <main className="flex-1 overflow-auto pb-24 md:pb-0">
        {children}
      </main>

      {/* Product tour — auto-starts for new users, client-only */}
      <ProductTour />

      {/* Command palette — ⌘K / Ctrl+K */}
      <CommandPalette />

      {/* PWA install banner — shown to users who haven't installed the app */}
      <PwaInstallBanner />
    </div>
  );
}
