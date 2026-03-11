"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpTooltipProps {
  text: string;
  className?: string;
}

/**
 * Small "?" button that shows a tooltip on hover/focus.
 * No external library — pure React + CSS.
 */
export function HelpTooltip({ text, className }: HelpTooltipProps) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<"top" | "bottom">("top");
  const ref = useRef<HTMLButtonElement>(null);

  // Auto-flip if tooltip would overflow viewport top
  useEffect(() => {
    if (!show || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos(rect.top < 80 ? "bottom" : "top");
  }, [show]);

  return (
    <span className="relative inline-flex items-center">
      <button
        ref={ref}
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className={cn(
          "inline-flex items-center justify-center w-4 h-4 rounded-full",
          "text-ink-muted hover:text-terra-500 hover:bg-terra-50 transition-colors",
          className
        )}
        aria-label="Meer informatie"
        tabIndex={0}
      >
        <HelpCircle size={13} />
      </button>

      {/* Tooltip */}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 w-52",
          "bg-[#1C1814] text-white text-xs leading-relaxed rounded-xl px-3 py-2",
          "shadow-xl whitespace-normal transition-all duration-150",
          show ? "opacity-100 scale-100" : "opacity-0 scale-95",
          pos === "top" ? "bottom-full mb-2" : "top-full mt-2"
        )}
      >
        {text}
        {/* Arrow */}
        <span
          className={cn(
            "absolute left-1/2 -translate-x-1/2 border-4 border-transparent",
            pos === "top"
              ? "top-full border-t-[#1C1814]"
              : "bottom-full border-b-[#1C1814]"
          )}
        />
      </span>
    </span>
  );
}

// ── Convenience wrapper for label + help icon side by side ──────────────────
interface LabelWithHelpProps {
  children: ReactNode;
  help: string;
  className?: string;
}

export function LabelWithHelp({ children, help, className }: LabelWithHelpProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {children}
      <HelpTooltip text={help} />
    </span>
  );
}
