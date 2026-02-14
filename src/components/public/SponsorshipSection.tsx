import React from 'react';
import Image from 'next/image';
import { getSponsorshipSettings, getSponsorshipLogos } from '@/lib/queries/public';
import { FadeIn } from "@/components/ui/MotionWrapper";

// Helper function to shuffle array (Fisher-Yates) - optional
function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

export default async function SponsorshipSection() {
    const settings = await getSponsorshipSettings();

    // If section is disabled or no settings found, return null
    if (!settings || !settings.show_section) {
        return null;
    }

    const logos = await getSponsorshipLogos();

    // If no logos, don't render the section
    if (logos.length === 0) {
        return null;
    }

    // Ensure we have enough logos for a smooth marquee
    // If we have fewer than 10 items, we multiply them to ensure they span the screen width
    let displayLogos = [...logos];
    while (displayLogos.length < 10) {
        displayLogos = [...displayLogos, ...logos];
    }

    // Create the marquee content by duplicating the logos set
    // This creates the seamless loop effect
    const marqueeLogos = [...displayLogos, ...displayLogos];

    return (
        <section className="py-12 md:py-20 bg-white dark:bg-gray-950 overflow-hidden border-t border-gray-100 dark:border-gray-900">
            <div className="container mx-auto px-4 md:px-6 mb-8 md:mb-12 text-center">
                <FadeIn direction="up">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
                        {settings.title}
                    </h2>
                </FadeIn>
                {settings.subtitle && (
                    <FadeIn direction="up" delay={0.1}>
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            {settings.subtitle}
                        </p>
                    </FadeIn>
                )}
            </div>

            {/* Marquee Container */}
            <div className="relative w-full max-w-[100vw] overflow-hidden group">
                {/* Gradient Masks */}
                <div className="absolute top-0 left-0 h-full w-12 md:w-32 bg-linear-to-r from-white via-white/80 to-transparent dark:from-gray-950 dark:via-gray-950/80 z-10 pointer-events-none" />
                <div className="absolute top-0 right-0 h-full w-12 md:w-32 bg-linear-to-l from-white via-white/80 to-transparent dark:from-gray-950 dark:via-gray-950/80 z-10 pointer-events-none" />

                {/* Inner Track */}
                <div className="flex w-max animate-scroll hover:[animation-play-state:paused] py-10">
                    {marqueeLogos.map((logo, index) => (
                        <div
                            key={`${logo.id}-${index}`}
                            className="group/item flex flex-col items-center justify-center mx-4 md:mx-8 min-w-[100px] md:min-w-[140px] h-20 md:h-24 relative outline-none"
                            tabIndex={0}
                            role="button"
                            aria-label={`View sponsor: ${logo.caption || 'Partner'}`}
                        >
                            <div className="relative h-12 w-24 md:h-16 md:w-32 transition-all duration-300 transform group-hover/item:scale-110 group-focus/item:scale-110">
                                <Image
                                    src={logo.image_url}
                                    alt={logo.caption || "Sponsor Logo"}
                                    fill
                                    className="object-contain grayscale opacity-60 group-hover/item:grayscale-0 group-hover/item:opacity-100 group-focus/item:grayscale-0 group-focus/item:opacity-100 transition-all duration-300"
                                    sizes="(max-width: 768px) 100px, 140px"
                                />
                            </div>

                            {/* Caption Tooltip - Visible on Hover */}
                            {logo.caption && (
                                <div className="absolute -bottom-2 translate-y-full left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded-full opacity-0 group-hover/item:opacity-100 group-focus/item:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-lg z-20">
                                    {logo.caption}
                                    {/* Arrow */}
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-white rotate-45" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
