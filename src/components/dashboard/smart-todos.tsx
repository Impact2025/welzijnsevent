import { db, events, attendees, sessions, vacancyApplications, volunteerVacancies, volunteerProfiles } from "@/db";
import { eq, count, desc, and } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  Zap,
  CheckSquare,
  ArrowRight,
  ListChecks,
  HandHeart,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Priority = "urgent" | "attention" | "suggestion";
type IconType = "zap" | "alert" | "clock" | "check" | "volunteer";

interface Todo {
  priority: Priority;
  label: string;
  detail: string;
  href: string;
  icon: IconType;
}

const PRIORITY_STYLE: Record<Priority, { wrap: string; badge: string; icon: string }> = {
  urgent:     { wrap: "bg-red-50 border-red-200",    badge: "bg-red-100 text-red-700",    icon: "text-red-500" },
  attention:  { wrap: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-700", icon: "text-amber-500" },
  suggestion: { wrap: "bg-blue-50 border-blue-200",   badge: "bg-blue-100 text-blue-700",   icon: "text-blue-500" },
};

const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: "Urgent",
  attention: "Aandacht",
  suggestion: "Tip",
};

const PRIORITY_ORDER: Record<Priority, number> = { urgent: 0, attention: 1, suggestion: 2 };

function TodoIcon({ type, cls }: { type: IconType; cls: string }) {
  if (type === "zap")       return <Zap size={13} className={cn(cls, "fill-current")} />;
  if (type === "alert")     return <AlertTriangle size={13} className={cls} />;
  if (type === "clock")     return <Clock size={13} className={cls} />;
  if (type === "volunteer") return <HandHeart size={13} className={cls} />;
  return <CheckSquare size={13} className={cls} />;
}

export async function SmartTodos() {
  const org = await getCurrentOrg();
  if (!org) return null;

  const now = new Date();

  const allEvents = await db
    .select()
    .from(events)
    .where(eq(events.organizationId, org.id))
    .orderBy(desc(events.startsAt))
    .limit(30);

  const enriched = await Promise.all(
    allEvents.map(async (ev) => {
      const [{ count: ac }] = await db
        .select({ count: count() })
        .from(attendees)
        .where(eq(attendees.eventId, ev.id));
      const [{ count: sc }] = await db
        .select({ count: count() })
        .from(sessions)
        .where(eq(sessions.eventId, ev.id));
      return { ...ev, attendeeCount: Number(ac), sessionCount: Number(sc) };
    })
  );

  // Pending volunteer applications per vacancy (all events for this org)
  const pendingApps = await db
    .select({
      vacancyId:    vacancyApplications.vacancyId,
      vacancyTitle: volunteerVacancies.title,
      eventId:      volunteerVacancies.eventId,
      profileName:  volunteerProfiles.name,
      profileEmail: volunteerProfiles.email,
    })
    .from(vacancyApplications)
    .innerJoin(volunteerVacancies, eq(vacancyApplications.vacancyId, volunteerVacancies.id))
    .innerJoin(volunteerProfiles, eq(vacancyApplications.volunteerProfileId, volunteerProfiles.id))
    .where(
      and(
        eq(vacancyApplications.status, "pending"),
        eq(volunteerVacancies.organizationId, org.id)
      )
    )
    .orderBy(desc(vacancyApplications.appliedAt))
    .limit(20);

  // Group by vacancyId
  const byVacancy = new Map<string, typeof pendingApps>();
  for (const row of pendingApps) {
    if (!byVacancy.has(row.vacancyId)) byVacancy.set(row.vacancyId, []);
    byVacancy.get(row.vacancyId)!.push(row);
  }

  const todos: Todo[] = [];

  // Add a todo per vacancy with pending applications
  for (const [vacancyId, rows] of Array.from(byVacancy.entries())) {
    const first = rows[0];
    const eventForVacancy = allEvents.find((e) => e.id === first.eventId);
    const eventPath = eventForVacancy
      ? `/dashboard/events/${first.eventId}/vacatures/${vacancyId}`
      : `/dashboard/vrijwilligers`;
    if (rows.length === 1) {
      todos.push({
        priority: "attention",
        label:    `${first.profileName} wacht op beoordeling`,
        detail:   `Aanmelding voor "${first.vacancyTitle}"`,
        href:     eventPath,
        icon:     "volunteer",
      });
    } else {
      todos.push({
        priority: "attention",
        label:    `${rows.length} aanmeldingen voor "${first.vacancyTitle}"`,
        detail:   `${rows.map((r: { profileName: string }) => r.profileName).slice(0, 2).join(", ")}${rows.length > 2 ? ` +${rows.length - 2}` : ""} wachten op beoordeling`,
        href:     eventPath,
        icon:     "volunteer",
      });
    }
  }

  for (const ev of enriched) {
    const startsAt = new Date(ev.startsAt);
    const endsAt = new Date(ev.endsAt);
    const daysUntil = Math.ceil((startsAt.getTime() - now.getTime()) / 86400000);
    const daysSinceEnd = Math.ceil((now.getTime() - endsAt.getTime()) / 86400000);
    const fillRate = ev.maxAttendees ? ev.attendeeCount / ev.maxAttendees : null;

    // Live events
    if (ev.status === "live") {
      todos.push({
        priority: "urgent",
        label: `"${ev.title}" is nu live`,
        detail: "Open het live controle paneel",
        href: `/dashboard/events/${ev.id}/live`,
        icon: "zap",
      });
    }

    // Events within 48h without reminder
    if (
      ev.status === "published" &&
      daysUntil >= 0 &&
      daysUntil <= 2 &&
      !ev.reminderSentAt
    ) {
      todos.push({
        priority: "urgent",
        label: `Stuur herinnering: "${ev.title}"`,
        detail: daysUntil === 0 ? "Vandaag!" : `Over ${daysUntil} dag${daysUntil !== 1 ? "en" : ""}`,
        href: `/dashboard/events/${ev.id}`,
        icon: "alert",
      });
    }

    // Events within 3–7 days without reminder
    if (
      ev.status === "published" &&
      daysUntil > 2 &&
      daysUntil <= 7 &&
      !ev.reminderSentAt
    ) {
      todos.push({
        priority: "attention",
        label: `Plan herinnering: "${ev.title}"`,
        detail: `Over ${daysUntil} dagen`,
        href: `/dashboard/events/${ev.id}`,
        icon: "clock",
      });
    }

    // Draft events with upcoming date
    if (ev.status === "draft" && daysUntil >= 0) {
      todos.push({
        priority: "attention",
        label: `Publiceer event: "${ev.title}"`,
        detail: "Nog niet zichtbaar voor deelnemers",
        href: `/dashboard/events/${ev.id}/edit`,
        icon: "check",
      });
    }

    // Ended events within 14 days without thank-you
    if (ev.status === "ended" && daysSinceEnd >= 0 && daysSinceEnd <= 14 && !ev.thankYouSentAt) {
      todos.push({
        priority: "attention",
        label: `Stuur bedankmail: "${ev.title}"`,
        detail: `${daysSinceEnd} dag${daysSinceEnd !== 1 ? "en" : ""} geleden afgelopen`,
        href: `/dashboard/events/${ev.id}`,
        icon: "clock",
      });
    }

    // Low fill rate — published, within 14 days, < 40%
    if (
      ev.status === "published" &&
      fillRate !== null &&
      fillRate < 0.4 &&
      daysUntil >= 0 &&
      daysUntil <= 14
    ) {
      todos.push({
        priority: "attention",
        label: `Lage bezetting: "${ev.title}"`,
        detail: `${Math.round(fillRate * 100)}% gevuld — ${ev.attendeeCount} van ${ev.maxAttendees} plekken`,
        href: `/dashboard/events/${ev.id}/deelnemers`,
        icon: "alert",
      });
    }

    // Missing description on upcoming events
    if (
      (ev.status === "draft" || ev.status === "published") &&
      !ev.description &&
      daysUntil >= 0
    ) {
      todos.push({
        priority: "suggestion",
        label: `Beschrijving ontbreekt: "${ev.title}"`,
        detail: "Voeg een beschrijving toe voor deelnemers",
        href: `/dashboard/events/${ev.id}/edit`,
        icon: "check",
      });
    }
  }

  const sorted = todos
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    .slice(0, 6);

  if (sorted.length === 0) return null;

  return (
    <div className="card-base overflow-hidden mb-5 sm:mb-7">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-sand/50">
        <ListChecks size={14} className="text-terra-500" strokeWidth={2.5} />
        <h2 className="font-bold text-ink text-sm">Actiepunten</h2>
        <span className="ml-auto text-[10px] font-bold bg-terra-50 text-terra-600 px-2 py-0.5 rounded-full border border-terra-100">
          {sorted.length}
        </span>
      </div>

      <div className="divide-y divide-sand/30">
        {sorted.map((todo, i) => {
          const s = PRIORITY_STYLE[todo.priority];
          return (
            <Link
              key={i}
              href={todo.href}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-cream/50 transition-colors group"
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border",
                  s.wrap
                )}
              >
                <TodoIcon type={todo.icon} cls={s.icon} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-ink truncate">{todo.label}</p>
                <p className="text-[11px] text-ink-muted mt-0.5">{todo.detail}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={cn(
                    "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md",
                    s.badge
                  )}
                >
                  {PRIORITY_LABEL[todo.priority]}
                </span>
                <ArrowRight
                  size={12}
                  className="text-ink-muted/40 group-hover:text-ink-muted group-hover:translate-x-0.5 transition-all"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
