"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export function CsvExportButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/export-csv`);
      if (!res.ok) throw new Error("Export mislukt");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? "deelnemers.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-white border border-sand text-ink hover:bg-sand transition-colors disabled:opacity-60"
      title="Download deelnemers als CSV"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
      CSV
    </button>
  );
}
