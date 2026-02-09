import React from "react";

export default function HimaIntiSkeleton() {
    return (
        <div className="animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            {/* Photo skeleton dengan rasio 2:3 (lebih tinggi) */}
            <div className="aspect-[2/3] w-full rounded-t-2xl bg-gray-200 dark:bg-gray-700" />

            {/* Content skeleton */}
            <div className="p-4 lg:p-5">
                {/* Position badge skeleton */}
                <div className="mb-3">
                    <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
                </div>

                {/* Name skeleton */}
                <div className="h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />

                {/* Social media skeleton */}
                <div className="mt-3 flex items-center gap-3">
                    <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
            </div>
        </div>
    );
}
