"use client";

import { useRef, useState } from "react";
import { Upload, Palette, X, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;          // "" | "https://..." | "color:#XXXXXX"
  onChange: (val: string) => void;
}

// Brand kleuren — geen gradient, alleen solid
const BRAND_COLORS = [
  { hex: "#C8522A", label: "Terra" },
  { hex: "#B04420", label: "Terra donker" },
  { hex: "#E8693A", label: "Terra licht" },
  { hex: "#1C1814", label: "Nacht" },
  { hex: "#2C2420", label: "Espresso" },
  { hex: "#3D3330", label: "Bark" },
  { hex: "#6B5E54", label: "Walnoot" },
  { hex: "#9E9890", label: "Steen" },
  { hex: "#C8C0B8", label: "Grijs warm" },
  { hex: "#F0EDE8", label: "Zand licht" },
  { hex: "#2D6A4F", label: "Bos" },
  { hex: "#1D4E89", label: "Oceaan" },
  { hex: "#6B3FA0", label: "Violet" },
  { hex: "#B5451B", label: "Baksteen" },
];

function isColor(val: string) { return val.startsWith("color:"); }
function getHex(val: string)  { return val.startsWith("color:") ? val.slice(6) : ""; }

export function CoverPicker({ value, onChange }: Props) {
  const [tab,       setTab]       = useState<"foto" | "kleur">(isColor(value) ? "kleur" : "foto");
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState("");
  const [customHex, setCustomHex] = useState(isColor(value) ? getHex(value) : "");
  const fileRef = useRef<HTMLInputElement>(null);

  const currentHex = isColor(value) ? getHex(value) : "";
  const isPhoto    = value && !isColor(value);

  async function upload(file: File) {
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res  = await fetch("/api/upload/image", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Upload mislukt"); return; }
      onChange(data.url);
    } catch {
      setError("Upload mislukt");
    } finally {
      setUploading(false);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  function pickColor(hex: string) {
    onChange(`color:${hex}`);
    setCustomHex(hex);
  }

  function applyCustomHex() {
    const hex = customHex.startsWith("#") ? customHex : `#${customHex}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) onChange(`color:${hex}`);
  }

  // Preview render
  function Preview() {
    if (!value) return null;
    return (
      <div className="mt-3 relative rounded-xl overflow-hidden border border-[#E8E4DE] h-28">
        {isPhoto ? (
          <img src={value} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: currentHex }} />
        )}
        <button
          type="button"
          onClick={() => { onChange(""); setCustomHex(""); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
          title="Verwijderen"
        >
          <X size={13} />
        </button>
        <div className="absolute bottom-2 left-2 text-[10px] font-semibold text-white/90 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
          {isPhoto ? "Foto" : currentHex}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {(["foto", "kleur"] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors",
              tab === t
                ? "bg-[#C8522A]/15 text-[#C8522A]"
                : "text-[#9E9890] hover:text-[#6B5E54] hover:bg-[#F5F4F0]"
            )}>
            {t === "foto" ? <Upload size={12} /> : <Palette size={12} />}
            {t === "foto" ? "Foto uploaden" : "Kleur kiezen"}
          </button>
        ))}
      </div>

      {/* Foto tab */}
      {tab === "foto" && (
        <div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFile} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#E8E4DE] hover:border-[#C8522A]/40 rounded-xl py-5 text-center transition-colors cursor-pointer disabled:opacity-50 bg-[#F5F4F0] hover:bg-[#F0EDE8]"
          >
            {uploading
              ? <Loader2 size={20} className="animate-spin text-[#C8522A]" />
              : <ImageIcon size={20} className="text-[#C8C0B8]" />}
            <div>
              <p className="text-xs font-semibold text-[#6B5E54]">
                {uploading ? "Uploaden..." : "Klik of sleep een foto"}
              </p>
              <p className="text-[10px] text-[#9E9890] mt-0.5">PNG, JPG, WebP — max 5 MB</p>
            </div>
          </button>
          {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
        </div>
      )}

      {/* Kleur tab */}
      {tab === "kleur" && (
        <div>
          <div className="grid grid-cols-7 gap-1.5 mb-3">
            {BRAND_COLORS.map(c => (
              <button
                key={c.hex}
                type="button"
                title={c.label}
                onClick={() => pickColor(c.hex)}
                className={cn(
                  "w-full aspect-square rounded-lg border-2 transition-all",
                  currentHex === c.hex
                    ? "border-[#C8522A] scale-110 shadow-md"
                    : "border-transparent hover:border-[#C8522A]/40 hover:scale-105"
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg border border-[#E8E4DE] shrink-0 transition-colors"
              style={{ backgroundColor: customHex || "#ffffff" }} />
            <input
              type="text"
              value={customHex}
              onChange={e => setCustomHex(e.target.value)}
              onBlur={applyCustomHex}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); applyCustomHex(); } }}
              placeholder="#C8522A"
              maxLength={7}
              className="flex-1 text-xs font-mono bg-[#F5F4F0] rounded-lg px-2.5 py-1.5 border border-[#E8E4DE] outline-none focus:border-[#C8522A] transition-colors"
            />
            <button type="button" onClick={applyCustomHex}
              className="text-xs font-semibold text-[#C8522A] hover:underline shrink-0">
              Toepassen
            </button>
          </div>
        </div>
      )}

      {/* Preview */}
      <Preview />
    </div>
  );
}
