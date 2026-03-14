import { db, attendees, events, contactProfiles, crmActivities } from "@/db";
import { eq, inArray, sql, desc, and, gte } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, TrendingUp, Star, Activity, ArrowRight, Calendar, Zap } from "lucide-react";
import { formatRelative, formatDate, getInitials, avatarColor, cn } from "@/lib/utils";
import { LifecycleBadge } from "@/components/crm/LifecycleBadge";

export default async function CrmPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/onboarding");

  const orgEvents = await db.select({ id: events.id, title: events.title, startsAt: events.startsAt })
    .from(events).where(eq(events.organizationId, org.id));
  const eventIds = orgEvents.map(e => e.id);

  if (eventIds.length === 0) {
    return (
      <div className="p-7 max-w-4xl mx-auto">
        <div className="mb-7">
          <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-1">CRM</p>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">Contactbeheer</h1>
        </div>
        <div className="card-base p-14 text-center">
          <Users size={40} className="mx-auto text-ink-muted/40 mb-4" />
          <p className="font-semibold text-ink mb-1">Nog geen contacten</p>
          <p className="text-sm text-ink-muted mb-5">Maak je eerste evenement aan om contacten te verzamelen.</p>
          <Link href="/dashboard/events/new" className="btn-primary inline-flex">Evenement aanmaken</Link>
        </div>
      </div>
    );
  }

  // Aggregate contacts
  const contactStats = await db
    .select({
      email: attendees.email,
      name: sql<string>`max(${attendees.name})`,
      organization: sql<string>`max(${attendees.organization})`,
      eventsCount: sql<number>`count(distinct ${attendees.eventId})`,
      checkins: sql<number>`sum(case when ${attendees.status} = 'ingecheckt' then 1 else 0 end)`,
      lastSeen: sql<string>`max(${attendees.registeredAt})`,
    })
    .from(attendees)
    .where(inArray(attendees.eventId, eventIds))
    .groupBy(attendees.email);

  // CRM profiles
  const profiles = await db.select().from(contactProfiles).where(eq(contactProfiles.organizationId, org.id));
  const profileMap = Object.fromEntries(profiles.map(p => [p.email.toLowerCase(), p]));

  // Recent activities
  const recentActivities = await db.select().from(crmActivities)
    .where(eq(crmActivities.organizationId, org.id))
    .orderBy(desc(crmActivities.createdAt))
    .limit(8);

  const totalContacts = contactStats.length;

  // New this month
  const monthAgo = new Date();
  monthAgo.setDate(1);
  monthAgo.setHours(0, 0, 0, 0);
  const newThisMonth = contactStats.filter(c => new Date(c.lastSeen) >= monthAgo).length;

  // High engagement (score > 25 = 2+ events attended or 1 event + check-in + session)
  const highEngagement = contactStats.filter(c => (Number(c.eventsCount) * 10 + Number(c.checkins) * 5) >= 25).length;

  // VIP profiles
  const vipCount = profiles.filter(p => p.lifecycleStage === "vip").length;

  // Top contacts by score
  const topContacts = contactStats
    .map(c => ({
      ...c,
      engagementScore: Number(c.eventsCount) * 10 + Number(c.checkins) * 5,
      lifecycleStage: profileMap[c.email.toLowerCase()]?.lifecycleStage ?? "contact",
      tags: profileMap[c.email.toLowerCase()]?.tags ?? [],
    }))
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 5);

  // Lifecycle distribution
  const lifecycleCounts: Record<string, number> = { contact: 0, betrokken: 0, actief: 0, vip: 0, inactief: 0 };
  contactStats.forEach(c => {
    const stage = profileMap[c.email.toLowerCase()]?.lifecycleStage ?? "contact";
    lifecycleCounts[stage] = (lifecycleCounts[stage] ?? 0) + 1;
  });

  const lifecycleConfig = {
    contact:   { label: "Contact",   color: "bg-gray-200"   },
    betrokken: { label: "Betrokken", color: "bg-blue-400"   },
    actief:    { label: "Actief",    color: "bg-green-500"  },
    vip:       { label: "VIP",       color: "bg-amber-400"  },
    inactief:  { label: "Inactief",  color: "bg-gray-400"   },
  };

  return (
    <div className="p-7 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-1">CRM</p>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">Contactbeheer</h1>
          <p className="text-sm text-ink-muted mt-1 font-medium">Overzicht van al je contacten over alle evenementen</p>
        </div>
        <Link
          href="/dashboard/crm/contacten"
          className="flex items-center gap-2 bg-terra-500 hover:bg-terra-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Users size={15} />
          Alle contacten
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {[
          { label: "Totale contacten", value: totalContacts, icon: Users, color: "text-ink" },
          { label: "Nieuw deze maand", value: newThisMonth, icon: TrendingUp, color: "text-blue-600" },
          { label: "Hoog betrokken", value: highEngagement, icon: Zap, color: "text-green-600" },
          { label: "VIP contacten", value: vipCount, icon: Star, color: "text-amber-500" },
        ].map(stat => (
          <div key={stat.label} className="card-base p-5">
            <div className="flex items-center gap-2 mb-3">
              <stat.icon size={15} className={stat.color} />
              <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">{stat.label}</p>
            </div>
            <p className={`text-3xl font-extrabold tracking-tight ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-7">
        {/* Lifecycle Distribution */}
        <div className="card-base p-5 md:col-span-1">
          <p className="text-xs font-bold text-ink mb-4 uppercase tracking-wide">Lifecycle verdeling</p>
          <div className="space-y-2.5">
            {Object.entries(lifecycleConfig).map(([stage, cfg]) => {
              const count = lifecycleCounts[stage] ?? 0;
              const pct = totalContacts > 0 ? Math.round((count / totalContacts) * 100) : 0;
              return (
                <div key={stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-ink">{cfg.label}</span>
                    <span className="text-xs font-bold text-ink-muted">{count}</span>
                  </div>
                  <div className="h-1.5 bg-sand rounded-full overflow-hidden">
                    <div className={`h-full ${cfg.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top contacts */}
        <div className="card-base p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-ink uppercase tracking-wide">Top contacten</p>
            <Link href="/dashboard/crm/contacten?sort=score" className="text-[11px] text-terra-500 font-semibold hover:underline flex items-center gap-1">
              Alle <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-1">
            {topContacts.map((c, i) => (
              <Link
                key={c.email}
                href={`/dashboard/crm/contacten/${encodeURIComponent(c.email)}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sand/60 transition-colors group"
              >
                <div className="text-[11px] font-bold text-ink-muted w-4 shrink-0">#{i + 1}</div>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-[11px] font-bold", avatarColor(c.name ?? "?"))}>
                  {getInitials(c.name ?? "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{c.name}</p>
                  <p className="text-[11px] text-ink-muted truncate">{c.organization ?? c.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <LifecycleBadge stage={c.lifecycleStage} size="sm" />
                  <div className="text-right">
                    <p className="text-sm font-bold text-terra-500">{c.engagementScore}</p>
                    <p className="text-[10px] text-ink-muted">{Number(c.eventsCount)} events</p>
                  </div>
                </div>
              </Link>
            ))}
            {topContacts.length === 0 && (
              <p className="text-sm text-ink-muted text-center py-8">Nog geen contacten</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-base p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-terra-500" />
            <p className="text-xs font-bold text-ink uppercase tracking-wide">Recente activiteit</p>
          </div>
        </div>
        {recentActivities.length === 0 ? (
          <p className="text-sm text-ink-muted text-center py-6">
            Activiteiten verschijnen hier zodra je met contacten werkt
          </p>
        ) : (
          <div className="space-y-0">
            {recentActivities.map(act => (
              <Link
                key={act.id}
                href={`/dashboard/crm/contacten/${encodeURIComponent(act.contactEmail)}`}
                className="flex items-start gap-3 py-3 border-b border-sand/50 last:border-0 hover:bg-sand/30 px-2 rounded-lg transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-terra-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Activity size={12} className="text-terra-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink font-medium truncate">{act.description}</p>
                  <p className="text-[11px] text-ink-muted">{act.contactEmail}</p>
                </div>
                <p className="text-[11px] text-ink-muted shrink-0">{formatRelative(act.createdAt!)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
