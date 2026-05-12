import { db, events, volunteerVacancies, vacancyApplications, volunteerProfiles, organizations } from "@/db";
import { eq, and, inArray, desc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { ArrowLeft, HandHeart } from "lucide-react";
import { PipelineBoard } from "@/components/vrijwilligers/PipelineBoard";

async function getOrgId(userId: string) {
  const [org] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.userId, userId))
    .limit(1);
  return org?.id ?? null;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const [event] = await db.select({ title: events.title }).from(events).where(eq(events.id, params.id));
  return { title: `Pipeline — ${event?.title ?? "Evenement"} — Bijeen` };
}

export type PipelineApplication = {
  id:            string;
  status:        string;
  motivation:    string | null;
  internalNotes: string | null;
  appliedAt:     string | null;
  volunteerName:  string;
  volunteerEmail: string;
  volunteerPhone: string | null;
  volunteerSkills: string[];
  vacancyId:     string;
  vacancyTitle:  string;
  vacancyCategory: string;
};

export default async function PipelinePage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [event] = await db.select().from(events).where(eq(events.id, params.id));
  if (!event) notFound();

  const orgId = await getOrgId(session.user.id);
  if (!orgId) redirect("/onboarding");

  // All vacancies for this event
  const vacancies = await db
    .select()
    .from(volunteerVacancies)
    .where(and(
      eq(volunteerVacancies.eventId, params.id),
      eq(volunteerVacancies.organizationId, orgId),
    ))
    .orderBy(desc(volunteerVacancies.createdAt));

  const vacancyIds = vacancies.map((v) => v.id);
  const vacancyMap = new Map(vacancies.map((v) => [v.id, v]));

  // All applications for these vacancies
  const appRows = vacancyIds.length > 0
    ? await db
        .select({
          app:     vacancyApplications,
          profile: volunteerProfiles,
        })
        .from(vacancyApplications)
        .leftJoin(volunteerProfiles, eq(vacancyApplications.volunteerProfileId, volunteerProfiles.id))
        .where(inArray(vacancyApplications.vacancyId, vacancyIds))
        .orderBy(desc(vacancyApplications.appliedAt))
    : [];

  const applications: PipelineApplication[] = appRows.map(({ app, profile }) => {
    const vacancy = vacancyMap.get(app.vacancyId);
    return {
      id:              app.id,
      status:          app.status ?? "pending",
      motivation:      app.motivation,
      internalNotes:   app.internalNotes,
      appliedAt:       app.appliedAt?.toISOString() ?? null,
      volunteerName:   profile?.name  ?? "Onbekend",
      volunteerEmail:  profile?.email ?? "",
      volunteerPhone:  profile?.phone ?? null,
      volunteerSkills: (profile?.skills ?? []) as string[],
      vacancyId:       app.vacancyId,
      vacancyTitle:    vacancy?.title    ?? "Vacature",
      vacancyCategory: vacancy?.category ?? "overig",
    };
  });

  const totalPending = applications.filter((a) => a.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="bg-terra-500 text-white px-4 pt-10 pb-5 md:px-7">
        <Link
          href={`/dashboard/events/${params.id}/vacatures`}
          className="inline-flex items-center gap-1.5 text-white/75 text-sm mb-4 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          {event.title}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <HandHeart size={18} />
              Aanmeldingen pipeline
            </h1>
            <p className="text-white/65 text-xs mt-0.5">
              {applications.length} aanmelding{applications.length !== 1 ? "en" : ""}
              {totalPending > 0 && ` · ${totalPending} wachten op review`}
            </p>
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <PipelineBoard initialApplications={applications} eventId={params.id} />
    </div>
  );
}
