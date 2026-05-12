"use client";

import { useState } from "react";
import { Send, MessageSquare, StickyNote, Check, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type OpenVacancy = { id: string; title: string; eventTitle: string };

type Props = {
  volunteerEmail: string;
  volunteerName:  string;
  openVacancies:  OpenVacancy[];
  crmNotes:       string | null;
  organizationId: string;
};

type Panel = "invite" | "message" | "notes" | null;

export function VolunteerDetailActions({
  volunteerEmail, volunteerName, openVacancies, crmNotes, organizationId,
}: Props) {
  const [open, setOpen] = useState<Panel>(null);

  // Invite state
  const [selectedVacancy, setSelectedVacancy] = useState("");
  const [invMsg,    setInvMsg]    = useState("");
  const [invBusy,   setInvBusy]   = useState(false);
  const [invOk,     setInvOk]     = useState(false);
  const [invErr,    setInvErr]     = useState("");

  // Message state
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody,    setMsgBody]    = useState("");
  const [msgBusy,    setMsgBusy]    = useState(false);
  const [msgOk,      setMsgOk]      = useState(false);
  const [msgErr,     setMsgErr]     = useState("");

  // Notes state
  const [notes,    setNotes]    = useState(crmNotes ?? "");
  const [notesBusy,setNotesBusy]= useState(false);
  const [notesOk,  setNotesOk]  = useState(false);

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVacancy) return;
    setInvBusy(true); setInvErr(""); setInvOk(false);
    try {
      const res = await fetch("/api/vacancy-invitations", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vacancyId:       selectedVacancy,
          invitedEmail:    volunteerEmail,
          invitedName:     volunteerName,
          personalMessage: invMsg.trim() || null,
        }),
      });
      if (!res.ok) { const d = await res.json(); setInvErr(d.error ?? "Mislukt"); return; }
      setSelectedVacancy(""); setInvMsg(""); setInvOk(true);
      setTimeout(() => setInvOk(false), 3000);
    } catch { setInvErr("Er ging iets mis"); }
    finally { setInvBusy(false); }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!msgSubject.trim() || !msgBody.trim()) return;
    setMsgBusy(true); setMsgErr(""); setMsgOk(false);
    try {
      const res = await fetch("/api/volunteer-messages", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: volunteerEmail,
          subject:        msgSubject.trim(),
          body:           msgBody.trim(),
        }),
      });
      if (!res.ok) { const d = await res.json(); setMsgErr(d.error ?? "Mislukt"); return; }
      setMsgSubject(""); setMsgBody(""); setMsgOk(true);
      setTimeout(() => setMsgOk(false), 3000);
    } catch { setMsgErr("Er ging iets mis"); }
    finally { setMsgBusy(false); }
  }

  async function saveNotes(e: React.FormEvent) {
    e.preventDefault();
    setNotesBusy(true); setNotesOk(false);
    try {
      await fetch(`/api/crm/contacts/${encodeURIComponent(volunteerEmail)}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ crmNotes: notes }),
      });
      setNotesOk(true);
      setTimeout(() => setNotesOk(false), 2000);
    } finally { setNotesBusy(false); }
  }

  const ACTIONS = [
    { key: "invite"  as Panel, icon: Send,          label: "Uitnodigen",        disabled: openVacancies.length === 0 },
    { key: "message" as Panel, icon: MessageSquare, label: "Bericht sturen",    disabled: false },
    { key: "notes"   as Panel, icon: StickyNote,    label: "Interne notities",  disabled: false },
  ];

  return (
    <div className="card-base overflow-hidden">
      {/* Action buttons */}
      <div className="flex divide-x divide-sand border-b border-sand">
        {ACTIONS.map(({ key, icon: Icon, label, disabled }) => (
          <button
            key={key}
            onClick={() => setOpen(open === key ? null : key)}
            disabled={disabled}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors",
              disabled
                ? "text-ink-muted/30 cursor-not-allowed"
                : open === key
                ? "bg-terra-50 text-terra-600"
                : "text-ink-muted hover:text-ink hover:bg-cream/60"
            )}
          >
            <Icon size={16} />
            {label}
            {disabled && key === "invite" && (
              <span className="text-[9px] text-ink-muted/40">Geen open vacatures</span>
            )}
          </button>
        ))}
      </div>

      {/* Invite panel */}
      {open === "invite" && (
        <form onSubmit={sendInvite} className="p-4 space-y-3 bg-cream/30">
          <p className="text-xs text-ink-muted">Stuur een uitnodiging voor een openstaande vacature.</p>
          <select
            value={selectedVacancy}
            onChange={(e) => setSelectedVacancy(e.target.value)}
            required
            className="w-full bg-white border border-sand rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 transition-colors"
          >
            <option value="">Kies een vacature…</option>
            {openVacancies.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title} — {v.eventTitle}
              </option>
            ))}
          </select>
          <textarea
            value={invMsg}
            onChange={(e) => setInvMsg(e.target.value)}
            placeholder="Optioneel persoonlijk bericht…"
            rows={3}
            className="w-full bg-white border border-sand rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 transition-colors resize-none placeholder-ink-muted/40"
          />
          {invErr && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">{invErr}</p>}
          {invOk  && (
            <p className="text-green-700 text-xs bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
              <Check size={12} /> Uitnodiging verstuurd!
            </p>
          )}
          <button
            type="submit"
            disabled={invBusy || !selectedVacancy}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-terra-500 hover:bg-terra-600 disabled:opacity-50 text-white text-sm font-bold transition-colors"
          >
            {invBusy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {invBusy ? "Versturen…" : "Uitnodiging sturen"}
          </button>
        </form>
      )}

      {/* Message panel */}
      {open === "message" && (
        <form onSubmit={sendMessage} className="p-4 space-y-3 bg-cream/30">
          <p className="text-xs text-ink-muted">Stuur een e-mail vanuit Bijeen naar deze vrijwilliger.</p>
          <input
            type="text"
            required
            value={msgSubject}
            onChange={(e) => setMsgSubject(e.target.value)}
            placeholder="Onderwerp…"
            className="w-full bg-white border border-sand rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 transition-colors placeholder-ink-muted/40"
          />
          <textarea
            required
            value={msgBody}
            onChange={(e) => setMsgBody(e.target.value)}
            placeholder="Je bericht…"
            rows={5}
            className="w-full bg-white border border-sand rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 transition-colors resize-none placeholder-ink-muted/40"
          />
          {msgErr && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">{msgErr}</p>}
          {msgOk  && (
            <p className="text-green-700 text-xs bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
              <Check size={12} /> Bericht verstuurd!
            </p>
          )}
          <button
            type="submit"
            disabled={msgBusy || !msgSubject.trim() || !msgBody.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-terra-500 hover:bg-terra-600 disabled:opacity-50 text-white text-sm font-bold transition-colors"
          >
            {msgBusy ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
            {msgBusy ? "Versturen…" : "Bericht sturen"}
          </button>
        </form>
      )}

      {/* Notes panel */}
      {open === "notes" && (
        <form onSubmit={saveNotes} className="p-4 space-y-3 bg-cream/30">
          <p className="text-xs text-ink-muted">
            Interne notities zijn alleen zichtbaar voor jouw team.
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Voeg een interne notitie toe…"
            rows={5}
            className="w-full bg-white border border-sand rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 transition-colors resize-none placeholder-ink-muted/40"
          />
          {notesOk && (
            <p className="text-green-700 text-xs bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
              <Check size={12} /> Notities opgeslagen
            </p>
          )}
          <button
            type="submit"
            disabled={notesBusy}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-terra-500 hover:bg-terra-600 disabled:opacity-50 text-white text-sm font-bold transition-colors"
          >
            {notesBusy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {notesBusy ? "Opslaan…" : "Notities opslaan"}
          </button>
        </form>
      )}
    </div>
  );
}
