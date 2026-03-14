"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

export function ShareEventButton({ slug, title }: { slug: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/e/${slug}`;
    if (navigator.vibrate) navigator.vibrate(8);

    // Use native share sheet on mobile when available
    if (navigator.share) {
      try {
        await navigator.share({ title: title ?? "Bijeen evenement", url });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <button
      onClick={share}
      className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all active:scale-90 shrink-0 ${
        copied
          ? "bg-green-500 border-green-500 text-white"
          : "bg-white border-terra-200/40 text-terra-500 hover:bg-terra-50"
      }`}
      title={hasNativeShare ? "Deel evenement" : "Kopieer link"}
    >
      {copied ? (
        <Check size={13} />
      ) : hasNativeShare ? (
        <Share2 size={13} />
      ) : (
        <Copy size={13} />
      )}
    </button>
  );
}
