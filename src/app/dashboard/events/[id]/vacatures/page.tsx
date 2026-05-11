import { db, events, volunteerVacancies, organizations } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EventTabs } from "@/components/events/event-tabs";
import {
  Plus, HandHeart, Users, Clock, MapPin,
  ChevronRight, ToggleLeft, ToggleRight,
} from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  begeleiding:  "Begeleiding",
  registratie:  "Registratie",
  catering:     "Catering",
  techniek:     "Techniek",
  veiligheid:   "Veiligheid",
  communicatie: "Communicatie",
  decoratie:    "Decoratie",
  vervoer:      "Vervoer",
  kinderhoek:   "Kinderhoek",
  overig:       "Overig",
};

const CATEGORY_COLORS: Record<string, string> = {
  begeleiding:  "bg-blue-50 text-blue-700 border-blue-200",
  registratie:  "bg-purple-50 text-purple-700 border-purple-200",
  catering:     "bg-orange-50 text-orange-700 border-orange-200",
  techniek:     "bg-gray-100 text-gray-700 border-gray-200",
  veiligheid:   "bg-red-50 text-red-700 border-red-200",
  communicatie: "bg-sky-50 text-sky-700 border-sky-200",
  decoratie:    "bg-pink-50 text-pink-700 border-pink-200",
  vervoer:      "bg-yellow-50 text-yellow-700 border-yellow-200",
  kinderhoek:   "bg-green-50 text-green-700 border-green-200",
  overig:       "bg-sand text-ink-muted border-sand",
};

const STATUS_CONFIG = {
  draft:     { label: "Concept",    cls: "bg-gray-100 text-gray-600 border-gray-200" },
  open:      { label: "Open",       cls: "bg-green-50 text-green-700 border-green-200" },
  closed:    { label: "Gesloten",   cls: "bg-orange-50 text-orange-700 border-orange-200" },
  cancelled: { label: "Geannuleerd",cls: "bg-red-50 text-red-600 border-red-200" },
} as const;

async function getOrgId(userId: string) {
  const [org] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.userId, userId))
    .limit(1);
  return org?.id ?? null;
}

export default async function VacaturesPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [event] = await db.select().from(events).where(eq(events.id, params.id));
  if (!event) notFound();

  const orgId = await getOrgId(session.user.id);
  const vacancies = orgId
    ? await db
        .select()
        .from(volunteerVacancies)
        .where(and(
          eq(volunteerVacancies.eventId, params.id),
          eq(volunteerVacancies.organizationId, orgId)
        ))
        .orderBy(desc(volunteerVacancies.createdAt))
    : [];

  const openCount   = vacancies.filter((v) => v.status === "open").length;
  const totalSpots  = vacancies
    .filter((v) => v.status === "open")
    .reduce((s, v) => s + (v.spotsAvailable ?? 0), 0);

  return (
    <div className="w-full md:max-w-4xl md:mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-terra-500 text-white px-4 pt-10 pb-6">
        <Link
          href={`/dashboard/events/${params.id}`}
          className="inline-flex items-center gap-1.5 text-white/80 text-sm mb-4 hover:text-white"
        >
          ← {event.title}
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <HandHeart size={20} />
              Vrijwilligersvacatures
            </h1>
            <p className="text-white/70 text-xs mt-0.5">
              {vacancies.length === 0
                ? "Nog geen vacatures aangemaakt"
                : `${openCount} open · ${totalSpots} plekken beschikbaar`}
            </p>
          </div>
          <Link
            href={`/dashboard/events/${params.id}/vacatures/new`}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-3 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} />
            Nieuw
          </Link>
        </div>
      </div>

      <EventTabs eventId={params.id} eventType={event.eventType} />

      <div className="px-4 py-6 pb-24">
        {vacancies.length === 0 ? (
          /* Empty state */
          <div className="py-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-terra-50 border border-terra-100 flex items-center justify-center mb-4">
              <HandHeart size={28} className="text-terra-400" />
            </div>
            <h2 className="text-base font-bold text-ink mb-1">Maak je eerste vacature aan</h2>
            <p className="text-sm text-ink-muted max-w-xs mb-6">
              Zoek vrijwilligers voor specifieke taken tijdens jouw evenement met
              AI-ondersteuning en een professionele editor.
            </p>
            <Link
              href={`/dashboard/events/${params.id}/vacatures/new`}
              className="inline-flex items-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              <Plus size={16} />
              Vacature aanmaken
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Vacatures",         value: vacancies.length },
                { label: "Open vacatures",    value: openCount },
                { label: "Beschikbare plekken", value: totalSpots },
              ].map(({ label, value }) => (
                <div key={label} className="card-base p-3 text-center">
                  <p className="text-2xl font-bold text-ink">{value}</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Vacancy cards */}
            {vacancies.map((v) => {
              const catCls  = CATEGORY_COLORS[v.category ?? "overig"] ?? CATEGORY_COLORS.overig;
              const catLbl  = CATEGORY_LABELS[v.category ?? "overig"] ?? "Overig";
              const stCfg   = STATUS_CONFIG[v.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;

              return (
                <Link
                  key={v.id}
                  href={`/dashboard/events/${params.id}/vacatures/${v.id}`}
                  className="card-hover flex items-center gap-4 p-4 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${catCls}`}>
                        {catLbl}
                      </span>
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${stCfg.cls}`}>
                        {stCfg.label}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-ink truncate">{v.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] text-ink-muted">
                        <Users size={11} />
                        {v.spotsAvailable} {v.spotsAvailable === 1 ? "plek" : "plekken"}
                      </span>
                      {v.shiftStart && v.shiftEnd && (
                        <span className="flex items-center gap-1 text-[11px] text-ink-muted">
                          <Clock size={11} />
                          {v.shiftStart}–{v.shiftEnd}
                        </span>
                      )}
                      {v.location && (
                        <span className="flex items-center gap-1 text-[11px] text-ink-muted truncate max-w-[120px]">
                          <MapPin size={11} />
                          {v.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-ink-muted/50 group-hover:text-ink-muted transition-colors shrink-0" />
                </Link>
              );
            })}

            <Link
              href={`/dashboard/events/${params.id}/vacatures/new`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-sand text-sm text-ink-muted font-semibold hover:border-terra-300 hover:text-terra-600 transition-colors"
            >
              <Plus size={16} />
              Nog een vacature aanmaken
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
