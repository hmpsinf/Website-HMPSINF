import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAnnouncements } from "@/lib/queries/public";
import AnnouncementCard from "@/components/public/pengumuman/AnnouncementCard";
import AnnouncementSearch from "@/components/public/pengumuman/AnnouncementSearch";
import JsonLd from '@/components/seo/JsonLd';

export const metadata: Metadata = {
    title: "Pengumuman & Informasi | HMPSINF Universitas Nurul Huda",
    description: "Informasi terbaru, pengumuman akademik, dan pemberitahuan penting seputar Program Studi Informatika Universitas Nurul Huda.",
    keywords: ['Pengumuman Informatika', 'Info Akademik', 'Pemberitahuan Mahasiswa', 'Berita Kampus'],
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/pengumuman`,
    },
};

export const revalidate = 60; // Revalidate every minute

export default async function PengumumanPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : "";

    // Fetch data
    const { data: announcements, meta } = await getAnnouncements(page, 12, search);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Pengumuman HMPSINF',
        description: 'Daftar pengumuman dan informasi terbaru HMPSINF Universitas Nurul Huda',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/pengumuman`,
        hasPart: announcements.map((announcement) => ({
            '@type': 'Article',
            headline: announcement.title,
            datePublished: announcement.published_at,
            author: {
                '@type': 'Person',
                name: announcement.author,
            },
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/pengumuman/${announcement.slug}`,
        })),
    };

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 pb-20">
            <JsonLd data={jsonLd} />

            {/* Header / Background Decoration */}
            <div className="absolute top-0 inset-x-0 h-96 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <header className="mb-10 md:mb-14 text-center max-w-3xl mx-auto pt-6">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-outfit tracking-tight leading-[1.1]">
                        Pengumuman & Informasi
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                        Dapatkan informasi terbaru seputar akademik, kegiatan, dan pemberitahuan penting lainnya.
                    </p>
                </header>

                {/* Search */}
                <Suspense fallback={<div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-full w-full max-w-md mx-auto mb-10 animate-pulse" />}>
                    <AnnouncementSearch />
                </Suspense>

                {/* Announcement Grid */}
                {announcements.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
                        {announcements.map((announcement, index) => (
                            <div key={announcement.id} style={{ animationDelay: `${index * 100}ms` }}>
                                <AnnouncementCard announcement={announcement} priority={index < 4} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                            <span className="text-2xl">📢</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Belum ada pengumuman
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                            {search
                                ? `Tidak ditemukan pengumuman dengan kata kunci "${search}"`
                                : "Saat ini belum ada pengumuman yang ditampilkan."}
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <div className="mt-16 flex justify-center gap-4">
                        {page > 1 && (
                            <Link href={`/pengumuman?page=${page - 1}${search ? `&search=${search}` : ''}`} className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                Sebelumnya
                            </Link>
                        )}
                        {page < meta.totalPages && (
                            <Link href={`/pengumuman?page=${page + 1}${search ? `&search=${search}` : ''}`} className="px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:opacity-90 transition-opacity">
                                Selanjutnya
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
