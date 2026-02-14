import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

// Load .env.local explicitly
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const db = createClient({ url, authToken });

async function migrateSponsorship() {
  try {
    console.log("Connecting to database...");

    // 1. Sponsorship Settings Table
    console.log("Creating sponsorship_settings table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sponsorship_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        title TEXT NOT NULL DEFAULT 'Sponsorship',
        subtitle TEXT,
        show_section BOOLEAN DEFAULT 1,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ sponsorship_settings table created");

    // Seed default settings if not exists
    console.log("Seeding default settings...");
    await db.execute(`
      INSERT OR IGNORE INTO sponsorship_settings (id, title, subtitle, show_section)
      VALUES ('default', 'Sponsorship', 'Our partners and supporters', 1)
    `);
    console.log("✓ Default settings seeded");

    // 2. Sponsorship Logos Table
    console.log("Creating sponsorship_logos table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sponsorship_logos (
        id TEXT PRIMARY KEY,
        image_url TEXT NOT NULL,
        public_id TEXT NOT NULL,
        caption TEXT,
        display_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ sponsorship_logos table created");

    console.log("\n✅ Sponsorship migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateSponsorship();
