import { db, subscriptions, organizations } from "@/db";
import { desc, eq } from "drizzle-orm";
import { Euro, TrendingUp, TrendingDown, Users, ArrowUpRight } from "lucide-react";

const PLAN_MRR: Record<string, number> = {
  starter:     4900,  // €49/mo (in centen)
  groei:       9900,  // €99/mo
  organisatie: 19900, // €199/mo
};

const PLAN_LABELS: Record<string, string> = {
  trial: "Trial", starter: "Starter", groei: "Groei", organisatie: "Organisatie",
};

function fmt(centen: number) {
  return `€${(centen / 100).toLocaleString("nl-NL", { maximumFractionDigits: 0 })}`;
}

export default async function RevenuePage() {
  const now = new Date();

  const [allSubs, allOrgs] = await Promise.all([
    db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt)),
    db.select().from(organizations),
  ]);

  // Latest sub per org
  const latestByOrg = new Map<string, typeof allSubs[0]>();
  for (const sub of allSubs) {
    if (!latestByOrg.has(sub.organizationId)) latestByOrg.set(sub.organizationId, sub);
  }

  // MRR from active paid subs
  let currentMrr = 0;
  let currentArr = 0;
  const planRevenue: Record<string, number> = { starter: 0, groei: 0, organisatie: 0 };

  for (const sub of Array.from(latestByOrg.values())) {
    const isActive = sub.status === "active" && (!sub.expiresAt || new Date(sub.expiresAt) > now);
    if (!isActive || sub.plan === "trial") continue;
    const mrr = PLAN_MRR[sub.plan] ?? 0;
    currentMrr += mrr;
    planRevenue[sub.plan] = (planRevenue[sub.plan] ?? 0) + mrr;
  }
  currentArr = currentMrr * 12;

  // Monthly MRR for last 12 months
  const monthlyData: { month: string; mrr: number; newSubs: number; churn: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = d.toLocaleDateString("nl-NL", { month: "short", year: "2-digit" });

    // Subs that started in this month (paid)
    const newPaid = allSubs.filter(s => {
      if (!s.startsAt || s.plan === "trial") return false;
      const start = new Date(s.startsAt);
      return start >= d && start < end;
    });
    const newMrr = newPaid.reduce((sum, s) => sum + (PLAN_MRR[s.plan] ?? 0), 0);

    // Subs that expired/cancelled in this month
    const churned = allSubs.filter(s => {
      if (!s.expiresAt || s.plan === "trial") return false;
      const exp = new Date(s.expiresAt);
      return (s.status === "expired" || s.status === "cancelled") && exp >= d && exp < end;
    });
    const churnMrr = churned.reduce((sum, s) => sum + (PLAN_MRR[s.plan] ?? 0), 0);

    monthlyData.push({ month: label, mrr: newMrr, newSubs: newPaid.length, churn: churnMrr });
  }

  // Cumulative MRR per month
  const maxMrr = Math.max(...monthlyData.map(m => m.mrr), 1);

  // Stats
  const totalRevenue = allSubs.filter(s => s.amountPaid && s.plan !== "trial")
    .reduce((a, s) => a + (s.amountPaid ?? 0), 0);

  const latestSubValues = Array.from(latestByOrg.values());
  const paidOrgsCount = latestSubValues.filter(s =>
    s.status === "active" && s.plan !== "trial" && (!s.expiresAt || new Date(s.expiresAt) > now)
  ).length;

  const arpu = paidOrgsCount > 0 ? Math.round(currentMrr / paidOrgsCount) : 0;

  const trialCount = latestSubValues.filter(s =>
    s.status === "active" && s.plan === "trial" && (!s.expiresAt || new Date(s.expiresAt) > now)
  ).length;

  // Churn rate (expired last 30 days / active 30 days ago)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const recentChurn = allSubs.filter(s =>
    s.expiresAt && new Date(s.expiresAt) >= thirtyDaysAgo && new Date(s.expiresAt) < now &&
    (s.status === "expired" || s.status === "cancelled") && s.plan !== "trial"
  ).length;
  const churnRate = paidOrgsCount > 0 ? Math.round((recentChurn / (paidOrgsCount + recentChurn)) * 100) : 0;

  return (
    <div className="px-6 py-7 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-black text-[#C8522A] uppercase tracking-widest mb-1">Admin</p>
        <h1 className="text-2xl font-extrabold text-[#1C1814] tracking-tight">Revenue</h1>
        <p className="text-sm text-[#9E9890] mt-1">Omzet, MRR en abonnementen</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "MRR",           value: fmt(currentMrr), sub: `ARR: ${fmt(currentArr)}`,        icon: Euro,        top: "bg-emerald-500" },
          { label: "ARPU / maand",  value: fmt(arpu),        sub: `${paidOrgsCount} betaalde orgs`, icon: TrendingUp,   top: "bg-blue-500"    },
          { label: "Churn (30d)",   value: `${churnRate}%`,  sub: `${recentChurn} verlopen`,        icon: TrendingDown, top: "bg-red-500"     },
          { label: "Totale omzet",  value: fmt(totalRevenue),sub: `All time`,                       icon: ArrowUpRight, top: "bg-purple-500"  },
        ].map(k => (
          <div key={k.label} className="bg-white border border-black/8 rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <div className={`absolute top-0 inset-x-0 h-[3px] ${k.top}`} />
            <div className="flex items-start justify-between mb-3">
              <p className="text-[10px] font-bold text-[#9E9890] uppercase tracking-widest">{k.label}</p>
              <k.icon size={14} className="text-[#9E9890]" />
            </div>
            <p className="text-2xl font-extrabold text-[#1C1814] tracking-tight">{k.value}</p>
            <p className="text-[11px] text-[#9E9890] mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-6">
        {/* MRR per maand grafiek */}
        <div className="md:col-span-2 bg-white border border-black/8 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-widest mb-5">Nieuwe MRR per maand (12 maanden)</p>
          <div className="flex items-end gap-1.5 h-32">
            {monthlyData.map(m => {
              const barH = maxMrr > 0 ? Math.max((m.mrr / maxMrr) * 100, m.mrr > 0 ? 8 : 0) : 0;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full flex justify-center">
                    {m.mrr > 0 && (
                      <div className="absolute -top-6 text-[9px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {fmt(m.mrr)}
                      </div>
                    )}
                    <div
                      className="w-full bg-emerald-500 rounded-t-sm transition-all"
                      style={{ height: `${barH}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-[#9E9890] font-medium">{m.month}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan breakdown */}
        <div className="bg-white border border-black/8 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-widest mb-5">MRR per plan</p>
          <div className="space-y-4">
            {Object.entries({ organisatie: planRevenue.organisatie, groei: planRevenue.groei, starter: planRevenue.starter }).map(([plan, mrr]) => {
              const pct = currentMrr > 0 ? Math.round((mrr / currentMrr) * 100) : 0;
              const colors: Record<string, string> = { organisatie: "bg-purple-500", groei: "bg-emerald-500", starter: "bg-blue-500" };
              return (
                <div key={plan}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium text-[#6B5E54]">{PLAN_LABELS[plan]}</span>
                    <span className="text-xs font-bold text-[#1C1814]">{fmt(mrr)} <span className="text-[#9E9890] font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[plan]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="pt-3 border-t border-black/6 mt-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#9E9890]">Trials (geen rev.)</span>
                <span className="font-semibold text-[#1C1814]">{trialCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent paid subscriptions */}
      <div className="bg-white border border-black/8 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-black/6">
          <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-widest">Recente betaalde abonnementen</p>
        </div>
        <div className="divide-y divide-black/5">
          {allSubs
            .filter(s => s.amountPaid && s.plan !== "trial")
            .slice(0, 15)
            .map(sub => {
              const org = allOrgs.find(o => o.id === sub.organizationId);
              return (
                <div key={sub.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-black/[0.015]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1C1814] truncate">{org?.name ?? sub.organizationId.slice(0, 8)}</p>
                    <p className="text-[11px] text-[#9E9890]">
                      {sub.startsAt ? new Date(sub.startsAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${{
                    starter: "bg-blue-50 text-blue-700 border-blue-200",
                    groei: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    organisatie: "bg-purple-50 text-purple-700 border-purple-200",
                  }[sub.plan] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}>
                    {PLAN_LABELS[sub.plan] ?? sub.plan}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 shrink-0">
                    {fmt(sub.amountPaid ?? 0)}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
