import React from "react";
import { getSiteSettings } from "@/lib/queries/public";
import { FadeIn, ScaleIn } from "@/components/ui/MotionWrapper";

export default async function VideoSection() {
    const settings = await getSiteSettings();

    // Default values if settings are missing
    const title = settings.landing_video_title || "Video Profil Himpunan";
    const subtitle = settings.landing_video_subtitle || "Dokumentasi Kegiatan dan Profil HMPSINF";
    const description = settings.landing_video_description || "Saksikan keseruan dan semangat kebersamaan dalam setiap kegiatan yang kami selenggarakan. Kami berkomitmen untuk menjadi wadah aspirasi dan kreasi mahasiswa Informatika.";
    let videoUrl = settings.landing_video_url || "https://www.youtube.com/embed/dQw4w9WgXcQ";

    // Sanitize URL if it contains an iframe tag (in case user pasted full embed code)
    if (videoUrl.includes("<iframe")) {
        const srcMatch = videoUrl.match(/src=["']([^"']+)["']/);
        if (srcMatch && srcMatch[1]) {
            videoUrl = srcMatch[1];
        }
    }

    // Fallback image if none provided
    const bgImage = settings.landing_video_bg_image || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop";
    const bgAttachment = settings.landing_video_bg_attachment || "fixed";
    const footerText = settings.landing_video_footer_text || "HMPSINF 2024";
    const overlayOpacity = settings.landing_video_overlay_opacity ? parseInt(settings.landing_video_overlay_opacity) / 100 : 0.8;
    const patternOpacity = settings.landing_video_pattern_opacity ? parseInt(settings.landing_video_pattern_opacity) / 100 : 0.1;

    return (
        <section className="relative w-full overflow-hidden py-24 md:py-32">
            {/* Parallax Background */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('${bgImage}')`,
                    backgroundAttachment: bgAttachment,
                }}
            />

            {/* Overlay */}
            <div
                className="absolute inset-0 z-0 bg-black"
                style={{ opacity: overlayOpacity }}
            />

            {/* Decorative Pattern (Matches DivisionsSection) */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    opacity: patternOpacity,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 28' width='56' height='28'%3E%3Cpath fill='%23ffffff' fill-opacity='1' d='M56 26v2h-7.75c2.3-1.27 4.94-2 7.75-2zm-26 2a2 2 0 1 0-4 0h-4.09A25.98 25.98 0 0 0 0 16v-2c.67 0 1.34.02 2 .07V14a2 2 0 0 0-2-2v-2a4 4 0 0 1 3.98 3.6 28.09 28.09 0 0 1 2.8-3.86A8 8 0 0 0 0 6V4a9.99 9.99 0 0 1 8.17 4.23c.94-.95 1.96-1.83 3.03-2.63A13.98 13.98 0 0 0 0 0h7.75c2 1.1 3.73 2.63 5.1 4.45 1.12-.72 2.3-1.37 3.53-1.93A20.1 20.1 0 0 0 14.28 0h2.7c.45.56.88 1.14 1.29 1.74 1.3-.48 2.63-.87 4-1.15-.11-.2-.23-.4-.36-.59H26v.07a28.4 28.4 0 0 1 4 0V0h4.09l-.37.59c1.38.28 2.72.67 4.01 1.15.4-.6.84-1.18 1.3-1.74h2.69a20.1 20.1 0 0 0-2.1 2.52c1.23.56 2.41 1.2 3.54 1.93A16.08 16.08 0 0 1 48.25 0H56c-4.58 0-8.65 2.2-11.2 5.6 1.07.8 2.09 1.68 3.03 2.63A9.99 9.99 0 0 1 56 4v2a8 8 0 0 0-6.77 3.74c1.03 1.2 1.97 2.5 2.79 3.86A4 4 0 0 1 56 10v2a2 2 0 0 0-2 2.07 28.4 28.4 0 0 1 2-.07v2c-9.2 0-17.3 4.78-21.91 12H30zM7.75 28H0v-2c2.81 0 5.46.73 7.75 2zM56 20v2c-5.6 0-10.65 2.3-14.28 6h-2.7c4.04-4.89 10.15-8 16.98-8zm-39.03 8h-2.69C10.65 24.3 5.6 22 0 22v-2c6.83 0 12.94 3.11 16.97 8zm15.01-.4a28.09 28.09 0 0 1 2.8-3.86 8 8 0 0 0-13.55 0c1.03 1.2 1.97 2.5 2.79 3.86a4 4 0 0 1 7.96 0zm14.29-11.86c1.3-.48 2.63-.87 4-1.15a25.99 25.99 0 0 0-44.55 0c1.38.28 2.72.67 4.01 1.15a21.98 21.98 0 0 1 36.54 0zm-5.43 2.71c1.13-.72 2.3-1.37 3.54-1.93a19.98 19.98 0 0 0-32.76 0c1.23.56 2.41 1.2 3.54 1.93a15.98 15.98 0 0 1 25.68 0zm-4.67 3.78c.94-.95 1.96-1.83 3.03-2.63a13.98 13.98 0 0 0-22.4 0c1.07.8 2.09 1.68 3.03 2.63a9.99 9.99 0 0 1 16.34 0z'/%3E%3C/svg%3E")`,
                    maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, black 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, black 100%)',
                }}
            />

            {/* Content Container */}
            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                {/* Transparent Wrapper for Content */}
                <div className="rounded-[2.5rem] bg-white/5 p-8 backdrop-blur-sm sm:p-12 lg:p-16">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20 items-center">

                        {/* Text Column */}
                        <div className="order-2 lg:order-1 space-y-8">
                            <FadeIn direction="up">
                                <div>
                                    <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm">
                                        {subtitle}
                                    </div>
                                    <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                        {title}
                                    </h2>
                                    <p className="mt-6 text-lg leading-8 text-gray-300">
                                        {description}
                                    </p>
                                </div>
                            </FadeIn>

                            {/* Decorative Element */}
                            <FadeIn delay={0.2}>
                                <div className="flex items-center gap-4 pt-4">
                                    <div className="h-1 w-20 bg-brand-500 rounded-full shrink-0"></div>
                                    <span className="text-sm font-medium text-gray-400 tracking-wider uppercase min-w-0 wrap-break-word">{footerText}</span>
                                </div>
                            </FadeIn>
                        </div>

                        {/* Video Column */}
                        <div className="order-1 lg:order-2">
                            {/* Video Frame Effect */}
                            <ScaleIn delay={0.3}>
                                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-900 shadow-2xl ring-1 ring-white/10 group">
                                    {/* Glow Effect behind video */}
                                    <div className="absolute -inset-4 bg-brand-500/30 blur-2xl transition-all duration-500 group-hover:bg-brand-500/40 -z-10 rounded-full opacity-0 group-hover:opacity-100"></div>

                                    <iframe
                                        src={videoUrl}
                                        title={title}
                                        className="absolute inset-0 h-full w-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                </div>
                            </ScaleIn>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
