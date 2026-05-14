import { db, volunteerProfiles, vacancyApplications, vacancyInvitations, volunteerVacancies, volunteerMessages, events, contactProfiles } from "@/db";
import { eq, and, inArray, desc } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Mail, Phone, HandHeart, Check, X, Clock,
  Calendar, MessageSquare, Send, Tag, FileText,
} from "lucide-react";
import { getInitials, avatarColor, cn } from "@/lib/utils";
import { VolunteerDetailActions } from "@/components/vrijwilligers/VolunteerDetailActions";

export const metadata = { title: "Vrijwilliger — Bijeen" };

const SKILL_COLORS = [
  "bg-blue-50 text-blue-700 border-blue-100",
  "bg-purple-50 text-purple-700 border-purple-100",
  "bg-green-50 text-green-700 border-green-100",
  "bg-orange-50 text-orange-700 border-orange-100",
  "bg-pink-50 text-pink-700 border-pink-100",
];
function skillColor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffff;
  return SKILL_COLORS[h % SKILL_COLORS.length];
}

function formatDate(d: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

const APP_STATUS: Record<string, { label: string; cls: string }> = {
  pending:   { label: "In behandeling", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  accepted:  { label: "Geaccepteerd",   cls: "bg-green-50 text-green-700 border-green-200" },
  rejected:  { label: "Afgewezen",      cls: "bg-red-50 text-red-600 border-red-200" },
  withdrawn: { label: "Teruggetrokken", cls: "bg-gray-100 text-gray-500 border-gray-200" },
};

const INV_STATUS: Record<string, { label: string; cls: string }> = {
  pending:  { label: "Verstuurd",      cls: "bg-amber-50 text-amber-700 border-amber-200" },
  accepted: { label: "Geaccepteerd",   cls: "bg-green-50 text-green-700 border-green-200" },
  declined: { label: "Afgewezen",      cls: "bg-red-50 text-red-600 border-red-200" },
  expired:  { label: "Verlopen",       cls: "bg-gray-100 text-gray-500 border-gray-200" },
};

export default async function VolunteerDetailPage({
  params,
}: {
  params: { email: string };
}) {
  const org = await getCurrentOrg();
  if (!org) redirect("/onboarding");

  const email = decodeURIComponent(params.email).toLowerCase();

  // All profiles for this volunteer at this org
  const profiles = await db
    .select()
    .from(volunteerProfiles)
    .where(and(
      eq(volunteerProfiles.organizationId, org.id),
    ))
    .orderBy(desc(volunteerProfiles.updatedAt));

  const volProfiles = profiles.filter((p) => p.email.toLowerCase() === email);
  if (volProfiles.length === 0) notFound();

  const primary = volProfiles[0];
  const allIds  = volProfiles.map((p) => p.id);

  // All applications
  const appRows = await db
    .select({
      app:     vacancyApplications,
      vacancy: volunteerVacancies,
    })
    .from(vacancyApplications)
    .leftJoin(volunteerVacancies, eq(vacancyApplications.vacancyId, volunteerVacancies.id))
    .where(inArray(vacancyApplications.volunteerProfileId, allIds))
    .orderBy(desc(vacancyApplications.appliedAt));

  // Events for context
  const uniqueEventIds = new Set(appRows.map((r) => r.vacancy?.eventId).filter(Boolean) as string[]);
  const eventIds = Array.from(uniqueEventIds);
  const eventRows = eventIds.length > 0
    ? await db.select({ id: events.id, title: events.title }).from(events).where(inArray(events.id, eventIds))
    : [];
  const eventMap = new Map(eventRows.map((e) => [e.id, e.title]));

  // All invitations
  const invRows = await db
    .select({
      inv:     vacancyInvitations,
      vacancy: volunteerVacancies,
    })
    .from(vacancyInvitations)
    .leftJoin(volunteerVacancies, eq(vacancyInvitations.vacancyId, volunteerVacancies.id))
    .where(eq(vacancyInvitations.invitedEmail, email))
    .orderBy(desc(vacancyInvitations.createdAt));

  // Messages
  const messages = await db
    .select()
    .from(volunteerMessages)
    .where(and(
      eq(volunteerMessages.organizationId, org.id),
      eq(volunteerMessages.recipientEmail, email),
    ))
    .orderBy(desc(volunteerMessages.createdAt));

  // CRM profile (notes, tags, lifecycle)
  const [crmProfile] = await db
    .select()
    .from(contactProfiles)
    .where(and(
      eq(contactProfiles.organizationId, org.id),
      eq(contactProfiles.email, email),
    ))
    .limit(1);

  // Build timeline
  type TimelineEntry = {
    date: Date;
    type: "application" | "invitation" | "message";
    icon: "handHeart" | "send" | "mail";
    title: string;
    subtitle: string;
    badge?: { label: string; cls: string };
  };

  const timeline: TimelineEntry[] = [
    ...appRows.map((r) => ({
      date:     r.app.appliedAt ?? new Date(0),
      type:     "application" as const,
      icon:     "handHeart" as const,
      title:    r.vacancy?.title ?? "Vacature",
      subtitle: eventMap.get(r.vacancy?.eventId ?? "") ?? "",
      badge:    APP_STATUS[r.app.status ?? "pending"],
    })),
    ...invRows.map((r) => ({
      date:     r.inv.createdAt ?? new Date(0),
      type:     "invitation" as const,
      icon:     "send" as const,
      title:    `Uitnodiging: ${r.vacancy?.title ?? "Vacature"}`,
      subtitle: r.inv.personalMessage ?? "",
      badge:    INV_STATUS[r.inv.status ?? "pending"],
    })),
    ...messages.map((m) => ({
      date:     m.createdAt ?? new Date(0),
      type:     "message" as const,
      icon:     "mail" as const,
      title:    m.subject,
      subtitle: m.body.slice(0, 80) + (m.body.length > 80 ? "…" : ""),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const skills = (primary.skills ?? []) as string[];

  // Vacancies this org has open — for the "invite to vacancy" action
  const openVacancies = await db
    .select({ id: volunteerVacancies.id, title: volunteerVacancies.title, eventId: volunteerVacancies.eventId })
    .from(volunteerVacancies)
    .where(and(
      eq(volunteerVacancies.organizationId, org.id),
      eq(volunteerVacancies.status, "open"),
    ))
    .orderBy(desc(volunteerVacancies.createdAt));

  const openVacanciesWithEvent = await Promise.all(
    openVacancies.map(async (v) => {
      const [evt] = await db.select({ title: events.title }).from(events).where(eq(events.id, v.eventId));
      return { ...v, eventTitle: evt?.title ?? "" };
    })
  );

  const initials = getInitials(primary.name);
  const color    = avatarColor(primary.name);

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 md:px-7 md:py-7 animate-fade-in">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <Link
          href="/dashboard/vrijwilligers"
          className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={13} />
          Vrijwilligers
        </Link>
      </div>

      {/* Profile card */}
      <div className="card-base p-5 mb-5">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white text-lg font-bold"
            style={{ backgroundColor: color }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-ink tracking-tight">{primary.name}</h1>
            <div className="flex flex-wrap gap-3 mt-1.5">
              <a
                href={`mailto:${primary.email}`}
                className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-terra-500 transition-colors"
              >
                <Mail size={12} />
                {primary.email}
              </a>
              {primary.phone && (
                <a
                  href={`tel:${primary.phone}`}
                  className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-terra-500 transition-colors"
                >
                  <Phone size={12} />
                  {primary.phone}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-sand">
            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <Tag size={10} />
              Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s}
                  className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", skillColor(s))}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {primary.bio && (
          <div className="mt-4 pt-4 border-t border-sand">
            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <FileText size={10} />
              Over deze vrijwilliger
            </p>
            <p className="text-sm text-ink leading-relaxed">{primary.bio}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          {
            label: "Aanmeldingen",
            value: appRows.length,
            cls: "text-ink",
          },
          {
            label: "Geaccepteerd",
            value: appRows.filter((r) => r.app.status === "accepted").length,
            cls: "text-green-600",
          },
          {
            label: "In behandeling",
            value: appRows.filter((r) => r.app.status === "pending").length,
            cls: "text-amber-600",
          },
        ].map(({ label, value, cls }) => (
          <div key={label} className="card-base p-4 text-center">
            <p className={cn("text-2xl font-extrabold", cls)}>{value}</p>
            <p className="text-[11px] text-ink-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Action panel (client component) */}
      <VolunteerDetailActions
        volunteerEmail={email}
        volunteerName={primary.name}
        openVacancies={openVacanciesWithEvent}
        crmNotes={crmProfile?.crmNotes ?? null}
        organizationId={org.id}
        profileId={primary.id}
        profilePhone={primary.phone ?? null}
        profileSkills={skills}
        profileAvailability={primary.availability ?? null}
        profileBio={primary.bio ?? null}
      />

      {/* Timeline */}
      <div className="card-base overflow-hidden mt-5">
        <div className="px-5 py-4 border-b border-sand">
          <h2 className="text-sm font-bold text-ink">Activiteitenhistorie</h2>
          <p className="text-xs text-ink-muted mt-0.5">{timeline.length} activiteiten</p>
        </div>

        {timeline.length === 0 ? (
          <div className="py-10 text-center text-ink-muted">
            <Clock size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nog geen activiteiten</p>
          </div>
        ) : (
          <div className="divide-y divide-sand/40">
            {timeline.map((entry, i) => {
              const Icon =
                entry.icon === "handHeart" ? HandHeart :
                entry.icon === "send"      ? Send      :
                                             Mail;
              return (
                <div key={i} className="flex items-start gap-4 px-5 py-4">
                  <div className="w-8 h-8 rounded-full bg-cream border border-sand flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={13} className="text-ink-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-ink truncate">{entry.title}</p>
                      {entry.badge && (
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0",
                          entry.badge.cls
                        )}>
                          {entry.badge.label}
                        </span>
                      )}
                    </div>
                    {entry.subtitle && (
                      <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{entry.subtitle}</p>
                    )}
                    <p className="text-[11px] text-ink-muted/60 mt-1">{formatDate(entry.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
