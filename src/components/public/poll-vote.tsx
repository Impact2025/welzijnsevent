"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PollOption {
  id:    string;
  label: string;
  votes: number;
}

interface Poll {
  id:       string;
  question: string;
  options:  PollOption[];
}

export function PollVote({
  poll,
  primaryColor,
}: {
  poll: Poll;
  primaryColor: string;
}) {
  const [voted, setVoted]     = useState<string | null>(null);
  const [options, setOptions] = useState<PollOption[]>(poll.options);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const totalVotes = options.reduce((s, o) => s + o.votes, 0) + (voted ? 1 : 0);

  async function vote(optionId: string) {
    if (voted || loading) return;
    setVoted(optionId);
    setOptions((prev) =>
      prev.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o))
    );
    setLoading(true);
    try {
      await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Live Poll</p>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
          style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
        >
          Stem mee
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm font-bold text-gray-900 mb-4 leading-snug">{poll.question}</p>

        <div className="space-y-2.5">
          {options.map((option) => {
            const pct      = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
            const isVoted  = voted === option.id;
            const showBars = !!voted;

            return (
              <button
                key={option.id}
                onClick={() => vote(option.id)}
                disabled={!!voted}
                className="w-full text-left relative overflow-hidden rounded-xl border-2 transition-all duration-200 active:scale-[0.98]"
                style={{
                  borderColor: isVoted ? primaryColor : "#e5e7eb",
                }}
              >
                {/* Progress fill */}
                {showBars && (
                  <div
                    className="absolute inset-y-0 left-0 transition-all duration-700 ease-out rounded-[10px]"
                    style={{
                      width:           `${pct}%`,
                      backgroundColor: isVoted ? `${primaryColor}20` : "#f9fafb",
                    }}
                  />
                )}
                <div className="relative flex items-center justify-between px-4 py-3">
                  <span
                    className="text-sm font-semibold transition-colors"
                    style={{ color: isVoted ? primaryColor : "#374151" }}
                  >
                    {option.label}
                  </span>
                  {showBars && (
                    <span
                      className="text-sm font-bold ml-3"
                      style={{ color: isVoted ? primaryColor : "#9ca3af" }}
                    >
                      {pct}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {voted && (
          <p className="text-[11px] text-gray-400 text-center mt-4 font-medium">
            {totalVotes} {totalVotes === 1 ? "stem" : "stemmen"} uitgebracht
          </p>
        )}
        {!voted && (
          <p className="text-[11px] text-gray-400 text-center mt-4 font-medium">
            Tik om te stemmen
          </p>
        )}
      </div>
    </div>
  );
}
