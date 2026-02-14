// Migration untuk tabel HIMA Inti (Kepengurusan Inti)
// Dipanggil dari API route atau langsung via CLI

import { createClient } from "@libsql/client";

export async function migrateHimaInti() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN || "",
  });

  console.log("Membuat tabel hima_periods...");

  // Tabel periode kepengurusan
  await db.execute(`
    CREATE TABLE IF NOT EXISTS hima_periods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      is_active INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✓ Tabel hima_periods berhasil dibuat");

  console.log("Membuat tabel hima_inti...");

  // Tabel anggota inti HIMA
  await db.execute(`
    CREATE TABLE IF NOT EXISTS hima_inti (
      id TEXT PRIMARY KEY,
      period_id TEXT NOT NULL,
      position TEXT NOT NULL,
      name TEXT NOT NULL,
      photo_url TEXT,
      instagram TEXT,
      whatsapp TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (period_id) REFERENCES hima_periods(id) ON DELETE CASCADE,
      UNIQUE (period_id, position)
    )
  `);

  console.log("✓ Tabel hima_inti berhasil dibuat");

  // Index untuk performa query
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_hima_inti_period_id 
    ON hima_inti(period_id)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_hima_periods_is_active 
    ON hima_periods(is_active)
  `);

  console.log("✓ Index berhasil dibuat");
  console.log("\n✅ Migrasi HIMA Inti selesai!");
}

// Run migration only when executed directly via CLI
if (process.argv[1]?.includes("migrate-hima-inti")) {
  import("dotenv")
    .then(({ config }) => {
      config({ path: ".env.local" });
      return migrateHimaInti();
    })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
