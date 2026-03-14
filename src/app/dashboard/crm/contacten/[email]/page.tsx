import { db, attendees, events, contactProfiles, crmActivities, feedback, sessionRegistrations, surveyResponses } from "@/db";
import { eq, inArray, and } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Mail, Calendar, CheckSquare, Star, ExternalLink, Zap, Clock,
} from "lucide-react";
import { getInitials, avatarColor, formatDate, formatRelative, cn } from "@/lib/utils";
import { LifecycleBadge } from "@/components/crm/LifecycleBadge";
import { LifecycleEditor } from "@/components/crm/LifecycleEditor";
import { TagEditor } from "@/components/crm/TagEditor";
import { NoteForm } from "@/components/crm/NoteForm";
import { ActivityTimeline } from "@/components/crm/ActivityTimeline";
import { ContactInfoEditor } from "@/components/crm/ContactInfoEditor";

export default async function ContactDetailPage({
  params,
}: {
  params: { email: string };
}) {
  const org = await getCurrentOrg();
  if (!org) redirect("/onboarding");

  const email = decodeURIComponent(params.email);

  // Get org's events
  const orgEvents = await db
    .select({ id: events.id, title: events.title, startsAt: events.startsAt, location: events.location })
    .from(events)
    .where(eq(events.organizationId, org.id));
  const eventIds = orgEvents.map(e => e.id);
  const eventMap = Object.fromEntries(orgEvents.map(e => [e.id, e]));

  if (eventIds.length === 0) notFound();

  // Get all attendee records for this email
  const attendeeRecords = await db
    .select()
    .from(attendees)
    .where(and(inArray(attendees.eventId, eventIds), eq(attendees.email, email)));

  if (attendeeRecords.length === 0) notFound();

  const attendeeIds = attendeeRecords.map(a => a.id);

  // Engagement data
  const feedbackList = await db.select().from(feedback).where(inArray(feedback.attendeeId, attendeeIds));
  const sessionRegs = await db.select().from(sessionRegistrations).where(inArray(sessionRegistrations.attendeeId, attendeeIds));
  const surveys = await db.select().from(surveyResponses).where(inArray(surveyResponses.attendeeId, attendeeIds));

  // CRM profile
  const [profile] = await db.select().from(contactProfiles)
    .where(and(eq(contactProfiles.organizationId, org.id), eq(contactProfiles.email, email)));

  // CRM activities (manual notes etc.)
  const activities = await db.select().from(crmActivities)
    .where(and(eq(crmActivities.organizationId, org.id), eq(crmActivities.contactEmail, email)));

  // Compute stats
  const eventsAttended = attendeeRecords.filter(a => a.status === "ingecheckt").length;
  const engagementScore =
    attendeeRecords.length * 10 +
    eventsAttended * 5 +
    sessionRegs.length * 3 +
    feedbackList.length * 5 +
    surveys.length * 10;

  // Most recent info
  const sorted = [...attendeeRecords].sort(
    (a, b) => new Date(b.registeredAt!).getTime() - new Date(a.registeredAt!).getTime()
  );
  const latest = sorted[0];
  const firstSeen = sorted[sorted.length - 1].registeredAt;

  const lifecycleStage = profile?.lifecycleStage ?? "contact";
  const tags = (profile?.tags ?? []) as string[];
  const crmNotes = profile?.crmNotes ?? null;

  // Profile overrides take precedence over attendee data
  const displayName = profile?.overrideName ?? latest.name;
  const displayEmail = profile?.overrideEmail ?? email;
  const displayOrganization = profile?.overrideOrganization ?? latest.organization ?? null;
  const displayRole = profile?.overrideRole ?? latest.role ?? null;
  const displayPhone = profile?.phone ?? null;

  const scoreLevel = engagementScore >= 50 ? "Hoog" : engagementScore >= 25 ? "Gemiddeld" : "Laag";
  const scoreColor = engagementScore >= 50 ? "text-amber-500" : engagementScore >= 25 ? "text-green-600" : "text-ink-muted";

  // Records with event info, newest first
  const recordsWithEvent = attendeeRecords
    .map(a => ({ ...a, event: eventMap[a.eventId] ?? null }))
    .sort((a, b) => new Date(b.registeredAt!).getTime() - new Date(a.registeredAt!).getTime());

  return (
    <div className="px-4 py-5 md:px-7 md:py-7 max-w-5xl mx-auto animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5 text-[11px] font-bold text-ink-muted uppercase tracking-widest">
        <Link href="/dashboard/crm" className="hover:text-terra-500 transition-colors">CRM</Link>
        <span className="text-ink-muted/40">›</span>
        <Link href="/dashboard/crm/contacten" className="hover:text-terra-500 transition-colors hidden sm:inline">Contacten</Link>
        <span className="text-ink-muted/40 hidden sm:inline">›</span>
        <span className="text-ink truncate max-w-[160px] sm:max-w-[240px]">{displayName}</span>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-5 md:gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-5">
          {/* Contact header card */}
          <div className="card-base p-6">
            <div className="flex items-start gap-4">
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 text-white text-xl font-bold", avatarColor(displayName))}>
                {getInitials(displayName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h1 className="text-2xl font-extrabold text-ink tracking-tight">{displayName}</h1>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <LifecycleBadge stage={lifecycleStage} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={cn("text-3xl font-extrabold", scoreColor)}>{engagementScore}</div>
                    <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wide">{scoreLevel} betrokkenheid</p>
                  </div>
                </div>

                <ContactInfoEditor
                  routeEmail={email}
                  displayEmail={displayEmail}
                  name={displayName}
                  organization={displayOrganization}
                  role={displayRole}
                  phone={displayPhone}
                />

                <div className="mt-3 flex items-center gap-2 text-sm text-ink-muted">
                  <Clock size={13} className="shrink-0" />
                  <span>Eerste contact {firstSeen ? formatDate(firstSeen) : "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Events aangemeld",  value: attendeeRecords.length, icon: Calendar,     color: "text-blue-600" },
              { label: "Ingecheckt",        value: eventsAttended,          icon: CheckSquare,  color: "text-green-600" },
              { label: "Sessies",           value: sessionRegs.length,      icon: Zap,          color: "text-terra-500" },
              { label: "Feedback gegeven",  value: feedbackList.length,     icon: Star,         color: "text-amber-500" },
            ].map(stat => (
              <div key={stat.label} className="card-base p-4 text-center">
                <stat.icon size={18} className={cn("mx-auto mb-2", stat.color)} />
                <p className="text-2xl font-extrabold text-ink">{stat.value}</p>
                <p className="text-[10px] font-semibold text-ink-muted mt-0.5 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Event history */}
          <div className="card-base p-5">
            <p className="text-xs font-bold text-ink uppercase tracking-wide mb-4">Evenementen historie</p>
            {recordsWithEvent.length === 0 ? (
              <p className="text-sm text-ink-muted">Geen events</p>
            ) : (
              <div className="space-y-0">
                {recordsWithEvent.map(record => {
                  const statusConfig = {
                    ingecheckt: { label: "Ingecheckt", className: "badge-ingecheckt" },
                    aangemeld:  { label: "Aangemeld",  className: "badge-aangemeld"  },
                    afwezig:    { label: "Afwezig",    className: "badge-afwezig"    },
                  } as const;
                  const status = statusConfig[record.status as keyof typeof statusConfig] ?? statusConfig.aangemeld;
                  return (
                    <div key={record.id} className="flex items-center gap-3 py-3 border-b border-sand/50 last:border-0">
                      <div className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center shrink-0">
                        <Calendar size={14} className="text-terra-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">
                          {record.event?.title ?? "Onbekend evenement"}
                        </p>
                        <p className="text-[11px] text-ink-muted">
                          {record.event?.startsAt ? formatDate(record.event.startsAt) : "—"}
                          {record.registeredAt && <> · Aangemeld {formatRelative(record.registeredAt)}</>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={status.className}>{status.label}</span>
                        {record.event && (
                          <Link
                            href={`/dashboard/events/${record.event.id}/deelnemers/${record.id}`}
                            className="text-ink-muted hover:text-terra-500 transition-colors"
                          >
                            <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity timeline */}
          <div className="card-base p-5">
            <p className="text-xs font-bold text-ink uppercase tracking-wide mb-4">Activiteitentijdlijn</p>
            <ActivityTimeline
              activities={activities.map(a => ({
                id: a.id,
                type: a.type,
                description: a.description,
                createdAt: a.createdAt,
                createdBy: a.createdBy,
                metadata: (a.metadata ?? {}) as Record<string, unknown>,
              }))}
              attendeeRecords={recordsWithEvent}
            />
          </div>
        </div>

        {/* RIGHT COLUMN — CRM actions */}
        <div className="space-y-4">
          {/* Lifecycle editor */}
          <div className="card-base p-5">
            <LifecycleEditor email={email} currentStage={lifecycleStage} />
          </div>

          {/* Tags */}
          <div className="card-base p-5">
            <TagEditor email={email} initialTags={tags} />
          </div>

          {/* Notes */}
          <div className="card-base p-5">
            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-3">Notities toevoegen</p>
            <NoteForm email={email} />
          </div>

          {/* Quick stats summary */}
          <div className="card-base p-5 bg-cream/60">
            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-3">Contactinformatie</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Eerste contact</span>
                <span className="font-semibold text-ink">{firstSeen ? formatDate(firstSeen) : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Laatste activiteit</span>
                <span className="font-semibold text-ink">{latest.registeredAt ? formatRelative(latest.registeredAt) : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Email opt-out</span>
                <span className={cn("font-semibold", latest.emailOptOut ? "text-red-500" : "text-green-600")}>
                  {latest.emailOptOut ? "Ja" : "Nee"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Netwerken</span>
                <span className={cn("font-semibold", latest.networkingOptIn ? "text-green-600" : "text-ink-muted")}>
                  {latest.networkingOptIn ? "Opt-in" : "Niet opgegeven"}
                </span>
              </div>
            </div>
          </div>

          {/* Send email quick action */}
          <a
            href={`mailto:${displayEmail}`}
            className="flex items-center justify-center gap-2 w-full bg-white border border-sand hover:bg-sand rounded-xl px-4 py-3 text-sm font-semibold text-ink-muted transition-colors"
          >
            <Mail size={14} />
            E-mail sturen
          </a>
        </div>
      </div>
    </div>
  );
}
