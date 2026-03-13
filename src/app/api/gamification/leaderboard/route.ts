import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/gamification";

// GET /api/gamification/leaderboard?eventId=[id]
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const leaderboard = await getLeaderboard(eventId);
  return NextResponse.json({ leaderboard });
}
