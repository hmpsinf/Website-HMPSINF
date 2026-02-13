'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';

interface NewsFilterProps {
    categories: {
        id: string;
        name: string;
        slug: string;
    }[];
}

export default function NewsFilter({ categories }: NewsFilterProps) {
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get('category');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to active category on mount
    useEffect(() => {
        if (activeCategory && scrollRef.current) {
            const activeLink = scrollRef.current.querySelector<HTMLElement>(`[data-active="true"]`);
            if (activeLink) {
                const scrollLeft = activeLink.offsetLeft - scrollRef.current.offsetLeft - 20; // 20px buffer
                scrollRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
        }
    }, [activeCategory]);

    return (
        <div className="relative mb-12">
            <div
                ref={scrollRef}
                className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <Link
                    href="/berita"
                    data-active={!activeCategory}
                    className={cn(
                        "whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border",
                        !activeCategory
                            ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-800"
                    )}
                >
                    Semua Berita
                </Link>

                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/berita?category=${category.slug}`}
                        data-active={activeCategory === category.slug}
                        className={cn(
                            "whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border",
                            activeCategory === category.slug
                                ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-800"
                        )}
                    >
                        {category.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}
