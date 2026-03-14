"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X, Plus, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const TAG_COLORS = [
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-green-100 text-green-700 border-green-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-teal-100 text-teal-700 border-teal-200",
];

function tagColor(tag: string) {
  const idx = tag.charCodeAt(0) % TAG_COLORS.length;
  return TAG_COLORS[idx];
}

interface Props {
  email: string;
  initialTags: string[];
}

export function TagEditor({ email, initialTags }: Props) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function saveTags(newTags: string[]) {
    setSaving(true);
    try {
      await fetch(`/api/crm/contacts/${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: newTags }),
      });
    } finally {
      setSaving(false);
    }
  }

  async function addTag() {
    const trimmed = input.trim();
    if (!trimmed || tags.includes(trimmed)) {
      setInput("");
      setShowInput(false);
      return;
    }
    const newTags = [...tags, trimmed];
    setTags(newTags);
    setInput("");
    setShowInput(false);
    await saveTags(newTags);
  }

  async function removeTag(tag: string) {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    await saveTags(newTags);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); addTag(); }
    if (e.key === "Escape") { setInput(""); setShowInput(false); }
  }

  return (
    <div>
      <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-2">Tags</p>
      <div className="flex flex-wrap gap-1.5 items-center">
        {tags.map(tag => (
          <span
            key={tag}
            className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border", tagColor(tag))}
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:opacity-70 transition-opacity ml-0.5"
              disabled={saving}
            >
              <X size={10} />
            </button>
          </span>
        ))}

        {showInput ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={addTag}
              placeholder="Nieuwe tag..."
              className="text-xs border border-sand rounded-full px-3 py-1 outline-none focus:border-terra-400 w-28 font-medium"
              autoFocus
              maxLength={40}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-terra-500 px-2 py-1 rounded-full border border-dashed border-sand hover:border-terra-300 transition-colors"
          >
            <Plus size={11} />
            Tag
          </button>
        )}
      </div>
    </div>
  );
}
