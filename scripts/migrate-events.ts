import db from "@/lib/db";

export async function migrateEvents() {
  // Create events table
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

  console.log("Events table created/verified");

  // Add 'kontak' column if missing
  try {
    await db.execute("SELECT kontak FROM events LIMIT 1");
    console.log("'kontak' column exists");
  } catch (error) {
    console.log("'kontak' column missing, adding it...");
    try {
      await db.execute("ALTER TABLE events ADD COLUMN kontak TEXT");
      console.log("Added 'kontak' column");
    } catch (alterError) {
      console.error("Failed to add 'kontak' column:", alterError);
    }
  }

  // Add 'event_end_date' column if missing
  try {
    await db.execute("SELECT event_end_date FROM events LIMIT 1");
    console.log("'event_end_date' column exists");
  } catch (error) {
    console.log("'event_end_date' column missing, adding it...");
    try {
      await db.execute("ALTER TABLE events ADD COLUMN event_end_date TEXT");
      console.log("Added 'event_end_date' column");
    } catch (alterError) {
      console.error("Failed to add 'event_end_date' column:", alterError);
    }
  }
}
