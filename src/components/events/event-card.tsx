import Link from "next/link";
import { Calendar, MapPin, ChevronRight, Users } from "lucide-react";
import { formatDate, formatTime, getStatusColor, getStatusLabel, cn } from "@/lib/utils";
import type { Event } from "@/db/schema";

const STATUS_DOT: Record<string, string> = {
  live:      "bg-terra-500 shadow-[0_0_0_3px_rgba(200,82,42,0.20)]",
  published: "bg-green-500",
  draft:     "bg-gray-300",
  ended:     "bg-gray-200",
};

interface EventCardProps {
  event: Event & { attendeeCount?: number };
}

export function EventCard({ event }: EventCardProps) {
  const dot = STATUS_DOT[event.status ?? "draft"] ?? "bg-gray-300";

  return (
    <Link
      href={`/dashboard/events/${event.id}`}
      className="flex items-center gap-4 px-5 py-4 hover:bg-cream/70 transition-all duration-150 group border-b border-sand/40 last:border-0"
    >
      {/* Status dot */}
      <div className="relative shrink-0 mt-0.5">
        <div className={cn("w-2 h-2 rounded-full", dot)} />
        {event.status === "live" && (
          <div className="absolute inset-0 rounded-full bg-terra-500 animate-ping opacity-50" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-ink truncate leading-snug">
            {event.title}
          </p>
          <span className={cn(
            "text-[9px] font-black px-1.5 py-0.5 rounded border shrink-0 tracking-wider",
            getStatusColor(event.status ?? "draft")
          )}>
            {getStatusLabel(event.status ?? "draft").toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-ink-muted font-medium">
          <span className="flex items-center gap-1">
            <Calendar size={10} className="opacity-70" />
            {formatDate(event.startsAt)}, {formatTime(event.startsAt)}
          </span>
          {event.location && (
            <span className="flex items-center gap-1 truncate">
              <MapPin size={10} className="opacity-70" />
              {event.location}
            </span>
          )}
        </div>
      </div>

      {/* Attendee count + arrow */}
      <div className="flex items-center gap-2.5 shrink-0">
        {event.attendeeCount !== undefined && event.attendeeCount > 0 && (
          <div className="flex items-center gap-1 bg-sand/80 px-2 py-1 rounded-lg">
            <Users size={10} className="text-ink-muted" />
            <span className="text-[11px] font-bold text-ink-muted">{event.attendeeCount}</span>
          </div>
        )}
        <ChevronRight
          size={14}
          className="text-ink-muted/30 group-hover:text-terra-500 group-hover:translate-x-0.5 transition-all duration-150"
        />
      </div>
    </Link>
  );
}
