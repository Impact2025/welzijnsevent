import { cn } from "@/lib/utils";

const LIFECYCLE_CONFIG: Record<string, { label: string; className: string }> = {
  contact:   { label: "Contact",   className: "bg-gray-100 text-gray-600 border-gray-200"     },
  betrokken: { label: "Betrokken", className: "bg-blue-50 text-blue-700 border-blue-200"      },
  actief:    { label: "Actief",    className: "bg-green-50 text-green-700 border-green-200"   },
  vip:       { label: "VIP ★",    className: "bg-amber-50 text-amber-700 border-amber-200"   },
  inactief:  { label: "Inactief",  className: "bg-gray-50 text-gray-400 border-gray-200"      },
};

interface Props {
  stage: string;
  size?: "sm" | "md";
}

export function LifecycleBadge({ stage, size = "md" }: Props) {
  const cfg = LIFECYCLE_CONFIG[stage] ?? LIFECYCLE_CONFIG.contact;
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border font-semibold shrink-0",
      size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
      cfg.className
    )}>
      {cfg.label}
    </span>
  );
}

export { LIFECYCLE_CONFIG };
