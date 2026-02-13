
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Building2 } from 'lucide-react';


interface Category {
    id: string;
    name: string;
    color: string;
}

interface DocumentFiltersProps {
    categories: Category[];
}

export default function DocumentFilters({ categories }: DocumentFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [owner, setOwner] = useState(searchParams.get('owner') || '');

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (category) params.set('category', category);
        else params.delete('category');

        if (owner) params.set('owner', owner);
        else params.delete('owner');

        // Check if params actually changed before pushing to avoid loops/redundancy
        // We compare against current searchParams values
        const currentCategory = searchParams.get('category') || '';
        const currentOwner = searchParams.get('owner') || '';

        if (category !== currentCategory || owner !== currentOwner) {
            params.set('page', '1');
            router.push(`?${params.toString()}`, { scroll: false });
        }
    }, [category, owner, router, searchParams]);

    return (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
            {/* Category Filter */}
            <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="appearance-none rounded-xl border border-gray-200 bg-white pl-10 pr-8 py-2.5 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 min-w-[160px] cursor-pointer"
                >
                    <option value="">Semua Kategori</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Owner Filter */}
            <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="appearance-none rounded-xl border border-gray-200 bg-white pl-10 pr-8 py-2.5 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 min-w-[160px] cursor-pointer"
                >
                    <option value="">Semua Pemilik</option>
                    <option value="hima">HIMA Inti</option>
                    <option value="division">Divisi</option>
                </select>
            </div>
        </div>
    );
}
