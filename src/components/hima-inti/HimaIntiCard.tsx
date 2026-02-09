"use client";

import React from "react";
import Image from "next/image";
import { Pencil, Instagram, MessageCircle, User, Trash2 } from "lucide-react";
import { generatePatternSvg, DEFAULT_HIMA_INTI_PATTERN_COLOR } from "@/lib/pattern";

interface HimaIntiMember {
    id: string;
    period_id: string;
    position: string;
    name: string;
    photo_url: string | null;
    instagram: string | null;
    whatsapp: string | null;
}

interface HimaIntiCardProps {
    member: HimaIntiMember;
    positionLabel: string;
    onEdit?: (member: HimaIntiMember) => void;
    onDelete?: (member: HimaIntiMember) => void;
    patternColor?: string; // Pattern color for photo background
}

// Label warna jabatan
const POSITION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    dosen_pembimbing: {
        bg: "bg-purple-100 dark:bg-purple-500/10",
        text: "text-purple-700 dark:text-purple-400",
        border: "border-purple-200 dark:border-purple-500/30",
    },
    ketua: {
        bg: "bg-brand-100 dark:bg-brand-500/10",
        text: "text-brand-700 dark:text-brand-400",
        border: "border-brand-200 dark:border-brand-500/30",
    },
    wakil_ketua: {
        bg: "bg-blue-100 dark:bg-blue-500/10",
        text: "text-blue-700 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-500/30",
    },
    sekretaris: {
        bg: "bg-amber-100 dark:bg-amber-500/10",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-500/30",
    },
    bendahara: {
        bg: "bg-emerald-100 dark:bg-emerald-500/10",
        text: "text-emerald-700 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-500/30",
    },
};

export default function HimaIntiCard({
    member,
    positionLabel,
    onEdit,
    onDelete,
    patternColor = DEFAULT_HIMA_INTI_PATTERN_COLOR,
}: HimaIntiCardProps) {
    const colors = POSITION_COLORS[member.position] || POSITION_COLORS.ketua;

    // Generate pattern style for photo background (centered and repeating)
    const patternStyle = {
        backgroundImage: `url("${generatePatternSvg(patternColor)}")`,
        backgroundPosition: 'center center',
        backgroundRepeat: 'repeat',
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03]">
            {/* Photo dengan rasio 2:3 (lebih tinggi) + pattern background */}
            <div
                className="relative aspect-[2/3] w-full overflow-hidden bg-white dark:bg-gray-900"
                style={patternStyle}
            >
                {member.photo_url ? (
                    <Image
                        src={member.photo_url}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <User className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                    </div>
                )}

                {/* Edit and Delete button overlay */}
                <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    {onEdit && (
                        <button
                            onClick={() => onEdit(member)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-gray-600 shadow-theme-xs backdrop-blur-sm transition-all hover:bg-white hover:text-brand-500 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                            title="Edit anggota"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(member)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-gray-600 shadow-theme-xs backdrop-blur-sm transition-all hover:bg-white hover:text-red-500 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-red-400"
                            title="Hapus anggota"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 lg:p-5">
                {/* Position badge */}
                <div className="mb-3">
                    <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}
                    >
                        {positionLabel}
                    </span>
                </div>

                {/* Name */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    {member.name}
                </h3>

                {/* Social media links */}
                {(member.instagram || member.whatsapp) && (
                    <div className="mt-3 flex items-center gap-3">
                        {member.instagram && (
                            <a
                                href={`https://instagram.com/${member.instagram.replace("@", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-pink-500 dark:text-gray-400 dark:hover:text-pink-400"
                                title={`Instagram: ${member.instagram}`}
                            >
                                <Instagram className="h-4 w-4" />
                                <span className="text-xs">@{member.instagram.replace("@", "")}</span>
                            </a>
                        )}
                        {member.whatsapp && (
                            <a
                                href={`https://wa.me/${member.whatsapp.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400"
                                title={`WhatsApp: ${member.whatsapp}`}
                            >
                                <MessageCircle className="h-4 w-4" />
                                <span className="text-xs">{member.whatsapp}</span>
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
