import { notFound } from "next/navigation";
import Link from "next/link";
import { db, events, sessions } from "@/db";
import { eq, asc } from "drizzle-orm";
import { SessionCard } from "@/components/events/session-card";
import { formatDate, formatTime } from "@/lib/utils";
import { ArrowLeft, MapPin, Calendar, Filter, Globe, ExternalLink } from "lucide-react";
import { ShareEventButton } from "@/components/dashboard/share-event-button";
import { AddSessionForm } from "@/components/events/add-session-form";
import { EmailActionsPanel } from "@/components/events/email-actions-panel";
import { CustomFieldsManager } from "@/components/events/custom-fields-manager";
import { EventTabs } from "@/components/events/event-tabs";
import { EventActionsMenu } from "@/components/events/event-actions-menu";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const [event] = await db.select().from(events).where(eq(events.id, params.id));
  if (!event) notFound();

  const eventSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.eventId, params.id))
    .orderBy(asc(sessions.sortOrder));

  const now = new Date();

  return (
    <div className="w-full md:max-w-4xl md:mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="relative bg-terra-500 pt-safe-top pb-6 px-4 text-white">
        <Link href="/dashboard/events" className="inline-flex items-center gap-1.5 text-white/80 text-sm mb-4 hover:text-white py-2 -ml-1">
          <ArrowLeft size={16} />
          Terug
        </Link>

        {event.status === "live" && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Live nu</span>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold mb-1">{event.title}</h1>
            <div className="flex items-center gap-1 text-white/80 text-xs mb-0.5">
              <Calendar size={12} />
              {formatDate(event.startsAt)}, {formatTime(event.startsAt)}–{formatTime(event.endsAt)}
            </div>
            {event.location && (
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <MapPin size={12} />
                {event.location}
              </div>
            )}
          </div>
          <EventActionsMenu eventId={event.id} />
        </div>
      </div>

      <EventTabs eventId={params.id} />

      {/* Uitnodigingslink */}
      {event.isPublic && event.slug && (
        <div className="mx-4 mt-4 bg-terra-50 border border-terra-200/60 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={13} className="text-terra-500" />
            <p className="text-xs font-bold text-terra-700 uppercase tracking-wider">Openbare aanmeldlink</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white rounded-xl border border-terra-200/40 px-3 py-2 overflow-hidden">
              <p className="text-xs font-mono text-terra-600 truncate">/e/{event.slug}</p>
            </div>
            <ShareEventButton slug={event.slug} />
            <Link
              href={`/e/${event.slug}`}
              target="_blank"
              className="flex items-center justify-center w-9 h-9 bg-white rounded-xl border border-terra-200/40 hover:bg-terra-50 transition-colors shrink-0"
            >
              <ExternalLink size={13} className="text-terra-500" />
            </Link>
          </div>
          <p className="text-[11px] text-terra-600/70 mt-2 font-medium">
            Deel deze link met deelnemers om zich aan te melden
          </p>
        </div>
      )}

      {!event.isPublic && (
        <div className="mx-4 mt-4 bg-sand/50 border border-sand rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <Globe size={13} className="text-ink-muted" />
            <p className="text-xs font-semibold text-ink-muted">Evenement is niet openbaar</p>
          </div>
          <p className="text-[11px] text-ink-muted/70 mt-1">Zet het evenement openbaar om een aanmeldlink te genereren</p>
        </div>
      )}

      {/* Programme */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-ink">Dagschema</h2>
          <button className="flex items-center gap-1 text-xs text-ink-muted border border-sand rounded-lg px-2.5 py-1.5">
            <Filter size={12} />
            Filter
          </button>
        </div>

        <div className="pb-8 space-y-2">
          {eventSessions.length === 0 ? (
            <div className="py-10 text-center text-ink-muted">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm mb-1">Nog geen sessies gepland</p>
              <p className="text-xs opacity-60">Voeg hieronder je eerste sessie toe</p>
            </div>
          ) : (
            eventSessions.map((session) => {
              const isPast = new Date(session.endsAt) < now;
              return <SessionCard key={session.id} session={session} isPast={isPast} />;
            })
          )}

          <AddSessionForm
            eventId={event.id}
            eventStartsAt={event.startsAt.toISOString()}
          />
        </div>
      </div>

      {/* E-mail acties */}
      <div className="px-4 pb-4">
        <EmailActionsPanel
          eventId={event.id}
          reminderSentAt={event.reminderSentAt ?? null}
          thankYouSentAt={event.thankYouSentAt ?? null}
          surveyEnabled={event.surveyEnabled ?? false}
          eventSlug={event.slug ?? ""}
        />
      </div>

      {/* Custom inschrijfvragen */}
      <div className="px-4 pb-8">
        <CustomFieldsManager eventId={event.id} />
      </div>

    </div>
  );
}
