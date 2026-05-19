import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED  = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.email !== process.env.ADMIN_EMAIL)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Geen bestand" }, { status: 400 });
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Alleen PNG, JPG, WebP of GIF" }, { status: 400 });
    if (file.size > MAX_SIZE)  return NextResponse.json({ error: "Max 5 MB" }, { status: 400 });

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) return NextResponse.json({ error: "Blob niet geconfigureerd" }, { status: 500 });

    const ext      = file.name.split(".").pop() ?? "jpg";
    const filename = `content/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const blob = await put(filename, file, { access: "public", contentType: file.type, token });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    return NextResponse.json({ error: "Upload mislukt", detail: String(err) }, { status: 500 });
  }
}
