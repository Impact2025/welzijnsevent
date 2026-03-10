import { NextRequest, NextResponse } from "next/server";
import { db, organizations, events } from "@/db";
import { eq } from "drizzle-orm";

// White-label domain lookup — mapt custom domain naar organisatie slug
export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host");
  const shouldRedirect = req.nextUrl.searchParams.get("redirect") === "true";

  if (!host) return NextResponse.json({ error: "host vereist" }, { status: 400 });

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.customDomain, host));

  if (!org) {
    return NextResponse.json({ error: "Geen organisatie gevonden voor dit domein" }, { status: 404 });
  }

  if (shouldRedirect) {
    // Zoek het eerste actieve publieke event van deze organisatie
    const [event] = await db
      .select({ slug: events.slug })
      .from(events)
      .where(eq(events.organizationId, org.id));

    if (event?.slug) {
      return NextResponse.redirect(
        new URL(`/e/${event.slug}`, req.url)
      );
    }
    // Fallback: toon orgpagina (toekomstig)
    return NextResponse.json({ organization: { id: org.id, name: org.name, slug: org.slug } });
  }

  return NextResponse.json({
    organization: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logo: org.logo,
      primaryColor: org.primaryColor,
    },
  });
}
