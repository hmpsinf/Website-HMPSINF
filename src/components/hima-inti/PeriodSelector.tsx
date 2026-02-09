"use client";

import React from "react";
import { ChevronDown, Calendar, Check } from "lucide-react";

interface Period {
    id: string;
    name: string;
    is_active: number;
}

interface PeriodSelectorProps {
    periods: Period[];
    selectedPeriodId: string | null;
    onSelect: (periodId: string) => void;
    isLoading?: boolean;
}

export default function PeriodSelector({
    periods,
    selectedPeriodId,
    onSelect,
    isLoading = false,
}: PeriodSelectorProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (isLoading) {
        return (
            <div className="h-11 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
                <Calendar className="h-4 w-4 text-brand-500" />
                <span className="min-w-20">
                    {selectedPeriod ? selectedPeriod.name : "Pilih Periode"}
                </span>
                <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* Dropdown menu */}
            {isOpen && periods.length > 0 && (
                <div className="absolute left-0 top-full z-20 mt-2 min-w-[200px] rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="max-h-60 overflow-y-auto p-1">
                        {periods.map((period) => (
                            <button
                                key={period.id}
                                type="button"
                                onClick={() => {
                                    onSelect(period.id);
                                    setIsOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${period.id === selectedPeriodId
                                        ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/[0.03]"
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    {period.name}
                                    {period.is_active === 1 && (
                                        <span className="rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-700 dark:bg-success-500/10 dark:text-success-400">
                                            Aktif
                                        </span>
                                    )}
                                </span>
                                {period.id === selectedPeriodId && (
                                    <Check className="h-4 w-4" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {isOpen && periods.length === 0 && (
                <div className="absolute left-0 top-full z-20 mt-2 min-w-[200px] rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Belum ada periode
                    </p>
                </div>
            )}
        </div>
    );
}
