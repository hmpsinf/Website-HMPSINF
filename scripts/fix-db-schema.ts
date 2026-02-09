import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

// Load .env.local explicitly
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  console.log("Current env:", process.env);
  process.exit(1);
}

const db = createClient({ url, authToken });

async function fixSchema() {
  try {
    console.log("Connecting to database...");
    
    // Check if table exists
    const tableCheck = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='events'");
    if (tableCheck.rows.length === 0) {
      console.log("Events table missing, running migration...");
      // ... create table logic ...
      await db.execute(`
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          thumbnail_url TEXT,
          thumbnail_public_id TEXT,
          event_date TEXT NOT NULL,
          event_end_date TEXT,
          event_time TEXT,
          timeline TEXT,
          location TEXT NOT NULL,
          description TEXT,
          kontak TEXT,
          link_url TEXT,
          link_text TEXT,
          is_open INTEGER DEFAULT 1,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("Events table created.");
    } else {
      console.log("Events table exists. Checking columns...");
    }

    // Add 'kontak' column if missing
    try {
      await db.execute("SELECT kontak FROM events LIMIT 1");
      console.log("'kontak' column exists");
    } catch (error) {
      console.log("'kontak' column missing, adding it...");
      await db.execute("ALTER TABLE events ADD COLUMN kontak TEXT");
      console.log("Added 'kontak' column");
    }

    // Add 'event_end_date' column if missing
    try {
      await db.execute("SELECT event_end_date FROM events LIMIT 1");
      console.log("'event_end_date' column exists");
    } catch (error) {
      console.log("'event_end_date' column missing, adding it...");
      await db.execute("ALTER TABLE events ADD COLUMN event_end_date TEXT");
      console.log("Added 'event_end_date' column");
    }
    
    console.log("Schema fix completed successfully.");
    
  } catch (error) {
    console.error("Error fixing schema:", error);
  }
}

fixSchema();
