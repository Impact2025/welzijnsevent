"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ConsentChoice = "granted" | "denied";

const CONSENT_KEY = "bijeen_cookie_consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function updateGtagConsent(choice: ConsentChoice) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: choice,
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentChoice | null;
    if (stored === "granted" || stored === "denied") {
      updateGtagConsent(stored);
    } else {
      setVisible(true);
    }
  }, []);

  function handle(choice: ConsentChoice) {
    localStorage.setItem(CONSENT_KEY, choice);
    updateGtagConsent(choice);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none">
      <div className="max-w-2xl mx-auto bg-ink rounded-2xl px-5 py-4 shadow-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center pointer-events-auto">
        <p className="text-cream/80 text-sm flex-1 leading-relaxed">
          Bijeen gebruikt analytische cookies (Google Analytics) om de website te verbeteren.
          Functionele cookies zijn altijd actief.{" "}
          <Link href="/cookiebeleid" className="underline text-cream hover:text-cream/80 transition-colors">
            Meer info
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handle("denied")}
            className="px-4 py-2 text-sm font-medium text-cream/60 hover:text-cream border border-cream/20 hover:border-cream/40 rounded-lg transition-colors"
          >
            Weigeren
          </button>
          <button
            onClick={() => handle("granted")}
            className="px-4 py-2 text-sm font-semibold bg-terra-500 hover:bg-terra-600 text-white rounded-lg transition-colors"
          >
            Accepteren
          </button>
        </div>
      </div>
    </div>
  );
}
