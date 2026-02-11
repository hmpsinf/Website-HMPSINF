import React from "react";
import Image from "next/image";
import { Instagram, MessageCircle } from "lucide-react";
import { getPhotoPatternStyle, DEFAULT_HIMA_INTI_PATTERN_COLOR } from "@/lib/pattern";

interface SambutanSectionProps {
    settings: {
        sambutan_section_title: string | null;
        sambutan_section_subtitle: string | null;
        sambutan_content: string | null;
        hima_inti_pattern_color: string | null;
    };
    ketua: {
        name: string;
        photo_url: string | null;
        position: string;
        instagram: string | null;
        whatsapp: string | null;
    } | null;
}

export default function SambutanSection({ settings, ketua }: SambutanSectionProps) {

    const patternColor = settings?.hima_inti_pattern_color || DEFAULT_HIMA_INTI_PATTERN_COLOR;

    // Custom pattern style for the decorative background
    // We use opacity-30 to make it subtle
    const patternStyle = getPhotoPatternStyle(patternColor);

    if (!settings) return null;

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[400px_auto_1fr] lg:gap-16 items-center mobile:grid-cols-1">

                    {/* Image Column - Left on Desktop */}
                    <div className="relative order-1 lg:order-1 flex justify-center lg:justify-start">

                        {/* Photo container with pattern background (same approach as HimaIntiCard) */}
                        <div
                            className="group relative aspect-[2/3] w-full max-w-sm overflow-hidden rounded-3xl bg-gray-100 lg:max-w-md"
                            style={patternStyle}
                        >
                            {ketua?.photo_url ? (
                                <>
                                    <Image
                                        src={ketua.photo_url}
                                        alt={ketua.name}
                                        fill
                                        className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                        priority
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 transition-opacity duration-300" />

                                    {/* Content Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                                        <div className="transform translate-y-0 transition-transform duration-300">
                                            <span className="inline-block rounded-full bg-brand-600/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm mb-3 shadow-sm border border-white/20">
                                                {/* Force "Ketua Himpunan" for 'ketua' position */}
                                                {ketua.position.toLowerCase() === 'ketua' ? 'Ketua Himpunan' : ketua.position}
                                            </span>
                                            <h3 className="text-2xl font-bold mb-4 drop-shadow-md leading-tight">{ketua.name}</h3>

                                            {/* Social Icons */}
                                            <div className="flex gap-4">
                                                {ketua.instagram && (
                                                    <a
                                                        href={`https://instagram.com/${ketua.instagram.replace("@", "")}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all duration-300 hover:bg-brand-500 hover:scale-110 hover:shadow-lg hover:shadow-brand-500/30"
                                                        aria-label="Instagram"
                                                    >
                                                        <Instagram className="h-5 w-5" />
                                                    </a>
                                                )}
                                                {ketua.whatsapp && (
                                                    <a
                                                        href={`https://wa.me/${ketua.whatsapp.replace(/[^0-9]/g, "")}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all duration-300 hover:bg-green-500 hover:scale-110 hover:shadow-lg hover:shadow-green-500/30"
                                                        aria-label="WhatsApp"
                                                    >
                                                        <MessageCircle className="h-5 w-5" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex h-full items-center justify-center bg-gray-200" style={patternStyle}>
                                    <span className="text-gray-400 font-medium bg-white/80 px-4 py-2 rounded-lg backdrop-blur-sm">No Photo Available</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Divider Column (Desktop Only) */}
                    {/* This creates the thin vertical line in the middle gap */}
                    <div className="hidden lg:flex flex-col items-center justify-center order-2 h-full py-12">
                        <div className="h-full w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                    </div>

                    {/* Text Column - Right on Desktop */}
                    <div className="flex flex-col justify-center order-2 lg:order-3 space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center lg:text-left">
                                {settings.sambutan_section_title || "Sambutan Ketua Himpunan"}
                            </h2>
                            {settings.sambutan_section_subtitle && (
                                <p className="text-lg text-gray-600 border-l-4 border-brand-500 pl-4">
                                    {settings.sambutan_section_subtitle}
                                </p>
                            )}
                        </div>

                        <div
                            className="prose prose-lg prose-brand max-w-none text-gray-600 text-justify"
                            dangerouslySetInnerHTML={{
                                __html: settings.sambutan_content || "",
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
