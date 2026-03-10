/**
 * Migration: maak admin_audit_log tabel aan
 * Run: npx tsx src/db/migrate-admin-audit.ts
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve } from "path";

try {
  const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
} catch { /* no .env.local */ }

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      admin_email     TEXT NOT NULL,
      action          TEXT NOT NULL,
      target_org_id   UUID,
      target_org_name TEXT,
      previous_value  JSONB,
      new_value       JSONB,
      note            TEXT,
      created_at      TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("✅ admin_audit_log tabel aangemaakt");
}

main().catch(console.error);
