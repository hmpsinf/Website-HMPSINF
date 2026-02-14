import { Metadata } from 'next';
import { getDocuments, getDocumentCategories } from '@/lib/queries/documents';
import DocumentFilters from '@/components/documents/DocumentFilters';
import DocumentGrid from '@/components/documents/DocumentGrid';
import DocumentSearch from '@/components/documents/DocumentSearch';
import { Suspense } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';

export const metadata: Metadata = {
    title: 'Unduhan & Dokumen - HMPSINF Universitas Nurul Huda',
    description: 'Pusat unduhan dokumen publik, panduan, dan arsip Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda.',
    keywords: ["Materi Kuliah", "E-Book Informatika", "Modul Praktikum", "Jurnal Informatika", "Skripsi Informatika", "Unduhan UNUHA", "HMPSINF"],
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/unduhan`,
    },
    openGraph: {
        title: 'Unduhan & Dokumen - HMPSINF Universitas Nurul Huda',
        description: 'Pusat unduhan dokumen publik, panduan, dan arsip Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda.',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/unduhan`,
        siteName: 'HMPSINF Universitas Nurul Huda',
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: "summary_large_image",
        title: 'Unduhan & Dokumen - HMPSINF Universitas Nurul Huda',
        description: 'Pusat unduhan dokumen publik, panduan, dan arsip Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda.',
    },
};

interface PageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        category?: string;
        owner?: string;
    }>;
}

export default async function DocumentsPage({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    const page = Number(resolvedParams.page) || 1;
    const search = resolvedParams.search || '';
    const category = resolvedParams.category || '';
    const owner = (resolvedParams.owner || '') as 'hima' | 'division' | '';

    const [documentsData, categories] = await Promise.all([
        getDocuments({ page, limit: 12, search, category, owner }),
        getDocumentCategories()
    ]);

    const { documents, pagination } = documentsData;

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 pb-20">
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'CollectionPage',
                    name: 'Unduhan & Dokumen - HMPSINF Universitas Nurul Huda',
                    description: 'Pusat unduhan dokumen publik, panduan, dan arsip Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda.',
                    url: `${process.env.NEXT_PUBLIC_SITE_URL}/unduhan`,
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
                                name: 'Unduhan',
                                item: `${process.env.NEXT_PUBLIC_SITE_URL}/unduhan`,
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
                        Dokumen & Arsip
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                        Akses berbagai dokumen publik, panduan, dan arsip kegiatan HIMPSINF.
                        Cari dan filter sesuai kebutuhan Anda.
                    </p>
                </header>

                {/* Search & Filters - Single Row */}
                <div className="mb-8 flex items-center gap-2 sm:gap-3 max-w-3xl mx-auto">
                    <Suspense fallback={<div className="h-11 flex-1 bg-gray-100 rounded-full animate-pulse" />}>
                        <DocumentSearch />
                    </Suspense>
                    <Suspense fallback={<div className="h-11 w-24 bg-gray-100 rounded-xl animate-pulse" />}>
                        <DocumentFilters categories={categories} />
                    </Suspense>
                </div>

                {/* Documents Grid */}
                <Suspense fallback={
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                    </div>
                }>
                    <DocumentGrid documents={documents} />
                </Suspense>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                        <nav className="flex items-center gap-2">
                            <Link
                                href={{
                                    query: { ...resolvedParams, page: page > 1 ? page - 1 : 1 }
                                }}
                                className={`p-2 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </Link>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    // Logic to show current page surroundings
                                    let pageNum = i + 1;
                                    if (pagination.totalPages > 5) {
                                        if (page > 3) {
                                            if (page >= pagination.totalPages - 2) {
                                                pageNum = pagination.totalPages - 4 + i;
                                            } else {
                                                pageNum = page - 2 + i;
                                            }
                                        }
                                    }

                                    return (
                                        <Link
                                            key={pageNum}
                                            href={{
                                                query: { ...resolvedParams, page: pageNum }
                                            }}
                                            className={`h-10 w-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === pageNum
                                                ? 'bg-brand-500 text-white'
                                                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900'
                                                }`}
                                        >
                                            {pageNum}
                                        </Link>
                                    );
                                })}
                            </div>

                            <Link
                                href={{
                                    query: { ...resolvedParams, page: page < pagination.totalPages ? page + 1 : pagination.totalPages }
                                }}
                                className={`p-2 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 ${page >= pagination.totalPages ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </Link>
                        </nav>
                    </div>
                )}
            </div>
        </main>
    );
}
