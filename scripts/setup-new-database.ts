/**
 * HMINF - New Database Setup Script
 * 
 * This script creates all tables and indexes on a NEW Turso database.
 * It does NOT copy any data - only the structure.
 * 
 * Usage:
 *   1. Update .env.local with your NEW Turso database URL and token
 *   2. Run: npx tsx scripts/setup-new-database.ts
 */

import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([^#][^=]*)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  });
  console.log("✅ Loaded environment from .env.local\n");
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env.local");
  process.exit(1);
}

console.log(`🔗 Connecting to: ${url}\n`);

const db = createClient({ url, authToken });

// ============================================================
// All CREATE TABLE statements
// ============================================================
const tables: { name: string; sql: string }[] = [
  {
    name: "users",
    sql: `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      bio TEXT,
      photo_url TEXT,
      photo_public_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: "hima_periods",
    sql: `CREATE TABLE IF NOT EXISTS hima_periods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      is_active INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: "hima_inti",
    sql: `CREATE TABLE IF NOT EXISTS hima_inti (
      id TEXT PRIMARY KEY,
      period_id TEXT NOT NULL,
      position TEXT NOT NULL,
      name TEXT NOT NULL,
      photo_url TEXT,
      instagram TEXT,
      whatsapp TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: "divisions",
    sql: `CREATE TABLE IF NOT EXISTS divisions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT NOT NULL DEFAULT '#3B82F6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: "division_members",
    sql: `CREATE TABLE IF NOT EXISTS division_members (
      id TEXT PRIMARY KEY,
      division_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      position TEXT NOT NULL DEFAULT 'Anggota',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      photo_url TEXT DEFAULT NULL,
      instagram TEXT DEFAULT NULL,
      whatsapp TEXT DEFAULT NULL
    )`,
  },
  {
    name: "news_categories",
    sql: `CREATE TABLE IF NOT EXISTS news_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: "news",
    sql: `CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      thumbnail_url TEXT,
      thumbnail_public_id TEXT,
      excerpt TEXT,
      content TEXT,
      category_id TEXT,
      view_count INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 0,
      meta_title TEXT,
      meta_description TEXT,
      meta_keywords TEXT,
      published_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      author_name TEXT
    )`,
  },
  {
    name: "news_comments",
    sql: `CREATE TABLE IF NOT EXISTS news_comments (
      id TEXT PRIMARY KEY,
      news_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      comment TEXT NOT NULL,
      is_approved INTEGER DEFAULT 0,
      ip_address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: "events",
    sql: `CREATE TABLE IF NOT EXISTS events (
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
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      view_count INTEGER DEFAULT 0,
      event_end_time TEXT,
      slug TEXT
    )`,
  },
  {
    name: "pengumuman",
    sql: `CREATE TABLE IF NOT EXISTS pengumuman (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      thumbnail_url TEXT,
      thumbnail_public_id TEXT,
      content TEXT,
      author TEXT NOT NULL,
      is_published INTEGER DEFAULT 0,
      published_at TEXT,
      view_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: "document_categories",
    sql: `CREATE TABLE IF NOT EXISTS document_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#3B82F6',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: "documents",
    sql: `CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category_id TEXT,
      file_url TEXT NOT NULL,
      file_public_id TEXT NOT NULL,
      file_size INTEGER,
      file_type TEXT,
      original_filename TEXT,
      download_count INTEGER DEFAULT 0,
      published_at TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      owner_type TEXT DEFAULT 'hima',
      division_id TEXT
    )`,
  },
  {
    name: "program_kerja",
    sql: `CREATE TABLE IF NOT EXISTS program_kerja (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      owner_type TEXT NOT NULL,
      division_id TEXT,
      period_id TEXT NOT NULL,
      document_id TEXT,
      status TEXT DEFAULT 'direncanakan',
      priority TEXT DEFAULT 'sedang',
      start_date TEXT,
      end_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      location TEXT
    )`,
  },
  {
    name: "galleries",
    sql: `CREATE TABLE IF NOT EXISTS galleries (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      event_id TEXT,
      program_kerja_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: "gallery_images",
    sql: `CREATE TABLE IF NOT EXISTS gallery_images (
      id TEXT PRIMARY KEY,
      gallery_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      public_id TEXT NOT NULL,
      caption TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: "sejarah",
    sql: `CREATE TABLE IF NOT EXISTS sejarah (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'Sejarah',
      content TEXT,
      image_url TEXT,
      image_public_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: "visi_misi",
    sql: `CREATE TABLE IF NOT EXISTS visi_misi (
      id TEXT PRIMARY KEY,
      visi TEXT,
      misi TEXT,
      image_url TEXT,
      image_public_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: "site_settings",
    sql: `CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: "popup_settings",
    sql: `CREATE TABLE IF NOT EXISTS popup_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      is_active INTEGER DEFAULT 0,
      image_url TEXT,
      title TEXT,
      description TEXT,
      btn_text TEXT,
      btn_link TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: "sponsorship_settings",
    sql: `CREATE TABLE IF NOT EXISTS sponsorship_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      title TEXT NOT NULL DEFAULT 'Sponsorship',
      subtitle TEXT,
      show_section BOOLEAN DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: "sponsorship_logos",
    sql: `CREATE TABLE IF NOT EXISTS sponsorship_logos (
      id TEXT PRIMARY KEY,
      image_url TEXT NOT NULL,
      public_id TEXT NOT NULL,
      caption TEXT,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  },
];

// ============================================================
// All CREATE INDEX statements
// ============================================================
const indexes: { name: string; sql: string }[] = [
  {
    name: "idx_hima_periods_is_active",
    sql: "CREATE INDEX IF NOT EXISTS idx_hima_periods_is_active ON hima_periods(is_active)",
  },
  {
    name: "idx_hima_inti_period_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_hima_inti_period_id ON hima_inti(period_id)",
  },
  {
    name: "idx_division_members_division_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_division_members_division_id ON division_members(division_id)",
  },
  {
    name: "idx_division_members_member_name",
    sql: "CREATE INDEX IF NOT EXISTS idx_division_members_member_name ON division_members(member_name)",
  },
  {
    name: "idx_events_slug",
    sql: "CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON events(slug)",
  },
  {
    name: "idx_program_kerja_division_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_program_kerja_division_id ON program_kerja(division_id)",
  },
  {
    name: "idx_program_kerja_owner_type",
    sql: "CREATE INDEX IF NOT EXISTS idx_program_kerja_owner_type ON program_kerja(owner_type)",
  },
  {
    name: "idx_program_kerja_period_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_program_kerja_period_id ON program_kerja(period_id)",
  },
  {
    name: "idx_program_kerja_status",
    sql: "CREATE INDEX IF NOT EXISTS idx_program_kerja_status ON program_kerja(status)",
  },
  {
    name: "idx_galleries_event_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_galleries_event_id ON galleries(event_id)",
  },
  {
    name: "idx_galleries_program_kerja_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_galleries_program_kerja_id ON galleries(program_kerja_id)",
  },
  {
    name: "idx_gallery_images_gallery_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_gallery_images_gallery_id ON gallery_images(gallery_id)",
  },
];

async function setupDatabase() {
  console.log("🚀 Starting database setup...\n");

  let successTables = 0;
  let failedTables = 0;
  let successIndexes = 0;
  let failedIndexes = 0;

  // Create tables
  console.log("📋 Creating tables...");
  console.log("─".repeat(50));

  for (const table of tables) {
    try {
      await db.execute(table.sql);
      console.log(`  ✅ ${table.name}`);
      successTables++;
    } catch (error) {
      console.error(`  ❌ ${table.name}: ${error}`);
      failedTables++;
    }
  }

  console.log("");

  // Create indexes
  console.log("🔍 Creating indexes...");
  console.log("─".repeat(50));

  for (const index of indexes) {
    try {
      await db.execute(index.sql);
      console.log(`  ✅ ${index.name}`);
      successIndexes++;
    } catch (error) {
      console.error(`  ❌ ${index.name}: ${error}`);
      failedIndexes++;
    }
  }

  console.log("");

  // Verification
  console.log("🔍 Verifying...");
  console.log("─".repeat(50));

  const result = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  const createdTables = result.rows.map((r) => r.name as string);

  const expectedTables = tables.map((t) => t.name).sort();
  const missing = expectedTables.filter((t) => !createdTables.includes(t));

  if (missing.length === 0) {
    console.log(`  ✅ All ${expectedTables.length} tables verified!`);
  } else {
    console.log(`  ⚠️  Missing tables: ${missing.join(", ")}`);
  }

  // Summary
  console.log("\n" + "═".repeat(50));
  console.log("📊 SUMMARY");
  console.log("═".repeat(50));
  console.log(`  Tables:  ${successTables} created, ${failedTables} failed (of ${tables.length})`);
  console.log(`  Indexes: ${successIndexes} created, ${failedIndexes} failed (of ${indexes.length})`);

  if (failedTables === 0 && failedIndexes === 0) {
    console.log("\n🎉 Database setup completed successfully!");
    console.log("\n📌 Next steps:");
    console.log("   1. Run the seed-admin script to create admin user:");
    console.log("      npx tsx scripts/seed-admin.ts");
    console.log("   2. Start the application:");
    console.log("      npm run dev");
  } else {
    console.log("\n⚠️  Some items failed. Check errors above.");
  }
}

setupDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  });
