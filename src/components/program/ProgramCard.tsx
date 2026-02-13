
"use client";

import { Calendar, Download, AlertCircle, CheckCircle2, Clock, MapPin } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import Link from "next/link";

interface ProgramCardProps {
    program: {
        id: string;
        title: string;
        description: string | null;
        status: string;
        priority: string;
        start_date: string | null;
        end_date: string | null;
        owner_type: string;
        division_name: string | null;
        division_color: string | null;
        document_url: string | null;
        document_name: string | null;
        location: string | null;
    };
}

export default function ProgramCard({ program }: ProgramCardProps) {
    // Status Colors & Icons
    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case "selesai":
                return { color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400", icon: CheckCircle2, label: "Selesai" };
            case "berjalan":
                return { color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400", icon: Clock, label: "Sedang Berjalan" };
            case "direncanakan":
                return { color: "text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400", icon: Calendar, label: "Direncanakan" };
            case "tunda":
                return { color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400", icon: AlertCircle, label: "Ditunda" };
            default:
                return { color: "text-gray-600 bg-gray-50", icon: Calendar, label: status };
        }
    };

    // Priority Colors
    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case "tinggi":
                return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400";
            case "sedang":
                return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400";
            case "rendah":
                return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    const statusConfig = getStatusConfig(program.status);
    const StatusIcon = statusConfig.icon;
    const isHima = program.owner_type === "hima";

    return (
        <div className="group relative flex flex-col h-full bg-white dark:bg-gray-950/50 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-brand-300 dark:hover:border-brand-700 transition-colors duration-300">

            {/* Top Decoration Line */}
            <div
                className={cn("h-1 w-full", isHima ? "bg-brand-600" : "bg-gray-300")}
                style={program.division_color ? { backgroundColor: program.division_color } : {}}
            />

            <div className="p-6 flex-1 flex flex-col">
                {/* Header: Organization/Division & Status */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex flex-col gap-3">
                        <span
                            className={cn(
                                "text-xs font-bold uppercase tracking-wider",
                                isHima ? "text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400"
                            )}
                            style={program.division_color ? { color: program.division_color } : {}}
                        >
                            {program.division_name || "HIMA Inti"}
                        </span>
                        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium w-fit", statusConfig.color)}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                        </div>
                    </div>

                    {/* Priority Badge */}
                    <span className={cn("px-2 py-1 rounded-md text-[10px] uppercase font-bold border tracking-wide", getPriorityColor(program.priority))}>
                        {program.priority}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                    {program.title}
                </h3>

                {/* Date */}
                {program.start_date && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(program.start_date, program.end_date)}</span>
                    </div>
                )}

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-6 flex-1">
                    {program.description}
                </p>

                {/* Footer: Action */}
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                    <span className="line-clamp-1">
                        {program.location || "Lokasi belum ditentukan"}
                    </span>
                </div>
            </div>
        </div>
    );
}
