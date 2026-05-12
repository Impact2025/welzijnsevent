import { db, volunteerProfiles, vacancyApplications, volunteerVacancies, events } from "@/db";
import { eq, inArray, desc, and } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  HandHeart, Users, CheckCircle2, Clock, Sparkles, Plus, FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VolunteerFilters } from "@/components/vrijwilligers/VolunteerFilters";
import { VolunteerList } from "@/components/vrijwilligers/VolunteerList";

export const metadata = { title: "Vrijwilligers — Bijeen" };

export default async function VrijwilligersPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; skill?: string };
}) {
  const org = await getCurrentOrg();
  if (!org) redirect("/onboarding");

  const q      = searchParams.q?.toLowerCase() ?? "";
  const status = searchParams.status ?? "";
  const skill  = searchParams.skill ?? "";

  // All profiles for org, newest first
  const allProfiles = await db
    .select()
    .from(volunteerProfiles)
    .where(eq(volunteerProfiles.organizationId, org.id))
    .orderBy(desc(volunteerProfiles.updatedAt));

  // Deduplicate by email
  const seen = new Set<string>();
  const primary: typeof allProfiles = [];
  const emailToIds = new Map<string, string[]>();

  for (const p of allProfiles) {
    const key = p.email.toLowerCase();
    if (!seen.has(key)) { seen.add(key); primary.push(p); emailToIds.set(key, []); }
    emailToIds.get(key)!.push(p.id);
  }

  // Application stats per profile
  const allIds = allProfiles.map((p) => p.id);
  const appRows = allIds.length > 0
    ? await db
        .select({
          volunteerProfileId: vacancyApplications.volunteerProfileId,
          status:             vacancyApplications.status,
          appliedAt:          vacancyApplications.appliedAt,
        })
        .from(vacancyApplications)
        .where(inArray(vacancyApplications.volunteerProfileId, allIds))
    : [];

  const profileIdToEmail = new Map<string, string>();
  emailToIds.forEach((ids, email) => ids.forEach((id) => profileIdToEmail.set(id, email)));

  const emailStats = new Map<string, { total: number; accepted: number; pending: number; lastApplied: string | null }>();
  for (const row of appRows) {
    const email = profileIdToEmail.get(row.volunteerProfileId ?? "") ?? "";
    if (!email) continue;
    const s = emailStats.get(email) ?? { total: 0, accepted: 0, pending: 0, lastApplied: null };
    s.total++;
    if (row.status === "accepted") s.accepted++;
    if (row.status === "pending")  s.pending++;
    const d = row.appliedAt?.toISOString() ?? null;
    if (d && (!s.lastApplied || d > s.lastApplied)) s.lastApplied = d;
    emailStats.set(email, s);
  }

  type Volunteer = {
    id: string; email: string; name: string; phone: string | null;
    skills: string[]; status: string | null; createdAt: Date | null;
    applicationsTotal: number; applicationsAccepted: number; applicationsPending: number;
    lastApplied: string | null;
  };

  let volunteers: Volunteer[] = primary.map((p) => {
    const key   = p.email.toLowerCase();
    const stats = emailStats.get(key) ?? { total: 0, accepted: 0, pending: 0, lastApplied: null };
    return {
      id: p.id, email: p.email, name: p.name, phone: p.phone,
      skills: (p.skills ?? []) as string[], status: p.status, createdAt: p.createdAt,
      applicationsTotal: stats.total, applicationsAccepted: stats.accepted,
      applicationsPending: stats.pending, lastApplied: stats.lastApplied,
    };
  });

  // Collect all unique skills for the filter bar
  const allSkills = Array.from(new Set(volunteers.flatMap((v) => v.skills))).sort();

  // Apply filters
  if (q) volunteers = volunteers.filter((v) =>
    v.name.toLowerCase().includes(q) ||
    v.email.toLowerCase().includes(q) ||
    v.skills.some((s) => s.toLowerCase().includes(q))
  );
  if (skill) volunteers = volunteers.filter((v) =>
    v.skills.some((s) => s.toLowerCase() === skill.toLowerCase())
  );
  if (status === "pending")  volunteers = volunteers.filter((v) => v.applicationsPending > 0);
  if (status === "accepted") volunteers = volunteers.filter((v) => v.applicationsAccepted > 0);
  if (status === "nieuw")    volunteers = volunteers.filter((v) => v.applicationsTotal === 0);

  // Sort: pending first, then by last activity
  volunteers.sort((a, b) => {
    if (b.applicationsPending !== a.applicationsPending) return b.applicationsPending - a.applicationsPending;
    const aD = a.lastApplied ?? a.createdAt?.toISOString() ?? "";
    const bD = b.lastApplied ?? b.createdAt?.toISOString() ?? "";
    return bD.localeCompare(aD);
  });

  const totalPending  = primary.reduce((s, p) => s + (emailStats.get(p.email.toLowerCase())?.pending ?? 0), 0);
  const totalAccepted = primary.reduce((s, p) => s + (emailStats.get(p.email.toLowerCase())?.accepted ?? 0), 0);

  // Open vacancies for bulk invite
  const openVacs = await db
    .select({ id: volunteerVacancies.id, title: volunteerVacancies.title, eventId: volunteerVacancies.eventId })
    .from(volunteerVacancies)
    .where(and(eq(volunteerVacancies.organizationId, org.id), eq(volunteerVacancies.status, "open")))
    .orderBy(desc(volunteerVacancies.createdAt));

  const openVacancies = await Promise.all(
    openVacs.map(async (v) => {
      const [evt] = await db.select({ title: events.title }).from(events).where(eq(events.id, v.eventId));
      return { id: v.id, title: v.title, eventTitle: evt?.title ?? "" };
    })
  );

  return (
    <div className="px-4 py-5 md:px-7 md:py-7 max-w-5xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest">Mensen</p>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">Vrijwilligers</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Werving & vacatures · {primary.length} in de pool
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-1">
          <Link
            href="/dashboard/vrijwilligers/import"
            className="flex items-center gap-1.5 text-xs font-bold text-ink-muted bg-white border border-sand px-3 py-2 rounded-xl hover:bg-cream transition-colors shadow-sm"
          >
            <FileSpreadsheet size={13} />
            Importeren
          </Link>
          <Link
            href="/dashboard/vrijwilligers/nieuw"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-terra-500 px-3 py-2 rounded-xl hover:bg-terra-600 transition-colors shadow-sm"
          >
            <Plus size={13} />
            Toevoegen
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Totaal",         value: primary.length,  icon: Users,        cls: "text-ink" },
          { label: "Wacht op review",value: totalPending,     icon: Clock,        cls: "text-amber-600" },
          { label: "Geaccepteerd",   value: totalAccepted,    icon: CheckCircle2, cls: "text-green-600" },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="card-base p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Icon size={14} className={cls} />
              <p className="text-[11px] text-ink-muted font-semibold">{label}</p>
            </div>
            <p className={cn("text-2xl font-extrabold", cls)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4">
        <VolunteerFilters allSkills={allSkills} />
      </div>

      {/* List with bulk-select */}
      {primary.length === 0 ? (
        <div className="card-base py-16 text-center">
          <HandHeart size={36} className="mx-auto text-ink-muted/25 mb-3" />
          <p className="text-sm font-semibold text-ink mb-1">Nog geen vrijwilligers</p>
          <p className="text-xs text-ink-muted">
            Maak een vacature open — vrijwilligers verschijnen hier zodra ze zich aanmelden
          </p>
        </div>
      ) : (
        <VolunteerList volunteers={volunteers} openVacancies={openVacancies} />
      )}

      {/* Empty CTA */}
      {primary.length === 0 && (
        <div className="mt-6 card-base p-6 flex items-start gap-4 border-dashed">
          <div className="w-10 h-10 rounded-xl bg-terra-50 border border-terra-100 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-terra-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-ink mb-1">Zo werkt de vrijwilligerspool</p>
            <p className="text-xs text-ink-muted leading-relaxed">
              Zodra iemand zich aanmeldt voor een vacature bij één van jouw evenementen, verschijnt
              hij of zij automatisch in deze pool. Van hieruit kun je hun aanmeldingen beheren,
              berichten sturen en hen uitnodigen voor andere vacatures.
            </p>
            <Link
              href="/dashboard/events"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-terra-600 hover:text-terra-700 transition-colors"
            >
              <HandHeart size={12} />
              Ga naar evenementen en maak een vacature open
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
