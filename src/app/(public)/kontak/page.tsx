
import { Metadata } from 'next';
import { getSiteSettings } from '@/lib/queries/public';
import JsonLd from '@/components/seo/JsonLd';
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube } from 'lucide-react';
import Link from 'next/link';

// Simple TikTok icon since lucide doesn't have one
function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .55.04.81.1v-3.5a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.81a8.23 8.23 0 0 0 3.76.96V6.32a4.85 4.85 0 0 1-.01.37z" />
        </svg>
    );
}

export const metadata: Metadata = {
    title: 'Kontak | HMPSINF Universitas Nurul Huda',
    description: 'Hubungi Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda. Kami siap mendengar masukan, pertanyaan, dan kolaborasi Anda.',
    keywords: ['Kontak HMPSINF', 'Hubungi Kami', 'Alamat Sekretariat', 'Informatika UNUHA', 'HMPSINF'],
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/kontak`,
    },
    openGraph: {
        title: 'Kontak | HMPSINF Universitas Nurul Huda',
        description: 'Hubungi Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda. Kami siap mendengar masukan, pertanyaan, dan kolaborasi Anda.',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/kontak`,
        siteName: 'HMPSINF Universitas Nurul Huda',
        locale: 'id_ID',
        type: 'website',
    },
};

export default async function ContactPage() {
    const settings = await getSiteSettings();
    const resolvedAddress = settings.address && settings.address.trim().length > 0 ? settings.address : null;

    // Social Media Links Helper
    const socialLinks: {
        key: keyof typeof settings;
        icon: any;
        label: string;
        color: string;
    }[] = [
            {
                key: 'instagram_url',
                icon: Instagram,
                label: 'Instagram',
                color: 'hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20',
            },
            {
                key: 'tiktok_url',
                icon: TikTokIcon,
                label: 'TikTok',
                color: 'hover:text-black hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800',
            },
            {
                key: 'facebook_url',
                icon: Facebook,
                label: 'Facebook',
                color: 'hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
            },
            {
                key: 'youtube_url',
                icon: Youtube,
                label: 'YouTube',
                color: 'hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
            },
        ];

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 pb-20">
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'ContactPage',
                    name: 'Kontak | HMPSINF Universitas Nurul Huda',
                    description: 'Hubungi Himpunan Mahasiswa Program Studi Informatika Universitas Nurul Huda.',
                    url: `${process.env.NEXT_PUBLIC_SITE_URL}/kontak`,
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
                                name: 'Kontak',
                                item: `${process.env.NEXT_PUBLIC_SITE_URL}/kontak`,
                            },
                        ],
                    },
                }}
            />

            {/* Background Decoration */}
            <div className="absolute top-0 inset-x-0 h-96 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <header className="mb-16 md:mb-20 text-center max-w-3xl mx-auto pt-6">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-outfit tracking-tight leading-tight">
                        Kontak
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                        Kami selalu terbuka untuk berdiskusi. Jangan ragu untuk menghubungi kami melalui saluran di bawah ini atau kunjungi sekretariat kami.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                    {/* Left Column: Contact Info */}
                    <div className="space-y-10">
                        {/* Contact Details */}
                        <div className="space-y-8">
                            <div className="flex items-start gap-5 group">
                                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white group-hover:scale-110 transition-transform duration-300 border border-gray-100 dark:border-gray-800">
                                    <MapPin className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Alamat</h3>
                                    {resolvedAddress ? (
                                        <div
                                            className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg"
                                            dangerouslySetInnerHTML={{ __html: resolvedAddress }}
                                        />
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                                            Alamat belum diatur
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-5 group">
                                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white group-hover:scale-110 transition-transform duration-300 border border-gray-100 dark:border-gray-800">
                                    <Mail className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email</h3>
                                    <a
                                        href={`mailto:${settings.contact_email}`}
                                        className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        {settings.contact_email || 'Email belum diatur'}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-5 group">
                                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white group-hover:scale-110 transition-transform duration-300 border border-gray-100 dark:border-gray-800">
                                    <Phone className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Telepon / WhatsApp</h3>
                                    <a
                                        href={`https://wa.me/${settings.contact_phone?.replace(/^0/, '62')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                    >
                                        {settings.contact_phone || 'Telepon belum diatur'}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-gray-800" />

                        {/* Social Media */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Sosial Media</h3>
                            <div className="flex flex-wrap gap-4">
                                {socialLinks.map((social) => {
                                    const url = settings[social.key];
                                    if (!url) return null;

                                    return (
                                        <Link
                                            key={social.key}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 transition-all duration-300 flex items-center gap-3 border border-gray-100 dark:border-gray-800 ${social.color} hover:shadow-sm`}
                                        >
                                            <social.icon className="w-6 h-6" />
                                            <span className="font-medium">{social.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Map Embed */}
                    <div className="relative w-full h-[500px] lg:h-[600px] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 isolate">
                        {/* Simple loading skeleton behind the iframe */}
                        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900 animate-pulse -z-10" />

                        {settings.maps_embed_url ? (
                            <iframe
                                src={settings.maps_embed_url}
                                className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Lokasi Sekretariat HMPSINF"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-900">
                                <MapPin className="w-12 h-12 mb-4 opacity-50" />
                                <p>Peta lokasi belum diatur</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
