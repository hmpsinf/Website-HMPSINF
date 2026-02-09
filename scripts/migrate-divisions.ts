// Migration to create divisions tables
// This will be called from API route

import { createClient } from "@libsql/client";

export async function migrateDivisions() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN || "",
  });

  console.log("Creating divisions table...");

  // Create divisions table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS divisions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      color TEXT NOT NULL DEFAULT '#3B82F6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✓ divisions table created");

  console.log("Creating division_members table...");

  // Create division_members table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS division_members (
      id TEXT PRIMARY KEY,
      division_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      position TEXT NOT NULL DEFAULT 'Anggota',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE CASCADE
    )
  `);

  console.log("✓ division_members table created");

  // Create index for better query performance
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_division_members_division_id 
    ON division_members(division_id)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_division_members_member_name 
    ON division_members(member_name)
  `);

  console.log("✓ Indexes created");
  console.log("\n✅ Migration completed successfully!");
}
