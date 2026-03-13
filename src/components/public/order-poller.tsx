"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";

interface Props {
  orderId:      string;
  slug:         string;
  primaryColor: string;
}

export function OrderPoller({ orderId, slug, primaryColor }: Props) {
  const [token,  setToken]  = useState<string | null>(null);
  const [status, setStatus] = useState<"polling" | "failed" | "timeout">("polling");
  const [tries,  setTries]  = useState(0);

  useEffect(() => {
    let cancelled = false;
    const MAX_TRIES = 20; // 20 × 3s = 60s max

    async function poll() {
      if (cancelled) return;
      try {
        const res  = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();

        if (data.token) {
          setToken(data.token);
          return;
        }
        if (data.status === "failed" || data.status === "cancelled") {
          setStatus("failed");
          return;
        }
      } catch {
        // network error — keep polling
      }

      setTries(t => {
        const next = t + 1;
        if (next >= MAX_TRIES) {
          setStatus("timeout");
          return next;
        }
        setTimeout(poll, 3_000);
        return next;
      });
    }

    setTimeout(poll, 2_000); // first poll after 2s (give webhook time to fire)
    return () => { cancelled = true; };
  }, [orderId]);

  if (token) {
    return (
      <Link
        href={`/e/${slug}/mijn-ticket?token=${token}`}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-md transition-opacity hover:opacity-90"
        style={{ backgroundColor: primaryColor }}
      >
        🎟️ Bekijk mijn ticket
      </Link>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center gap-2 justify-center text-red-500 text-sm">
        <AlertCircle size={16} />
        Betaling mislukt of geannuleerd
      </div>
    );
  }

  if (status === "timeout") {
    return (
      <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-center">
        <p className="text-sm font-semibold text-amber-700">Betaling wordt verwerkt</p>
        <p className="text-xs text-amber-600 mt-1">
          Je ontvangt een e-mail met je ticket zodra de betaling is bevestigd.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 justify-center text-sm text-gray-500">
      <Loader2 size={16} className="animate-spin" style={{ color: primaryColor }} />
      Betaling verwerken…
    </div>
  );
}
