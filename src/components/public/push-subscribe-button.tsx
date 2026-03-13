"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";

interface Props {
  eventId:      string;
  eventSlug:    string;
  primaryColor: string;
}

type State = "idle" | "subscribed" | "denied" | "unsupported" | "loading";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64   = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw      = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export function PushSubscribeButton({ eventId, eventSlug, primaryColor }: Props) {
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    // Check if already subscribed for this event
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return;
      // Verify with backend
      try {
        const res = await fetch(`/api/push/subscribe?eventId=${eventId}&endpoint=${encodeURIComponent(sub.endpoint)}`);
        if (res.ok) setState("subscribed");
      } catch { /* no-op */ }
    });
  }, [eventId]);

  async function handleToggle() {
    if (!VAPID_PUBLIC_KEY) return;
    setState("loading");

    try {
      const reg = await navigator.serviceWorker.ready;

      if (state === "subscribed") {
        // Unsubscribe
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventId, endpoint: sub.endpoint }),
          });
        }
        setState("idle");
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("denied");
        return;
      }

      // Subscribe
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const { endpoint, keys } = sub.toJSON() as {
        endpoint: string;
        keys: { auth: string; p256dh: string };
      };

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, endpoint, auth: keys.auth, p256dh: keys.p256dh }),
      });

      setState("subscribed");
    } catch (err) {
      console.error("[Push]", err);
      setState("idle");
    }
  }

  if (state === "unsupported") return null;

  const config = {
    idle:       { icon: Bell,     label: "Meldingen aan",   subtle: true  },
    subscribed: { icon: BellRing, label: "Meldingen actief", subtle: false },
    denied:     { icon: BellOff,  label: "Meldingen geblokkeerd", subtle: true },
    loading:    { icon: Bell,     label: "Bezig...",        subtle: true  },
  }[state] ?? { icon: Bell, label: "Meldingen", subtle: true };

  const Icon = config.icon;

  return (
    <button
      onClick={handleToggle}
      disabled={state === "denied" || state === "loading"}
      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all disabled:opacity-50"
      style={
        config.subtle
          ? { borderColor: `${primaryColor}40`, color: primaryColor }
          : { backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}60`, color: primaryColor }
      }
    >
      <Icon size={13} />
      {config.label}
    </button>
  );
}
