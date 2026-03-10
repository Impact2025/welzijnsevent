"use client";

import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, FileText, Table2 } from "lucide-react";

export function ExportButton({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Sluit dropdown bij klik buiten
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function download(format: "csv" | "excel") {
    setOpen(false);
    window.open(`/api/reports/attendees-export?eventId=${eventId}&format=${format}`, "_blank");
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
      >
        <Download size={13} />
        Exporteer
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden z-20">
          <button
            onClick={() => download("csv")}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
          >
            <FileText size={14} className="text-gray-400" />
            <div className="text-left">
              <p className="font-semibold text-xs">CSV downloaden</p>
              <p className="text-xs text-gray-400">Universeel formaat</p>
            </div>
          </button>
          <div className="border-t border-gray-100" />
          <button
            onClick={() => download("excel")}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
          >
            <Table2 size={14} className="text-green-600" />
            <div className="text-left">
              <p className="font-semibold text-xs">Excel downloaden</p>
              <p className="text-xs text-gray-400">Opent direct in Excel</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
