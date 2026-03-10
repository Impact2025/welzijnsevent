import { db, events, attendees, sessions, surveyResponses, feedback, subscriptions } from "@/db";
import { desc, count, eq, avg } from "drizzle-orm";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { EventCard } from "@/components/events/event-card";
import { Users, Calendar, Star, ArrowRight, Zap, AlertTriangle, Clock } from "lucide-react";
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

  // Real average score from survey responses + feedback
  const [[fbAvg], [srAvg]] = await Promise.all([
    db.select({ avg: avg(feedback.rating) })
      .from(feedback)
      .innerJoin(events, eq(feedback.eventId, events.id))
      .where(eq(events.organizationId, org.id)),
    db.select({ avg: avg(surveyResponses.overallRating) })
      .from(surveyResponses)
      .innerJoin(events, eq(surveyResponses.eventId, events.id))
      .where(eq(events.organizationId, org.id)),
  ]);
  const srVal = srAvg.avg ? parseFloat(srAvg.avg) : null;
  const fbVal = fbAvg.avg ? parseFloat(fbAvg.avg) : null;
  let avgScore: number | null = null;
  if (srVal !== null && fbVal !== null) {
    avgScore = Math.round(((srVal + fbVal) / 2) * 10) / 10;
  } else {
    avgScore = srVal ?? fbVal;
  }

  // Subscription / trial info for banner
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, org.id))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  const isTrial = !sub || sub.plan === "trial";
  const isExpired = sub?.expiresAt ? new Date(sub.expiresAt) < new Date() : false;
  const daysLeft = sub?.expiresAt
    ? Math.max(0, Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / 86400000))
    : null;
  const showTrialBanner = isTrial && !isExpired;
  const showExpiredBanner = isExpired;

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

      {/* Trial / expiry banner */}
      {showExpiredBanner && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-red-700">Abonnement verlopen</p>
            <p className="text-xs text-red-600 mt-0.5">Je abonnement is verlopen. Nieuwe aanmeldingen zijn gepauzeerd.</p>
          </div>
          <Link href="/dashboard/abonnement" className="shrink-0 bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-red-600 transition-colors">
            Verlengen
          </Link>
        </div>
      )}
      {showTrialBanner && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-700">Proefperiode actief</p>
            <p className="text-xs text-amber-600 mt-0.5">
              {daysLeft !== null
                ? `Nog ${daysLeft} dag${daysLeft !== 1 ? "en" : ""} gratis · max 1 event, 50 deelnemers`
                : "Gratis proefperiode · max 1 event, 50 deelnemers"}
            </p>
          </div>
          <Link href="/dashboard/abonnement" className="shrink-0 bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-amber-600 transition-colors">
            Upgraden
          </Link>
        </div>
      )}

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
          trend={undefined}
          icon={<Users size={14} strokeWidth={2.5} />}
        />
        <KpiCard
          label="Gem. Score"
          value={avgScore !== null ? avgScore.toFixed(1) : "—"}
          trend={undefined}
          trendLabel="★"
          icon={<Star size={14} strokeWidth={2.5} />}
        />
        <KpiCard
          label="Sessies"
          value={totalSessions.toLocaleString("nl")}
          trend={undefined}
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
