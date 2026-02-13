'use client';

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useState } from 'react';

export default function NewsSearch() {
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const [term, setTerm] = useState(searchParams.get('q')?.toString() || '');

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        // Reset to page 1 when searching
        params.set('page', '1');

        replace(`/berita?${params.toString()}`);
    }, 300);

    const clearSearch = () => {
        setTerm('');
        handleSearch('');
    };

    return (
        <div className="mt-10 relative max-w-md mx-auto block">
            <div className="relative">
                <input
                    type="text"
                    value={term}
                    onChange={(e) => {
                        setTerm(e.target.value);
                        handleSearch(e.target.value);
                    }}
                    placeholder="Cari artikel..."
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
