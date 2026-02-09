import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local manually
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  });
  console.log("✅ Loaded environment from .env.local");
}

export async function migrateAbout() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log("📦 Creating sejarah table...");
  await client.execute({
    sql: `
      CREATE TABLE IF NOT EXISTS sejarah (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT 'Sejarah',
        content TEXT,
        image_url TEXT,
        image_public_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `,
    args: [],
  });
  console.log("✅ sejarah table created");

  console.log("📦 Creating visi_misi table...");
  await client.execute({
    sql: `
      CREATE TABLE IF NOT EXISTS visi_misi (
        id TEXT PRIMARY KEY,
        visi TEXT,
        misi TEXT,
        image_url TEXT,
        image_public_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `,
    args: [],
  });
  console.log("✅ visi_misi table created");

  console.log("🎉 About migration completed!");
}

// Run migration when executed directly
if (require.main === module) {
  console.log("Running about migration...");
  migrateAbout()
    .then(() => {
      console.log("✅ Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    });
}
