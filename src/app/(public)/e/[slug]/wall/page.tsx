"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { EventNav } from "@/components/public/event-nav";
import { Loader2, Send, ImageIcon, Heart } from "lucide-react";
import { getPusherClient, getLiveChannel } from "@/lib/pusher";

type Post = {
  id: string;
  authorName: string;
  content: string;
  imageUrl: string | null;
  reactions: Record<string, number>;
  createdAt: string;
};

const EMOJIS = ["❤️", "👏", "🔥", "💡", "🙌"];

export default function SocialWallPage() {
  const params = useParams<{ slug: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventId, setEventId] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#C8522A");
  const [eventTitle, setEventTitle] = useState("");

  const [form, setForm] = useState({ name: "", content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Haal event info + posts op
  useEffect(() => {
    fetch(`/api/public/events/${params.slug}`)
      .then(r => r.json())
      .then(data => {
        setEventId(data.id);
        setPrimaryColor(data.websiteColor ?? "#C8522A");
        setEventTitle(data.title);
        return fetch(`/api/social-wall?eventId=${data.id}`);
      })
      .then(r => r.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.slug]);

  // Pusher realtime
  useEffect(() => {
    if (!eventId) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(getLiveChannel(eventId));
    channel.bind("wall:new", (post: Post) => {
      setPosts(prev => [post, ...prev]);
    });
    channel.bind("wall:reaction", ({ postId, reactions }: { postId: string; reactions: Record<string, number> }) => {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, reactions } : p));
    });
    channel.bind("wall:deleted", ({ postId }: { postId: string }) => {
      setPosts(prev => prev.filter(p => p.id !== postId));
    });
    channel.bind("wall:moderated", ({ postId, status }: { postId: string; status: string }) => {
      if (status === "hidden") setPosts(prev => prev.filter(p => p.id !== postId));
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(getLiveChannel(eventId));
    };
  }, [eventId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!eventId || !form.name.trim() || !form.content.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/social-wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          authorName: form.name,
          content: form.content,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Mislukt");
      setForm(f => ({ ...f, content: "" }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is iets misgegaan");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReact(postId: string, emoji: string) {
    await fetch("/api/social-wall", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, emoji }),
    });
  }

  function getInitials(name: string) {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  }

  function getAvatarColor(name: string) {
    const colors = ["#C8522A", "#2D5A3D", "#6B4E9E", "#1E7BB5", "#B5831E"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EventNav slug={params.slug} eventTitle={eventTitle} primaryColor={primaryColor} />

      <div className="max-w-2xl mx-auto px-4 py-5 pb-24 space-y-4">

        {/* Post formulier */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <p className="text-sm font-bold text-gray-800">Deel een bericht</p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-100 text-green-700 text-xs rounded-xl px-3 py-2">
              Je bericht is geplaatst!
            </div>
          )}

          <input
            type="text"
            placeholder="Jouw naam"
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
          />

          <textarea
            placeholder="Deel je gedachten, een quote of een foto-beschrijving..."
            required
            maxLength={500}
            rows={3}
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{form.content.length}/500</span>
            <button
              type="submit"
              disabled={submitting || !form.name.trim() || !form.content.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: primaryColor }}
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Plaatsen
            </button>
          </div>
        </form>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm font-semibold text-gray-400">Nog geen berichten</p>
            <p className="text-xs text-gray-300 mt-1">Wees de eerste die iets deelt!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: getAvatarColor(post.authorName) }}
                  >
                    {getInitials(post.authorName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{post.authorName}</p>
                    <p className="text-xs text-gray-400 mb-2">
                      {new Date(post.createdAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  </div>
                </div>

                {/* Reacties */}
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2 flex-wrap">
                  {EMOJIS.map(emoji => {
                    const count = post.reactions?.[emoji] ?? 0;
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleReact(post.id, emoji)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition-all border ${
                          count > 0
                            ? "bg-orange-50 border-orange-200 font-semibold"
                            : "bg-gray-50 border-gray-100 text-gray-400"
                        }`}
                      >
                        <span>{emoji}</span>
                        {count > 0 && <span className="text-xs text-gray-600">{count}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
