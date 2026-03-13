"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Copy, Trash2, Loader2 } from "lucide-react";

interface Props {
  eventId: string;
}

export function EventActionsMenu({ eventId }: Props) {
  const router = useRouter();
  const [open,         setOpen]         = useState(false);
  const [duplicating,  setDuplicating]  = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmDelete(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleDuplicate() {
    setDuplicating(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/events/${eventId}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (data.event?.id) {
        router.push(`/dashboard/events/${data.event.id}`);
      }
    } finally {
      setDuplicating(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    setOpen(false);
    try {
      await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      router.push("/dashboard/events");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="text-white/70 hover:text-white p-2 -mr-2 rounded-xl hover:bg-white/10 transition-colors"
      >
        {duplicating || deleting
          ? <Loader2 size={20} className="animate-spin" />
          : <MoreHorizontal size={20} />
        }
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-sand overflow-hidden z-50">
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-ink hover:bg-sand/60 transition-colors"
          >
            <Copy size={14} className="text-ink-muted" />
            Dupliceer evenement
          </button>
          <div className="h-px bg-sand mx-3" />
          <button
            onClick={handleDelete}
            className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors ${
              confirmDelete
                ? "bg-red-50 text-red-600 font-bold"
                : "text-red-500 hover:bg-red-50"
            }`}
          >
            <Trash2 size={14} />
            {confirmDelete ? "Zeker weten?" : "Verwijder evenement"}
          </button>
        </div>
      )}
    </div>
  );
}
