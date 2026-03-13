"use client";

import { useState } from "react";
import { Star, CheckCircle2, Loader2 } from "lucide-react";

interface Session {
  id: string;
  title: string;
  speaker: string | null;
}

interface Props {
  sessions: Session[];
  attendeeToken: string;
  primaryColor: string;
}

function StarRating({
  value,
  onChange,
  primaryColor,
}: {
  value: number;
  onChange: (v: number) => void;
  primaryColor: string;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            size={22}
            fill={(hover || value) >= star ? primaryColor : "none"}
            stroke={(hover || value) >= star ? primaryColor : "#C0B8B0"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

export function SessionFeedback({ sessions, attendeeToken, primaryColor }: Props) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (sessions.length === 0) return null;

  async function handleSubmit(sessionId: string) {
    const rating = ratings[sessionId];
    if (!rating) return;

    setSubmitting((p) => ({ ...p, [sessionId]: true }));
    setErrors((p) => ({ ...p, [sessionId]: "" }));

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          attendeeToken,
          rating,
          comment: comments[sessionId] || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setSubmitted((p) => ({ ...p, [sessionId]: true }));
    } catch (e) {
      setErrors((p) => ({
        ...p,
        [sessionId]: e instanceof Error ? e.message : "Fout",
      }));
    } finally {
      setSubmitting((p) => ({ ...p, [sessionId]: false }));
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
        Sessie-feedback
      </p>
      {sessions.map((session) => (
        <div
          key={session.id}
          className="border border-sand rounded-2xl overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-sand bg-cream/50">
            <p className="text-sm font-bold text-ink">{session.title}</p>
            {session.speaker && (
              <p className="text-xs text-ink-muted mt-0.5">{session.speaker}</p>
            )}
          </div>

          {submitted[session.id] ? (
            <div className="px-4 py-3 flex items-center gap-2 text-green-700 bg-green-50">
              <CheckCircle2 size={15} />
              <span className="text-sm font-semibold">Bedankt voor je feedback!</span>
            </div>
          ) : (
            <div className="px-4 py-3 space-y-3">
              <StarRating
                value={ratings[session.id] ?? 0}
                onChange={(v) => setRatings((p) => ({ ...p, [session.id]: v }))}
                primaryColor={primaryColor}
              />
              {ratings[session.id] && (
                <>
                  <textarea
                    value={comments[session.id] ?? ""}
                    onChange={(e) =>
                      setComments((p) => ({ ...p, [session.id]: e.target.value }))
                    }
                    placeholder="Optionele toelichting…"
                    rows={2}
                    className="w-full text-sm text-ink bg-sand/40 rounded-xl px-3 py-2 outline-none focus:ring-2 resize-none placeholder-ink-muted/40"
                    style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                  />
                  {errors[session.id] && (
                    <p className="text-xs text-red-500">{errors[session.id]}</p>
                  )}
                  <button
                    onClick={() => handleSubmit(session.id)}
                    disabled={submitting[session.id]}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {submitting[session.id] ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : null}
                    {submitting[session.id] ? "Versturen…" : "Feedback sturen"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
