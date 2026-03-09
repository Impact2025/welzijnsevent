"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Settings, Play, Square } from "lucide-react";
import Link from "next/link";
import { QAMessageCard } from "@/components/live/qa-message";
import { PollWidget } from "@/components/live/poll-widget";
import { getPusherClient, getEventChannel, PUSHER_EVENTS } from "@/lib/pusher";
import type { QAMessage, Poll, Session } from "@/db";

export default function LiveControlPage({ params }: { params: { id: string } }) {
  const [sessions, setSessions]   = useState<Session[]>([]);
  const [messages, setMessages]   = useState<QAMessage[]>([]);
  const [poll, setPoll]           = useState<Poll | null>(null);
  const [activeTab, setActiveTab] = useState<"programma" | "publiek" | "sprekers">("programma");
  const [newCount, setNewCount]   = useState(0);
  const [toast, setToast]         = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    fetch(`/api/sessions?eventId=${params.id}`)
      .then(r => r.json())
      .then(d => setSessions(d.sessions ?? []));

    fetch(`/api/qa?eventId=${params.id}`)
      .then(r => r.json())
      .then(d => {
        setMessages(d.messages ?? []);
        setNewCount((d.messages ?? []).filter((m: QAMessage) => m.status === "nieuw").length);
      });

    fetch(`/api/polls?eventId=${params.id}`)
      .then(r => r.json())
      .then(d => setPoll(d.poll ?? null));
  }, [params.id]);

  // Pusher realtime
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const liveCh = pusher.subscribe(`live-${params.id}`);
    liveCh.bind(PUSHER_EVENTS.QA_NEW, (msg: QAMessage) => {
      setMessages(prev => [msg, ...prev]);
      setNewCount(n => n + 1);
    });
    liveCh.bind(PUSHER_EVENTS.QA_UPDATED, (updated: QAMessage) => {
      setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      if (updated.status !== "nieuw") setNewCount(n => Math.max(0, n - 1));
    });
    liveCh.bind(PUSHER_EVENTS.POLL_UPDATED, (updatedPoll: Poll) => setPoll(updatedPoll));
    liveCh.bind(PUSHER_EVENTS.SESSION_STARTED, (updated: Session) => {
      setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
    });
    liveCh.bind(PUSHER_EVENTS.SESSION_ENDED, (updated: Session) => {
      setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
    });

    const eventCh = pusher.subscribe(getEventChannel(params.id));
    eventCh.bind(PUSHER_EVENTS.ATTENDEE_CHECKIN, ({ name }: { name: string }) => {
      setToast(`${name} heeft ingecheckt`);
      setTimeout(() => setToast(null), 3000);
    });

    return () => {
      pusher.unsubscribe(`live-${params.id}`);
      pusher.unsubscribe(getEventChannel(params.id));
    };
  }, [params.id]);

  const toggleSession = async (session: Session) => {
    const newIsLive = !session.isLive;
    const res = await fetch("/api/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: session.id, isLive: newIsLive, eventId: params.id }),
    });
    const data = await res.json();
    if (data.session) {
      setSessions(prev => prev.map(s => s.id === data.session.id ? data.session : s));
    }
  };

  const handleApprove = async (id: string) => {
    await fetch("/api/qa", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "goedgekeurd", eventId: params.id }),
    });
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/qa", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "verwijderd", eventId: params.id }),
    });
  };

  const liveSession = sessions.find(s => s.isLive);
  const visibleMessages = messages.filter(m => m.status !== "verwijderd");
  const speakers = sessions.flatMap(s =>
    s.speaker ? [{ name: s.speaker, org: s.speakerOrg, session: s.title }] : []
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
          ✓ {toast}
        </div>
      )}

      {/* Dark header */}
      <div className="bg-[#1C1814] text-white px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <Link href={`/dashboard/events/${params.id}`} className="text-white/60 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <button className="text-white/60 hover:text-white">
            <Settings size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-terra-400 animate-pulse" />
          <span className="text-xs font-bold text-terra-400 uppercase tracking-wider">Live Control</span>
        </div>
        {liveSession ? (
          <p className="text-sm text-white/60">{liveSession.title} · Actief</p>
        ) : (
          <p className="text-sm text-white/40">Geen actieve sessie</p>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-[#1C1814] border-b border-white/10 px-4">
        <div className="flex gap-5">
          {(["programma", "publiek", "sprekers"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-semibold capitalize border-b-2 transition-colors relative ${
                activeTab === tab
                  ? "text-terra-400 border-terra-400"
                  : "text-white/40 border-transparent hover:text-white/70"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "publiek" && newCount > 0 && (
                <span className="absolute -top-0.5 -right-3 bg-terra-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {newCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* PROGRAMMA TAB */}
        {activeTab === "programma" && (
          <>
            {sessions.length === 0 ? (
              <p className="text-xs text-ink-muted text-center py-8">Geen sessies gevonden voor dit event</p>
            ) : (
              sessions.map(session => (
                <div
                  key={session.id}
                  className={`rounded-2xl p-4 ${
                    session.isLive ? "bg-[#2A2420] text-white" : "bg-sand/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {session.isLive && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-terra-400 animate-pulse" />
                          <span className="text-[10px] font-bold text-terra-400 uppercase tracking-wider">Live</span>
                        </div>
                      )}
                      <p className={`font-bold text-sm truncate ${session.isLive ? "text-white" : "text-ink"}`}>
                        {session.title}
                      </p>
                      <p className={`text-xs mt-0.5 ${session.isLive ? "text-white/50" : "text-ink-muted"}`}>
                        {session.location ?? "Geen locatie"}
                        {session.speaker && ` · ${session.speaker}`}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSession(session)}
                      className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                        session.isLive
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-terra-500 hover:bg-terra-600 text-white"
                      }`}
                    >
                      {session.isLive ? (
                        <><Square size={10} className="fill-white" /> Stop</>
                      ) : (
                        <><Play size={10} className="fill-white" /> Start</>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* PUBLIEK TAB */}
        {activeTab === "publiek" && (
          <>
            <div>
              <h3 className="text-sm font-bold text-ink flex items-center gap-2 mb-3">
                Live Q&A
                {newCount > 0 && (
                  <span className="bg-terra-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {newCount} nieuw
                  </span>
                )}
              </h3>
              <div className="space-y-2">
                {visibleMessages.slice(0, 8).map(msg => (
                  <QAMessageCard
                    key={msg.id}
                    message={msg}
                    onApprove={handleApprove}
                    onDelete={handleDelete}
                  />
                ))}
                {visibleMessages.length === 0 && (
                  <p className="text-xs text-ink-muted text-center py-4">Nog geen vragen ontvangen</p>
                )}
              </div>
            </div>

            {poll && (
              <PollWidget
                poll={poll}
                onClose={async () => {
                  await fetch("/api/polls", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: poll.id, isActive: false, eventId: params.id }),
                  });
                }}
              />
            )}
          </>
        )}

        {/* SPREKERS TAB */}
        {activeTab === "sprekers" && (
          <>
            {speakers.length === 0 ? (
              <p className="text-xs text-ink-muted text-center py-8">
                Geen sprekers ingesteld bij sessies
              </p>
            ) : (
              <div className="space-y-2">
                {speakers.map((sp, i) => (
                  <div key={i} className="bg-sand/30 rounded-2xl p-4">
                    <p className="font-bold text-sm text-ink">{sp.name}</p>
                    {sp.org && <p className="text-xs text-ink-muted">{sp.org}</p>}
                    <p className="text-xs text-terra-600 mt-1 font-medium">{sp.session}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div className="bg-white border-t border-sand flex justify-around py-2">
        {[
          { label: "Dashboard", icon: "📊", href: "/dashboard" },
          { label: "Events",    icon: "📅", href: "/dashboard/events", active: true },
          { label: "Stats",     icon: "📈", href: `#` },
          { label: "Opties",    icon: "⚙️", href: "/dashboard/instellingen" },
        ].map(item => (
          <Link key={item.label} href={item.href}
            className={`flex flex-col items-center gap-0.5 text-xs font-medium px-3 py-1 ${item.active ? "text-terra-500" : "text-ink-muted"}`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
