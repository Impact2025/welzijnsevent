"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Users, Clock, MapPin, Check, X, Mail,
  Send, Loader2, ChevronDown, Pencil, Trash2,
  HandHeart, UserPlus, MessageSquare, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Vacancy = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  spotsAvailable: number | null;
  location: string | null;
  shiftDate: string | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  requirements: string[];
  status: string | null;
};

type ApplicationRow = {
  application: {
    id: string;
    status: string | null;
    motivation: string | null;
    internalNotes: string | null;
    appliedAt: string | null;
  };
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
};

type Invitation = {
  id: string;
  invitedEmail: string;
  invitedName: string | null;
  status: string | null;
  createdAt: string | null;
  respondedAt: string | null;
  expiresAt: string;
};

const STATUS_CFG = {
  pending:   { label: "In behandeling", cls: "bg-orange-50 text-orange-700 border-orange-200" },
  accepted:  { label: "Geaccepteerd",   cls: "bg-green-50 text-green-700 border-green-200"   },
  rejected:  { label: "Afgewezen",      cls: "bg-red-50 text-red-600 border-red-200"          },
  withdrawn: { label: "Teruggetrokken", cls: "bg-gray-100 text-gray-500 border-gray-200"      },
} as const;

const INV_STATUS_CFG = {
  pending:  { label: "Wacht",        cls: "bg-orange-50 text-orange-700 border-orange-200" },
  accepted: { label: "Geaccepteerd", cls: "bg-green-50 text-green-700 border-green-200"   },
  declined: { label: "Afgewezen",    cls: "bg-red-50 text-red-600 border-red-200"          },
  expired:  { label: "Verlopen",     cls: "bg-gray-100 text-gray-500 border-gray-200"      },
} as const;

type Tab = "aanmeldingen" | "uitnodigen" | "berichten";

export default function VacancyDetailPage() {
  const params = useParams<{ id: string; vacancyId: string }>();
  const router = useRouter();

  const [vacancy,      setVacancy]      = useState<Vacancy | null>(null);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [invitations,  setInvitations]  = useState<Invitation[]>([]);
  const [tab,          setTab]          = useState<Tab>("aanmeldingen");
  const [loadingV,     setLoadingV]     = useState(true);
  const [deletingV,    setDeletingV]    = useState(false);

  // Invite form
  const [invEmail,   setInvEmail]   = useState("");
  const [invName,    setInvName]    = useState("");
  const [invMsg,     setInvMsg]     = useState("");
  const [invSending, setInvSending] = useState(false);
  const [invError,   setInvError]   = useState("");
  const [invSuccess, setInvSuccess] = useState(false);

  // Message form
  const [msgEmail,    setMsgEmail]    = useState("");
  const [msgSubject,  setMsgSubject]  = useState("");
  const [msgBody,     setMsgBody]     = useState("");
  const [msgSending,  setMsgSending]  = useState(false);
  const [msgSuccess,  setMsgSuccess]  = useState(false);
  const [msgError,    setMsgError]    = useState("");

  // Patch tracking
  const [patchingId,  setPatchingId]  = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoadingV(true);
    try {
      const [vRes, aRes, iRes] = await Promise.all([
        fetch(`/api/vacancies/${params.vacancyId}`),
        fetch(`/api/vacancy-applications?vacancyId=${params.vacancyId}`),
        fetch(`/api/vacancy-invitations?vacancyId=${params.vacancyId}`),
      ]);
      const [vData, aData, iData] = await Promise.all([vRes.json(), aRes.json(), iRes.json()]);
      setVacancy(vData.vacancy ?? null);
      setApplications(aData.applications ?? []);
      setInvitations(iData.invitations ?? []);
    } finally {
      setLoadingV(false);
    }
  }, [params.vacancyId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function patchApplication(appId: string, status: string) {
    setPatchingId(appId);
    await fetch(`/api/vacancy-applications/${appId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status }),
    });
    await loadAll();
    setPatchingId(null);
  }

  async function sendInvitation(e: React.FormEvent) {
    e.preventDefault();
    if (!invEmail.trim()) return;
    setInvSending(true); setInvError(""); setInvSuccess(false);
    try {
      const res = await fetch("/api/vacancy-invitations", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vacancyId:       params.vacancyId,
          invitedEmail:    invEmail.trim(),
          invitedName:     invName.trim() || null,
          personalMessage: invMsg.trim() || null,
        }),
      });
      if (!res.ok) { const d = await res.json(); setInvError(d.error ?? "Mislukt"); return; }
      setInvEmail(""); setInvName(""); setInvMsg(""); setInvSuccess(true);
      setTimeout(() => setInvSuccess(false), 3000);
      await loadAll();
    } catch { setInvError("Er ging iets mis"); }
    finally { setInvSending(false); }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!msgEmail.trim() || !msgSubject.trim() || !msgBody.trim()) return;
    setMsgSending(true); setMsgError(""); setMsgSuccess(false);
    try {
      const res = await fetch("/api/volunteer-messages", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vacancyId: params.vacancyId,
          eventId:   params.id,
          recipientEmail: msgEmail.trim(),
          subject:   msgSubject.trim(),
          body:      msgBody.trim(),
        }),
      });
      if (!res.ok) { const d = await res.json(); setMsgError(d.error ?? "Mislukt"); return; }
      setMsgEmail(""); setMsgSubject(""); setMsgBody(""); setMsgSuccess(true);
      setTimeout(() => setMsgSuccess(false), 3000);
    } catch { setMsgError("Er ging iets mis"); }
    finally { setMsgSending(false); }
  }

  async function deleteVacancy() {
    if (!confirm("Weet je zeker dat je deze vacature wilt verwijderen? Dit kan niet ongedaan worden gemaakt.")) return;
    setDeletingV(true);
    await fetch(`/api/vacancies/${params.vacancyId}`, { method: "DELETE" });
    router.push(`/dashboard/events/${params.id}/vacatures`);
  }

  if (loadingV) {
    return (
      <div className="p-8 text-center text-ink-muted text-sm">
        <Loader2 size={20} className="animate-spin mx-auto" />
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="p-8 text-center">
        <p className="text-ink-muted text-sm">Vacature niet gevonden.</p>
        <Link href={`/dashboard/events/${params.id}/vacatures`} className="text-terra-600 text-sm hover:underline mt-2 block">
          ← Terug
        </Link>
      </div>
    );
  }

  const pending  = applications.filter((a) => a.application.status === "pending").length;
  const accepted = applications.filter((a) => a.application.status === "accepted").length;
  const invAccepted = invitations.filter((i) => i.status === "accepted").length;

  // Set of emails that came in via accepted invitation (to show badge in applications tab)
  const viaInvitationEmails = new Set(
    invitations.filter((i) => i.status === "accepted").map((i) => i.invitedEmail.toLowerCase())
  );

  return (
    <div className="w-full md:max-w-3xl md:mx-auto bg-white min-h-screen pb-16">
      {/* Header */}
      <div className="bg-terra-500 text-white px-4 pt-10 pb-5">
        <Link
          href={`/dashboard/events/${params.id}/vacatures`}
          className="inline-flex items-center gap-1.5 text-white/80 text-sm mb-4 hover:text-white"
        >
          <ArrowLeft size={15} />
          Alle vacatures
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                vacancy.status === "open"   ? "bg-white/20 text-white"         :
                vacancy.status === "draft"  ? "bg-white/10 text-white/70"      :
                "bg-white/10 text-white/60"
              )}>
                {vacancy.status === "open" ? "Open" : vacancy.status === "draft" ? "Concept" : "Gesloten"}
              </span>
            </div>
            <h1 className="text-lg font-bold leading-tight">{vacancy.title}</h1>
            <div className="flex flex-wrap gap-3 mt-1.5">
              {vacancy.spotsAvailable != null && (
                <span className="flex items-center gap-1 text-white/75 text-xs">
                  <Users size={11} /> {vacancy.spotsAvailable} plekken
                </span>
              )}
              {vacancy.shiftStart && vacancy.shiftEnd && (
                <span className="flex items-center gap-1 text-white/75 text-xs">
                  <Clock size={11} /> {vacancy.shiftStart}–{vacancy.shiftEnd}
                </span>
              )}
              {vacancy.location && (
                <span className="flex items-center gap-1 text-white/75 text-xs">
                  <MapPin size={11} /> {vacancy.location}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={deleteVacancy}
              disabled={deletingV}
              title="Verwijderen"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              {deletingV ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-px bg-sand border-b border-sand">
        {[
          { label: "Aanmeldingen",   value: applications.length },
          { label: "In behandeling", value: pending             },
          { label: "Geaccepteerd",   value: accepted            },
          { label: "Uitnodigingen ✓", value: invAccepted, green: invAccepted > 0 },
        ].map(({ label, value, green }) => (
          <div key={label} className="bg-white py-3 text-center">
            <p className={`text-xl font-bold ${green ? "text-green-600" : "text-ink"}`}>{value}</p>
            <p className="text-[11px] text-ink-muted leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-sand">
        {(["aanmeldingen", "uitnodigen", "berichten"] as Tab[]).map((t) => {
          const icons = { aanmeldingen: HandHeart, uitnodigen: UserPlus, berichten: MessageSquare };
          const Icon  = icons[t];
          const labels = { aanmeldingen: "Aanmeldingen", uitnodigen: "Uitnodigen", berichten: "Bericht sturen" };
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors",
                tab === t
                  ? "text-terra-500 border-terra-500"
                  : "text-ink-muted border-transparent hover:text-ink"
              )}
            >
              <Icon size={14} />
              {labels[t]}
              {t === "aanmeldingen" && applications.length > 0 && (
                <span className="ml-1 bg-terra-100 text-terra-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {applications.length}
                </span>
              )}
              {t === "uitnodigen" && invAccepted > 0 && (
                <span className="ml-1 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {invAccepted} ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="px-4 py-5">
        {/* ── TAB: AANMELDINGEN ── */}
        {tab === "aanmeldingen" && (
          <div className="space-y-3">
            {applications.length === 0 ? (
              <div className="py-12 text-center text-ink-muted">
                <HandHeart size={32} className="mx-auto mb-2 opacity-25" />
                <p className="text-sm font-medium">Nog geen aanmeldingen</p>
                <p className="text-xs mt-1 opacity-70">Zodra vrijwilligers zich aanmelden, verschijnen ze hier.</p>
              </div>
            ) : (
              applications.map(({ application: app, profile }) => {
                const stCfg = STATUS_CFG[app.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending;
                const isPatching = patchingId === app.id;
                return (
                  <div key={app.id} className="card-base p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-ink text-sm">{profile?.name ?? "Onbekend"}</p>
                          {profile?.email && viaInvitationEmails.has(profile.email.toLowerCase()) && (
                            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full">
                              Via uitnodiging
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ink-muted">{profile?.email}</p>
                        {profile?.phone && (
                          <p className="text-xs text-ink-muted">{profile.phone}</p>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${stCfg.cls}`}>
                        {stCfg.label}
                      </span>
                    </div>

                    {app.motivation && (
                      <div className="bg-cream rounded-xl p-3">
                        <p className="text-xs font-bold text-ink-muted mb-1">Motivatie</p>
                        <p className="text-sm text-ink leading-relaxed">{app.motivation}</p>
                      </div>
                    )}

                    {app.status === "pending" && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => patchApplication(app.id, "rejected")}
                          disabled={isPatching}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          {isPatching ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                          Afwijzen
                        </button>
                        <button
                          onClick={() => patchApplication(app.id, "accepted")}
                          disabled={isPatching}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold disabled:opacity-50 transition-colors"
                        >
                          {isPatching ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                          Accepteren
                        </button>
                        <a
                          href={`mailto:${profile?.email}`}
                          className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl border border-sand text-ink-muted text-xs font-semibold hover:bg-sand transition-colors"
                        >
                          <Mail size={12} />
                          Mail
                        </a>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── TAB: UITNODIGEN ── */}
        {tab === "uitnodigen" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-ink text-sm mb-1">Vrijwilliger uitnodigen</h2>
              <p className="text-xs text-ink-muted">
                Stuur een persoonlijke uitnodiging per e-mail. De vrijwilliger ontvangt een link om te reageren.
              </p>
            </div>

            <form onSubmit={sendInvitation} className="space-y-3">
              <div className="card-base p-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-ink-muted mb-1.5">E-mailadres *</label>
                  <input
                    type="email"
                    required
                    value={invEmail}
                    onChange={(e) => setInvEmail(e.target.value)}
                    placeholder="vrijwilliger@email.nl"
                    className="w-full bg-cream rounded-xl border border-sand px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 transition-all placeholder-ink-muted/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-muted mb-1.5">Naam <span className="font-normal">(optioneel)</span></label>
                  <input
                    type="text"
                    value={invName}
                    onChange={(e) => setInvName(e.target.value)}
                    placeholder="Voornaam achternaam"
                    className="w-full bg-cream rounded-xl border border-sand px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 transition-all placeholder-ink-muted/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-muted mb-1.5">Persoonlijk bericht <span className="font-normal">(optioneel)</span></label>
                  <textarea
                    value={invMsg}
                    onChange={(e) => setInvMsg(e.target.value)}
                    placeholder="Hoi! We zouden graag hebben dat jij..."
                    rows={3}
                    className="w-full bg-cream rounded-xl border border-sand px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 transition-all placeholder-ink-muted/40 resize-none"
                  />
                </div>
              </div>

              {invError   && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{invError}</p>}
              {invSuccess && <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2"><Check size={14} /> Uitnodiging verstuurd!</p>}

              <button
                type="submit"
                disabled={invSending || !invEmail.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-terra-500 hover:bg-terra-600 disabled:opacity-50 text-white text-sm font-bold transition-colors"
              >
                {invSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {invSending ? "Versturen…" : "Uitnodiging sturen"}
              </button>
            </form>

            {/* Sent invitations */}
            {invitations.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">Verstuurde uitnodigingen</p>
                <div className="space-y-2">
                  {invitations.map((inv) => {
                    const cfg = INV_STATUS_CFG[inv.status as keyof typeof INV_STATUS_CFG] ?? INV_STATUS_CFG.pending;
                    const respondedDate = inv.respondedAt
                      ? new Date(inv.respondedAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                      : null;
                    return (
                      <div
                        key={inv.id}
                        className={cn(
                          "card-base p-3 flex items-center justify-between gap-3",
                          inv.status === "accepted" && "border-green-200 bg-green-50/40"
                        )}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">{inv.invitedName ?? inv.invitedEmail}</p>
                          <p className="text-xs text-ink-muted truncate">{inv.invitedEmail}</p>
                          {respondedDate && (
                            <p className="text-[11px] text-ink-muted mt-0.5">
                              {inv.status === "accepted" ? "Geaccepteerd" : "Afgewezen"} op {respondedDate}
                            </p>
                          )}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border shrink-0 ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: BERICHTEN ── */}
        {tab === "berichten" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-ink text-sm mb-1">Bericht sturen</h2>
              <p className="text-xs text-ink-muted">
                Stuur een e-mail naar een vrijwilliger of aanmelding. Het bericht wordt verstuurd vanuit Bijeen.
              </p>
            </div>

            {/* Quick fill from applicants */}
            {applications.length > 0 && (
              <div className="card-base p-3">
                <p className="text-xs font-bold text-ink-muted mb-2">Snel invullen vanuit aanmelding</p>
                <div className="flex flex-wrap gap-2">
                  {applications.map(({ application: app, profile }) => profile && (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setMsgEmail(profile.email)}
                      className={cn(
                        "text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors",
                        msgEmail === profile.email
                          ? "bg-terra-100 text-terra-700 border-terra-300"
                          : "bg-cream border-sand text-ink-muted hover:border-gray-300"
                      )}
                    >
                      {profile.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={sendMessage} className="space-y-3">
              <div className="card-base p-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-ink-muted mb-1.5">Ontvanger *</label>
                  <input
                    type="email"
                    required
                    value={msgEmail}
                    onChange={(e) => setMsgEmail(e.target.value)}
                    placeholder="vrijwilliger@email.nl"
                    className="w-full bg-cream rounded-xl border border-sand px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 transition-all placeholder-ink-muted/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-muted mb-1.5">Onderwerp *</label>
                  <input
                    type="text"
                    required
                    value={msgSubject}
                    onChange={(e) => setMsgSubject(e.target.value)}
                    placeholder={`Update over: ${vacancy.title}`}
                    className="w-full bg-cream rounded-xl border border-sand px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 transition-all placeholder-ink-muted/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-muted mb-1.5">Bericht *</label>
                  <textarea
                    required
                    value={msgBody}
                    onChange={(e) => setMsgBody(e.target.value)}
                    placeholder="Schrijf je bericht hier..."
                    rows={5}
                    className="w-full bg-cream rounded-xl border border-sand px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 transition-all placeholder-ink-muted/40 resize-none"
                  />
                </div>
              </div>

              {msgError   && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{msgError}</p>}
              {msgSuccess && <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2"><Check size={14} /> Bericht verstuurd!</p>}

              <button
                type="submit"
                disabled={msgSending || !msgEmail.trim() || !msgSubject.trim() || !msgBody.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-terra-500 hover:bg-terra-600 disabled:opacity-50 text-white text-sm font-bold transition-colors"
              >
                {msgSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {msgSending ? "Versturen…" : "Bericht versturen"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
