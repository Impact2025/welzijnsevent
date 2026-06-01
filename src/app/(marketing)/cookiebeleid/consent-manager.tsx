"use client";

import { useState, useEffect } from "react";

const CONSENT_KEY = "bijeen_cookie_consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function updateGtagConsent(choice: "granted" | "denied") {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: choice,
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
}

export function ConsentManager() {
  const [current, setCurrent] = useState<"granted" | "denied" | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as "granted" | "denied" | null;
    setCurrent(stored);
  }, []);

  function handle(choice: "granted" | "denied") {
    localStorage.setItem(CONSENT_KEY, choice);
    updateGtagConsent(choice);
    setCurrent(choice);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="bg-sand/40 rounded-xl p-5 space-y-3">
      <p className="font-semibold text-sm">Uw huidige voorkeur</p>
      <p className="text-ink-muted text-sm">
        Analytische cookies zijn momenteel:{" "}
        <strong className={current === "granted" ? "text-green-700" : "text-terra-600"}>
          {current === "granted"
            ? "Geaccepteerd"
            : current === "denied"
            ? "Geweigerd"
            : "Nog niet ingesteld"}
        </strong>
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => handle("denied")}
          disabled={current === "denied"}
          className="px-4 py-2 text-sm font-medium border border-ink/20 rounded-lg hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Weigeren
        </button>
        <button
          onClick={() => handle("granted")}
          disabled={current === "granted"}
          className="px-4 py-2 text-sm font-semibold bg-terra-500 hover:bg-terra-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          Accepteren
        </button>
      </div>
      {saved && <p className="text-xs text-green-700">Voorkeur opgeslagen.</p>}
    </div>
  );
}
