import { formatRelative, cn } from "@/lib/utils";
import { Calendar, CheckSquare, Star, MessageSquare, Mail, Tag, Activity, type LucideIcon } from "lucide-react";

type ActivityType = "event_registration" | "check_in" | "feedback" | "note" | "email_sent" | "tag_added" | string;

interface TimelineItem {
  id: string;
  type: ActivityType;
  description: string;
  createdAt: Date | string | null;
  createdBy?: string | null;
  metadata?: Record<string, unknown>;
}

interface AttendeeRecord {
  id: string;
  status: string | null;
  registeredAt: Date | string | null;
  checkedInAt: Date | string | null;
  event?: { title: string; startsAt: Date | string; id: string } | null;
}

interface Props {
  activities: TimelineItem[];
  attendeeRecords: AttendeeRecord[];
}

const ACTIVITY_ICONS: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  event_registration: { icon: Calendar,      color: "text-blue-600",   bg: "bg-blue-50"   },
  check_in:          { icon: CheckSquare,   color: "text-green-600",  bg: "bg-green-50"  },
  feedback:          { icon: Star,          color: "text-amber-500",  bg: "bg-amber-50"  },
  note:              { icon: MessageSquare, color: "text-terra-500",  bg: "bg-terra-50"  },
  email_sent:        { icon: Mail,          color: "text-purple-600", bg: "bg-purple-50" },
  tag_added:         { icon: Tag,           color: "text-teal-600",   bg: "bg-teal-50"   },
};

function getIcon(type: string) {
  return ACTIVITY_ICONS[type] ?? { icon: Activity, color: "text-ink-muted", bg: "bg-sand" };
}

export function ActivityTimeline({ activities, attendeeRecords }: Props) {
  // Merge CRM activities + auto-generated from attendee records
  const autoActivities: TimelineItem[] = [];

  attendeeRecords.forEach(a => {
    if (a.registeredAt) {
      autoActivities.push({
        id: `reg-${a.id}`,
        type: "event_registration",
        description: `Aangemeld voor ${a.event?.title ?? "evenement"}`,
        createdAt: a.registeredAt,
      });
    }
    if (a.checkedInAt) {
      autoActivities.push({
        id: `checkin-${a.id}`,
        type: "check_in",
        description: `Ingecheckt bij ${a.event?.title ?? "evenement"}`,
        createdAt: a.checkedInAt,
      });
    }
  });

  const allItems = [...activities, ...autoActivities].sort(
    (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
  );

  if (allItems.length === 0) {
    return (
      <div className="py-8 text-center text-ink-muted">
        <Activity size={28} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">Nog geen activiteiten</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[15px] top-4 bottom-4 w-px bg-sand" />

      <div className="space-y-1">
        {allItems.map(item => {
          const { icon: Icon, color, bg } = getIcon(item.type);
          return (
            <div key={item.id} className="flex gap-3 items-start py-2 relative">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10", bg)}>
                <Icon size={13} className={color} />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm text-ink font-medium leading-snug">{item.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[11px] text-ink-muted">{item.createdAt ? formatRelative(item.createdAt) : ""}</p>
                  {item.createdBy && (
                    <p className="text-[11px] text-ink-muted">· door {item.createdBy}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
