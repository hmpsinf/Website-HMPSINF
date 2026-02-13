'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, Info, ImageIcon, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import ImageLightbox from '@/components/gallery/ImageLightbox';

// Since this is a client component for interactivity, we'll pass data as props
// The parent server page will fetch the data
interface GalleryDetailProps {
    gallery: {
        id: string;
        title: string;
        description: string | null;
        created_at: string;
        type: string;
        event?: { title: string; date: string | null } | null;
        program_kerja?: { title: string } | null;
        images: {
            id: string;
            image_url: string;
            public_id: string;
            caption: string | null;
        }[];
    };
}

export default function GalleryDetailClient({ gallery }: GalleryDetailProps) {
    const [lightboxIndex, setLightboxIndex] = useState(-1);

    if (!gallery) return notFound();

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 pb-20">
            {/* Background Gradient */}
            <div className="absolute top-0 inset-x-0 h-96 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                {/* Breadcrumb */}
                <nav className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-6 lg:mb-8">
                    <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                        Beranda
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    <Link href="/galeri" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                        Galeri
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-gray-900 dark:text-white font-medium truncate max-w-[150px] sm:max-w-[200px] lg:max-w-xs">
                        {gallery.title}
                    </span>
                </nav>

                {/* Header Section */}
                <header className="max-w-4xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${gallery.type === 'event' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                            gallery.type === 'proker' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' :
                                'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700'
                            }`}>
                            {gallery.type === 'event' ? 'Event' : gallery.type === 'proker' ? 'Program Kerja' : 'Umum'}
                        </span>

                        <span className="text-gray-400">•</span>

                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-1.5" />
                            {formatDate(gallery.created_at)}
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 font-outfit tracking-tight">
                        {gallery.title}
                    </h1>

                    {gallery.description && (
                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                            {gallery.description}
                        </p>
                    )}

                    {/* Related Context */}
                    {(gallery.event || gallery.program_kerja) && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                            <Info className="w-4 h-4 text-brand-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Dokumentasi dari: <span className="font-bold text-gray-900 dark:text-white">{gallery.event?.title || gallery.program_kerja?.title}</span>
                            </span>
                        </div>
                    )}
                </header>

                {/* Images Grid - Masonry-like feel with different aspect ratios if we had them, standard grid for now */}
                <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {gallery.images.map((image, index) => (
                            <div
                                key={image.id}
                                className="group relative cursor-pointer overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900 aspect-square"
                                onClick={() => setLightboxIndex(index)}
                            >
                                <Image
                                    src={image.image_url}
                                    alt={image.caption || `Foto galeri ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                />

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <ImageIcon className="w-8 h-8 text-white drop-shadow-md" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {gallery.images.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Belum ada foto</h3>
                            <p className="text-gray-500 dark:text-gray-400">Galeri ini belum memiliki dokumentasi foto.</p>
                        </div>
                    )}
                </section>
            </div>

            {/* Lightbox */}
            <ImageLightbox
                images={gallery.images}
                initialIndex={lightboxIndex}
                isOpen={lightboxIndex >= 0}
                onClose={() => setLightboxIndex(-1)}
            />
        </main>
    );
}
