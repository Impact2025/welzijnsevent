"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log naar monitoring (koppel hier Sentry/Axiom aan)
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <h1 className="text-lg font-bold text-ink mb-2">Er ging iets mis</h1>
        <p className="text-sm text-ink/60 mb-1">
          {error.message?.toLowerCase().includes("database")
            ? "Kon geen verbinding maken met de database."
            : "Er is een onverwachte fout opgetreden."}
        </p>
        {error.digest && (
          <p className="text-[11px] font-mono text-ink/30 mb-5">
            Foutcode: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 bg-terra-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-terra-600 transition-colors"
          >
            <RotateCcw size={13} />
            Opnieuw proberen
          </button>
          <Link
            href="/"
            className="bg-white text-ink font-semibold px-5 py-2.5 rounded-xl text-sm border border-ink/10 hover:bg-sand transition-colors"
          >
            Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
