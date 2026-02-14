'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface PopupSettings {
    is_active: boolean;
    image_url: string;
    title: string;
    description: string;
    btn_text: string;
    btn_link: string;
}

export default function MarketingPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState<PopupSettings | null>(null);

    useEffect(() => {
        const checkAndFetch = async () => {
            // Check session storage first
            const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');
            if (hasSeenPopup) return;

            try {
                const res = await fetch('/api/popup');
                if (res.ok) {
                    const data = await res.json();
                    if (data.is_active && data.image_url) {
                        setSettings(data);
                        // Delay slightly for dramatic effect
                        setTimeout(() => setIsOpen(true), 1500);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch popup settings', error);
            }
        };

        checkAndFetch();
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('hasSeenPopup', 'true');
    };

    if (!settings) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop with Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-800 mx-auto"
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/30 transition-colors"
                            aria-label="Close popup"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div>
                            <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-800">
                                <Image
                                    src={settings.image_url}
                                    alt={settings.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 90vw, 420px"
                                    priority
                                />
                            </div>

                            <div className="p-6">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                >
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading leading-tight mb-2">
                                        {settings.title || 'Judul Promo Disini'}
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                                        {settings.description || 'Deskripsi singkat mengenai promo atau informasi yang akan ditampilkan kepada pengunjung website.'}
                                    </p>

                                    <div className="flex items-center justify-end">
                                        {settings.btn_text && settings.btn_link ? (
                                            <Link
                                                href={settings.btn_link}
                                                onClick={handleClose}
                                                className="rounded-full bg-gray-900 px-6 py-2.5 text-xs font-semibold text-white transition-transform hover:scale-105 dark:bg-white dark:text-gray-900"
                                            >
                                                {settings.btn_text}
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                className="rounded-full bg-gray-900 px-6 py-2.5 text-xs font-semibold text-white dark:bg-white dark:text-gray-900"
                                                onClick={handleClose}
                                            >
                                                Action Button
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
