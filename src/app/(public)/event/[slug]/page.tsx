import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    Calendar, MapPin, Clock, ChevronRight, ExternalLink, MessageCircle, Eye, ArrowLeft
} from 'lucide-react';
import { getEventBySlug } from '@/lib/queries/public';
import { formatDate, formatTime } from '@/lib/utils';
import JsonLd from '@/components/seo/JsonLd';
import EventViewTracker from '@/components/event/EventViewTracker';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const event = await getEventBySlug(slug);

    if (!event) {
        return {
            title: 'Event Tidak Ditemukan',
            description: 'Event yang Anda cari tidak tersedia.'
        };
    }

    const description = event.description
        ? event.description.replace(/<[^>]*>/g, '').slice(0, 160) + '...'
        : `Detail event ${event.title} oleh HMPSINF Universitas Nurul Huda.`;

    const keywordList = [
        'Event', 'Agenda', 'Mahasiswa', 'Informatika', 'Nurul Huda', 'HMINF', 'UNUHA',
        ...event.title.split(' '),
        event.location
    ].filter(Boolean);

    const ogImages = event.thumbnail_url
        ? [{ url: event.thumbnail_url, width: 1200, height: 630, alt: event.title }]
        : [];

    return {
        title: event.title,
        description,
        keywords: keywordList,
        authors: [{ name: 'HMPSINF' }],
        openGraph: {
            title: event.title,
            description,
            url: `/event/${event.slug}`,
            siteName: 'HMIF Nurul Huda',
            images: ogImages,
            type: 'article',
            publishedTime: event.created_at,
            modifiedTime: event.updated_at,
            authors: ['HMPSINF'],
        },
        twitter: {
            card: 'summary_large_image',
            title: event.title,
            description,
            images: ogImages,
        },
        alternates: {
            canonical: `/event/${event.slug}`,
        },
    };
}

export default async function EventDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const event = await getEventBySlug(slug);

    if (!event) notFound();

    const isExpired = new Date(event.event_date) < new Date();
    const isOpen = event.is_open && !isExpired;

    // JSON-LD for Event
    const eventJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        startDate: `${event.event_date}T${event.event_time || '00:00'}`,
        endDate: event.event_end_date
            ? `${event.event_end_date}T${event.event_end_time || '23:59'}`
            : undefined,
        eventStatus: event.is_open ? 'https://schema.org/EventScheduled' : 'https://schema.org/EventCancelled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
            '@type': 'Place',
            name: event.location,
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'OKU Timur',
                addressRegion: 'Sumatera Selatan',
                addressCountry: 'ID'
            }
        },
        image: event.thumbnail_url ? [event.thumbnail_url] : [],
        description: event.description?.replace(/<[^>]*>/g, ''),
        organizer: {
            '@type': 'Organization',
            name: 'HMPSINF Universitas Nurul Huda',
            url: process.env.NEXT_PUBLIC_SITE_URL
        },
        offers: {
            '@type': 'Offer',
            url: event.link_url || `${process.env.NEXT_PUBLIC_SITE_URL}/event/${event.slug}`,
            price: '0',
            priceCurrency: 'IDR',
            availability: event.is_open ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut'
        }
    };

    // JSON-LD for Breadcrumbs
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Beranda',
                item: process.env.NEXT_PUBLIC_SITE_URL || 'https://hmif-nurulhuda.org'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Agenda & Kegiatan',
                item: `${process.env.NEXT_PUBLIC_SITE_URL}/event`
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: event.title,
                item: `${process.env.NEXT_PUBLIC_SITE_URL}/event/${event.slug}`
            }
        ]
    };

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950">
            <JsonLd data={eventJsonLd} />
            <JsonLd data={breadcrumbJsonLd} />
            <EventViewTracker eventId={event.id} />

            {/* Background Gradient */}
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                {/* Breadcrumb */}
                <nav className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-6 lg:mb-8">
                    <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                        Beranda
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    <Link href="/event" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                        Agenda & Kegiatan
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-gray-900 dark:text-white font-medium truncate max-w-[150px] sm:max-w-[200px] lg:max-w-xs">
                        {event.title}
                    </span>
                </nav>



                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Thumbnail - Mobile Only (at top) */}
                        <div className="lg:hidden relative aspect-[4/5] w-full rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
                            {event.thumbnail_url ? (
                                <Image
                                    src={event.thumbnail_url}
                                    alt={event.title}
                                    fill
                                    priority
                                    className="object-cover"
                                    sizes="100vw"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                    <Calendar className="w-12 h-12 sm:w-16 sm:h-16 opacity-20" />
                                </div>
                            )}
                        </div>

                        {/* Header Section */}
                        <header className="space-y-4">
                            {/* Status Badge */}
                            <div>
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${isOpen
                                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                                    {isOpen ? 'Pendaftaran Dibuka' : 'Ditutup'}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white font-outfit leading-tight tracking-tight">
                                {event.title}
                            </h1>

                            {/* Meta Info - Stacked on mobile */}
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-x-5 sm:gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 shrink-0" />
                                    <span>{formatDate(event.event_date, event.event_end_date)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 shrink-0" />
                                    <span>{event.event_time ? formatTime(event.event_time, event.event_end_time) : 'Menyesuaikan jadwal'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 shrink-0" />
                                    <span>{event.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 shrink-0" />
                                    <span>{event.view_count.toLocaleString('id-ID')} dilihat</span>
                                </div>
                            </div>
                        </header>

                        {/* CTA & Contact - Mobile Only */}
                        <div className="lg:hidden space-y-3">
                            {/* CTA Button */}
                            {event.link_url && isOpen ? (
                                <Link
                                    href={event.link_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex w-full items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 active:bg-brand-800 transition-colors shadow-sm"
                                >
                                    <span>{event.link_text || 'Daftar Sekarang'}</span>
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            ) : (
                                <button
                                    disabled
                                    className="flex w-full items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 font-semibold cursor-not-allowed"
                                >
                                    Pendaftaran Ditutup
                                </button>
                            )}

                            {/* Contact Person */}
                            {event.kontak && (
                                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Kontak
                                        </p>
                                    </div>
                                    {(() => {
                                        const phone = event.kontak.replace(/<[^>]*>/g, '').trim();
                                        const cleanPhone = phone.replace(/\D/g, '');
                                        const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

                                        if (cleanPhone.length >= 9) {
                                            return (
                                                <a
                                                    href={`https://wa.me/${waNumber}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                >
                                                    <span className="break-all">{phone}</span>
                                                </a>
                                            );
                                        }
                                        return (
                                            <div className="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-400 max-w-none">
                                                <div dangerouslySetInnerHTML={{ __html: event.kontak }} />
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Article Content */}
                        <article className="bg-white dark:bg-gray-950">
                            {/* Description */}
                            <div
                                className="article-content prose prose-base sm:prose-lg dark:prose-invert max-w-none
                                    prose-headings:font-outfit prose-headings:font-bold prose-headings:tracking-tight
                                    prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:mt-8 prose-h2:sm:mt-10 prose-h2:mb-3 prose-h2:sm:mb-4
                                    prose-h3:text-lg prose-h3:sm:text-xl prose-h3:mt-6 prose-h3:sm:mt-8 prose-h3:mb-2 prose-h3:sm:mb-3
                                    prose-p:text-gray-600 prose-p:dark:text-gray-400 prose-p:leading-relaxed prose-p:mb-4
                                    prose-a:text-brand-600 prose-a:dark:text-brand-400 prose-a:no-underline prose-a:font-medium hover:prose-a:underline prose-a:break-words
                                    prose-img:rounded-xl prose-img:sm:rounded-2xl prose-img:border prose-img:border-gray-200 prose-img:dark:border-gray-800 prose-img:my-6
                                    prose-blockquote:border-brand-500 prose-blockquote:bg-gray-50 prose-blockquote:dark:bg-gray-900 prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:my-6
                                    prose-strong:text-gray-900 prose-strong:dark:text-white prose-strong:font-semibold
                                    prose-ul:my-4 prose-ol:my-4
                                    prose-li:text-gray-600 prose-li:dark:text-gray-400 prose-li:my-1
                                    prose-hr:border-gray-200 prose-hr:dark:border-gray-800 prose-hr:my-8
                                    prose-code:text-brand-600 prose-code:dark:text-brand-400 prose-code:bg-gray-100 prose-code:dark:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal prose-code:before:content-[''] prose-code:after:content-['']
                                    prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800"
                                dangerouslySetInnerHTML={{ __html: event.description || '<p>Tidak ada deskripsi detail untuk event ini.</p>' }}
                            />

                            {/* Timeline / Rundown */}
                            {event.timeline && (
                                <div className="mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-gray-200 dark:border-gray-800">
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-outfit mb-4 sm:mb-6">
                                        Run Down / Timeline
                                    </h2>
                                    <div
                                        className="prose prose-base sm:prose-lg dark:prose-invert max-w-none
                                            prose-p:text-gray-600 prose-p:dark:text-gray-400 prose-p:leading-relaxed prose-p:mb-4
                                            prose-strong:text-gray-900 prose-strong:dark:text-white prose-strong:font-semibold
                                            prose-ul:my-4 prose-ol:my-4
                                            prose-li:text-gray-600 prose-li:dark:text-gray-400 prose-li:my-1"
                                        dangerouslySetInnerHTML={{ __html: event.timeline }}
                                    />
                                </div>
                            )}
                        </article>

                        {/* Back Button - Mobile (at bottom) */}
                        <div className="lg:hidden pt-6">
                            <Link
                                href="/event"
                                className="flex items-center justify-center gap-2 w-full rounded-lg border-2 border-gray-200 dark:border-gray-800 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Semua Agenda & Kegiatan
                            </Link>
                        </div>
                    </div>

                    {/* Right Column - Sidebar (Desktop Only) */}
                    <aside className="hidden lg:block lg:col-span-4">
                        <div className="sticky top-24 space-y-6">
                            {/* Thumbnail */}
                            <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shadow-sm">
                                {event.thumbnail_url ? (
                                    <Image
                                        src={event.thumbnail_url}
                                        alt={event.title}
                                        fill
                                        priority
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 100vw, 400px"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                        <Calendar className="w-16 h-16 opacity-20" />
                                    </div>
                                )}
                            </div>

                            {/* CTA Button Card */}
                            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-sm">
                                {event.link_url && isOpen ? (
                                    <Link
                                        href={event.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex w-full items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-all duration-300 shadow-sm hover:shadow-md"
                                    >
                                        <span>{event.link_text || 'Daftar Sekarang'}</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                ) : (
                                    <button
                                        disabled
                                        className="flex w-full items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 font-semibold cursor-not-allowed"
                                    >
                                        Pendaftaran Ditutup
                                    </button>
                                )}
                            </div>

                            {/* Contact Person */}
                            {event.kontak && (
                                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 shrink-0">
                                            <MessageCircle className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Kontak
                                        </h3>
                                    </div>
                                    {(() => {
                                        const phone = event.kontak.replace(/<[^>]*>/g, '').trim();
                                        const cleanPhone = phone.replace(/\D/g, '');
                                        const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

                                        if (cleanPhone.length >= 9) {
                                            return (
                                                <a
                                                    href={`https://wa.me/${waNumber}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors break-all"
                                                >
                                                    <span>{phone}</span>
                                                </a>
                                            );
                                        }
                                        return (
                                            <div className="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-400 max-w-none">
                                                <div dangerouslySetInnerHTML={{ __html: event.kontak }} />
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Back to all events */}
                            <Link
                                href="/event"
                                className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-gray-200 dark:border-gray-800 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Semua Agenda & Kegiatan
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}