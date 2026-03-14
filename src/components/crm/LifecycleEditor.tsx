"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LIFECYCLE_CONFIG } from "@/components/crm/LifecycleBadge";
import { Check } from "lucide-react";

interface Props {
  email: string;
  currentStage: string;
}

export function LifecycleEditor({ email, currentStage }: Props) {
  const [stage, setStage] = useState(currentStage);
  const [saving, setSaving] = useState(false);

  async function handleChange(newStage: string) {
    setSaving(true);
    setStage(newStage);
    try {
      await fetch(`/api/crm/contacts/${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lifecycleStage: newStage }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-2">Lifecycle stage</p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(LIFECYCLE_CONFIG).map(([value, cfg]) => (
          <button
            key={value}
            onClick={() => handleChange(value)}
            disabled={saving}
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
              stage === value
                ? "bg-ink text-white border-ink shadow-sm"
                : "bg-white text-ink-muted border-sand hover:border-ink/30 hover:text-ink"
            )}
          >
            {stage === value && <Check size={11} />}
            {cfg.label}
          </button>
        ))}
      </div>
    </div>
  );
}
