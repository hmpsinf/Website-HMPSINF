import React from "react";

export default function DashboardSkeleton() {
    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6 animate-pulse">
            {/* Metrics Cards */}
            <div className="col-span-12 xl:col-span-7">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="flex h-44 flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6"
                        >
                            <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-white/10"></div>
                            <div className="mt-5 flex items-end justify-between gap-3">
                                <div className="w-full">
                                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-white/10 mb-2"></div>
                                    <div className="h-8 w-16 rounded bg-gray-200 dark:bg-white/10"></div>
                                </div>
                                <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-white/10"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Proker Status Chart */}
            <div className="col-span-12 xl:col-span-5">
                <div className="h-full min-h-[400px] rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 sm:p-6">
                    <div className="mb-4">
                        <div className="h-6 w-48 rounded bg-gray-200 dark:bg-white/10 mb-2"></div>
                        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-white/10"></div>
                    </div>
                    <div className="flex justify-center items-center h-[300px]">
                        <div className="h-64 w-64 rounded-full border-[1.5rem] border-gray-200 dark:border-white/10"></div>
                    </div>
                </div>
            </div>

            {/* Content Views Chart */}
            <div className="col-span-12 xl:col-span-5">
                <div className="h-full min-h-[400px] rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 sm:p-6">
                    <div className="mb-6">
                        <div className="h-6 w-48 rounded bg-gray-200 dark:bg-white/10 mb-2"></div>
                        <div className="h-4 w-64 rounded bg-gray-200 dark:bg-white/10"></div>
                    </div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between gap-4">
                                <div className="w-full">
                                    <div className="flex justify-between mb-1">
                                        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-white/10"></div>
                                        <div className="h-4 w-8 rounded bg-gray-200 dark:bg-white/10"></div>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-white/10"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Trend Chart */}
            <div className="col-span-12 xl:col-span-7">
                <div className="h-full min-h-[400px] rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
                    <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:justify-between">
                        <div>
                            <div className="h-6 w-32 rounded bg-gray-200 dark:bg-white/10 mb-2"></div>
                            <div className="h-4 w-48 rounded bg-gray-200 dark:bg-white/10"></div>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-8 w-16 rounded bg-gray-200 dark:bg-white/10"></div>
                            <div className="h-8 w-16 rounded bg-gray-200 dark:bg-white/10"></div>
                            <div className="h-8 w-16 rounded bg-gray-200 dark:bg-white/10"></div>
                        </div>
                    </div>
                    <div className="h-[310px] w-full bg-gray-200 dark:bg-white/10 rounded-lg opacity-20"></div>
                </div>
            </div>

            {/* Divisions Overview */}
            <div className="col-span-12 xl:col-span-5">
                <div className="min-h-[400px] rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 sm:p-6">
                    <div className="mb-6">
                        <div className="h-6 w-32 rounded bg-gray-200 dark:bg-white/10 mb-2"></div>
                        <div className="h-4 w-48 rounded bg-gray-200 dark:bg-white/10"></div>
                    </div>
                    <div className="mb-6 h-20 w-full rounded-xl bg-gray-200 dark:bg-white/10"></div>
                    <div className="space-y-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between">
                                    <div className="flex gap-2 items-center">
                                        <div className="h-3 w-3 rounded-full bg-gray-200 dark:bg-white/10"></div>
                                        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-white/10"></div>
                                    </div>
                                    <div className="h-4 w-8 rounded bg-gray-200 dark:bg-white/10"></div>
                                </div>
                                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-white/10"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="col-span-12 xl:col-span-7">
                <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
                    <div className="mb-6">
                        <div className="h-6 w-48 rounded bg-gray-200 dark:bg-white/10 mb-2"></div>
                        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-white/10"></div>
                    </div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-4 p-4 border rounded-xl border-gray-100 dark:border-gray-800">
                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-white/10 shrink-0"></div>
                                <div className="w-full">
                                    <div className="flex justify-between mb-2">
                                        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-white/10"></div>
                                        <div className="h-3 w-20 rounded bg-gray-200 dark:bg-white/10"></div>
                                    </div>
                                    <div className="h-3 w-full max-w-[80%] rounded bg-gray-200 dark:bg-white/10"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
