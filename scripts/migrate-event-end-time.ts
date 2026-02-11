import { config } from "dotenv";
import path from "path";

// Explicitly load .env.local
config({ path: path.resolve(process.cwd(), ".env.local") });

async function migrateEventEndTime() {
  console.log("Loading database connection...");
  // Dynamic import to ensure env vars are loaded first
  const db = (await import("@/lib/db")).default;
  
  console.log("Checking for 'event_end_time' column in events table...");

  try {
    // Check if column exists
    await db.execute("SELECT event_end_time FROM events LIMIT 1");
    console.log("'event_end_time' column already exists.");
  } catch (error) {
    console.log("'event_end_time' column missing, adding it...");
    try {
      await db.execute("ALTER TABLE events ADD COLUMN event_end_time TEXT");
      console.log("Successfully added 'event_end_time' column.");
    } catch (alterError) {
      console.error("Failed to add 'event_end_time' column:", alterError);
    }
  }
}

migrateEventEndTime()
  .then(() => {
    console.log("Migration check completed.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
