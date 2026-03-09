"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function ShareEventButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    const url = `${window.location.origin}/e/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={copy}
      className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all shrink-0 ${
        copied
          ? "bg-green-500 border-green-500 text-white"
          : "bg-white border-terra-200/40 text-terra-500 hover:bg-terra-50"
      }`}
      title="Kopieer link"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}
