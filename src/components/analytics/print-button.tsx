"use client";

import { FileDown } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
      title="Sla op als PDF via het printvenster"
    >
      <FileDown size={13} />
      PDF
    </button>
  );
}
