"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, Trash2, CheckCircle2, Loader2, StickyNote, AlertTriangle } from "lucide-react";

interface Props {
  attendeeId:  string;
  eventId:     string;
  initialNotes: string | null;
  hasQrCode:   boolean;
  status:      string;
}

export function AttendeeActions({ attendeeId, eventId, initialNotes, hasQrCode, status }: Props) {
  const router = useRouter();
  const [notes,        setNotes]        = useState(initialNotes ?? "");
  const [notesSaving,  setNotesSaving]  = useState(false);
  const [notesSaved,   setNotesSaved]   = useState(false);
  const [sending,      setSending]      = useState(false);
  const [sent,         setSent]         = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [confirmDel,   setConfirmDel]   = useState(false);
  const [checkingIn,   setCheckingIn]   = useState(false);
  const [error,        setError]        = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onNotesChange(val: string) {
    setNotes(val);
    setNotesSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveNotes(val), 1200);
  }

  async function saveNotes(value: string) {
    setNotesSaving(true);
    try {
      await fetch(`/api/attendees/${attendeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: value || null }),
      });
      setNotesSaved(true);
    } finally {
      setNotesSaving(false);
    }
  }

  async function handleResend() {
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/attendees/${attendeeId}/resend-ticket`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Versturen mislukt");
    } finally {
      setSending(false);
    }
  }

  async function handleCheckin() {
    setCheckingIn(true);
    setError("");
    try {
      await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendeeId, eventId }),
      });
      router.refresh();
    } catch {
      setError("Inchecken mislukt");
    } finally {
      setCheckingIn(false);
    }
  }

  async function handleDelete() {
    if (!confirmDel) { setConfirmDel(true); return; }
    setDeleting(true);
    try {
      await fetch(`/api/attendees/${attendeeId}`, { method: "DELETE" });
      router.push(`/dashboard/events/${eventId}/deelnemers`);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      {/* Check-in */}
      {status !== "ingecheckt" && (
        <div className="card-base p-4">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">Handmatig inchecken</p>
          <button
            onClick={handleCheckin}
            disabled={checkingIn}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {checkingIn ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {checkingIn ? "Bezig…" : "Inchecken"}
          </button>
        </div>
      )}

      {/* Ticket opnieuw sturen */}
      {hasQrCode && (
        <div className="card-base p-4">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">Ticket</p>
          <button
            onClick={handleResend}
            disabled={sending || sent}
            className={`w-full flex items-center justify-center gap-2 font-bold py-2.5 rounded-xl text-sm transition-colors ${
              sent
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-terra-50 text-terra-600 hover:bg-terra-100 border border-terra-200 disabled:opacity-60"
            }`}
          >
            {sending ? <Loader2 size={13} className="animate-spin" /> : sent ? <CheckCircle2 size={13} /> : <Send size={13} />}
            {sent ? "Verstuurd!" : sending ? "Versturen…" : "Ticket opnieuw sturen"}
          </button>
        </div>
      )}

      {/* Notities */}
      <div className="card-base p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <StickyNote size={12} />
            Notities (privé)
          </p>
          {notesSaving && <Loader2 size={11} className="animate-spin text-ink-muted" />}
          {notesSaved && !notesSaving && <span className="text-[10px] text-green-600 font-semibold">Opgeslagen</span>}
        </div>
        <textarea
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          placeholder="Interne aantekeningen (niet zichtbaar voor deelnemer)…"
          rows={3}
          className="w-full text-sm text-ink bg-sand/30 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-terra-300 resize-none placeholder-ink-muted/40"
        />
      </div>

      {/* GDPR — verwijderen */}
      <div className="card-base p-4">
        <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <AlertTriangle size={12} />
          GDPR
        </p>
        {confirmDel ? (
          <div className="space-y-2">
            <p className="text-xs text-red-600 font-semibold">Alle gegevens worden permanent verwijderd.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDel(false)} className="flex-1 py-2 rounded-xl border border-sand text-sm font-semibold text-ink-muted hover:bg-sand">
                Annuleer
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-1"
              >
                {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                Verwijder
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-semibold transition-colors"
          >
            <Trash2 size={14} />
            Deelnemer verwijderen (GDPR-verzoek)
          </button>
        )}
      </div>
    </div>
  );
}
