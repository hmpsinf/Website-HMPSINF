'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

interface GalleryProps {
    gallery: {
        id: string;
        title: string;
        thumbnail_url: string | null;
        image_count: number;
        type: string;
        event?: { title: string; date: string | null } | null;
        program_kerja?: { title: string } | null;
    };
}

export default function GalleryCard({ gallery }: GalleryProps) {
    // Determine badge label and color based on type
    const getBadge = () => {
        switch (gallery.type) {
            case 'event':
                return { label: 'Event', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
            case 'proker':
                return { label: 'Program Kerja', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
            default:
                return { label: 'Umum', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700' };
        }
    };

    const badge = getBadge();

    return (
        <Link
            href={`/galeri/${gallery.id}`}
            className="group block relative overflow-hidden rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:border-brand-500/50 dark:hover:border-brand-500/50"
        >
            {/* Image Container - Aspect Ratio 4:3 */}
            <div className="relative aspect-4/3 overflow-hidden bg-gray-100 dark:bg-gray-900">
                {gallery.thumbnail_url ? (
                    <Image
                        src={gallery.thumbnail_url}
                        alt={gallery.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-12 h-12 opacity-50" />
                    </div>
                )}

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                {/* Count Badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold text-white bg-black/60 backdrop-blur-sm rounded-full flex items-center gap-1.5 border border-white/10">
                    <ImageIcon className="w-3.5 h-3.5" />
                    {gallery.image_count} Foto
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                    <span className={cn("px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full border", badge.color)}>
                        {badge.label}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {gallery.title}
                </h3>

                {/* Context Info (Event/Proker Title) */}
                {(gallery.event || gallery.program_kerja) && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {gallery.event?.title || gallery.program_kerja?.title}
                    </p>
                )}
            </div>
        </Link>
    );
}
