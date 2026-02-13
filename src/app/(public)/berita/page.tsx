
import { Metadata } from 'next';
import { getAllNews, getNewsCategories } from '@/lib/queries/public';
import NewsSearch from '@/components/news/NewsSearch';
import NewsHero from '@/components/news/NewsHero';
import NewsGrid from '@/components/news/NewsGrid';
import NewsFilter from '@/components/news/NewsFilter';
import JsonLd from '@/components/seo/JsonLd';

export const metadata: Metadata = {
    title: 'Berita & Artikel | HMPSINF Universitas Nurul Huda',
    description: 'Informasi terbaru seputar kegiatan, teknologi, dan wawasan dari Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda.',
    keywords: ['Berita HMPSINF', 'Artikel Informatika', 'Info Kampus UNUHA', 'Kegiatan Mahasiswa', 'Teknologi'],
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/berita`,
    },
};

interface NewsPageProps {
    searchParams: Promise<{
        page?: string;
        category?: string;
        q?: string;
    }>;
}

export default async function NewsPage(props: NewsPageProps) {
    const searchParams = await props.searchParams;
    const page = Number(searchParams.page) || 1;
    const category = searchParams.category || '';
    const search = searchParams.q || '';

    // Fetch Data
    // We fetch one extra item on the first page to account for the Hero content
    const limit = 13;
    const isFirstPage = page === 1 && !search && !category;

    const [newsData, categories] = await Promise.all([
        getAllNews(page, isFirstPage ? limit : 12, search, category),
        getNewsCategories()
    ]);

    // Logic for Hero vs Grid
    // If it's the first page and no filters, pop the first item for the Hero
    let heroNews = null;
    let gridNews = newsData.data;

    if (isFirstPage && newsData.data.length > 0) {
        heroNews = newsData.data[0];
        gridNews = newsData.data.slice(1);
    }

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 pb-20">
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'CollectionPage',
                    name: 'Berita & Artikel | HMPSINF Universitas Nurul Huda',
                    description: 'Informasi terbaru seputar kegiatan, teknologi, dan wawasan dari Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda.',
                    url: `${process.env.NEXT_PUBLIC_SITE_URL}/berita`,
                    breadcrumb: {
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
                                name: 'Berita & Artikel',
                                item: `${process.env.NEXT_PUBLIC_SITE_URL}/berita`,
                            },
                        ],
                    },
                }}
            />
            {/* Header / Background Decoration */}
            <div className="absolute top-0 inset-x-0 h-96 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <header className="mb-10 md:mb-14 text-center max-w-3xl mx-auto pt-6">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-outfit tracking-tight leading-[1.1]">
                        Berita & Artikel
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                        Temukan wawasan terbaru, liputan kegiatan, dan informasi menarik seputar dunia Informatika dan teknologi.
                    </p>

                    {/* Search Bar */}
                    <NewsSearch />
                </header>

                {/* Categories Filter */}
                <NewsFilter categories={categories} />

                {/* Hero Section (Only on first page, no filter) */}
                {heroNews && (
                    <div className="fade-in-up">
                        <NewsHero news={heroNews} />
                    </div>
                )}

                {/* Main Grid */}
                <NewsGrid news={gridNews} />

                {/* Pagination / Load More (Simple placeholder for now) */}
                {newsData.meta.totalPages > 1 && (
                    <div className="mt-20 flex justify-center gap-4">
                        {page > 1 && (
                            <a
                                href={`/berita?page=${page - 1}${category ? `&category=${category}` : ''}`}
                                className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                            >
                                Sebelumnya
                            </a>
                        )}
                        {page < newsData.meta.totalPages && (
                            <a
                                href={`/berita?page=${page + 1}${category ? `&category=${category}` : ''}`}
                                className="px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:opacity-90 transition-opacity"
                            >
                                Selanjutnya
                            </a>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
