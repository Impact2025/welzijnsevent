import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) return new NextResponse("Missing url", { status: 400 });

  // Only proxy Vercel Blob URLs
  if (!url.includes(".blob.vercel-storage.com")) {
    return new NextResponse("Invalid blob URL", { status: 400 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) return new NextResponse("Blob not found", { status: 404 });

  const data = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") ?? "image/png";

  return new NextResponse(data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
