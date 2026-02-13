'use client';

import { useState } from 'react';
import GalleryCard from './GalleryCard';
import { motion, AnimatePresence } from 'framer-motion';

interface Gallery {
    id: string;
    title: string;
    thumbnail_url: string | null;
    image_count: number;
    type: string;
    event?: { title: string; date: string | null } | null;
    program_kerja?: { title: string } | null;
    created_at: string;
}

interface GalleryGridProps {
    initialGalleries: Gallery[];
}

export default function GalleryGrid({ initialGalleries }: GalleryGridProps) {
    const [filter, setFilter] = useState<'all' | 'event' | 'proker'>('all');

    const filteredGalleries = initialGalleries.filter((gallery) => {
        if (filter === 'all') return true;
        return gallery.type === filter;
    });

    return (
        <div className="space-y-8">
            {/* Filter Tabs - Modern Pill Design */}
            <div className="flex justify-center">
                <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                    {(['all', 'proker', 'event'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`
                px-6 py-2 rounded-full text-sm font-medium transition-all duration-300
                ${filter === type
                                    ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}
              `}
                        >
                            {type === 'all' ? 'Semua' : type === 'proker' ? 'Program Kerja' : 'Event'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredGalleries.map((gallery) => (
                        <motion.div
                            key={gallery.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <GalleryCard gallery={gallery} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredGalleries.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-gray-500 dark:text-gray-400">Belum ada galeri untuk kategori ini.</p>
                </div>
            )}
        </div>
    );
}
