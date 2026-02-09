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

async function migrateProgramKerja() {
  try {
    console.log("Connecting to database...");

    console.log("Creating program_kerja table...");

    // Create program_kerja table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS program_kerja (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        owner_type TEXT NOT NULL CHECK (owner_type IN ('hima', 'division')),
        division_id TEXT,
        period_id TEXT NOT NULL,
        document_id TEXT,
        status TEXT DEFAULT 'direncanakan' CHECK (status IN ('direncanakan', 'berjalan', 'selesai', 'dibatalkan')),
        priority TEXT DEFAULT 'sedang' CHECK (priority IN ('rendah', 'sedang', 'tinggi')),
        start_date TEXT,
        end_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
        FOREIGN KEY (period_id) REFERENCES hima_periods(id) ON DELETE CASCADE,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
      )
    `);

    console.log("✓ program_kerja table created");

    // Create indexes for better query performance
    console.log("Creating indexes...");

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_program_kerja_owner_type 
      ON program_kerja(owner_type)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_program_kerja_division_id 
      ON program_kerja(division_id)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_program_kerja_period_id 
      ON program_kerja(period_id)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_program_kerja_status 
      ON program_kerja(status)
    `);

    console.log("✓ Indexes created");

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateProgramKerja();
