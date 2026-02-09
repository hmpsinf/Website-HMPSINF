"use client";

import React from "react";
import { Pencil, Trash2, Users } from "lucide-react";

interface Division {
    id: string;
    name: string;
    description: string | null;
    color: string;
    member_count: number;
}

interface DivisionCardProps {
    division: Division;
    onEdit: (division: Division) => void;
    onDelete: (division: Division) => void;
    onManageMembers: (division: Division) => void;
}

export default function DivisionCard({
    division,
    onEdit,
    onDelete,
    onManageMembers,
}: DivisionCardProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            {/* Color accent bar */}
            <div
                className="h-1.5 w-full rounded-t-2xl"
                style={{ backgroundColor: division.color }}
            />

            <div className="p-5 lg:p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <div
                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: division.color }}
                            />
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 truncate">
                                {division.name}
                            </h4>
                        </div>
                        {division.description ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {division.description}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                                Tidak ada deskripsi
                            </p>
                        )}
                    </div>

                    {/* Action buttons - always visible */}
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={() => onEdit(division)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 shadow-theme-xs hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                            title="Edit divisi"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onDelete(division)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-error-300 bg-error-50 text-error-600 shadow-theme-xs hover:bg-error-100 dark:border-error-700 dark:bg-error-500/10 dark:text-error-400 dark:hover:bg-error-500/20"
                            title="Hapus divisi"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Stats and actions footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                    {/* Member count */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>
                            {division.member_count} anggota
                        </span>
                    </div>

                    {/* Manage button */}
                    <button
                        onClick={() => onManageMembers(division)}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                        <Users className="h-4 w-4" />
                        Kelola
                    </button>
                </div>
            </div>
        </div>
    );
}
