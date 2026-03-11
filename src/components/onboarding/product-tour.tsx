"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  CSSProperties,
} from "react";
import { X, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { TOUR_STEPS, TourStep, TourPosition } from "./tour-config";

const STORAGE_KEY = "bijeen_tour_v1";
const PAD = 10; // px padding around highlighted element
const BALLOON_W = 340;
const BALLOON_H = 210; // approximate
const GAP = 14; // gap between spotlight edge and balloon

// ─── Spotlight geometry ──────────────────────────────────────────────────────

interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

function measureTarget(selector: string): Rect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    right: r.right + PAD,
    bottom: r.bottom + PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  };
}

/** Build a donut clip-path that punches a rectangular hole in the overlay */
function buildClipPath(rect: Rect, w: number, h: number): string {
  const { top, left, right, bottom } = rect;
  // Outer rect → hole → back to outer (evenodd rule creates the hole)
  return `polygon(
    0px 0px,
    ${w}px 0px,
    ${w}px ${h}px,
    0px ${h}px,
    0px 0px,
    ${left}px ${top}px,
    ${left}px ${bottom}px,
    ${right}px ${bottom}px,
    ${right}px ${top}px,
    ${left}px ${top}px
  )`;
}

function getBalloonStyle(
  rect: Rect | null,
  position: TourPosition | undefined,
  winW: number,
  winH: number
): CSSProperties {
  if (!rect) {
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  let top: number;
  let left: number;

  switch (position) {
    case "right":
      top = rect.top + rect.height / 2 - BALLOON_H / 2;
      left = rect.right + GAP;
      break;
    case "left":
      top = rect.top + rect.height / 2 - BALLOON_H / 2;
      left = rect.left - BALLOON_W - GAP;
      break;
    case "top":
      top = rect.top - BALLOON_H - GAP;
      left = rect.left + rect.width / 2 - BALLOON_W / 2;
      break;
    case "bottom":
    default:
      top = rect.bottom + GAP;
      left = rect.left + rect.width / 2 - BALLOON_W / 2;
      break;
  }

  // Clamp within viewport with 16px margin
  left = Math.max(16, Math.min(left, winW - BALLOON_W - 16));
  top = Math.max(16, Math.min(top, winH - BALLOON_H - 16));

  return { top, left };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProductTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [winSize, setWinSize] = useState({ w: 0, h: 0 });
  // Animate balloon in
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number>(0);

  const currentStep: TourStep = TOUR_STEPS[step];

  // ── Measure & scroll to target ──────────────────────────────────────────
  const updateTarget = useCallback(
    (s: TourStep) => {
      if (!s.target) {
        setTargetRect(null);
        return;
      }
      const rect = measureTarget(s.target);
      setTargetRect(rect);
      if (rect) {
        document
          .querySelector(s.target)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    []
  );

  // ── Init: auto-start once for new users ────────────────────────────────
  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      const t = setTimeout(() => {
        setActive(true);
        setVisible(true);
      }, 900);
      return () => clearTimeout(t);
    }
  }, []);

  // ── When step or active changes, re-measure target ─────────────────────
  useEffect(() => {
    if (!active) return;
    setWinSize({ w: window.innerWidth, h: window.innerHeight });
    // Small delay so DOM is ready after step transition
    const t = setTimeout(() => updateTarget(currentStep), 80);
    return () => clearTimeout(t);
  }, [active, currentStep, updateTarget]);

  // ── Handle resize ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const handle = () => {
      setWinSize({ w: window.innerWidth, h: window.innerHeight });
      rafRef.current = requestAnimationFrame(() => updateTarget(currentStep));
    };
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("resize", handle);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, currentStep, updateTarget]);

  // ── Keyboard navigation ────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight" || e.key === "Enter") advance();
      if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const finish = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    setTimeout(() => setActive(false), 250);
  }, []);

  const advance = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }, [step, finish]);

  const back = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  if (!active) return null;

  const { w, h } = winSize;
  const clipPath = targetRect ? buildClipPath(targetRect, w, h) : undefined;
  const balloonStyle = getBalloonStyle(
    targetRect,
    currentStep.position,
    w,
    h
  );

  return (
    <>
      {/* ── Dark overlay with spotlight cutout ─────────────── */}
      <div
        className="fixed inset-0 z-[9000] transition-opacity duration-300"
        style={{
          backgroundColor: "rgba(18,16,14,0.72)",
          clipPath,
          // When centered (no target), full dark overlay
          ...(targetRect ? {} : {}),
        }}
        onClick={finish}
      />

      {/* ── Spotlight ring around target ────────────────────── */}
      {targetRect && (
        <div
          className="fixed z-[9001] rounded-2xl ring-2 ring-terra-400 pointer-events-none transition-all duration-300"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            boxShadow: "0 0 0 4px rgba(200,82,42,0.15)",
          }}
        />
      )}

      {/* ── Balloon ─────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed z-[9002] bg-white rounded-2xl shadow-2xl shadow-black/25 border border-sand/60 flex flex-col overflow-hidden",
          "transition-all duration-250",
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
        style={{
          width: BALLOON_W,
          ...balloonStyle,
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={currentStep.title}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-terra-50 flex items-center justify-center shrink-0">
              <Sparkles size={13} className="text-terra-500" />
            </div>
            <span className="text-[10px] font-bold text-terra-500 uppercase tracking-widest">
              Bijeen Tour
            </span>
          </div>
          <button
            onClick={finish}
            className="w-7 h-7 rounded-lg text-ink-muted hover:text-ink hover:bg-sand/60 flex items-center justify-center transition-colors shrink-0"
            aria-label="Tour overslaan"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-3">
          <h3 className="text-base font-extrabold text-ink mb-1.5 leading-snug">
            {currentStep.title}
          </h3>
          <p className="text-sm text-ink-muted leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-sand/40">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full transition-all duration-200",
                  i === step
                    ? "w-4 h-1.5 bg-terra-500"
                    : i < step
                    ? "w-1.5 h-1.5 bg-terra-300"
                    : "w-1.5 h-1.5 bg-sand"
                )}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={back}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink hover:bg-sand/60 transition-colors"
                aria-label="Vorige stap"
              >
                <ArrowLeft size={15} />
              </button>
            )}
            <button
              onClick={advance}
              className="flex items-center gap-1.5 bg-terra-500 hover:bg-terra-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
            >
              {step === TOUR_STEPS.length - 1 ? "Klaar!" : "Volgende"}
              {step < TOUR_STEPS.length - 1 && <ArrowRight size={13} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
