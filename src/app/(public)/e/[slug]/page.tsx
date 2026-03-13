import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db, events, sessions, ticketTypes, speakers, sponsors } from "@/db";
import { eq, asc } from "drizzle-orm";
import { formatDate, formatTime } from "@/lib/utils";
import { Calendar, CalendarPlus, MapPin, ExternalLink, Ticket, Share2, Link2 } from "lucide-react";
import { SocialShareButtons } from "@/components/public/social-share-buttons";
import { EventNav } from "@/components/public/event-nav";
import { PushSubscribeButton } from "@/components/public/push-subscribe-button";
import nlDict from "@/i18n/nl.json";
import enDict from "@/i18n/en.json";

type Dict = typeof nlDict;
type Params = { slug: string };
type SearchParams = { lang?: string };

function getDict(lang: string | undefined): Dict {
  return lang === "en" ? enDict : nlDict;
}

export async function generateMetadata(
  { params }: { params: Params }
): Promise<Metadata> {
  const [event] = await db.select().from(events).where(eq(events.slug, params.slug));
  if (!event) return { title: "Event niet gevonden" };
  return {
    title: event.title,
    description: event.tagline ?? event.description ?? undefined,
    openGraph: {
      title: event.title,
      description: event.tagline ?? event.description ?? undefined,
      images: event.coverImage ? [event.coverImage] : [],
    },
  };
}

export default async function PublicEventPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const t = getDict(searchParams.lang);

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.slug, params.slug));

  if (!event || !event.isPublic) notFound();

  const eventSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.eventId, event.id))
    .orderBy(asc(sessions.sortOrder));

  const tickets = await db
    .select()
    .from(ticketTypes)
    .where(eq(ticketTypes.eventId, event.id))
    .orderBy(asc(ticketTypes.sortOrder));

  const eventSpeakers = await db
    .select()
    .from(speakers)
    .where(eq(speakers.eventId, event.id))
    .orderBy(asc(speakers.sortOrder), asc(speakers.createdAt));

  const eventSponsors = await db
    .select()
    .from(sponsors)
    .where(eq(sponsors.eventId, event.id))
    .orderBy(asc(sponsors.sortOrder), asc(sponsors.createdAt));

  const primaryColor = event.websiteColor ?? "#C8522A";
  const minPrice = tickets.length > 0
    ? Math.min(...tickets.filter(t => t.isActive).map(t => t.price))
    : null;

  const langParam = searchParams.lang === "en" ? "?lang=en" : "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";
  const eventUrl = `${appUrl}/e/${params.slug}`;

  // Speakers: prefer DB speakers table, fallback to unique names from sessions
  const sessionSpeakers = eventSessions
    .filter(s => s.speaker)
    .reduce<{ name: string; org: string | null }[]>((acc, s) => {
      if (!acc.find(sp => sp.name === s.speaker)) {
        acc.push({ name: s.speaker!, org: s.speakerOrg ?? null });
      }
      return acc;
    }, []);

  return (
    <div className="min-h-screen bg-white" style={{ "--brand": primaryColor } as React.CSSProperties}>
      {/* Language switcher */}
      <div className="flex justify-end px-4 pt-3 max-w-2xl mx-auto gap-2 text-xs text-gray-500">
        <Link href={`/e/${params.slug}`} className={!searchParams.lang || searchParams.lang === "nl" ? "font-bold underline" : "hover:underline"}>NL</Link>
        <span>/</span>
        <Link href={`/e/${params.slug}?lang=en`} className={searchParams.lang === "en" ? "font-bold underline" : "hover:underline"}>EN</Link>
      </div>

      {/* Hero */}
      <section className="relative w-full animate-fade-in" style={{ animationDelay: "0ms" }}>
        <div className="relative h-56 sm:h-72 w-full overflow-hidden">
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: primaryColor }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
              {event.title}
            </h1>
            {event.tagline && (
              <p className="text-white/85 text-sm sm:text-base">{event.tagline}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                <Calendar size={12} />
                {formatDate(event.startsAt)}
              </span>
              {event.location && (
                <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                  <MapPin size={12} />
                  {event.location}
                </span>
              )}
              <a
                href={`/api/public/events/${params.slug}/ical`}
                download
                className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full hover:bg-white/30 transition-colors"
              >
                <CalendarPlus size={12} />
                {t.add_to_calendar}
              </a>
            </div>

            {/* Push subscribe — floats to the right of the hero chips */}
            <div className="mt-2">
              <PushSubscribeButton
                eventId={event.id}
                eventSlug={params.slug}
                primaryColor="rgba(255,255,255,0.9)"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tab nav */}
      <EventNav slug={params.slug} eventTitle={event.title} primaryColor={primaryColor} />

      {/* Social sharing */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <SocialShareButtons
          url={eventUrl}
          title={event.title}
          primaryColor={primaryColor}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-20 space-y-10">
        {/* About */}
        {event.description && (
          <section className="pt-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">{t.about}</h2>
            <div className="prose prose-sm prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </section>
        )}

        {/* Programme */}
        {eventSessions.length > 0 && (
          <section className="animate-fade-in" style={{ animationDelay: "150ms" }}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t.programme}</h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[62px] top-0 bottom-0 w-px bg-gray-100" />
              <div className="space-y-3">
                {eventSessions.map((session) => (
                  <div key={session.id} className="flex gap-4 relative">
                    {/* Time column */}
                    <div className="w-[52px] flex-shrink-0 text-right pt-3.5">
                      <p className="text-[11px] font-bold text-gray-500 leading-none">{formatTime(session.startsAt)}</p>
                      <p className="text-[10px] text-gray-300 leading-none mt-0.5">{formatTime(session.endsAt)}</p>
                    </div>

                    {/* Dot */}
                    <div className="relative flex-shrink-0 flex items-start pt-4 z-10">
                      <div
                        className="w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: session.isLive ? primaryColor : "#d1d5db" }}
                      />
                      {session.isLive && (
                        <div
                          className="absolute inset-0 rounded-full animate-ping opacity-50"
                          style={{ backgroundColor: primaryColor }}
                        />
                      )}
                    </div>

                    {/* Card */}
                    <div
                      className="flex-1 min-w-0 p-3.5 rounded-xl border transition-colors mb-0.5"
                      style={session.isLive ? { borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}06` } : { borderColor: "#f3f4f6", backgroundColor: "#f9fafb" }}
                    >
                      <div className="flex items-start gap-2 justify-between">
                        <p className="text-sm font-semibold text-gray-900 leading-snug">{session.title}</p>
                        {session.isLive && (
                          <span
                            className="shrink-0 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                          >
                            Live
                          </span>
                        )}
                      </div>
                      {session.description && (
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{session.description}</p>
                      )}
                      {session.speaker && (
                        <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                          {session.speaker}
                          {session.speakerOrg && ` · ${session.speakerOrg}`}
                        </p>
                      )}
                      {session.location && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                          <MapPin size={9} />
                          {session.location}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Speakers — rich cards from DB, fallback to session names */}
        {(eventSpeakers.length > 0 || sessionSpeakers.length > 0) && (
          <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t.speakers}</h2>
            <div className="grid grid-cols-2 gap-3">
              {eventSpeakers.length > 0
                ? eventSpeakers.map((sp) => (
                    <div key={sp.id} className="flex flex-col items-center text-center p-4 rounded-2xl border border-gray-100 bg-gray-50 gap-2">
                      {/* Avatar / Photo */}
                      <div
                        className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {sp.photoUrl ? (
                          <Image
                            src={sp.photoUrl}
                            alt={sp.name}
                            width={56}
                            height={56}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          sp.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 w-full">
                        <p className="text-sm font-bold text-gray-900 truncate">{sp.name}</p>
                        {sp.company && <p className="text-xs text-gray-500 truncate">{sp.company}</p>}
                        {sp.bio && <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{sp.bio}</p>}
                      </div>
                      {sp.linkedinUrl && (
                        <a
                          href={sp.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-medium hover:underline"
                          style={{ color: primaryColor }}
                        >
                          LinkedIn →
                        </a>
                      )}
                    </div>
                  ))
                : sessionSpeakers.map((sp) => (
                    <div key={sp.name} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {sp.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{sp.name}</p>
                        {sp.org && <p className="text-xs text-gray-500 truncate">{sp.org}</p>}
                      </div>
                    </div>
                  ))
              }
            </div>
          </section>
        )}

        {/* Sponsors */}
        {eventSponsors.length > 0 && (
          <section className="animate-fade-in" style={{ animationDelay: "275ms" }}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Sponsors</h2>
            {(["gold", "silver", "bronze"] as const).map((tier) => {
              const tierSponsors = eventSponsors.filter((s) => s.tier === tier);
              if (tierSponsors.length === 0) return null;
              const tierLabels = { gold: "Goud", silver: "Zilver", bronze: "Brons" };
              return (
                <div key={tier} className="mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    {tierLabels[tier]}
                  </p>
                  <div className={`grid gap-3 ${tier === "gold" ? "grid-cols-2" : "grid-cols-3"}`}>
                    {tierSponsors.map((sp) => (
                      <a
                        key={sp.id}
                        href={sp.websiteUrl ?? undefined}
                        target={sp.websiteUrl ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center p-3 rounded-xl border border-gray-100 bg-white transition-colors ${sp.websiteUrl ? "hover:border-gray-200 hover:shadow-sm" : "cursor-default"}`}
                      >
                        {sp.logoUrl ? (
                          <Image
                            src={sp.logoUrl}
                            alt={sp.name}
                            width={tier === "gold" ? 80 : 56}
                            height={tier === "gold" ? 40 : 28}
                            className="object-contain"
                          />
                        ) : (
                          <span className="text-xs font-bold text-gray-500 text-center">{sp.name}</span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Location */}
        {(event.location || event.address) && (
          <section className="animate-fade-in" style={{ animationDelay: "250ms" }}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">{t.location}</h2>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    {event.location && <p className="text-sm font-semibold text-gray-900">{event.location}</p>}
                    {event.address && <p className="text-xs text-gray-500 mt-0.5">{event.address}</p>}
                  </div>
                </div>
                {event.address && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(event.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-xs font-medium hover:underline"
                    style={{ color: primaryColor }}
                  >
                    <ExternalLink size={11} />
                    {t.view_on_maps}
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Add to calendar */}
        <section className="animate-fade-in" style={{ animationDelay: "300ms" }}>
          <a
            href={`/api/public/events/${params.slug}/ical`}
            download
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: `${primaryColor}50`, color: primaryColor }}
          >
            <CalendarPlus size={15} />
            {t.add_to_calendar}
          </a>
        </section>

        {/* Spacer for floating CTA */}
        <div className="h-4" />
      </div>

      {/* Floating register CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pt-4 px-4 pb-safe bg-gradient-to-t from-white via-white/95 to-transparent">
        <div className="max-w-2xl mx-auto">
          <Link
            href={`/e/${params.slug}/register${langParam}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-lg transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: primaryColor }}
          >
            <Ticket size={15} />
            {t.register_now}
            {minPrice !== null && minPrice === 0 && (
              <span className="ml-1 text-xs font-bold opacity-75">· Gratis</span>
            )}
            {minPrice !== null && minPrice > 0 && (
              <span className="ml-1 text-xs font-bold opacity-75">
                · v.a. €{(minPrice / 100).toFixed(2)}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center pb-28">
        <p className="text-xs text-gray-400">
          {t.powered_by}{" "}
          <span className="font-semibold text-gray-600">Bijeen</span>
        </p>
      </footer>
    </div>
  );
}
