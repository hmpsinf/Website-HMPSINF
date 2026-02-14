"use client";
import React, { useEffect, useState } from "react";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import ContentViewsChart from "@/components/dashboard/ContentViewsChart";
import ProkerStatusChart from "@/components/dashboard/ProkerStatusChart";
import ContentTrendChart from "@/components/dashboard/ContentTrendChart";
import DivisionsOverview from "@/components/dashboard/DivisionsOverview";
import RecentActivities from "@/components/dashboard/RecentActivities";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";


interface DashboardData {
    metrics: {
        total_news: number;
        total_news_views: number;
        total_events: number;
        total_event_views: number;
        total_pengumuman: number;
        total_pengumuman_views: number;
        total_documents: number;
        total_downloads: number;
        total_proker: number;
        pending_comments: number;
        total_members: number;
        [key: string]: number;
    };
    contentViews: Array<{ title: string; view_count: number; type: string }>;
    prokerStatus: Array<{ status: string; count: number }>;
    contentTrend: Array<{
        period: string;
        news_count: number;
        event_count: number;
        pengumuman_count: number;
    }>;
    divisionStats: Array<{
        division_name: string;
        color: string;
        member_count: number;
    }>;
    recentActivities: Array<{
        id: string;
        title: string;
        slug: string;
        type: string;
        view_count: number;
        status: string;
        created_at: string;
    }>;
}

export default function DashboardClient() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [trendGroup, setTrendGroup] = useState<"day" | "week" | "month">("day");

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const res = await fetch(`/api/dashboard?trendGroup=${trendGroup}`);
                if (!res.ok) throw new Error("Failed to fetch dashboard data");
                const json = await res.json();
                setData(json);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, [trendGroup]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
                    <p className="text-sm text-red-600 dark:text-red-400">
                        Gagal memuat data: {error}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 xl:col-span-7">
                <DashboardMetrics metrics={data?.metrics ?? null} />
            </div>

            <div className="col-span-12 xl:col-span-5">
                <ProkerStatusChart
                    data={data?.prokerStatus || []}
                    totalProker={Number(data?.metrics?.total_proker ?? 0)}
                />
            </div>

            <div className="col-span-12 xl:col-span-5">
                <ContentViewsChart data={data?.contentViews || []} />
            </div>

            <div className="col-span-12 xl:col-span-7">
                <ContentTrendChart
                    data={data?.contentTrend || []}
                    groupBy={trendGroup}
                    onGroupByChange={setTrendGroup}
                />
            </div>

            <div className="col-span-12 xl:col-span-5">
                <DivisionsOverview
                    data={data?.divisionStats || []}
                    totalMembers={Number(data?.metrics?.total_members ?? 0)}
                />
            </div>

            <div className="col-span-12 xl:col-span-7">
                <RecentActivities data={data?.recentActivities || []} />
            </div>
        </div>
    );
}
