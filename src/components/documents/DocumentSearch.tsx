'use client';

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { useState, useEffect } from 'react';

export default function DocumentSearch() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [term, setTerm] = useState(searchParams.get('search') || '');

    // Debounce the search term
    const debouncedTerm = useDebounce(term, 500);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        // Build new params based on current state + debounced term
        if (debouncedTerm) {
            params.set('search', debouncedTerm);
        } else {
            params.delete('search');
        }

        // Only push if params changed
        // Check if the current URL already matches to avoid redundant pushes
        const currentSearch = searchParams.get('search') || '';
        if (currentSearch !== (debouncedTerm || '')) {
            params.set('page', '1'); // Reset to page 1
            router.push(`?${params.toString()}`, { scroll: false });
        }
    }, [debouncedTerm, router, searchParams]);

    const clearSearch = () => {
        setTerm('');
    };

    return (
        <div className="relative flex-1 min-w-0">
            <div className="relative">
                <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="Cari dokumen..."
                    className="block w-full pl-11 pr-10 py-3 rounded-full border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                {term && (
                    <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
}
