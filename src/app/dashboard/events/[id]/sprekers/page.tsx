import { db, events, speakers } from "@/db";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SpeakersManager } from "@/components/events/speakers-manager";

export default async function SpeakersPage({ params }: { params: { id: string } }) {
  const [event] = await db.select().from(events).where(eq(events.id, params.id));
  if (!event) notFound();

  const eventSpeakers = await db
    .select()
    .from(speakers)
    .where(eq(speakers.eventId, params.id))
    .orderBy(asc(speakers.sortOrder), asc(speakers.createdAt));

  return (
    <div className="max-w-md md:max-w-2xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-terra-500 text-white px-4 pt-10 pb-6">
        <Link
          href={`/dashboard/events/${params.id}`}
          className="inline-flex items-center gap-1.5 text-white/80 text-sm mb-4 hover:text-white"
        >
          <ArrowLeft size={16} />
          {event.title}
        </Link>
        <h1 className="text-lg font-bold">Sprekers</h1>
        <p className="text-white/70 text-xs mt-0.5">
          {eventSpeakers.length === 0
            ? "Nog geen sprekers toegevoegd"
            : `${eventSpeakers.length} spreker${eventSpeakers.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-sand px-4">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {[
            { label: "Programma",    href: `/dashboard/events/${params.id}` },
            { label: "Deelnemers",   href: `/dashboard/events/${params.id}/deelnemers` },
            { label: "Sprekers",     href: `/dashboard/events/${params.id}/sprekers`, active: true },
            { label: "Sponsors",     href: `/dashboard/events/${params.id}/sponsors` },
            { label: "Tickets",      href: `/dashboard/events/${params.id}/tickets` },
            { label: "Netwerk",      href: `/dashboard/events/${params.id}/netwerk` },
            { label: "Statistieken", href: `/dashboard/events/${params.id}/analytics` },
          ].map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                tab.active
                  ? "text-terra-500 border-terra-500"
                  : "text-ink-muted border-transparent hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        <SpeakersManager eventId={params.id} initialSpeakers={eventSpeakers} />
      </div>
    </div>
  );
}
