// Migration script to add photo_url column to division_members table
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import db from "../src/lib/db";

async function migrateDivisionPhoto() {
  console.log("Adding photo_url column to division_members table...");

  try {
    // Add photo_url column
    await db.execute(`
      ALTER TABLE division_members ADD COLUMN photo_url TEXT DEFAULT NULL
    `);
    console.log("✓ photo_url column added");
  } catch (error) {
    // Column might already exist
    const err = error as { message?: string };
    if (err.message?.includes("duplicate column")) {
      console.log("✓ photo_url column already exists");
    } else {
      console.error("Error adding photo_url column:", error);
    }
  }

  console.log("\n✅ Migration completed successfully!");
}

migrateDivisionPhoto().catch(console.error);
