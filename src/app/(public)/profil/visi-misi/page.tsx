
import React from 'react';
import Image from 'next/image';
import { getVisiMisi } from '@/lib/queries/public';
import { Target, Eye, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import JsonLd from '@/components/seo/JsonLd';

export const metadata = {
    title: 'Visi & Misi HMPSINF - Arah dan Tujuan',
    description: 'Visi dan Misi Himpunan Mahasiswa Program Studi Informatika (HMPSINF) Universitas Nurul Huda. Landasan gerak dan tujuan organisasi.',
    keywords: ['Visi Misi HMPSINF', 'Tujuan HMPSINF', 'Arah Organisasi', 'Informatika UNUHA'],
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/profil/visi-misi`,
    },
};

export default async function VisiMisiPage() {
    const data = await getVisiMisi();

    if (!data) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Data Tidak Ditemukan</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    Belum ada data visi & misi yang ditambahkan.
                </p>
            </div>
        );
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "Visi & Misi HMPSINF",
        "description": "Visi dan Misi Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda.",
        "publisher": {
            "@type": "Organization",
            "name": "HMPSINF Universitas Nurul Huda",
            "url": process.env.NEXT_PUBLIC_SITE_URL
        }
    };

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950">
            <JsonLd data={jsonLd} />
            <div className="max-w-7xl mx-auto px-6 pt-6 pb-12 md:pt-10 md:pb-20 lg:px-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href="/profil" className="hover:text-brand-600 transition-colors">Profil</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 dark:text-white font-medium">Visi & Misi</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Main Content Column */}
                    <div className="lg:col-span-8">
                        <header className="mb-10 text-center md:text-left">
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-2 font-outfit">
                                Visi & Misi
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Arah dan tujuan kami melangkah ke depan.
                            </p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            {/* Visi Section */}
                            <div className="md:col-span-2">
                                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white font-outfit mb-4">
                                    Visi
                                </h2>
                                <div className="prose prose-slate dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed">
                                    <div dangerouslySetInnerHTML={{ __html: data.visi || '' }} />
                                </div>
                            </div>
                        </div>

                        {/* Misi Section - Full width below */}
                        <section>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white font-outfit mb-4">
                                Misi
                            </h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed">
                                <div dangerouslySetInnerHTML={{ __html: data.misi || '' }} />
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="hidden lg:block lg:col-span-4 sticky top-24">
                        <div className="pl-8 border-l border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-6">
                                Menu Profil
                            </h3>
                            <nav className="flex flex-col gap-4">
                                <Link href="/profil/sejarah" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    Sejarah
                                </Link>
                                <Link href="/profil/visi-misi" className="text-brand-600 dark:text-brand-400 font-medium">
                                    Visi & Misi
                                </Link>
                                <Link href="/profil/struktur-organisasi" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    Struktur Organisasi
                                </Link>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
