"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Check, X, HandHeart, Clock, MapPin, Users, AlertTriangle } from "lucide-react";

type InvitationData = {
  vacancyTitle: string;
  eventTitle: string;
  category: string | null;
  location: string | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  spotsAvailable: number | null;
  personalMessage: string | null;
  invitedName: string | null;
  expiresAt: string;
  status: string;
};

export default function UitnodigingPage() {
  const params = useParams<{ token: string }>();

  const [data,       setData]       = useState<InvitationData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [responding, setResponding] = useState(false);
  const [result,     setResult]     = useState<"accepted" | "declined" | null>(null);
  const [error,      setError]      = useState("");
  const [motivation, setMotivation] = useState("");

  useEffect(() => {
    fetch(`/api/public/invitation/${params.token}`)
      .then((r) => r.json())
      .then((d) => setData(d.invitation ?? null))
      .catch(() => setError("Uitnodiging niet gevonden"))
      .finally(() => setLoading(false));
  }, [params.token]);

  async function respond(action: "accept" | "decline") {
    setResponding(true);
    setError("");
    try {
      const res = await fetch("/api/vacancy-invitations/respond", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token, action, motivation: motivation || null }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Er ging iets mis"); return; }
      setResult(action === "accept" ? "accepted" : "declined");
    } catch {
      setError("Er ging iets mis. Probeer opnieuw.");
    } finally {
      setResponding(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-ink-muted" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-sand p-8 max-w-sm w-full text-center">
          <AlertTriangle size={32} className="mx-auto mb-3 text-orange-400" />
          <p className="font-bold text-ink mb-1">Uitnodiging niet gevonden</p>
          <p className="text-sm text-ink-muted">Deze uitnodiging is verlopen of ongeldig.</p>
        </div>
      </div>
    );
  }

  if (result === "accepted") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-sand p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center mx-auto mb-4">
            <Check size={30} className="text-white" strokeWidth={3} />
          </div>
          <h1 className="text-xl font-bold text-ink mb-2">Aanmelding bevestigd!</h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            Geweldig! Je aanmelding voor <strong>{data?.vacancyTitle}</strong> is ontvangen.
            De organisatie neemt contact met je op.
          </p>
        </div>
      </div>
    );
  }

  if (result === "declined") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-sand p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-sand flex items-center justify-center mx-auto mb-4">
            <X size={30} className="text-ink-muted" />
          </div>
          <h1 className="text-xl font-bold text-ink mb-2">Uitnodiging afgewezen</h1>
          <p className="text-sm text-ink-muted">
            Bedankt voor je reactie. We hopen je een andere keer te mogen verwelkomen!
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isAlreadyAnswered = data.status !== "pending";
  const firstName = data.invitedName?.split(" ")[0] ?? "daar";

  return (
    <div className="min-h-screen bg-cream pb-32">
      {/* Header */}
      <div className="bg-terra-500 text-white px-4 pt-10 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <HandHeart size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white/75 text-xs font-semibold mb-0.5">Uitnodiging voor vrijwilligersvacature</p>
            <h1 className="text-lg font-bold">{data.eventTitle}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-4 py-6 space-y-4">
        {isAlreadyAnswered && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 rounded-xl p-4 text-sm font-medium flex items-center gap-2">
            <AlertTriangle size={16} />
            Je hebt deze uitnodiging al beantwoord.
          </div>
        )}

        {/* Greeting */}
        <div className="bg-white rounded-2xl border border-sand p-5">
          <p className="text-base font-bold text-ink mb-1">Hoi {firstName}!</p>
          <p className="text-sm text-ink-muted leading-relaxed">
            Je bent uitgenodigd als vrijwilliger voor het evenement <strong>{data.eventTitle}</strong>.
          </p>
        </div>

        {/* Personal message */}
        {data.personalMessage && (
          <div className="bg-terra-50 border-l-4 border-terra-400 rounded-r-2xl p-4">
            <p className="text-xs font-bold text-terra-600 uppercase tracking-wider mb-2">Persoonlijk bericht</p>
            <p className="text-sm text-ink leading-relaxed">{data.personalMessage}</p>
          </div>
        )}

        {/* Vacancy info */}
        <div className="bg-white rounded-2xl border border-sand p-5">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">Vacature</p>
          <p className="font-bold text-ink text-base mb-3">{data.vacancyTitle}</p>
          <div className="flex flex-wrap gap-2">
            {data.spotsAvailable != null && (
              <span className="flex items-center gap-1.5 text-xs text-ink-muted bg-cream rounded-lg px-2.5 py-1.5">
                <Users size={11} /> {data.spotsAvailable} plekken
              </span>
            )}
            {data.shiftStart && data.shiftEnd && (
              <span className="flex items-center gap-1.5 text-xs text-ink-muted bg-cream rounded-lg px-2.5 py-1.5">
                <Clock size={11} /> {data.shiftStart}–{data.shiftEnd}
              </span>
            )}
            {data.location && (
              <span className="flex items-center gap-1.5 text-xs text-ink-muted bg-cream rounded-lg px-2.5 py-1.5">
                <MapPin size={11} /> {data.location}
              </span>
            )}
          </div>
        </div>

        {/* Motivation (only for accept) */}
        {!isAlreadyAnswered && (
          <div className="bg-white rounded-2xl border border-sand p-5">
            <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
              Motivatie <span className="font-normal">(optioneel)</span>
            </label>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Waarom wil je deze taak op je nemen?"
              rows={3}
              className="w-full bg-cream rounded-xl border border-sand px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 transition-all placeholder-ink-muted/40 resize-none"
            />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      {!isAlreadyAnswered && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-sand px-4 py-3 pb-safe">
          <div className="max-w-sm mx-auto flex gap-3">
            <button
              type="button"
              onClick={() => respond("decline")}
              disabled={responding}
              className="flex-1 py-3 rounded-2xl border-2 border-sand text-sm font-bold text-ink-muted hover:bg-sand disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {responding ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              Afwijzen
            </button>
            <button
              type="button"
              onClick={() => respond("accept")}
              disabled={responding}
              className="flex-[2] py-3 rounded-2xl bg-terra-500 hover:bg-terra-600 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {responding ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Ik doe mee!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
