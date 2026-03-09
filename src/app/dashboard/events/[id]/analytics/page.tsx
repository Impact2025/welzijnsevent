import { db, events, attendees, sessions, feedback, networkMatches, sessionRegistrations } from "@/db";
import { eq, count, and, avg } from "drizzle-orm";
import { notFound } from "next/navigation";
import { DonutChart, SessionBars } from "@/components/analytics/impact-chart";
import { SubsidieExportButton } from "@/components/analytics/subsidie-export-button";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Network, Star, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function AnalyticsPage({ params }: { params: { id: string } }) {
  const [event] = await db.select().from(events).where(eq(events.id, params.id));
  if (!event) notFound();

  // Aanwezigheid
  const allAttendees = await db
    .select()
    .from(attendees)
    .where(eq(attendees.eventId, params.id));

  const totalAttendees = allAttendees.length;
  const checkedIn = allAttendees.filter((a) => a.status === "ingecheckt").length;

  // Rolverdeling
  const roleCounts: Record<string, number> = {};
  for (const a of allAttendees) {
    const role = a.role?.trim() || "Overig";
    roleCounts[role] = (roleCounts[role] ?? 0) + 1;
  }
  const topRoles = Object.entries(roleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([role, n]) => ({
      role,
      n,
      pct: totalAttendees > 0 ? Math.round((n / totalAttendees) * 100) : 0,
    }));

  // Tevredenheid
  const [{ avg: avgRatingRaw }] = await db
    .select({ avg: avg(feedback.rating) })
    .from(feedback)
    .where(eq(feedback.eventId, params.id));
  const avgRating = avgRatingRaw ? parseFloat(avgRatingRaw).toFixed(1) : null;

  const [{ count: feedbackCount }] = await db
    .select({ count: count() })
    .from(feedback)
    .where(eq(feedback.eventId, params.id));

  // Netwerk matches
  const [{ count: matchCount }] = await db
    .select({ count: count() })
    .from(networkMatches)
    .where(eq(networkMatches.eventId, params.id));

  // Sessies
  const eventSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.eventId, params.id));

  const sessionFills = await Promise.all(
    eventSessions.slice(0, 4).map(async (s) => {
      const [{ count: regCount }] = await db
        .select({ count: count() })
        .from(sessionRegistrations)
        .where(eq(sessionRegistrations.sessionId, s.id));
      const value =
        s.capacity && Number(regCount) > 0
          ? Math.min(100, Math.round((Number(regCount) / s.capacity) * 100))
          : Number(regCount);
      return { label: s.title.slice(0, 18), value };
    })
  );

  const topSessionsData = await Promise.all(
    eventSessions.slice(0, 5).map(async (s) => {
      const [{ count: regCount }] = await db
        .select({ count: count() })
        .from(sessionRegistrations)
        .where(eq(sessionRegistrations.sessionId, s.id));
      const [{ avg: sessionAvgRaw }] = await db
        .select({ avg: avg(feedback.rating) })
        .from(feedback)
        .where(eq(feedback.sessionId, s.id));
      return {
        name: s.title,
        fill:
          s.capacity && Number(regCount) > 0
            ? Math.min(100, Math.round((Number(regCount) / s.capacity) * 100))
            : null,
        rating: sessionAvgRaw ? parseFloat(sessionAvgRaw).toFixed(1) : null,
        regCount: Number(regCount),
      };
    })
  );
  topSessionsData.sort((a, b) => b.regCount - a.regCount);
  const topSessions = topSessionsData.slice(0, 3);

  const attendanceRate =
    totalAttendees > 0 ? Math.round((checkedIn / totalAttendees) * 100) : 0;
  const ratingStars = avgRating ? Math.round(parseFloat(avgRating)) : 0;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-terra-500 text-white px-4 pt-10 pb-5">
        <div className="flex items-center justify-between mb-3">
          <Link href={`/dashboard/events/${params.id}`} className="text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <SubsidieExportButton eventId={params.id} />
          </div>
        </div>
        <h1 className="text-lg font-bold">Impact & Statistieken</h1>
        <p className="text-white/70 text-xs">
          {event.title} · {formatDate(event.startsAt)}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-sand px-4">
        <div className="flex gap-4 overflow-x-auto">
          {[
            { label: "Programma", href: `/dashboard/events/${params.id}` },
            { label: "Deelnemers", href: `/dashboard/events/${params.id}/deelnemers` },
            { label: "Netwerk", href: `/dashboard/events/${params.id}/netwerk` },
            { label: "Statistieken", href: `/dashboard/events/${params.id}/analytics`, active: true },
          ].map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                tab.active
                  ? "text-terra-500 border-terra-500"
                  : "text-ink-muted border-transparent hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* KPI row 1 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card-base p-4 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2">
              <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">Opkomst</p>
              <span className="text-xs font-bold text-ink-muted">
                {checkedIn}/{totalAttendees}
              </span>
            </div>
            <DonutChart value={attendanceRate} label="" color="#C8522A" />
            <p className="text-xs text-ink-muted mt-2 text-center">
              {checkedIn} van de {event.maxAttendees ?? totalAttendees} gasten
            </p>
          </div>

          <div className="card-base p-4 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2">
              <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                Tevredenheid
              </p>
              <Star size={12} className="text-ink-muted" />
            </div>
            {avgRating ? (
              <>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <p className="text-4xl font-bold text-ink">{avgRating}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className={`text-sm ${i <= ratingStars ? "text-terra-500" : "text-sand"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-ink-muted mt-2 text-center">
                  {feedbackCount} {Number(feedbackCount) === 1 ? "enquête" : "enquêtes"}
                </p>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <p className="text-sm text-ink-muted text-center">Nog geen feedback</p>
              </div>
            )}
          </div>
        </div>

        {/* Nieuwe verbindingen — prominent als subsidie-argument */}
        <div className="card-base p-4 bg-green-50 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Network size={14} className="text-green-600" />
                <p className="text-xs font-bold text-green-700 uppercase tracking-wider">
                  Nieuwe verbindingen
                </p>
              </div>
              <p className="text-3xl font-bold text-green-800">{matchCount}</p>
              <p className="text-xs text-green-600 mt-0.5">
                professionele contacten gelegd via AI-matching
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">
                IZA KPI
              </div>
              <div className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                Netwerkontwikkeling
              </div>
            </div>
          </div>
        </div>

        {/* Network chart */}
        {sessionFills.length > 0 && sessionFills.some((s) => s.value > 0) && (
          <div className="card-base p-4">
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <TrendingUp size={13} />
              Sessie bezettingsgraad
            </p>
            <SessionBars sessions={sessionFills} />
          </div>
        )}

        {/* Doelgroepverdeling */}
        {topRoles.length > 0 && (
          <div className="card-base overflow-hidden">
            <div className="px-4 py-3 border-b border-sand flex items-center gap-1.5">
              <Users size={13} className="text-ink-muted" />
              <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                Doelgroepverdeling (WMO)
              </p>
            </div>
            <div className="px-4 py-3 space-y-3">
              {topRoles.map((r) => (
                <div key={r.role}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-ink truncate flex-1 mr-2">
                      {r.role}
                    </span>
                    <span className="text-xs text-ink-muted shrink-0">
                      {r.n} · {r.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-sand rounded-full overflow-hidden">
                    <div
                      className="h-full bg-terra-400 rounded-full transition-all"
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top sessions */}
        <div className="card-base overflow-hidden">
          <div className="px-4 py-3 border-b border-sand">
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              {topSessions.some((s) => s.regCount > 0) ? "Populairste sessies" : "Sessies"}
            </p>
          </div>
          <div>
            {topSessions.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-ink-muted">Geen sessies gevonden voor dit event</p>
              </div>
            ) : (
              topSessions.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 border-b border-sand last:border-0"
                >
                  <div className="w-8 h-8 rounded-xl bg-terra-100 flex items-center justify-center shrink-0">
                    <span className="text-sm">🎯</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{s.name}</p>
                    {s.fill !== null ? (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-sand rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${s.fill}%` }}
                          />
                        </div>
                        <span className="text-xs text-ink-muted shrink-0">{s.fill}% vol</span>
                      </div>
                    ) : (
                      <p className="text-xs text-ink-muted mt-0.5">{s.regCount} registraties</p>
                    )}
                  </div>
                  {s.rating && (
                    <span className="text-xs font-bold text-terra-600 shrink-0">
                      {s.rating} ★
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-sand flex justify-around pt-2 pb-safe-nav">
        {[
          { label: "Home", icon: "🏠", href: "/dashboard" },
          { label: "Events", icon: "📅", href: "/dashboard/events" },
          { label: "Analytics", icon: "📊", href: "#", active: true },
          { label: "Opties", icon: "⚙️", href: "/dashboard/instellingen" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 text-xs font-medium px-3 py-1 ${
              item.active ? "text-terra-500" : "text-ink-muted"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
