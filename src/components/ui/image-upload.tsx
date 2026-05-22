"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface Props {
  value:       string;          // current URL
  onChange:    (url: string) => void;
  aspectRatio?: "square" | "wide" | "logo"; // visual hint
  placeholder?: string;
  className?:  string;
}

const ASPECT: Record<string, string> = {
  square: "aspect-square",
  wide:   "aspect-video",
  logo:   "aspect-[3/1]",
};

async function compressImage(file: File, maxBytes = 2 * 1024 * 1024): Promise<File> {
  if (file.type === "image/svg+xml" || file.size <= maxBytes) return file;
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      const MAX_DIM = 2048;
      if (w > MAX_DIM || h > MAX_DIM) {
        const ratio = MAX_DIM / Math.max(w, h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      const tryQuality = (q: number) => {
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error("Compressie mislukt")); return; }
          if (blob.size <= maxBytes || q <= 0.2) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
          } else {
            tryQuality(Math.round((q - 0.15) * 100) / 100);
          }
        }, "image/jpeg", q);
      };
      tryQuality(0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Afbeelding laden mislukt")); };
    img.src = objectUrl;
  });
}

export function ImageUpload({
  value,
  onChange,
  aspectRatio = "square",
  placeholder = "Klik of sleep een afbeelding",
  className = "",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState("");
  const [dragging,  setDragging]  = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError("");
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const form = new FormData();
      form.append("file", compressed);
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload mislukt");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload mislukt");
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {value ? (
        <div className={`relative rounded-xl overflow-hidden bg-gray-100 ${ASPECT[aspectRatio]}`}>
          <Image
            src={value}
            alt="Upload preview"
            fill
            className="object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
          >
            <X size={13} className="text-white" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`${ASPECT[aspectRatio]} rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            dragging
              ? "border-terra-400 bg-terra-50/50"
              : "border-sand hover:border-terra-300 hover:bg-terra-50/30"
          }`}
        >
          {uploading ? (
            <Loader2 size={22} className="animate-spin text-terra-400" />
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center">
                {dragging
                  ? <Upload size={18} className="text-terra-500" />
                  : <ImageIcon size={18} className="text-ink-muted" />
                }
              </div>
              <p className="text-xs text-ink-muted text-center px-4">{placeholder}</p>
              <p className="text-[10px] text-ink-muted/50">PNG, JPG, WebP · grote foto&apos;s worden automatisch verkleind</p>
            </>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={onFileChange}
        className="hidden"
      />
    </div>
  );
}
