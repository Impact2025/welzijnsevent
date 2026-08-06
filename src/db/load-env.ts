import { readFileSync } from "fs";
import { join } from "path";

/**
 * Laadt .env en .env.local in process.env vóór een dynamische db-import.
 * Static imports worden gehoist, dus scripts die de db gebruiken moeten deze
 * eerst aanroepen en daarna `await import("../db/index.js")` doen.
 * Bestaande process.env-waarden winnen (zodat CI/Vercel-vars niet overschreven worden).
 */
export function loadEnv(files = [".env", ".env.local"]): void {
  for (const f of files) {
    try {
      for (const line of readFileSync(join(process.cwd(), f), "utf8").split("\n")) {
        const m = line.match(/^\s*([^#\s=][^=]*)=(.*)$/);
        if (m && !process.env[m[1].trim()]) {
          process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
        }
      }
    } catch { /* bestand mag ontbreken */ }
  }
}
