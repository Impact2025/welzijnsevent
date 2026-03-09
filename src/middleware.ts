import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // Public routes: event landing pages, public API, payment webhooks
  matcher: [
    "/((?!e/|api/public/|api/payments/).*)",
  ],
};
