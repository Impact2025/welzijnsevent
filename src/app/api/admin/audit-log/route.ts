import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, adminAuditLog } from "@/db";
import { desc } from "drizzle-orm";

function isAdmin(email: string | null | undefined) {
  const adminEmail = process.env.ADMIN_EMAIL;
  return adminEmail && email === adminEmail;
}

export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const logs = await db.select().from(adminAuditLog).orderBy(desc(adminAuditLog.createdAt)).limit(200);
  return NextResponse.json(logs);
}
