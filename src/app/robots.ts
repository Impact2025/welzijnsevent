import { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // App routes (auth-vereist of niet-publiek)
          "/dashboard/",
          "/admin/",
          "/api/",
          "/sign-in/",
          "/sign-up/",
          "/onboarding/",
          "/offline/",
          "/invite/",
          "/ticket/",
          "/vrijwilliger/",
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
