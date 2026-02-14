"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

interface ProkerStatusItem {
    status: string;
    count: number;
}

interface ProkerStatusChartProps {
    data: ProkerStatusItem[];
    totalProker: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    direncanakan: { label: "Direncanakan", color: "#465fff" },
    berjalan: { label: "Berjalan", color: "#f79009" },
    selesai: { label: "Selesai", color: "#12b76a" },
    dibatalkan: { label: "Dibatalkan", color: "#f04438" },
};

export default function ProkerStatusChart({
    data,
    totalProker,
}: ProkerStatusChartProps) {
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

    // Build series from all possible statuses
    const allStatuses = ["direncanakan", "berjalan", "selesai", "dibatalkan"];
    const statusMap = new Map(
        data.map((d) => [String(d.status), Number(d.count)])
    );

    const labels: string[] = [];
    const series: number[] = [];
    const colors: string[] = [];

    allStatuses.forEach((status) => {
        const count = statusMap.get(status) || 0;
        const config = STATUS_CONFIG[status];
        labels.push(config.label);
        series.push(count);
        colors.push(config.color);
    });

    // If all zeros, show placeholder
    const hasData = series.some((v) => v > 0);

    const options: ApexOptions = {
        colors,
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "donut",
            height: 300,
        },
        theme: {
            mode: isDark ? "dark" : "light",
        },
        labels,
        plotOptions: {
            pie: {
                donut: {
                    size: "70%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Total Proker",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: isDark ? "#98a2b3" : "#667085",
                            formatter: () => String(totalProker),
                        },
                    },
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            position: "bottom",
            fontFamily: "Outfit",
            fontSize: "13px",
            labels: {
                colors: isDark ? "#d0d5dd" : "#475467",
            },
            markers: {
                size: 5,
            },
        },
        stroke: {
            width: 2,
            colors: [isDark ? "#101828" : "#ffffff"],
        },
        tooltip: {
            theme: isDark ? "dark" : "light",
            y: {
                formatter: (val: number) => `${val} program`,
            },
        },
    };

    return (
        <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 sm:p-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Status Program Kerja
                </h3>
                <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                    Distribusi status program kerja
                </p>
            </div>

            {hasData ? (
                <div className="flex justify-center">
                    <ReactApexChart
                        options={options}
                        series={series}
                        type="donut"
                        height={300}
                    />
                </div>
            ) : (
                <div className="flex items-center justify-center h-[300px]">
                    <p className="text-gray-400 dark:text-gray-500">
                        Belum ada data program kerja
                    </p>
                </div>
            )}


        </div>
    );
}
