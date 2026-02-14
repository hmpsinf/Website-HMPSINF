import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    Calendar, User, Eye, Share2, Clock, ChevronRight
} from 'lucide-react';
import { getAnnouncementBySlug, getLatestAnnouncements } from '@/lib/queries/public';
import { formatDate } from '@/lib/utils';
import JsonLd from '@/components/seo/JsonLd';
import AnnouncementViewTracker from '@/components/public/pengumuman/AnnouncementViewTracker';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const announcement = await getAnnouncementBySlug(slug);
    if (!announcement) return { title: 'Pengumuman Tidak Ditemukan' };

    const title = announcement.title;
    const description = announcement.content.replace(/<[^>]+>/g, '').substring(0, 160);

    return {
        title: `${title} | Pengumuman HMPSINF`,
        description,
        openGraph: {
            title,
            description,
            type: 'article',
            publishedTime: announcement.published_at || undefined,
            modifiedTime: announcement.updated_at || undefined,
            authors: [announcement.author],
            images: announcement.thumbnail_url ? [{ url: announcement.thumbnail_url }] : undefined,
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/pengumuman/${slug}`,
        },
    };
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const announcement = await getAnnouncementBySlug(slug);

    if (!announcement) notFound();

    const latestAnnouncements = await getLatestAnnouncements(5);
    const relatedAnnouncements = latestAnnouncements.filter(a => a.id !== announcement.id).slice(0, 4);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: announcement.title,
        description: announcement.content.replace(/<[^>]+>/g, '').substring(0, 160),
        image: announcement.thumbnail_url ? [announcement.thumbnail_url] : [],
        datePublished: announcement.published_at,
        dateModified: announcement.updated_at,
        author: {
            '@type': 'Person',
            name: announcement.author,
        },
        publisher: {
            '@type': 'Organization',
            name: 'HMPSINF Universitas Nurul Huda',
            url: process.env.NEXT_PUBLIC_SITE_URL,
            logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/pengumuman/${announcement.slug}`,
        },
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: process.env.NEXT_PUBLIC_SITE_URL,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Pengumuman',
                item: `${process.env.NEXT_PUBLIC_SITE_URL}/pengumuman`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: announcement.title,
                item: `${process.env.NEXT_PUBLIC_SITE_URL}/pengumuman/${announcement.slug}`,
            },
        ],
    };

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950">
            <JsonLd data={jsonLd} />
            <JsonLd data={breadcrumbJsonLd} />
            <AnnouncementViewTracker announcementId={announcement.id} />

            {/* Background Gradient */}
            <div className="absolute top-0 inset-x-0 h-128 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-8 overflow-x-auto whitespace-nowrap pb-1">
                    <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                        Beranda
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    <Link href="/pengumuman" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                        Pengumuman
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px] sm:max-w-xs">
                        {announcement.title}
                    </span>
                </nav>

                <div className="max-w-4xl mx-auto">
                    {/* Main Content */}
                    <article className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-10 border border-gray-200 dark:border-gray-800">
                        {/* Header */}
                        <header className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-8">
                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                                <span className="flex items-center gap-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 px-3 py-1 rounded-full font-medium">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(announcement.published_at)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <User className="w-4 h-4" />
                                    {announcement.author}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Eye className="w-4 h-4" />
                                    {announcement.view_count || 0} views
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                                {announcement.title}
                            </h1>
                        </header>

                        {/* Thumbnail */}
                        {announcement.thumbnail_url && (
                            <div className="relative aspect-4/5 w-full max-w-md mx-auto rounded-2xl overflow-hidden mb-10 bg-gray-100 dark:bg-gray-800">
                                <Image
                                    src={announcement.thumbnail_url}
                                    alt={announcement.title}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-img:rounded-2xl prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white"
                            dangerouslySetInnerHTML={{ __html: announcement.content }}
                        />
                    </article>


                </div>
            </div>
        </main>
    );
}
