"use client";

import { cn } from "@/lib/utils";
import type { Poll } from "@/db/schema";

interface PollWidgetProps {
  poll: Poll;
  onClose?: () => void;
}

type PollOption = { id: string; label: string; votes: number };

export function PollWidget({ poll, onClose }: PollWidgetProps) {
  const options = poll.options as PollOption[];
  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

  const maxVotes = Math.max(...options.map(o => o.votes), 1);

  return (
    <div className="bg-white rounded-xl border border-sand p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider">📊 Live Poll</h4>
        {poll.isActive && onClose && (
          <button
            onClick={onClose}
            className="text-xs font-semibold text-terra-500 hover:text-terra-600 transition-colors"
          >
            Sluit poll
          </button>
        )}
      </div>

      <p className="text-sm font-semibold text-ink mb-3">{poll.question}</p>

      <div className="space-y-2">
        {options.map((option) => {
          const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          const isLeading = option.votes === maxVotes && option.votes > 0;

          return (
            <div key={option.id}>
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-xs font-medium",
                  isLeading ? "text-terra-600 font-semibold" : "text-ink-muted"
                )}>
                  {option.label}
                </span>
                <span className={cn(
                  "text-xs font-bold",
                  isLeading ? "text-terra-600" : "text-ink-muted"
                )}>
                  {pct}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-sand overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    isLeading ? "bg-terra-500" : "bg-green-400"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-ink-muted mt-3 text-right">{totalVotes} stemmen</p>
    </div>
  );
}
