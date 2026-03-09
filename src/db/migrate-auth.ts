import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve } from "path";

// Manually load .env.local
try {
  const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
} catch { /* no .env.local */ }

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Running auth migration...");

  await sql`
    ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS clerk_user_id text UNIQUE
  `;
  console.log("✓ Added clerk_user_id to organizations");

  await sql`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id uuid NOT NULL REFERENCES organizations(id),
      plan          text NOT NULL,
      status        text DEFAULT 'active',
      starts_at     timestamp DEFAULT now(),
      expires_at    timestamp,
      payment_id    text,
      amount_paid   integer,
      created_at    timestamp DEFAULT now(),
      updated_at    timestamp DEFAULT now()
    )
  `;
  console.log("✓ Created subscriptions table");

  console.log("Migration complete!");
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
