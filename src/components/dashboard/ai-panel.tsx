"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  FormEvent,
  ReactNode,
} from "react";

// ── Inline Markdown renderer ─────────────────────────────────
// Handles **bold**, *italic*, bullet lists (* / -), and ## headings.
function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2] !== undefined) parts.push(<strong key={m.index}>{m[2]}</strong>);
    else if (m[3] !== undefined) parts.push(<em key={m.index}>{m[3]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  const nodes: ReactNode[] = [];
  let bulletBuffer: string[] = [];

  function flushBullets() {
    if (bulletBuffer.length === 0) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`} className="list-disc list-outside pl-4 space-y-0.5 my-1">
        {bulletBuffer.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bulletMatch = line.match(/^[\*\-]\s+(.+)/);
    const h2Match     = line.match(/^##\s+(.+)/);
    const h3Match     = line.match(/^###\s+(.+)/);

    if (bulletMatch) {
      bulletBuffer.push(bulletMatch[1]);
    } else {
      flushBullets();
      if (h2Match) {
        nodes.push(<p key={i} className="font-bold text-[11px] uppercase tracking-wider text-ink/60 mt-2 mb-0.5">{h2Match[1]}</p>);
      } else if (h3Match) {
        nodes.push(<p key={i} className="font-bold mt-1.5">{renderInline(h3Match[1])}</p>);
      } else if (line.trim() === "") {
        if (i > 0 && lines[i - 1].trim() !== "") nodes.push(<br key={i} />);
      } else {
        nodes.push(<span key={i}>{renderInline(line)}{i < lines.length - 1 ? "\n" : ""}</span>);
      }
    }
  }
  flushBullets();
  return <>{nodes}</>;
}
import {
  Sparkles,
  Send,
  Bot,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const QUICK_PROMPTS = [
  "Wat staat er te doen?",
  "Schrijf een uitnodigingsmail",
  "Hoe boost ik aanmeldingen?",
  "Vat mijn events samen",
];

export function AiPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      abortRef.current?.abort();
    }
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: Message = { role: "user", content: text.trim() };
      const history = [...messagesRef.current, userMsg];

      setMessages(history);
      setInput("");
      setLoading(true);
      setOpen(true);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", streaming: true },
      ]);

      try {
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch("/api/ai/dashboard-assistant", {
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
              content: "Er ging iets mis. Probeer het opnieuw.",
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

  const clearChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    abortRef.current?.abort();
    setMessages([]);
    setOpen(false);
  };

  return (
    <div className="card-base overflow-hidden mb-5 sm:mb-7">
      {/* ── Header / toggle ───────────────────────────────── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-cream/30 transition-colors text-left"
      >
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-terra-500 to-terra-600 flex items-center justify-center shrink-0">
          <Sparkles size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-ink">AI Assistent</p>
          <p className="text-[11px] text-ink-muted font-medium">
            {messages.length > 0
              ? `${messages.length} bericht${messages.length !== 1 ? "en" : ""} — klik om te openen`
              : "Stel een vraag over je evenementen"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-ink-muted/50 hover:text-ink-muted hover:bg-sand/40 transition-colors"
              aria-label="Wis gesprek"
            >
              <X size={12} />
            </button>
          )}
          {open ? (
            <ChevronUp size={14} className="text-ink-muted" />
          ) : (
            <ChevronDown size={14} className="text-ink-muted" />
          )}
        </div>
      </button>

      {/* ── Collapsed: quick action chips ─────────────────── */}
      {!open && (
        <div className="px-5 pb-4 border-t border-sand/30 pt-3 flex flex-wrap gap-2">
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
      )}

      {/* ── Expanded: chat interface ───────────────────────── */}
      {open && (
        <>
          {/* Messages */}
          <div
            className="border-t border-sand/40 px-4 py-3 overflow-y-auto space-y-3"
            style={{ maxHeight: 340 }}
          >
            {messages.length === 0 ? (
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-terra-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={12} className="text-terra-500" />
                </div>
                <div className="bg-cream rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[290px]">
                  <p className="text-xs text-ink leading-relaxed">
                    Hoi! Ik ken je evenementen en kan direct helpen — van
                    mailings schrijven tot actiepunten signaleren. Stel een
                    vraag of kies een snelactie.
                  </p>
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
                    <div className="w-6 h-6 rounded-full bg-terra-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={12} className="text-terra-500" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-3 py-2.5 text-xs leading-relaxed max-w-[290px]",
                      msg.role === "user"
                        ? "bg-terra-500 text-white rounded-tr-sm whitespace-pre-wrap"
                        : "bg-cream text-ink rounded-tl-sm"
                    )}
                  >
                    {msg.content ? (
                      <>
                        {msg.role === "assistant"
                          ? <MarkdownMessage content={msg.content} />
                          : msg.content}
                        {msg.streaming && (
                          <span className="inline-block w-0.5 h-3 bg-terra-400 animate-pulse ml-0.5 align-middle" />
                        )}
                      </>
                    ) : (
                      msg.streaming && (
                        <Loader2
                          size={12}
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

          {/* Quick chips (compact row) */}
          <div className="px-4 pt-2 pb-1 flex flex-wrap gap-1.5 border-t border-sand/30">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                disabled={loading}
                className="text-[11px] font-medium text-terra-600 bg-terra-50 hover:bg-terra-100 border border-terra-100 px-2.5 py-1 rounded-full transition-colors disabled:opacity-40"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-2.5"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Stel een vraag..."
              disabled={loading}
              className="flex-1 text-xs bg-cream rounded-xl px-3 py-2.5 text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-terra-300 transition-shadow disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl bg-terra-500 hover:bg-terra-600 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              aria-label="Verstuur"
            >
              <Send size={12} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
