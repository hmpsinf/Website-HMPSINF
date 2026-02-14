"use client";
import React from "react";
import {
    PageIcon,
    CalenderIcon,
    BellIcon,
    DocsIcon,
} from "@/icons";

interface DashboardMetricsProps {
    metrics: {
        total_news: number;
        total_news_views: number;
        total_events: number;
        total_event_views: number;
        total_pengumuman: number;
        total_pengumuman_views: number;
        total_documents: number;
        total_downloads: number;
    } | null;
}

export default function DashboardMetrics({ metrics }: DashboardMetricsProps) {
    const cards = [
        {
            label: "Total Berita",
            value: metrics?.total_news ?? 0,
            sub: `${metrics?.total_news_views ?? 0} views`,
            icon: PageIcon,
            color: "bg-brand-50 dark:bg-brand-500/12",
            iconColor: "text-brand-600 dark:text-brand-400",
        },
        {
            label: "Total Event",
            value: metrics?.total_events ?? 0,
            sub: `${metrics?.total_event_views ?? 0} views`,
            icon: CalenderIcon,
            color: "bg-blue-light-50 dark:bg-theme-purple-500/12",
            iconColor: "text-theme-purple-500 dark:text-theme-purple-500",
        },
        {
            label: "Total Pengumuman",
            value: metrics?.total_pengumuman ?? 0,
            sub: `${metrics?.total_pengumuman_views ?? 0} views`,
            icon: BellIcon,
            color: "bg-warning-50 dark:bg-warning-500/12",
            iconColor: "text-warning-600 dark:text-warning-400",
        },
        {
            label: "Total Dokumen",
            value: metrics?.total_documents ?? 0,
            sub: `${metrics?.total_downloads ?? 0} downloads`,
            icon: DocsIcon,
            color: "bg-success-50 dark:bg-success-500/12",
            iconColor: "text-success-600 dark:text-success-400",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="flex h-full min-h-44 flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6"
                >
                    <div
                        className={`flex items-center justify-center w-12 h-12 rounded-xl ${card.color}`}
                    >
                        <card.icon className={`size-6 ${card.iconColor}`} />
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-3">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {card.label}
                            </span>
                            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                {card.value}
                            </h4>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            {card.sub}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
