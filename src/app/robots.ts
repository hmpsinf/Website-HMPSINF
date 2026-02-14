import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hmpsinf.web.id';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/login',
        '/dashboard',
        '/divisions',
        '/documents',
        '/documents/categories',
        '/news',
        '/news/categories',
        '/events',
        '/galleries',
        '/hima-inti',
        '/popup',
        '/profile',
        '/programs',
        '/sejarah',
        '/settings',
        '/site-settings',
        '/sponsorship',
        '/visi-misi',
        '/landing-page/',
      ],
    },
    host: baseUrl,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
