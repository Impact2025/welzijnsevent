import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db, events, sessions, attendees, sessionRegistrations } from "@/db";
import { eq, and, asc } from "drizzle-orm";
import { ArrowLeft, Calendar } from "lucide-react";
import { SessionAgenda } from "@/components/public/session-agenda";

type Props = {
  params:       { slug: string };
  searchParams: { token?: string };
};

export default async function MijnAgendaPage({ params, searchParams }: Props) {
  const token = searchParams.token;
  if (!token) redirect(`/e/${params.slug}`);

  const [attendee] = await db
    .select()
    .from(attendees)
    .where(eq(attendees.qrCode, token));

  if (!attendee) redirect(`/e/${params.slug}`);

  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, params.slug), eq(events.id, attendee.eventId)));

  if (!event) notFound();

  const primaryColor = event.websiteColor ?? "#C8522A";

  const eventSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.eventId, event.id))
    .orderBy(asc(sessions.sortOrder), asc(sessions.startsAt));

  const registrations = await db
    .select({ sessionId: sessionRegistrations.sessionId })
    .from(sessionRegistrations)
    .where(eq(sessionRegistrations.attendeeId, attendee.id));

  const registeredIds = registrations.map(r => r.sessionId).filter(Boolean) as string[];
  const registeredCount = registeredIds.length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 pt-10 pb-6 text-white" style={{ backgroundColor: primaryColor }}>
        <Link
          href={`/e/${params.slug}/mijn-ticket?token=${token}`}
          className="inline-flex items-center gap-1.5 text-white/70 text-sm mb-5 hover:text-white"
        >
          <ArrowLeft size={15} />
          Mijn ticket
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Calendar size={16} className="text-white/70" />
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">Mijn agenda</p>
        </div>
        <h1 className="text-xl font-bold">{event.title}</h1>
        <p className="text-white/70 text-sm mt-1">
          {registeredCount > 0
            ? `${registeredCount} sessie${registeredCount !== 1 ? "s" : ""} geselecteerd`
            : "Klik op een sessie om hem toe te voegen"}
        </p>
      </div>

      <div className="max-w-sm mx-auto px-4 py-5 pb-24">
        <SessionAgenda
          sessions={eventSessions}
          registeredIds={registeredIds}
          attendeeToken={token}
          primaryColor={primaryColor}
        />
      </div>
    </div>
  );
}
