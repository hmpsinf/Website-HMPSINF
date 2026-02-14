"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

interface ContentViewItem {
    title: string;
    view_count: number;
    type: string;
}

interface ContentViewsChartProps {
    data: ContentViewItem[];
}

export default function ContentViewsChart({ data }: ContentViewsChartProps) {
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

    const truncate = (str: string, max: number) =>
        str.length > max ? str.substring(0, max) + "…" : str;

    const sortedData = [...data].sort(
        (a, b) => Number(b.view_count) - Number(a.view_count)
    );

    const categories = sortedData.map((item) => truncate(String(item.title), 20));
    const viewCounts = sortedData.map((item) => Number(item.view_count));
    const colors = sortedData.map((item) => {
        switch (item.type) {
            case "berita":
                return "#465fff";
            case "event":
                return "#7a5af8";
            case "pengumuman":
                return "#f79009";
            default:
                return "#667085";
        }
    });

    const options: ApexOptions = {
        colors: colors,
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "bar",
            height: 260,
            toolbar: { show: false },
        },
        theme: {
            mode: isDark ? "dark" : "light",
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: "60%",
                borderRadius: 4,
                borderRadiusApplication: "end",
                distributed: true,
            },
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        xaxis: {
            categories,
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: "12px",
                    colors: [isDark ? "#98a2b3" : "#667085"],
                },
            },
        },
        grid: {
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: false } },
        },
        tooltip: {
            theme: isDark ? "dark" : "light",
            y: {
                formatter: (val: number) => `${val} views`,
            },
        },
    };

    const series = [
        {
            name: "Views",
            data: viewCounts,
        },
    ];

    return (
        <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Konten Populer
                    </h3>
                    <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                        Konten dengan jumlah views tertinggi
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-500"></span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Berita
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-theme-purple-500"></span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Event
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-warning-500"></span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Pengumuman
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div className="min-w-[500px] xl:min-w-full">
                    <ReactApexChart
                        options={options}
                        series={series}
                        type="bar"
                        height={260}
                    />
                </div>
            </div>
        </div>
    );
}
