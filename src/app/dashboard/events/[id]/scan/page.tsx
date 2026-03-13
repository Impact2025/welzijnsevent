"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, QrCode, CheckCircle2, AlertCircle, UserCheck, Loader2 } from "lucide-react";

type ScanResult =
  | { type: "success";    name: string; organization?: string }
  | { type: "duplicate";  name: string }
  | { type: "error";      message: string };

declare class BarcodeDetector {
  constructor(options?: { formats: string[] });
  detect(source: HTMLVideoElement | HTMLCanvasElement | ImageBitmap): Promise<{ rawValue: string; format: string }[]>;
  static getSupportedFormats(): Promise<string[]>;
}

export default function ScanPage() {
  const params  = useParams<{ id: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef   = useRef<number>(0);
  const lastRef  = useRef<string>("");
  const cooldown = useRef<boolean>(false);

  const [supported, setSupported] = useState<boolean | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [result,    setResult]    = useState<ScanResult | null>(null);
  const [checking,  setChecking]  = useState(false);
  const [total,     setTotal]     = useState(0);
  const [manualCode, setManualCode] = useState("");
  const [cameraError, setCameraError] = useState("");

  async function checkIn(qrCode: string) {
    if (cooldown.current || checking) return;
    cooldown.current = true;
    setChecking(true);
    setResult(null);
    try {
      const res  = await fetch("/api/checkin/qr", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ qrCode }),
      });
      const data = await res.json();
      if (res.status === 404) {
        setResult({ type: "error", message: "QR-code niet gevonden" });
      } else if (data.alreadyCheckedIn) {
        setResult({ type: "duplicate", name: data.attendee?.name ?? "Onbekend" });
      } else if (data.attendee) {
        setResult({ type: "success", name: data.attendee.name, organization: data.attendee.organization });
        setTotal(n => n + 1);
      } else {
        setResult({ type: "error", message: data.error ?? "Onbekende fout" });
      }
    } catch {
      setResult({ type: "error", message: "Verbindingsfout" });
    } finally {
      setChecking(false);
      // Reset cooldown after 2s so next scan can proceed
      setTimeout(() => { cooldown.current = false; }, 2000);
    }
  }

  const startScanLoop = useCallback((detector: BarcodeDetector) => {
    const video = videoRef.current;
    if (!video) return;

    async function loop() {
      if (!video || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      try {
        const codes = await detector.detect(video);
        if (codes.length > 0) {
          const value = codes[0].rawValue;
          if (value && value !== lastRef.current && !cooldown.current) {
            lastRef.current = value;
            await checkIn(value);
          }
        }
      } catch { /* ignore frame errors */ }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!("BarcodeDetector" in window)) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const detector = new BarcodeDetector({ formats: ["qr_code"] });

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }
    }).then(stream => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
        startScanLoop(detector);
      }
    }).catch(err => {
      setCameraError("Camera-toegang geweigerd. Controleer de toestemmingen.");
      setSupported(false);
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [startScanLoop]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="px-4 pt-10 pb-4 flex items-center justify-between">
        <Link href={`/dashboard/events/${params.id}/deelnemers`} className="flex items-center gap-1.5 text-white/70 text-sm hover:text-white">
          <ArrowLeft size={16} />
          Terug
        </Link>
        <div className="flex items-center gap-2">
          <QrCode size={16} className="text-terra-400" />
          <span className="text-sm font-bold">Check-in scanner</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/50">Ingecheckt</p>
          <p className="text-lg font-bold text-terra-400">{total}</p>
        </div>
      </div>

      {/* Camera viewfinder */}
      <div className="relative mx-4 rounded-3xl overflow-hidden bg-black aspect-square">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Scan frame overlay */}
        {streaming && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-56 h-56">
              {/* Corner brackets */}
              {[["top-0 left-0", "border-t-2 border-l-2 rounded-tl-xl"],
                ["top-0 right-0", "border-t-2 border-r-2 rounded-tr-xl"],
                ["bottom-0 left-0", "border-b-2 border-l-2 rounded-bl-xl"],
                ["bottom-0 right-0", "border-b-2 border-r-2 rounded-br-xl"]
              ].map(([pos, cls], i) => (
                <div key={i} className={`absolute ${pos} w-8 h-8 border-terra-400 ${cls}`} />
              ))}
              {/* Scan line animation */}
              <div className="absolute left-2 right-2 h-0.5 bg-terra-400/70"
                style={{ animation: "scan 2s ease-in-out infinite", position: "absolute" }}
              />
            </div>
          </div>
        )}

        {/* Loading / no camera */}
        {!streaming && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <Loader2 size={32} className="animate-spin text-terra-400" />
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 px-6 text-center gap-3">
            <AlertCircle size={32} className="text-red-400" />
            <p className="text-sm text-white/80">{cameraError}</p>
          </div>
        )}

        {/* Result overlay */}
        {result && (
          <div className={`absolute inset-x-0 bottom-0 px-5 py-4 flex items-center gap-3 ${
            result.type === "success"   ? "bg-green-500/95" :
            result.type === "duplicate" ? "bg-amber-500/95" :
                                          "bg-red-500/95"
          }`}>
            {result.type === "success"   ? <CheckCircle2 size={22} className="shrink-0" /> :
             result.type === "duplicate" ? <UserCheck     size={22} className="shrink-0" /> :
                                           <AlertCircle   size={22} className="shrink-0" />}
            <div>
              <p className="font-bold text-sm leading-tight">
                {result.type === "success"   ? result.name :
                 result.type === "duplicate" ? result.name :
                                               result.message}
              </p>
              <p className="text-xs text-white/80 mt-0.5">
                {result.type === "success"   ? (result.organization ?? "Ingecheckt") :
                 result.type === "duplicate" ? "Al eerder ingecheckt" :
                                               "Probeer opnieuw"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions / manual fallback */}
      <div className="px-4 pt-5 space-y-4">
        {supported === false && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
            <p className="text-xs font-bold text-amber-400 mb-2">
              {cameraError ? "Camera niet beschikbaar" : "Scanner niet ondersteund in deze browser"}
            </p>
            <p className="text-xs text-white/60">
              Gebruik Chrome op Android voor de camera-scanner, of voer de QR-code hieronder handmatig in.
            </p>
          </div>
        )}

        {/* Manual code entry */}
        <div className="bg-white/5 rounded-2xl p-4">
          <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">Handmatig invoeren</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && manualCode.trim()) { checkIn(manualCode.trim()); setManualCode(""); } }}
              placeholder="QR-code waarde..."
              className="flex-1 bg-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-terra-400 font-mono"
            />
            <button
              onClick={() => { if (manualCode.trim()) { checkIn(manualCode.trim()); setManualCode(""); } }}
              disabled={!manualCode.trim() || checking}
              className="px-4 py-2.5 bg-terra-500 hover:bg-terra-600 disabled:opacity-40 rounded-xl text-sm font-bold transition-colors"
            >
              {checking ? <Loader2 size={14} className="animate-spin" /> : "OK"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-white/30 pb-6">
          Scan de QR-code op het ticket van de deelnemer
        </p>
      </div>

      <style>{`
        @keyframes scan {
          0%   { top: 10%; }
          50%  { top: 85%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  );
}
