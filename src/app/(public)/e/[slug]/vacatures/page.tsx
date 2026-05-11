import { notFound } from "next/navigation";
import Link from "next/link";
import { db, events, volunteerVacancies } from "@/db";
import { eq, and } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import {
  HandHeart, Users, Clock, MapPin, ChevronRight,
  Wrench, Shield, MessageCircle, Baby, Car,
  UtensilsCrossed, ClipboardList, Sparkles, ArrowLeft,
} from "lucide-react";

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  begeleiding:  { label: "Begeleiding",  icon: HandHeart,       bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  registratie:  { label: "Registratie",  icon: ClipboardList,   bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  catering:     { label: "Catering",     icon: UtensilsCrossed, bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  techniek:     { label: "Techniek",     icon: Wrench,          bg: "bg-gray-100",  text: "text-gray-700",   border: "border-gray-200"   },
  veiligheid:   { label: "Veiligheid",   icon: Shield,          bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"    },
  communicatie: { label: "Communicatie", icon: MessageCircle,   bg: "bg-sky-50",    text: "text-sky-700",    border: "border-sky-200"    },
  decoratie:    { label: "Decoratie",    icon: Sparkles,        bg: "bg-pink-50",   text: "text-pink-700",   border: "border-pink-200"   },
  vervoer:      { label: "Vervoer",      icon: Car,             bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  kinderhoek:   { label: "Kinderhoek",   icon: Baby,            bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  overig:       { label: "Overig",       icon: HandHeart,       bg: "bg-sand",      text: "text-ink-muted",  border: "border-sand"       },
};

export default async function PublicVacaturesPage({ params }: { params: { slug: string } }) {
  const [event] = await db.select().from(events).where(eq(events.slug, params.slug));
  if (!event || !event.isPublic) notFound();

  const vacancies = await db
    .select()
    .from(volunteerVacancies)
    .where(and(eq(volunteerVacancies.eventId, event.id), eq(volunteerVacancies.status, "open")));

  const primary = event.websiteColor ?? "#C8522A";
  const totalSpots = vacancies.reduce((s, v) => s + (v.spotsAvailable ?? 0), 0);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="text-white px-4 pt-10 pb-8" style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primary}CC 100%)` }}>
        <Link
          href={`/e/${params.slug}`}
          className="inline-flex items-center gap-1.5 text-white/80 text-sm mb-5 hover:text-white transition-colors"
        >
          <ArrowLeft size={15} />
          Terug naar evenement
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <HandHeart size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Word vrijwilliger</h1>
            <p className="text-white/75 text-sm">{event.title}</p>
          </div>
        </div>
        {vacancies.length > 0 && (
          <p className="text-white/80 text-sm mt-3">
            {vacancies.length} open {vacancies.length === 1 ? "vacature" : "vacatures"} · {totalSpots} {totalSpots === 1 ? "plek" : "plekken"} beschikbaar
          </p>
        )}
      </div>

      <div className="max-w-xl mx-auto px-4 py-6">
        {vacancies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-sand p-10 text-center">
            <HandHeart size={36} className="mx-auto mb-3 text-ink-muted/30" />
            <p className="font-bold text-ink mb-1">Geen openstaande vacatures</p>
            <p className="text-sm text-ink-muted">Er zijn momenteel geen vrijwilligersvacatures voor dit evenement.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-4">
              Openstaande vacatures
            </p>
            {vacancies.map((v) => {
              const cat  = CATEGORY_META[v.category ?? "overig"] ?? CATEGORY_META.overig;
              const Icon = cat.icon;
              return (
                <Link
                  key={v.id}
                  href={`/e/${params.slug}/vacatures/${v.id}`}
                  className="group bg-white rounded-2xl border border-sand hover:border-gray-300 hover:shadow-md transition-all p-4 flex items-center gap-4 block"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cat.bg} ${cat.border} border`}>
                    <Icon size={18} className={cat.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${cat.text}`}>{cat.label}</span>
                    </div>
                    <p className="font-bold text-ink text-sm leading-snug">{v.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] text-ink-muted">
                        <Users size={10} />
                        {v.spotsAvailable} {v.spotsAvailable === 1 ? "plek" : "plekken"}
                      </span>
                      {v.shiftStart && v.shiftEnd && (
                        <span className="flex items-center gap-1 text-[11px] text-ink-muted">
                          <Clock size={10} />
                          {v.shiftStart}–{v.shiftEnd}
                        </span>
                      )}
                      {v.location && (
                        <span className="flex items-center gap-1 text-[11px] text-ink-muted truncate max-w-[120px]">
                          <MapPin size={10} />
                          {v.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-ink-muted/40 group-hover:text-ink-muted transition-colors shrink-0" />
                </Link>
              );
            })}

            <div className="bg-white rounded-2xl border border-sand p-4 mt-2">
              <p className="text-xs text-ink-muted text-center">
                {formatDate(event.startsAt)} · {event.location ?? ""}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
