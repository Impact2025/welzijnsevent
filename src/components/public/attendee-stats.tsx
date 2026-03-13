"use client";

import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { BADGES } from "@/lib/gamification";

interface Stats {
  totalPoints: number;
  badges: { id: string; name: string; icon: string; desc: string }[];
  recent: { action: string; points: number; createdAt: string | null }[];
}

const ACTION_LABELS: Record<string, string> = {
  checkin:              "Ingecheckt",
  qa_question:          "Vraag gesteld",
  network_match_accept: "Match geaccepteerd",
  survey_complete:      "Enquête ingevuld",
};

interface Props {
  attendeeToken: string;
  primaryColor:  string;
}

export function AttendeeStats({ attendeeToken, primaryColor }: Props) {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/gamification/attendee?attendeeToken=${encodeURIComponent(attendeeToken)}`)
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [attendeeToken]);

  if (loading) {
    return (
      <div className="py-6 flex justify-center">
        <Loader2 size={18} className="animate-spin text-gray-300" />
      </div>
    );
  }

  if (!stats) return null;

  // Next badge to earn
  const earnedIds = new Set(stats.badges.map(b => b.id));
  const nextBadge = BADGES.find(b => !earnedIds.has(b.id));

  return (
    <div className="space-y-3">
      {/* Points card */}
      <div
        className="rounded-3xl p-5 text-white text-center"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)` }}
      >
        <p className="text-5xl font-extrabold tabular-nums tracking-tight">{stats.totalPoints}</p>
        <p className="text-white/70 text-sm font-semibold mt-1">punten verdiend</p>

        {/* Progress to next badge */}
        {nextBadge && (
          <div className="mt-4 bg-white/15 rounded-2xl px-4 py-3 text-left">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-bold text-white/80">
                Volgende badge: {nextBadge.icon} {nextBadge.name}
              </p>
            </div>
            <p className="text-[11px] text-white/60">{nextBadge.desc}</p>
          </div>
        )}
      </div>

      {/* Badges */}
      {stats.badges.length > 0 ? (
        <div className="rounded-2xl border border-sand bg-white p-4">
          <p className="text-xs font-black uppercase tracking-widest text-ink-muted mb-3">
            Jouw badges ({stats.badges.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {stats.badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-cream border border-sand text-center"
              >
                <span className="text-2xl">{badge.icon}</span>
                <p className="text-[10px] font-bold text-ink leading-tight">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-sand bg-white p-5 text-center">
          <Star size={22} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm font-semibold text-ink-muted">Nog geen badges</p>
          <p className="text-xs text-ink-muted/60 mt-0.5">Check in om je eerste badge te verdienen!</p>
        </div>
      )}

      {/* Recent activity */}
      {stats.recent.length > 0 && (
        <div className="rounded-2xl border border-sand bg-white divide-y divide-sand overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-widest text-ink-muted px-4 py-2.5">
            Recente activiteit
          </p>
          {stats.recent.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2.5">
              <p className="text-xs text-ink font-medium">
                {ACTION_LABELS[item.action] ?? item.action}
              </p>
              <p className="text-xs font-extrabold" style={{ color: primaryColor }}>
                +{item.points}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
