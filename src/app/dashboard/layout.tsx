import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { getCurrentOrg, getCurrentSubscription, isSubscriptionActive } from "@/lib/auth";
import { ProductTour } from "@/components/onboarding/product-tour";
import { CommandPalette } from "@/components/ui/command-palette";
import { PwaInstallBanner } from "@/components/pwa-install-banner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const org = await getCurrentOrg();
  if (!org) redirect("/onboarding");

  const subscription = await getCurrentSubscription(org.id);
  const active = isSubscriptionActive(subscription);

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar
        orgName={org.name}
        orgLogo={org.logo ?? null}
        plan={subscription?.plan ?? null}
        subscriptionActive={active}
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
