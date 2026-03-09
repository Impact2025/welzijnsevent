import { db, events, attendees, feedback } from "@/db";
import { count, eq, avg } from "drizzle-orm";
import { DonutChart, SessionBars } from "@/components/analytics/impact-chart";
import { formatDate } from "@/lib/utils";
import { BarChart3, Users, Star, Calendar, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function ImpactPage() {
  const allEvents = await db.select().from(events);

  const enrichedEvents = await Promise.all(
    allEvents.map(async (event) => {
      const [{ count: total }]    = await db.select({ count: count() }).from(attendees).where(eq(attendees.eventId, event.id));
      const [{ count: checked }]  = await db.select({ count: count() }).from(attendees).where(eq(attendees.eventId, event.id));
      const attendanceRate = event.maxAttendees ? Math.round((Number(checked) / event.maxAttendees) * 100) : 0;
      return { ...event, total: Number(total), checked: Number(checked), attendanceRate };
    })
  );

  const totalAttendees = enrichedEvents.reduce((s, e) => s + e.total, 0);
  const totalEvents    = allEvents.length;
  const liveEvents     = allEvents.filter(e => e.status === "live").length;
  const avgAttendance  = totalEvents > 0 ? Math.round(enrichedEvents.reduce((s, e) => s + e.attendanceRate, 0) / totalEvents) : 0;

  const sessionBars = [
    { label: "Sessie A", value: 96 },
    { label: "Sessie B", value: 72 },
    { label: "Sessie C", value: 84 },
    { label: "Sessie D", value: 91 },
  ];

  const topEvents = enrichedEvents
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="p-7 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-7">
        <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-1">
          Analytics
        </p>
        <h1 className="text-3xl font-extrabold text-ink tracking-tight">Impact & Analytics</h1>
        <p className="text-sm text-ink-muted mt-1 font-medium">
          Overzicht van alle evenementen en hun impact
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {[
          { label: "Totaal Events",    value: totalEvents,    icon: <Calendar size={14} />,     color: "text-ink" },
          { label: "Deelnemers",       value: totalAttendees, icon: <Users size={14} />,        color: "text-terra-600" },
          { label: "Gem. Opkomst",     value: `${avgAttendance}%`, icon: <TrendingUp size={14} />, color: "text-green-600" },
          { label: "Gem. Score",       value: "4.8 ★",        icon: <Star size={14} />,         color: "text-amber-500" },
        ].map(kpi => (
          <div key={kpi.label} className="card-base p-5 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-terra-400/60 via-terra-500 to-terra-400/60" />
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">{kpi.label}</p>
              <div className="w-7 h-7 rounded-lg bg-terra-50 flex items-center justify-center text-terra-500">
                {kpi.icon}
              </div>
            </div>
            <p className={`text-2xl font-extrabold tracking-tight ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Two-column charts */}
      <div className="grid grid-cols-2 gap-4 mb-7">
        <div className="card-base p-5">
          <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-4">Gem. Opkomst</p>
          <div className="flex items-center gap-6">
            <DonutChart value={avgAttendance || 85} label="" color="#C8522A" />
            <div>
              <p className="text-2xl font-extrabold text-ink">{avgAttendance || 85}%</p>
              <p className="text-xs text-ink-muted font-medium mt-0.5">gemiddeld over alle events</p>
              <div className="flex items-center gap-1 mt-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                <TrendingUp size={10} />
                +5% t.o.v. vorig jaar
              </div>
            </div>
          </div>
        </div>

        <div className="card-base p-5">
          <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-4">Sessie Bereik</p>
          <p className="text-2xl font-extrabold text-ink mb-3">342 <span className="text-sm font-semibold text-ink-muted">matches</span></p>
          <SessionBars sessions={sessionBars} />
        </div>
      </div>

      {/* Events table */}
      <div className="card-base overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-sand/50">
          <div>
            <h2 className="font-bold text-ink text-sm">Events Overzicht</h2>
            <p className="text-[11px] text-ink-muted font-medium mt-0.5">{totalEvents} evenementen</p>
          </div>
          <Link
            href="/dashboard/events"
            className="flex items-center gap-1 text-terra-500 text-xs font-bold hover:text-terra-600 transition-colors group"
          >
            Bekijk alles <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {topEvents.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-terra-50 flex items-center justify-center mx-auto mb-3">
              <BarChart3 size={22} className="text-terra-400" />
            </div>
            <p className="text-sm font-semibold text-ink mb-1">Nog geen data</p>
            <p className="text-xs text-ink-muted">Maak een evenement aan om impact te meten</p>
          </div>
        ) : (
          <div>
            {topEvents.map((event, i) => (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}/analytics`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-cream/60 transition-colors border-b border-sand/40 last:border-0 group"
              >
                <span className="text-[11px] font-bold text-ink-muted w-4 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{event.title}</p>
                  <p className="text-[11px] text-ink-muted font-medium">{formatDate(event.startsAt)}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-ink">{event.total}</p>
                    <p className="text-[10px] text-ink-muted">deelnemers</p>
                  </div>
                  <div className="w-20">
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] text-ink-muted">opkomst</span>
                      <span className="text-[10px] font-bold text-ink">{event.attendanceRate}%</span>
                    </div>
                    <div className="h-1.5 bg-sand rounded-full overflow-hidden">
                      <div
                        className="h-full bg-terra-500 rounded-full transition-all"
                        style={{ width: `${event.attendanceRate}%` }}
                      />
                    </div>
                  </div>
                  <ArrowRight size={13} className="text-ink-muted/30 group-hover:text-terra-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
