import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const results: string[] = [];
  
  try {
    // Create events table if not exists
    await db.execute({
      sql: `
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
      `,
      args: [],
    });
    results.push("Events table created/verified");

    // Add kontak column if missing
    try {
      await db.execute("SELECT kontak FROM events LIMIT 1");
      results.push("kontak column exists");
    } catch {
      await db.execute("ALTER TABLE events ADD COLUMN kontak TEXT");
      results.push("Added kontak column");
    }
    
    // Add event_end_date column if missing
    try {
      await db.execute("SELECT event_end_date FROM events LIMIT 1");
      results.push("event_end_date column exists");
    } catch {
      await db.execute("ALTER TABLE events ADD COLUMN event_end_date TEXT");
      results.push("Added event_end_date column");
    }

    return NextResponse.json({ message: "Migration successful", results });
  } catch (error) {
    console.error("Migration failed:", error);
    return NextResponse.json({ error: "Migration failed", details: String(error) }, { status: 500 });
  }
}
