import db from "@/lib/db";

// ── All Galleries (With Filters) ──
export async function getGalleries(filter: 'all' | 'event' | 'proker' = 'all') {
  let whereClause = "1=1";
  const args: any[] = [];

  if (filter === 'event') {
    whereClause += " AND g.event_id IS NOT NULL";
  } else if (filter === 'proker') {
    whereClause += " AND g.program_kerja_id IS NOT NULL";
  }

  // Fetch galleries with their first image as thumbnail
  const result = await db.execute({
    sql: `
      SELECT 
        g.id, 
        g.title, 
        g.description, 
        g.event_id, 
        g.program_kerja_id,
        g.created_at,
        (SELECT image_url FROM gallery_images WHERE gallery_id = g.id ORDER BY created_at ASC LIMIT 1) as thumbnail_url,
        (SELECT COUNT(*) FROM gallery_images WHERE gallery_id = g.id) as image_count,
        e.title as event_title,
        e.event_date as event_date,
        pk.title as proker_title
      FROM galleries g
      LEFT JOIN events e ON g.event_id = e.id
      LEFT JOIN program_kerja pk ON g.program_kerja_id = pk.id
      WHERE ${whereClause}
      ORDER BY g.created_at DESC
    `,
    args,
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | null,
    thumbnail_url: row.thumbnail_url as string | null,
    image_count: Number(row.image_count || 0),
    created_at: row.created_at as string,
    event: row.event_id ? {
      id: row.event_id as string,
      title: row.event_title as string,
      date: row.event_date as string | null,
    } : null,
    program_kerja: row.program_kerja_id ? {
      id: row.program_kerja_id as string,
      title: row.proker_title as string,
    } : null,
    type: row.event_id ? 'event' : row.program_kerja_id ? 'proker' : 'general',
  }));
}

// ── Single Gallery Detail ──
export async function getGallery(id: string) {
  // Fetch gallery details
  const galleryResult = await db.execute({
    sql: `
      SELECT 
        g.id, 
        g.title, 
        g.description, 
        g.event_id, 
        g.program_kerja_id,
        g.created_at,
        e.title as event_title,
        e.event_date as event_date,
        pk.title as proker_title
      FROM galleries g
      LEFT JOIN events e ON g.event_id = e.id
      LEFT JOIN program_kerja pk ON g.program_kerja_id = pk.id
      WHERE g.id = ?
    `,
    args: [id],
  });

  if (galleryResult.rows.length === 0) return null;

  const row = galleryResult.rows[0];
  
  // Fetch all images for the gallery
  const imagesResult = await db.execute({
    sql: `
      SELECT id, image_url, public_id, caption, created_at
      FROM gallery_images
      WHERE gallery_id = ?
      ORDER BY created_at ASC
    `,
    args: [id],
  });

  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | null,
    created_at: row.created_at as string,
    event: row.event_id ? {
      id: row.event_id as string,
      title: row.event_title as string,
      date: row.event_date as string | null,
    } : null,
    program_kerja: row.program_kerja_id ? {
      id: row.program_kerja_id as string,
      title: row.proker_title as string,
    } : null,
    type: row.event_id ? 'event' : row.program_kerja_id ? 'proker' : 'general',
    images: imagesResult.rows.map(img => ({
      id: img.id as string,
      image_url: img.image_url as string,
      public_id: img.public_id as string,
      caption: img.caption as string | null,
    })),
  };
}
