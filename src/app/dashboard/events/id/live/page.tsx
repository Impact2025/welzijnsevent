"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Settings, Users } from "lucide-react";
import Link from "next/link";
import { QAMessageCard } from "@/components/live/qa-message";
import { PollWidget } from "@/components/live/poll-widget";
import { getPusherClient, getEventChannel, PUSHER_EVENTS } from "@/lib/pusher";
import type { QAMessage, Poll } from "@/db";

// Note: In real app, fetch these from API based on params.id
const MOCK_SESSION = {
  title: "Impact van Vrijwilligers",
  time: "10:00 – 11:30",
  location: "Grote Zaal",
};

export default function LiveControlPage({ params }: { params: { id: string } }) {
  const [messages, setMessages]     = useState<QAMessage[]>([]);
  const [poll, setPoll]             = useState<Poll | null>(null);
  const [activeTab, setActiveTab]   = useState<"programma" | "sprekers" | "publiek">("programma");
  const [newCount, setNewCount]     = useState(0);

  // Fetch initial Q&A
  useEffect(() => {
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
    const channel = pusher.subscribe(`live-${params.id}`);

    channel.bind(PUSHER_EVENTS.QA_NEW, (msg: QAMessage) => {
      setMessages(prev => [msg, ...prev]);
      setNewCount(n => n + 1);
    });

    channel.bind(PUSHER_EVENTS.QA_UPDATED, (updated: QAMessage) => {
      setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      if (updated.status !== "nieuw") setNewCount(n => Math.max(0, n - 1));
    });

    channel.bind(PUSHER_EVENTS.POLL_UPDATED, (updatedPoll: Poll) => {
      setPoll(updatedPoll);
    });

    return () => {
      pusher.unsubscribe(`live-${params.id}`);
    };
  }, [params.id]);

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

  const visibleMessages = messages.filter(m => m.status !== "verwijderd");

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col">
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
        <p className="text-sm text-white/60">Buurtcentrum De Maten · Live</p>
      </div>

      {/* Tabs */}
      <div className="bg-[#1C1814] border-b border-white/10 px-4">
        <div className="flex gap-5">
          {(["programma", "sprekers", "publiek"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-semibold capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? "text-terra-400 border-terra-400"
                  : "text-white/40 border-transparent hover:text-white/70"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Current session */}
        <div className="bg-[#2A2420] rounded-2xl p-4 text-white">
          <p className="text-xs text-white/50 mb-2 uppercase tracking-wider font-semibold">Huidige Sessie</p>
          <h2 className="font-bold text-base mb-1">{MOCK_SESSION.title}</h2>
          <p className="text-xs text-white/60 mb-4">{MOCK_SESSION.time} · {MOCK_SESSION.location}</p>
          <div className="flex gap-2">
            <button className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
              Stop Sessie
            </button>
            <button className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
              Aankondiging
            </button>
          </div>
        </div>

        {/* Live Q&A */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              Live Q&A
              {newCount > 0 && (
                <span className="bg-terra-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {newCount} nieuw
                </span>
              )}
            </h3>
          </div>
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

        {/* Poll */}
        {poll && (
          <PollWidget
            poll={poll}
            onClose={async () => {
              await fetch("/api/polls", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: poll.id, isActive: false }),
              });
            }}
          />
        )}
      </div>

      {/* Bottom nav */}
      <div className="bg-white border-t border-sand flex justify-around py-2">
        {[
          { label: "Dashboard", icon: "📊", href: "/dashboard" },
          { label: "Chat",      icon: "💬", href: "#" },
          { label: "Stats",     icon: "📈", href: `#` },
          { label: "Leden",     icon: "👥", href: `#` },
        ].map(item => (
          <Link key={item.label} href={item.href}
            className="flex flex-col items-center gap-0.5 text-xs font-medium text-ink-muted px-3 py-1"
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
