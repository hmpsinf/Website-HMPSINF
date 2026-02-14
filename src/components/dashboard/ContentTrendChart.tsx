"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ContentTrendItem {
    period: string;
    news_count: number;
    event_count: number;
    pengumuman_count: number;
}

interface ContentTrendChartProps {
    data: ContentTrendItem[];
    groupBy: "day" | "week" | "month";
    onGroupByChange: (group: "day" | "week" | "month") => void;
}

export default function ContentTrendChart({
    data,
    groupBy,
    onGroupByChange,
}: ContentTrendChartProps) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const updateMode = () => {
            setIsDark(document.documentElement.classList.contains("dark"));
        };

        updateMode();
        const observer = new MutationObserver(updateMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    const MONTH_NAMES: Record<string, string> = {
        "01": "Jan",
        "02": "Feb",
        "03": "Mar",
        "04": "Apr",
        "05": "Mei",
        "06": "Jun",
        "07": "Jul",
        "08": "Agu",
        "09": "Sep",
        "10": "Okt",
        "11": "Nov",
        "12": "Des",
    };

    const sortedData = useMemo(
        () => [...data].sort((a, b) => String(a.period).localeCompare(String(b.period))),
        [data]
    );

    const formatPeriodLabel = (period: string) => {
        if (groupBy === "day") {
            const [year, month, day] = period.split("-");
            const monthLabel = MONTH_NAMES[month] || month;
            return `${day} ${monthLabel}`;
        }

        if (groupBy === "week") {
            const [year, weekPart] = period.split("-W");
            return `M${weekPart} '${year?.slice(2)}`;
        }

        const [year, month] = period.split("-");
        const monthLabel = MONTH_NAMES[month] || month;
        return `${monthLabel} '${year?.slice(2)}`;
    };

    const categories = sortedData.map((item) => formatPeriodLabel(String(item.period)));
    const chartType = groupBy === "day" ? "line" : "area";
    const hasData =
        sortedData.length > 0 &&
        sortedData.some(
            (item) =>
                Number(item.news_count) > 0 ||
                Number(item.event_count) > 0 ||
                Number(item.pengumuman_count) > 0
        );

    const options: ApexOptions = {
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "left",
            fontFamily: "Outfit",
            labels: {
                colors: isDark ? "#d0d5dd" : "#475467",
            },
        },
        colors: ["#465fff", "#7a5af8", "#f79009"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            height: 310,
            type: chartType,
            toolbar: { show: false },
        },
        theme: {
            mode: isDark ? "dark" : "light",
        },
        stroke: {
            curve: "smooth",
            width: [2, 2, 2],
        },
        fill: {
            type: "solid",
            opacity: chartType === "area" ? 0.18 : 1,
        },
        markers: {
            size: 4,
            strokeColors: isDark ? "#101828" : "#ffffff",
            strokeWidth: 2,
            hover: { size: 6 },
        },
        grid: {
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
        },
        dataLabels: { enabled: false },
        tooltip: {
            enabled: true,
            theme: isDark ? "dark" : "light",
        },
        xaxis: {
            type: "category",
            categories,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: {
                    colors: isDark ? "#98a2b3" : "#667085",
                    fontSize: "12px",
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: "12px",
                    colors: [isDark ? "#98a2b3" : "#667085"],
                },
                formatter: (val: number) => Math.round(val).toString(),
            },
            title: { text: "" },
        },
    };

    const series = [
        {
            name: "Berita",
            data: sortedData.map((item) => Number(item.news_count)),
        },
        {
            name: "Event",
            data: sortedData.map((item) => Number(item.event_count)),
        },
        {
            name: "Pengumuman",
            data: sortedData.map((item) => Number(item.pengumuman_count)),
        },
    ];

    return (
        <div className="h-full rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Tren Konten
                    </h3>
                    <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                        Jumlah konten yang dibuat per {groupBy === "day" ? "hari" : groupBy === "week" ? "minggu" : "bulan"}
                    </p>
                </div>
                <div className="inline-flex w-fit rounded-lg border border-gray-200 p-1 dark:border-gray-700">
                    {[
                        { key: "day", label: "Harian" },
                        { key: "week", label: "Mingguan" },
                        { key: "month", label: "Bulanan" },
                    ].map((option) => {
                        const active = groupBy === option.key;
                        return (
                            <button
                                key={option.key}
                                type="button"
                                onClick={() => onGroupByChange(option.key as "day" | "week" | "month")}
                                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${active
                                        ? "bg-brand-500 text-white"
                                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                    }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {hasData ? (
                <div className="max-w-full overflow-x-auto custom-scrollbar">
                    <div className="min-w-[560px] xl:min-w-full">
                        <Chart options={options} series={series} type={chartType} height={310} />
                    </div>
                </div>
            ) : (
                <div className="flex h-[310px] items-center justify-center">
                    <p className="text-gray-400 dark:text-gray-500">Belum ada data tren konten</p>
                </div>
            )}
        </div>
    );
}
