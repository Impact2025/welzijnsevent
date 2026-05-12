"use client";

import { useState, useCallback } from "react";
import { Check, X, Mail, Phone, Loader2, ChevronDown, ChevronUp, Users, HandHeart } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials, avatarColor } from "@/lib/utils";
import type { PipelineApplication } from "@/app/dashboard/events/[id]/vacatures/pipeline/page";

type Status = "pending" | "accepted" | "rejected" | "withdrawn";

const COLUMNS: { status: Status; label: string; cls: string; headerCls: string; dotCls: string }[] = [
  {
    status:    "pending",
    label:     "Nieuw",
    cls:       "bg-amber-50 border-amber-200",
    headerCls: "text-amber-700 bg-amber-100",
    dotCls:    "bg-amber-400",
  },
  {
    status:    "accepted",
    label:     "Geaccepteerd",
    cls:       "bg-green-50 border-green-200",
    headerCls: "text-green-700 bg-green-100",
    dotCls:    "bg-green-500",
  },
  {
    status:    "rejected",
    label:     "Afgewezen",
    cls:       "bg-red-50 border-red-200",
    headerCls: "text-red-600 bg-red-100",
    dotCls:    "bg-red-400",
  },
  {
    status:    "withdrawn",
    label:     "Teruggetrokken",
    cls:       "bg-gray-50 border-gray-200",
    headerCls: "text-gray-500 bg-gray-100",
    dotCls:    "bg-gray-400",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  begeleiding:  "bg-blue-50 text-blue-600",
  registratie:  "bg-purple-50 text-purple-600",
  catering:     "bg-orange-50 text-orange-600",
  techniek:     "bg-gray-100 text-gray-600",
  veiligheid:   "bg-red-50 text-red-600",
  communicatie: "bg-sky-50 text-sky-600",
  decoratie:    "bg-pink-50 text-pink-600",
  vervoer:      "bg-yellow-50 text-yellow-700",
  kinderhoek:   "bg-green-50 text-green-600",
  overig:       "bg-sand text-ink-muted",
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

type Props = {
  initialApplications: PipelineApplication[];
  eventId: string;
};

export function PipelineBoard({ initialApplications, eventId }: Props) {
  const [apps, setApps] = useState(initialApplications);
  const [patchingId, setPatchingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [filterVacancy, setFilterVacancy] = useState("");

  const uniqueVacancies = Array.from(
    new Map(apps.map((a) => [a.vacancyId, a.vacancyTitle])).entries()
  );

  const filtered = filterVacancy
    ? apps.filter((a) => a.vacancyId === filterVacancy)
    : apps;

  async function patch(appId: string, status: Status) {
    setPatchingId(appId);
    try {
      const res = await fetch(`/api/vacancy-applications/${appId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status }),
      });
      if (res.ok) {
        setApps((prev) => prev.map((a) => a.id === appId ? { ...a, status } : a));
        setExpandedId(null);
      }
    } finally {
      setPatchingId(null);
    }
  }

  async function bulkPatch(status: Status) {
    if (selected.size === 0) return;
    setBulkBusy(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch(`/api/vacancy-applications/${id}`, {
            method:  "PATCH",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ status }),
          })
        )
      );
      setApps((prev) =>
        prev.map((a) => selected.has(a.id) ? { ...a, status } : a)
      );
      setSelected(new Set());
    } finally {
      setBulkBusy(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="p-4 md:p-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center mb-5">
        {uniqueVacancies.length > 1 && (
          <select
            value={filterVacancy}
            onChange={(e) => setFilterVacancy(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-sand bg-white text-ink outline-none focus:border-terra-300 transition-colors"
          >
            <option value="">Alle vacatures</option>
            {uniqueVacancies.map(([id, title]) => (
              <option key={id} value={id}>{title}</option>
            ))}
          </select>
        )}

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-auto bg-white border border-sand rounded-xl px-3 py-2 shadow-sm">
            <span className="text-xs font-semibold text-ink-muted">{selected.size} geselecteerd</span>
            <button
              onClick={() => bulkPatch("accepted")}
              disabled={bulkBusy}
              className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-colors"
            >
              {bulkBusy ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
              Accepteer alles
            </button>
            <button
              onClick={() => bulkPatch("rejected")}
              disabled={bulkBusy}
              className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              {bulkBusy ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
              Wijs af
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-[10px] text-ink-muted/60 hover:text-ink-muted transition-colors px-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colApps = filtered.filter((a) => a.status === col.status);
          return (
            <div key={col.status} className="flex flex-col gap-3 min-w-0">
              {/* Column header */}
              <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border", col.cls)}>
                <span className={cn("w-2 h-2 rounded-full", col.dotCls)} />
                <span className={cn("text-xs font-bold", col.headerCls.split(" ")[0])}>
                  {col.label}
                </span>
                <span className={cn(
                  "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full",
                  col.headerCls
                )}>
                  {colApps.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2.5">
                {colApps.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-sand py-8 text-center">
                    <p className="text-xs text-ink-muted/40">Leeg</p>
                  </div>
                ) : (
                  colApps.map((app) => {
                    const isExpanded  = expandedId === app.id;
                    const isPatching  = patchingId === app.id;
                    const isSelected  = selected.has(app.id);
                    const initials    = getInitials(app.volunteerName);
                    const color       = avatarColor(app.volunteerName);
                    const catCls      = CATEGORY_COLORS[app.vacancyCategory] ?? CATEGORY_COLORS.overig;

                    return (
                      <div
                        key={app.id}
                        className={cn(
                          "bg-white rounded-2xl border shadow-sm transition-all duration-150",
                          isSelected
                            ? "border-terra-300 shadow-terra-100 shadow-md ring-1 ring-terra-200"
                            : "border-sand hover:border-gray-200 hover:shadow-md"
                        )}
                      >
                        <div className="p-3.5">
                          {/* Top row: checkbox + avatar + name */}
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(app.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 rounded accent-terra-500 shrink-0"
                            />
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-[11px] font-bold"
                              style={{ backgroundColor: color }}
                            >
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-ink truncate">{app.volunteerName}</p>
                              <p className="text-[11px] text-ink-muted truncate">{app.volunteerEmail}</p>
                            </div>
                          </div>

                          {/* Vacancy badge */}
                          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", catCls)}>
                              {app.vacancyTitle}
                            </span>
                            {app.appliedAt && (
                              <span className="text-[10px] text-ink-muted/60">
                                {formatDate(app.appliedAt)}
                              </span>
                            )}
                          </div>

                          {/* Motivation snippet */}
                          {app.motivation && !isExpanded && (
                            <p className="mt-2 text-xs text-ink-muted line-clamp-2 leading-relaxed">
                              {app.motivation}
                            </p>
                          )}

                          {/* Expand toggle */}
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : app.id)}
                            className="mt-2 flex items-center gap-1 text-[11px] text-ink-muted/60 hover:text-ink-muted transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                            {isExpanded ? "Inklappen" : "Details"}
                          </button>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="border-t border-sand px-3.5 py-3 space-y-3">
                            {app.motivation && (
                              <div>
                                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">Motivatie</p>
                                <p className="text-xs text-ink leading-relaxed">{app.motivation}</p>
                              </div>
                            )}
                            {app.volunteerPhone && (
                              <a
                                href={`tel:${app.volunteerPhone}`}
                                className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-terra-500 transition-colors"
                              >
                                <Phone size={11} />
                                {app.volunteerPhone}
                              </a>
                            )}
                            {app.volunteerSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {app.volunteerSkills.map((s) => (
                                  <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cream border border-sand text-ink-muted">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Action buttons */}
                            {app.status === "pending" && (
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => patch(app.id, "rejected")}
                                  disabled={isPatching}
                                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 disabled:opacity-50 transition-colors"
                                >
                                  {isPatching ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
                                  Afwijzen
                                </button>
                                <button
                                  onClick={() => patch(app.id, "accepted")}
                                  disabled={isPatching}
                                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold disabled:opacity-50 transition-colors"
                                >
                                  {isPatching ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                                  Accepteren
                                </button>
                                <a
                                  href={`mailto:${app.volunteerEmail}`}
                                  className="ml-auto flex items-center gap-1 px-2.5 py-2 rounded-xl border border-sand text-ink-muted hover:bg-sand transition-colors"
                                  title="Stuur een e-mail"
                                >
                                  <Mail size={12} />
                                </a>
                              </div>
                            )}
                            {app.status === "accepted" && (
                              <button
                                onClick={() => patch(app.id, "rejected")}
                                disabled={isPatching}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
                              >
                                {isPatching ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
                                Toch afwijzen
                              </button>
                            )}
                            {app.status === "rejected" && (
                              <button
                                onClick={() => patch(app.id, "accepted")}
                                disabled={isPatching}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-green-200 text-green-700 text-xs font-semibold hover:bg-green-50 disabled:opacity-50 transition-colors"
                              >
                                {isPatching ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                                Alsnog accepteren
                              </button>
                            )}

                            {/* Link to full volunteer profile */}
                            <a
                              href={`/dashboard/vrijwilligers/${encodeURIComponent(app.volunteerEmail)}`}
                              className="block text-[11px] text-terra-600 hover:text-terra-700 font-semibold transition-colors pt-1"
                            >
                              Volledig profiel bekijken →
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <HandHeart size={40} className="mx-auto text-ink-muted/20 mb-3" />
          <p className="text-sm font-semibold text-ink mb-1">Nog geen aanmeldingen</p>
          <p className="text-xs text-ink-muted">
            Zodra vrijwilligers zich aanmelden voor een vacature, verschijnen ze hier.
          </p>
        </div>
      )}
    </div>
  );
}
