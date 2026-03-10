import { db, events, attendees, sessions } from "@/db";
import { desc, count, eq } from "drizzle-orm";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { EventCard } from "@/components/events/event-card";
import { Users, Calendar, Star, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { getCurrentOrg } from "@/lib/auth";

export default async function DashboardPage() {
  const org = await getCurrentOrg();
  if (!org) return null;

  const allEvents = await db.select().from(events)
    .where(eq(events.organizationId, org.id))
    .orderBy(desc(events.startsAt)).limit(5);
  const [{ count: totalAttendees }] = await db.select({ count: count() }).from(attendees)
    .innerJoin(events, eq(attendees.eventId, events.id))
    .where(eq(events.organizationId, org.id));
  const [{ count: totalSessions }] = await db.select({ count: count() }).from(sessions)
    .innerJoin(events, eq(sessions.eventId, events.id))
    .where(eq(events.organizationId, org.id));

  const enrichedEvents = await Promise.all(
    allEvents.map(async (event) => {
      const [{ count: attendeeCount }] = await db
        .select({ count: count() })
        .from(attendees)
        .where(eq(attendees.eventId, event.id));
      return { ...event, attendeeCount };
    })
  );

  const liveEvent = enrichedEvents.find(e => e.status === "live");

  return (
    <div className="px-4 py-5 sm:p-7 max-w-3xl mx-auto animate-fade-in">

      {/* Page header */}
      <div className="mb-5 sm:mb-8">
        <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-1">
          Dashboard
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Welkom terug
        </h1>
        <p className="text-sm text-ink-muted mt-1 font-medium">
          {org.name} · Overzicht van je evenementen
        </p>
      </div>

      {/* Live banner */}
      {liveEvent && (
        <div className="mb-5 sm:mb-7 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-terra-600 via-terra-500 to-terra-400 p-4 sm:p-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Live Nu</span>
                  </div>
                </div>
                <p className="font-bold text-base sm:text-lg leading-snug truncate">{liveEvent.title}</p>
                {liveEvent.location && (
                  <p className="text-white/70 text-xs mt-0.5 font-medium truncate">{liveEvent.location}</p>
                )}
              </div>
              <Link
                href={`/dashboard/events/${liveEvent.id}/live`}
                className="flex items-center gap-1.5 bg-white text-terra-600 font-bold text-sm px-4 py-3 rounded-xl hover:bg-terra-50 transition-colors shadow-lg shrink-0"
              >
                <Zap size={13} className="fill-terra-500" />
                Open
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-5 sm:mb-7">
        <KpiCard
          label="Registraties"
          value={totalAttendees.toLocaleString("nl")}
          trend={12}
          icon={<Users size={14} strokeWidth={2.5} />}
        />
        <KpiCard
          label="Gem. Score"
          value="4.8"
          trend={0.2}
          trendLabel="★"
          icon={<Star size={14} strokeWidth={2.5} />}
        />
        <KpiCard
          label="Sessies"
          value={totalSessions.toLocaleString("nl")}
          trend={-5}
          icon={<Calendar size={14} strokeWidth={2.5} />}
        />
      </div>

      {/* Events list */}
      <div className="card-base overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-sand/50">
          <div>
            <h2 className="font-bold text-ink text-sm">Aankomende Evenementen</h2>
            <p className="text-[11px] text-ink-muted font-medium mt-0.5">
              {enrichedEvents.length} evenementen
            </p>
          </div>
          <Link
            href="/dashboard/events"
            className="flex items-center gap-1 text-terra-500 text-xs font-bold hover:text-terra-600 transition-colors group"
          >
            Bekijk alles
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {enrichedEvents.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-terra-50 flex items-center justify-center mx-auto mb-3">
              <Calendar size={22} className="text-terra-400" />
            </div>
            <p className="text-sm font-semibold text-ink mb-1">Nog geen evenementen</p>
            <p className="text-xs text-ink-muted mb-4">Maak je eerste evenement aan</p>
            <Link
              href="/dashboard/events/new"
              className="inline-flex items-center gap-1.5 bg-terra-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-terra-600 transition-colors"
            >
              <span>+</span> Nieuw evenement
            </Link>
          </div>
        ) : (
          <div>
            {enrichedEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
