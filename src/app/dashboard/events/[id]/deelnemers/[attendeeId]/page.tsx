import { db, attendees, events } from "@/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Building2, Briefcase, QrCode } from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";
import { formatDate, getInitials, avatarColor, cn } from "@/lib/utils";

export default async function AttendeeDetailPage({
  params,
}: {
  params: { id: string; attendeeId: string };
}) {
  const [attendee] = await db
    .select()
    .from(attendees)
    .where(eq(attendees.id, params.attendeeId));

  if (!attendee) notFound();

  const [event] = await db.select().from(events).where(eq(events.id, params.id));

  const qrDataUrl = attendee.qrCode
    ? await QRCode.toDataURL(attendee.qrCode, {
        width: 256,
        margin: 2,
        color: { dark: "#1C1814", light: "#FAF6F0" },
      })
    : null;

  const statusConfig: Record<string, { label: string; className: string }> = {
    ingecheckt: { label: "Ingecheckt", className: "badge-ingecheckt" },
    aangemeld:  { label: "Aangemeld",  className: "badge-aangemeld"  },
    afwezig:    { label: "Afwezig",    className: "badge-afwezig"    },
  };
  const statusInfo = statusConfig[attendee.status ?? "aangemeld"] ?? statusConfig.aangemeld;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-terra-500 text-white px-4 pt-10 pb-8">
        <Link
          href={`/dashboard/events/${params.id}/deelnemers`}
          className="flex items-center gap-1 text-white/70 text-sm mb-5 hover:text-white"
        >
          <ArrowLeft size={16} />
          Deelnemers
        </Link>

        <div className="flex flex-col items-center text-center">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3",
            avatarColor(attendee.name)
          )}>
            {getInitials(attendee.name)}
          </div>
          <h1 className="text-xl font-bold mb-1">{attendee.name}</h1>
          <span className={statusInfo.className}>{statusInfo.label}</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Info card */}
        <div className="card-base overflow-hidden">
          {[
            { icon: <Mail size={15} />,      label: "E-mail",       value: attendee.email },
            { icon: <Building2 size={15} />, label: "Organisatie",  value: attendee.organization },
            { icon: <Briefcase size={15} />, label: "Rol",          value: attendee.role },
          ].filter(r => r.value).map(row => (
            <div key={row.label} className="flex items-center gap-3 px-4 py-3 border-b border-sand last:border-0">
              <div className="text-ink-muted shrink-0">{row.icon}</div>
              <div>
                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{row.label}</p>
                <p className="text-sm text-ink">{row.value}</p>
              </div>
            </div>
          ))}
          {attendee.checkedInAt && (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="text-ink-muted shrink-0">✓</div>
              <div>
                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Ingecheckt op</p>
                <p className="text-sm text-ink">{formatDate(attendee.checkedInAt, "d MMMM yyyy, HH:mm")}</p>
              </div>
            </div>
          )}
        </div>

        {/* QR Code card */}
        {qrDataUrl ? (
          <div className="card-base p-5">
            <div className="flex items-center gap-2 mb-4">
              <QrCode size={16} className="text-terra-500" />
              <h2 className="font-bold text-ink text-sm">QR Check-in Code</h2>
            </div>
            <div className="flex justify-center mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt={`QR code voor ${attendee.name}`}
                className="w-48 h-48 rounded-xl"
              />
            </div>
            <div className="flex gap-3">
              <a
                href={qrDataUrl}
                download={`qr-${attendee.name.replace(/\s+/g, "-").toLowerCase()}.png`}
                className="flex-1 bg-terra-500 hover:bg-terra-600 text-white text-sm font-bold py-2.5 rounded-xl text-center transition-colors"
              >
                Download QR
              </a>
              <button className="flex-1 bg-sand hover:bg-sand/70 text-ink text-sm font-bold py-2.5 rounded-xl transition-colors">
                Stuur per e-mail
              </button>
            </div>
          </div>
        ) : (
          <div className="card-base p-5 text-center text-ink-muted">
            <p className="text-sm">Geen QR code beschikbaar</p>
          </div>
        )}

        {/* Check-in action */}
        {attendee.status !== "ingecheckt" && (
          <div className="card-base p-4">
            <p className="text-xs text-ink-muted mb-3">Handmatig inchecken</p>
            <form action={`/api/checkin`} method="POST">
              <input type="hidden" name="attendeeId" value={attendee.id} />
              <input type="hidden" name="eventId" value={params.id} />
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-sm transition-colors"
              >
                Inchecken
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
