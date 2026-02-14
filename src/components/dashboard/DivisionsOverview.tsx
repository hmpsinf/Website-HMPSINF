"use client";

interface DivisionStat {
    division_name: string;
    color: string;
    member_count: number;
}

interface DivisionsOverviewProps {
    data: DivisionStat[];
    totalMembers: number;
}

export default function DivisionsOverview({
    data,
    totalMembers,
}: DivisionsOverviewProps) {
    const maxMembers = Math.max(...data.map((d) => Number(d.member_count)), 1);
    const colorPalette = [
        "#465fff",
        "#7a5af8",
        "#12b76a",
        "#f79009",
        "#0ba5ec",
        "#ee46bc",
        "#f04438",
        "#3641f5",
    ];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 sm:p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Overview Divisi
                </h3>
                <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                    Distribusi anggota per divisi
                </p>
            </div>

            {/* Summary Card */}
            <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-500/30 dark:bg-brand-500/15">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Total Anggota</p>
                        <p className="text-2xl font-bold text-brand-700 dark:text-brand-300">{totalMembers}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Total Divisi</p>
                        <p className="text-2xl font-bold text-brand-700 dark:text-brand-300">{data.length}</p>
                    </div>
                </div>
            </div>

            {/* Division List */}
            <div className="space-y-4">
                {data.map((division, index) => {
                    const chartColor = colorPalette[index % colorPalette.length];

                    const barWidth =
                        maxMembers > 0
                            ? Math.round(
                                (Number(division.member_count) / maxMembers) * 100
                            )
                            : 0;

                    return (
                        <div key={division.division_name} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <span
                                        className="inline-block h-3 w-3 rounded-full"
                                        style={{
                                            backgroundColor: chartColor,
                                        }}
                                    ></span>
                                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                                        {String(division.division_name)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                                        {Number(division.member_count)}
                                    </span>

                                </div>
                            </div>
                            <div className="relative h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                                <div
                                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${barWidth}%`,
                                        backgroundColor: chartColor,
                                    }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
