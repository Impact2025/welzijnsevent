import { db, attendeePoints, attendeeBadges, attendees } from "@/db";
import { eq, and, sum, count } from "drizzle-orm";
import { sendEventPush } from "@/lib/push";

// ── Point values ──────────────────────────────────────────
export const ACTIONS = {
  CHECKIN:              { key: "checkin",              points: 50 },
  QA_QUESTION:          { key: "qa_question",          points: 15 },
  NETWORK_MATCH_ACCEPT: { key: "network_match_accept", points: 30 },
  SURVEY_COMPLETE:      { key: "survey_complete",      points: 25 },
} as const;

export type ActionKey = (typeof ACTIONS)[keyof typeof ACTIONS]["key"];

// ── Built-in badge definitions ────────────────────────────
export const BADGES = [
  {
    id:        "aanwezig",
    name:      "Aanwezig",
    icon:      "🎯",
    desc:      "Ingecheckt bij het event",
    condition: { type: "action_count" as const, action: "checkin", count: 1 },
  },
  {
    id:        "vraagsteller",
    name:      "Vraagsteller",
    icon:      "💬",
    desc:      "Een vraag gesteld via Q&A",
    condition: { type: "action_count" as const, action: "qa_question", count: 1 },
  },
  {
    id:        "netwerker",
    name:      "Netwerker",
    icon:      "🤝",
    desc:      "Een match geaccepteerd",
    condition: { type: "action_count" as const, action: "network_match_accept", count: 1 },
  },
  {
    id:        "actief",
    name:      "Actief Deelnemer",
    icon:      "⭐",
    desc:      "100 punten verdiend",
    condition: { type: "points_total" as const, threshold: 100 },
  },
  {
    id:        "super_netwerker",
    name:      "Super Netwerker",
    icon:      "🏆",
    desc:      "3 matches geaccepteerd",
    condition: { type: "action_count" as const, action: "network_match_accept", count: 3 },
  },
  {
    id:        "betrokken",
    name:      "Betrokken",
    icon:      "🔥",
    desc:      "200 punten verdiend",
    condition: { type: "points_total" as const, threshold: 200 },
  },
] as const;

export type Badge = (typeof BADGES)[number];

// ── Award points & evaluate badges ────────────────────────
export async function awardPoints(
  attendeeId: string,
  eventId:    string,
  action:     ActionKey,
  points:     number
) {
  await db.insert(attendeePoints).values({ attendeeId, eventId, action, points });
  const newBadges = await evaluateBadges(attendeeId, eventId);

  // Push notification for each newly earned badge
  for (const badge of newBadges) {
    sendEventPush(eventId, {
      title: `${badge.icon} Badge verdiend!`,
      body:  `${badge.name} — ${badge.desc}`,
    }).catch(console.error);
  }
}

// ── Evaluate which new badges the attendee just unlocked ──
async function evaluateBadges(attendeeId: string, eventId: string): Promise<Badge[]> {
  // Already earned
  const earned = await db
    .select({ badgeId: attendeeBadges.badgeId })
    .from(attendeeBadges)
    .where(and(eq(attendeeBadges.attendeeId, attendeeId), eq(attendeeBadges.eventId, eventId)));

  const earnedIds = new Set(earned.map(e => e.badgeId));

  // Count per action
  const actionCounts = await db
    .select({ action: attendeePoints.action, total: count() })
    .from(attendeePoints)
    .where(and(eq(attendeePoints.attendeeId, attendeeId), eq(attendeePoints.eventId, eventId)))
    .groupBy(attendeePoints.action);

  const countByAction: Record<string, number> = {};
  for (const row of actionCounts) countByAction[row.action] = Number(row.total);

  // Total points
  const [totRow] = await db
    .select({ total: sum(attendeePoints.points) })
    .from(attendeePoints)
    .where(and(eq(attendeePoints.attendeeId, attendeeId), eq(attendeePoints.eventId, eventId)));
  const totalPoints = Number(totRow?.total ?? 0);

  // Check each badge
  const newlyEarned: Badge[] = [];
  for (const badge of BADGES) {
    if (earnedIds.has(badge.id)) continue;

    let unlocked = false;
    if (badge.condition.type === "action_count") {
      unlocked = (countByAction[badge.condition.action] ?? 0) >= badge.condition.count;
    } else if (badge.condition.type === "points_total") {
      unlocked = totalPoints >= badge.condition.threshold;
    }

    if (unlocked) {
      await db.insert(attendeeBadges).values({ attendeeId, eventId, badgeId: badge.id });
      newlyEarned.push(badge);
    }
  }

  return newlyEarned;
}

// ── Leaderboard ───────────────────────────────────────────
export async function getLeaderboard(eventId: string, limit = 15) {
  const rows = await db
    .select({
      attendeeId: attendeePoints.attendeeId,
      total:      sum(attendeePoints.points),
    })
    .from(attendeePoints)
    .where(eq(attendeePoints.eventId, eventId))
    .groupBy(attendeePoints.attendeeId)
    .orderBy(sum(attendeePoints.points));

  // Sort desc (Drizzle sum returns strings)
  const sorted = rows
    .map(r => ({ attendeeId: r.attendeeId, total: Number(r.total ?? 0) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);

  if (sorted.length === 0) return [];

  // Enrich with attendee info + badges
  const enriched = await Promise.all(
    sorted.map(async (row, index) => {
      const [attendee] = await db
        .select({ id: attendees.id, name: attendees.name, organization: attendees.organization })
        .from(attendees)
        .where(eq(attendees.id, row.attendeeId));

      const badges = await db
        .select({ badgeId: attendeeBadges.badgeId })
        .from(attendeeBadges)
        .where(and(eq(attendeeBadges.attendeeId, row.attendeeId), eq(attendeeBadges.eventId, eventId)));

      const badgeIcons = badges
        .map(b => BADGES.find(bd => bd.id === b.badgeId)?.icon)
        .filter(Boolean) as string[];

      return {
        rank:         index + 1,
        attendeeId:   row.attendeeId,
        name:         attendee?.name ?? "Onbekend",
        organization: attendee?.organization ?? null,
        points:       row.total,
        badgeIcons,
      };
    })
  );

  return enriched;
}

// ── Get single attendee stats ──────────────────────────────
export async function getAttendeeStats(attendeeId: string, eventId: string) {
  const [totRow] = await db
    .select({ total: sum(attendeePoints.points) })
    .from(attendeePoints)
    .where(and(eq(attendeePoints.attendeeId, attendeeId), eq(attendeePoints.eventId, eventId)));

  const totalPoints = Number(totRow?.total ?? 0);

  const earnedBadges = await db
    .select({ badgeId: attendeeBadges.badgeId })
    .from(attendeeBadges)
    .where(and(eq(attendeeBadges.attendeeId, attendeeId), eq(attendeeBadges.eventId, eventId)));

  const badges = earnedBadges
    .map(b => BADGES.find(bd => bd.id === b.badgeId))
    .filter(Boolean) as Badge[];

  const recent = await db
    .select()
    .from(attendeePoints)
    .where(and(eq(attendeePoints.attendeeId, attendeeId), eq(attendeePoints.eventId, eventId)))
    .orderBy(attendeePoints.createdAt)
    .limit(5);

  return { totalPoints, badges, recent };
}
