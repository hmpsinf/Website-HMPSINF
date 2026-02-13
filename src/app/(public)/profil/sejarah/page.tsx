
import React from 'react';
import { getSejarah } from '@/lib/queries/public';
import { Clock, Terminal, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import JsonLd from '@/components/seo/JsonLd';

export const metadata = {
    title: 'Sejarah HMPSINF - Perjalanan dan Latar Belakang',
    description: 'Menelusuri jejak sejarah dan perkembangan Himpunan Mahasiswa Program Studi Informatika (HMPSINF) Universitas Nurul Huda dari masa ke masa.',
    keywords: ['Sejarah HMPSINF', 'Latar Belakang HMPSINF', 'Pendirian HMPSINF', 'Himpunan Mahasiswa Informatika UNUHA'],
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/profil/sejarah`,
    },
};

export default async function SejarahPage() {
    const data = await getSejarah();

    if (!data) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                    <Terminal className="w-8 h-8 text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Data Tidak Ditemukan</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    Belum ada data sejarah yang ditambahkan. Silakan hubungi admin untuk memperbarui informasi ini.
                </p>
            </div>
        );
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "Sejarah HMPSINF",
        "description": "Sejarah perjalanan dan perkembangan Himpunan Mahasiswa Teknik Informatika Universitas Nurul Huda.",
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
                    <span className="text-gray-900 dark:text-white font-medium">Sejarah</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Main Content Column */}
                    <div className="lg:col-span-8">
                        {/* Header */}
                        <header className="mb-6 text-center md:text-left">
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-2 font-outfit">
                                {data.title}
                            </h1>
                        </header>

                        <div className="flex flex-col-reverse md:flex-row gap-8 items-start">
                            {/* Rich Text Content */}
                            <div className="flex flex-col gap-8 items-start w-full">
                                <article className="w-full prose prose-slate dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed
                                prose-headings:font-outfit prose-headings:font-bold prose-headings:tracking-tight
                                prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline
                                prose-strong:text-gray-900 dark:prose-strong:text-white
                            ">
                                    <div dangerouslySetInnerHTML={{ __html: data.content || '' }} />
                                </article>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar */}
                    <div className="hidden lg:block lg:col-span-4 sticky top-24">
                        <div className="pl-8 border-l border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-6">
                                Menu Profil
                            </h3>
                            <nav className="flex flex-col gap-4">
                                <Link href="/profil/sejarah" className="text-brand-600 dark:text-brand-400 font-medium">
                                    Sejarah
                                </Link>
                                <Link href="/profil/visi-misi" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
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
