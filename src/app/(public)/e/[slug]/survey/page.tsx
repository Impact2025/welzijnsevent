"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2, Star, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

type SurveyQuestion = {
  id: string;
  label: string;
  type: "rating" | "text" | "yesno" | "nps";
  required?: boolean;
};

type SurveyData = {
  eventId: string;
  eventTitle: string;
  surveyQuestions: SurveyQuestion[];
};

export default function SurveyPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const attendeeId = searchParams.get("a");

  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [overallRating, setOverallRating] = useState<number | null>(null);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [highlights, setHighlights] = useState("");
  const [improvements, setImprovements] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/survey?slug=${params.slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setSurvey(data);
      })
      .catch(() => setError("Enquête niet gevonden"))
      .finally(() => setLoading(false));
  }, [params.slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!survey) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: survey.eventId,
          attendeeId: attendeeId ?? undefined,
          overallRating,
          npsScore,
          highlights: highlights.trim() || undefined,
          improvements: improvements.trim() || undefined,
          wouldRecommend,
          customAnswers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Mislukt");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is iets misgegaan");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="text-gray-500 text-sm">{error}</p>
        <Link href={`/e/${params.slug}`} className="mt-4 text-sm text-blue-500 underline">
          Terug naar evenement
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Bedankt voor je feedback!</h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Je reactie helpt ons om {survey?.eventTitle} en toekomstige evenementen nog beter te maken.
          </p>
          <Link
            href={`/e/${params.slug}`}
            className="inline-block bg-gray-900 text-white text-sm font-semibold px-6 py-3 rounded-xl"
          >
            Terug naar evenement
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href={`/e/${params.slug}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <p className="text-xs text-gray-500">Tevredenheidsonderzoek</p>
          <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{survey?.eventTitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Algemene beoordeling */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-800 mb-1">Hoe beoordeel je dit evenement?</p>
          <p className="text-xs text-gray-400 mb-4">Geef een beoordeling van 1 tot 5 sterren</p>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setOverallRating(n)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  size={36}
                  className={overallRating && n <= overallRating ? "text-amber-400 fill-amber-400" : "text-gray-200"}
                />
              </button>
            ))}
          </div>
          {overallRating && (
            <p className="text-center text-xs text-gray-500 mt-2">
              {["", "Slecht", "Matig", "Goed", "Zeer goed", "Uitstekend"][overallRating]}
            </p>
          )}
        </div>

        {/* NPS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-800 mb-1">
            Hoe waarschijnlijk is het dat je ons aanbeveelt?
          </p>
          <p className="text-xs text-gray-400 mb-4">0 = zeker niet · 10 = absoluut</p>
          <div className="flex gap-1 flex-wrap justify-center">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setNpsScore(n)}
                className={`w-9 h-9 rounded-xl text-sm font-bold border transition-all ${
                  npsScore === n
                    ? "bg-gray-900 text-white border-gray-900"
                    : n >= 9
                    ? "border-green-200 text-green-700 hover:bg-green-50"
                    : n >= 7
                    ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                    : "border-red-200 text-red-700 hover:bg-red-50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Aanbevelen */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-800 mb-4">
            Zou je dit evenement aanbevelen aan een collega?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: true, label: "Ja, zeker!", emoji: "👍" },
              { value: false, label: "Nee, waarschijnlijk niet", emoji: "👎" },
            ].map(opt => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setWouldRecommend(opt.value)}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                  wouldRecommend === opt.value
                    ? opt.value
                      ? "bg-green-50 border-green-300 text-green-700"
                      : "bg-red-50 border-red-300 text-red-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Wat vond je het beste aan dit evenement?
          </label>
          <p className="text-xs text-gray-400 mb-3">Optioneel — deel wat goed ging</p>
          <textarea
            rows={3}
            value={highlights}
            onChange={e => setHighlights(e.target.value)}
            placeholder="De workshops waren super relevant..."
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
          />
        </div>

        {/* Verbeterpunten */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Wat kan beter?
          </label>
          <p className="text-xs text-gray-400 mb-3">Optioneel — je feedback helpt ons groeien</p>
          <textarea
            rows={3}
            value={improvements}
            onChange={e => setImprovements(e.target.value)}
            placeholder="Meer pauzetijd zou fijn zijn..."
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
          />
        </div>

        {/* Custom vragen */}
        {survey?.surveyQuestions?.map(q => (
          <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-bold text-gray-800 mb-3">
              {q.label} {q.required && <span className="text-red-500">*</span>}
            </label>
            {q.type === "text" && (
              <textarea
                rows={3}
                required={q.required}
                value={customAnswers[q.id] ?? ""}
                onChange={e => setCustomAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
              />
            )}
            {q.type === "yesno" && (
              <div className="grid grid-cols-2 gap-3">
                {["Ja", "Nee"].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setCustomAnswers(a => ({ ...a, [q.id]: opt }))}
                    className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      customAnswers[q.id] === opt
                        ? "bg-gray-900 text-white border-gray-900"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-2xl bg-gray-900 text-white font-bold text-sm transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Versturen..." : "Verstuur mijn feedback"}
        </button>

        <p className="text-center text-xs text-gray-400 pb-6">
          Je feedback is anoniem en wordt alleen intern gebruikt.
        </p>
      </form>
    </div>
  );
}
