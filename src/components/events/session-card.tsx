import { formatTime, cn } from "@/lib/utils";
import { MapPin, Check } from "lucide-react";
import type { Session } from "@/db/schema";

interface SessionCardProps {
  session: Session;
  isPast?: boolean;
}

export function SessionCard({ session, isPast }: SessionCardProps) {
  return (
    <div className="flex gap-4">
      {/* Time column */}
      <div className="w-20 shrink-0 text-right pt-1">
        <span className="text-xs font-semibold text-ink-muted">
          {formatTime(session.startsAt)}
        </span>
        <br />
        <span className="text-xs text-ink-muted/60">
          {formatTime(session.endsAt)}
        </span>
      </div>

      {/* Timeline dot */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1",
          isPast      && "bg-green-500 border-green-500",
          session.isLive && !isPast && "bg-terra-500 border-terra-500 shadow-[0_0_0_4px_rgba(200,82,42,0.15)]",
          !isPast && !session.isLive && "bg-white border-sand",
        )}>
          {isPast && <Check size={10} className="text-white" />}
          {session.isLive && !isPast && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
        </div>
        <div className="w-0.5 bg-sand flex-1 mt-1" />
      </div>

      {/* Card */}
      <div className={cn(
        "flex-1 rounded-2xl p-4 mb-4 border transition-all",
        session.isLive && !isPast
          ? "bg-terra-50 border-terra-200 shadow-sm"
          : "bg-white border-sand",
      )}>
        {/* Live badge */}
        {session.isLive && !isPast && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-terra-500 animate-pulse" />
            <span className="text-xs font-bold text-terra-600 uppercase tracking-wide">Live nu</span>
          </div>
        )}

        <h3 className={cn(
          "text-sm font-bold mb-1",
          session.isLive && !isPast ? "text-terra-800" : "text-ink"
        )}>
          {session.title}
        </h3>

        {session.description && (
          <p className="text-xs text-ink-muted mb-2 line-clamp-2">{session.description}</p>
        )}

        <div className="flex items-center justify-between">
          {/* Speaker */}
          {session.speaker && (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-terra-200 flex items-center justify-center">
                <span className="text-[9px] font-bold text-terra-700">
                  {session.speaker.split(" ").map(n => n[0]).slice(0,2).join("")}
                </span>
              </div>
              <span className="text-xs text-ink-muted">{session.speaker}</span>
            </div>
          )}

          {/* Location */}
          {session.location && (
            <div className="flex items-center gap-1 text-xs text-ink-muted">
              <MapPin size={10} />
              {session.location}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
