"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Clock } from "lucide-react";
import nlDict from "@/i18n/nl.json";
import enDict from "@/i18n/en.json";

type Dict = typeof nlDict;

function getDict(lang: string | null): Dict {
  return lang === "en" ? enDict : nlDict;
}

const INTEREST_KEYS = [
  "interest_networking",
  "interest_workshops",
  "interest_keynotes",
  "interest_innovation",
  "interest_policy",
  "interest_practice",
] as const;

type TicketType = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string | null;
  maxQuantity: number | null;
  soldCount: number | null;
  isActive: boolean | null;
};

type EventData = {
  id: string;
  title: string;
  slug: string;
  websiteColor: string | null;
  ticketTypes: TicketType[];
  maxAttendees: number | null;
  waitlistEnabled: boolean | null;
  attendeeCount: number;
  waitlistCount: number;
  isFull: boolean;
};

export default function RegisterPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const lang = searchParams.get("lang");
  const waitlistToken = searchParams.get("waitlistToken");
  const t = getDict(lang);
  const langParam = lang === "en" ? "?lang=en" : "";

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    role: "",
    ticketTypeId: "",
    interests: [] as string[],
  });

  useEffect(() => {
    fetch(`/api/public/events/${params.slug}`)
      .then(r => r.json())
      .then(data => {
        setEvent(data);
        if (data.ticketTypes?.length === 1) {
          setForm(f => ({ ...f, ticketTypeId: data.ticketTypes[0].id }));
        }
      })
      .catch(() => setError("Event niet gevonden"))
      .finally(() => setLoading(false));
  }, [params.slug]);

  function toggleInterest(key: string) {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(key)
        ? f.interests.filter(i => i !== key)
        : [...f.interests, key],
    }));
  }

  // Event is vol EN wachtlijst is actief EN geen magic link token → wachtlijstmodus
  const isWaitlistMode = !!event?.isFull && !!event?.waitlistEnabled && !waitlistToken;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;
    setSubmitting(true);
    setError(null);

    try {
      if (isWaitlistMode) {
        // Aanmelden op wachtlijst
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: event.id,
            name: form.name,
            email: form.email,
            organization: form.organization,
            role: form.role,
            interests: form.interests,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Wachtlijst mislukt");
        router.push(`/e/${params.slug}/register/waitlist-success?position=${data.position}${langParam ? `&lang=${lang}` : ""}`);
        return;
      }

      const selectedTicket = event.ticketTypes.find(tt => tt.id === form.ticketTypeId);
      const isPaid = selectedTicket && selectedTicket.price > 0;

      if (isPaid) {
        const res = await fetch("/api/payments/multisafepay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, eventId: event.id, slug: params.slug }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Betaling mislukt");
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
          return;
        }
      } else {
        const res = await fetch("/api/attendees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: event.id,
            name: form.name,
            email: form.email,
            organization: form.organization,
            role: form.role,
            interests: form.interests,
            waitlistToken: waitlistToken ?? undefined,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Registratie mislukt");
        }
        router.push(`/e/${params.slug}/register/success${langParam}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is iets misgegaan");
      setSubmitting(false);
    }
  }

  const primaryColor = event?.websiteColor ?? "#C8522A";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Event niet gevonden
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href={`/e/${params.slug}${langParam}`} className="text-gray-500 hover:text-gray-800">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <p className="text-xs text-gray-500">{isWaitlistMode ? "Wachtlijst" : t.register_form_title}</p>
          <p className="text-sm font-semibold text-gray-900 leading-tight">{event.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Wachtlijst-banner */}
        {isWaitlistMode && (
          <div className="rounded-2xl border-2 p-4 flex items-start gap-3" style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}10` }}>
            <Clock size={20} style={{ color: primaryColor }} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm" style={{ color: primaryColor }}>Dit evenement is vol</p>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                Meld je aan voor de wachtlijst. Je bent momenteel <strong>#{event.waitlistCount + 1}</strong> in de rij.
                We sturen je direct een e-mail zodra er een plek vrijkomt.
              </p>
            </div>
          </div>
        )}

        {/* Magic link banner (plek vrijgekomen) */}
        {waitlistToken && (
          <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-4 flex items-start gap-3">
            <span className="text-xl shrink-0">🎉</span>
            <div>
              <p className="font-bold text-sm text-green-800">Er is een plek voor jou!</p>
              <p className="text-xs text-green-700 mt-0.5 leading-relaxed">
                Vul je gegevens in en bevestig je aanmelding. Je plek is 48 uur gereserveerd.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Ticket type — alleen tonen als niet wachtlijst-modus */}
        {!isWaitlistMode && event.ticketTypes.length > 1 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.ticket_type}</label>
            <select
              required
              value={form.ticketTypeId}
              onChange={e => setForm(f => ({ ...f, ticketTypeId: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
            >
              <option value="">{t.select_ticket}</option>
              {event.ticketTypes
                .filter(tt => tt.isActive ?? true)
                .map(tt => (
                  <option key={tt.id} value={tt.id}>
                    {tt.name} {tt.price === 0 ? `(${t.free})` : `(€${(tt.price / 100).toFixed(2)})`}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.name} *</label>
          <input
            required
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-1"
            placeholder="Jan Jansen"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.email} *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-1"
            placeholder="jan@organisatie.nl"
          />
        </div>

        {/* Organization */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.organization}</label>
          <input
            type="text"
            value={form.organization}
            onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-1"
            placeholder="Welzijnsorganisatie"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.role}</label>
          <input
            type="text"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-1"
            placeholder="Manager / Coördinator"
          />
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t.interests}</label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_KEYS.map(key => {
              const label = t[key];
              const active = form.interests.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleInterest(key)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                  style={
                    active
                      ? { backgroundColor: primaryColor, borderColor: primaryColor, color: "#fff" }
                      : { backgroundColor: "#fff", borderColor: "#e5e7eb", color: "#374151" }
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ backgroundColor: isWaitlistMode ? "#6B7280" : primaryColor }}
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting
            ? "Bezig..."
            : isWaitlistMode
            ? "Zet me op de wachtlijst"
            : t.submit}
        </button>
      </form>
    </div>
  );
}
