'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRef, useEffect } from 'react';

// Static status filters since we don't have categories in DB yet
const FILTERS = [
    { id: 'all', name: 'Semua Event', value: '' },
    { id: 'upcoming', name: 'Akan Datang', value: 'upcoming' },
    { id: 'open', name: 'Pendaftaran Buka', value: 'open' },
    { id: 'closed', name: 'Selesai', value: 'closed' },
];

export default function EventFilter() {
    const searchParams = useSearchParams();
    const activeFilter = searchParams.get('filter') || '';
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto scroll to active element
    useEffect(() => {
        if (scrollRef.current) {
            const activeElement = scrollRef.current.querySelector('[data-active="true"]');
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activeFilter]);

    return (
        <div className="relative mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div
                ref={scrollRef}
                className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 scrollbar-hide px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {FILTERS.map((filter) => (
                    <Link
                        key={filter.id}
                        href={filter.value ? `/event?filter=${filter.value}` : '/event'}
                        data-active={activeFilter === filter.value}
                        className={cn(
                            "whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border flex-shrink-0",
                            activeFilter === filter.value
                                ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:bg-gray-900/50 dark:text-gray-400 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-800 backdrop-blur-sm"
                        )}
                    >
                        {filter.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}
