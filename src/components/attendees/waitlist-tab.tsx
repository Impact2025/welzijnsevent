"use client";

import { useState } from "react";
import { getInitials, avatarColor, formatRelative, cn } from "@/lib/utils";
import type { WaitlistEntry } from "@/db/schema";
import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  waiting:  { label: "Wachtend",    color: "text-amber-600 bg-amber-50 border-amber-200" },
  promoted: { label: "Uitgenodigd", color: "text-green-600 bg-green-50 border-green-200" },
  expired:  { label: "Verlopen",    color: "text-gray-400 bg-gray-50 border-gray-200" },
};

function WaitlistItem({
  entry,
  eventId,
  onPromote,
}: {
  entry: WaitlistEntry;
  eventId: string;
  onPromote: (id: string) => void;
}) {
  const [promoting, setPromoting] = useState(false);
  const statusInfo = STATUS_LABELS[entry.status ?? "waiting"] ?? STATUS_LABELS.waiting;

  async function handlePromote() {
    setPromoting(true);
    try {
      const res = await fetch("/api/waitlist/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waitlistId: entry.id }),
      });
      if (res.ok) onPromote(entry.id);
    } finally {
      setPromoting(false);
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-sand/60 last:border-0">
      {/* Positie */}
      <div className="w-7 h-7 rounded-full bg-sand flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-ink-muted">{entry.position}</span>
      </div>

      {/* Avatar */}
      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", avatarColor(entry.name))}>
        <span className="text-white text-xs font-bold">{getInitials(entry.name)}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink truncate">{entry.name}</p>
        <p className="text-xs text-ink-muted truncate">
          {entry.organization ?? entry.email}
          {entry.createdAt && <> · {formatRelative(entry.createdAt)}</>}
        </p>
      </div>

      {/* Status + actie */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", statusInfo.color)}>
          {statusInfo.label}
        </span>
        {entry.status === "waiting" && (
          <button
            onClick={handlePromote}
            disabled={promoting}
            title="Uitnodigen"
            className="w-7 h-7 rounded-full bg-green-100 hover:bg-green-200 text-green-700 flex items-center justify-center transition-colors"
          >
            {promoting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function WaitlistTab({
  entries: initialEntries,
  eventId,
}: {
  entries: WaitlistEntry[];
  eventId: string;
}) {
  const [entries, setEntries] = useState(initialEntries);

  function handlePromote(id: string) {
    setEntries(prev =>
      prev.map(e => e.id === id ? { ...e, status: "promoted", notifiedAt: new Date() } : e)
    );
  }

  const waiting  = entries.filter(e => e.status === "waiting");
  const promoted = entries.filter(e => e.status === "promoted");

  if (entries.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center gap-3 text-ink-muted">
        <Clock size={32} className="opacity-30" />
        <p className="text-sm">Geen wachtlijst-aanmeldingen</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {waiting.length > 0 && (
        <>
          <div className="px-4 py-2.5 border-b border-sand bg-sand/40">
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wide">
              Wachtend ({waiting.length})
            </p>
          </div>
          {waiting.map(e => (
            <WaitlistItem key={e.id} entry={e} eventId={eventId} onPromote={handlePromote} />
          ))}
        </>
      )}
      {promoted.length > 0 && (
        <>
          <div className="px-4 py-2.5 border-b border-sand bg-sand/40 mt-2">
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wide">
              Uitgenodigd ({promoted.length})
            </p>
          </div>
          {promoted.map(e => (
            <WaitlistItem key={e.id} entry={e} eventId={eventId} onPromote={handlePromote} />
          ))}
        </>
      )}
    </div>
  );
}
