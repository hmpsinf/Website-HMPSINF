import React from 'react';
import Image from 'next/image';
import { getSiteSettings } from '@/lib/queries/public';
import Link from 'next/link';
import DownloadButton from '@/components/public/DownloadButton';

import JsonLd from '@/components/seo/JsonLd';

export const metadata = {
    title: 'Download Logo RESMI HMPSINF - Identitas Visual',
    description: 'Unduh logo resmi Himpunan Mahasiswa Program Studi Informatika (HMPSINF) Universitas Nurul Huda. Tersedia format PNG resolusi tinggi.',
    keywords: ['Logo HMPSINF', 'Download Logo HMPSINF', 'Identitas Visual HMPSINF', 'Logo Himpunan Mahasiswa Informatika'],
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/logo`,
    },
};

export default async function LogoPage() {
    const settings = await getSiteSettings();

    // Use default values if settings are not available
    const logoUrl = settings?.logo_url || '/images/logo-placeholder.png'; // Fallback if no logo
    const siteName = settings?.site_name || 'HMPSINF';

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950">
            <JsonLd data={{
                "@context": "https://schema.org",
                "@type": "ImageObject",
                "contentUrl": logoUrl,
                "license": process.env.NEXT_PUBLIC_SITE_URL,
                "acquireLicensePage": `${process.env.NEXT_PUBLIC_SITE_URL}/kontak`,
                "creditText": "HMPSINF Universitas Nurul Huda",
                "creator": {
                    "@type": "Organization",
                    "name": "HMPSINF"
                },
                "copyrightNotice": "HMPSINF"
            }} />
            <div className="max-w-7xl mx-auto px-6 pt-12 pb-20 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 font-outfit">
                        Identitas Visual
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        Unduh logo resmi {siteName} dengan untuk kebutuhan publikasi, kerjasama, dan media partner.
                    </p>
                </div>

                {/* Logo Display Section */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-12 md:p-20 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center">

                        {/* Area Logo - Clean, No Shadow as requested */}
                        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-12 flex items-center justify-center p-6">
                            {logoUrl ? (
                                <Image
                                    src={logoUrl}
                                    alt={`Logo ${siteName}`}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            ) : (
                                <div className="text-gray-400">Logo tidak tersedia</div>
                            )}
                        </div>

                        {/* Download Button */}
                        <div className="flex flex-col items-center gap-4">
                            <DownloadButton
                                url={logoUrl}
                                filename={`logo-${siteName.toLowerCase().replace(/\s+/g, '-')}.png`}
                                label="Download PNG"
                            />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Format PNG Transparan
                            </p>
                        </div>

                    </div>

                    {/* Usage Guidelines (Optional simple text) */}
                    <div className="mt-12 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Gunakan logo ini sesuai dengan panduan identitas visual kami. Jangan mengubah proporsi, warna, atau menambahkan efek yang tidak perlu pada logo.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
