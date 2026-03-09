import { db, events, networkMatches, attendees } from "@/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ArrowLeft, Network, Users } from "lucide-react";
import Link from "next/link";

export default async function NetwerkPage({ params }: { params: { id: string } }) {
  const [event] = await db.select().from(events).where(eq(events.id, params.id));
  if (!event) notFound();

  const matches = await db
    .select()
    .from(networkMatches)
    .where(eq(networkMatches.eventId, params.id))
    .limit(50);

  const enrichedMatches = await Promise.all(
    matches.map(async (match) => {
      const [attendeeA] = match.attendeeAId
        ? await db.select().from(attendees).where(eq(attendees.id, match.attendeeAId))
        : [];
      const [attendeeB] = match.attendeeBId
        ? await db.select().from(attendees).where(eq(attendees.id, match.attendeeBId))
        : [];
      return { match, attendeeA, attendeeB };
    })
  );

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-terra-500 text-white px-4 pt-10 pb-5">
        <Link href={`/dashboard/events/${params.id}`} className="text-white/70 text-sm mb-3 inline-block">
          ← {event.title}
        </Link>
        <div className="flex items-center gap-2">
          <Network size={20} />
          <h1 className="text-lg font-bold">Netwerk Matches</h1>
        </div>
        <p className="text-white/70 text-xs mt-1">{enrichedMatches.length} matches gegenereerd</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-sand px-4">
        <div className="flex gap-4 overflow-x-auto">
          {[
            { label: "Programma",    href: `/dashboard/events/${params.id}` },
            { label: "Deelnemers",   href: `/dashboard/events/${params.id}/deelnemers` },
            { label: "Netwerk",      href: `/dashboard/events/${params.id}/netwerk`, active: true },
            { label: "Statistieken", href: `/dashboard/events/${params.id}/analytics` },
          ].map(tab => (
            <Link key={tab.href} href={tab.href}
              className={`py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                tab.active ? "text-terra-500 border-terra-500" : "text-ink-muted border-transparent hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {enrichedMatches.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-terra-50 flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-terra-400" />
            </div>
            <h3 className="font-bold text-ink mb-2">Nog geen matches</h3>
            <p className="text-ink-muted text-sm max-w-xs mx-auto">
              Netwerk matches worden automatisch gegenereerd op basis van de interesses en organisaties van deelnemers.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {enrichedMatches.map(({ match, attendeeA, attendeeB }) => (
              <div key={match.id} className="card-base p-4">
                <div className="flex items-center gap-3 mb-3">
                  {/* Attendee A */}
                  <div className="flex-1 text-center">
                    <div className="w-10 h-10 rounded-full bg-terra-200 flex items-center justify-center mx-auto mb-1">
                      <span className="text-xs font-bold text-terra-700">
                        {attendeeA?.name?.split(" ").map(n => n[0]).slice(0, 2).join("") ?? "?"}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-ink truncate">{attendeeA?.name ?? "Onbekend"}</p>
                    <p className="text-[10px] text-ink-muted truncate">{attendeeA?.organization ?? ""}</p>
                  </div>

                  {/* Match score */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-px bg-terra-300" />
                      <div className="bg-terra-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {Math.round((match.score ?? 0) * 100)}%
                      </div>
                      <div className="w-6 h-px bg-terra-300" />
                    </div>
                    <span className="text-[10px] text-ink-muted">match</span>
                  </div>

                  {/* Attendee B */}
                  <div className="flex-1 text-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-1">
                      <span className="text-xs font-bold text-green-700">
                        {attendeeB?.name?.split(" ").map(n => n[0]).slice(0, 2).join("") ?? "?"}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-ink truncate">{attendeeB?.name ?? "Onbekend"}</p>
                    <p className="text-[10px] text-ink-muted truncate">{attendeeB?.organization ?? ""}</p>
                  </div>
                </div>

                {match.reason && (
                  <p className="text-xs text-ink-muted bg-sand rounded-lg px-3 py-2">
                    {match.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-sand flex justify-around pt-2 pb-safe-nav">
        {[
          { label: "Home",    icon: "🏠", href: "/dashboard" },
          { label: "Events",  icon: "📅", href: "/dashboard/events" },
          { label: "Netwerk", icon: "🔗", href: "#", active: true },
          { label: "Opties",  icon: "⚙️", href: "/dashboard/instellingen" },
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
