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
} catch { /* file may not exist */ }

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Running Phase 1 migrations...");

  // Add new columns to events
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS slug TEXT`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS tagline TEXT`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS website_color TEXT`;

  // Add unique index on slug (only where slug is not null)
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS events_slug_unique ON events (slug) WHERE slug IS NOT NULL`;

  console.log("✓ events table updated");

  // Create ticket_types table
  await sql`
    CREATE TABLE IF NOT EXISTS ticket_types (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      event_id UUID REFERENCES events(id) NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL DEFAULT 0,
      currency TEXT DEFAULT 'EUR',
      max_quantity INTEGER,
      sold_count INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("✓ ticket_types table created");

  // Create orders table
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      event_id UUID REFERENCES events(id) NOT NULL,
      ticket_type_id UUID REFERENCES ticket_types(id),
      attendee_id UUID REFERENCES attendees(id),
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'EUR',
      status TEXT DEFAULT 'pending',
      payment_id TEXT,
      payment_url TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("✓ orders table created");

  console.log("\nAll migrations complete!");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
