import { db, attendees, events, sessions } from "@/db";
import { eq, asc } from "drizzle-orm";
import { notFound }      from "next/navigation";
import QRCode            from "qrcode";
import Link              from "next/link";
import { formatDate, formatTime, getInitials } from "@/lib/utils";
import {
  Calendar, MapPin, CheckCircle2, Clock,
  Download, ArrowLeft, Zap,
} from "lucide-react";

export default async function TicketPage({ params }: { params: { qrCode: string } }) {
  const [attendee] = await db
    .select()
    .from(attendees)
    .where(eq(attendees.qrCode, params.qrCode));

  if (!attendee) notFound();

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, attendee.eventId));

  if (!event) notFound();

  const eventSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.eventId, event.id))
    .orderBy(asc(sessions.sortOrder));

  const qrDataUrl = await QRCode.toDataURL(attendee.qrCode ?? "", {
    width:  300,
    margin: 2,
    color:  { dark: "#1C1814", light: "#FFFFFF" },
  });

  const primaryColor  = event.websiteColor ?? "#C8522A";
  const isCheckedIn   = attendee.status === "ingecheckt";
  const initials      = getInitials(attendee.name);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-sm mx-auto px-4 py-3 flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            <Zap size={13} className="text-white fill-white" />
          </div>
          <span className="font-extrabold text-sm text-gray-900">Bijeen</span>
          <span className="text-gray-200 ml-auto">·</span>
          <span className="text-xs text-gray-400 font-medium">Mijn Ticket</span>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-4 py-6">
        {/* Ticket card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Hero strip */}
          <div
            className="px-6 pt-6 pb-7 text-white text-center"
            style={{ background: `linear-gradient(145deg, ${primaryColor}, ${primaryColor}AA)` }}
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3">Je ticket</p>
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-3">
              {initials}
            </div>
            <h2 className="text-xl font-extrabold leading-tight">{attendee.name}</h2>
            {attendee.organization && (
              <p className="text-sm text-white/70 mt-0.5">{attendee.organization}</p>
            )}
            {attendee.role && (
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                {attendee.role}
              </span>
            )}
          </div>

          {/* Status badge */}
          <div
            className={`py-2 text-center text-[11px] font-black uppercase tracking-widest ${
              isCheckedIn ? "bg-green-500 text-white" : "bg-orange-50 text-orange-600"
            }`}
          >
            {isCheckedIn ? (
              <span className="flex items-center justify-center gap-1.5">
                <CheckCircle2 size={12} />
                Ingecheckt
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <Clock size={12} />
                Aangemeld · Nog niet ingecheckt
              </span>
            )}
          </div>

          {/* Event info */}
          <div className="px-6 py-4 space-y-2.5 border-b border-dashed border-gray-200">
            <h3 className="text-base font-extrabold text-gray-900">{event.title}</h3>
            {event.tagline && (
              <p className="text-xs text-gray-500 leading-relaxed">{event.tagline}</p>
            )}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={13} style={{ color: primaryColor }} />
                <span>{formatDate(event.startsAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={13} style={{ color: primaryColor }} />
                <span>{formatTime(event.startsAt)} – {formatTime(event.endsAt)}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={13} style={{ color: primaryColor }} />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="px-6 py-6 flex flex-col items-center">
            <div className="bg-white rounded-2xl shadow-inner border border-gray-100 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="QR Code" width={220} height={220} />
            </div>
            <p className="text-[10px] font-mono text-gray-300 mt-3 tracking-widest text-center break-all px-2">
              {attendee.qrCode}
            </p>
            <p className="text-xs text-gray-400 font-medium mt-1.5">
              Laat scannen bij de ingang
            </p>

            <a
              href={qrDataUrl}
              download={`ticket-${attendee.name.replace(/\s/g, "-")}.png`}
              className="mt-4 flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border-2 transition-all hover:opacity-80 active:scale-95"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              <Download size={12} />
              Download QR Code
            </a>
          </div>
        </div>

        {/* Programme teaser */}
        {eventSessions.length > 0 && (
          <div className="mt-5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
              Programma
            </p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {eventSessions.slice(0, 4).map((session) => (
                <div
                  key={session.id}
                  className="flex gap-3 px-4 py-3 border-b border-gray-50 last:border-0"
                >
                  <div className="min-w-[44px] text-right shrink-0">
                    <p className="text-[11px] font-bold text-gray-500">{formatTime(session.startsAt)}</p>
                    <p className="text-[10px] text-gray-300">{formatTime(session.endsAt)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{session.title}</p>
                    {session.speaker && (
                      <p className="text-[11px] text-gray-400 mt-0.5">{session.speaker}</p>
                    )}
                  </div>
                  {session.isLive && (
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 self-start"
                      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                      <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                      Live
                    </div>
                  )}
                </div>
              ))}
              {eventSessions.length > 4 && (
                <div className="py-3 text-center border-t border-gray-50">
                  <p className="text-xs text-gray-400 font-medium">
                    +{eventSessions.length - 4} meer sessies
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="mt-5 flex flex-col gap-2 items-center">
          {event.isPublic && event.slug && (
            <Link
              href={`/e/${event.slug}`}
              className="text-sm font-bold hover:underline"
              style={{ color: primaryColor }}
            >
              Bekijk evenementpagina →
            </Link>
          )}
          {event.isPublic && event.slug && (
            <Link
              href={`/e/${event.slug}/live`}
              className="text-sm font-bold hover:underline"
              style={{ color: primaryColor }}
            >
              Live Q&amp;A &amp; Polls →
            </Link>
          )}
        </div>

        <p className="text-center text-[11px] text-gray-300 font-medium mt-8 mb-2">
          Aangedreven door <span className="font-bold text-gray-400">Bijeen</span>
        </p>
      </div>
    </div>
  );
}
