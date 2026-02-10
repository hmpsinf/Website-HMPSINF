import db from "@/lib/db";

// ── Berita Terbaru ──
export async function getLatestNews(limit = 4) {
  const result = await db.execute({
    sql: `
      SELECT 
        n.id, n.title, n.slug, n.excerpt, n.thumbnail_url,
        n.published_at, n.created_at,
        c.name as category_name, c.slug as category_slug
      FROM news n
      LEFT JOIN news_categories c ON n.category_id = c.id
      WHERE n.is_published = 1
      ORDER BY n.published_at DESC
      LIMIT ?
    `,
    args: [limit],
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    excerpt: row.excerpt as string | null,
    thumbnail_url: row.thumbnail_url as string | null,
    published_at: row.published_at as string | null,
    created_at: row.created_at as string,
    category_name: row.category_name as string | null,
    category_slug: row.category_slug as string | null,
  }));
}

// ── Event Mendatang ──
export async function getUpcomingEvents(limit = 3) {
  const result = await db.execute({
    sql: `
      SELECT 
        id, title, thumbnail_url, event_date, event_end_date,
        event_time, location, description, link_url, link_text, is_open
      FROM events
      WHERE is_open = 1
      ORDER BY event_date ASC
      LIMIT ?
    `,
    args: [limit],
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    thumbnail_url: row.thumbnail_url as string | null,
    event_date: row.event_date as string,
    event_end_date: row.event_end_date as string | null,
    event_time: row.event_time as string | null,
    location: row.location as string,
    description: row.description as string | null,
    link_url: row.link_url as string | null,
    link_text: row.link_text as string | null,
    is_open: (row.is_open as number) === 1,
  }));
}

// ── Visi Misi ──
export async function getVisiMisi() {
  const result = await db.execute({
    sql: "SELECT * FROM visi_misi ORDER BY created_at DESC LIMIT 1",
    args: [],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    visi: row.visi as string | null,
    misi: row.misi as string | null,
    image_url: row.image_url as string | null,
  };
}

// ── Site Settings (server-side for public pages) ──
export async function getSiteSettings() {
  const result = await db.execute({
    sql: "SELECT key, value FROM site_settings",
    args: [],
  });

  const settings: Record<string, string | null> = {};
  for (const row of result.rows) {
    settings[row.key as string] = row.value as string | null;
  }

  return {
    site_name: settings.site_name || "HMPSINF",
    site_slogan: settings.site_slogan || null,
    logo_url: settings.logo_url || null,
    logo_dark_url: settings.logo_dark_url || null,
    footer_text: settings.footer_text || null,
    contact_email: settings.contact_email || null,
    contact_phone: settings.contact_phone || null,
    address: settings.address || null,
    instagram_url: settings.instagram_url || null,
    tiktok_url: settings.tiktok_url || null,
    facebook_url: settings.facebook_url || null,
    youtube_url: settings.youtube_url || null,
    // Hero fields
    hero_title: settings.hero_title || "HIMPUNAN MAHASISWA PROGRAM STUDI INFORMATIKA UNIVERSITAS NURUL HUDA",
    hero_subtitle: settings.hero_subtitle || "Wadah aspirasi, kreativitas, dan pengembangan potensi mahasiswa Program Studi Informatika menuju profesional yang berkualitas.",
    hero_btn1_text: settings.hero_btn1_text || "Pelajari Lebih Lanjut",
    hero_btn1_link: settings.hero_btn1_link || "/profil",
    hero_btn2_text: settings.hero_btn2_text || "Baca Berita",
    hero_btn2_link: settings.hero_btn2_link || "/berita",
    hero_bg_image: settings.hero_bg_image || null,
    hero_bg_size: settings.hero_bg_size || "cover",
    hero_side_image: settings.hero_side_image || null,
  };
}
