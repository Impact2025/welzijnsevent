"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Send, X, Loader2, Check } from "lucide-react";
import { getInitials, avatarColor, cn } from "@/lib/utils";

const SKILL_COLORS = [
  "bg-blue-50 text-blue-700 border-blue-100",
  "bg-purple-50 text-purple-700 border-purple-100",
  "bg-green-50 text-green-700 border-green-100",
  "bg-orange-50 text-orange-700 border-orange-100",
  "bg-pink-50 text-pink-700 border-pink-100",
];
function skillColor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffff;
  return SKILL_COLORS[h % SKILL_COLORS.length];
}

export type VolunteerRow = {
  id: string; email: string; name: string; phone: string | null;
  skills: string[]; applicationsTotal: number; applicationsAccepted: number;
  applicationsPending: number;
};

export type OpenVacancy = { id: string; title: string; eventTitle: string };

type Props = {
  volunteers:    VolunteerRow[];
  openVacancies: OpenVacancy[];
};

export function VolunteerList({ volunteers, openVacancies }: Props) {
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [vacancyId, setVacancyId] = useState("");
  const [message, setMessage]     = useState("");
  const [showMsg, setShowMsg]     = useState(false);
  const [busy, setBusy]           = useState(false);
  const [result, setResult]       = useState<{ sent: number; skipped: number } | null>(null);

  const allEmails = volunteers.map((v) => v.email);
  const allSelected = allEmails.length > 0 && allEmails.every((e) => selected.has(e));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allEmails));
    setResult(null);
  }

  function toggle(email: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(email) ? next.delete(email) : next.add(email);
      return next;
    });
    setResult(null);
  }

  function clearSelection() {
    setSelected(new Set());
    setVacancyId("");
    setMessage("");
    setResult(null);
  }

  async function sendBulkInvite() {
    if (!vacancyId || selected.size === 0) return;
    setBusy(true);
    setResult(null);
    try {
      const toInvite = volunteers
        .filter((v) => selected.has(v.email))
        .map((v) => ({ email: v.email, name: v.name }));

      const res = await fetch("/api/vacancy-invitations/bulk", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vacancyId,
          volunteers: toInvite,
          personalMessage: message.trim() || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setSelected(new Set());
        setVacancyId("");
        setMessage("");
        setShowMsg(false);
      }
    } finally {
      setBusy(false);
    }
  }

  const selectedCount = selected.size;

  return (
    <>
      <div className="card-base overflow-hidden">

        {/* Desktop header */}
        <div className="hidden md:flex items-center gap-4 px-5 py-3 border-b border-sand bg-cream/50">
          <div className="w-10 flex items-center justify-center shrink-0">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="w-4 h-4 cursor-pointer accent-[#C8522A]"
              title={allSelected ? "Deselecteer alles" : "Selecteer alles"}
            />
          </div>
          <div className="flex-1 grid grid-cols-[2fr_2fr_90px_90px_110px] gap-4">
            {["Vrijwilliger", "Skills", "Aanmeldingen", "Geaccepteerd", "Status"].map((h) => (
              <p key={h} className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">{h}</p>
            ))}
          </div>
        </div>

        {/* Mobile select-all */}
        {volunteers.length > 0 && (
          <div className="md:hidden flex items-center gap-3 px-4 py-2.5 border-b border-sand bg-cream/50">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="w-4 h-4 cursor-pointer accent-[#C8522A]"
            />
            <span className="text-xs text-ink-muted font-semibold">
              {allSelected ? "Alles geselecteerd" : "Selecteer alles"}
            </span>
          </div>
        )}

        {volunteers.length === 0 ? (
          <div className="py-16 text-center text-ink-muted">
            <p className="text-sm font-semibold text-ink mb-1">Geen resultaten</p>
            <p className="text-xs">Pas de filters aan om meer vrijwilligers te zien</p>
          </div>
        ) : (
          volunteers.map((v) => {
            const initials   = getInitials(v.name);
            const color      = avatarColor(v.name);
            const hasPending = v.applicationsPending > 0;
            const isSelected = selected.has(v.email);

            return (
              <div
                key={v.email}
                className={cn(
                  "flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 border-b border-sand/40 last:border-0 transition-colors group",
                  isSelected ? "bg-terra-50/60" : "hover:bg-cream/60"
                )}
              >
                {/* Checkbox */}
                <div className="w-10 flex items-center justify-center shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(v.email)}
                    className="w-4 h-4 cursor-pointer accent-[#C8522A]"
                  />
                </div>

                {/* Rest of row — desktop grid / mobile flex */}
                <div className="flex-1 flex md:grid md:grid-cols-[2fr_2fr_90px_90px_110px] gap-3 md:gap-4 items-center min-w-0">

                  {/* Avatar + name */}
                  <Link
                    href={`/dashboard/vrijwilligers/${encodeURIComponent(v.email)}`}
                    className="flex items-center gap-3 min-w-0"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                      style={{ backgroundColor: color }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-ink truncate group-hover:text-terra-500 transition-colors leading-tight">
                          {v.name}
                        </p>
                        {hasPending && (
                          <span className="shrink-0 w-2 h-2 rounded-full bg-amber-400" title="Wacht op review" />
                        )}
                      </div>
                      <p className="text-[11px] text-ink-muted truncate">{v.email}</p>
                    </div>
                  </Link>

                  {/* Skills */}
                  <div className="hidden md:flex flex-wrap gap-1.5 overflow-hidden max-h-6">
                    {v.skills.length === 0 ? (
                      <span className="text-xs text-ink-muted/50">—</span>
                    ) : (
                      v.skills.slice(0, 3).map((s) => (
                        <span key={s} className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", skillColor(s))}>
                          {s}
                        </span>
                      ))
                    )}
                    {v.skills.length > 3 && (
                      <span className="text-[10px] text-ink-muted/60">+{v.skills.length - 3}</span>
                    )}
                  </div>

                  {/* Aanmeldingen */}
                  <div className="hidden md:flex items-center gap-1">
                    <span className="text-sm font-semibold text-ink">{v.applicationsTotal}</span>
                    {hasPending && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                        {v.applicationsPending} nieuw
                      </span>
                    )}
                  </div>

                  {/* Accepted */}
                  <p className="text-sm text-green-700 font-semibold hidden md:block">
                    {v.applicationsAccepted > 0 ? v.applicationsAccepted : "—"}
                  </p>

                  {/* Status chip */}
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border shrink-0",
                      v.applicationsAccepted > 0
                        ? "bg-green-50 text-green-700 border-green-200"
                        : hasPending
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-sand text-ink-muted border-sand"
                    )}>
                      {v.applicationsAccepted > 0 ? "Actief" : hasPending ? "Review" : "Pool"}
                    </span>
                    <ChevronRight size={14} className="text-ink-muted/40 md:hidden" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Result toast */}
      {result && (
        <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <Check size={15} className="shrink-0" />
          <span>
            <strong>{result.sent}</strong> uitnodiging{result.sent !== 1 ? "en" : ""} verstuurd
            {result.skipped > 0 ? `, ${result.skipped} al eerder uitgenodigd` : ""}.
          </span>
        </div>
      )}

      {/* Floating bulk action bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
          <div className="bg-ink rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 flex items-center gap-2">
                <span className="text-white text-sm font-bold">
                  {selectedCount} geselecteerd
                </span>
                <button
                  onClick={clearSelection}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <button
                onClick={() => setShowMsg((s) => !s)}
                className="text-white/60 hover:text-white text-xs font-semibold transition-colors"
              >
                {showMsg ? "Verberg bericht" : "+ Bericht"}
              </button>
            </div>

            {showMsg && (
              <div className="px-4 pb-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Persoonlijk bericht (optioneel)…"
                  rows={2}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-terra-400 resize-none transition-colors"
                />
              </div>
            )}

            <div className="flex gap-2 px-4 pb-4">
              <select
                value={vacancyId}
                onChange={(e) => setVacancyId(e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-terra-400 transition-colors"
              >
                <option value="" className="bg-ink text-white">Kies vacature…</option>
                {openVacancies.map((v) => (
                  <option key={v.id} value={v.id} className="bg-ink text-white">
                    {v.title} — {v.eventTitle}
                  </option>
                ))}
              </select>
              <button
                onClick={sendBulkInvite}
                disabled={busy || !vacancyId}
                className="flex items-center gap-2 px-4 py-2.5 bg-terra-500 hover:bg-terra-400 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-colors shrink-0"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {busy ? "Bezig…" : "Uitnodigen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
