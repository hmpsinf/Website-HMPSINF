'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Building2, Check, ChevronDown } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    color: string;
}

interface DocumentFiltersProps {
    categories: Category[];
}

interface FilterOption {
    value: string;
    label: string;
}

interface CustomFilterDropdownProps {
    icon: React.ReactNode;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
    title: string;
    isActive: boolean;
}

function CustomFilterDropdown({ icon, options, value, onChange, title, isActive }: CustomFilterDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [open]);

    // Close on escape key
    useEffect(() => {
        function handleEsc(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false);
        }
        if (open) {
            document.addEventListener('keydown', handleEsc);
            return () => document.removeEventListener('keydown', handleEsc);
        }
    }, [open]);

    const selectedLabel = options.find((o) => o.value === value)?.label || options[0]?.label;

    return (
        <div ref={ref} className="relative shrink-0">
            {/* Toggle Button */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                title={title}
                className={`flex items-center gap-2 rounded-xl border bg-white dark:bg-gray-900 transition-all cursor-pointer
                    w-10 h-10 justify-center sm:w-auto sm:h-auto sm:px-3.5 sm:py-2.5
                    ${isActive
                        ? 'border-brand-500 ring-1 ring-brand-500'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }
                    ${open ? 'ring-2 ring-brand-500/30' : ''}
                `}
            >
                <span className="text-gray-500 dark:text-gray-400 shrink-0">{icon}</span>
                <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                    {selectedLabel}
                </span>
                <ChevronDown className={`hidden sm:block h-3.5 w-3.5 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* Active dot indicator on mobile */}
            {isActive && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-white dark:ring-gray-950 sm:hidden z-10" />
            )}

            {/* Dropdown Menu — opens to the LEFT (right-0) so it never overflows the right edge */}
            {open && (
                <>
                    {/* Invisible backdrop for mobile */}
                    <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setOpen(false)} />

                    <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[180px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg shadow-black/10 dark:shadow-black/30 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left transition-colors
                                    ${value === option.value
                                        ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 font-medium'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                                    }
                                `}
                            >
                                <Check className={`h-4 w-4 shrink-0 ${value === option.value ? 'opacity-100' : 'opacity-0'}`} />
                                <span className="truncate">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
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

        const currentCategory = searchParams.get('category') || '';
        const currentOwner = searchParams.get('owner') || '';

        if (category !== currentCategory || owner !== currentOwner) {
            params.set('page', '1');
            router.push(`?${params.toString()}`, { scroll: false });
        }
    }, [category, owner, router, searchParams]);

    const categoryOptions: FilterOption[] = [
        { value: '', label: 'Semua Kategori' },
        ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
    ];

    const ownerOptions: FilterOption[] = [
        { value: '', label: 'Semua Pemilik' },
        { value: 'hima', label: 'HIMA Inti' },
        { value: 'division', label: 'Divisi' },
    ];

    return (
        <div className="flex items-center gap-2 shrink-0">
            <CustomFilterDropdown
                icon={<Filter className="h-4 w-4" />}
                options={categoryOptions}
                value={category}
                onChange={setCategory}
                title="Filter Kategori"
                isActive={!!category}
            />
            <CustomFilterDropdown
                icon={<Building2 className="h-4 w-4" />}
                options={ownerOptions}
                value={owner}
                onChange={setOwner}
                title="Filter Pemilik"
                isActive={!!owner}
            />
        </div>
    );
}
