"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  CSSProperties,
} from "react";
import {
  X,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Plus,
  LayoutGrid,
  TrendingUp,
  Zap,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TOUR_STEPS, TourStep, TourPosition } from "./tour-config";

const STORAGE_KEY   = "bijeen_tour_v1";
const PAD           = 10;    // px padding around highlighted element
const BALLOON_W     = 360;   // desktop balloon width
const BALLOON_H     = 260;   // approximate (for placement math)
const GAP           = 16;    // gap between spotlight edge and balloon
const MD_BREAKPOINT = 768;   // mobile/desktop switch

// ─── Per-step visual identity ─────────────────────────────────────────────────

interface StepMeta {
  Icon: LucideIcon;
  headerStyle: CSSProperties;
  buttonStyle: CSSProperties;
}

const STEP_META: Record<string, StepMeta> = {
  welcome: {
    Icon: Sparkles,
    headerStyle: { background: "linear-gradient(135deg, #C8522A 0%, #E8896A 100%)" },
    buttonStyle: { background: "linear-gradient(135deg, #C8522A 0%, #E8896A 100%)" },
  },
  "new-event": {
    Icon: Plus,
    headerStyle: { background: "linear-gradient(135deg, #A8431F 0%, #D97706 100%)" },
    buttonStyle: { background: "linear-gradient(135deg, #A8431F 0%, #D97706 100%)" },
  },
  nav: {
    Icon: LayoutGrid,
    headerStyle: { background: "linear-gradient(135deg, #2D5A3D 0%, #4A8C62 100%)" },
    buttonStyle: { background: "linear-gradient(135deg, #2D5A3D 0%, #4A8C62 100%)" },
  },
  kpi: {
    Icon: TrendingUp,
    headerStyle: { background: "linear-gradient(135deg, #244A31 0%, #2D5A3D 100%)" },
    buttonStyle: { background: "linear-gradient(135deg, #244A31 0%, #2D5A3D 100%)" },
  },
  "events-list": {
    Icon: Zap,
    headerStyle: { background: "linear-gradient(135deg, #C8522A 0%, #92400E 100%)" },
    buttonStyle: { background: "linear-gradient(135deg, #C8522A 0%, #92400E 100%)" },
  },
  finish: {
    Icon: PartyPopper,
    headerStyle: { background: "linear-gradient(135deg, #7C3AED 0%, #C8522A 100%)" },
    buttonStyle: { background: "linear-gradient(135deg, #7C3AED 0%, #C8522A 100%)" },
  },
};

const FALLBACK_META = STEP_META.welcome;

// ─── Spotlight geometry ───────────────────────────────────────────────────────

interface Rect {
  top: number; left: number; right: number; bottom: number;
  width: number; height: number;
}

function measureTarget(selector: string): Rect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top:    r.top    - PAD,
    left:   r.left   - PAD,
    right:  r.right  + PAD,
    bottom: r.bottom + PAD,
    width:  r.width  + PAD * 2,
    height: r.height + PAD * 2,
  };
}

/**
 * Always 10-point polygon so CSS can transition smoothly between any two states.
 * null target → degenerate off-screen quad (full overlay, no visible hole).
 */
function buildClipPath(rect: Rect | null, w: number, h: number): string {
  const { top, left, right, bottom } = rect ?? { top: -20, left: -20, right: -19, bottom: -19 };
  return (
    `polygon(` +
    `0px 0px, ${w}px 0px, ${w}px ${h}px, 0px ${h}px, 0px 0px, ` +
    `${left}px ${top}px, ${left}px ${bottom}px, ` +
    `${right}px ${bottom}px, ${right}px ${top}px, ` +
    `${left}px ${top}px` +
    `)`
  );
}

function getBalloonPos(
  rect: Rect | null,
  position: TourPosition | undefined,
  winW: number,
  winH: number,
): CSSProperties {
  if (!rect) return { top: "50%", left: "50%", transform: "translate(-50%,-50%)" };

  let top: number, left: number;
  switch (position) {
    case "right": top = rect.top + rect.height / 2 - BALLOON_H / 2; left = rect.right + GAP; break;
    case "left":  top = rect.top + rect.height / 2 - BALLOON_H / 2; left = rect.left - BALLOON_W - GAP; break;
    case "top":   top = rect.top - BALLOON_H - GAP; left = rect.left + rect.width / 2 - BALLOON_W / 2; break;
    default:      top = rect.bottom + GAP;            left = rect.left + rect.width / 2 - BALLOON_W / 2;
  }

  // Clamp within viewport, respecting actual balloon width
  const effectiveW = Math.min(BALLOON_W, winW - 32);
  left = Math.max(16, Math.min(left, winW - effectiveW - 16));
  top  = Math.max(16, Math.min(top,  winH - BALLOON_H - 16));
  return { top, left };
}

/** Pick the right selector for the current device */
function resolveTarget(s: TourStep, mobile: boolean): string | null {
  if (mobile && s.targetMobile !== undefined) return s.targetMobile;
  return s.target;
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ["#C8522A","#2D5A3D","#F59E0B","#3B82F6","#EC4899","#8B5CF6","#FAF6F0"];

function ConfettiBurst() {
  const pieces = useRef(
    Array.from({ length: 56 }, (_, i) => ({
      left:     10 + Math.random() * 80,
      delay:    Math.random() * 0.9,
      duration: 1.6 + Math.random() * 1.6,
      size:     5 + Math.random() * 9,
      color:    CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotate:   Math.random() * 360,
      circle:   Math.random() > 0.4,
    })),
  );
  return (
    <div className="fixed inset-0 z-[9100] pointer-events-none overflow-hidden" aria-hidden="true">
      {pieces.current.map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: `${p.left}%`, top: "-16px",
          width: p.size, height: p.size,
          backgroundColor: p.color,
          borderRadius: p.circle ? "50%" : "3px",
          animationName: "confetti-fall",
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
          animationTimingFunction: "cubic-bezier(0.23,1,0.32,1)",
          animationFillMode: "forwards",
          transform: `rotate(${p.rotate}deg)`,
          opacity: 0,
        }} />
      ))}
    </div>
  );
}

// ─── Shared card inner content ────────────────────────────────────────────────

interface CardProps {
  currentStep: TourStep;
  step: number;
  total: number;
  contentKey: number;
  meta: StepMeta;
  isLastStep: boolean;
  busy: boolean;
  isMobile: boolean;
  onFinish: () => void;
  onAdvance: () => void;
  onBack: () => void;
}

function TourCardInner({
  currentStep, step, total, contentKey, meta,
  isLastStep, busy, isMobile, onFinish, onAdvance, onBack,
}: CardProps) {
  const { Icon, headerStyle, buttonStyle } = meta;
  const progressPct = ((step + 1) / total) * 100;

  return (
    <>
      {/* Gradient header */}
      <div className="relative overflow-hidden" style={headerStyle}>
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "16px 16px" }}
        />
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
        />
        <div className="relative px-5 pt-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-inner">
                <Icon size={20} className="text-white drop-shadow" />
              </div>
              <div>
                <p className="text-white/55 text-[9.5px] font-bold uppercase tracking-[0.14em]">
                  Stap {step + 1} van {total}
                </p>
                <h3 className="text-white font-extrabold text-[15px] leading-snug mt-0.5 max-w-[220px]">
                  {currentStep.title}
                </h3>
              </div>
            </div>
            <button
              onClick={onFinish}
              className="w-7 h-7 rounded-lg bg-black/15 hover:bg-black/30 flex items-center justify-center text-white/60 hover:text-white transition-colors shrink-0 mt-0.5"
              aria-label="Tour overslaan"
            >
              <X size={13} />
            </button>
          </div>
          <div className="mt-3.5 h-[3px] bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{ width: `${progressPct}%`, transition: "width 0.55s cubic-bezier(0.4,0,0.2,1)" }}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div key={contentKey} className="px-5 py-4 animate-fade-in">
        <p className={cn("text-ink-muted leading-relaxed", isMobile ? "text-[14px]" : "text-[13.5px]")}>
          {currentStep.description}
        </p>
      </div>

      {/* Footer */}
      <div className={cn("flex items-center justify-between gap-3 px-5 pt-0", isMobile ? "pb-2" : "pb-4")}>
        {/* Keyboard hints — desktop only */}
        {!isMobile && (
          <div className="flex items-center gap-1 shrink-0">
            {[["←","terug"],["→","verder"]].map(([key, label]) => (
              <span key={key} className="flex items-center gap-0.5">
                <kbd className="inline-flex items-center justify-center w-5 h-5 rounded bg-sand text-[10px] font-bold text-ink-muted border border-sand shadow-[0_1px_0_0_#E0D8CC]">
                  {key}
                </kbd>
                <span className="text-[9.5px] text-ink-muted/40 font-medium mr-1">{label}</span>
              </span>
            ))}
            <kbd className="inline-flex items-center justify-center px-1.5 h-5 rounded bg-sand text-[9px] font-bold text-ink-muted border border-sand shadow-[0_1px_0_0_#E0D8CC]">
              Esc
            </kbd>
            <span className="text-[9.5px] text-ink-muted/40 font-medium ml-0.5">skip</span>
          </div>
        )}

        {/* Nav buttons */}
        <div className={cn("flex items-center gap-2", isMobile ? "w-full justify-between" : "ml-auto")}>
          {step > 0 ? (
            <button
              onClick={onBack}
              disabled={busy}
              className={cn(
                "flex items-center gap-1.5 rounded-xl font-semibold transition-colors disabled:opacity-40",
                isMobile
                  ? "flex-1 justify-center h-11 text-[13px] text-ink-muted bg-sand hover:bg-sand/80"
                  : "w-9 h-9 justify-center text-ink-muted hover:text-ink hover:bg-sand",
              )}
              aria-label="Vorige stap"
            >
              <ArrowLeft size={isMobile ? 15 : 16} />
              {isMobile && <span>Terug</span>}
            </button>
          ) : (
            /* Placeholder to keep Volgende right-aligned on mobile step 1 */
            isMobile && <div className="flex-1" />
          )}
          <button
            onClick={onAdvance}
            disabled={busy}
            className={cn(
              "flex items-center gap-1.5 text-white font-bold transition-opacity hover:opacity-90 disabled:opacity-60 shadow-md shadow-black/15 rounded-xl",
              isMobile ? "flex-1 justify-center h-11 text-[14px]" : "px-4 py-2 text-[13px]",
            )}
            style={buttonStyle}
          >
            {isLastStep ? (
              <span>Klaar&nbsp;🎉</span>
            ) : (
              <>Volgende <ArrowRight size={isMobile ? 15 : 13} /></>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProductTour() {
  const [active, setActive]               = useState(false);
  const [step, setStep]                   = useState(0);
  const [targetRect, setTargetRect]       = useState<Rect | null>(null);
  const [winSize, setWinSize]             = useState({ w: 1280, h: 800 });
  const [balloonVisible, setBalloonVisible] = useState(false);
  const [contentKey, setContentKey]       = useState(0);
  const [showConfetti, setShowConfetti]   = useState(false);
  const [busy, setBusy]                   = useState(false);
  const rafRef                            = useRef<number>(0);

  const isMobile    = winSize.w < MD_BREAKPOINT;
  const currentStep = TOUR_STEPS[step];
  const meta        = STEP_META[currentStep.id] ?? FALLBACK_META;

  // ── Measure + scroll to target ───────────────────────────────────────────
  const updateTarget = useCallback((s: TourStep) => {
    const newW = window.innerWidth;
    const newH = window.innerHeight;
    setWinSize({ w: newW, h: newH });

    const mobile  = newW < MD_BREAKPOINT;
    const selector = resolveTarget(s, mobile);

    if (!selector) { setTargetRect(null); return; }

    const rect = measureTarget(selector);
    setTargetRect(rect);
    if (rect) {
      document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  // ── Auto-start once for new users ────────────────────────────────────────
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => { setActive(true); setBalloonVisible(true); }, 900);
      return () => clearTimeout(t);
    }
  }, []);

  // ── Re-measure on step / active change ───────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => updateTarget(currentStep), 80);
    return () => clearTimeout(t);
  }, [active, step, currentStep, updateTarget]);

  // ── Resize handler ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const handle = () => {
      rafRef.current = requestAnimationFrame(() => updateTarget(currentStep));
    };
    window.addEventListener("resize", handle);
    return () => { window.removeEventListener("resize", handle); cancelAnimationFrame(rafRef.current); };
  }, [active, currentStep, updateTarget]);

  // ── Keyboard navigation ───────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape")                       finish();
      else if (e.key === "ArrowRight" || e.key === "Enter") advance();
      else if (e.key === "ArrowLeft")               back();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const finish = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setBalloonVisible(false);
    setTimeout(() => setActive(false), 350);
  }, []);

  const advance = useCallback(() => {
    if (busy) return;
    if (step < TOUR_STEPS.length - 1) {
      setBusy(true);
      setContentKey((k) => k + 1);
      setStep((s) => s + 1);
      setTimeout(() => setBusy(false), 350);
    } else {
      setShowConfetti(true);
      setBalloonVisible(false);
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, "1");
        setActive(false);
        setShowConfetti(false);
      }, 3000);
    }
  }, [step, busy]);

  const back = useCallback(() => {
    if (busy || step === 0) return;
    setBusy(true);
    setContentKey((k) => k + 1);
    setStep((s) => Math.max(0, s - 1));
    setTimeout(() => setBusy(false), 350);
  }, [step, busy]);

  if (!active && !showConfetti) return null;

  const { w, h } = winSize;
  const clipPath  = buildClipPath(targetRect, w, h);
  const isLastStep = step === TOUR_STEPS.length - 1;

  // On mobile: if the spotlight target is in the bottom ~40% of the screen
  // (e.g. the bottom nav), float the sheet above it so it doesn't overlap.
  const mobileSheetBottom = (() => {
    if (!isMobile || !targetRect) return 0;
    if (targetRect.bottom > h * 0.6) return h - targetRect.top + 12;
    return 0;
  })();
  const sheetIsFloating = mobileSheetBottom > 0;

  const sharedCardProps: CardProps = {
    currentStep, step, total: TOUR_STEPS.length, contentKey, meta,
    isLastStep, busy, isMobile,
    onFinish: finish, onAdvance: advance, onBack: back,
  };

  return (
    <>
      {showConfetti && <ConfettiBurst />}

      {active && (
        <>
          {/* ── Dark overlay with animated spotlight cutout ────── */}
          <div
            className="fixed inset-0 z-[9000] cursor-pointer"
            style={{
              backgroundColor: "rgba(18,16,14,0.76)",
              clipPath,
              transition: "clip-path 0.55s cubic-bezier(0.4,0,0.2,1)",
            }}
            onClick={advance}
            aria-hidden="true"
          />

          {/* ── Spotlight ring ─────────────────────────────────── */}
          {targetRect && (
            <div
              className="fixed z-[9001] rounded-2xl pointer-events-none"
              style={{
                top: targetRect.top, left: targetRect.left,
                width: targetRect.width, height: targetRect.height,
                boxShadow:
                  "0 0 0 2px rgba(200,82,42,0.65), " +
                  "0 0 0 6px rgba(200,82,42,0.18), " +
                  "0 0 24px 4px rgba(200,82,42,0.12)",
                transition:
                  "top 0.55s cubic-bezier(0.4,0,0.2,1), left 0.55s cubic-bezier(0.4,0,0.2,1), " +
                  "width 0.55s cubic-bezier(0.4,0,0.2,1), height 0.55s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          )}

          {/* ═══════════════════════════════════════════════════
              MOBILE — bottom sheet
          ═══════════════════════════════════════════════════ */}
          {isMobile && (
            <div
              className={cn(
                "fixed left-0 right-0 z-[9002] bg-white overflow-hidden flex flex-col",
                "shadow-[0_-12px_48px_-4px_rgba(0,0,0,0.38),0_-2px_8px_rgba(0,0,0,0.12)]",
                sheetIsFloating ? "rounded-3xl mx-3" : "rounded-t-3xl",
                balloonVisible ? "translate-y-0" : "translate-y-[110%]",
              )}
              style={{
                bottom: sheetIsFloating ? mobileSheetBottom : 0,
                transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
              }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`Rondleiding stap ${step + 1}: ${currentStep.title}`}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-2.5 pb-0.5 shrink-0">
                <div className="w-9 h-1 rounded-full bg-ink/10" />
              </div>

              <TourCardInner {...sharedCardProps} />

              {/* iOS home-indicator safe area */}
              {!sheetIsFloating && <div className="pb-safe shrink-0" />}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              DESKTOP — floating balloon
          ═══════════════════════════════════════════════════ */}
          {!isMobile && (() => {
            const balloonPos = getBalloonPos(targetRect, currentStep.position, w, h);
            const isCentered = !targetRect;
            const effectiveW = Math.min(BALLOON_W, w - 32);

            return (
              <div
                className={cn(
                  "fixed z-[9002] bg-white rounded-2xl overflow-hidden flex flex-col",
                  "shadow-[0_24px_64px_-8px_rgba(0,0,0,0.40),0_4px_16px_-2px_rgba(0,0,0,0.20)]",
                  "transition-[opacity,transform] duration-300",
                  balloonVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                )}
                style={{
                  width: effectiveW,
                  ...balloonPos,
                  ...(!isCentered ? {
                    transition:
                      "top 0.55s cubic-bezier(0.4,0,0.2,1), left 0.55s cubic-bezier(0.4,0,0.2,1), " +
                      "opacity 0.3s ease, transform 0.3s ease",
                  } : {}),
                }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={`Rondleiding stap ${step + 1}: ${currentStep.title}`}
              >
                <TourCardInner {...sharedCardProps} />
              </div>
            );
          })()}
        </>
      )}
    </>
  );
}
