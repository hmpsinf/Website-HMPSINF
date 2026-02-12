import { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/queries/public';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hminfunuha.web.id';
  
  // Static routes
  const routes = [
    '',
    '/profil/sejarah',
    '/profil/visi-misi',
    '/profil/struktur-organisasi',
    '/logo',
    '/berita',
    '/galeri',
    '/kontak',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
