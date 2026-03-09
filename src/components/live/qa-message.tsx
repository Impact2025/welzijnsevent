"use client";

import { useState } from "react";
import { ThumbsUp, Check, Trash2 } from "lucide-react";
import { formatRelative, cn } from "@/lib/utils";
import type { QAMessage } from "@/db/schema";

interface QAMessageCardProps {
  message: QAMessage;
  onApprove?: (id: string) => void;
  onDelete?: (id: string) => void;
  onUpvote?: (id: string) => void;
}

export function QAMessageCard({ message, onApprove, onDelete, onUpvote }: QAMessageCardProps) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    await onApprove?.(message.id);
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    await onDelete?.(message.id);
    setLoading(false);
  };

  return (
    <div className={cn(
      "rounded-xl p-3 border transition-all",
      message.status === "goedgekeurd"
        ? "bg-green-50 border-green-200"
        : "bg-white border-sand",
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink">
            {message.isAnonymous ? "Anoniem" : (message.authorName ?? "Deelnemer")}
          </span>
          <span className="text-xs text-ink-muted">
            · {formatRelative(message.createdAt!)}
          </span>
        </div>
        {message.status === "goedgekeurd" && (
          <span className="flex items-center gap-1 text-xs font-bold text-green-600">
            <Check size={10} />
            Goedgekeurd
          </span>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-ink mb-2">{message.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpvote?.(message.id)}
          className="flex items-center gap-1 text-xs text-ink-muted hover:text-terra-500 transition-colors"
        >
          <ThumbsUp size={12} />
          {message.upvotes ?? 0}
        </button>

        {message.status !== "goedgekeurd" && (
          <button
            onClick={handleApprove}
            disabled={loading}
            className="ml-auto text-xs font-semibold bg-green-500 hover:bg-green-600 text-white px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
          >
            Keur goed
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={loading}
          className={cn(
            "text-xs font-semibold text-red-500 hover:text-red-600 px-2 py-1 rounded-lg transition-colors disabled:opacity-50",
            message.status !== "goedgekeurd" && "ml-1"
          )}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
