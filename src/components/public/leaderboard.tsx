"use client";

import { useEffect, useState } from "react";
import { Trophy, Loader2 } from "lucide-react";
import { getInitials, avatarColor, cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank:         number;
  attendeeId:   string;
  name:         string;
  organization: string | null;
  points:       number;
  badgeIcons:   string[];
}

interface Props {
  eventId:      string;
  primaryColor: string;
}

const RANK_STYLES = [
  "bg-yellow-50 border-yellow-200 text-yellow-700", // 1st
  "bg-gray-50  border-gray-200  text-gray-500",     // 2nd
  "bg-orange-50 border-orange-200 text-orange-600", // 3rd
];

const RANK_EMOJIS = ["🥇", "🥈", "🥉"];

export function Leaderboard({ eventId, primaryColor }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/gamification/leaderboard?eventId=${eventId}`)
      .then(r => r.json())
      .then(d => setEntries(d.leaderboard ?? []))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 size={20} className="animate-spin text-gray-300" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400">
        <Trophy size={28} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm font-semibold">Nog geen punten verdiend</p>
        <p className="text-xs mt-0.5 opacity-70">Check in om als eerste op het scorebord te komen!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const isTop3 = entry.rank <= 3;
        return (
          <div
            key={entry.attendeeId}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
              isTop3 ? RANK_STYLES[entry.rank - 1] : "bg-white border-gray-100"
            }`}
          >
            {/* Rank */}
            <div className="w-8 text-center shrink-0">
              {isTop3 ? (
                <span className="text-lg">{RANK_EMOJIS[entry.rank - 1]}</span>
              ) : (
                <span className="text-xs font-black text-gray-400">#{entry.rank}</span>
              )}
            </div>

            {/* Avatar */}
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
              avatarColor(entry.name)
            )}>
              {getInitials(entry.name)}
            </div>

            {/* Name + org */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{entry.name}</p>
              {entry.organization && (
                <p className="text-[11px] text-gray-500 truncate">{entry.organization}</p>
              )}
              {entry.badgeIcons.length > 0 && (
                <p className="text-sm mt-0.5 leading-none">{entry.badgeIcons.join(" ")}</p>
              )}
            </div>

            {/* Points */}
            <div className="shrink-0 text-right">
              <p
                className="text-lg font-extrabold tabular-nums leading-none"
                style={{ color: isTop3 ? undefined : primaryColor }}
              >
                {entry.points}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">punten</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
