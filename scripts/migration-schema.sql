-- ============================================================
-- HMINF - Complete Database Schema Migration Script
-- Generated: 2026-02-14
-- Tables: 21 | Indexes: 12
-- NOTE: Structure only, NO data included
-- ============================================================

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
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
);

-- ============================================================
-- 2. HIMA_PERIODS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS hima_periods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_active INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hima_periods_is_active ON hima_periods(is_active);

-- ============================================================
-- 3. HIMA_INTI TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS hima_inti (
  id TEXT PRIMARY KEY,
  period_id TEXT NOT NULL,
  position TEXT NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  instagram TEXT,
  whatsapp TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hima_inti_period_id ON hima_inti(period_id);

-- ============================================================
-- 4. DIVISIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS divisions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. DIVISION_MEMBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS division_members (
  id TEXT PRIMARY KEY,
  division_id TEXT NOT NULL,
  member_name TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'Anggota',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  photo_url TEXT DEFAULT NULL,
  instagram TEXT DEFAULT NULL,
  whatsapp TEXT DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_division_members_division_id ON division_members(division_id);
CREATE INDEX IF NOT EXISTS idx_division_members_member_name ON division_members(member_name);

-- ============================================================
-- 6. NEWS_CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS news_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 7. NEWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS news (
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
);

-- ============================================================
-- 8. NEWS_COMMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS news_comments (
  id TEXT PRIMARY KEY,
  news_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  comment TEXT NOT NULL,
  is_approved INTEGER DEFAULT 0,
  ip_address TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 9. EVENTS TABLE
-- ============================================================
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
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  event_end_time TEXT,
  slug TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON events(slug);

-- ============================================================
-- 10. PENGUMUMAN TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS pengumuman (
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
);

-- ============================================================
-- 11. DOCUMENT_CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS document_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 12. DOCUMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
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
);

-- ============================================================
-- 13. PROGRAM_KERJA TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS program_kerja (
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
);

CREATE INDEX IF NOT EXISTS idx_program_kerja_division_id ON program_kerja(division_id);
CREATE INDEX IF NOT EXISTS idx_program_kerja_owner_type ON program_kerja(owner_type);
CREATE INDEX IF NOT EXISTS idx_program_kerja_period_id ON program_kerja(period_id);
CREATE INDEX IF NOT EXISTS idx_program_kerja_status ON program_kerja(status);

-- ============================================================
-- 14. GALLERIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS galleries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_id TEXT,
  program_kerja_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_galleries_event_id ON galleries(event_id);
CREATE INDEX IF NOT EXISTS idx_galleries_program_kerja_id ON galleries(program_kerja_id);

-- ============================================================
-- 15. GALLERY_IMAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_images (
  id TEXT PRIMARY KEY,
  gallery_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  public_id TEXT NOT NULL,
  caption TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gallery_images_gallery_id ON gallery_images(gallery_id);

-- ============================================================
-- 16. SEJARAH TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS sejarah (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Sejarah',
  content TEXT,
  image_url TEXT,
  image_public_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 17. VISI_MISI TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS visi_misi (
  id TEXT PRIMARY KEY,
  visi TEXT,
  misi TEXT,
  image_url TEXT,
  image_public_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 18. SITE_SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 19. POPUP_SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS popup_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  is_active INTEGER DEFAULT 0,
  image_url TEXT,
  title TEXT,
  description TEXT,
  btn_text TEXT,
  btn_link TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 20. SPONSORSHIP_SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS sponsorship_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  title TEXT NOT NULL DEFAULT 'Sponsorship',
  subtitle TEXT,
  show_section BOOLEAN DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 21. SPONSORSHIP_LOGOS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS sponsorship_logos (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  public_id TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- VERIFICATION: List all tables to confirm
-- ============================================================
-- Run this after migration to verify:
-- SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
