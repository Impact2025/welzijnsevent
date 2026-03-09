import { db, events, attendees, sessions, feedback } from "@/db";
import { eq, count, avg } from "drizzle-orm";
import { notFound } from "next/navigation";
import { DonutChart, SessionBars } from "@/components/analytics/impact-chart";
import { formatDate } from "@/lib/utils";
import { FileDown, ArrowLeft, Network } from "lucide-react";
import Link from "next/link";

export default async function AnalyticsPage({ params }: { params: { id: string } }) {
  const [event] = await db.select().from(events).where(eq(events.id, params.id));
  if (!event) notFound();

  const [{ count: totalAttendees }] = await db.select({ count: count() }).from(attendees).where(eq(attendees.eventId, params.id));
  const [{ count: checkedIn }]      = await db.select({ count: count() }).from(attendees).where(eq(attendees.eventId, params.id));
  const eventSessions                = await db.select().from(sessions).where(eq(sessions.eventId, params.id));

  const attendanceRate = event.maxAttendees
    ? Math.round((Number(checkedIn) / event.maxAttendees) * 100)
    : 85;

  const sessionBars = eventSessions.slice(0, 4).map((s, i) => ({
    label: `Sessie ${String.fromCharCode(65 + i)}`,
    value: Math.round(60 + Math.random() * 40),
  }));

  const topSessions = [
    { name: "Community Building 101", fill: 96, rating: 4.9 },
    { name: "Vrijwilligersswerving",   fill: 78, rating: 4.7 },
    { name: "Dialoog in de Wijk",      fill: 82, rating: 4.5 },
  ];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-terra-500 text-white px-4 pt-10 pb-5">
        <div className="flex items-center justify-between mb-3">
          <Link href={`/dashboard/events/${params.id}`} className="text-white/70 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <button className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors">
            <FileDown size={13} />
            PDF
          </button>
        </div>
        <h1 className="text-lg font-bold">Overzicht Impact</h1>
        <p className="text-white/70 text-xs">{event.title} · {formatDate(event.startsAt)}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card-base p-4 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2">
              <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">Opkomst</p>
              <span className="text-xs font-bold text-green-600">+5%</span>
            </div>
            <DonutChart value={attendanceRate} label="" color="#C8522A" />
            <p className="text-xs text-ink-muted mt-2 text-center">
              {checkedIn} van de {event.maxAttendees ?? totalAttendees} gasten
            </p>
          </div>

          <div className="card-base p-4 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2">
              <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">Tevredenheid</p>
              <span className="text-xs font-bold text-red-500">-0.2</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-4xl font-bold text-ink">4.8</p>
              <div className="flex gap-0.5 mt-1">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className={`text-sm ${i <= 4 ? "text-terra-500" : "text-sand"}`}>★</span>
                ))}
              </div>
            </div>
            <p className="text-xs text-ink-muted mt-2 text-center">Gebaseerd op 98 enquêtes</p>
          </div>
        </div>

        {/* Network matches */}
        <div className="card-base p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
              <Network size={13} />
              Netwerk Matches
            </p>
          </div>
          <p className="text-4xl font-bold text-ink mb-3">342</p>
          <SessionBars sessions={sessionBars} />
        </div>

        {/* Top sessions */}
        <div className="card-base overflow-hidden">
          <div className="px-4 py-3 border-b border-sand">
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">Populairste Sessies</p>
          </div>
          <div>
            {topSessions.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-sand last:border-0">
                <div className="w-8 h-8 rounded-xl bg-terra-100 flex items-center justify-center shrink-0">
                  <span className="text-sm">🎯</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{s.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-sand rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${s.fill}%` }} />
                    </div>
                    <span className="text-xs text-ink-muted shrink-0">{s.fill}% vol</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-terra-600 shrink-0">{s.rating} ★</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-sand flex justify-around py-2">
        {[
          { label: "Home",      icon: "🏠", href: "/dashboard" },
          { label: "Events",    icon: "📅", href: "/dashboard/events" },
          { label: "Analytics", icon: "📊", href: "#", active: true },
          { label: "Opties",    icon: "⚙️", href: "/dashboard/instellingen" },
        ].map(item => (
          <Link key={item.label} href={item.href}
            className={`flex flex-col items-center gap-0.5 text-xs font-medium px-3 py-1 ${item.active ? "text-terra-500" : "text-ink-muted"}`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
