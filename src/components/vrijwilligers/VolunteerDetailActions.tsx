"use client";

import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Send, MessageSquare, StickyNote, Check, Loader2, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

type OpenVacancy = { id: string; title: string; eventTitle: string };

type Props = {
  volunteerEmail:        string;
  volunteerName:         string;
  openVacancies:         OpenVacancy[];
  crmNotes:              string | null;
  organizationId:        string;
  // profile edit props
  profileId:             string;
  profilePhone:          string | null;
  profileSkills:         string[];
  profileAvailability:   string | null;
  profileBio:            string | null;
};

type Panel = "edit" | "invite" | "message" | "notes" | null;

export function VolunteerDetailActions({
  volunteerEmail, volunteerName, openVacancies, crmNotes, organizationId,
  profileId, profilePhone, profileSkills, profileAvailability, profileBio,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState<Panel>(null);

  // Edit state
  const [editName,         setEditName]         = useState(volunteerName);
  const [editEmail,        setEditEmail]        = useState(volunteerEmail);
  const [editPhone,        setEditPhone]        = useState(profilePhone ?? "");
  const [editSkills,       setEditSkills]       = useState<string[]>(profileSkills);
  const [editSkillInput,   setEditSkillInput]   = useState("");
  const [editAvailability, setEditAvailability] = useState(profileAvailability ?? "");
  const [editBio,          setEditBio]          = useState(profileBio ?? "");
  const [editBusy,         setEditBusy]         = useState(false);
  const [editErr,          setEditErr]          = useState("");
  const [editOk,           setEditOk]           = useState(false);

  // Invite state
  const [selectedVacancy, setSelectedVacancy] = useState("");
  const [invMsg,    setInvMsg]    = useState("");
  const [invBusy,   setInvBusy]   = useState(false);
  const [invOk,     setInvOk]     = useState(false);
  const [invErr,    setInvErr]    = useState("");

  // Message state
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody,    setMsgBody]    = useState("");
  const [msgBusy,    setMsgBusy]    = useState(false);
  const [msgOk,      setMsgOk]      = useState(false);
  const [msgErr,     setMsgErr]     = useState("");

  // Notes state
  const [notes,     setNotes]     = useState(crmNotes ?? "");
  const [notesBusy, setNotesBusy] = useState(false);
  const [notesOk,   setNotesOk]   = useState(false);

  function addEditSkill() {
    const s = editSkillInput.trim();
    if (s && !editSkills.includes(s) && editSkills.length < 20) {
      setEditSkills((prev) => [...prev, s]);
    }
    setEditSkillInput("");
  }

  function onEditSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addEditSkill(); }
    if (e.key === "Backspace" && editSkillInput === "" && editSkills.length > 0) {
      setEditSkills((prev) => prev.slice(0, -1));
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) return;
    setEditBusy(true); setEditErr(""); setEditOk(false);
    try {
      const res = await fetch(`/api/vrijwilligers/${profileId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:         editName.trim(),
          email:        editEmail.trim(),
          phone:        editPhone.trim() || null,
          skills:       editSkills,
          availability: editAvailability.trim() || null,
          bio:          editBio.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setEditErr(data.error ?? "Opslaan mislukt"); return; }
      setEditOk(true);
      setTimeout(() => {
        // If email changed, redirect to new URL
        const newEmail = editEmail.trim().toLowerCase();
        if (newEmail !== volunteerEmail.toLowerCase()) {
          router.push(`/dashboard/vrijwilligers/${encodeURIComponent(newEmail)}`);
        } else {
          router.refresh();
          setOpen(null);
          setEditOk(false);
        }
      }, 800);
    } catch { setEditErr("Er ging iets mis"); }
    finally { setEditBusy(false); }
  }

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
    { key: "edit"    as Panel, icon: Pencil,        label: "Bewerken",          disabled: false },
    { key: "invite"  as Panel, icon: Send,           label: "Uitnodigen",        disabled: openVacancies.length === 0 },
    { key: "message" as Panel, icon: MessageSquare,  label: "Bericht sturen",    disabled: false },
    { key: "notes"   as Panel, icon: StickyNote,     label: "Interne notities",  disabled: false },
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

      {/* Edit panel */}
      {open === "edit" && (
        <form onSubmit={saveEdit} className="p-4 space-y-3 bg-cream/30">
          <p className="text-xs text-ink-muted">Wijzig de profielgegevens van deze vrijwilliger.</p>

          {/* Naam */}
          <div>
            <label className="block text-[11px] font-bold text-ink-muted mb-1">
              Naam <span className="text-red-400">*</span>
            </label>
            <input
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Jan de Vries"
              className="w-full bg-white border border-sand rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 transition-colors placeholder-ink-muted/40"
            />
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-[11px] font-bold text-ink-muted mb-1">
              E-mailadres <span className="text-red-400">*</span>
            </label>
            <input
              required
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="jan@voorbeeld.nl"
              className="w-full bg-white border border-sand rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 transition-colors placeholder-ink-muted/40"
            />
          </div>

          {/* Telefoon */}
          <div>
            <label className="block text-[11px] font-bold text-ink-muted mb-1">Telefoon</label>
            <input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="06 12345678"
              className="w-full bg-white border border-sand rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 transition-colors placeholder-ink-muted/40"
            />
          </div>

          {/* Vaardigheden */}
          <div>
            <label className="block text-[11px] font-bold text-ink-muted mb-1">Vaardigheden</label>
            <div className="min-h-[42px] w-full bg-white border border-sand rounded-xl px-3 py-2 flex flex-wrap gap-1.5 focus-within:border-terra-300 transition-colors">
              {editSkills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 text-xs font-medium bg-terra-50 text-terra-700 border border-terra-100 px-2 py-0.5 rounded-full"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => setEditSkills((prev) => prev.filter((x) => x !== s))}
                    className="hover:text-terra-900 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                value={editSkillInput}
                onChange={(e) => setEditSkillInput(e.target.value)}
                onKeyDown={onEditSkillKeyDown}
                onBlur={addEditSkill}
                placeholder={editSkills.length === 0 ? "EHBO, rijbewijs… (Enter)" : ""}
                className="flex-1 min-w-[100px] text-sm bg-transparent text-ink placeholder:text-ink-muted/40 outline-none"
              />
            </div>
          </div>

          {/* Beschikbaarheid */}
          <div>
            <label className="block text-[11px] font-bold text-ink-muted mb-1">Beschikbaarheid</label>
            <input
              value={editAvailability}
              onChange={(e) => setEditAvailability(e.target.value)}
              placeholder="Bijv. weekenden, doordeweeks avonden"
              className="w-full bg-white border border-sand rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 transition-colors placeholder-ink-muted/40"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[11px] font-bold text-ink-muted mb-1">Notitie / bio</label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Achtergrond, motivatie of andere informatie…"
              rows={3}
              className="w-full bg-white border border-sand rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 transition-colors resize-none placeholder-ink-muted/40"
            />
          </div>

          {editErr && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">{editErr}</p>}
          {editOk  && (
            <p className="text-green-700 text-xs bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
              <Check size={12} /> Opgeslagen!
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="flex-1 py-2.5 rounded-xl bg-sand text-ink text-sm font-bold hover:bg-sand/80 transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={editBusy || !editName.trim() || !editEmail.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-terra-500 hover:bg-terra-600 disabled:opacity-50 text-white text-sm font-bold transition-colors"
            >
              {editBusy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {editBusy ? "Opslaan…" : "Opslaan"}
            </button>
          </div>
        </form>
      )}

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
