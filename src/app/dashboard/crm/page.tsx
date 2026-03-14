import { db, attendees, events, contactProfiles, crmActivities } from "@/db";
import { eq, inArray, sql, desc, and, gte } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, TrendingUp, Star, Activity, ArrowRight, Calendar, Zap, ChevronRight } from "lucide-react";
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
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-1">CRM</p>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Contactbeheer</h1>
        </div>
        <div className="card-base p-10 text-center">
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

  const profiles = await db.select().from(contactProfiles).where(eq(contactProfiles.organizationId, org.id));
  const profileMap = Object.fromEntries(profiles.map(p => [p.email.toLowerCase(), p]));

  const recentActivities = await db.select().from(crmActivities)
    .where(eq(crmActivities.organizationId, org.id))
    .orderBy(desc(crmActivities.createdAt))
    .limit(6);

  const totalContacts = contactStats.length;

  const monthAgo = new Date();
  monthAgo.setDate(1);
  monthAgo.setHours(0, 0, 0, 0);
  const newThisMonth = contactStats.filter(c => new Date(c.lastSeen) >= monthAgo).length;
  const highEngagement = contactStats.filter(c => (Number(c.eventsCount) * 10 + Number(c.checkins) * 5) >= 25).length;
  const vipCount = profiles.filter(p => p.lifecycleStage === "vip").length;

  const topContacts = contactStats
    .map(c => ({
      ...c,
      engagementScore: Number(c.eventsCount) * 10 + Number(c.checkins) * 5,
      lifecycleStage: profileMap[c.email.toLowerCase()]?.lifecycleStage ?? "contact",
    }))
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 5);

  const lifecycleCounts: Record<string, number> = { contact: 0, betrokken: 0, actief: 0, vip: 0, inactief: 0 };
  contactStats.forEach(c => {
    const stage = profileMap[c.email.toLowerCase()]?.lifecycleStage ?? "contact";
    lifecycleCounts[stage] = (lifecycleCounts[stage] ?? 0) + 1;
  });

  const lifecycleConfig = {
    contact:   { label: "Contact",   color: "bg-gray-300"  },
    betrokken: { label: "Betrokken", color: "bg-blue-400"  },
    actief:    { label: "Actief",    color: "bg-green-500" },
    vip:       { label: "VIP",       color: "bg-amber-400" },
    inactief:  { label: "Inactief",  color: "bg-gray-400"  },
  };

  return (
    <div className="px-4 py-5 md:px-7 md:py-7 max-w-5xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="mb-5 md:mb-7">
        <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-1">CRM</p>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">Contactbeheer</h1>
          <Link
            href="/dashboard/crm/contacten"
            className="shrink-0 flex items-center gap-1.5 bg-terra-500 hover:bg-terra-600 text-white text-xs md:text-sm font-semibold px-3 py-2 md:px-4 md:py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Users size={13} />
            <span className="hidden sm:inline">Alle contacten</span>
            <span className="sm:hidden">Contacten</span>
          </Link>
        </div>
        <p className="text-sm text-ink-muted mt-1">Overzicht van al je contacten over alle evenementen</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 md:mb-7">
        {[
          { label: "Contacten",     value: totalContacts,  icon: Users,      color: "text-ink"        },
          { label: "Nieuw",         value: newThisMonth,   icon: TrendingUp,  color: "text-blue-600"   },
          { label: "Betrokken",     value: highEngagement, icon: Zap,         color: "text-green-600"  },
          { label: "VIP",           value: vipCount,       icon: Star,        color: "text-amber-500"  },
        ].map(stat => (
          <div key={stat.label} className="card-base p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <stat.icon size={13} className={stat.color} />
              <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest leading-tight">{stat.label}</p>
            </div>
            <p className={`text-2xl md:text-3xl font-extrabold tracking-tight ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Lifecycle + Top contacts */}
      <div className="grid md:grid-cols-3 gap-4 mb-5 md:mb-7">

        {/* Lifecycle */}
        <div className="card-base p-4 md:p-5">
          <p className="text-[10px] font-bold text-ink uppercase tracking-widest mb-4">Lifecycle verdeling</p>
          <div className="space-y-3">
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
                    <div className={`h-full ${cfg.color} rounded-full transition-all`} style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top contacts */}
        <div className="card-base p-4 md:p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-ink uppercase tracking-widest">Top contacten</p>
            <Link href="/dashboard/crm/contacten?sort=score" className="text-[11px] text-terra-500 font-semibold hover:underline flex items-center gap-0.5">
              Alle <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-0.5">
            {topContacts.map((c, i) => (
              <Link
                key={c.email}
                href={`/dashboard/crm/contacten/${encodeURIComponent(c.email)}`}
                className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-sand/60 transition-colors group"
              >
                <span className="text-[10px] font-bold text-ink-muted w-4 shrink-0 text-center">#{i + 1}</span>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-[11px] font-bold", avatarColor(c.name ?? "?"))}>
                  {getInitials(c.name ?? "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate leading-tight">{c.name}</p>
                  <p className="text-[11px] text-ink-muted truncate">{c.organization ?? c.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <LifecycleBadge stage={c.lifecycleStage} size="sm" />
                  <div className="text-right min-w-[32px]">
                    <p className="text-sm font-bold text-terra-500 leading-tight">{c.engagementScore}</p>
                    <p className="text-[10px] text-ink-muted">{Number(c.eventsCount)}×</p>
                  </div>
                  <ChevronRight size={13} className="text-ink-muted/40 group-hover:text-ink-muted transition-colors" />
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
      <div className="card-base p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={14} className="text-terra-500" />
          <p className="text-[10px] font-bold text-ink uppercase tracking-widest">Recente activiteit</p>
        </div>
        {recentActivities.length === 0 ? (
          <p className="text-sm text-ink-muted text-center py-6">
            Activiteiten verschijnen hier zodra je met contacten werkt
          </p>
        ) : (
          <div>
            {recentActivities.map(act => (
              <Link
                key={act.id}
                href={`/dashboard/crm/contacten/${encodeURIComponent(act.contactEmail)}`}
                className="flex items-center gap-3 py-2.5 border-b border-sand/50 last:border-0 hover:bg-sand/30 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-terra-50 flex items-center justify-center shrink-0">
                  <Activity size={11} className="text-terra-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink font-medium truncate leading-tight">{act.description}</p>
                  <p className="text-[11px] text-ink-muted truncate">{act.contactEmail}</p>
                </div>
                <p className="text-[11px] text-ink-muted shrink-0 ml-2">{formatRelative(act.createdAt!)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
