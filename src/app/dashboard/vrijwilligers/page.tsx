import { db, volunteerProfiles, vacancyApplications } from "@/db";
import { eq, inArray, desc } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  HandHeart, Search, Users, CheckCircle2, Clock, ChevronRight, Sparkles,
} from "lucide-react";
import { getInitials, avatarColor, cn } from "@/lib/utils";
import { VolunteerFilters } from "@/components/vrijwilligers/VolunteerFilters";

export const metadata = { title: "Vrijwilligers — Bijeen" };

const SKILL_COLORS = [
  "bg-blue-50 text-blue-700 border-blue-100",
  "bg-purple-50 text-purple-700 border-purple-100",
  "bg-green-50 text-green-700 border-green-100",
  "bg-orange-50 text-orange-700 border-orange-100",
  "bg-pink-50 text-pink-700 border-pink-100",
];

function skillColor(skill: string) {
  let h = 0;
  for (let i = 0; i < skill.length; i++) h = (h * 31 + skill.charCodeAt(i)) & 0xffffff;
  return SKILL_COLORS[h % SKILL_COLORS.length];
}

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

  return (
    <div className="px-4 py-5 md:px-7 md:py-7 max-w-5xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest">Vrijwilligers</p>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">Vrijwilligerspool</h1>
        <p className="text-sm text-ink-muted mt-0.5">
          {primary.length} vrijwilliger{primary.length !== 1 ? "s" : ""} in jouw pool
        </p>
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

      {/* List */}
      <div className="card-base overflow-hidden">
        {/* Desktop header */}
        <div className="hidden md:grid grid-cols-[2fr_2fr_80px_80px_100px] gap-4 px-5 py-3 border-b border-sand bg-cream/50">
          {["Vrijwilliger", "Skills", "Aanmeldingen", "Geaccepteerd", "Status"].map((h) => (
            <p key={h} className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">{h}</p>
          ))}
        </div>

        {volunteers.length === 0 ? (
          <div className="py-16 text-center">
            <HandHeart size={36} className="mx-auto text-ink-muted/25 mb-3" />
            <p className="text-sm font-semibold text-ink mb-1">
              {primary.length === 0 ? "Nog geen vrijwilligers" : "Geen resultaten"}
            </p>
            <p className="text-xs text-ink-muted">
              {primary.length === 0
                ? "Maak een vacature open — vrijwilligers verschijnen hier zodra ze zich aanmelden"
                : "Pas de filters aan om meer vrijwilligers te zien"}
            </p>
          </div>
        ) : (
          volunteers.map((v) => {
            const initials = getInitials(v.name);
            const color    = avatarColor(v.name);
            const hasPending = v.applicationsPending > 0;

            return (
              <Link
                key={v.email}
                href={`/dashboard/vrijwilligers/${encodeURIComponent(v.email)}`}
                className="flex md:grid md:grid-cols-[2fr_2fr_80px_80px_100px] gap-3 md:gap-4 items-center px-4 md:px-5 py-3.5 hover:bg-cream/60 transition-colors border-b border-sand/40 last:border-0 group"
              >
                {/* Avatar + name */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-ink truncate group-hover:text-terra-500 transition-colors leading-tight">
                        {v.name}
                      </p>
                      {hasPending && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-amber-400" title="Wacht op review" />
                      )}
                    </div>
                    <p className="text-[11px] text-ink-muted truncate">{v.email}</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="hidden md:flex flex-wrap gap-1.5 overflow-hidden max-h-6">
                  {v.skills.length === 0 ? (
                    <span className="text-xs text-ink-muted/50">—</span>
                  ) : (
                    v.skills.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", skillColor(s))}
                      >
                        {s}
                      </span>
                    ))
                  )}
                  {v.skills.length > 3 && (
                    <span className="text-[10px] text-ink-muted/60">+{v.skills.length - 3}</span>
                  )}
                </div>

                {/* Aanmeldingen */}
                <div className="hidden md:flex items-center gap-1">
                  <span className="text-sm font-semibold text-ink">{v.applicationsTotal}</span>
                  {hasPending && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                      {v.applicationsPending} nieuw
                    </span>
                  )}
                </div>

                {/* Accepted */}
                <p className="text-sm text-green-700 font-semibold hidden md:block">
                  {v.applicationsAccepted > 0 ? v.applicationsAccepted : "—"}
                </p>

                {/* Status chip + mobile chevron */}
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border shrink-0",
                    v.applicationsAccepted > 0
                      ? "bg-green-50 text-green-700 border-green-200"
                      : hasPending
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-sand text-ink-muted border-sand"
                  )}>
                    {v.applicationsAccepted > 0
                      ? "Actief"
                      : hasPending
                      ? "Review"
                      : "Pool"}
                  </span>
                  <ChevronRight size={14} className="text-ink-muted/40 md:hidden" />
                </div>
              </Link>
            );
          })
        )}
      </div>

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
