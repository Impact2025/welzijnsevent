import { NextResponse } from "next/server";
import { db, volunteerProfiles, vacancyApplications } from "@/db";
import { eq, inArray, desc } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import { z } from "zod";

const CreateSchema = z.object({
  name:         z.string().min(1).max(200),
  email:        z.string().email().max(320),
  phone:        z.string().max(40).optional().nullable(),
  skills:       z.array(z.string().max(80)).max(20).optional(),
  availability: z.string().max(300).optional().nullable(),
  bio:          z.string().max(1000).optional().nullable(),
});

export async function POST(req: Request) {
  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige invoer", details: parsed.error.flatten() }, { status: 422 });
  }

  const { name, email, phone, skills, availability, bio } = parsed.data;

  // Check for duplicate email within this org
  const existing = await db
    .select({ id: volunteerProfiles.id })
    .from(volunteerProfiles)
    .where(eq(volunteerProfiles.organizationId, org.id))
    .limit(500);
  const existingEmails = new Set(
    (await db.select({ email: volunteerProfiles.email })
      .from(volunteerProfiles)
      .where(eq(volunteerProfiles.organizationId, org.id)))
      .map((r) => r.email.toLowerCase())
  );

  if (existingEmails.has(email.toLowerCase())) {
    return NextResponse.json({ error: "Er bestaat al een vrijwilliger met dit e-mailadres." }, { status: 409 });
  }

  void existing; // suppress unused warning

  let created;
  try {
    [created] = await db.insert(volunteerProfiles).values({
      organizationId: org.id,
      name,
      email,
      phone:        phone ?? null,
      skills:       skills ?? [],
      availability: availability ?? null,
      bio:          bio ?? null,
      status:       "actief",
    }).returning();
  } catch (err) {
    console.error("volunteer insert failed:", err);
    return NextResponse.json({ error: "Database fout bij opslaan" }, { status: 500 });
  }

  if (!created) {
    return NextResponse.json({ error: "Vrijwilliger kon niet worden opgeslagen" }, { status: 500 });
  }

  return NextResponse.json(created, { status: 201 });
}

export async function GET(req: Request) {
  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q      = searchParams.get("q")?.toLowerCase() ?? "";
  const skill  = searchParams.get("skill") ?? "";
  const status = searchParams.get("status") ?? "";

  // All profiles for this org, newest first
  const allProfiles = await db
    .select()
    .from(volunteerProfiles)
    .where(eq(volunteerProfiles.organizationId, org.id))
    .orderBy(desc(volunteerProfiles.updatedAt));

  // Deduplicate by email — keep first (most recent) occurrence per email
  const seen = new Set<string>();
  const primaryProfiles: typeof allProfiles = [];
  const emailToProfileIds = new Map<string, string[]>();

  for (const p of allProfiles) {
    const key = p.email.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      primaryProfiles.push(p);
      emailToProfileIds.set(key, []);
    }
    emailToProfileIds.get(key)!.push(p.id);
  }

  if (primaryProfiles.length === 0) {
    return NextResponse.json({ volunteers: [] });
  }

  const allProfileIds = allProfiles.map((p) => p.id);

  // Application counts per profile ID
  const appRows = await db
    .select({
      volunteerProfileId: vacancyApplications.volunteerProfileId,
      status:             vacancyApplications.status,
      appliedAt:          vacancyApplications.appliedAt,
      vacancyId:          vacancyApplications.vacancyId,
    })
    .from(vacancyApplications)
    .where(inArray(vacancyApplications.volunteerProfileId, allProfileIds));

  // Map profile IDs → emails for aggregation
  const profileIdToEmail = new Map<string, string>();
  emailToProfileIds.forEach((ids, email) => {
    ids.forEach((id) => profileIdToEmail.set(id, email));
  });

  // Aggregate per email
  const emailStats = new Map<string, {
    total: number; accepted: number; pending: number; lastApplied: Date | null;
  }>();
  for (const row of appRows) {
    const email = profileIdToEmail.get(row.volunteerProfileId ?? "") ?? "";
    if (!email) continue;
    const s = emailStats.get(email) ?? { total: 0, accepted: 0, pending: 0, lastApplied: null };
    s.total++;
    if (row.status === "accepted") s.accepted++;
    if (row.status === "pending")  s.pending++;
    const appliedAt = row.appliedAt ? new Date(row.appliedAt) : null;
    if (appliedAt && (!s.lastApplied || appliedAt > s.lastApplied)) s.lastApplied = appliedAt;
    emailStats.set(email, s);
  }

  // Build final volunteer list
  let volunteers = primaryProfiles.map((p) => {
    const key   = p.email.toLowerCase();
    const stats = emailStats.get(key) ?? { total: 0, accepted: 0, pending: 0, lastApplied: null };
    return {
      id:                   p.id,
      email:                p.email,
      name:                 p.name,
      phone:                p.phone,
      skills:               (p.skills ?? []) as string[],
      bio:                  p.bio,
      status:               p.status,
      createdAt:            p.createdAt,
      applicationsTotal:    stats.total,
      applicationsAccepted: stats.accepted,
      applicationsPending:  stats.pending,
      lastApplied:          stats.lastApplied?.toISOString() ?? null,
    };
  });

  // Filters
  if (q) {
    volunteers = volunteers.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.skills.some((s) => s.toLowerCase().includes(q))
    );
  }
  if (skill) {
    volunteers = volunteers.filter((v) =>
      v.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
    );
  }
  if (status === "pending") {
    volunteers = volunteers.filter((v) => v.applicationsPending > 0);
  } else if (status === "accepted") {
    volunteers = volunteers.filter((v) => v.applicationsAccepted > 0);
  } else if (status === "nieuw") {
    volunteers = volunteers.filter((v) => v.applicationsTotal === 0);
  }

  // Sort by most recent activity
  volunteers.sort((a, b) => {
    const aDate = a.lastApplied ?? a.createdAt?.toISOString() ?? "";
    const bDate = b.lastApplied ?? b.createdAt?.toISOString() ?? "";
    return bDate.localeCompare(aDate);
  });

  return NextResponse.json({ volunteers, total: volunteers.length });
}
