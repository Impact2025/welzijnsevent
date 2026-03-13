import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { db, events, orders, attendees } from "@/db";
import { eq } from "drizzle-orm";
import nlDict from "@/i18n/nl.json";
import enDict from "@/i18n/en.json";
import { OrderPoller } from "@/components/public/order-poller";

type Dict = typeof nlDict;
function getDict(lang: string | undefined): Dict {
  return lang === "en" ? enDict : nlDict;
}

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { lang?: string; orderId?: string; token?: string };
}) {
  const t = getDict(searchParams.lang);

  const [event] = await db.select().from(events).where(eq(events.slug, params.slug));
  const primaryColor = event?.websiteColor ?? "#C8522A";
  const langParam = searchParams.lang === "en" ? "?lang=en" : "";

  // Token from free registration (direct)
  let token = searchParams.token;

  // For paid tickets: try to resolve token from order immediately
  // (webhook may already have fired by the time the user is redirected back)
  if (!token && searchParams.orderId) {
    const [order] = await db
      .select({ attendeeId: orders.attendeeId, status: orders.status })
      .from(orders)
      .where(eq(orders.id, searchParams.orderId));

    if (order?.attendeeId) {
      const [attendee] = await db
        .select({ qrCode: attendees.qrCode })
        .from(attendees)
        .where(eq(attendees.id, order.attendeeId));
      token = attendee?.qrCode ?? undefined;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-sm w-full space-y-5">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <CheckCircle2 size={36} style={{ color: primaryColor }} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t.success_title}</h1>
          <p className="text-sm text-gray-500 mt-2">{t.success_subtitle}</p>
        </div>
        {event && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-left">
            <p className="text-xs text-gray-400 mb-1">Event</p>
            <p className="text-sm font-semibold text-gray-900">{event.title}</p>
          </div>
        )}

        {/* If token is available immediately, show ticket button */}
        {token ? (
          <Link
            href={`/e/${params.slug}/mijn-ticket?token=${token}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-md transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            🎟️ Bekijk mijn ticket
          </Link>
        ) : searchParams.orderId ? (
          /* Paid ticket: poll until webhook fires and attendee is created */
          <OrderPoller
            orderId={searchParams.orderId}
            slug={params.slug}
            primaryColor={primaryColor}
          />
        ) : null}

        <Link
          href={`/e/${params.slug}${langParam}`}
          className={`block w-full py-3 rounded-2xl font-semibold text-sm transition-colors border ${
            token ? "border-gray-200 text-gray-600 hover:bg-gray-100" : "text-white hover:opacity-90"
          }`}
          style={token ? {} : { backgroundColor: primaryColor }}
        >
          {t.back_to_event}
        </Link>
      </div>
    </div>
  );
}
