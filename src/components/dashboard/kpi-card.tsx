import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({ label, value, trend, trendLabel, icon, className }: KpiCardProps) {
  const isUp   = trend !== undefined && trend > 0;
  const isDown = trend !== undefined && trend < 0;

  return (
    <div className={cn(
      "card-base p-3 sm:p-5 relative overflow-hidden group",
      className
    )}>
      {/* Top accent stripe */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-terra-400/60 via-terra-500 to-terra-400/60" />

      <div className="flex items-start justify-between mb-2 sm:mb-4">
        <p className="text-[9px] sm:text-[10px] font-bold text-ink-muted uppercase tracking-wide sm:tracking-widest leading-none">
          {label}
        </p>
        {icon && (
          <div className="hidden sm:flex w-7 h-7 rounded-lg bg-terra-50 items-center justify-center text-terra-500 group-hover:bg-terra-100 transition-colors">
            {icon}
          </div>
        )}
      </div>

      <p className="text-2xl sm:text-[2rem] font-extrabold text-ink tracking-tight leading-none mb-1.5 sm:mb-2">
        {value}
      </p>

      {trend !== undefined && (
        <div className={cn(
          "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full",
          isUp   && "bg-green-50 text-green-700",
          isDown && "bg-red-50 text-red-600",
          !isUp && !isDown && "bg-sand text-ink-muted"
        )}>
          {isUp   && <TrendingUp size={10} />}
          {isDown && <TrendingDown size={10} />}
          {!isUp && !isDown && <Minus size={10} />}
          <span>{trend > 0 ? "+" : ""}{trend}%{trendLabel ? ` ${trendLabel}` : ""}</span>
        </div>
      )}
    </div>
  );
}
