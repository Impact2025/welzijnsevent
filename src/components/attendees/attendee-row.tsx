import { ChevronRight } from "lucide-react";
import { getInitials, avatarColor, formatRelative, cn } from "@/lib/utils";
import type { Attendee } from "@/db/schema";

interface AttendeeRowProps {
  attendee: Attendee;
  onClick?: () => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ingecheckt: { label: "INGECHECKT", className: "badge-ingecheckt" },
  aangemeld:  { label: "AANGEMELD",  className: "badge-aangemeld"  },
  afwezig:    { label: "AFWEZIG",    className: "badge-afwezig"    },
};

export function AttendeeRow({ attendee, onClick }: AttendeeRowProps) {
  const statusInfo = statusConfig[attendee.status ?? "aangemeld"] ?? statusConfig.aangemeld;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sand transition-colors border-b border-sand/60 last:border-0 text-left"
    >
      {/* Avatar */}
      <div className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
        avatarColor(attendee.name)
      )}>
        <span className="text-white text-xs font-bold">{getInitials(attendee.name)}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink truncate">{attendee.name}</p>
        <p className="text-xs text-ink-muted truncate">
          {attendee.organization}
          {attendee.registeredAt && (
            <> · {formatRelative(attendee.registeredAt)}</>
          )}
        </p>
      </div>

      {/* Status + arrow */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={statusInfo.className}>{statusInfo.label}</span>
        <ChevronRight size={14} className="text-ink-muted" />
      </div>
    </button>
  );
}
