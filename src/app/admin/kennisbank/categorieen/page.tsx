"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Plus, Trash2, Pencil, X, Check, GripVertical } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sortOrder: number | null;
  parentId: string | null;
}

const PRESET_ICONS = ["📚", "🚀", "⚙️", "💡", "📋", "🎯", "❓", "🔒", "💳", "📊", "👥", "📩"];

export default function AdminKennisbankCategorieenPage() {
  const [cats,    setCats]    = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [editId,  setEditId]  = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", description: "", icon: "📚", color: "#C8522A", sortOrder: "0" });
  const [editForm, setEditForm] = useState<Partial<typeof form>>({});

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/kennisbank/categorieen");
    if (res.ok) { const d = await res.json(); setCats(d.categories); }
    setLoading(false);
  }

  async function addCategory() {
    if (!form.name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/kennisbank/categorieen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description || null,
        icon: form.icon,
        color: form.color,
        sortOrder: parseInt(form.sortOrder) || 0,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setForm({ name: "", description: "", icon: "📚", color: "#C8522A", sortOrder: "0" });
      setAdding(false);
      load();
    }
  }

  async function saveEdit(id: string) {
    setSaving(true);
    await fetch(`/api/kennisbank/categorieen/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setSaving(false);
    setEditId(null);
    load();
  }

  async function deleteCategory(id: string, name: string) {
    if (!confirm(`"${name}" verwijderen? Artikelen in deze categorie verliezen hun categorie.`)) return;
    await fetch(`/api/kennisbank/categorieen/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#1C1814] tracking-tight">Categorieën</h1>
          <p className="text-sm text-[#9E9890] mt-0.5">{cats.length} categorie{cats.length !== 1 ? "ën" : ""}</p>
        </div>
        <button
          type="button"
          onClick={() => setAdding(v => !v)}
          className="inline-flex items-center gap-2 bg-[#C8522A] hover:bg-[#B04420] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          {adding ? <X size={15} /> : <Plus size={15} />}
          {adding ? "Annuleren" : "Nieuwe categorie"}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-white rounded-2xl border border-[#C8522A]/30 p-5 mb-5 flex flex-col gap-3">
          <p className="text-sm font-bold text-[#1C1814]">Nieuwe categorie</p>
          <div className="flex gap-2">
            <div>
              <label className="block text-[10px] font-bold text-[#9E9890] uppercase tracking-wide mb-1">Icoon</label>
              <div className="flex flex-wrap gap-1">
                {PRESET_ICONS.map(ic => (
                  <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icon: ic }))}
                    className={`w-8 h-8 rounded-lg text-base flex items-center justify-center border transition-colors ${form.icon === ic ? "border-[#C8522A] bg-[#C8522A]/10" : "border-[#E8E4DE] hover:bg-[#F5F4F0]"}`}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#9E9890] uppercase tracking-wide mb-1">Naam *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Aan de slag"
                className="w-full text-sm bg-[#F5F4F0] rounded-xl px-3 py-2 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#9E9890] uppercase tracking-wide mb-1">Volgorde</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                className="w-full text-sm bg-[#F5F4F0] rounded-xl px-3 py-2 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#9E9890] uppercase tracking-wide mb-1">Beschrijving</label>
            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Korte omschrijving van deze categorie..."
              className="w-full text-sm bg-[#F5F4F0] rounded-xl px-3 py-2 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors" />
          </div>
          <button type="button" onClick={addCategory} disabled={saving || !form.name.trim()}
            className="self-end flex items-center gap-2 bg-[#C8522A] hover:bg-[#B04420] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
            <Check size={14} /> Toevoegen
          </button>
        </div>
      )}

      {loading && <div className="text-center text-[#9E9890] text-sm py-10">Laden...</div>}

      {!loading && cats.length === 0 && !adding && (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <FolderOpen size={36} className="text-[#C8C0B8] mb-3" />
          <p className="text-[#6B5E54] font-semibold">Nog geen categorieën</p>
          <p className="text-sm text-[#9E9890] mt-1">Maak je eerste categorie aan</p>
        </div>
      )}

      {!loading && cats.length > 0 && (
        <div className="flex flex-col gap-2">
          {cats.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl border border-[#E8E4DE] p-4 flex items-start gap-3">
              <GripVertical size={16} className="text-[#C8C0B8] mt-1 shrink-0 cursor-grab" />
              <div className="text-2xl shrink-0">{cat.icon}</div>
              <div className="flex-1 min-w-0">
                {editId === cat.id ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input type="text" value={editForm.name ?? cat.name}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        className="flex-1 text-sm bg-[#F5F4F0] rounded-lg px-2 py-1 border border-[#E8E4DE] outline-none focus:border-[#C8522A]" />
                      <input type="number" value={editForm.sortOrder ?? cat.sortOrder ?? 0}
                        onChange={e => setEditForm(f => ({ ...f, sortOrder: e.target.value }))}
                        className="w-20 text-sm bg-[#F5F4F0] rounded-lg px-2 py-1 border border-[#E8E4DE] outline-none focus:border-[#C8522A]" />
                    </div>
                    <input type="text" value={editForm.description ?? cat.description ?? ""}
                      onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Beschrijving..."
                      className="text-sm bg-[#F5F4F0] rounded-lg px-2 py-1 border border-[#E8E4DE] outline-none focus:border-[#C8522A]" />
                    <div className="flex gap-1">
                      {PRESET_ICONS.map(ic => (
                        <button key={ic} type="button" onClick={() => setEditForm(f => ({ ...f, icon: ic }))}
                          className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center border transition-colors ${(editForm.icon ?? cat.icon) === ic ? "border-[#C8522A] bg-[#C8522A]/10" : "border-[#E8E4DE] hover:bg-[#F5F4F0]"}`}>
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-bold text-[#1C1814]">{cat.name}</p>
                    {cat.description && <p className="text-xs text-[#9E9890] mt-0.5">{cat.description}</p>}
                    <p className="text-[10px] text-[#C8C0B8] mt-0.5 font-mono">/kennisbank/{cat.slug}</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {editId === cat.id ? (
                  <>
                    <button type="button" onClick={() => saveEdit(cat.id)} disabled={saving}
                      className="flex items-center justify-center w-8 h-8 rounded-xl text-green-600 hover:bg-green-50 transition-colors">
                      <Check size={14} />
                    </button>
                    <button type="button" onClick={() => setEditId(null)}
                      className="flex items-center justify-center w-8 h-8 rounded-xl text-[#9E9890] hover:bg-[#F0EDE8] transition-colors">
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => { setEditId(cat.id); setEditForm({}); }}
                      className="flex items-center justify-center w-8 h-8 rounded-xl text-[#9E9890] hover:text-[#C8522A] hover:bg-[#C8522A]/10 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button type="button" onClick={() => deleteCategory(cat.id, cat.name)}
                      className="flex items-center justify-center w-8 h-8 rounded-xl text-[#9E9890] hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
