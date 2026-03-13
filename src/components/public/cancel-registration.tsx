"use client";

import { useState } from "react";
import { XCircle, Loader2, AlertTriangle } from "lucide-react";

interface Props {
  attendeeId: string;
  attendeeToken: string;
  slug: string;
}

export function CancelRegistration({ attendeeId, attendeeToken, slug }: Props) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleCancel() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/attendees/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendeeId, token: attendeeToken }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Er ging iets mis");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-sand bg-cream/50 px-4 py-4 text-center space-y-1">
        <p className="text-sm font-bold text-ink">Aanmelding geannuleerd</p>
        <p className="text-xs text-ink-muted">
          Je aanmelding is verwijderd. Als er een wachtlijst was, heeft de volgende persoon een uitnodiging ontvangen.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/50 px-4 py-4 space-y-3">
      <div className="flex items-center gap-2 text-red-600">
        <AlertTriangle size={14} />
        <p className="text-xs font-bold uppercase tracking-wider">Aanmelding annuleren</p>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {confirm ? (
        <div className="space-y-2">
          <p className="text-xs text-ink">
            Weet je zeker dat je je aanmelding wil annuleren? Dit kan niet ongedaan worden gemaakt.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirm(false)}
              className="flex-1 py-2 rounded-xl border border-sand text-sm font-semibold text-ink-muted hover:bg-sand"
            >
              Annuleer
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-1"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
              Bevestig
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirm(true)}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-semibold transition-colors"
        >
          <XCircle size={14} />
          Aanmelding annuleren
        </button>
      )}
    </div>
  );
}
