"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function PublicError({
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Er ging iets mis</h2>
        <p className="text-sm text-gray-500 mb-6">
          Kon de pagina niet laden. Probeer het opnieuw.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-[#C8522A] text-white font-bold px-6 py-3 rounded-2xl text-sm hover:opacity-90 transition-opacity"
        >
          <RotateCcw size={14} />
          Opnieuw proberen
        </button>
      </div>
    </div>
  );
}
