"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';

/**
 * ScrollRow — horizontal scroll on mobile, flex-wrap center on desktop.
 * Shows dot indicators below the scroll area on mobile.
 */
export default function ScrollRow({ children }: { children: React.ReactNode }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [totalDots, setTotalDots] = useState(0);
    const [activeDot, setActiveDot] = useState(0);

    // Count children for dots
    const childCount = React.Children.count(children);

    const updateDots = useCallback(() => {
        const el = scrollRef.current;
        if (!el || childCount <= 1) return;

        const scrollWidth = el.scrollWidth;
        const clientWidth = el.clientWidth;

        // If nothing to scroll, no dots
        if (scrollWidth <= clientWidth + 4) {
            setTotalDots(0);
            return;
        }

        // Calculate based on visible items
        const items = Array.from(el.children) as HTMLElement[];
        if (items.length === 0) return;

        const itemWidth = items[0].offsetWidth + 16; // gap-4 = 16px
        const visibleItems = Math.max(1, Math.floor(clientWidth / itemWidth));
        const dots = Math.ceil(items.length / visibleItems);
        setTotalDots(dots);

        // Determine active dot from scroll position
        const scrollRatio = el.scrollLeft / (scrollWidth - clientWidth);
        const active = Math.round(scrollRatio * (dots - 1));
        setActiveDot(Math.min(active, dots - 1));
    }, [childCount]);

    useEffect(() => {
        updateDots();
        const el = scrollRef.current;
        if (!el) return;

        const handleScroll = () => updateDots();
        el.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', updateDots);

        return () => {
            el.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', updateDots);
        };
    }, [updateDots]);

    const scrollToDot = (dotIndex: number) => {
        const el = scrollRef.current;
        if (!el || totalDots <= 1) return;
        const maxScroll = el.scrollWidth - el.clientWidth;
        const targetScroll = (dotIndex / (totalDots - 1)) * maxScroll;
        el.scrollTo({ left: targetScroll, behavior: 'smooth' });
    };

    return (
        <div>
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory md:overflow-x-visible md:flex-wrap md:justify-center"
            >
                {React.Children.map(children, (child) => (
                    <div className="snap-center shrink-0">{child}</div>
                ))}
            </div>

            {/* Dot indicators — mobile only */}
            {totalDots > 1 && (
                <div className="flex justify-center gap-1.5 pt-3 md:hidden">
                    {Array.from({ length: totalDots }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollToDot(i)}
                            aria-label={`Scroll ke bagian ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeDot
                                    ? 'w-4 bg-brand-500'
                                    : 'w-1.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
