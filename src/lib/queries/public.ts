import db from "@/lib/db";

// ── Berita Terbaru ──
// ── Berita Terbaru ──
export async function getLatestNews(limit = 4) {
  const result = await db.execute({
    sql: `
      SELECT 
        n.id, n.title, n.slug, n.excerpt, n.thumbnail_url,
        n.published_at, n.created_at, n.view_count, n.author_name,
        (SELECT COUNT(*) FROM news_comments WHERE news_id = n.id AND is_approved = 1) as comment_count,
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
    view_count: Number(row.view_count || 0),
    comment_count: Number(row.comment_count || 0),
    author_name: row.author_name as string | null,
    category_name: row.category_name as string | null,
    category_slug: row.category_slug as string | null,
  }));
}

// ── Semua Berita (Pagination) ──
export async function getAllNews(page = 1, limit = 12, search = "", category = "") {
  const offset = (page - 1) * limit;
  let whereClause = "n.is_published = 1";
  const args: (string | number)[] = [];

  if (search) {
    whereClause += " AND (n.title LIKE ? OR n.excerpt LIKE ?)";
    args.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    whereClause += " AND c.slug = ?";
    args.push(category);
  }

  // Get total
  const countResult = await db.execute({
    sql: `
      SELECT COUNT(*) as total 
      FROM news n 
      LEFT JOIN news_categories c ON n.category_id = c.id
      WHERE ${whereClause}
    `,
    args,
  });
  const total = Number(countResult.rows[0]?.total || 0);

  // Get data
  const result = await db.execute({
    sql: `
      SELECT 
        n.id, n.title, n.slug, n.excerpt, n.thumbnail_url,
        n.published_at, n.created_at, n.view_count, n.author_name,
        (SELECT COUNT(*) FROM news_comments WHERE news_id = n.id AND is_approved = 1) as comment_count,
        c.name as category_name, c.slug as category_slug
      FROM news n
      LEFT JOIN news_categories c ON n.category_id = c.id
      WHERE ${whereClause}
      ORDER BY n.published_at DESC
      LIMIT ? OFFSET ?
    `,
    args: [...args, limit, offset],
  });

  const news = result.rows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    excerpt: row.excerpt as string | null,
    thumbnail_url: row.thumbnail_url as string | null,
    published_at: row.published_at as string | null,
    created_at: row.created_at as string,
    view_count: Number(row.view_count || 0),
    comment_count: Number(row.comment_count || 0),
    author_name: row.author_name as string | null,
    category_name: row.category_name as string | null,
    category_slug: row.category_slug as string | null,
  }));

  return {
    data: news,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ── Single News by Slug ──
export async function getNewsBySlug(slug: string) {
  const result = await db.execute({
    sql: `
      SELECT 
        n.id, n.title, n.slug, n.excerpt, n.content, n.thumbnail_url,
        n.published_at, n.created_at, n.updated_at, n.view_count, n.author_name,
        n.meta_title, n.meta_description, n.meta_keywords,
        n.category_id,
        (SELECT COUNT(*) FROM news_comments WHERE news_id = n.id AND is_approved = 1) as comment_count,
        c.name as category_name, c.slug as category_slug
      FROM news n
      LEFT JOIN news_categories c ON n.category_id = c.id
      WHERE n.slug = ? AND n.is_published = 1
      LIMIT 1
    `,
    args: [slug],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    excerpt: row.excerpt as string | null,
    content: row.content as string | null,
    thumbnail_url: row.thumbnail_url as string | null,
    published_at: row.published_at as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string | null,
    view_count: Number(row.view_count || 0),
    comment_count: Number(row.comment_count || 0),
    author_name: row.author_name as string | null,
    category_id: row.category_id as string | null,
    category_name: row.category_name as string | null,
    category_slug: row.category_slug as string | null,
    meta_title: row.meta_title as string | null,
    meta_description: row.meta_description as string | null,
    meta_keywords: row.meta_keywords as string | null,
  };
}

// ── Related News (same category) ──
export async function getRelatedNews(newsId: string, categoryId: string | null, limit = 3) {
  if (!categoryId) return [];

  const result = await db.execute({
    sql: `
      SELECT 
        n.id, n.title, n.slug, n.thumbnail_url,
        n.published_at, n.view_count, n.author_name,
        c.name as category_name
      FROM news n
      LEFT JOIN news_categories c ON n.category_id = c.id
      WHERE n.category_id = ? AND n.id != ? AND n.is_published = 1
      ORDER BY n.published_at DESC
      LIMIT ?
    `,
    args: [categoryId, newsId, limit],
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    thumbnail_url: row.thumbnail_url as string | null,
    published_at: row.published_at as string | null,
    view_count: Number(row.view_count || 0),
    author_name: row.author_name as string | null,
    category_name: row.category_name as string | null,
  }));
}

// ── Approved Comments for a News Article ──
export async function getNewsComments(newsId: string) {
  const result = await db.execute({
    sql: `
      SELECT id, name, email, comment, created_at
      FROM news_comments
      WHERE news_id = ? AND is_approved = 1
      ORDER BY created_at DESC
    `,
    args: [newsId],
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    email: row.email as string | null,
    comment: row.comment as string,
    created_at: row.created_at as string,
  }));
}

// ── Event Mendatang ──
export async function getUpcomingEvents(limit = 3) {
  const result = await db.execute({
    sql: `
      SELECT 
        id, title, thumbnail_url, event_date, event_end_date,
        event_time, event_end_time, location, description, link_url, link_text, is_open
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
    event_end_time: row.event_end_time as string | null,
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
    sql: "SELECT visi, misi FROM visi_misi ORDER BY created_at DESC LIMIT 1",
    args: [],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    visi: row.visi as string | null,
    misi: row.misi as string | null,
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
    // Sambutan fields
    sambutan_section_title: settings.sambutan_section_title || "Sambutan Ketua Himpunan",
    sambutan_section_subtitle: settings.sambutan_section_subtitle || "Pesan dari Ketua Himpunan Periode Ini",
    sambutan_content: settings.sambutan_content || "Selamat datang di website resmi HMPSINF...",
    hima_inti_pattern_color: settings.hima_inti_pattern_color || null,
    // Video Section fields
    landing_video_title: settings.landing_video_title || "Video Profil Himpunan",
    landing_video_subtitle: settings.landing_video_subtitle || "Dokumentasi Kegiatan dan Profil HMPSINF",
    landing_video_url: settings.landing_video_url || "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder default
    landing_video_description: settings.landing_video_description || "Saksikan keseruan dan semangat kebersamaan dalam setiap kegiatan yang kami selenggarakan.",
    landing_video_bg_image: settings.landing_video_bg_image || null,
    landing_video_bg_attachment: settings.landing_video_bg_attachment || "fixed",
    landing_video_overlay_opacity: settings.landing_video_overlay_opacity || "80", // number as string
    landing_video_pattern_opacity: settings.landing_video_pattern_opacity || "10",
    landing_video_footer_text: settings.landing_video_footer_text || "HMPSINF 2024",
    // CTA Section
    landing_cta_title: settings.landing_cta_title || "Siap Berinovasi Bersama Kami?",
    landing_cta_subtitle: settings.landing_cta_subtitle || "Mari bergabung dan wujudkan masa depan teknologi bersama HMPSINF.",
    landing_cta_btn_text: settings.landing_cta_btn_text || "Hubungi Kami",
    landing_cta_btn_link: settings.landing_cta_btn_link || "/contact",
  };
}

// ── Ketua Himpunan ──
export async function getKetuaHimpunan() {
  const result = await db.execute({
    sql: `
      SELECT i.name, i.photo_url, i.position, i.instagram, i.whatsapp
      FROM hima_inti i
      JOIN hima_periods p ON i.period_id = p.id
      WHERE p.is_active = 1 AND (i.position = 'Ketua Himpunan' OR i.position LIKE 'Ketua%')
      LIMIT 1
    `,
    args: [],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    name: row.name as string,
    photo_url: row.photo_url as string | null,
    position: row.position as string,
    instagram: row.instagram as string | null,
    whatsapp: row.whatsapp as string | null,
  };
}

// ── Divisions ──
export async function getDivisions() {
  const result = await db.execute({
    sql: `
      SELECT 
        d.id, 
        d.name, 
        d.description, 
        d.color, 
        COUNT(dm.id) as member_count,
        (SELECT member_name FROM division_members WHERE division_id = d.id AND position = 'Dosen Pendamping' LIMIT 1) as dosen_pendamping_name
      FROM divisions d
      LEFT JOIN division_members dm ON d.id = dm.division_id
      GROUP BY d.id
      ORDER BY d.name ASC
    `,
    args: [],
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | null,
    color: row.color as string,
    member_count: row.member_count as number,
    dosen_pendamping_name: row.dosen_pendamping_name as string | null,
  }));
}


// ── Sejarah ──
export async function getSejarah() {
  const result = await db.execute({
    sql: `SELECT title, content FROM sejarah ORDER BY created_at DESC LIMIT 1`,
    args: [],
  });
  
  if (result.rows.length === 0) return undefined;

  const row = result.rows[0];
  return {
    title: row.title as string,
    content: row.content as string | null,
  };
}

// ── Struktur Organisasi ──
export async function getStrukturOrganisasi() {
  // Get active period name
  const periodResult = await db.execute({
    sql: `SELECT id, name FROM hima_periods WHERE is_active = 1 LIMIT 1`,
    args: [],
  });

  const activePeriod = periodResult.rows.length > 0
    ? { id: periodResult.rows[0].id as string, name: periodResult.rows[0].name as string }
    : null;

  if (!activePeriod) return { period: null, members: [] };

  // Get all HIMA Inti members for active period, ordered by position hierarchy
  const membersResult = await db.execute({
    sql: `
      SELECT i.id, i.position, i.name, i.photo_url, i.instagram, i.whatsapp
      FROM hima_inti i
      JOIN hima_periods p ON i.period_id = p.id
      WHERE p.is_active = 1
      ORDER BY 
        CASE i.position
          WHEN 'dosen_pembimbing' THEN 1
          WHEN 'ketua' THEN 2
          WHEN 'wakil_ketua' THEN 3
          WHEN 'sekretaris' THEN 4
          WHEN 'bendahara' THEN 5
          ELSE 6
        END,
        i.created_at ASC
    `,
    args: [],
  });

  const members = membersResult.rows.map((row) => ({
    id: row.id as string,
    position: row.position as string,
    name: row.name as string,
    photo_url: row.photo_url as string | null,
    instagram: row.instagram as string | null,
    whatsapp: row.whatsapp as string | null,
  }));

  return { period: activePeriod, members };
}

export async function getDivisionLeaders() {
  // Get all divisions with only their ketua (leaders), not all members
  const result = await db.execute({
    sql: `
      SELECT 
        d.id as division_id,
        d.name as division_name,
        d.description as division_description,
        d.color as division_color,
        dm.id as member_id,
        dm.member_name,
        dm.position,
        dm.photo_url,
        dm.instagram,
        dm.whatsapp
      FROM divisions d
      LEFT JOIN division_members dm ON d.id = dm.division_id 
        AND (dm.position = 'Dosen Pendamping' OR dm.position LIKE 'Ketua%')
      ORDER BY d.name ASC,
        CASE WHEN dm.position = 'Dosen Pendamping' THEN 0 ELSE 1 END,
        dm.position ASC, dm.created_at ASC
    `,
    args: [],
  });

  // Group by division
  const divisionsMap = new Map<string, {
    id: string;
    name: string;
    description: string | null;
    color: string;
    leaders: {
      id: string;
      member_name: string;
      position: string;
      photo_url: string | null;
      instagram: string | null;
      whatsapp: string | null;
    }[];
  }>();

  for (const row of result.rows) {
    const divId = row.division_id as string;
    if (!divisionsMap.has(divId)) {
      divisionsMap.set(divId, {
        id: divId,
        name: row.division_name as string,
        description: row.division_description as string | null,
        color: row.division_color as string,
        leaders: [],
      });
    }

    // Only add if there's a matching member (LEFT JOIN may return nulls)
    if (row.member_id) {
      divisionsMap.get(divId)!.leaders.push({
        id: row.member_id as string,
        member_name: row.member_name as string,
        position: row.position as string,
        photo_url: row.photo_url as string | null,
        instagram: row.instagram as string | null,
        whatsapp: row.whatsapp as string | null,
      });
    }
  }

  return Array.from(divisionsMap.values());
}

// ── Kategori Berita ──
export async function getNewsCategories() {
  const result = await db.execute({
    sql: `
      SELECT id, name, slug, description 
      FROM news_categories 
      ORDER BY name ASC
    `,
    args: [],
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: row.description as string | null,
  }));
}


// ── All Events (Pagination) ──
// ── All Events (Pagination & Filter) ──
export async function getEvents(page = 1, limit = 12, search = "", filter = "") {
  const offset = (page - 1) * limit;
  let whereClause = "1=1"; // Default always true
  const args: (string | number)[] = [];

  if (search) {
    whereClause += " AND (title LIKE ? OR description LIKE ? OR location LIKE ?)";
    args.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  // Filter Logic
  const now = new Date().toISOString();
  if (filter === "upcoming") {
    whereClause += " AND event_date >= ?";
    args.push(now);
  } else if (filter === "open") {
    whereClause += " AND is_open = 1 AND event_date >= ?";
    args.push(now);
  } else if (filter === "closed") {
    // Closed usually means registration closed OR event passed. 
    // Let's assume 'Selesai' means event passed OR manually closed.
    whereClause += " AND (is_open = 0 OR event_date < ?)";
    args.push(now);
  }

  // Get total
  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as total FROM events WHERE ${whereClause}`,
    args,
  });
  const total = Number(countResult.rows[0]?.total || 0);

  // Get data
  const result = await db.execute({
    sql: `
      SELECT 
        id, title, slug, thumbnail_url, event_date, event_end_date,
        event_time, event_end_time, location, description, link_url, link_text, is_open, view_count
      FROM events
      WHERE ${whereClause}
      ORDER BY event_date DESC
      LIMIT ? OFFSET ?
    `,
    args: [...args, limit, offset],
  });

  const events = result.rows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    thumbnail_url: row.thumbnail_url as string,
    event_date: row.event_date as string,
    event_end_date: row.event_end_date as string,
    event_time: row.event_time as string,
    event_end_time: row.event_end_time as string,
    location: row.location as string,
    description: row.description as string,
    link_url: row.link_url as string,
    link_text: row.link_text as string,
    is_open: Boolean(row.is_open),
    view_count: Number(row.view_count || 0),
  }));

  return {
    data: events,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getEventBySlug(slug: string) {
  const result = await db.execute({
    sql: `
      SELECT 
        id, title, slug, thumbnail_url, event_date, event_end_date,
        event_time, event_end_time, location, description, link_url, link_text, is_open, view_count, timeline, kontak,
        created_at, updated_at
      FROM events
      WHERE slug = ?
    `,
    args: [slug],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    thumbnail_url: row.thumbnail_url as string,
    event_date: row.event_date as string,
    event_end_date: row.event_end_date as string,
    event_time: row.event_time as string,
    event_end_time: row.event_end_time as string,
    location: row.location as string,
    description: row.description as string,
    timeline: row.timeline as string,
    kontak: row.kontak as string,
    link_url: row.link_url as string,
    link_text: row.link_text as string,
    is_open: Boolean(row.is_open),
    view_count: Number(row.view_count || 0),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

// ── Program Kerja ──
export async function getProgramKerja() {
  const result = await db.execute({
    sql: `
      SELECT 
        pk.id, pk.title, pk.description, pk.status, pk.priority,
        pk.start_date, pk.end_date, pk.owner_type, pk.division_id,
        d.name as division_name, d.color as division_color,
        doc.file_url as document_url, doc.name as document_name,
        pk.location
      FROM program_kerja pk
      LEFT JOIN divisions d ON pk.division_id = d.id
      LEFT JOIN documents doc ON pk.document_id = doc.id
      WHERE pk.status != 'dibatalkan'
      ORDER BY 
        CASE pk.priority 
          WHEN 'tinggi' THEN 1 
          WHEN 'sedang' THEN 2 
          WHEN 'rendah' THEN 3 
          ELSE 4 
        END,
        pk.status DESC, -- 'berjalan' first usually, but string sort might not be perfect. Let's rely on priority first.
        pk.created_at DESC
    `,
    args: [],
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | null,
    status: row.status as string,
    priority: row.priority as string,
    start_date: row.start_date as string | null,
    end_date: row.end_date as string | null,
    owner_type: row.owner_type as string,
    division_id: row.division_id as string | null,
    division_name: row.division_name as string | null,
    division_color: row.division_color as string | null,
    document_url: row.document_url as string | null,
    document_name: row.document_name as string | null,
    location: row.location as string | null,
  }));
}

// ── Dokumen Program Kerja (General) ──
export async function getProgramKerjaDocuments() {
  // Category ID for "Program Kerja" from document_categories table
  const PROGRAM_KERJA_CATEGORY_ID = 'afced389-9087-4c2d-9517-87d75757c342';

  const result = await db.execute({
    sql: `
      SELECT 
        id, name, file_url, file_type, file_size, created_at, owner_type, division_id
      FROM documents
      WHERE category_id = ?
      ORDER BY created_at DESC
    `,
    args: [PROGRAM_KERJA_CATEGORY_ID],
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    file_url: row.file_url as string,
    file_type: row.file_type as string | null,
    file_size: Number(row.file_size || 0),
    created_at: row.created_at as string,
    owner_type: row.owner_type as string,
    division_id: row.division_id as string | null,
  }));
}
