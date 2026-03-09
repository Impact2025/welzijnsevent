import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  baseHref,
}: {
  page: number;
  totalPages: number;
  /** Base URL without page param, e.g. "/dashboard/events/x/deelnemers?status=ingecheckt" */
  baseHref: string;
}) {
  if (totalPages <= 1) return null;

  const sep = baseHref.includes("?") ? "&" : "?";
  const prevHref = page > 1 ? `${baseHref}${sep}page=${page - 1}` : null;
  const nextHref = page < totalPages ? `${baseHref}${sep}page=${page + 1}` : null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-sand bg-white">
      {prevHref ? (
        <Link
          href={prevHref}
          className="flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-ink transition-colors"
        >
          <ChevronLeft size={14} />
          Vorige
        </Link>
      ) : (
        <span className="flex items-center gap-1 text-sm font-semibold text-sand cursor-not-allowed">
          <ChevronLeft size={14} />
          Vorige
        </span>
      )}

      <p className="text-xs text-ink-muted font-medium">
        {page} / {totalPages}
      </p>

      {nextHref ? (
        <Link
          href={nextHref}
          className="flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-ink transition-colors"
        >
          Volgende
          <ChevronRight size={14} />
        </Link>
      ) : (
        <span className="flex items-center gap-1 text-sm font-semibold text-sand cursor-not-allowed">
          Volgende
          <ChevronRight size={14} />
        </span>
      )}
    </div>
  );
}
