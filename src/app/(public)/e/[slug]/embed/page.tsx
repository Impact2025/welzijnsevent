"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";

type EventData = {
  id: string;
  title: string;
  slug: string;
  websiteColor: string | null;
  maxAttendees: number | null;
  waitlistEnabled: boolean | null;
  attendeeCount: number;
  isFull: boolean;
  customFields: CustomField[];
};

type CustomField = {
  id: string;
  label: string;
  type: string;
  options: string[];
  required: boolean;
};

export default function EmbedPage() {
  const params       = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [event, setEvent]       = useState<EventData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [organization, setOrg]    = useState("");
  const [role, setRole]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [customResponses, setCustomResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/public/events/${params.slug}/registration-info`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); } else { setEvent(data); }
        setLoading(false);
      })
      .catch(() => { setError("Kon evenement niet laden"); setLoading(false); });
  }, [params.slug]);

  // Send height to parent window for iframe resizing
  useEffect(() => {
    const sendHeight = () => {
      const h = document.body.scrollHeight;
      window.parent.postMessage({ type: "bijeen-embed-height", height: h }, "*");
    };
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);
    sendHeight();
    return () => observer.disconnect();
  }, [submitted, loading]);

  const primaryColor = event?.websiteColor ?? "#C8522A";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          name,
          email,
          organization: organization || undefined,
          role: role || undefined,
          customResponses,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Aanmelding mislukt");
      } else {
        setSubmitted(true);
      }
    } catch {
      setFormError("Netwerkfout — probeer opnieuw");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[160px]">
        <Loader2 size={20} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl">
        {error ?? "Evenement niet gevonden"}
      </div>
    );
  }

  if (event.isFull && !event.waitlistEnabled) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm font-semibold text-gray-700">Dit evenement is volgeboekt.</p>
        <p className="text-xs text-gray-500 mt-1">Er zijn geen plaatsen meer beschikbaar.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: `${primaryColor}20` }}>
          <CheckCircle2 size={24} style={{ color: primaryColor }} />
        </div>
        <p className="text-base font-bold text-gray-900">Aanmelding bevestigd!</p>
        <p className="text-sm text-gray-500">
          Je ontvangt een bevestiging op <strong>{email}</strong> met je ticket.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 font-sans">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: transparent; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      `}</style>

      <p className="text-xs text-gray-500 mb-4 font-medium">
        Aanmelden voor <strong className="text-gray-700">{event.title}</strong>
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Naam *</label>
          <input
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Jouw naam"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">E-mailadres *</label>
          <input
            required
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="naam@organisatie.nl"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Organisatie</label>
          <input
            value={organization}
            onChange={e => setOrg(e.target.value)}
            placeholder="Naam van je organisatie"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Functie</label>
          <input
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="Jouw functie"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition bg-white"
          />
        </div>

        {/* Custom fields */}
        {event.customFields?.map((field) => (
          <div key={field.id}>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {field.label}{field.required && " *"}
            </label>
            {field.type === "select" ? (
              <select
                required={field.required}
                value={customResponses[field.id] ?? ""}
                onChange={e => setCustomResponses(prev => ({ ...prev, [field.id]: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition bg-white"
              >
                <option value="">Kies een optie...</option>
                {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                required={field.required}
                value={customResponses[field.id] ?? ""}
                onChange={e => setCustomResponses(prev => ({ ...prev, [field.id]: e.target.value }))}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition bg-white resize-none"
              />
            ) : (
              <input
                required={field.required}
                type={field.type === "email" ? "email" : "text"}
                value={customResponses[field.id] ?? ""}
                onChange={e => setCustomResponses(prev => ({ ...prev, [field.id]: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition bg-white"
              />
            )}
          </div>
        ))}

        {formError && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ backgroundColor: primaryColor }}
        >
          {submitting ? <><Loader2 size={14} className="animate-spin" /> Aanmelden...</> : "Aanmelden"}
        </button>
      </form>

      <p className="text-[10px] text-gray-400 mt-3 text-center">
        Aangemeld via <span className="font-semibold">Bijeen</span>
      </p>
    </div>
  );
}
