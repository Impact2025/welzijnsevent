import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db, events, attendees, networkMatches } from "@/db";
import { eq, and, or } from "drizzle-orm";
import { ArrowLeft, Users } from "lucide-react";
import { MatchCard } from "@/components/public/match-card";
import type { Attendee } from "@/db/schema";

type Props = {
  params:       { slug: string };
  searchParams: { token?: string };
};

type EnrichedMatch = {
  id: string;
  score: number | null;
  reason: string | null;
  status: string | null;
  other: Pick<Attendee, "id" | "name" | "organization" | "role"> | null;
};

export default async function MijnMatchesPage({ params, searchParams }: Props) {
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

  // Fetch all matches for this attendee (as A or B)
  const [asA, asB] = await Promise.all([
    db.select().from(networkMatches).where(eq(networkMatches.attendeeAId, attendee.id)),
    db.select().from(networkMatches).where(eq(networkMatches.attendeeBId, attendee.id)),
  ]);

  const allMatches = [...asA, ...asB].filter(m => m.status !== "declined");

  // Enrich with other attendee info
  const enriched: EnrichedMatch[] = await Promise.all(
    allMatches.map(async (match) => {
      const otherId = match.attendeeAId === attendee.id ? match.attendeeBId : match.attendeeAId;
      const [other] = await db
        .select({
          id:           attendees.id,
          name:         attendees.name,
          organization: attendees.organization,
          role:         attendees.role,
          email:        attendees.email,
          interests:    attendees.interests,
          status:       attendees.status,
          qrCode:       attendees.qrCode,
          eventId:      attendees.eventId,
          checkedInAt:  attendees.checkedInAt,
          registeredAt: attendees.registeredAt,
          networkingOptIn: attendees.networkingOptIn,
          emailOptOut:  attendees.emailOptOut,
          customResponses: attendees.customResponses,
        })
        .from(attendees)
        .where(eq(attendees.id, otherId!));
      return { ...match, other: other ?? null };
    })
  );

  const accepted  = enriched.filter(m => m.status === "accepted");
  const suggested = enriched.filter(m => m.status === "suggested");

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
          <Users size={16} className="text-white/70" />
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">Mijn matches</p>
        </div>
        <h1 className="text-xl font-bold">{event.title}</h1>
        <p className="text-white/70 text-sm mt-1">
          {enriched.length === 0
            ? "Nog geen matches gevonden"
            : `${enriched.length} match${enriched.length !== 1 ? "es" : ""} voor jou`}
        </p>
      </div>

      <div className="max-w-sm mx-auto px-4 py-5 pb-24 space-y-6">
        {enriched.length === 0 ? (
          <div className="py-12 text-center text-ink-muted">
            <div className="w-14 h-14 rounded-full bg-sand mx-auto mb-3 flex items-center justify-center text-2xl">
              🤝
            </div>
            <p className="text-sm font-semibold mb-1">Nog geen matches</p>
            <p className="text-xs opacity-60 max-w-xs mx-auto">
              De organisator genereert AI-netwerkmatch&shy;es voor het event. Check later nog eens!
            </p>
          </div>
        ) : (
          <>
            {accepted.length > 0 && (
              <section>
                <p className="text-xs font-black uppercase tracking-widest text-ink-muted mb-3">
                  Bevestigd ({accepted.length})
                </p>
                <div className="space-y-2">
                  {accepted.map(m => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      attendeeToken={token}
                      primaryColor={primaryColor}
                    />
                  ))}
                </div>
              </section>
            )}

            {suggested.length > 0 && (
              <section>
                <p className="text-xs font-black uppercase tracking-widest text-ink-muted mb-3">
                  Nieuwe matches ({suggested.length})
                </p>
                <div className="space-y-2">
                  {suggested.map(m => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      attendeeToken={token}
                      primaryColor={primaryColor}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
