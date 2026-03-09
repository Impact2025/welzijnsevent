"use client";

import { FileDown } from "lucide-react";

interface Props {
  eventId: string;
}

export function SubsidieExportButton({ eventId }: Props) {
  function handleExport() {
    window.open(`/api/reports/subsidie-export?eventId=${eventId}`, "_blank");
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
    >
      <FileDown size={13} />
      Subsidie PDF
    </button>
  );
}
