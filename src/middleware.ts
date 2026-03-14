import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/api/auth",
  "/e/",
  "/ticket/",
  "/functies",
  "/prijzen",
  "/over-ons",
  "/api/pusher",
  "/api/payments/multisafepay/webhook",
  "/api/social-wall",
  "/api/survey",
  "/api/custom-fields",
  "/api/public",
];

// Interne bijeen.app domeinen — geen custom domain routing
const INTERNAL_HOSTS = [
  "localhost",
  "bijeen.app",
  "www.bijeen.app",
  "welzijnsevent.nl",
];

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") ?? "";
  const baseHost = host.split(":")[0]; // strip port

  // ── White-label custom domain routing ─────────────────────
  // Als het verzoek binnenkomt op een onbekend domein → map naar /e/[org-slug]
  const isInternalHost = INTERNAL_HOSTS.some(h => baseHost === h || baseHost.endsWith(`.${h}`));

  if (!isInternalHost && pathname === "/") {
    // Redirect custom domain root naar /api/domain-lookup zodat de public event page geladen wordt
    const url = req.nextUrl.clone();
    url.pathname = "/api/domain-lookup";
    url.searchParams.set("host", baseHost);
    url.searchParams.set("redirect", "true");
    return NextResponse.rewrite(url);
  }

  // ── Auth protection ────────────────────────────────────────
  const isPublic =
    pathname === "/" ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  const session = (req as { auth?: { user?: { id?: string } } }).auth;

  // Ingelogde gebruiker bezoekt sign-in → stuur naar dashboard
  if (session?.user?.id && (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isPublic) return NextResponse.next();

  if (!session?.user?.id) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
