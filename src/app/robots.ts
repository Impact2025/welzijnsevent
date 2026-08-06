import { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app").replace(/\/$/, "");

/**
 * LET OP: zet hier nooit óók een public/robots.txt naast. Bestanden in public/
 * worden als filesystem-route eerder afgehandeld dan deze metadata-route en
 * schaduwen hem volledig. Dat is tussen mei en augustus 2026 gebeurd: alle
 * regels hieronder waren dode code en de site serveerde een verouderde
 * robots.txt zonder de /e/*-uitzonderingen.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // App routes (auth-vereist of niet-publiek).
          // Let op: géén trailing slash. "Disallow: /dashboard/" matcht alleen
          // paden ónder /dashboard/ — niet /dashboard zelf, en ook niet
          // /dashboard?tab=x. Zonder slash is het een prefix-match die beide dekt.
          "/dashboard",
          "/admin",
          "/api/",
          "/onboarding",
          "/offline",
          "/invite",
          "/ticket",
          "/vrijwilliger",
          // /sign-in en /sign-up staan hier bewust NIET: die dragen een
          // noindex (src/app/(auth)/layout.tsx) en moeten crawlbaar blijven,
          // anders kan Google de reeds geïndexeerde versies nooit laten vallen.
          // Event sub-pagina's (persoonlijk, thin of app-only)
          "/e/*/embed",
          "/e/*/live",
          "/e/*/mijn-agenda",
          "/e/*/mijn-matches",
          "/e/*/mijn-ticket",
          "/e/*/wall",
          "/e/*/survey",
          "/e/*/register/success",
          "/e/*/register/waitlist-success",
          "/e/*/vacatures/*/bevestiging",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
