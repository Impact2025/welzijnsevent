import { notFound } from "next/navigation";
import Link from "next/link";
import { db, events, sessions } from "@/db";
import { eq, asc } from "drizzle-orm";
import { SessionCard } from "@/components/events/session-card";
import { formatDate, formatTime } from "@/lib/utils";
import { ArrowLeft, MapPin, Calendar, MoreHorizontal, Filter } from "lucide-react";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const [event] = await db.select().from(events).where(eq(events.id, params.id));
  if (!event) notFound();

  const eventSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.eventId, params.id))
    .orderBy(asc(sessions.sortOrder));

  const now = new Date();

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header image / cover */}
      <div className="relative bg-terra-500 pt-10 pb-6 px-4 text-white">
        {/* Back button */}
        <Link href="/dashboard/events" className="flex items-center gap-1 text-white/80 text-sm mb-4 hover:text-white">
          <ArrowLeft size={16} />
          Terug
        </Link>

        {/* Live badge */}
        {event.status === "live" && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Live nu</span>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold mb-1">{event.title}</h1>
            <div className="flex items-center gap-1 text-white/80 text-xs mb-0.5">
              <Calendar size={12} />
              {formatDate(event.startsAt)}, {formatTime(event.startsAt)}–{formatTime(event.endsAt)}
            </div>
            {event.location && (
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <MapPin size={12} />
                {event.location}
              </div>
            )}
          </div>
          <button className="text-white/70 hover:text-white">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-sand px-4">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {[
            { label: "Programma",    href: `/dashboard/events/${params.id}` },
            { label: "Deelnemers",   href: `/dashboard/events/${params.id}/deelnemers` },
            { label: "Netwerk",      href: `/dashboard/events/${params.id}/netwerk` },
            { label: "Statistieken", href: `/dashboard/events/${params.id}/analytics` },
          ].map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className="py-3 text-sm font-semibold text-terra-500 border-b-2 border-terra-500 whitespace-nowrap first:border-b-2"
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Programme */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-ink">Dagschema</h2>
          <button className="flex items-center gap-1 text-xs text-ink-muted border border-sand rounded-lg px-2.5 py-1.5">
            <Filter size={12} />
            Filter
          </button>
        </div>

        <div className="pb-24">
          {eventSessions.map((session, i) => {
            const isPast = new Date(session.endsAt) < now;
            return (
              <SessionCard key={session.id} session={session} isPast={isPast} />
            );
          })}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-sand flex justify-around py-2 max-w-md mx-auto">
        {[
          { label: "Home",       icon: "🏠", href: "/dashboard" },
          { label: "Events",     icon: "📅", href: "/dashboard/events",                          active: true },
          { label: "Contact",    icon: "💬", href: "#" },
          { label: "Instellingen",icon: "⚙️", href: "/dashboard/instellingen" },
        ].map(item => (
          <Link key={item.label} href={item.href}
            className={`flex flex-col items-center gap-0.5 text-xs font-medium px-3 py-1 rounded-lg
              ${item.active ? "text-terra-500" : "text-ink-muted"}`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
