"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-ink mb-2">Er ging iets mis</h2>
        <p className="text-sm text-ink-muted mb-1">
          {error.message?.includes("DATABASE")
            ? "Kon geen verbinding maken met de database."
            : "Er is een onverwachte fout opgetreden."}
        </p>
        {error.digest && (
          <p className="text-[11px] font-mono text-ink-muted/50 mb-5">
            code: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 bg-terra-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-terra-600 transition-colors"
          >
            <RotateCcw size={13} />
            Opnieuw
          </button>
          <Link
            href="/dashboard"
            className="bg-sand text-ink font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-sand/70 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
