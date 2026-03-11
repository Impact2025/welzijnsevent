"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  FormEvent,
} from "react";
import Link from "next/link";
import { MessageCircle, X, Send, ArrowRight, Sparkles, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const QUICK_PROMPTS = [
  "Wat kost Bijeen?",
  "Wat is AI-netwerkkoppeling?",
  "Hoe begin ik?",
  "Voor welke organisaties is dit?",
];

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>([]);

  // Keep ref in sync so sendMessage closure always has fresh messages
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Stop pulsing after 8s
  useEffect(() => {
    const t = setTimeout(() => setShowPulse(false), 8000);
    return () => clearTimeout(t);
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened; abort on close
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120);
    } else {
      abortRef.current?.abort();
    }
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMessage: Message = { role: "user", content: text.trim() };
      const history = [...messagesRef.current, userMessage];

      setMessages(history);
      setInput("");
      setLoading(true);

      // Placeholder for streaming response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", streaming: true },
      ]);

      try {
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch("/api/ai/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map(({ role, content }) => ({ role, content })),
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) throw new Error("upstream_error");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") continue;
            try {
              const delta =
                JSON.parse(payload).choices?.[0]?.delta?.content ?? "";
              if (delta) {
                accumulated += delta;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last?.streaming) {
                    updated[updated.length - 1] = {
                      ...last,
                      content: accumulated,
                    };
                  }
                  return updated;
                });
              }
            } catch {
              // ignore malformed SSE lines
            }
          }
        }

        // Finalise — remove streaming flag
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.streaming) {
            updated[updated.length - 1] = { ...last, streaming: false };
          }
          return updated;
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.streaming) {
            updated[updated.length - 1] = {
              role: "assistant",
              content:
                "Sorry, er ging iets mis. Probeer het opnieuw.",
              streaming: false,
            };
          }
          return updated;
        });
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* ── Floating button ───────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50">
        {showPulse && !open && (
          <span className="absolute inset-0 rounded-full animate-ping bg-terra-500/35 pointer-events-none" />
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl",
            open
              ? "bg-[#12100E] text-white scale-95 shadow-black/30"
              : "bg-terra-500 text-white hover:bg-terra-600 hover:scale-105 shadow-terra-500/40"
          )}
          aria-label={open ? "Sluit assistent" : "Open Bijeen Assistent"}
        >
          {open ? <X size={20} /> : <MessageCircle size={22} />}
        </button>
      </div>

      {/* ── Chat panel ────────────────────────────────────── */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] flex flex-col",
          "bg-white rounded-2xl shadow-2xl shadow-black/20 border border-sand/60 overflow-hidden",
          "transition-all duration-300 origin-bottom-right",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
        style={{ maxHeight: 520 }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-[#12100E] shrink-0">
          <div className="w-8 h-8 rounded-xl bg-terra-500 flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold leading-tight">
              Bijeen Assistent
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
              <p className="text-white/50 text-[11px] font-medium">
                Online · Antwoordt direct
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="shrink-0 w-7 h-7 rounded-lg text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Sluit chat"
          >
            <X size={14} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
          {messages.length === 0 ? (
            <div className="space-y-4">
              {/* Welcome bubble */}
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-terra-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={14} className="text-terra-500" />
                </div>
                <div className="bg-cream rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[260px]">
                  <p className="text-sm text-ink leading-relaxed">
                    Hoi! Ik beantwoord al je vragen over Bijeen. Waar kan ik je
                    mee helpen?
                  </p>
                </div>
              </div>
              {/* Quick prompt chips */}
              <div className="flex flex-wrap gap-2 pl-9">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-xs font-medium text-terra-600 bg-terra-50 hover:bg-terra-100 border border-terra-100 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2.5",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-terra-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-terra-500" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[260px]",
                    msg.role === "user"
                      ? "bg-terra-500 text-white rounded-tr-sm"
                      : "bg-cream text-ink rounded-tl-sm"
                  )}
                >
                  {msg.content ? (
                    <>
                      {msg.content}
                      {msg.streaming && (
                        <span className="inline-block w-0.5 h-3.5 bg-terra-400 animate-pulse ml-0.5 align-middle" />
                      )}
                    </>
                  ) : (
                    msg.streaming && (
                      <Loader2
                        size={14}
                        className="text-terra-400 animate-spin"
                      />
                    )
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Subtle CTA after first reply */}
        {messages.length > 1 && (
          <div className="px-4 py-2 border-t border-sand/30 shrink-0">
            <Link
              href="/sign-up"
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-terra-500 hover:text-terra-600 transition-colors py-1"
            >
              <ArrowRight size={12} />
              Start gratis proefperiode
            </Link>
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-3 py-3 border-t border-sand/50 shrink-0"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Stel een vraag..."
            disabled={loading}
            className="flex-1 text-sm bg-cream rounded-xl px-3.5 py-2.5 text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-terra-300 transition-shadow disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-terra-500 hover:bg-terra-600 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            aria-label="Verstuur"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </>
  );
}
