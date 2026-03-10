import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, organizations } from "@/db";
import { eq } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const org = await getCurrentOrg();
    return NextResponse.json({ organization: org ?? null });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const org = await getCurrentOrg();
    if (!org) {
      return NextResponse.json({ error: "Organisatie niet gevonden" }, { status: 404 });
    }

    const body = await req.json();
    const { OrganizationPatchSchema, validationError } = await import("@/lib/validation");
    const parsed = OrganizationPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error), { status: 422 });
    }

    const { name, logo, primaryColor } = parsed.data;

    const [updated] = await db
      .update(organizations)
      .set({ name, logo: logo ?? null, primaryColor })
      .where(eq(organizations.id, org.id))
      .returning();

    return NextResponse.json({ organization: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
