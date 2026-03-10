import { db, organizations, events, attendees, subscriptions } from "@/db";
import { count, desc, gte, inArray } from "drizzle-orm";
import {
  Building2, Users, TrendingUp,
  AlertTriangle, Euro, Activity, Shield,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { GrowthChart } from "@/components/admin/growth-chart";

function adminAvatarColor(name: string): string {
  const colors = ["#C8522A", "#2D5A3D", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"];
  return colors[name.charCodeAt(0) % colors.length];
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

function PlanBadge({ plan, status }: { plan: string; status: string | null }) {
  const now = new Date();
  const isActive = status === "active";
  const colors: Record<string, string> = {
    trial:       "bg-amber-500/15 text-amber-400 border-amber-500/25",
    starter:     "bg-blue-500/15 text-blue-400 border-blue-500/25",
    groei:       "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    organisatie: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  };
  const labels: Record<string, string> = {
    trial: "Trial", starter: "Starter", groei: "Groei", organisatie: "Organisatie",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${colors[plan] ?? "bg-white/10 text-white/50 border-white/10"}`}>
      {labels[plan] ?? plan}
    </span>
  );
}

function StatusDot({ status, expiresAt }: { status: string | null; expiresAt: Date | null }) {
  const expired = expiresAt && new Date(expiresAt) < new Date();
  if (expired || status === "expired" || status === "cancelled") {
    return <span className="inline-flex items-center gap-1 text-red-400 text-[10px] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />Verlopen</span>;
  }
  if (status === "pending_payment") {
    return <span className="inline-flex items-center gap-1 text-amber-400 text-[10px] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />Betaling</span>;
  }
  return <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />Actief</span>;
}

export default async function AdminOverviewPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Fetch all base data in parallel
  const [
    allOrgs,
    [{ count: totalEvents }],
    [{ count: eventsThisMonth }],
    [{ count: totalAttendees }],
  ] = await Promise.all([
    db.select().from(organizations).orderBy(desc(organizations.createdAt)),
    db.select({ count: count() }).from(events),
    db.select({ count: count() }).from(events).where(gte(events.createdAt, startOfMonth)),
    db.select({ count: count() }).from(attendees),
  ]);

  // Subscriptions
  const allSubs = await db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));

  // Latest sub per org
  const latestSubMap = new Map<string, typeof allSubs[0]>();
  for (const sub of allSubs) {
    if (!latestSubMap.has(sub.organizationId)) {
      latestSubMap.set(sub.organizationId, sub);
    }
  }

  // Plan breakdown + metrics
  const planCounts = { trial: 0, starter: 0, groei: 0, organisatie: 0, geen: 0 };
  let activeCount = 0;
  let expiredCount = 0;
  let arr = 0;
  const churnRiskOrgs: string[] = [];

  for (const org of allOrgs) {
    const sub = latestSubMap.get(org.id);
    if (!sub) { planCounts.geen++; continue; }

    const key = sub.plan as keyof typeof planCounts;
    if (key in planCounts) planCounts[key]++;

    const isExpired = sub.expiresAt && new Date(sub.expiresAt) < now;
    const isActive = sub.status === "active" && !isExpired;

    if (isActive) activeCount++;
    else expiredCount++;

    if (isActive && sub.amountPaid && sub.plan !== "trial") {
      arr += sub.amountPaid;
    }

    // Trial expiring within 7 days
    if (sub.plan === "trial" && sub.expiresAt) {
      const exp = new Date(sub.expiresAt);
      if (exp <= in7Days && exp > now) {
        churnRiskOrgs.push(org.id);
      }
    }
  }

  const mrr = Math.round(arr / 12);
  const totalOrgs = allOrgs.length;
  const orgsThisMonth = allOrgs.filter(
    o => o.createdAt && new Date(o.createdAt) >= startOfMonth
  ).length;

  // Trial conversion rate
  const paidOrgs = planCounts.starter + planCounts.groei + planCounts.organisatie;
  const trialConversion = totalOrgs > 0 ? Math.round((paidOrgs / totalOrgs) * 100) : 0;

  // Monthly growth data (last 6 months)
  const growthData = (() => {
    const months: { maand: string; orgs: number; arr: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = d.toLocaleDateString("nl-NL", { month: "short" });
      const newOrgs = allOrgs.filter(o => {
        const c = o.createdAt ? new Date(o.createdAt) : null;
        return c && c >= d && c < end;
      }).length;
      // MRR contribution from subs starting that month
      const monthArr = allSubs
        .filter(s => {
          const c = s.startsAt ? new Date(s.startsAt) : null;
          return c && c >= d && c < end && s.amountPaid && s.plan !== "trial" && s.status === "active";
        })
        .reduce((sum, s) => sum + Math.round((s.amountPaid ?? 0) / 1200), 0);
      months.push({ maand: label, orgs: newOrgs, arr: monthArr });
    }
    return months;
  })();

  // Recent orgs (last 5)
  const recentOrgs = allOrgs.slice(0, 5).map(org => ({
    ...org,
    subscription: latestSubMap.get(org.id) ?? null,
  }));

  // Churn risk orgs with details
  const churnRiskDetails = allOrgs
    .filter(o => churnRiskOrgs.includes(o.id))
    .map(org => ({
      ...org,
      subscription: latestSubMap.get(org.id)!,
      daysLeft: Math.ceil(
        (new Date(latestSubMap.get(org.id)!.expiresAt!).getTime() - now.getTime()) / 86400000
      ),
    }));

  // Plan bar widths
  const maxPlan = Math.max(...Object.values(planCounts), 1);

  return (
    <div className="px-6 py-7 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">
          Bijeen Admin
        </p>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Platform Overzicht
        </h1>
        <p className="text-sm text-white/40 mt-1">
          {new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* ARR */}
        <div className="bg-[#1A1815] border border-white/8 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0" />
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">ARR</p>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Euro size={13} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white tracking-tight">
            €{(arr / 100).toLocaleString("nl-NL", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[11px] text-white/35 mt-1 font-medium">
            MRR: €{(mrr / 100).toLocaleString("nl-NL", { maximumFractionDigits: 0 })}
          </p>
        </div>

        {/* Organisaties */}
        <div className="bg-[#1A1815] border border-white/8 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0" />
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Organisaties</p>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Building2 size={13} className="text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white tracking-tight">{totalOrgs}</p>
          <p className="text-[11px] text-white/35 mt-1 font-medium">
            +{orgsThisMonth} deze maand
          </p>
        </div>

        {/* Actief */}
        <div className="bg-[#1A1815] border border-white/8 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0" />
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Actief</p>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Activity size={13} className="text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white tracking-tight">{activeCount}</p>
          <p className="text-[11px] text-white/35 mt-1 font-medium">
            {expiredCount} verlopen
          </p>
        </div>

        {/* Deelnemers */}
        <div className="bg-[#1A1815] border border-white/8 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-purple-500/0 via-purple-500 to-purple-500/0" />
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Deelnemers</p>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Users size={13} className="text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white tracking-tight">
            {Number(totalAttendees).toLocaleString("nl-NL")}
          </p>
          <p className="text-[11px] text-white/35 mt-1 font-medium">
            {Number(totalEvents)} events · {eventsThisMonth} deze maand
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Plan Distributie */}
        <div className="bg-[#1A1815] border border-white/8 rounded-2xl p-5">
          <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest mb-5">
            Plan distributie
          </h2>
          <div className="space-y-3">
            {[
              { key: "organisatie", label: "Organisatie", color: "bg-purple-500" },
              { key: "groei",       label: "Groei",       color: "bg-emerald-500" },
              { key: "starter",     label: "Starter",     color: "bg-blue-500" },
              { key: "trial",       label: "Trial",       color: "bg-amber-500" },
            ].map(({ key, label, color }) => {
              const n = planCounts[key as keyof typeof planCounts] ?? 0;
              const pct = Math.round((n / Math.max(totalOrgs, 1)) * 100);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-white/60 font-medium">{label}</span>
                    <span className="text-xs font-bold text-white">{n} <span className="text-white/35 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-4 border-t border-white/8 flex items-center justify-between">
            <span className="text-[11px] text-white/40">Trial → Betaald</span>
            <span className="text-[11px] font-bold text-emerald-400">{trialConversion}%</span>
          </div>
        </div>

        {/* Churn Risico's */}
        <div className="bg-[#1A1815] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest">
              Churn risico
            </h2>
            {churnRiskDetails.length > 0 && (
              <span className="bg-red-500/15 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/20">
                {churnRiskDetails.length} trial ≤7d
              </span>
            )}
          </div>
          {churnRiskDetails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
                <Activity size={18} className="text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-white/60">Geen risico's</p>
              <p className="text-xs text-white/30 mt-1">Geen trials die binnenkort verlopen</p>
            </div>
          ) : (
            <div className="space-y-3">
              {churnRiskDetails.map(org => (
                <Link
                  key={org.id}
                  href="/admin/organisaties"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 hover:border-red-500/20 transition-all group"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: adminAvatarColor(org.name) + "33" }}
                  >
                    <span className="text-xs font-bold text-white">{getInitials(org.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{org.name}</p>
                    <p className="text-[10px] text-red-400 font-medium">
                      Nog {org.daysLeft} dag{org.daysLeft !== 1 ? "en" : ""}
                    </p>
                  </div>
                  <AlertTriangle size={13} className="text-red-400/60 group-hover:text-red-400 shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recente aanmeldingen */}
        <div className="bg-[#1A1815] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest">
              Recente aanmeldingen
            </h2>
            <Link
              href="/admin/organisaties"
              className="text-[10px] font-bold text-white/35 hover:text-white/60 transition-colors"
            >
              Alles →
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentOrgs.map(org => (
              <div key={org.id} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold text-white"
                  style={{ backgroundColor: adminAvatarColor(org.name) }}
                >
                  {getInitials(org.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{org.name}</p>
                  <p className="text-[10px] text-white/35">
                    {org.createdAt ? formatDate(org.createdAt, "d MMM yyyy") : "—"}
                  </p>
                </div>
                {org.subscription && (
                  <PlanBadge plan={org.subscription.plan} status={org.subscription.status} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Groei grafiek */}
      <div className="bg-[#1A1815] border border-white/8 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest">Groei afgelopen 6 maanden</h2>
            <p className="text-[11px] text-white/30 mt-0.5">
              <span className="inline-flex items-center gap-1 mr-3">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Nieuwe orgs
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />MRR (€)
              </span>
            </p>
          </div>
        </div>
        <GrowthChart data={growthData} />
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/organisaties"
          className="bg-[#1A1815] border border-white/8 rounded-2xl p-5 flex items-center gap-4 hover:border-white/15 hover:bg-[#201E1A] transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
            <Building2 size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Organisaties</p>
            <p className="text-xs text-white/40 mt-0.5">Plans, subscripties, CSV export</p>
          </div>
        </Link>
        <Link
          href="/admin/ai-inzichten"
          className="bg-[#1A1815] border border-white/8 rounded-2xl p-5 flex items-center gap-4 hover:border-white/15 hover:bg-[#201E1A] transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
            <TrendingUp size={18} className="text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">AI Inzichten</p>
            <p className="text-xs text-white/40 mt-0.5">Churn risico's, kansen, aanbevelingen</p>
          </div>
        </Link>
        <Link
          href="/admin/audit-log"
          className="bg-[#1A1815] border border-white/8 rounded-2xl p-5 flex items-center gap-4 hover:border-white/15 hover:bg-[#201E1A] transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
            <Shield size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Audit Log</p>
            <p className="text-xs text-white/40 mt-0.5">Wie wijzigde wat, wanneer</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
