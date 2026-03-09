"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";

export function SearchInput({
  placeholder = "Zoeken...",
  defaultValue = "",
  currentParams = "",
  className = "",
}: {
  placeholder?: string;
  defaultValue?: string;
  /** Serialized URLSearchParams string to preserve alongside q= */
  currentParams?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(currentParams);
    if (e.target.value) {
      params.set("q", e.target.value);
    } else {
      params.delete("q");
    }
    const qs = params.toString();
    startTransition(() => {
      router.replace(pathname + (qs ? `?${qs}` : ""));
    });
  }

  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${className}`}>
      <Search className="w-4 h-4 text-ink-muted shrink-0" />
      <input
        type="text"
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="bg-transparent flex-1 text-sm outline-none text-ink placeholder-ink-muted"
      />
    </div>
  );
}
