import { db, attendees, events } from "@/db";
import { eq, and, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";

export default async function BadgesPage({
  params,
}: {
  params: { id: string };
}) {
  const [event] = await db.select().from(events).where(eq(events.id, params.id));
  if (!event) notFound();

  const rows = await db
    .select()
    .from(attendees)
    .where(and(eq(attendees.eventId, params.id), ne(attendees.status, "afwezig")));

  // Generate QR data URLs for all attendees
  const badgeData = await Promise.all(
    rows.map(async (a) => {
      const qrDataUrl = a.qrCode
        ? await QRCode.toDataURL(a.qrCode, {
            width: 120,
            margin: 1,
            color: { dark: "#1C1814", light: "#FFFFFF" },
          })
        : null;
      return { ...a, qrDataUrl };
    })
  );

  return (
    <>
      {/* Print toolbar — hidden when printing */}
      <div className="no-print bg-white border-b border-sand px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/events/${params.id}/deelnemers`}
            className="flex items-center gap-1.5 text-ink-muted text-sm hover:text-ink"
          >
            <ArrowLeft size={16} />
            Deelnemers
          </Link>
          <span className="text-ink-muted">/</span>
          <span className="font-semibold text-ink text-sm">Naamplaatjes</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted">{badgeData.length} naamplaatjes</span>
          <button
            onClick={undefined}
            id="print-btn"
            className="flex items-center gap-2 bg-terra-500 hover:bg-terra-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
          >
            <Printer size={14} />
            Afdrukken
          </button>
        </div>
      </div>

      {/* Print button script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('print-btn').addEventListener('click', function() {
              window.print();
            });
          `,
        }}
      />

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: white; }
          .badge-grid {
            display: grid;
            grid-template-columns: repeat(2, 9cm);
            gap: 0.5cm;
            padding: 1cm;
          }
        }
        @media screen {
          .badge-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
            padding: 24px;
            max-width: 1000px;
            margin: 0 auto;
          }
        }
      `}</style>

      {badgeData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-ink-muted">
          <p className="font-semibold mb-1">Geen deelnemers</p>
          <p className="text-sm">Er zijn nog geen aangemelde deelnemers.</p>
        </div>
      ) : (
        <div className="badge-grid">
          {badgeData.map((attendee) => (
            <div
              key={attendee.id}
              style={{
                border: "1px solid #C8522A",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                minHeight: "120px",
                pageBreakInside: "avoid",
                breakInside: "avoid",
              }}
            >
              {/* QR code */}
              {attendee.qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={attendee.qrDataUrl}
                  alt="QR"
                  style={{ width: 80, height: 80, flexShrink: 0 }}
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    flexShrink: 0,
                    background: "#F0E8DC",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "#5C5248",
                  }}
                >
                  Geen QR
                </div>
              )}

              {/* Name / info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1C1814",
                    margin: "0 0 4px",
                    wordBreak: "break-word",
                  }}
                >
                  {attendee.name}
                </p>
                {attendee.role && (
                  <p style={{ fontSize: 12, color: "#5C5248", margin: "0 0 2px" }}>
                    {attendee.role}
                  </p>
                )}
                {attendee.organization && (
                  <p style={{ fontSize: 11, color: "#5C5248", margin: 0 }}>
                    {attendee.organization}
                  </p>
                )}
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#C8522A",
                    marginTop: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {event.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
