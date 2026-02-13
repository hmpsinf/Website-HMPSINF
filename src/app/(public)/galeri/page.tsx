import { getGalleries } from '@/lib/queries/gallery';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import { Suspense } from 'react';
import { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';

export const metadata: Metadata = {
    title: 'Galeri Kegiatan | HMPSINF Universitas Nurul Huda',
    description: 'Dokumentasi kegiatan dan program kerja Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda. Lihat potret kebersamaan dan keseruan kami.',
    keywords: ["Galeri HMPSINF", "Foto Kegiatan Mahasiswa", "Dokumentasi HIMA", "Informatika UNUHA", "Album Kegiatan"],
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/galeri`,
    },
    openGraph: {
        title: 'Galeri Kegiatan | HMPSINF Universitas Nurul Huda',
        description: 'Dokumentasi kegiatan dan program kerja Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda.',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/galeri`,
        siteName: 'HMPSINF Universitas Nurul Huda',
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: "summary_large_image",
        title: 'Galeri Kegiatan | HMPSINF Universitas Nurul Huda',
        description: 'Dokumentasi kegiatan dan program kerja Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda.',
    },
};

export default async function GalleryPage() {
    const galleries = await getGalleries('all');

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950">
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    name: "Galeri Kegiatan | HMPSINF Universitas Nurul Huda",
                    description: "Dokumentasi kegiatan dan program kerja Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda.",
                    url: `${process.env.NEXT_PUBLIC_SITE_URL}/galeri`,
                    breadcrumb: {
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            {
                                "@type": "ListItem",
                                position: 1,
                                name: "Beranda",
                                item: process.env.NEXT_PUBLIC_SITE_URL,
                            },
                            {
                                "@type": "ListItem",
                                position: 2,
                                name: "Galeri",
                                item: `${process.env.NEXT_PUBLIC_SITE_URL}/galeri`,
                            },
                        ],
                    },
                }}
            />
            {/* Background Gradient - Consistent with News/Event */}
            <div className="absolute top-0 inset-x-0 h-96 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <header className="mb-10 md:mb-14 text-center max-w-3xl mx-auto pt-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 font-outfit tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Galeri Kegiatan
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                        Jelajahi momen-momen berharga dari setiap agenda dan program kerja yang telah kami laksanakan.
                    </p>
                </header>

                {/* Gallery Grid */}
                <section className="pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    <Suspense fallback={<div className="text-center py-20 text-gray-500">Memuat galeri...</div>}>
                        <GalleryGrid initialGalleries={galleries} />
                    </Suspense>
                </section>
            </div>
        </main>
    );
}
