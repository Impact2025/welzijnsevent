import { db, attendees, events } from "@/db";
import { desc, count, eq } from "drizzle-orm";
import { getInitials, avatarColor, formatRelative, cn } from "@/lib/utils";
import { Search, SlidersHorizontal, Users } from "lucide-react";
import Link from "next/link";
import type { Attendee } from "@/db/schema";

export default async function DeelnemersPage() {
  const allAttendees = await db
    .select()
    .from(attendees)
    .orderBy(desc(attendees.registeredAt))
    .limit(100);

  const allEvents = await db.select().from(events);
  const eventMap = Object.fromEntries(allEvents.map(e => [e.id, e]));

  const checked   = allAttendees.filter(a => a.status === "ingecheckt").length;
  const aangemeld = allAttendees.filter(a => a.status === "aangemeld").length;
  const total     = allAttendees.length;

  const statusConfig: Record<string, { label: string; className: string }> = {
    ingecheckt: { label: "INGECHECKT", className: "badge-ingecheckt" },
    aangemeld:  { label: "AANGEMELD",  className: "badge-aangemeld"  },
    afwezig:    { label: "AFWEZIG",    className: "badge-afwezig"    },
  };

  return (
    <div className="p-7 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-7">
        <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-1">
          Deelnemers
        </p>
        <h1 className="text-3xl font-extrabold text-ink tracking-tight">Alle Deelnemers</h1>
        <p className="text-sm text-ink-muted mt-1 font-medium">
          Over alle evenementen heen
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          { label: "Totaal",      value: total,     color: "text-ink" },
          { label: "Ingecheckt", value: checked,   color: "text-green-600" },
          { label: "Aangemeld",  value: aangemeld, color: "text-orange-600" },
        ].map(stat => (
          <div key={stat.label} className="card-base p-5">
            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-3">{stat.label}</p>
            <p className={`text-3xl font-extrabold tracking-tight ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-white border border-sand rounded-xl px-4 py-2.5">
          <Search size={14} className="text-ink-muted shrink-0" />
          <input
            type="text"
            placeholder="Zoek op naam, organisatie of e-mail..."
            className="bg-transparent flex-1 text-sm outline-none text-ink placeholder-ink-muted/50 font-medium"
          />
        </div>
        <button className="flex items-center gap-2 bg-white border border-sand rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-muted hover:bg-sand transition-colors">
          <SlidersHorizontal size={14} />
          Filter
        </button>
      </div>

      {/* List */}
      <div className="card-base overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-sand/50">
          <p className="text-xs font-bold text-ink">{total} deelnemers</p>
          <div className="flex gap-2">
            {["Alle", "Ingecheckt", "Aangemeld", "Afwezig"].map((f, i) => (
              <button key={f} className={`text-[11px] font-bold px-3 py-1 rounded-full transition-colors ${
                i === 0 ? "bg-ink text-white" : "text-ink-muted hover:bg-sand"
              }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {allAttendees.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-terra-50 flex items-center justify-center mx-auto mb-3">
              <Users size={22} className="text-terra-400" />
            </div>
            <p className="text-sm font-semibold text-ink mb-1">Nog geen deelnemers</p>
            <p className="text-xs text-ink-muted">Deelnemers verschijnen hier zodra ze zich aanmelden</p>
          </div>
        ) : (
          <div>
            {allAttendees.map(attendee => {
              const event = eventMap[attendee.eventId];
              const statusInfo = statusConfig[attendee.status ?? "aangemeld"] ?? statusConfig.aangemeld;
              return (
                <div
                  key={attendee.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-cream/60 transition-colors border-b border-sand/40 last:border-0 group"
                >
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold",
                    avatarColor(attendee.name)
                  )}>
                    {getInitials(attendee.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{attendee.name}</p>
                    <p className="text-[11px] text-ink-muted font-medium truncate">
                      {attendee.organization}
                      {attendee.registeredAt && <> · {formatRelative(attendee.registeredAt)}</>}
                    </p>
                  </div>
                  {event && (
                    <Link
                      href={`/dashboard/events/${event.id}/deelnemers`}
                      className="text-[11px] text-ink-muted font-medium bg-sand/60 px-2.5 py-1 rounded-lg hover:bg-sand transition-colors truncate max-w-[140px] hidden md:block"
                    >
                      {event.title}
                    </Link>
                  )}
                  <span className={statusInfo.className}>{statusInfo.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
