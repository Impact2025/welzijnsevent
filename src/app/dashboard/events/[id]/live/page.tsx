"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Settings, Play, Square, EyeOff, Eye, Trash2, Bell, Send, Video, X, ScanLine } from "lucide-react";
import Link from "next/link";
import { QAMessageCard } from "@/components/live/qa-message";
import { PollWidget } from "@/components/live/poll-widget";
import { getPusherClient, getEventChannel, PUSHER_EVENTS } from "@/lib/pusher";
import type { QAMessage, Poll, Session, SocialWallPost } from "@/db";
import { EventTabs } from "@/components/events/event-tabs";

export default function LiveControlPage({ params }: { params: { id: string } }) {
  const [sessions, setSessions]   = useState<Session[]>([]);
  const [messages, setMessages]   = useState<QAMessage[]>([]);
  const [poll, setPoll]           = useState<Poll | null>(null);
  const [wallPosts, setWallPosts] = useState<SocialWallPost[]>([]);
  const [activeTab, setActiveTab] = useState<"programma" | "publiek" | "wall" | "sprekers">("programma");
  const [newCount, setNewCount]   = useState(0);
  const [newWallCount, setNewWallCount] = useState(0);
  const [toast, setToast]         = useState<string | null>(null);
  const [eventType, setEventType] = useState<string>("programma");

  // Fetch initial data
  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then(r => r.json())
      .then(d => setEventType(d.event?.eventType ?? "programma"));

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

    fetch(`/api/social-wall?eventId=${params.id}`)
      .then(r => r.json())
      .then(d => {
        // Load all posts including hidden for moderation
        fetch(`/api/social-wall?eventId=${params.id}&all=true`)
          .then(r2 => r2.json())
          .then(d2 => setWallPosts(Array.isArray(d2) ? d2 : []));
      });
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
    liveCh.bind("wall:new", (post: SocialWallPost) => {
      setWallPosts(prev => [post, ...prev]);
      setNewWallCount(n => n + 1);
    });
    liveCh.bind("wall:moderated", ({ postId, status }: { postId: string; status: string }) => {
      setWallPosts(prev => prev.map(p => p.id === postId ? { ...p, status } : p));
    });
    liveCh.bind("wall:deleted", ({ postId }: { postId: string }) => {
      setWallPosts(prev => prev.filter(p => p.id !== postId));
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

  const handleWallModerate = async (postId: string, status: "visible" | "hidden") => {
    await fetch(`/api/social-wall/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setWallPosts(prev => prev.map(p => p.id === postId ? { ...p, status } : p));
  };

  const handleWallDelete = async (postId: string) => {
    await fetch(`/api/social-wall/${postId}`, { method: "DELETE" });
    setWallPosts(prev => prev.filter(p => p.id !== postId));
  };

  const liveSession = sessions.find(s => s.isLive);
  const visibleMessages = messages.filter(m => m.status !== "verwijderd");
  const speakers = sessions.flatMap(s =>
    s.speaker ? [{ name: s.speaker, org: s.speakerOrg, session: s.title }] : []
  );

  // ── Stream URL editing state ───────────────────────────────
  const [streamEdit, setStreamEdit]   = useState<string | null>(null); // sessionId being edited
  const [streamInput, setStreamInput] = useState("");

  async function saveStreamUrl(sessionId: string) {
    const res = await fetch("/api/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sessionId, streamUrl: streamInput || null }),
    });
    const data = await res.json();
    if (data.session) {
      setSessions(prev => prev.map(s => s.id === data.session.id ? data.session : s));
    }
    setStreamEdit(null);
    setStreamInput("");
  }

  // ── Push notification panel state ─────────────────────────
  const [pushTitle, setPushTitle]   = useState("");
  const [pushBody, setPushBody]     = useState("");
  const [pushSending, setPushSending] = useState(false);

  async function sendPush() {
    if (!pushTitle.trim() || !pushBody.trim()) return;
    setPushSending(true);
    try {
      await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: params.id, title: pushTitle.trim(), body: pushBody.trim() }),
      });
      setPushTitle("");
      setPushBody("");
      setToast("Notificatie verstuurd");
    } finally {
      setPushSending(false);
    }
  }

  return (
    <div className="w-full md:max-w-4xl md:mx-auto min-h-screen bg-white flex flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
          ✓ {toast}
        </div>
      )}

      <EventTabs eventId={params.id} eventType={eventType} />

      {/* Dark header */}
      <div className="bg-[#1C1814] text-white px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <Link
            href={`/dashboard/events/${params.id}/scan`}
            className="flex items-center gap-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
          >
            <ScanLine size={13} />
            Check-in scanner
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
        <div className="flex gap-5 overflow-x-auto scrollbar-hide">
          {(["programma", "publiek", "wall", "sprekers"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "wall") setNewWallCount(0);
              }}
              className={`py-3 text-sm font-semibold capitalize border-b-2 transition-colors relative shrink-0 ${
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
              {tab === "wall" && newWallCount > 0 && (
                <span className="absolute -top-0.5 -right-3 bg-blue-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {newWallCount}
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

                  {/* Stream URL row */}
                  {streamEdit === session.id ? (
                    <div className="mt-2.5 flex gap-2">
                      <input
                        value={streamInput}
                        onChange={e => setStreamInput(e.target.value)}
                        placeholder="https://youtube.com/live/..."
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-terra-400"
                      />
                      <button
                        onClick={() => saveStreamUrl(session.id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => { setStreamEdit(null); setStreamInput(""); }}
                        className="p-1.5 rounded-lg text-white/40 hover:text-white/70"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setStreamEdit(session.id); setStreamInput(session.streamUrl ?? ""); }}
                      className={`mt-2 flex items-center gap-1.5 text-[10px] font-bold transition-colors ${
                        session.streamUrl
                          ? "text-blue-400 hover:text-blue-300"
                          : session.isLive ? "text-white/30 hover:text-white/60" : "text-ink-muted/50 hover:text-ink-muted"
                      }`}
                    >
                      <Video size={10} />
                      {session.streamUrl ? "Stream URL instellen" : "Stream URL toevoegen"}
                    </button>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {/* Push notification panel — always in programma tab */}
        {activeTab === "programma" && (
          <div className="rounded-2xl bg-[#2A2420] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-terra-400" />
              <h3 className="text-sm font-bold text-white">Stuur pushmelding</h3>
            </div>
            <input
              value={pushTitle}
              onChange={e => setPushTitle(e.target.value)}
              placeholder="Titel  (bv. Lunch begint zo)"
              maxLength={60}
              className="w-full px-3 py-2 rounded-xl bg-white/10 text-white text-sm placeholder-white/30 border border-white/10 focus:outline-none focus:border-terra-400"
            />
            <input
              value={pushBody}
              onChange={e => setPushBody(e.target.value)}
              placeholder="Bericht (bv. Zie je bij de entree)"
              maxLength={120}
              className="w-full px-3 py-2 rounded-xl bg-white/10 text-white text-sm placeholder-white/30 border border-white/10 focus:outline-none focus:border-terra-400"
            />
            <button
              onClick={sendPush}
              disabled={pushSending || !pushTitle.trim() || !pushBody.trim()}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-terra-500 hover:bg-terra-600 text-white text-sm font-bold transition-colors disabled:opacity-40"
            >
              <Send size={13} />
              {pushSending ? "Versturen..." : "Verstuur naar abonnees"}
            </button>
          </div>
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

        {/* WALL TAB */}
        {activeTab === "wall" && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-ink">Sociale Wall</h3>
              <span className="text-xs text-ink-muted">{wallPosts.length} berichten</span>
            </div>
            {wallPosts.length === 0 ? (
              <p className="text-xs text-ink-muted text-center py-8">Nog geen berichten op de wall</p>
            ) : (
              <div className="space-y-2">
                {wallPosts.map(post => (
                  <div
                    key={post.id}
                    className={`rounded-2xl p-4 border ${
                      post.status === "hidden" ? "bg-red-50 border-red-100 opacity-60" : "bg-sand/30 border-sand"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink">{post.authorName}</p>
                        <p className="text-xs text-ink-muted mt-1 line-clamp-2 leading-relaxed">{post.content}</p>
                        {post.status === "hidden" && (
                          <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Verborgen</span>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => handleWallModerate(post.id, post.status === "visible" ? "hidden" : "visible")}
                          className={`p-2 rounded-xl transition-colors ${
                            post.status === "visible"
                              ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                              : "bg-green-100 text-green-600 hover:bg-green-200"
                          }`}
                        >
                          {post.status === "visible" ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button
                          onClick={() => handleWallDelete(post.id)}
                          className="p-2 rounded-xl bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

    </div>
  );
}
