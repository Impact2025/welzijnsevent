import { db, events, attendees, organizations, subscriptions } from "@/db";
import { count, desc, eq, gte, sql } from "drizzle-orm";
import { Calendar, Users, CheckSquare, TrendingUp, Building2 } from "lucide-react";

export default async function PlatformStatsPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400000);

  const [
    [{ total: totalEvents }],
    [{ total: totalAttendees }],
    [{ total: eventsLast30 }],
    [{ total: attendeesLast30 }],
    allOrgs,
    allSubs,
  ] = await Promise.all([
    db.select({ total: count() }).from(events),
    db.select({ total: count() }).from(attendees),
    db.select({ total: count() }).from(events).where(gte(events.createdAt, thirtyDaysAgo)),
    db.select({ total: count() }).from(attendees).where(gte(attendees.registeredAt, thirtyDaysAgo)),
    db.select().from(organizations).orderBy(desc(organizations.createdAt)),
    db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt)),
  ]);

  // Check-in rate
  const checkedIn = await db.select({ c: count() }).from(attendees).where(eq(attendees.status, "ingecheckt"));
  const checkinRate = Number(totalAttendees) > 0 ? Math.round((Number(checkedIn[0].c) / Number(totalAttendees)) * 100) : 0;

  // Events by status
  const eventsByStatus = await db
    .select({ status: events.status, c: count() })
    .from(events)
    .groupBy(events.status);

  const statusMap = Object.fromEntries(eventsByStatus.map(e => [e.status ?? "unknown", Number(e.c)]));

  // Monthly events + attendees (last 6 months)
  const monthlyActivity: { month: string; events: number; attendees: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = start.toLocaleDateString("nl-NL", { month: "short" });

    const [evCount] = await db.select({ c: count() }).from(events)
      .where(sql`${events.createdAt} >= ${start.toISOString()} AND ${events.createdAt} < ${end.toISOString()}`);
    const [attCount] = await db.select({ c: count() }).from(attendees)
      .where(sql`${attendees.registeredAt} >= ${start.toISOString()} AND ${attendees.registeredAt} < ${end.toISOString()}`);

    monthlyActivity.push({ month: label, events: Number(evCount.c), attendees: Number(attCount.c) });
  }

  const maxAttendees = Math.max(...monthlyActivity.map(m => m.attendees), 1);
  const maxEvents   = Math.max(...monthlyActivity.map(m => m.events), 1);

  // Top orgs by event count
  const orgEventCounts = await db
    .select({ organizationId: events.organizationId, c: count() })
    .from(events)
    .groupBy(events.organizationId)
    .orderBy(desc(count()))
    .limit(8);

  const orgMap = Object.fromEntries(allOrgs.map(o => [o.id, o]));
  const latestSubMap = new Map<string, typeof allSubs[0]>();
  for (const s of allSubs) { if (!latestSubMap.has(s.organizationId)) latestSubMap.set(s.organizationId, s); }

  const topOrgs = orgEventCounts.map(row => ({
    org: row.organizationId ? orgMap[row.organizationId] : null,
    eventCount: Number(row.c),
    sub: row.organizationId ? latestSubMap.get(row.organizationId) : null,
  })).filter(r => r.org);

  return (
    <div className="px-6 py-7 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-black text-[#C8522A] uppercase tracking-widest mb-1">Admin</p>
        <h1 className="text-2xl font-extrabold text-[#1C1814] tracking-tight">Platform Statistieken</h1>
        <p className="text-sm text-[#9E9890] mt-1">Activiteit en gebruik over het hele platform</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Events totaal",     value: Number(totalEvents).toLocaleString("nl-NL"),    sub: `+${Number(eventsLast30)} afgelopen 30d`,    icon: Calendar,     top: "bg-blue-500"    },
          { label: "Deelnemers totaal", value: Number(totalAttendees).toLocaleString("nl-NL"), sub: `+${Number(attendeesLast30)} afgelopen 30d`,  icon: Users,        top: "bg-purple-500"  },
          { label: "Check-in rate",     value: `${checkinRate}%`,                              sub: `${Number(checkedIn[0].c).toLocaleString("nl-NL")} ingecheckt`, icon: CheckSquare, top: "bg-emerald-500" },
          { label: "Organisaties",      value: allOrgs.length.toString(),                       sub: `${Number(eventsLast30)} events deze maand`, icon: Building2,    top: "bg-amber-500"   },
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

      <div className="grid md:grid-cols-2 gap-5 mb-6">
        {/* Deelnemers per maand */}
        <div className="bg-white border border-black/8 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-widest mb-5">Deelnemers per maand</p>
          <div className="flex items-end gap-2 h-24">
            {monthlyActivity.map(m => {
              const h = Math.max((m.attendees / maxAttendees) * 100, m.attendees > 0 ? 6 : 0);
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {m.attendees > 0 && (
                    <div className="absolute -top-5 text-[9px] font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {m.attendees}
                    </div>
                  )}
                  <div className="w-full bg-purple-400 rounded-t-sm" style={{ height: `${h}%` }} />
                  <p className="text-[9px] text-[#9E9890]">{m.month}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events per maand */}
        <div className="bg-white border border-black/8 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-widest mb-5">Events aangemaakt per maand</p>
          <div className="flex items-end gap-2 h-24">
            {monthlyActivity.map(m => {
              const h = Math.max((m.events / maxEvents) * 100, m.events > 0 ? 6 : 0);
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {m.events > 0 && (
                    <div className="absolute -top-5 text-[9px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {m.events}
                    </div>
                  )}
                  <div className="w-full bg-blue-400 rounded-t-sm" style={{ height: `${h}%` }} />
                  <p className="text-[9px] text-[#9E9890]">{m.month}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Event status */}
        <div className="bg-white border border-black/8 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-widest mb-4">Event statussen</p>
          <div className="space-y-3">
            {[
              { key: "live",      label: "Live",           color: "bg-green-500"   },
              { key: "published", label: "Gepubliceerd",   color: "bg-blue-500"    },
              { key: "ended",     label: "Afgelopen",      color: "bg-gray-400"    },
              { key: "draft",     label: "Concept",        color: "bg-amber-400"   },
            ].map(({ key, label, color }) => {
              const n = statusMap[key] ?? 0;
              const pct = Number(totalEvents) > 0 ? Math.round((n / Number(totalEvents)) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-[#6B5E54] font-medium">{label}</span>
                    <span className="text-xs font-bold text-[#1C1814]">{n}</span>
                  </div>
                  <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top organisaties */}
        <div className="md:col-span-2 bg-white border border-black/8 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-black/6">
            <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-widest">Meest actieve organisaties</p>
          </div>
          <div className="divide-y divide-black/5">
            {topOrgs.map(({ org, eventCount, sub }, i) => (
              <div key={org!.id} className="flex items-center gap-3 px-5 py-3 hover:bg-black/[0.015] transition-colors">
                <span className="text-[11px] font-bold text-[#9E9890] w-5 shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1C1814] truncate">{org!.name}</p>
                  <p className="text-[10px] text-[#9E9890]">{org!.orgType ?? org!.slug ?? "—"}</p>
                </div>
                {sub && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${{
                    trial: "bg-amber-50 text-amber-700 border-amber-200",
                    starter: "bg-blue-50 text-blue-700 border-blue-200",
                    groei: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    organisatie: "bg-purple-50 text-purple-700 border-purple-200",
                  }[sub.plan] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}>
                    {sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)}
                  </span>
                )}
                <span className="text-sm font-bold text-[#1C1814] shrink-0">{eventCount} events</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
