import React from "react";

export default function DivisionSkeleton() {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
            {/* Color accent bar contents skeleton */}
            <div className="h-1.5 w-full rounded-t-2xl bg-gray-200 dark:bg-gray-700" />

            <div className="p-5 lg:p-6">
                {/* Header skeleton */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            {/* Icon/Color circle */}
                            <div className="h-2.5 w-2.5 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                            {/* Title */}
                            <div className="h-5 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                        </div>
                        {/* Description */}
                        <div className="space-y-2 mt-2">
                            <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
                            <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                        </div>
                    </div>

                    {/* Action buttons skeleton */}
                    <div className="flex gap-2 shrink-0">
                        <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-gray-700" />
                        <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-gray-700" />
                    </div>
                </div>

                {/* Footer skeleton */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                    {/* Member count */}
                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />

                    {/* Manage button */}
                    <div className="h-9 w-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
                </div>
            </div>
        </div>
    );
}
