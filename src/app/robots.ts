import { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/admin/",
          "/api/",
          "/sign-in",
          "/sign-up",
          "/onboarding",
          "/offline",
          "/invite/",
          "/ticket/",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
