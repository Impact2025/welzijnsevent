"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2, Loader2, Bell, Star, Megaphone, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface EmailActionsPanelProps {
  eventId: string;
  reminderSentAt: Date | null;
  thankYouSentAt: Date | null;
  surveyEnabled: boolean;
  eventSlug: string;
}

export function EmailActionsPanel({
  eventId,
  reminderSentAt,
  thankYouSentAt,
  surveyEnabled,
  eventSlug,
}: EmailActionsPanelProps) {
  const [reminderState, setReminderState] = useState<"idle" | "loading" | "done">(
    reminderSentAt ? "done" : "idle"
  );
  const [thankYouState, setThankYouState] = useState<"idle" | "loading" | "done">(
    thankYouSentAt ? "done" : "idle"
  );
  const [reminderCount, setReminderCount] = useState<number | null>(null);
  const [thankYouCount, setThankYouCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ subject: "", message: "", segment: "all" as "all" | "aangemeld" | "ingecheckt" });
  const [broadcastState, setBroadcastState] = useState<"idle" | "loading" | "done">("idle");
  const [broadcastResult, setBroadcastResult] = useState<{ sent: number; total: number } | null>(null);

  const sendReminder = async () => {
    setReminderState("loading");
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/send-reminder`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Mislukt");
      setReminderCount(data.sent);
      setReminderState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij versturen");
      setReminderState("idle");
    }
  };

  const sendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastState("loading");
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/send-broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(broadcastForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Mislukt");
      setBroadcastResult(data);
      setBroadcastState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij versturen");
      setBroadcastState("idle");
    }
  };

  const sendThankYou = async () => {
    setThankYouState("loading");
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/send-thank-you`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Mislukt");
      setThankYouCount(data.sent);
      setThankYouState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij versturen");
      setThankYouState("idle");
    }
  };

  return (
    <div className="card-base overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-sand bg-sand/30">
        <Mail size={14} className="text-terra-500" />
        <h3 className="text-sm font-bold text-ink">Communicatie</h3>
        <span className="ml-auto flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
          <Zap size={9} />
          Automatisch
        </span>
      </div>

      {error && (
        <div className="mx-4 mt-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      <div className="divide-y divide-sand">
        {/* Herinnering */}
        <div className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Bell size={14} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">Herinnering sturen</p>
              <p className="text-xs text-ink-muted">
                {reminderState === "done"
                  ? reminderCount !== null
                    ? `Verstuurd naar ${reminderCount} deelnemers`
                    : `Verstuurd op ${reminderSentAt ? formatDate(reminderSentAt) : "eerder"}`
                  : "Automatisch 24u voor aanvang · of stuur nu handmatig"}
              </p>
            </div>
          </div>
          <button
            onClick={sendReminder}
            disabled={reminderState !== "idle"}
            className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-60 ${
              reminderState === "done"
                ? "bg-green-100 text-green-700"
                : "bg-terra-500 text-white hover:bg-terra-600"
            }`}
          >
            {reminderState === "loading" ? (
              <Loader2 size={12} className="animate-spin" />
            ) : reminderState === "done" ? (
              <CheckCircle2 size={12} />
            ) : (
              <Send size={12} />
            )}
            {reminderState === "done" ? "Verstuurd" : "Sturen"}
          </button>
        </div>

        {/* Bedankmail + survey */}
        <div className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Star size={14} className="text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">Bedankmail + enquête</p>
              <p className="text-xs text-ink-muted">
                {thankYouState === "done"
                  ? thankYouCount !== null
                    ? `Verstuurd naar ${thankYouCount} ingecheckte deelnemers`
                    : "Verstuurd naar ingecheckte deelnemers"
                  : surveyEnabled
                  ? "Automatisch 2u na afloop · of stuur nu handmatig"
                  : "Automatisch 2u na afloop · of stuur nu handmatig"}
              </p>
              {!surveyEnabled && thankYouState === "idle" && (
                <p className="text-[11px] text-amber-600 mt-0.5">
                  Activeer enquête in event-instellingen voor survey-link
                </p>
              )}
            </div>
          </div>
          <button
            onClick={sendThankYou}
            disabled={thankYouState !== "idle"}
            className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-60 ${
              thankYouState === "done"
                ? "bg-green-100 text-green-700"
                : "bg-terra-500 text-white hover:bg-terra-600"
            }`}
          >
            {thankYouState === "loading" ? (
              <Loader2 size={12} className="animate-spin" />
            ) : thankYouState === "done" ? (
              <CheckCircle2 size={12} />
            ) : (
              <Send size={12} />
            )}
            {thankYouState === "done" ? "Verstuurd" : "Sturen"}
          </button>
        </div>

        {/* Vrij bericht */}
        <div className="p-4">
          <button
            type="button"
            onClick={() => { setBroadcastOpen(o => !o); setBroadcastState("idle"); setBroadcastResult(null); }}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <Megaphone size={14} className="text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink">Vrij bericht sturen</p>
                <p className="text-xs text-ink-muted">Aankondiging of update naar deelnemers</p>
              </div>
            </div>
            {broadcastOpen ? <ChevronUp size={14} className="text-ink-muted" /> : <ChevronDown size={14} className="text-ink-muted" />}
          </button>

          {broadcastOpen && (
            broadcastState === "done" && broadcastResult ? (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                <p className="text-sm text-green-700 font-semibold">
                  Verstuurd naar {broadcastResult.sent} deelnemer{broadcastResult.sent !== 1 ? "s" : ""}
                  {broadcastResult.total > broadcastResult.sent ? ` (van ${broadcastResult.total})` : ""}
                </p>
              </div>
            ) : (
              <form onSubmit={sendBroadcast} className="mt-3 space-y-3">
                {/* Segment */}
                <div className="flex gap-2">
                  {(["all", "aangemeld", "ingecheckt"] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setBroadcastForm(f => ({ ...f, segment: s }))}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        broadcastForm.segment === s
                          ? "border-terra-400 bg-terra-50 text-terra-700"
                          : "border-sand text-ink-muted hover:border-terra-200"
                      }`}
                    >
                      {s === "all" ? "Iedereen" : s === "aangemeld" ? "Aangemeld" : "Ingecheckt"}
                    </button>
                  ))}
                </div>
                <input
                  required
                  type="text"
                  placeholder="Onderwerpregel"
                  value={broadcastForm.subject}
                  onChange={e => setBroadcastForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-sand text-sm text-ink focus:outline-none focus:border-terra-400"
                />
                <textarea
                  required
                  rows={4}
                  placeholder="Schrijf hier je bericht…"
                  value={broadcastForm.message}
                  onChange={e => setBroadcastForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-sand text-sm text-ink focus:outline-none focus:border-terra-400 resize-none"
                />
                <button
                  type="submit"
                  disabled={broadcastState === "loading" || !broadcastForm.subject || !broadcastForm.message}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-terra-500 text-white text-sm font-bold hover:bg-terra-600 disabled:opacity-50 transition-colors"
                >
                  {broadcastState === "loading" ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  {broadcastState === "loading" ? "Versturen…" : "Bericht versturen"}
                </button>
              </form>
            )
          )}
        </div>

        {/* Survey link bekijken */}
        {surveyEnabled && eventSlug && (
          <div className="px-4 py-3 bg-sand/30">
            <p className="text-[11px] text-ink-muted">
              Enquête pagina:{" "}
              <Link
                href={`/e/${eventSlug}/survey`}
                target="_blank"
                className="text-terra-600 font-semibold underline"
              >
                /e/{eventSlug}/survey
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
