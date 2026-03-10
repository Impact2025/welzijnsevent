import { NextRequest, NextResponse } from "next/server";
import { db, surveyResponses, events } from "@/db";
import { eq, avg, count } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/auth";

// GET — survey resultaten voor organisator
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId vereist" }, { status: 400 });

  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event || event.organizationId !== org.id) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const responses = await db
    .select()
    .from(surveyResponses)
    .where(eq(surveyResponses.eventId, eventId));

  const total = responses.length;
  if (total === 0) {
    return NextResponse.json({ total: 0, avgRating: null, avgNps: null, wouldRecommendPct: null, responses: [] });
  }

  const ratings = responses.filter(r => r.overallRating !== null).map(r => r.overallRating!);
  const npsScores = responses.filter(r => r.npsScore !== null).map(r => r.npsScore!);
  const recommends = responses.filter(r => r.wouldRecommend !== null);

  const avgRating = ratings.length > 0
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : null;

  const avgNps = npsScores.length > 0
    ? Math.round((npsScores.reduce((a, b) => a + b, 0) / npsScores.length) * 10) / 10
    : null;

  // NPS: % promoters (9-10) - % detractors (0-6)
  const promoters = npsScores.filter(s => s >= 9).length;
  const detractors = npsScores.filter(s => s <= 6).length;
  const npsScore = npsScores.length > 0
    ? Math.round(((promoters - detractors) / npsScores.length) * 100)
    : null;

  const wouldRecommendPct = recommends.length > 0
    ? Math.round((recommends.filter(r => r.wouldRecommend).length / recommends.length) * 100)
    : null;

  return NextResponse.json({
    total,
    avgRating,
    avgNps,
    npsScore,
    wouldRecommendPct,
    responses: responses.map(r => ({
      id: r.id,
      overallRating: r.overallRating,
      npsScore: r.npsScore,
      highlights: r.highlights,
      improvements: r.improvements,
      wouldRecommend: r.wouldRecommend,
      createdAt: r.createdAt,
    })),
  });
}
