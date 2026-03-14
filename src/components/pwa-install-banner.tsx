"use client";

import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";
import { cn } from "@/lib/utils";

type Platform = "android" | "ios" | null;

function detectPlatform(): Platform {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  if (isStandalone) return null;
  if (isIos && /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua)) return "ios";
  if (isAndroid) return "android";
  return null;
}

export function PwaInstallBanner() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [prompt, setPrompt] = useState<any>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    const p = detectPlatform();
    setPlatform(p);

    if (p === "android") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handler = (e: any) => {
        setPrompt(e.detail);
        setShow(true);
      };
      window.addEventListener("pwa:installprompt", handler);
      return () => window.removeEventListener("pwa:installprompt", handler);
    }

    if (p === "ios") {
      const t = setTimeout(() => setShow(true), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    setShow(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  }

  async function install() {
    if (navigator.vibrate) navigator.vibrate(10);
    if (platform === "android" && prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") setShow(false);
      else dismiss();
    } else if (platform === "ios") {
      setShowIosGuide(true);
    }
  }

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed z-50 left-3 right-3 rounded-2xl shadow-2xl border border-white/10 overflow-hidden",
        "bg-[#1C1814] text-white animate-fade-in",
        "bottom-[72px] md:bottom-4 md:left-auto md:right-4 md:w-80"
      )}
    >
      {!showIosGuide ? (
        <div className="flex items-center gap-3 p-4">
          <div className="w-11 h-11 rounded-xl bg-terra-500 flex items-center justify-center shrink-0 shadow-lg shadow-terra-500/30">
            <Download size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight">Installeer Bijeen</p>
            <p className="text-[11px] text-white/55 mt-0.5 leading-tight">
              Snel toegang via je beginscherm
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={install}
              className="px-3 py-1.5 rounded-lg bg-terra-500 text-white text-xs font-bold active:scale-95 transition-transform"
            >
              Installeer
            </button>
            <button
              onClick={dismiss}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/35 hover:text-white/70 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold">Voeg toe aan beginscherm</p>
            <button onClick={dismiss} className="text-white/35 hover:text-white/70 transition-colors">
              <X size={16} />
            </button>
          </div>
          <ol className="space-y-2.5">
            {[
              <>Tik op <Share size={11} className="inline mx-1 text-[#4A90D9] align-middle" /> Deel onderin Safari</>,
              <>Scroll en tik <strong className="text-white">"Zet op beginscherm"</strong></>,
              <>Tik <strong className="text-white">"Voeg toe"</strong> rechtsboven</>,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-white/60">
                <span className="w-5 h-5 rounded-full bg-terra-500/20 text-terra-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
