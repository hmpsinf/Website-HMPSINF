import { MetadataRoute } from 'next';
import db from '@/lib/db';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hmpsinf.web.id';
  const now = new Date();

  const staticRoutes = [
    '',
    '/profil/divisi',
    '/profil/sejarah',
    '/profil/visi-misi',
    '/profil/struktur-organisasi',
    '/logo',
    '/berita',
    '/pengumuman',
    '/event',
    '/galeri',
    '/program-kerja',
    '/unduhan',
    '/kontak',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  let newsRoutes: MetadataRoute.Sitemap = [];
  let announcementRoutes: MetadataRoute.Sitemap = [];
  let eventRoutes: MetadataRoute.Sitemap = [];
  let galleryRoutes: MetadataRoute.Sitemap = [];

  try {
    const news = await db.execute({
      sql: `
        SELECT slug, COALESCE(updated_at, published_at, created_at) as last_modified
        FROM news
        WHERE is_published = 1 AND slug IS NOT NULL AND slug != ''
      `,
      args: [],
    });

    newsRoutes = news.rows.map((row) => ({
      url: `${baseUrl}/berita/${row.slug as string}`,
      lastModified: row.last_modified ? new Date(row.last_modified as string) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {}

  try {
    const announcements = await db.execute({
      sql: `
        SELECT slug, COALESCE(updated_at, published_at, created_at) as last_modified
        FROM pengumuman
        WHERE is_published = 1 AND slug IS NOT NULL AND slug != ''
      `,
      args: [],
    });

    announcementRoutes = announcements.rows.map((row) => ({
      url: `${baseUrl}/pengumuman/${row.slug as string}`,
      lastModified: row.last_modified ? new Date(row.last_modified as string) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {}

  try {
    const events = await db.execute({
      sql: `
        SELECT slug, COALESCE(updated_at, created_at, event_date) as last_modified
        FROM events
        WHERE slug IS NOT NULL AND slug != ''
      `,
      args: [],
    });

    eventRoutes = events.rows.map((row) => ({
      url: `${baseUrl}/event/${row.slug as string}`,
      lastModified: row.last_modified ? new Date(row.last_modified as string) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {}

  try {
    const galleries = await db.execute({
      sql: `
        SELECT id, COALESCE(updated_at, created_at) as last_modified
        FROM galleries
      `,
      args: [],
    });

    galleryRoutes = galleries.rows.map((row) => ({
      url: `${baseUrl}/galeri/${row.id as string}`,
      lastModified: row.last_modified ? new Date(row.last_modified as string) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {}

  return [
    ...staticRoutes,
    ...newsRoutes,
    ...announcementRoutes,
    ...eventRoutes,
    ...galleryRoutes,
  ];
}
