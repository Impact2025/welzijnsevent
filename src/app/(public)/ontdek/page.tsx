import { db, events, organizations } from "@/db";
import { eq, and, gte, asc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Calendar, MapPin, Search, Users, ArrowRight } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import { BijeenWordmark } from "@/components/ui/bijeen-wordmark";

export const metadata: Metadata = {
  title: "Ontdek evenementen | Bijeen",
  description: "Vind en bezoek professionele evenementen in de welzijnssector.",
};

export const revalidate = 60; // ISR: refresh elke minuut

export default async function OntdekPage({
  searchParams,
}: {
  searchParams: { q?: string; when?: string };
}) {
  const q    = searchParams.q?.trim().toLowerCase() ?? "";
  const when = searchParams.when ?? "upcoming";

  const now = new Date();

  const allEvents = await db
    .select({
      id:           events.id,
      title:        events.title,
      tagline:      events.tagline,
      slug:         events.slug,
      location:     events.location,
      startsAt:     events.startsAt,
      endsAt:       events.endsAt,
      coverImage:   events.coverImage,
      maxAttendees: events.maxAttendees,
      status:       events.status,
      orgName:      organizations.name,
      orgLogo:      organizations.logo,
      orgColor:     organizations.primaryColor,
    })
    .from(events)
    .innerJoin(organizations, eq(organizations.id, events.organizationId!))
    .where(
      and(
        eq(events.isPublic, true),
        when === "upcoming"
          ? gte(events.startsAt, now)
          : undefined
      )
    )
    .orderBy(asc(events.startsAt));

  const filtered = allEvents.filter(e => {
    if (!q) return true;
    return (
      e.title.toLowerCase().includes(q) ||
      e.location?.toLowerCase().includes(q) ||
      e.tagline?.toLowerCase().includes(q) ||
      e.orgName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-cream">
      {/* Top nav */}
      <header className="bg-[#12100E] px-5 py-3 flex items-center justify-between">
        <Link href="/">
          <BijeenWordmark variant="light" size="md" />
        </Link>
        <Link
          href="/dashboard"
          className="text-white/60 hover:text-white text-sm font-medium transition-colors"
        >
          Dashboard →
        </Link>
      </header>

      {/* Hero */}
      <div className="bg-terra-500 text-white px-5 py-12 text-center">
        <h1 className="text-3xl font-black mb-2 tracking-tight">
          Ontdek evenementen
        </h1>
        <p className="text-white/80 text-base mb-8 max-w-md mx-auto">
          Professionele bijeenkomsten voor de welzijnssector — vind jouw volgende inspiratie
        </p>

        {/* Search */}
        <form className="max-w-lg mx-auto flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Zoek op naam, locatie of organisatie…"
              className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-ink bg-white outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
          <button
            type="submit"
            className="bg-white/15 hover:bg-white/25 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors border border-white/20"
          >
            Zoeken
          </button>
        </form>

        {/* Filter tabs */}
        <div className="flex justify-center gap-2 mt-5">
          {[
            { label: "Aankomend", value: "upcoming" },
            { label: "Alle",     value: "all"      },
          ].map(tab => (
            <Link
              key={tab.value}
              href={`/ontdek?when=${tab.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                when === tab.value
                  ? "bg-white text-terra-600"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Results */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-5">
          {filtered.length} evenement{filtered.length !== 1 ? "en" : ""} gevonden
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-semibold text-ink mb-1">Geen evenementen gevonden</p>
            <p className="text-sm text-ink-muted">Probeer een andere zoekterm of bekijk alle evenementen</p>
            <Link
              href="/ontdek"
              className="inline-block mt-4 text-terra-600 font-semibold text-sm hover:underline"
            >
              Toon alle evenementen
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map(event => {
              const brand = event.orgColor ?? "#C8522A";
              const isPast = event.endsAt < now;

              return (
                <Link
                  key={event.id}
                  href={`/e/${event.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-sand hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Cover */}
                  <div
                    className="h-36 relative overflow-hidden"
                    style={{ backgroundColor: `${brand}20` }}
                  >
                    {event.coverImage ? (
                      <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${brand}30 0%, ${brand}10 100%)` }}
                      >
                        <span className="text-4xl opacity-30">📅</span>
                      </div>
                    )}
                    {/* Status badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {event.status === "live" && (
                        <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                          Live
                        </span>
                      )}
                      {isPast && (
                        <span className="bg-black/40 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Afgelopen
                        </span>
                      )}
                    </div>
                    {/* Org logo */}
                    {event.orgLogo && (
                      <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white shadow-sm overflow-hidden border border-white">
                        <Image src={event.orgLogo} alt={event.orgName ?? ""} fill className="object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {event.orgName && (
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: brand }}>
                        {event.orgName}
                      </p>
                    )}
                    <h2 className="font-bold text-ink text-base leading-snug mb-1 group-hover:text-terra-600 transition-colors">
                      {event.title}
                    </h2>
                    {event.tagline && (
                      <p className="text-xs text-ink-muted leading-relaxed line-clamp-2 mb-3">
                        {event.tagline}
                      </p>
                    )}

                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                        <Calendar size={11} style={{ color: brand }} />
                        {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                          <MapPin size={11} style={{ color: brand }} />
                          {event.location}
                        </span>
                      )}
                      {event.maxAttendees && (
                        <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                          <Users size={11} style={{ color: brand }} />
                          max {event.maxAttendees} deelnemers
                        </span>
                      )}
                    </div>

                    <div
                      className="mt-3 flex items-center gap-1 text-xs font-bold"
                      style={{ color: brand }}
                    >
                      {isPast ? "Bekijk terugblik" : "Aanmelden"}
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* CTA voor organisatoren */}
        <div className="mt-12 bg-[#12100E] rounded-2xl p-6 text-center text-white">
          <p className="text-sm font-bold text-white/60 uppercase tracking-wider mb-2">Voor organisatoren</p>
          <h3 className="text-lg font-bold mb-2">Zelf een evenement organiseren?</h3>
          <p className="text-white/70 text-sm mb-4">
            Met Bijeen organiseer je professionele evenementen inclusief registratie, QR check-in, live polls en AI-netwerking.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors"
          >
            Gratis starten
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    </div>
  );
}
