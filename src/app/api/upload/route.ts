import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  const userId = session.user.id;

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "Geen bestand" }, { status: 400 });

  const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Alleen PNG, JPG, WebP of SVG toegestaan" }, { status: 400 });
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Bestand mag maximaal 2 MB zijn" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "png";
  const blob = await put(`logos/${userId}-${Date.now()}.${ext}`, file, {
    access: "public",
  });

  return NextResponse.json({ url: blob.url });
}
