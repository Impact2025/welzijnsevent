"use client";

import { useRouter, usePathname } from "next/navigation";

interface Tab {
  label: string;
  value: string;
  count?: number;
}

export function FilterTabs({
  tabs,
  currentValue,
  currentQ = "",
  paramName = "status",
}: {
  tabs: Tab[];
  currentValue: string;
  currentQ?: string;
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function handleClick(value: string) {
    const params = new URLSearchParams();
    if (value) params.set(paramName, value);
    if (currentQ) params.set("q", currentQ);
    const qs = params.toString();
    router.replace(pathname + (qs ? `?${qs}` : ""));
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = tab.value === currentValue;
        return (
          <button
            key={tab.value}
            onClick={() => handleClick(tab.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive
                ? "bg-terra-500 text-white"
                : "bg-white text-ink-muted border border-sand hover:bg-sand"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-white/20" : "bg-sand"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
