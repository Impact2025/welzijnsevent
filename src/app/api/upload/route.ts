import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Geen bestand meegegeven" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Alleen PNG, JPG, SVG of WebP toegestaan" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Bestand mag maximaal 2 MB zijn" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "png";
    const filename = `logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "Blob token niet geconfigureerd" }, { status: 500 });
    }

    const blob = await put(filename, file, {
      access: "private",
      contentType: file.type,
      token,
    });

    // Return a proxied URL so private blobs are accessible via our own domain
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const proxyUrl = `${baseUrl}/api/blob?url=${encodeURIComponent(blob.url)}`;
    return NextResponse.json({ url: proxyUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[upload]", msg);
    return NextResponse.json({ error: "Upload mislukt", detail: msg }, { status: 500 });
  }
}
