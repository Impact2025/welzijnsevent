import Link from "next/link";
import { db, events, volunteerVacancies } from "@/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Check, HandHeart, ArrowLeft, Calendar } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export default async function BevestigingPage({
  params,
}: {
  params: { slug: string; vacancyId: string };
}) {
  const [event] = await db.select().from(events).where(eq(events.slug, params.slug));
  if (!event || !event.isPublic) notFound();

  const [vacancy] = await db
    .select()
    .from(volunteerVacancies)
    .where(eq(volunteerVacancies.id, params.vacancyId));

  const primary = event.websiteColor ?? "#C8522A";

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top strip */}
      <div className="h-2 w-full" style={{ background: primary }} />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          {/* Success icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primary}CC 100%)` }}
          >
            <Check size={36} className="text-white" strokeWidth={3} />
          </div>

          <h1 className="text-2xl font-bold text-ink mb-2">Aanmelding verstuurd!</h1>
          <p className="text-ink-muted text-sm leading-relaxed mb-8">
            Bedankt voor je aanmelding als vrijwilliger. Je ontvangt een bevestiging
            per e-mail. De organisatie neemt zo snel mogelijk contact met je op.
          </p>

          {/* Vacancy summary card */}
          {vacancy && (
            <div className="bg-white rounded-2xl border border-sand p-4 mb-8 text-left">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${primary}20` }}
                >
                  <HandHeart size={15} style={{ color: primary }} />
                </div>
                <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">Jouw aanmelding</p>
              </div>
              <p className="font-bold text-ink text-sm">{vacancy.title}</p>
              <p className="text-xs text-ink-muted mt-1">{event.title}</p>
              {event.startsAt && (
                <p className="text-xs text-ink-muted mt-0.5 flex items-center gap-1">
                  <Calendar size={10} />
                  {formatDate(event.startsAt)}, {formatTime(event.startsAt)}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Link
              href={`/e/${params.slug}/vacatures`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-white font-bold text-sm transition-opacity hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primary}CC 100%)` }}
            >
              <HandHeart size={15} />
              Bekijk meer vacatures
            </Link>
            <Link
              href={`/e/${params.slug}`}
              className="flex items-center justify-center gap-1.5 w-full py-3 rounded-2xl border-2 border-sand text-sm font-semibold text-ink-muted hover:bg-sand transition-colors"
            >
              <ArrowLeft size={14} />
              Terug naar evenement
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
