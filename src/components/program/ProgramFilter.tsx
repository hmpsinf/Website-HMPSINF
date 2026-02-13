
"use client";

import { cn } from "@/lib/utils";

interface ProgramFilterProps {
    divisions: { id: string; name: string }[];
    activeFilter: string;
    onFilterChange: (id: string) => void;
}

export default function ProgramFilter({ divisions, activeFilter, onFilterChange }: ProgramFilterProps) {
    const filters = [
        { id: "all", name: "Semua" },
        { id: "hima", name: "HIMA Inti" },
        ...divisions.map((d) => ({ id: d.id, name: d.name })),
    ];

    return (
        <div className="w-full overflow-x-auto scrollbar-hide py-1">
            <div className="flex items-center gap-2 min-w-max">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                            activeFilter === filter.id
                                ? "bg-brand-600 text-white border-brand-600"
                                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                    >
                        {filter.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
