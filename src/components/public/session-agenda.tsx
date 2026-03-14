"use client";

import { useState } from "react";
import { Check, Clock, MapPin, Users, Loader2, Video } from "lucide-react";
import type { Session } from "@/db/schema";
import { trackEvent } from "@/lib/analytics";

interface Props {
  sessions:       Session[];
  registeredIds:  string[];
  attendeeToken:  string;
  primaryColor:   string;
}

export function SessionAgenda({ sessions, registeredIds: initial, attendeeToken, primaryColor }: Props) {
  const [registered, setRegistered] = useState<Set<string>>(new Set(initial));
  const [pending,    setPending]    = useState<Set<string>>(new Set());

  function formatTime(date: Date | string) {
    return new Date(date).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  }

  async function toggle(session: Session) {
    if (pending.has(session.id)) return;
    const isRegistered = registered.has(session.id);

    setPending(p => new Set(p).add(session.id));
    try {
      const res = await fetch("/api/session-registrations", {
        method:  isRegistered ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ attendeeToken, sessionId: session.id }),
      });

      if (res.ok || res.status === 204) {
        trackEvent(isRegistered ? "session_unregister" : "session_register", {
          session_title: session.title,
          session_id: session.id,
        });
        setRegistered(prev => {
          const next = new Set(prev);
          isRegistered ? next.delete(session.id) : next.add(session.id);
          return next;
        });
      } else if (res.status === 409) {
        alert("Deze sessie is helaas vol.");
      }
    } finally {
      setPending(p => {
        const next = new Set(p);
        next.delete(session.id);
        return next;
      });
    }
  }

  if (sessions.length === 0) {
    return (
      <div className="py-12 text-center text-ink-muted">
        <p className="text-sm">Geen sessies gepland voor dit event</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map(session => {
        const isReg    = registered.has(session.id);
        const isLoading = pending.has(session.id);

        return (
          <div
            key={session.id}
            onClick={() => toggle(session)}
            className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all select-none ${
              isReg
                ? "bg-white border-2"
                : "bg-white border-sand hover:border-gray-300"
            }`}
            style={isReg ? { borderColor: primaryColor } : {}}
          >
            {/* Toggle indicator */}
            <div
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
              style={isReg
                ? { backgroundColor: primaryColor, borderColor: primaryColor }
                : { borderColor: "#d1d5db" }
              }
            >
              {isLoading ? (
                <Loader2 size={12} className="animate-spin text-white" />
              ) : isReg ? (
                <Check size={12} className="text-white" strokeWidth={3} />
              ) : null}
            </div>

            {/* Session info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold leading-snug ${isReg ? "text-ink" : "text-ink"}`}>
                {session.title}
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                <span className="flex items-center gap-1 text-[11px] text-ink-muted">
                  <Clock size={10} />
                  {formatTime(session.startsAt)} – {formatTime(session.endsAt)}
                </span>
                {session.location && (
                  <span className="flex items-center gap-1 text-[11px] text-ink-muted">
                    <MapPin size={10} />
                    {session.location}
                  </span>
                )}
                {session.capacity && (
                  <span className="flex items-center gap-1 text-[11px] text-ink-muted">
                    <Users size={10} />
                    max {session.capacity}
                  </span>
                )}
              </div>
              {session.speaker && (
                <p className="text-[11px] text-ink-muted mt-1 font-medium">
                  {session.speaker}
                  {session.speakerOrg && ` · ${session.speakerOrg}`}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              {isReg && (
                <span
                  className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  Gepland
                </span>
              )}
              {session.isLive && session.streamUrl && (
                <a
                  href={session.streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1 text-[9px] font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-full transition-colors"
                >
                  <Video size={9} />
                  Live
                </a>
              )}
              {session.streamUrl && !session.isLive && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-blue-500 px-2 py-0.5 rounded-full bg-blue-50">
                  <Video size={9} />
                  Online
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
