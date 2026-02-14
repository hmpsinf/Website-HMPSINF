import { config } from 'dotenv';

export async function migratePengumuman() {
  // Load env vars first
  config({ path: '.env.local' });
  
  // Dynamic import to avoid hoisting issues
  const { default: db } = await import("@/lib/db");

  try {
    // Create pengumuman table
    await db.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS pengumuman (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          thumbnail_url TEXT,
          thumbnail_public_id TEXT,
          content TEXT,
          author TEXT NOT NULL,
          is_published INTEGER DEFAULT 0,
          published_at TEXT,
          view_count INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `,
      args: [],
    });

    console.log("Pengumuman table created/verified successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migratePengumuman();
