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

async function migrateNews() {
  try {
    console.log("Connecting to database...");

    // Create news_categories table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS news_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("news_categories table created/verified");

    // Create news table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS news (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        thumbnail_url TEXT,
        thumbnail_public_id TEXT,
        excerpt TEXT,
        content TEXT,
        category_id TEXT,
        author TEXT,
        view_count INTEGER DEFAULT 0,
        is_published INTEGER DEFAULT 0,
        meta_title TEXT,
        meta_description TEXT,
        meta_keywords TEXT,
        published_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES news_categories(id) ON DELETE SET NULL
      )
    `);
    console.log("news table created/verified");

    // Create news_comments table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS news_comments (
        id TEXT PRIMARY KEY,
        news_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        comment TEXT NOT NULL,
        is_approved INTEGER DEFAULT 0,
        ip_address TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE
      )
    `);
    console.log("news_comments table created/verified");

    // Add view_count to events table if not exists
    try {
      await db.execute("SELECT view_count FROM events LIMIT 1");
      console.log("events.view_count column exists");
    } catch {
      console.log("Adding view_count to events table...");
      await db.execute("ALTER TABLE events ADD COLUMN view_count INTEGER DEFAULT 0");
      console.log("Added view_count to events table");
    }

    console.log("News migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

migrateNews()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
