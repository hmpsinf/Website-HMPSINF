import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    CalendarDays, User, Eye, MessageCircle, Tag, Clock, ChevronRight,
} from 'lucide-react';
import { getNewsBySlug, getRelatedNews, getNewsComments } from '@/lib/queries/public';
import { formatSmartDate } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';
import JsonLd from '@/components/seo/JsonLd';
import ViewTracker from '@/components/news/ViewTracker';
import CommentSection from '@/components/news/CommentSection';
import TableOfContents from '@/components/news/TableOfContents';

interface PageProps {
    params: Promise<{ slug: string }>;
}

// ── Dynamic Metadata from DB SEO columns ──
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const news = await getNewsBySlug(slug);
    if (!news) return { title: 'Berita Tidak Ditemukan' };

    const title = news.meta_title || news.title;
    const description = news.meta_description || news.excerpt || '';
    const keywords = news.meta_keywords
        ? news.meta_keywords.split(',').map((k: string) => k.trim())
        : undefined;

    return {
        title: `${title}`,
        description,
        keywords,
        openGraph: {
            title,
            description,
            type: 'article',
            publishedTime: news.published_at || undefined,
            modifiedTime: news.updated_at || undefined,
            authors: news.author_name ? [news.author_name] : undefined,
            images: news.thumbnail_url ? [{ url: news.thumbnail_url }] : undefined,
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/berita/${slug}`,
        },
    };
}

export default async function NewsDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const news = await getNewsBySlug(slug);
    if (!news) notFound();

    const [relatedNews, comments, user] = await Promise.all([
        getRelatedNews(news.id, news.category_id),
        getNewsComments(news.id),
        getCurrentUser(),
    ]);
    const isAdmin = !!user;

    const publishedDate = news.published_at || news.created_at;
    const readingTime = Math.max(1, Math.ceil((news.content?.split(/\s+/).length || 0) / 200));

    // ── JSON-LD: NewsArticle ──
    const newsJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: news.meta_title || news.title,
        description: news.meta_description || news.excerpt || '',
        image: news.thumbnail_url ? [news.thumbnail_url] : [],
        datePublished: news.published_at || news.created_at,
        dateModified: news.updated_at || news.published_at || news.created_at,
        author: {
            '@type': 'Person',
            name: news.author_name || 'HMPSINF',
        },
        publisher: {
            '@type': 'Organization',
            name: 'HMPSINF Universitas Nurul Huda',
            url: process.env.NEXT_PUBLIC_SITE_URL,
            logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png` // Ensure this exists or fallback
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/berita/${news.slug}`,
        },
    };

    // ── JSON-LD: BreadcrumbList ──
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Beranda',
                item: process.env.NEXT_PUBLIC_SITE_URL,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Berita',
                item: `${process.env.NEXT_PUBLIC_SITE_URL}/berita`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: news.title,
                item: `${process.env.NEXT_PUBLIC_SITE_URL}/berita/${news.slug}`,
            },
        ],
    };

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950">
            <JsonLd data={newsJsonLd} />
            <JsonLd data={breadcrumbJsonLd} />
            <ViewTracker newsId={news.id} />

            {/* Background Gradient */}
            <div className="absolute top-0 inset-x-0 h-[32rem] bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
                {/* ── Breadcrumb ── */}
                <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-8">
                    <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                        Beranda
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link href="/berita" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                        Berita
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px] sm:max-w-xs">
                        {news.title}
                    </span>
                </nav>

                {/* ── Article Header (full width, not constrained) ── */}
                <header className="mb-8">
                    {/* Category */}
                    {news.category_name && (
                        <Link
                            href={`/berita?category=${news.category_slug}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 px-3.5 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-400 mb-5 transition-colors hover:bg-brand-100 dark:hover:bg-brand-500/20"
                        >
                            <Tag className="w-3 h-3" />
                            {news.category_name}
                        </Link>
                    )}

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white font-outfit leading-[1.15] tracking-tight mb-6">
                        {news.title}
                    </h1>

                    {/* Meta Row */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                        {news.author_name && (
                            <div className="flex items-center gap-1.5">
                                <User className="w-4 h-4" />
                                <span className="font-medium  dark:text-white">{news.author_name}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-4 h-4" />
                            <time dateTime={publishedDate}>{formatSmartDate(publishedDate)}</time>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{readingTime} min baca</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4" />
                            <span>{news.view_count.toLocaleString('id-ID')}</span>
                        </div>
                        <a href="#komentar" className="flex items-center gap-1.5 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span>{news.comment_count}</span>
                        </a>
                    </div>
                </header>

                {/* ── Featured Image (full width) ── */}
                {news.thumbnail_url && (
                    <div className="relative aspect-video lg:aspect-21/9 w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 mb-12">
                        <Image
                            src={news.thumbnail_url}
                            alt={news.title}
                            fill
                            priority
                            className="object-cover"
                            sizes="(max-width: 1280px) 100vw, 1280px"
                        />
                    </div>
                )}

                {/* ── Content Grid: Article + Sidebar ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    {/* Article Body */}
                    <article className="lg:col-span-8 min-w-0">
                        {/* Prose Content */}
                        <div
                            className="article-content prose prose-lg dark:prose-invert max-w-none
                                prose-headings:font-outfit prose-headings:font-bold prose-headings:tracking-tight
                                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                                prose-p:text-gray-600 prose-p:dark:text-gray-400 prose-p:leading-relaxed
                                prose-a:text-brand-600 prose-a:dark:text-brand-400 prose-a:no-underline prose-a:font-medium hover:prose-a:underline
                                prose-img:rounded-2xl prose-img:border prose-img:border-gray-200 prose-img:dark:border-gray-800
                                prose-blockquote:border-brand-500 prose-blockquote:bg-gray-50 prose-blockquote:dark:bg-gray-900 prose-blockquote:rounded-r-xl prose-blockquote:py-1
                                prose-code:text-brand-600 prose-code:dark:text-brand-400 prose-code:bg-gray-100 prose-code:dark:bg-gray-800 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
                                prose-strong:text-gray-900 prose-strong:dark:text-white
                                prose-li:text-gray-600 prose-li:dark:text-gray-400
                                prose-hr:border-gray-200 prose-hr:dark:border-gray-800"
                            dangerouslySetInnerHTML={{ __html: news.content || '' }}
                        />

                        {/* Tags / Keywords */}
                        {news.meta_keywords && (
                            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                                <div className="flex flex-wrap gap-2">
                                    {news.meta_keywords.split(',').map((keyword: string, index: number) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400"
                                        >
                                            {keyword.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Divider */}
                        <hr className="my-12 border-gray-200 dark:border-gray-800" />

                        {/* Comments Section */}
                        <CommentSection newsId={news.id} initialComments={comments} isAdmin={isAdmin} />
                    </article>

                    {/* ── Sidebar ── */}
                    <aside className="lg:col-span-4">
                        <div className="lg:sticky lg:top-28 space-y-10">
                            {/* Table of Contents — only render if content has headings */}
                            {news.content && (
                                <TableOfContents htmlContent={news.content} />
                            )}

                            {/* Separator between ToC and Related */}
                            {relatedNews.length > 0 && (
                                <hr className="border-gray-200 dark:border-gray-800" />
                            )}

                            {/* Related Articles */}
                            {relatedNews.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-5">
                                        Artikel Terkait
                                    </h3>
                                    <div className="space-y-5">
                                        {relatedNews.map((related) => (
                                            <Link
                                                key={related.id}
                                                href={`/berita/${related.slug}`}
                                                className="group flex gap-4"
                                            >
                                                {/* Thumbnail */}
                                                <div className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
                                                    {related.thumbnail_url ? (
                                                        <Image
                                                            src={related.thumbnail_url}
                                                            alt={related.title}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                            sizes="80px"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-gray-400 text-xs">
                                                            No Img
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                                        {related.title}
                                                    </h4>
                                                    {related.published_at && (
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                                                            {formatSmartDate(related.published_at)}
                                                        </p>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Back to all news */}
                            <Link
                                href="/berita"
                                className="flex items-center justify-center gap-2 w-full rounded-xl border border-gray-200 dark:border-gray-800 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                            >
                                Semua Berita
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
