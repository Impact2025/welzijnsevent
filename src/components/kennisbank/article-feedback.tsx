"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface Props {
  articleId: string;
}

export function ArticleFeedback({ articleId }: Props) {
  const [voted,  setVoted]  = useState<"helpful" | "notHelpful" | null>(null);
  const [saving, setSaving] = useState(false);

  async function vote(type: "helpful" | "notHelpful") {
    if (voted || saving) return;
    setSaving(true);
    await fetch(`/api/kennisbank/${articleId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    setSaving(false);
    setVoted(type);
  }

  if (voted) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#6B5E54]">
        <span className="text-lg">{voted === "helpful" ? "🙏" : "📝"}</span>
        {voted === "helpful"
          ? "Bedankt voor je feedback!"
          : "Bedankt! We werken aan betere documentatie."}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <p className="text-sm text-[#6B5E54] font-medium">Was dit artikel nuttig?</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => vote("helpful")}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#6B5E54] hover:text-green-600 border border-[#E8E4DE] hover:border-green-300 hover:bg-green-50 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-40"
        >
          <ThumbsUp size={14} /> Ja
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => vote("notHelpful")}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#6B5E54] hover:text-red-500 border border-[#E8E4DE] hover:border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-40"
        >
          <ThumbsDown size={14} /> Nee
        </button>
      </div>
    </div>
  );
}
