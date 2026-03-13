"use client";

import { useState } from "react";
import { Loader2, Globe, Play, Square, FileEdit, CheckCircle2, ChevronRight } from "lucide-react";

type Status = "draft" | "published" | "live" | "ended";

interface Props {
  eventId: string;
  initialStatus: Status;
}

const STATUS_CONFIG: Record<Status, {
  label: string;
  color: string;
  dot: string;
  description: string;
}> = {
  draft:     { label: "Concept",    color: "bg-gray-100 text-gray-600",   dot: "bg-gray-400",    description: "Niet zichtbaar voor deelnemers" },
  published: { label: "Gepubliceerd", color: "bg-blue-100 text-blue-700",  dot: "bg-blue-500",    description: "Aanmeldingen open" },
  live:      { label: "Live",       color: "bg-green-100 text-green-700", dot: "bg-green-500 animate-pulse", description: "Evenement is bezig" },
  ended:     { label: "Afgelopen",  color: "bg-sand text-ink-muted",      dot: "bg-ink-muted/40", description: "Evenement is afgerond" },
};

const NEXT_ACTION: Record<string, { label: string; nextStatus: Status; icon: React.ReactNode; style: string; confirm?: string }> = {
  draft: {
    label: "Publiceer evenement",
    nextStatus: "published",
    icon: <Globe size={14} />,
    style: "bg-blue-500 hover:bg-blue-600 text-white",
  },
  published: {
    label: "Start evenement",
    nextStatus: "live",
    icon: <Play size={14} />,
    style: "bg-green-500 hover:bg-green-600 text-white",
  },
  live: {
    label: "Evenement afsluiten",
    nextStatus: "ended",
    icon: <Square size={14} />,
    style: "bg-amber-500 hover:bg-amber-600 text-white",
    confirm: "Weet je zeker dat je het evenement wilt afsluiten?",
  },
};

export function EventStatusPanel({ eventId, initialStatus }: Props) {
  const [status,  setStatus]  = useState<Status>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const cfg    = STATUS_CONFIG[status];
  const action = NEXT_ACTION[status];

  async function applyStatus(next: Status) {
    setLoading(true);
    setConfirm(false);
    try {
      await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      setStatus(next);
    } finally {
      setLoading(false);
    }
  }

  function handleAction() {
    if (!action) return;
    if (action.confirm && !confirm) {
      setConfirm(true);
      return;
    }
    applyStatus(action.nextStatus);
  }

  return (
    <div className="mx-4 mt-4 card-base overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
          </div>
          <span className="text-xs text-ink-muted hidden sm:block">{cfg.description}</span>
        </div>

        <div className="flex items-center gap-2">
          {confirm && (
            <button
              onClick={() => setConfirm(false)}
              className="text-xs text-ink-muted hover:text-ink px-2 py-1.5"
            >
              Annuleer
            </button>
          )}
          {action && (
            <button
              onClick={handleAction}
              disabled={loading}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-60 ${
                confirm ? "bg-red-500 hover:bg-red-600 text-white" : action.style
              }`}
            >
              {loading
                ? <Loader2 size={13} className="animate-spin" />
                : confirm ? <CheckCircle2 size={13} /> : action.icon
              }
              {confirm ? "Bevestigen" : action.label}
            </button>
          )}
          {status === "ended" && (
            <span className="text-xs text-ink-muted flex items-center gap-1">
              <CheckCircle2 size={13} className="text-green-500" />
              Afgerond
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
