import { NextResponse } from "next/server";
import { pingIndexNow, pingGoogleIndexingAPI } from "@/lib/indexing";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Alleen beschikbaar in development" }, { status: 403 });
  }

  const testUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/blog/test-artikel`;

  const [indexNowResult, googleResult] = await Promise.allSettled([
    pingIndexNow([testUrl]),
    pingGoogleIndexingAPI(testUrl),
  ]);

  return NextResponse.json({
    testUrl,
    indexNow: {
      status: indexNowResult.status,
      reason: indexNowResult.status === "rejected" ? String((indexNowResult as PromiseRejectedResult).reason) : "ok",
    },
    google: {
      status: googleResult.status,
      reason: googleResult.status === "rejected" ? String((googleResult as PromiseRejectedResult).reason) : "ok",
    },
  });
}
