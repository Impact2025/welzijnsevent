import { db, events, networkMatches, attendees } from "@/db";
import { eq, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Network, Users, Sparkles, MessageSquare } from "lucide-react";
import Link from "next/link";
import { GenerateMatchesButton } from "@/components/netwerk/generate-matches-button";
import { getInitials, avatarColor } from "@/lib/utils";

function parseReason(raw: string | null): { reason: string; starter?: string } {
  if (!raw) return { reason: "" };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.reason) return parsed;
    return { reason: raw };
  } catch {
    return { reason: raw };
  }
}

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 80
      ? "bg-green-500 text-white"
      : pct >= 60
      ? "bg-terra-500 text-white"
      : "bg-amber-400 text-white";
  return (
    <div className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${color}`}>
      {pct}%
    </div>
  );
}

export default async function NetwerkPage({ params }: { params: { id: string } }) {
  const [event] = await db.select().from(events).where(eq(events.id, params.id));
  if (!event) notFound();

  const [{ count: attendeeCount }] = await db
    .select({ count: count() })
    .from(attendees)
    .where(eq(attendees.eventId, params.id));

  const matches = await db
    .select()
    .from(networkMatches)
    .where(eq(networkMatches.eventId, params.id))
    .limit(50);

  const enrichedMatches = await Promise.all(
    matches.map(async (match) => {
      const [attendeeA] = match.attendeeAId
        ? await db.select().from(attendees).where(eq(attendees.id, match.attendeeAId))
        : [];
      const [attendeeB] = match.attendeeBId
        ? await db.select().from(attendees).where(eq(attendees.id, match.attendeeBId))
        : [];
      return { match, attendeeA, attendeeB };
    })
  );

  // Sorteer op score (hoogste eerst)
  enrichedMatches.sort((a, b) => (b.match.score ?? 0) - (a.match.score ?? 0));

  const highMatches = enrichedMatches.filter((m) => (m.match.score ?? 0) >= 0.8);
  const goodMatches = enrichedMatches.filter(
    (m) => (m.match.score ?? 0) >= 0.6 && (m.match.score ?? 0) < 0.8
  );
  const otherMatches = enrichedMatches.filter((m) => (m.match.score ?? 0) < 0.6);

  return (
    <div className="max-w-md md:max-w-2xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-terra-500 text-white px-4 pt-10 pb-5">
        <Link
          href={`/dashboard/events/${params.id}`}
          className="text-white/70 text-sm mb-3 inline-block hover:text-white transition-colors"
        >
          ← {event.title}
        </Link>
        <div className="flex items-center gap-2">
          <Network size={20} />
          <h1 className="text-lg font-bold">AI Netwerk Matches</h1>
        </div>
        <p className="text-white/70 text-xs mt-1">
          {enrichedMatches.length > 0
            ? `${enrichedMatches.length} matches · ${Number(attendeeCount)} deelnemers`
            : `${Number(attendeeCount)} deelnemers · nog geen matches`}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-sand px-4">
        <div className="flex gap-4 overflow-x-auto">
          {[
            { label: "Programma", href: `/dashboard/events/${params.id}` },
            { label: "Deelnemers", href: `/dashboard/events/${params.id}/deelnemers` },
            { label: "Tickets", href: `/dashboard/events/${params.id}/tickets` },
            { label: "Netwerk", href: `/dashboard/events/${params.id}/netwerk`, active: true },
            { label: "Statistieken", href: `/dashboard/events/${params.id}/analytics` },
          ].map((tab) => (
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

      <div className="p-4 pb-28 space-y-5">
        {/* AI Match Generator */}
        <div className="card-base p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-terra-100 flex items-center justify-center">
              <Sparkles size={15} className="text-terra-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">AI-Matching</p>
              <p className="text-xs text-ink-muted">
                Analyseert profielen, rollen en interesses
              </p>
            </div>
          </div>
          <GenerateMatchesButton
            eventId={params.id}
            hasExistingMatches={enrichedMatches.length > 0}
            attendeeCount={Number(attendeeCount)}
          />
        </div>

        {/* Matches */}
        {enrichedMatches.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-terra-50 flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-terra-300" />
            </div>
            <h3 className="font-bold text-ink mb-2">Nog geen matches</h3>
            <p className="text-ink-muted text-sm max-w-xs mx-auto leading-relaxed">
              Klik op &ldquo;Genereer AI Matches&rdquo; om automatisch verbindingen te leggen op basis van deelnemersprofielen.
            </p>
          </div>
        ) : (
          <>
            {highMatches.length > 0 && (
              <MatchGroup
                label="Sterke matches"
                emoji="🔥"
                matches={highMatches}
              />
            )}
            {goodMatches.length > 0 && (
              <MatchGroup
                label="Goede matches"
                emoji="✨"
                matches={goodMatches}
              />
            )}
            {otherMatches.length > 0 && (
              <MatchGroup
                label="Overige matches"
                emoji="🤝"
                matches={otherMatches}
              />
            )}
          </>
        )}
      </div>

      {/* Bottom nav — mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-sand flex justify-around pt-2 pb-safe-nav">
        {[
          { label: "Home", icon: "🏠", href: "/dashboard" },
          { label: "Events", icon: "📅", href: "/dashboard/events" },
          { label: "Netwerk", icon: "🔗", href: "#", active: true },
          { label: "Opties", icon: "⚙️", href: "/dashboard/instellingen" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 text-xs font-medium px-3 py-1 ${
              item.active ? "text-terra-500" : "text-ink-muted"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function MatchGroup({
  label,
  emoji,
  matches,
}: {
  label: string;
  emoji: string;
  matches: { match: { id: string; score: number | null; reason: string | null }; attendeeA: { name: string; organization: string | null } | undefined; attendeeB: { name: string; organization: string | null } | undefined }[];
}) {
  return (
    <div>
      <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2 px-1">
        {emoji} {label}
      </p>
      <div className="space-y-3">
        {matches.map(({ match, attendeeA, attendeeB }) => {
          const { reason, starter } = parseReason(match.reason);
          return (
            <MatchCard
              key={match.id}
              score={match.score ?? 0}
              attendeeA={attendeeA}
              attendeeB={attendeeB}
              reason={reason}
              starter={starter}
            />
          );
        })}
      </div>
    </div>
  );
}

function MatchCard({
  score,
  attendeeA,
  attendeeB,
  reason,
  starter,
}: {
  score: number;
  attendeeA: { name: string; organization: string | null } | undefined;
  attendeeB: { name: string; organization: string | null } | undefined;
  reason: string;
  starter?: string;
}) {
  const nameA = attendeeA?.name ?? "Onbekend";
  const nameB = attendeeB?.name ?? "Onbekend";
  const colorA = avatarColor(nameA);
  const colorB = avatarColor(nameB);

  return (
    <div className="card-base overflow-hidden">
      {/* Attendees row */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3">
          {/* Deelnemer A */}
          <div className="flex-1 min-w-0 text-center">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-1.5 text-white text-sm font-bold"
              style={{ backgroundColor: colorA }}
            >
              {getInitials(nameA)}
            </div>
            <p className="text-xs font-semibold text-ink truncate">{nameA}</p>
            <p className="text-[10px] text-ink-muted truncate leading-tight">
              {attendeeA?.organization ?? ""}
            </p>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="flex items-center gap-1">
              <div className="w-5 h-px bg-sand" />
              <ScoreBadge score={score} />
              <div className="w-5 h-px bg-sand" />
            </div>
            <span className="text-[9px] text-ink-muted font-medium uppercase tracking-wider">
              match
            </span>
          </div>

          {/* Deelnemer B */}
          <div className="flex-1 min-w-0 text-center">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-1.5 text-white text-sm font-bold"
              style={{ backgroundColor: colorB }}
            >
              {getInitials(nameB)}
            </div>
            <p className="text-xs font-semibold text-ink truncate">{nameB}</p>
            <p className="text-[10px] text-ink-muted truncate leading-tight">
              {attendeeB?.organization ?? ""}
            </p>
          </div>
        </div>
      </div>

      {/* Reden */}
      {reason && (
        <div className="mx-3 mb-3 bg-sand/60 rounded-xl px-3 py-2.5">
          <p className="text-xs text-ink leading-relaxed">{reason}</p>
        </div>
      )}

      {/* Gespreksstarter */}
      {starter && (
        <div className="mx-3 mb-3 bg-terra-50 border border-terra-100 rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <MessageSquare size={11} className="text-terra-500" />
            <span className="text-[10px] font-bold text-terra-600 uppercase tracking-wider">
              Gespreksstarter
            </span>
          </div>
          <p className="text-xs text-terra-800 leading-relaxed italic">
            &ldquo;{starter}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
