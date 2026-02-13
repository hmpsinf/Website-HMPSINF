"use client";

import React, { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface Division {
    id: string;
    name: string;
    description: string | null;
    color: string;
    member_count: number;
    dosen_pendamping_name: string | null;
}

interface DivisionsCarouselProps {
    divisions: Division[];
}

export default function DivisionsCarousel({ divisions }: DivisionsCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
        }
    };

    return (
        <div className="relative group/carousel">
            {/* Left Button */}
            <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 sm:-ml-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-600 ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:text-brand-600 active:scale-95 disabled:opacity-50 md:opacity-0 md:group-hover/carousel:opacity-100 duration-300"
                aria-label="Scroll Left"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Right Button */}
            <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 sm:-mr-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-600 ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:text-brand-600 active:scale-95 disabled:opacity-50 md:opacity-0 md:group-hover/carousel:opacity-100 duration-300"
                aria-label="Scroll Right"
            >
                <ChevronRight className="h-6 w-6" />
            </button>

            {/* Horizontal Scroll Container */}
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto py-8 -mx-4 px-4 sm:mx-0 sm:px-2 snap-x snap-mandatory gap-6 no-scrollbar"
                style={{ scrollPaddingLeft: '1rem', scrollPaddingRight: '1rem' }}
            >
                {divisions.map((division) => (
                    <div
                        key={division.id}
                        className="group relative flex-none w-[320px] sm:w-[380px] flex flex-col justify-between rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:-translate-y-1 hover:ring-gray-300 snap-center"
                    >
                        <div>
                            <h3 className="mb-3 text-2xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                                {division.name}
                            </h3>

                            <p className="text-gray-500 line-clamp-3 mb-8 text-base leading-relaxed">
                                {division.description || "Tidak ada deskripsi tersedia untuk divisi ini."}
                            </p>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                <div className="h-1.5 w-1.5 rounded-full bg-gray-300 group-hover:bg-brand-500 transition-colors" />
                                <span className="truncate max-w-[150px]" title={division.dosen_pendamping_name || "Dosen Pendamping"}>
                                    {division.dosen_pendamping_name || "Dosen Pendamping"}
                                </span>
                            </div>
                            <button className="group/btn flex items-center gap-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-brand-600">
                                Detail
                                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Padding at the end for scroll */}
                <div className="w-4 sm:w-0 flex-none" />
            </div>
        </div>
    );
}
