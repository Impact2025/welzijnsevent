"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, Loader2, ChevronDown } from "lucide-react";

type CustomField = {
  id: string;
  label: string;
  type: string;
  options: string[];
  required: boolean;
  sortOrder: number;
};

const FIELD_TYPES = [
  { value: "text",     label: "Korte tekst" },
  { value: "textarea", label: "Lange tekst" },
  { value: "select",   label: "Keuzelijst (één optie)" },
  { value: "checkbox", label: "Meerdere keuzes" },
  { value: "yesno",    label: "Ja / Nee" },
];

interface CustomFieldsManagerProps {
  eventId: string;
}

export function CustomFieldsManager({ eventId }: CustomFieldsManagerProps) {
  const [fields, setFields]     = useState<CustomField[]>([]);
  const [loading, setLoading]   = useState(true);
  const [adding, setAdding]     = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [newLabel, setNewLabel]     = useState("");
  const [newType, setNewType]       = useState("text");
  const [newOptions, setNewOptions] = useState("");
  const [newRequired, setNewRequired] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/custom-fields?eventId=${eventId}`)
      .then(r => r.json())
      .then(data => setFields(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const options = ["select", "checkbox"].includes(newType)
        ? newOptions.split("\n").map(o => o.trim()).filter(Boolean)
        : [];

      const res = await fetch("/api/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          label: newLabel,
          type: newType,
          options,
          required: newRequired,
          sortOrder: fields.length,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Mislukt");
      setFields(prev => [...prev, data]);
      setNewLabel("");
      setNewType("text");
      setNewOptions("");
      setNewRequired(false);
      setAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij opslaan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (fieldId: string) => {
    await fetch("/api/custom-fields", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fieldId }),
    });
    setFields(prev => prev.filter(f => f.id !== fieldId));
  };

  const needsOptions = ["select", "checkbox"].includes(newType);

  return (
    <div className="card-base overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 border-b border-sand bg-sand/30 hover:bg-sand/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-ink">Eigen inschrijfvragen</span>
          {fields.length > 0 && (
            <span className="bg-terra-100 text-terra-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {fields.length}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-ink-muted transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 size={16} className="animate-spin text-ink-muted" />
            </div>
          ) : fields.length === 0 && !adding ? (
            <div className="py-4 text-center">
              <p className="text-xs text-ink-muted">Nog geen extra vragen ingesteld</p>
              <p className="text-[11px] text-ink-muted/60 mt-0.5">
                Voeg vragen toe die deelnemers moeten beantwoorden bij aanmelding
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map(field => (
                <div key={field.id} className="flex items-center gap-3 p-3 bg-sand/30 rounded-xl">
                  <GripVertical size={14} className="text-ink-muted/40 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{field.label}</p>
                    <p className="text-xs text-ink-muted">
                      {FIELD_TYPES.find(t => t.value === field.type)?.label ?? field.type}
                      {field.required && " · Verplicht"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(field.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Nieuw veld toevoegen */}
          {adding ? (
            <div className="bg-sand/30 rounded-xl p-4 space-y-3 border border-sand">
              <p className="text-xs font-bold text-ink">Nieuw veld</p>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">Vraag / Label</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="Bijv. Wat is je dieetwens?"
                  className="w-full rounded-xl border border-sand bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1">Veldtype</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  className="w-full rounded-xl border border-sand bg-white px-3 py-2 text-sm focus:outline-none"
                >
                  {FIELD_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {needsOptions && (
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1">
                    Opties (één per regel)
                  </label>
                  <textarea
                    rows={4}
                    value={newOptions}
                    onChange={e => setNewOptions(e.target.value)}
                    placeholder={"Optie 1\nOptie 2\nOptie 3"}
                    className="w-full rounded-xl border border-sand bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-terra-500/30"
                  />
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRequired}
                  onChange={e => setNewRequired(e.target.checked)}
                  className="w-4 h-4 rounded accent-terra-500"
                />
                <span className="text-xs text-ink">Verplicht veld</span>
              </label>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAdd}
                  disabled={!newLabel.trim() || saving}
                  className="flex items-center gap-1.5 bg-terra-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-terra-600 disabled:opacity-60 transition-colors"
                >
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  Toevoegen
                </button>
                <button
                  onClick={() => { setAdding(false); setError(null); }}
                  className="text-xs text-ink-muted hover:text-ink px-3 py-2 rounded-xl hover:bg-sand/50"
                >
                  Annuleren
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-terra-600 hover:text-terra-700 py-2.5 border-2 border-dashed border-terra-200 rounded-xl hover:border-terra-300 transition-colors"
            >
              <Plus size={13} />
              Vraag toevoegen
            </button>
          )}
        </div>
      )}
    </div>
  );
}
