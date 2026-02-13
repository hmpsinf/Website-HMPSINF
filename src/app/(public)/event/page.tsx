import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getEvents } from "@/lib/queries/public";
import EventCard from "@/components/event/EventCard";
import { Calendar } from "lucide-react";
import JsonLd from '@/components/seo/JsonLd';
import EventSearch from "@/components/event/EventSearch";
import EventFilter from "@/components/event/EventFilter";

export const metadata: Metadata = {
    title: "Agenda & Kegiatan | HMPSINF Universitas Nurul Huda",
    description: "Jadwal kegiatan dan agenda terbaru Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda.",
    keywords: ['Event HMPSINF', 'Agenda Informatika', 'Workshop', 'Seminar', 'Kegiatan Mahasiswa'],
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/event`,
    },
};

export const revalidate = 60; // Revalidate every minute

export default async function EventPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : "";
    const filter = typeof resolvedSearchParams.filter === "string" ? resolvedSearchParams.filter : "";
    const limit = 12;

    const { data: events, meta } = await getEvents(page, limit, search, filter);

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 pb-20">
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'CollectionPage',
                    name: 'Agenda & Kegiatan | HMPSINF Universitas Nurul Huda',
                    description: 'Jadwal kegiatan dan agenda terbaru Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda.',
                    url: `${process.env.NEXT_PUBLIC_SITE_URL}/event`,
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
                                name: 'Agenda & Kegiatan',
                                item: `${process.env.NEXT_PUBLIC_SITE_URL}/event`,
                            },
                        ],
                    },
                }}
            />

            {/* Background Gradient - Matched from News Detail Page */}
            <div className="absolute top-0 inset-x-0 h-[32rem] bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                {/* Hero Section - Centered & Clean, padding adjusted to match reference */}
                <section className="pb-10 text-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                        Agenda & Kegiatan
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        Temukan dan ikuti berbagai kegiatan menarik yang diselenggarakan oleh HMPSINF untuk mengembangkan potensi dan wawasan.
                    </p>
                </section>

                {/* Search Bar & Filter */}
                <Suspense fallback={<div className="h-14 w-full max-w-md mx-auto bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse mb-10" />}>
                    <EventSearch />
                </Suspense>

                <Suspense fallback={<div className="h-10 w-full max-w-xl mx-auto bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse mb-12" />}>
                    <EventFilter />
                </Suspense>

                {/* Events Grid */}
                {events.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 animate-in fade-in duration-1000 delay-500">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Belum ada kegiatan
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                            {search
                                ? `Tidak ditemukan kegiatan dengan kata kunci "${search}"`
                                : filter
                                    ? "Tidak ada event yang sesuai dengan filter yang dipilih."
                                    : "Saat ini belum ada agenda kegiatan yang ditampilkan."}
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <div className="mt-16 flex justify-center gap-4">
                        {page > 1 && (
                            <Link href={`/event?page=${page - 1}${search ? `&search=${search}` : ''}${filter ? `&filter=${filter}` : ''}`} className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                Sebelumnya
                            </Link>
                        )}
                        {page < meta.totalPages && (
                            <Link href={`/event?page=${page + 1}${search ? `&search=${search}` : ''}${filter ? `&filter=${filter}` : ''}`} className="px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:opacity-90 transition-opacity">
                                Selanjutnya
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
