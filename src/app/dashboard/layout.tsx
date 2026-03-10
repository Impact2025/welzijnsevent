import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { getCurrentOrg, getCurrentSubscription, isSubscriptionActive } from "@/lib/auth";

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
        {!active && subscription && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center justify-between">
            <p className="text-xs text-amber-800 font-medium">
              {subscription.status === "pending_payment"
                ? "Je betaling wordt verwerkt — abonnement is nog niet actief."
                : "Je abonnement is verlopen. Verleng om alle functies te blijven gebruiken."}
            </p>
            <a
              href="/dashboard/instellingen"
              className="text-xs font-bold text-amber-700 hover:text-amber-900 underline ml-4 shrink-0"
            >
              Beheer abonnement
            </a>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
