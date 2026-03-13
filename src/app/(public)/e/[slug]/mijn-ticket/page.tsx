import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import { db, events, attendees } from "@/db";
import { eq, and } from "drizzle-orm";
import { formatDate, formatTime } from "@/lib/utils";
import { Calendar, MapPin, CalendarPlus, ArrowLeft, CheckCircle2, Clock, Users } from "lucide-react";
import { AttendeeStats } from "@/components/public/attendee-stats";

type Props = {
  params:       { slug: string };
  searchParams: { token?: string };
};

export default async function MijnTicketPage({ params, searchParams }: Props) {
  const token = searchParams.token;
  if (!token) redirect(`/e/${params.slug}`);

  // Look up attendee by QR token
  const [attendee] = await db
    .select()
    .from(attendees)
    .where(eq(attendees.qrCode, token));

  if (!attendee) redirect(`/e/${params.slug}`);

  // Validate attendee belongs to this event
  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, params.slug), eq(events.id, attendee.eventId)));

  if (!event) notFound();

  const primaryColor = event.websiteColor ?? "#C8522A";

  // Generate QR code
  const qrDataUrl = await QRCode.toDataURL(attendee.qrCode!, {
    width:           220,
    margin:          2,
    color: { dark: "#1C1814", light: "#FAF6F0" },
  });

  const isCheckedIn = attendee.status === "ingecheckt";

  return (
    <div className="min-h-screen bg-white" style={{ "--brand": primaryColor } as React.CSSProperties}>
      {/* Header */}
      <div
        className="px-4 pt-10 pb-6 text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <Link
          href={`/e/${params.slug}`}
          className="inline-flex items-center gap-1.5 text-white/70 text-sm mb-5 hover:text-white"
        >
          <ArrowLeft size={15} />
          Terug naar event
        </Link>
        <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Mijn ticket</p>
        <h1 className="text-xl font-bold leading-tight">{attendee.name}</h1>
        {attendee.organization && (
          <p className="text-white/70 text-sm mt-0.5">{attendee.organization}</p>
        )}
      </div>

      <div className="max-w-sm mx-auto px-4 pb-20 space-y-5 pt-5">

        {/* Status banner */}
        {isCheckedIn && (
          <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
            <CheckCircle2 size={18} className="text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-800">Ingecheckt</p>
              {attendee.checkedInAt && (
                <p className="text-xs text-green-600">
                  om {formatTime(attendee.checkedInAt)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* QR code card */}
        <div className="rounded-3xl border border-sand overflow-hidden bg-white shadow-sm">
          <div className="p-6 flex flex-col items-center gap-3">
            <Image src={qrDataUrl} alt="QR code" width={180} height={180} className="rounded-xl" />
            <div className="text-center">
              <p className="text-xs text-ink-muted font-mono tracking-wider">{attendee.qrCode}</p>
              <p className="text-xs text-ink-muted mt-0.5">Toon dit bij de ingang</p>
            </div>
          </div>

          {/* Event info strip */}
          <div className="border-t border-sand bg-cream px-5 py-4 space-y-2">
            <p className="text-sm font-bold text-ink">{event.title}</p>
            <div className="flex flex-wrap gap-3 text-xs text-ink-muted">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {formatDate(event.startsAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {formatTime(event.startsAt)}
              </span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {event.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Portal navigation */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/e/${params.slug}/mijn-agenda?token=${token}`}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-sand bg-white hover:border-terra-300 hover:shadow-sm transition-all text-center"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Calendar size={18} style={{ color: primaryColor }} />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Mijn agenda</p>
              <p className="text-[11px] text-ink-muted">Sessies kiezen</p>
            </div>
          </Link>

          <Link
            href={`/e/${params.slug}/mijn-matches?token=${token}`}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-sand bg-white hover:border-terra-300 hover:shadow-sm transition-all text-center"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Users size={18} style={{ color: primaryColor }} />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Mijn matches</p>
              <p className="text-[11px] text-ink-muted">Netwerken</p>
            </div>
          </Link>
        </div>

        {/* Points + badges */}
        <AttendeeStats attendeeToken={token} primaryColor={primaryColor} />

        {/* Add to calendar */}
        <a
          href={`/api/public/events/${params.slug}/ical`}
          download
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed text-sm font-medium transition-colors hover:bg-gray-50"
          style={{ borderColor: `${primaryColor}50`, color: primaryColor }}
        >
          <CalendarPlus size={15} />
          Voeg toe aan agenda
        </a>
      </div>
    </div>
  );
}
