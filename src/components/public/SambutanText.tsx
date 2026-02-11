"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SambutanTextProps {
    content: string | null;
}

export default function SambutanText({ content }: SambutanTextProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!content) return null;

    return (
        <div className="flex flex-col">
            <div
                className={`prose prose-lg prose-brand max-w-none text-gray-600 text-justify relative transition-all duration-500 ease-in-out ${!isExpanded ? "max-h-[280px] overflow-hidden mask-linear-gradient" : ""
                    } md:max-h-none md:overflow-visible`}
            >
                <div dangerouslySetInnerHTML={{ __html: content }} />

                {/* Gradient fade for mobile when collapsed */}
                {!isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent md:hidden" />
                )}
            </div>

            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 md:hidden"
            >
                {isExpanded ? (
                    <>
                        Tutup Sambutan
                        <ChevronUp className="h-4 w-4" />
                    </>
                ) : (
                    <>
                        Baca Selengkapnya
                        <ChevronDown className="h-4 w-4" />
                    </>
                )}
            </button>
        </div>
    );
}
