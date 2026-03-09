import { db, events, attendees, networkMatches } from "@/db";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EventNav } from "@/components/public/event-nav";
import { getInitials, avatarColor, cn } from "@/lib/utils";
import { Users, Sparkles, UserCheck } from "lucide-react";

export default async function CommunityPage({ params }: { params: { slug: string } }) {
  const [event] = await db.select().from(events).where(eq(events.slug, params.slug));
  if (!event || !event.isPublic) notFound();

  const primaryColor = event.websiteColor ?? "#C8522A";

  const eventAttendees = await db
    .select()
    .from(attendees)
    .where(eq(attendees.eventId, event.id));

  const matches = await db
    .select()
    .from(networkMatches)
    .where(eq(networkMatches.eventId, event.id));

  const attendeeMap = Object.fromEntries(eventAttendees.map((a) => [a.id, a]));
  const checkedIn   = eventAttendees.filter((a) => a.status === "ingecheckt");
  const aangemeld   = eventAttendees.filter((a) => a.status === "aangemeld");

  return (
    <div className="min-h-screen bg-gray-50">
      <EventNav slug={params.slug} eventTitle={event.title} primaryColor={primaryColor} />

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5 pb-24">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Aangemeld",   value: eventAttendees.length, color: "text-gray-900" },
            { label: "Aanwezig",    value: checkedIn.length,      color: "text-green-600" },
            { label: "Matches",     value: matches.length,        color: primaryColor },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p
                className="text-2xl font-extrabold tracking-tight"
                style={stat.label === "Matches" ? { color: primaryColor } : {}}
              >
                <span className={stat.label !== "Matches" ? stat.color : ""}>{stat.value}</span>
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Network matches */}
        {matches.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Sparkles size={13} style={{ color: primaryColor }} />
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Netwerk Matches
              </p>
              <span
                className="ml-auto text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                {matches.length}
              </span>
            </div>
            <div className="space-y-2.5">
              {matches.slice(0, 5).map((match) => {
                const a = attendeeMap[match.attendeeAId ?? ""];
                const b = attendeeMap[match.attendeeBId ?? ""];
                if (!a || !b) return null;
                const score = match.score ? Math.round(match.score * 100) : null;
                return (
                  <div key={match.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", avatarColor(a.name))}>
                        {getInitials(a.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">{a.name}</p>
                        {a.organization && <p className="text-[11px] text-gray-500 truncate">{a.organization}</p>}
                      </div>
                      {score && (
                        <div
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold"
                          style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                        >
                          <Sparkles size={9} />
                          {score}%
                        </div>
                      )}
                      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", avatarColor(b.name))}>
                        {getInitials(b.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">{b.name}</p>
                        {b.organization && <p className="text-[11px] text-gray-500 truncate">{b.organization}</p>}
                      </div>
                    </div>
                    {match.reason && (
                      <p className="text-[11px] text-gray-400 mt-2.5 pt-2.5 border-t border-gray-50 leading-relaxed">
                        {match.reason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Who's coming */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Users size={13} className="text-gray-400" />
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Wie komen er ({eventAttendees.length})
            </p>
          </div>

          {eventAttendees.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-10 text-center">
              <Users size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-400">Nog geen deelnemers</p>
              <p className="text-xs text-gray-300 mt-0.5">Meld je aan via de evenementpagina</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {eventAttendees.slice(0, 25).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
                      avatarColor(a.name)
                    )}
                  >
                    {getInitials(a.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{a.name}</p>
                    {a.organization && (
                      <p className="text-[11px] text-gray-500 truncate">{a.organization}</p>
                    )}
                  </div>
                  {a.status === "ingecheckt" ? (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full shrink-0">
                      <UserCheck size={10} />
                      Aanwezig
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full shrink-0">
                      Aangemeld
                    </span>
                  )}
                </div>
              ))}
              {eventAttendees.length > 25 && (
                <div className="py-3.5 text-center border-t border-gray-50">
                  <p className="text-xs text-gray-400 font-medium">
                    +{eventAttendees.length - 25} andere deelnemers
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
