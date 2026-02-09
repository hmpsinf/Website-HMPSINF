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

async function migrateGalleries() {
  try {
    console.log("Connecting to database...");

    console.log("Creating galleries table...");

    // Create galleries table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS galleries (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        event_id TEXT,
        program_kerja_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (program_kerja_id) REFERENCES program_kerja(id) ON DELETE CASCADE,
        CHECK (event_id IS NOT NULL OR program_kerja_id IS NOT NULL)
      )
    `);

    console.log("✓ galleries table created");

    console.log("Creating gallery_images table...");

    // Create gallery_images table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id TEXT PRIMARY KEY,
        gallery_id TEXT NOT NULL,
        image_url TEXT NOT NULL,
        public_id TEXT NOT NULL,
        caption TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (gallery_id) REFERENCES galleries(id) ON DELETE CASCADE
      )
    `);

    console.log("✓ gallery_images table created");

    // Create indexes for better query performance
    console.log("Creating indexes...");

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_galleries_event_id 
      ON galleries(event_id)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_galleries_program_kerja_id 
      ON galleries(program_kerja_id)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_gallery_images_gallery_id 
      ON gallery_images(gallery_id)
    `);

    console.log("✓ Indexes created");

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateGalleries();
