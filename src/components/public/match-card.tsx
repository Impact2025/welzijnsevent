"use client";

import { useState } from "react";
import { Check, X, Sparkles } from "lucide-react";

interface Match {
  id:     string;
  score:  number | null;
  reason: string | null;
  status: string | null;
  other:  { id: string; name: string; organization: string | null; role: string | null } | null;
}

interface Props {
  match:         Match;
  attendeeToken: string;
  primaryColor:  string;
}

export function MatchCard({ match, attendeeToken, primaryColor }: Props) {
  const [status,  setStatus]  = useState(match.status ?? "suggested");
  const [loading, setLoading] = useState(false);

  async function respond(newStatus: "accepted" | "declined") {
    setLoading(true);
    try {
      const res = await fetch(`/api/network-matches/${match.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ attendeeToken, status: newStatus }),
      });
      if (res.ok) setStatus(newStatus);
    } finally {
      setLoading(false);
    }
  }

  if (status === "declined") return null;

  const other = match.other;
  if (!other) return null;

  const initials = other.name
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const scorePercent = match.score ? Math.round(match.score * 100) : null;

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        status === "accepted" ? "border-green-200 bg-green-50/40" : "border-sand bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-ink">{other.name}</p>
            {status === "accepted" && (
              <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                Match!
              </span>
            )}
            {scorePercent && (
              <span className="text-[9px] font-bold text-ink-muted ml-auto">
                {scorePercent}% match
              </span>
            )}
          </div>
          {other.organization && (
            <p className="text-xs text-ink-muted">{other.organization}</p>
          )}
          {other.role && (
            <p className="text-xs text-ink-muted/70">{other.role}</p>
          )}
          {match.reason && (
            <div className="flex items-start gap-1.5 mt-2 bg-amber-50 rounded-xl px-3 py-2">
              <Sparkles size={11} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed">{match.reason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions — only show for suggested */}
      {status === "suggested" && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => respond("accepted")}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Check size={13} strokeWidth={3} />
            Accepteren
          </button>
          <button
            onClick={() => respond("declined")}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-sand text-xs font-semibold text-ink-muted hover:bg-sand transition-colors disabled:opacity-50"
          >
            <X size={13} />
            Sla over
          </button>
        </div>
      )}

      {status === "accepted" && (
        <p className="text-xs text-green-700 font-medium mt-2 text-center">
          Zoek {other.name} op het event! 👋
        </p>
      )}
    </div>
  );
}
